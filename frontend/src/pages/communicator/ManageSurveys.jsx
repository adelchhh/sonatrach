import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { Link } from "react-router-dom";
import { useT } from "../../i18n/LanguageContext";

const API_URL = "http://127.0.0.1:8000/api";

export default function ManageSurveys() {
  const t = useT();
  const [surveys, setSurveys] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState({
    open: false,
    type: null,
    surveyId: null,
  });

  const loadSurveys = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/communicator/surveys`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || t("communicator.surveys.loadFailed"));
        return;
      }

      const list = data.data || [];
      setSurveys(list);
      setSelectedId(list[0]?.id || null);
    } catch (err) {
      console.error(err);
      setError(t("communicator.surveys.serverError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const selectedSurvey =
    surveys.find((item) => item.id === (modal.surveyId ?? selectedId)) || null;

  const filteredSurveys = surveys.filter((item) => {
    const q = search.toLowerCase();

    const matchesSearch =
      String(item.title || "").toLowerCase().includes(q) ||
      String(item.summary || "").toLowerCase().includes(q) ||
      String(item.target_audience || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "All statuses" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = surveys.length;
  const draftCount = surveys.filter((s) => s.status === "DRAFT").length;
  const publishedCount = surveys.filter((s) => s.status === "PUBLISHED").length;
  const archivedCount = surveys.filter((s) => s.status === "ARCHIVED").length;

  const getParticipationRate = (survey) => {
    const invited = Number(survey.total_invited || 0);
    const responses = Number(survey.total_responses || 0);

    if (!invited) return "0%";

    return `${Math.round((responses / invited) * 100)}%`;
  };

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      surveyId: null,
    });
  };

  const openModal = (type, surveyId = selectedId) => {
    setModal({
      open: true,
      type,
      surveyId,
    });
  };

  const handlePublish = async (id) => {
    try {
      const res = await fetch(`${API_URL}/communicator/surveys/${id}/publish`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not publish survey");
        return;
      }

      closeModal();
      await loadSurveys();
    } catch (err) {
      console.error(err);
      setError("Server error while publishing survey");
    }
  };

  const handleArchive = async (id) => {
    try {
      const res = await fetch(`${API_URL}/communicator/surveys/${id}/archive`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not archive survey");
        return;
      }

      closeModal();
      await loadSurveys();
    } catch (err) {
      console.error(err);
      setError("Server error while archiving survey");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/communicator/surveys/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not delete survey");
        return;
      }

      closeModal();
      await loadSurveys();
    } catch (err) {
      console.error(err);
      setError("Server error while deleting survey");
    }
  };

  return (
    <>
      <div className="flex h-screen bg-[#F7F7F5]">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopBar />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#ED8D31] mb-2">
                    {t("dashboard.sidebar.communicatorTools")}
                  </p>

                  <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                    {t("communicator.surveys.title")}
                  </h1>

                  <p className="text-[#7A8088] text-sm mt-2 max-w-[780px] leading-[170%]">
                    {t("communicator.surveys.subtitle")}
                  </p>
                </div>

                <Link
                  to="/dashboard/communicator/surveys/create"
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                >
                  {t("communicator.surveys.new")}
                </Link>
              </div>

              {error && (
                <div className="rounded-[14px] bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title={t("communicator.surveys.statTotal")} value={totalCount} subtitle="" />
                <StatCard title={t("communicator.surveys.statDrafts")} value={draftCount} subtitle="" />
                <StatCard title={t("communicator.surveys.statPublished")} value={publishedCount} subtitle="" />
                <StatCard title={t("communicator.surveys.statArchived")} value={archivedCount} subtitle="" />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  {t("admin.documents.title")}
                </h2>

                <div className="flex flex-wrap gap-3 mt-4">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("communicator.surveys.searchPlaceholder")}
                    className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option value="All statuses">{t("communicator.surveys.allStatuses")}</option>
                    <option value="DRAFT">{t("statuses.DRAFT")}</option>
                    <option value="PUBLISHED">{t("statuses.PUBLISHED")}</option>
                    <option value="ARCHIVED">{t("statuses.ARCHIVED")}</option>
                  </select>

                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All statuses");
                    }}
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B]"
                  >
                    {t("communicator.surveys.reset")}
                  </button>
                </div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                    <div>
                      <h3 className="text-[24px] font-bold text-[#2F343B]">
                        {t("communicator.surveys.panelTitle")}
                      </h3>
                      <p className="text-sm text-[#7A8088] mt-1">
                        {t("communicator.surveys.panelSub")}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                      {filteredSurveys.length} items
                    </span>
                  </div>

                  {loading ? (
                    <div className="p-6 text-sm text-[#7A8088]">
                      {t("communicator.common.loading")}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1100px]">
                        <thead className="bg-[#FBFAF8]">
                          <tr>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("communicator.surveys.col.title")}</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("communicator.surveys.col.status")}</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("communicator.surveys.col.audience")}</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("communicator.surveys.col.publication")}</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("communicator.surveys.col.participation")}</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("communicator.surveys.col.actions")}</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredSurveys.map((item) => (
                            <tr
                              key={item.id}
                              className={`border-t border-[#E5E2DC] align-top ${
                                selectedId === item.id ? "bg-[#FCFBF9]" : ""
                              }`}
                            >
                              <td className="px-5 py-5">
                                <button
                                  onClick={() => setSelectedId(item.id)}
                                  className="text-left"
                                >
                                  <p className="font-semibold text-[#2F343B] text-sm">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-[#7A8088] mt-1 max-w-[340px]">
                                  {item.question}
                                  </p>
                                </button>
                              </td>

                              <td className="px-5 py-5">
                                <StatusBadge status={item.status} label={t(`statuses.${item.status}`) || item.status} />
                              </td>

                              <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {item.start_date || "-"}
                              </td>

                              <td className="px-5 py-5 text-sm font-semibold text-[#2F343B]">
                                {getParticipationRate(item)}
                              </td>

                              <td className="px-5 py-5">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => openModal("details", item.id)}
                                    className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                  >
                                    {t("communicator.common.details")}
                                  </button>

                                  {item.status === "DRAFT" && (
                                    <button
                                      onClick={() =>
                                        openModal("publish", item.id)
                                      }
                                      className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium"
                                    >
                                      {t("communicator.common.publish")}
                                    </button>
                                  )}

                                  {item.status !== "ARCHIVED" && (
                                    <button
                                      onClick={() =>
                                        openModal("archive", item.id)
                                      }
                                      className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                    >
                                      Archive
                                    </button>
                                  )}

                                  <button
                                    onClick={() =>
                                      openModal("responses", item.id)
                                    }
                                    className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                  >
                                    View responses summary
                                  </button>

                                  <button
                                    onClick={() => openModal("delete", item.id)}
                                    className="px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-500 text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {filteredSurveys.length === 0 && (
                            <tr>
                              <td
                                colSpan="6"
                                className="px-5 py-10 text-center text-sm text-[#7A8088]"
                              >
                                {t("communicator.surveys.empty")}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <div className="space-y-5">
                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      {t("admin.reports.outcomesTitle")}
                    </h3>

                    <div className="space-y-3 mt-4">
                      <SummaryRow label={t("communicator.surveys.statDrafts")} value={draftCount} />
                      <SummaryRow label={t("communicator.surveys.statPublished")} value={publishedCount} />
                      <SummaryRow label={t("communicator.surveys.statArchived")} value={archivedCount} />
                    </div>
                  </section>

                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      {t("communicator.common.details")}
                    </h3>

                    {selectedSurvey ? (
                      <div className="space-y-3 mt-4">
                        <SummaryRow label={t("communicator.surveys.col.title")} value={selectedSurvey.title} />
                        <SummaryRow
                          label={t("communicator.surveys.col.status")}
                          value={t(`statuses.${selectedSurvey.status}`) || selectedSurvey.status}
                        />
                        <SummaryRow
                          label={t("communicator.surveys.col.participation")}
                          value={getParticipationRate(selectedSurvey)}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-[#7A8088] mt-3">
                        {t("communicator.surveys.empty")}
                      </p>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {modal.open && modal.type === "details" && selectedSurvey && (
        <ModalShell title={t("communicator.common.details")} closeLabel={t("communicator.surveys.close")} onClose={closeModal}>
          <DetailRow label={t("communicator.surveys.col.title")} value={selectedSurvey.title} />
          <DetailRow label={t("communicator.surveys.col.status")} value={t(`statuses.${selectedSurvey.status}`) || selectedSurvey.status} />
          <DetailRow
            label={t("communicator.surveys.col.audience")}
            value={selectedSurvey.target_audience || "-"}
          />
          <DetailRow
            label={t("communicator.surveys.col.publication")}
            value={selectedSurvey.publish_date || "-"}
          />
          <DetailRow label={t("communicator.surveys.deadline")} value={selectedSurvey.end_date || "-"} />
          <DetailRow
            label={t("communicator.surveys.cta")}
            value={selectedSurvey.cta_label || "-"}
          />

          <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
            <p className="text-sm font-semibold text-[#2F343B] mb-2">
              {t("communicator.surveys.question")}
            </p>
            <p className="text-sm text-[#7A8088] leading-[170%]">
              {selectedSurvey.question || "-"}
            </p>
          </div>
        </ModalShell>
      )}

      {modal.open && modal.type === "publish" && selectedSurvey && (
        <ConfirmModal
          title={t("communicator.surveys.publishTitle")}
          message={t("communicator.surveys.publishText", {
            title: selectedSurvey.title,
            audience: selectedSurvey.target_audience || t("communicator.surveys.defaultAudience"),
          })}
          confirmLabel={t("communicator.common.publish")}
          cancelLabel={t("communicator.common.cancel")}
          onCancel={closeModal}
          onConfirm={() => handlePublish(selectedSurvey.id)}
        />
      )}

      {modal.open && modal.type === "archive" && selectedSurvey && (
        <ConfirmModal
          title={t("communicator.surveys.archiveTitle")}
          message={t("communicator.surveys.archiveText", { title: selectedSurvey.title })}
          confirmLabel={t("communicator.common.archive")}
          cancelLabel={t("communicator.common.cancel")}
          onCancel={closeModal}
          onConfirm={() => handleArchive(selectedSurvey.id)}
        />
      )}

      {modal.open && modal.type === "delete" && selectedSurvey && (
        <ConfirmModal
          title={t("communicator.surveys.deleteTitle")}
          message={t("communicator.surveys.deleteText", { title: selectedSurvey.title })}
          confirmLabel={t("communicator.common.delete")}
          cancelLabel={t("communicator.common.cancel")}
          onCancel={closeModal}
          onConfirm={() => handleDelete(selectedSurvey.id)}
        />
      )}

      {modal.open && modal.type === "responses" && selectedSurvey && (
        <ModalShell title="Responses Summary" onClose={closeModal}>
          <DetailRow label="Survey" value={selectedSurvey.title} />
          <DetailRow
            label="Target Audience"
            value={selectedSurvey.target_audience || "-"}
          />
          <DetailRow
            label="Publish Date"
            value={selectedSurvey.publish_date || "-"}
          />
          <DetailRow label="Deadline" value={selectedSurvey.deadline || "-"} />
          <DetailRow
            label="Participation Rate"
            value={getParticipationRate(selectedSurvey)}
          />
          <DetailRow
            label="Total Invited"
            value={selectedSurvey.total_invited || 0}
          />
          <DetailRow
            label="Total Responses"
            value={selectedSurvey.total_responses || 0}
          />

          <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
            <p className="text-sm font-semibold text-[#2F343B] mb-2">
              Summary Note
            </p>
            <p className="text-sm text-[#7A8088] leading-[170%]">
              This page provides a communication-level overview only. Detailed
              survey analytics and answer breakdowns can be added later.
            </p>
          </div>
        </ModalShell>
      )}
    </>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{title}</p>
      <p className="text-3xl font-extrabold text-[#2F343B] mt-2">{value}</p>
      <p className="text-xs text-[#7A8088] mt-2">{subtitle}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3 gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-bold text-[#2F343B] text-right">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status, label }) {
  const styles = {
    DRAFT: "bg-[#FFF4D6] text-[#B98900]",
    PUBLISHED: "bg-[#D4F4DD] text-[#2D7A4A]",
    ARCHIVED: "bg-[#F1F0EC] text-[#7A8088]",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-[#F1F0EC] text-[#7A8088]"
      }`}
    >
      {label || status || "—"}
    </span>
  );
}

function ModalShell({ title, children, onClose, closeLabel = "Close" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[520px] shadow-lg">
        <h2 className="text-xl font-bold text-[#2F343B] mb-4">{title}</h2>
        <div className="space-y-3 mb-6">{children}</div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[12px] border border-[#E5E2DC]"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg">
        <h2 className="text-xl font-bold text-[#2F343B] mb-3">{title}</h2>
        <p className="text-sm text-[#7A8088] mb-6 leading-[170%]">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-medium"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3 gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B] text-right">
        {value}
      </span>
    </div>
  );
}