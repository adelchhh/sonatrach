import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { Link } from "react-router-dom";

const initialAnnouncements = [
  {
    id: 1,
    title: "Winter Activities Registration Open",
    category: "Campaign",
    audience: "All Employees",
    publishDate: "Oct 15, 2024",
    status: "Published",
    summary:
      "Registrations are now open for winter activities. Employees can browse the catalog and submit requests before the deadline.",
  },
  {
    id: 2,
    title: "Important Update for Omra Participants",
    category: "Information",
    audience: "Selected Participants",
    publishDate: "Oct 18, 2024",
    status: "Draft",
    summary:
      "Participants selected for Omra must complete their document uploads before the end of the week.",
  },
  {
    id: 3,
    title: "Draw Results Published",
    category: "Results",
    audience: "Applicants",
    publishDate: "Oct 10, 2024",
    status: "Published",
    summary:
      "The latest draw results are now available in the employee dashboard. Applicants can check their status directly.",
  },
  {
    id: 4,
    title: "Family Stay Reminder",
    category: "Reminder",
    audience: "Families",
    publishDate: "Oct 08, 2024",
    status: "Archived",
    summary:
      "Reminder to complete final confirmations for the family stay campaign before seats are reassigned.",
  },
];

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [selectedId, setSelectedId] = useState(initialAnnouncements[0]?.id ?? null);

  const [modal, setModal] = useState({
    open: false,
    type: null, // details | publish | archive | export
    announcementId: null,
  });

  const selectedAnnouncement =
    announcements.find(
      (item) => item.id === (modal.announcementId ?? selectedId)
    ) || null;

  const totalCount = announcements.length;
  const draftCount = announcements.filter((a) => a.status === "Draft").length;
  const publishedCount = announcements.filter((a) => a.status === "Published").length;
  const archivedCount = announcements.filter((a) => a.status === "Archived").length;

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      announcementId: null,
    });
  };

  const openModal = (type, announcementId = selectedId) => {
    setModal({
      open: true,
      type,
      announcementId,
    });
  };

  const handlePublish = (id) => {
    setAnnouncements((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Published" } : item
      )
    );
    closeModal();
  };

  const handleArchive = (id) => {
    setAnnouncements((prev) =>
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
                    Communicateur tools
                  </p>
                  <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                    Manage Announcements
                  </h1>
                  <p className="text-[#7A8088] text-sm mt-2 max-w-[780px] leading-[170%]">
                    Create, publish, and archive employee-facing announcements
                    related to activities, draw results, reminders, and updates.
                  </p>
                </div>

                <Link
  to="/dashboard/communicator/announcements/create"
  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
>
  Create Announcement
</Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  title="Total Announcements"
                  value={totalCount}
                  subtitle="All communication posts"
                />
                <StatCard
                  title="Drafts"
                  value={draftCount}
                  subtitle="Not yet visible to employees"
                />
                <StatCard
                  title="Published"
                  value={publishedCount}
                  subtitle="Currently visible announcements"
                />
                <StatCard
                  title="Archived"
                  value={archivedCount}
                  subtitle="Past communication items"
                />
              </div>

              {/* Filters */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  Announcement Filters
                </h2>
                <p className="text-sm text-[#7A8088] mt-1 mb-4">
                  Search by title and filter announcements by category, audience, or status.
                </p>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Search announcement title..."
                    className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>All categories</option>
                  </select>

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
                        Announcement List
                      </h3>
                      <p className="text-sm text-[#7A8088] mt-1">
                        Review published, draft, and archived announcements.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                      {announcements.length} items
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px]">
                      <thead className="bg-[#FBFAF8]">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Title
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Category
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Audience
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Publish Date
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
                        {announcements.map((item) => (
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
                                <p className="text-xs text-[#7A8088] mt-1 max-w-[320px]">
                                  {item.summary}
                                </p>
                              </button>
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {item.category}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {item.audience}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {item.publishDate}
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
                              </div>
                            </td>
                          </tr>
                        ))}

                        {announcements.length === 0 && (
                          <tr>
                            <td
                              colSpan="6"
                              className="px-5 py-10 text-center text-sm text-[#7A8088]"
                            >
                              No announcements available.
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
                      Current distribution of announcement statuses.
                    </p>

                    <div className="space-y-3">
                      <SummaryRow label="Drafts" value={draftCount} />
                      <SummaryRow label="Published" value={publishedCount} />
                      <SummaryRow label="Archived" value={archivedCount} />
                    </div>
                  </section>

                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Selected announcement
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1 mb-4">
                      Quick summary of the currently selected communication item.
                    </p>

                    {selectedAnnouncement && (
                      <div className="space-y-3">
                        <SummaryRow label="Title" value={selectedAnnouncement.title} />
                        <SummaryRow label="Category" value={selectedAnnouncement.category} />
                        <SummaryRow label="Audience" value={selectedAnnouncement.audience} />
                        <SummaryRow label="Status" value={selectedAnnouncement.status} />
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {modal.open && modal.type === "details" && selectedAnnouncement && (
        <ModalShell title="Announcement Details" onClose={closeModal}>
          <DetailRow label="Title" value={selectedAnnouncement.title} />
          <DetailRow label="Category" value={selectedAnnouncement.category} />
          <DetailRow label="Audience" value={selectedAnnouncement.audience} />
          <DetailRow label="Publish Date" value={selectedAnnouncement.publishDate} />
          <DetailRow label="Status" value={selectedAnnouncement.status} />

          <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
            <p className="text-sm font-semibold text-[#2F343B] mb-2">
              Summary
            </p>
            <p className="text-sm text-[#7A8088] leading-[170%]">
              {selectedAnnouncement.summary}
            </p>
          </div>
        </ModalShell>
      )}

      {modal.open && modal.type === "publish" && selectedAnnouncement && (
        <ConfirmModal
          title="Publish Announcement"
          message={`Do you want to publish "${selectedAnnouncement.title}" for ${selectedAnnouncement.audience}?`}
          confirmLabel="Publish"
          onCancel={closeModal}
          onConfirm={() => handlePublish(selectedAnnouncement.id)}
        />
      )}

      {modal.open && modal.type === "archive" && selectedAnnouncement && (
        <ConfirmModal
          title="Archive Announcement"
          message={`Do you want to archive "${selectedAnnouncement.title}"?`}
          confirmLabel="Archive"
          onCancel={closeModal}
          onConfirm={() => handleArchive(selectedAnnouncement.id)}
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