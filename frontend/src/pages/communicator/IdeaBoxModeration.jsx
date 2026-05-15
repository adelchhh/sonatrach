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

const STATUS_LABEL_FR = {
  PENDING: "En attente",
  REVIEWED: "Examinée",
  ARCHIVED: "Archivée",
};

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
      setError(err.message || "Impossible de charger les idées.");
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
      setError(err.message || "Modération impossible.");
    }
  }

  const pendingCount = ideas.filter((i) => i.status === "PENDING").length;
  const reviewedCount = ideas.filter((i) => i.status === "REVIEWED").length;
  const archivedCount = ideas.filter((i) => i.status === "ARCHIVED").length;

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.communication")}
        title="Modération boîte à idées"
        subtitle="Examinez les suggestions des collaborateurs, ajoutez un retour et archivez les idées traitées."
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Modération idées" },
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
            label="En attente"
            value={pendingCount}
            sub="À examiner"
            accent={pendingCount > 0}
          />
          <StatCell label="Examinées" value={reviewedCount} sub="Avec retour" />
          <StatCell label="Archivées" value={archivedCount} sub="Hors-circuit" />
        </StatBar>

        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
          <DataPanel
            title="Idées soumises"
            subtitle="Cliquez sur une ligne pour la modérer"
            badge={`${ideas.length}`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-[#0A0A0A]">
                  <tr>
                    {["Idée", "Auteur", "Soumise", "Statut"].map((h, i) => (
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
                        Chargement…
                      </td>
                    </tr>
                  ) : ideas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-14 text-center text-[13px] text-[#737373]"
                      >
                        Aucune idée soumise pour le moment.
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
                          {idea.user?.name || idea.author || "Collaborateur"}
                        </td>
                        <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                          {formatDate(idea)}
                        </td>
                        <td className="px-6 py-5">
                          <StatusPill
                            tone={STATUS_TONE[idea.status] || "neutral"}
                            label={STATUS_LABEL_FR[idea.status] || idea.status}
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
            title="Panneau de modération"
            subtitle={
              selectedIdea
                ? "Rédigez votre retour et choisissez une action"
                : "Sélectionnez une idée à modérer"
            }
          >
            <div className="p-6">
              {!selectedIdea ? (
                <p className="text-[13px] text-[#737373] italic">
                  Cliquez sur une idée dans la liste pour la modérer.
                </p>
              ) : (
                <div className="space-y-5">
                  <DetailRow label="Titre" value={selectedIdea.title} />
                  <DetailRow
                    label="Statut"
                    value={
                      STATUS_LABEL_FR[selectedIdea.status] || selectedIdea.status
                    }
                  />
                  <DetailRow
                    label="Soumise le"
                    value={formatDate(selectedIdea)}
                  />

                  <div className="border-t border-[#E5E5E5] pt-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#737373] mb-2">
                      Contenu de l'idée
                    </p>
                    <p className="text-[13px] text-[#0A0A0A] leading-[1.7] whitespace-pre-line">
                      {selectedIdea.content}
                    </p>
                  </div>

                  <TextArea
                    label="Retour du modérateur"
                    value={feedback}
                    onChange={setFeedback}
                    placeholder="Rédigez un retour pour le collaborateur…"
                    rows={5}
                  />

                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => handleModerate("REVIEWED")}
                    >
                      Marquer comme examinée
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleModerate("ARCHIVED")}
                    >
                      Archiver
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
