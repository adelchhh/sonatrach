import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { Link } from "react-router-dom";

const initialSurveys = [
    {
      id: 1,
      title: "Winter Activity Satisfaction Survey",
      status: "Published",
      targetAudience: "Participants",
      publishDate: "Oct 20, 2024",
      deadline: "Oct 30, 2024",
      participationRate: "68%",
      totalInvited: 250,
      totalResponses: 170,
      summary:
        "Survey published for employees who joined winter activities to collect feedback on organization and satisfaction.",
    },
    {
      id: 2,
      title: "Family Stay Experience Survey",
      status: "Draft",
      targetAudience: "Families",
      publishDate: "Oct 24, 2024",
      deadline: "Nov 02, 2024",
      participationRate: "0%",
      totalInvited: 180,
      totalResponses: 0,
      summary:
        "Survey notice prepared for families who participated in the latest family stay program.",
    },
    {
      id: 3,
      title: "Omra Communication Feedback",
      status: "Published",
      targetAudience: "Selected Participants",
      publishDate: "Oct 12, 2024",
      deadline: "Oct 22, 2024",
      participationRate: "74%",
      totalInvited: 120,
      totalResponses: 89,
      summary:
        "Feedback survey shared with selected Omra participants regarding communication clarity and document process.",
    },
    {
      id: 4,
      title: "Summer Campaign Survey Notice",
      status: "Archived",
      targetAudience: "All Employees",
      publishDate: "Sep 28, 2024",
      deadline: "Oct 08, 2024",
      participationRate: "81%",
      totalInvited: 320,
      totalResponses: 259,
      summary:
        "Archived survey communication linked to the summer campaign participation and general experience feedback.",
    },
  ];

export default function ManageSurveys() {
  const [surveys, setSurveys] = useState(initialSurveys);
  const [selectedId, setSelectedId] = useState(initialSurveys[0]?.id ?? null);

  const [modal, setModal] = useState({
    open: false,
    type: null, // details | publish | archive | responses
    surveyId: null,
  });

  const selectedSurvey =
    surveys.find((item) => item.id === (modal.surveyId ?? selectedId)) || null;

  const totalCount = surveys.length;
  const draftCount = surveys.filter((s) => s.status === "Draft").length;
  const publishedCount = surveys.filter((s) => s.status === "Published").length;
  const archivedCount = surveys.filter((s) => s.status === "Archived").length;

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

  const handlePublish = (id) => {
    setSurveys((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Published" } : item
      )
    );
    closeModal();
  };

  const handleArchive = (id) => {
    setSurveys((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Archived" } : item
      )
    );
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
                    className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>All audiences</option>
                  </select>

                  <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>All statuses</option>
                  </select>

                  <button className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B]">
                    Reset filters
                  </button>

                  <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold">
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
                      {surveys.length} items
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
                        {surveys.map((item) => (
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

                        {surveys.length === 0 && (
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