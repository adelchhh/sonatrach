import { useEffect, useState } from "react";
import { getIdeas, moderateIdea } from "../../services/ideaService";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  DataPanel,
  StatusPill,
  Button,
  Alert,
  TextArea,
} from "../../components/ui/Studio";

const STATUS_TONE = {
  PENDING: "warn",
  REVIEWED: "success",
  ARCHIVED: "neutral",
};

// status labels resolved via t() at render time

function formatDate(idea) {
  return idea.submitted_at || idea.created_at?.slice(0, 10) || "—";
}

function shortText(text, max = 120) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function IdeaBoxModeration() {
  const t = useT();
  const [ideas, setIdeas] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedIdea = ideas.find((idea) => idea.id === selectedId) || null;
  const statusLabel = (s) => ({
    PENDING: t("sg.statusPendingLabel"),
    REVIEWED: t("sg.statusReviewedLabel"),
    ARCHIVED: t("sg.statusArchivedLabel"),
  }[s] || s);

  useEffect(() => {
    loadIdeas();
  }, []);

  async function loadIdeas() {
    try {
      setLoading(true);
      const response = await getIdeas();
      const data = Array.isArray(response)
        ? response
        : response.data || response.ideas || [];
      setIdeas(data);
      setSelectedId(data[0]?.id ?? null);
      setFeedback(data[0]?.moderator_response || "");
    } catch (err) {
      setError(err.message || t("sg.loadingFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleModerate(status) {
    if (!selectedIdea) return;
    try {
      const updated = await moderateIdea(selectedIdea.id, {
        status,
        moderator_response: feedback || null,
      });
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === selectedIdea.id ? updated : idea))
      );
      setFeedback("");
    } catch (err) {
      setError(err.message || t("sg.moderationImpossible"));
    }
  }

  const pendingCount = ideas.filter((i) => i.status === "PENDING").length;
  const reviewedCount = ideas.filter((i) => i.status === "REVIEWED").length;
  const archivedCount = ideas.filter((i) => i.status === "ARCHIVED").length;

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.communication")}
        title={t("sg.ideaModeration")}
        subtitle={t("sg.subIdeaBox")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("sg.ideaModeration") },
        ]}
      />

      <PageBody>
        {error && (
          <Alert tone="danger" title={t("sg.error")}>
            {error}
          </Alert>
        )}

        <StatBar>
          <StatCell
            label={t("sg.pending")}
            value={pendingCount}
            sub={t("sg.subToReview")}
            accent={pendingCount > 0}
          />
          <StatCell label={t("sg.statusReviewedLabel")} value={reviewedCount} sub={t("sg.subWithFeedback")} />
          <StatCell label={t("sg.archived")} value={archivedCount} sub={t("sg.subOffCircuit")} />
        </StatBar>

        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
          <DataPanel
            title={t("sg.panelIdeasSubmitted")}
            subtitle={t("sg.panelIdeasSubmittedSub")}
            badge={`${ideas.length}`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-[#0A0A0A]">
                  <tr>
                    {[t("sg.colIdea"), t("sg.colAuthor"), t("sg.colSubmitted"), t("sg.colStatus")].map((h, i) => (
                      <th
                        key={i}
                        className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-14 text-center text-[13px] text-[#737373]"
                      >
                        {t("sg.loading")}
                      </td>
                    </tr>
                  ) : ideas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-14 text-center text-[13px] text-[#737373]"
                      >
                        {t("sg.emptyIdeasSubmitted")}
                      </td>
                    </tr>
                  ) : (
                    ideas.map((idea) => (
                      <tr
                        key={idea.id}
                        onClick={() => {
                          setSelectedId(idea.id);
                          setFeedback(idea.moderator_response || "");
                        }}
                        className={`border-b border-[#E5E5E5] last:border-b-0 cursor-pointer transition-colors align-top ${
                          selectedId === idea.id
                            ? "bg-[#FFF7E8]"
                            : "hover:bg-[#FAFAFA]"
                        }`}
                      >
                        <td className="px-6 py-5 max-w-[400px]">
                          <p className="text-[#0A0A0A] text-[14px] font-bold">
                            {idea.title}
                          </p>
                          <p className="text-[11px] text-[#737373] mt-1 line-clamp-2">
                            {shortText(idea.content)}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-[12px] text-[#525252]">
                          {idea.user?.name || idea.author || t("sg.collaborator")}
                        </td>
                        <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                          {formatDate(idea)}
                        </td>
                        <td className="px-6 py-5">
                          <StatusPill
                            tone={STATUS_TONE[idea.status] || "neutral"}
                            label={statusLabel(idea.status)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </DataPanel>

          <DataPanel
            title={t("sg.moderationPanel")}
            subtitle={
              selectedIdea
                ? t("sg.panelModerationActiveSub")
                : t("sg.panelModerationEmptySub")
            }
          >
            <div className="p-6">
              {!selectedIdea ? (
                <p className="text-[13px] text-[#737373] italic">
                  {t("sg.moderationHint")}
                </p>
              ) : (
                <div className="space-y-5">
                  <DetailRow label={t("sg.colTitle")} value={selectedIdea.title} />
                  <DetailRow
                    label={t("sg.colStatus")}
                    value={
                      statusLabel(selectedIdea.status)
                    }
                  />
                  <DetailRow
                    label={t("sg.colSubmitted")}
                    value={formatDate(selectedIdea)}
                  />

                  <div className="border-t border-[#E5E5E5] pt-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#737373] mb-2">
                      {t("sg.ideaContent")}
                    </p>
                    <p className="text-[13px] text-[#0A0A0A] leading-[1.7] whitespace-pre-line">
                      {selectedIdea.content}
                    </p>
                  </div>

                  <TextArea
                    label={t("sg.moderatorFeedback")}
                    value={feedback}
                    onChange={setFeedback}
                    placeholder={t("sg.phFeedback")}
                    rows={5}
                  />

                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => handleModerate("REVIEWED")}
                    >
                      {t("sg.markReviewed")}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleModerate("ARCHIVED")}
                    >
                      {t("sg.archive")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DataPanel>
        </div>
      </PageBody>
    </PageShell>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#737373] mb-1">
        {label}
      </p>
      <p className="text-[13px] font-bold text-[#0A0A0A] break-words">{value}</p>
    </div>
  );
}
