import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  Toolbar,
  SearchInput,
  SelectInput,
  DataPanel,
  StatusPill,
  Modal,
  Button,
  Alert,
} from "../../components/ui/Studio";

const API_URL = `${API_BASE_URL}/api`;

const STATUS_TONE = {
  DRAFT: "warn",
  PUBLISHED: "success",
  ARCHIVED: "neutral",
};

export default function ManageSurveys() {
  const t = useT();
  const [surveys, setSurveys] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, type: null, id: null });

  const loadSurveys = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/communicator/surveys`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Impossible de charger les sondages.");
        return;
      }
      setSurveys(data.data || []);
    } catch (err) {
      setError("Erreur serveur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const selected = surveys.find((s) => s.id === modal.id) || null;

  const filtered = surveys.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      String(s.title || "").toLowerCase().includes(q) ||
      String(s.summary || "").toLowerCase().includes(q) ||
      String(s.target_audience || "").toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = surveys.length;
  const draftCount = surveys.filter((s) => s.status === "DRAFT").length;
  const publishedCount = surveys.filter((s) => s.status === "PUBLISHED").length;
  const archivedCount = surveys.filter((s) => s.status === "ARCHIVED").length;

  const participationRate = (s) => {
    const invited = Number(s.total_invited || 0);
    const responses = Number(s.total_responses || 0);
    if (!invited) return "0%";
    return `${Math.round((responses / invited) * 100)}%`;
  };

  const closeModal = () => setModal({ open: false, type: null, id: null });

  const performAction = async (action, id) => {
    try {
      const res = await fetch(`${API_URL}/communicator/surveys/${id}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || `Action ${action} impossible.`);
        return;
      }
      closeModal();
      await loadSurveys();
    } catch (err) {
      setError(`Erreur serveur (${action}).`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/communicator/surveys/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Suppression impossible.");
        return;
      }
      closeModal();
      await loadSurveys();
    } catch (err) {
      setError("Erreur serveur (suppression).");
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.communication")}
        title={t("sg.surveys")}
        subtitle={t("sg.subSurveys")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("sg.surveys") },
        ]}
        actions={
          <Button
            to="/dashboard/communicator/surveys/create"
            variant="primary"
            size="md"
            icon={<span className="text-[14px] leading-none">＋</span>}
          >
            {t("sg.newSurvey")}
          </Button>
        }
      />

      <PageBody>
        {error && (
          <Alert tone="danger" title={t("sg.error")}>
            {error}
          </Alert>
        )}

        <StatBar>
          <StatCell label={t("sg.total")} value={totalCount} sub={t("sg.subAllSurveys")} />
          <StatCell
            label={t("sg.drafts")}
            value={draftCount}
            sub={t("sg.subNotPublished")}
            accent={draftCount > 0}
          />
          <StatCell label={t("sg.published")} value={publishedCount} sub={t("sg.subVisible")} />
          <StatCell label={t("sg.archived")} value={archivedCount} sub={t("sg.subOffCircuit")} />
        </StatBar>

        <Toolbar>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("sg.phSearchTitleAudience")}
          />
          <SelectInput
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: t("sg.allStatuses") },
              { value: "DRAFT", label: t("sg.statusDraftLabel") },
              { value: "PUBLISHED", label: t("sg.statusPublishedLabel") },
              { value: "ARCHIVED", label: t("sg.statusArchivedLabel") },
            ]}
          />
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            {t("sg.reset")}
          </Button>
        </Toolbar>

        <DataPanel
          title={t("sg.panelPublishedSurveys")}
          subtitle={t("sg.panelPublishedSurveysSub")}
          badge={`${filtered.length}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {[
                    t("sg.colTitle"),
                    t("sg.colStatus"),
                    t("sg.colAudience"),
                    t("sg.colPublication"),
                    t("sg.colParticipation"),
                    t("sg.colActions"),
                  ].map((h, i) => (
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
                    <td colSpan={6} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      {t("sg.loading")}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      {t("sg.emptySurveys")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                    >
                      <td className="px-6 py-5 max-w-[360px]">
                        <p className="text-[#0A0A0A] text-[14px] font-bold">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#737373] mt-1 line-clamp-2">
                          {item.question}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <StatusPill
                          tone={STATUS_TONE[item.status] || "neutral"}
                          label={item.status}
                        />
                      </td>
                      <td className="px-6 py-5 text-[12px] text-[#525252]">
                        {item.target_audience || "—"}
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                        {item.start_date || "—"}
                      </td>
                      <td className="px-6 py-5 text-[14px] font-bold tabular-nums text-[#ED8D31]">
                        {participationRate(item)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setModal({ open: true, type: "details", id: item.id })
                            }
                          >
                            {t("sg.details")}
                          </Button>
                          {item.status === "DRAFT" && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() =>
                                setModal({ open: true, type: "publish", id: item.id })
                              }
                            >
                              {t("sg.publish")}
                            </Button>
                          )}
                          {item.status !== "ARCHIVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setModal({ open: true, type: "archive", id: item.id })
                              }
                            >
                              {t("sg.archive")}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              setModal({ open: true, type: "delete", id: item.id })
                            }
                          >
                            {t("sg.delete")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DataPanel>
      </PageBody>

      <Modal
        open={modal.open && modal.type === "details" && !!selected}
        onClose={closeModal}
        title={selected?.title || t("sg.details")}
        width="lg"
        footer={
          <Button variant="outline" size="md" onClick={closeModal}>
            {t("common.close")}
          </Button>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-[12px]">
              <DetailItem label={t("sg.colStatus")} value={selected.status} />
              <DetailItem label={t("sg.colAudience")} value={selected.target_audience || "—"} />
              <DetailItem label={t("sg.colPublication")} value={selected.publish_date || "—"} />
              <DetailItem label={t("sg.labelDeadline")} value={selected.end_date || "—"} />
              <DetailItem label={t("sg.labelCta")} value={selected.cta_label || "—"} />
              <DetailItem label={t("sg.colParticipation")} value={participationRate(selected)} />
            </div>
            <div className="border-t border-[#E5E5E5] pt-4">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#737373] mb-2">
                {t("sg.labelQuestion")}
              </p>
              <p className="text-[13px] text-[#0A0A0A] leading-[1.7]">
                {selected.question || "—"}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={modal.open && modal.type === "publish" && !!selected}
        onClose={closeModal}
        title={t("sg.publishSurveyTitle")}
        description={
          selected ? `« ${selected.title} » — ${selected.target_audience || ""}` : ""
        }
        footer={
          <>
            <Button variant="outline" size="md" onClick={closeModal}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => selected && performAction("publish", selected.id)}
            >
              {t("sg.publish")}
            </Button>
          </>
        }
      />

      <Modal
        open={modal.open && modal.type === "archive" && !!selected}
        onClose={closeModal}
        title={t("sg.archiveSurveyTitle")}
        description={selected ? `« ${selected.title} »` : ""}
        footer={
          <>
            <Button variant="outline" size="md" onClick={closeModal}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="dark"
              size="md"
              onClick={() => selected && performAction("archive", selected.id)}
            >
              {t("sg.archive")}
            </Button>
          </>
        }
      />

      <Modal
        open={modal.open && modal.type === "delete" && !!selected}
        onClose={closeModal}
        title={t("sg.deleteSurveyTitle")}
        description={selected ? `« ${selected.title} »` : ""}
        footer={
          <>
            <Button variant="outline" size="md" onClick={closeModal}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => selected && handleDelete(selected.id)}
            >
              {t("sg.delete")}
            </Button>
          </>
        }
      />
    </PageShell>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#737373] mb-1">
        {label}
      </p>
      <p className="text-[13px] font-bold text-[#0A0A0A]">{value}</p>
    </div>
  );
}
