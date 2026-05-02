import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

export default function ManageSurveys() {
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
        setError(data.message || "Could not load surveys");
        return;
      }

      const list = data.data || [];
      setSurveys(list);
      setSelectedId(list[0]?.id || null);
    } catch (err) {
      console.error(err);
      setError("Server error while loading surveys");
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
  const draftCount = surveys.filter((s) => s.status === "Draft").length;
  const publishedCount = surveys.filter((s) => s.status === "Published").length;
  const archivedCount = surveys.filter((s) => s.status === "Archived").length;

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
                    Communicator tools
                  </p>

                  <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                    Manage Surveys
                  </h1>

                  <p className="text-[#7A8088] text-sm mt-2 max-w-[780px] leading-[170%]">
                    Publish survey notices, manage visibility, archive past
                    survey communications, and follow participation trends for
                    employee-facing surveys.
                  </p>
                </div>

                <Link
                  to="/dashboard/communicator/surveys/create"
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                >
                  Create Survey Notice
                </Link>
              </div>

              {error && (
                <div className="rounded-[14px] bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  title="Total Surveys"
                  value={totalCount}
                  subtitle="All survey publications"
                />
                <StatCard
                  title="Drafts"
                  value={draftCount}
                  subtitle="Prepared but not yet published"
                />
                <StatCard
                  title="Published"
                  value={publishedCount}
                  subtitle="Currently visible survey notices"
                />
                <StatCard
                  title="Archived"
                  value={archivedCount}
                  subtitle="Past survey publications"
                />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  Survey Filters
                </h2>

                <p className="text-sm text-[#7A8088] mt-1 mb-4">
                  Search by survey title and filter by status.
                </p>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search survey title..."
                    className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option>All statuses</option>
                    <option value="DRAFT">Draft</option>
<option value="PUBLISHED">Published</option>
<option value="ARCHIVED">Archived</option>
                  </select>

                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All statuses");
                    }}
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B]"
                  >
                    Reset filters
                  </button>
                </div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                    <div>
                      <h3 className="text-[24px] font-bold text-[#2F343B]">
                        Survey Publication List
                      </h3>
                      <p className="text-sm text-[#7A8088] mt-1">
                        Review survey notices, publication status, and
                        participation trends.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                      {filteredSurveys.length} items
                    </span>
                  </div>

                  {loading ? (
                    <div className="p-6 text-sm text-[#7A8088]">
                      Loading surveys...
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1100px]">
                        <thead className="bg-[#FBFAF8]">
                          <tr>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                              Survey Title
                            </th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                              Status
                            </th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                              Target Audience
                            </th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                              Publish Date
                            </th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                              Participation Rate
                            </th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                              Actions
                            </th>
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
                                <StatusBadge status={item.status} />
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
                                    View details
                                  </button>

                                  {item.status === "DRAFT" && (
                                    <button
                                      onClick={() =>
                                        openModal("publish", item.id)
                                      }
                                      className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium"
                                    >
                                      Publish
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
                                No surveys available.
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
                      Status summary
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1 mb-4">
                      Current distribution of survey publication statuses.
                    </p>

                    <div className="space-y-3">
                      <SummaryRow label="Drafts" value={draftCount} />
                      <SummaryRow label="Published" value={publishedCount} />
                      <SummaryRow label="Archived" value={archivedCount} />
                    </div>
                  </section>

                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Selected survey
                    </h3>

                    {selectedSurvey ? (
                      <div className="space-y-3 mt-4">
                        <SummaryRow label="Title" value={selectedSurvey.title} />
                        <SummaryRow
                          label="Status"
                          value={selectedSurvey.status}
                        />
                        <SummaryRow
                          label="Rate"
                          value={getParticipationRate(selectedSurvey)}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-[#7A8088] mt-3">
                        No survey selected.
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
        <ModalShell title="Survey Details" onClose={closeModal}>
          <DetailRow label="Title" value={selectedSurvey.title} />
          <DetailRow label="Status" value={selectedSurvey.status} />
          <DetailRow
            label="Target Audience"
            value={selectedSurvey.target_audience || "-"}
          />
          <DetailRow
            label="Publish Date"
            value={selectedSurvey.publish_date || "-"}
          />
          <DetailRow label="Deadline" value={selectedSurvey.end_date || "-"} />
          <DetailRow
            label="CTA Label"
            value={selectedSurvey.cta_label || "-"}
          />

          <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
            <p className="text-sm font-semibold text-[#2F343B] mb-2">
              Summary
            </p>
            <p className="text-sm text-[#7A8088] leading-[170%]">
            Question
            {selectedSurvey.question || "-"}
            </p>
          </div>
        </ModalShell>
      )}

      {modal.open && modal.type === "publish" && selectedSurvey && (
        <ConfirmModal
          title="Publish Survey Notice"
          message={`Do you want to publish "${selectedSurvey.title}" for ${
            selectedSurvey.target_audience || "selected audience"
          }?`}
          confirmLabel="Publish"
          onCancel={closeModal}
          onConfirm={() => handlePublish(selectedSurvey.id)}
        />
      )}

      {modal.open && modal.type === "archive" && selectedSurvey && (
        <ConfirmModal
          title="Archive Survey Notice"
          message={`Do you want to archive "${selectedSurvey.title}"?`}
          confirmLabel="Archive"
          onCancel={closeModal}
          onConfirm={() => handleArchive(selectedSurvey.id)}
        />
      )}

      {modal.open && modal.type === "delete" && selectedSurvey && (
        <ConfirmModal
          title="Delete Survey Notice"
          message={`Do you want to delete "${selectedSurvey.title}"?`}
          confirmLabel="Delete"
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

function StatusBadge({ status }) {
  const styles = {
    Draft: "bg-[#FFF4D6] text-[#B98900]",
    Published: "bg-[#D4F4DD] text-[#2D7A4A]",
    Archived: "bg-[#F1F0EC] text-[#7A8088]",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-[#F1F0EC] text-[#7A8088]"
      }`}
    >
      {status || "Draft"}
    </span>
  );
}

function ModalShell({ title, children, onClose }) {
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
            Close
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
            Cancel
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