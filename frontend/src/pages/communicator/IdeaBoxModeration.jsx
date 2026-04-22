import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const initialIdeas = [
  {
    id: 1,
    title: "Family Activity Calendar Mobile View",
    author: "Amina B.",
    department: "HR",
    submitDate: "Oct 21, 2024",
    status: "Pending",
    feedback: "",
    summary:
      "Suggestion to provide a simpler mobile-friendly calendar for family and children activity planning.",
  },
  {
    id: 2,
    title: "Activity Reminder by SMS",
    author: "Karim M.",
    department: "Production",
    submitDate: "Oct 18, 2024",
    status: "Reviewed",
    feedback:
      "Thank you for your suggestion. The idea has been reviewed and recorded for internal consideration.",
    summary:
      "Proposal to send SMS reminders before registration deadlines and activity confirmation dates.",
  },
  {
    id: 3,
    title: "More Regional Family Events",
    author: "Nadia S.",
    department: "Finance",
    submitDate: "Oct 16, 2024",
    status: "Pending",
    feedback: "",
    summary:
      "Employees requested more family-oriented regional events outside the main site zones.",
  },
  {
    id: 4,
    title: "Digital Participation Certificate",
    author: "Yacine T.",
    department: "Operations",
    submitDate: "Oct 10, 2024",
    status: "Archived",
    feedback:
      "The proposal has been archived after internal review.",
    summary:
      "Idea to provide downloadable digital certificates for employees who join social activities.",
  },
];

