import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { Link } from "react-router-dom";
import { apiGet, apiPatch } from "../../api";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function toUiStatus(status) {
  if (status === "PUBLISHED") return "Published";
  if (status === "ARCHIVED") return "Archived";
  return "Draft";
}

function toUiAudience(audience) {
  const map = {
    ALL: "All Employees",
    EMPLOYEES: "Employees",
    FUNCTIONAL_ADMIN: "Functional Admin",
    COMMUNICATOR: "Communicator",
    SYSTEM_ADMIN: "System Admin",
  };
  return map[audience] || audience || "All Employees";
}

function mapSurvey(row) {
  return {
    id: row.id,
    title: row.title || "Untitled survey",
    status: toUiStatus(row.status),
    targetAudience: toUiAudience(row.audience),
    publishDate: formatDate(row.start_date),
    deadline: formatDate(row.end_date),
    participationRate: "N/A",
    totalInvited: "N/A",
    totalResponses: Number(row.total_responses || 0),
    summary: row.question || "—",
  };
}

export default function ManageSurveys() {
  const [surveys, setSurveys] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [responses, setResponses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("All audiences");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({
    open: false,
    type: null, // details | publish | archive | responses
    surveyId: null,
  });

  const selectedSurvey =
    surveys.find((item) => item.id === (modal.surveyId ?? selectedId)) || null;

  const filteredSurveys = useMemo(() => {
    return surveys.filter((item) => {
      const titleOk = item.title.toLowerCase().includes(searchText.trim().toLowerCase());
      const audienceOk =
        audienceFilter === "All audiences" || item.targetAudience === audienceFilter;
      const statusOk =
        statusFilter === "All statuses" || item.status === statusFilter;
      return titleOk && audienceOk && statusOk;
    });
  }, [surveys, searchText, audienceFilter, statusFilter]);

  const totalCount = surveys.length;
  const draftCount = surveys.filter((s) => s.status === "Draft").length;
  const publishedCount = surveys.filter((s) => s.status === "Published").length;
  const archivedCount = surveys.filter((s) => s.status === "Archived").length;

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/surveys?scope=admin");
      const mapped = (res.data || []).map(mapSurvey);
      setSurveys(mapped);
      if (!selectedId && mapped.length) setSelectedId(mapped[0].id);
    } catch (err) {
      alert(err.message || "Could not load surveys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

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
    if (type === "responses" && surveyId) {
      apiGet(`/surveys/${surveyId}/responses`)
        .then((res) => setResponses(res.data || []))
        .catch(() => setResponses([]));
    }
  };

  const handlePublish = async (id) => {
    try {
      await apiPatch(`/surveys/${id}/status`, { status: "PUBLISHED" });
      await loadSurveys();
    } catch (err) {
      alert(err.message || "Could not publish survey.");
    }
    closeModal();
  };

  const handleArchive = async (id) => {
    try {
      await apiPatch(`/surveys/${id}/status`, { status: "ARCHIVED" });
      await loadSurveys();
    } catch (err) {
      alert(err.message || "Could not archive survey.");
    }
    closeModal();
  };

  return (
    <>
      <div className="flex h-screen bg-[#F7F7F5]">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopBar />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#ED8D31] mb-2">
                    Communicator tools
                  </p>
                  <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                    Manage Surveys
                  </h1>
                  <p className="text-[#7A8088] text-sm mt-2 max-w-[780px] leading-[170%]">
                    Publish survey notices, manage visibility, archive past survey
                    communications, and follow participation trends for employee-facing surveys.
                  </p>
                </div>

                <Link
  to="/dashboard/communicator/surveys/create"
  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
>
  Create Survey Notice
</Link>
              </div>

              {/* Stats */}
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

              {/* Filters */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  Survey Filters
                </h2>
                <p className="text-sm text-[#7A8088] mt-1 mb-4">
                  Search by survey title and filter by target audience or status.
                </p>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Search survey title..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select
                    value={audienceFilter}
                    onChange={(e) => setAudienceFilter(e.target.value)}
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option>All audiences</option>
                    <option>All Employees</option>
                    <option>Employees</option>
                    <option>Functional Admin</option>
                    <option>Communicator</option>
                    <option>System Admin</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option>All statuses</option>
                    <option>Draft</option>
                    <option>Published</option>
                    <option>Archived</option>
                  </select>

                  <button
                    onClick={() => {
                      setSearchText("");
                      setAudienceFilter("All audiences");
                      setStatusFilter("All statuses");
                    }}
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B]"
                  >
                    Reset filters
                  </button>

                  <button
                    onClick={loadSurveys}
                    className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold"
                  >
                    Apply filters
                  </button>
                </div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
                {/* Table */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                    <div>
                      <h3 className="text-[24px] font-bold text-[#2F343B]">
                        Survey Publication List
                      </h3>
                      <p className="text-sm text-[#7A8088] mt-1">
                        Review survey notices, publication status, and participation trends.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                      {filteredSurveys.length} items
                    </span>
                  </div>

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
                        {loading && (
                          <tr>
                            <td
                              colSpan="6"
                              className="px-5 py-10 text-center text-sm text-[#7A8088]"
                            >
                              Loading surveys...
                            </td>
                          </tr>
                        )}

                        {!loading && filteredSurveys.map((item) => (
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
                                  {item.summary}
                                </p>
                              </button>
                            </td>

                            <td className="px-5 py-5">
                              <StatusBadge status={item.status} />
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {item.targetAudience}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {item.publishDate}
                            </td>

                            <td className="px-5 py-5 text-sm font-semibold text-[#2F343B]">
                              {item.participationRate}
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => openModal("details", item.id)}
                                  className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                >
                                  View details
                                </button>

                                {item.status === "Draft" && (
                                  <button
                                    onClick={() => openModal("publish", item.id)}
                                    className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium"
                                  >
                                    Publish
                                  </button>
                                )}

                                {item.status !== "Archived" && (
                                  <button
                                    onClick={() => openModal("archive", item.id)}
                                    className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                  >
                                    Archive
                                  </button>
                                )}

                                <button
                                  onClick={() => openModal("responses", item.id)}
                                  className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                >
                                  View responses summary
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {!loading && filteredSurveys.length === 0 && (
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
                </section>

                {/* Right panel */}
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
                    <p className="text-sm text-[#7A8088] mt-1 mb-4">
                      Quick summary of the currently selected survey notice.
                    </p>

                    {selectedSurvey && (
                      <div className="space-y-3">
                        <SummaryRow label="Title" value={selectedSurvey.title} />
                        <SummaryRow label="Status" value={selectedSurvey.status} />
                        <SummaryRow
                          label="Audience"
                          value={selectedSurvey.targetAudience}
                        />
                        <SummaryRow
                          label="Rate"
                          value={selectedSurvey.participationRate}
                        />
                      </div>
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
          <DetailRow label="Target Audience" value={selectedSurvey.targetAudience} />
          <DetailRow label="Publish Date" value={selectedSurvey.publishDate} />
          <DetailRow
            label="Participation Rate"
            value={selectedSurvey.participationRate}
          />

          <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
            <p className="text-sm font-semibold text-[#2F343B] mb-2">
              Summary
            </p>
            <p className="text-sm text-[#7A8088] leading-[170%]">
              {selectedSurvey.summary}
            </p>
          </div>
        </ModalShell>
      )}

      {modal.open && modal.type === "publish" && selectedSurvey && (
        <ConfirmModal
          title="Publish Survey Notice"
          message={`Do you want to publish "${selectedSurvey.title}" for ${selectedSurvey.targetAudience}?`}
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

{modal.open && modal.type === "responses" && selectedSurvey && (
  <ModalShell title="Responses Summary" onClose={closeModal}>
    <DetailRow label="Survey" value={selectedSurvey.title} />
    <DetailRow label="Target Audience" value={selectedSurvey.targetAudience} />
    <DetailRow label="Publish Date" value={selectedSurvey.publishDate} />
    <DetailRow label="Deadline" value={selectedSurvey.deadline} />
    <DetailRow
      label="Participation Rate"
      value={selectedSurvey.participationRate}
    />
    <DetailRow
      label="Total Invited"
      value={selectedSurvey.totalInvited}
    />
    <DetailRow
      label="Total Responses"
      value={selectedSurvey.totalResponses}
    />
    <DetailRow
      label="Fetched Responses"
      value={responses.length}
    />

    <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
      <p className="text-sm font-semibold text-[#2F343B] mb-2">
        Summary Note
      </p>
      <p className="text-sm text-[#7A8088] leading-[170%]">
        This page provides a communication-level overview only. Detailed survey
        analytics, answer breakdowns, and advanced reporting can be handled in a
        separate analytics module later.
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
      <span className="text-sm font-bold text-[#2F343B] text-right">{value}</span>
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
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
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
