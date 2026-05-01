import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { Link } from "react-router-dom";
import { publishAnnouncement } from "../../services/announcementService";
import {
  getCommunicatorAnnouncements,
  deleteAnnouncement,
} from "../../services/announcementService";

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState({
    open: false,
    type: null,
    announcementId: null,
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      setLoading(true);
      const data = await getCommunicatorAnnouncements();
      setAnnouncements(data);
      setSelectedId(data[0]?.id ?? null);
    } catch (err) {
      setError(err.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(id) {
    try {
      const updated = await publishAnnouncement(id);
  
      setAnnouncements((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      setError(err.message || "Failed to publish announcement");
    }
  }

  const selectedAnnouncement =
    announcements.find(
      (item) => item.id === (modal.announcementId ?? selectedId)
    ) || null;

  const totalCount = announcements.length;
  const draftCount = announcements.filter((a) => a.status === "DRAFT").length;
  const publishedCount = announcements.filter((a) => a.status === "PUBLISHED").length;
  const archivedCount = announcements.filter((a) => a.status === "ARCHIVED").length;

  const closeModal = () => {
    setModal({ open: false, type: null, announcementId: null });
  };

  const openModal = (type, announcementId = selectedId) => {
    setModal({ open: true, type, announcementId });
  };

  async function handleDelete(id) {
    try {
      await deleteAnnouncement(id);
      const next = announcements.filter((item) => item.id !== id);
      setAnnouncements(next);
      setSelectedId(next[0]?.id ?? null);
      closeModal();
    } catch (err) {
      setError(err.message || "Failed to delete announcement");
    }
  }

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

              {error && (
                <div className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total Announcements" value={totalCount} subtitle="All communication posts" />
                <StatCard title="Drafts" value={draftCount} subtitle="Not yet visible to employees" />
                <StatCard title="Published" value={publishedCount} subtitle="Currently visible announcements" />
                <StatCard title="Archived" value={archivedCount} subtitle="Past communication items" />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  Announcement Filters
                </h2>
                <p className="text-sm text-[#7A8088] mt-1 mb-4">
                  Backend connected. Filters can be added later if needed.
                </p>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
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
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">Title</th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">Publish Date</th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">Document</th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">Status</th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="5" className="px-5 py-10 text-center text-sm text-[#7A8088]">
                              Loading announcements...
                            </td>
                          </tr>
                        ) : (
                          announcements.map((item) => (
                            <tr
                              key={item.id}
                              className={`border-t border-[#E5E2DC] align-top ${
                                selectedId === item.id ? "bg-[#FCFBF9]" : ""
                              }`}
                            >
                              <td className="px-5 py-5">
                                <button onClick={() => setSelectedId(item.id)} className="text-left">
                                  <p className="font-semibold text-[#2F343B] text-sm">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-[#7A8088] mt-1 max-w-[320px]">
                                    {shortText(item.content)}
                                  </p>
                                </button>
                              </td>

                              <td className="px-5 py-5 text-sm text-[#7A8088]">
                                {formatDate(item)}
                              </td>

                              <td className="px-5 py-5 text-sm text-[#7A8088]">
                                {item.document_path ? "Attached" : "None"}
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

    {/* ✅ ADD THIS */}
    {item.status === "DRAFT" && (
      <button
        onClick={() => handlePublish(item.id)}
        className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm"
      >
        Publish
      </button>
    )}

    <button
      onClick={() => openModal("delete", item.id)}
      className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm"
    >
      Delete
    </button>

  </div>
</td>
                            </tr>
                          ))
                        )}

                        {!loading && announcements.length === 0 && (
                          <tr>
                            <td colSpan="5" className="px-5 py-10 text-center text-sm text-[#7A8088]">
                              No announcements available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

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
                        <SummaryRow label="Status" value={selectedAnnouncement.status} />
                        <SummaryRow label="Date" value={formatDate(selectedAnnouncement)} />
                        <SummaryRow label="Document" value={selectedAnnouncement.document_path ? "Attached" : "None"} />
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
          <DetailRow label="Publish Date" value={formatDate(selectedAnnouncement)} />
          <DetailRow label="Status" value={selectedAnnouncement.status} />
          <DetailRow label="Document" value={selectedAnnouncement.document_name || "No document"} />

          <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
            <p className="text-sm font-semibold text-[#2F343B] mb-2">Content</p>
            <p className="text-sm text-[#7A8088] leading-[170%] whitespace-pre-line">
              {selectedAnnouncement.content}
            </p>
          </div>
        </ModalShell>
      )}

      {modal.open && modal.type === "delete" && selectedAnnouncement && (
        <ConfirmModal
          title="Delete Announcement"
          message={`Do you want to delete "${selectedAnnouncement.title}"?`}
          confirmLabel="Delete"
          onCancel={closeModal}
          onConfirm={() => handleDelete(selectedAnnouncement.id)}
        />
      )}
    </>
  );
}

function formatDate(item) {
  return item.publish_date || item.created_at?.slice(0, 10) || "-";
}

function shortText(text, max = 120) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
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
    DRAFT: "bg-[#FFF4D6] text-[#B98900]",
    PUBLISHED: "bg-[#D4F4DD] text-[#2D7A4A]",
    ARCHIVED: "bg-[#F1F0EC] text-[#7A8088]",
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
          <button onClick={onClose} className="px-4 py-2 rounded-[12px] border border-[#E5E2DC]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg">
        <h2 className="text-xl font-bold text-[#2F343B] mb-3">{title}</h2>
        <p className="text-sm text-[#7A8088] mb-6 leading-[170%]">{message}</p>

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm">
            Cancel
          </button>

          <button onClick={onConfirm} className="px-4 py-2 rounded-[12px] bg-red-600 text-white text-sm font-medium">
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
        {value || "-"}
      </span>
    </div>
  );
}