export default function IdeaBoxModeration() {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [selectedId, setSelectedId] = useState(initialIdeas[0]?.id ?? null);

  const [modal, setModal] = useState({
    open: false,
    type: null, // details | reply | archive
    ideaId: null,
  });

  const [replyMessage, setReplyMessage] = useState("");

  const selectedIdea =
    ideas.find((item) => item.id === (modal.ideaId ?? selectedId)) || null;

  const totalCount = ideas.length;
  const pendingCount = ideas.filter((idea) => idea.status === "Pending").length;
  const reviewedCount = ideas.filter((idea) => idea.status === "Reviewed").length;
  const archivedCount = ideas.filter((idea) => idea.status === "Archived").length;

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      ideaId: null,
    });
    setReplyMessage("");
  };

  const openModal = (type, ideaId = selectedId) => {
    const idea = ideas.find((item) => item.id === ideaId);

    setModal({
      open: true,
      type,
      ideaId,
    });

    setReplyMessage(idea?.feedback || "");
  };

  const handleReply = (id) => {
    setIdeas((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              feedback: replyMessage,
              status: "Reviewed",
            }
          : item
      )
    );
    closeModal();
  };

  const handleArchive = (id) => {
    setIdeas((prev) =>
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
                    Idea Box Moderation
                  </h1>
                  <p className="text-[#7A8088] text-sm mt-2 max-w-[780px] leading-[170%]">
                    Review employee-submitted ideas, provide internal feedback when needed,
                    and archive suggestions after moderation.
                  </p>
                </div>

                <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors">
                  Export Ideas
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  title="Total Ideas"
                  value={totalCount}
                  subtitle="All submitted suggestions"
                />
                <StatCard
                  title="Pending"
                  value={pendingCount}
                  subtitle="Awaiting review"
                />
                <StatCard
                  title="Reviewed"
                  value={reviewedCount}
                  subtitle="Already checked by communicator"
                />
                <StatCard
                  title="Archived"
                  value={archivedCount}
                  subtitle="Closed suggestions"
                />
              </div>

              {/* Filters */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  Idea Filters
                </h2>
                <p className="text-sm text-[#7A8088] mt-1 mb-4">
                  Search by title and filter by status or department.
                </p>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Search idea title..."
                    className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>All statuses</option>
                  </select>

                  <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>All departments</option>
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
                        Idea Moderation List
                      </h3>
                      <p className="text-sm text-[#7A8088] mt-1">
                        Review submitted ideas and manage their moderation status.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                      {ideas.length} items
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px]">
                      <thead className="bg-[#FBFAF8]">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Idea
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Author
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Department
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Submit Date
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Status
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {ideas.map((item) => (
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

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {item.author}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {item.department}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {item.submitDate}
                            </td>

                            <td className="px-5 py-5">
                              <StatusBadge status={item.status} />
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => openModal("details", item.id)}
                                  className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                >
                                  View idea
                                </button>

                                {item.status !== "Archived" && (
                                  <button
                                    onClick={() => openModal("reply", item.id)}
                                    className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                  >
                                    Reply
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
                              </div>
                            </td>
                          </tr>
                        ))}

                        {ideas.length === 0 && (
                          <tr>
                            <td
                              colSpan="6"
                              className="px-5 py-10 text-center text-sm text-[#7A8088]"
                            >
                              No ideas available.
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
                      Moderation summary
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1 mb-4">
                      Current distribution of idea moderation statuses.
                    </p>

                    <div className="space-y-3">
                      <SummaryRow label="Pending" value={pendingCount} />
                      <SummaryRow label="Reviewed" value={reviewedCount} />
                      <SummaryRow label="Archived" value={archivedCount} />
                    </div>
                  </section>

                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Selected idea
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1 mb-4">
                      Quick summary of the currently selected employee suggestion.
                    </p>

                    {selectedId &&
                      ideas.find((item) => item.id === selectedId) && (
                        <div className="space-y-3">
                          <SummaryRow
                            label="Title"
                            value={ideas.find((item) => item.id === selectedId).title}
                          />
                          <SummaryRow
                            label="Author"
                            value={ideas.find((item) => item.id === selectedId).author}
                          />
                          <SummaryRow
                            label="Department"
                            value={
                              ideas.find((item) => item.id === selectedId).department
                            }
                          />
                          <SummaryRow
                            label="Status"
                            value={ideas.find((item) => item.id === selectedId).status}
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

      {modal.open && modal.type === "details" && selectedIdea && (
        <ModalShell title="Idea Details" onClose={closeModal}>
          <DetailRow label="Title" value={selectedIdea.title} />
          <DetailRow label="Author" value={selectedIdea.author} />
          <DetailRow label="Department" value={selectedIdea.department} />
          <DetailRow label="Submit Date" value={selectedIdea.submitDate} />
          <DetailRow label="Status" value={selectedIdea.status} />

          <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
            <p className="text-sm font-semibold text-[#2F343B] mb-2">
              Idea Summary
            </p>
            <p className="text-sm text-[#7A8088] leading-[170%]">
              {selectedIdea.summary}
            </p>
          </div>

          {selectedIdea.feedback && (
            <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
              <p className="text-sm font-semibold text-[#2F343B] mb-2">
                Feedback
              </p>
              <p className="text-sm text-[#7A8088] leading-[170%]">
                {selectedIdea.feedback}
              </p>
            </div>
          )}
        </ModalShell>
      )}

      {modal.open && modal.type === "reply" && selectedIdea && (
        <ReplyModal
          title="Write Feedback"
          message={replyMessage}
          setMessage={setReplyMessage}
          onCancel={closeModal}
          onConfirm={() => handleReply(selectedIdea.id)}
        />
      )}

      {modal.open && modal.type === "archive" && selectedIdea && (
        <ConfirmModal
          title="Archive Idea"
          message={`Do you want to archive "${selectedIdea.title}"?`}
          confirmLabel="Archive"
          onCancel={closeModal}
          onConfirm={() => handleArchive(selectedIdea.id)}
        />
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
    Pending: "bg-[#FFF4D6] text-[#B98900]",
    Reviewed: "bg-[#E7F0FF] text-[#3563B9]",
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
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[560px] shadow-lg">
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
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[430px] shadow-lg">
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

function ReplyModal({ title, message, setMessage, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[560px] shadow-lg">
        <h2 className="text-xl font-bold text-[#2F343B] mb-3">{title}</h2>
        <p className="text-sm text-[#7A8088] mb-4 leading-[170%]">
          Write internal feedback or a moderation note for this idea.
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full rounded-[14px] border border-[#E5E2DC] bg-[#F9F8F6] px-4 py-3 text-sm text-[#2F343B] outline-none resize-none"
          placeholder="Write your feedback..."
        />

        <div className="flex justify-end gap-3 mt-6">
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
            Save Reply
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