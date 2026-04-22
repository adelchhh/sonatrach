import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const initialNotifications = [
  {
    id: 1,
    title: "Draw Results Are Now Available",
    body: "Employees can now consult the latest draw results directly from their dashboard.",
    audience: "All Applicants",
    date: "2024-10-19",
    time: "09:00",
    status: "Sent",
  },
  {
    id: 2,
    title: "Upload Your Missing Documents Before October 20",
    body: "Please complete your required document uploads before the deadline to avoid request rejection.",
    audience: "Pending Applicants",
    date: "2024-10-18",
    time: "14:30",
    status: "Scheduled",
  },
  {
    id: 3,
    title: "New Winter Activities Are Open",
    body: "The new winter activity catalog is now available. Employees can browse and submit requests.",
    audience: "All Employees",
    date: "2024-10-15",
    time: "10:00",
    status: "Draft",
  },
  {
    id: 4,
    title: "Family Stay Confirmation Reminder",
    body: "Selected families are invited to confirm participation before places are reassigned.",
    audience: "Selected Families",
    date: "2024-10-11",
    time: "16:00",
    status: "Deleted",
  },
];

export default function ManageNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedId, setSelectedId] = useState(initialNotifications[0]?.id ?? null);

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    audience: "All Employees",
    date: "",
    time: "",
  });

  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
  });

  const [modal, setModal] = useState({
    open: false,
    type: null, // send | draft | schedule | delete
    notificationId: null,
  });

  const selectedNotification =
    notifications.find(
      (item) => item.id === (modal.notificationId ?? selectedId)
    ) || null;

  const selectedMessage =
    notifications.find((item) => item.id === selectedId) || null;

  const totalCount = notifications.length;
  const draftCount = notifications.filter((n) => n.status === "Draft").length;
  const sentCount = notifications.filter((n) => n.status === "Sent").length;
  const scheduledCount = notifications.filter((n) => n.status === "Scheduled").length;

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      notificationId: null,
    });
    setScheduleForm({
      date: "",
      time: "",
    });
  };

  const openModal = (type, notificationId = selectedId) => {
    const currentItem = notifications.find((item) => item.id === notificationId);

    setModal({
      open: true,
      type,
      notificationId,
    });

    if (type === "schedule" && currentItem) {
      setScheduleForm({
        date: currentItem.date || "",
        time: currentItem.time || "",
      });
    }
  };

  const resetEditor = () => {
    setFormData({
      title: "",
      body: "",
      audience: "All Employees",
      date: "",
      time: "",
    });
  };

  const handleSendEditorNow = () => {
    if (!formData.title || !formData.body) return;

    const newItem = {
      id: Date.now(),
      title: formData.title,
      body: formData.body,
      audience: formData.audience,
      date: formData.date || new Date().toISOString().slice(0, 10),
      time: formData.time || "Now",
      status: "Sent",
    };

    setNotifications((prev) => [newItem, ...prev]);
    setSelectedId(newItem.id);
    resetEditor();
  };

  const handleSaveDraft = () => {
    if (!formData.title || !formData.body) return;

    const newItem = {
      id: Date.now(),
      title: formData.title,
      body: formData.body,
      audience: formData.audience,
      date: formData.date || "",
      time: formData.time || "",
      status: "Draft",
    };

    setNotifications((prev) => [newItem, ...prev]);
    setSelectedId(newItem.id);
    resetEditor();
    closeModal();
  };

  const handleSendNow = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Sent",
            }
          : item
      )
    );
    closeModal();
  };

  const handleSchedule = (id) => {
    if (!scheduleForm.date || !scheduleForm.time) return;

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              date: scheduleForm.date,
              time: scheduleForm.time,
              status: "Scheduled",
            }
          : item
      )
    );
    closeModal();
  };

  const handleScheduleEditor = () => {
    if (!formData.title || !formData.body || !formData.date || !formData.time) return;

    const newItem = {
      id: Date.now(),
      title: formData.title,
      body: formData.body,
      audience: formData.audience,
      date: formData.date,
      time: formData.time,
      status: "Scheduled",
    };

    setNotifications((prev) => [newItem, ...prev]);
    setSelectedId(newItem.id);
    resetEditor();
  };

  const handleDelete = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Deleted" } : item
      )
    );
    closeModal();
  };

  const formatDateTime = (date, time) => {
    if (!date && !time) return "Not set";
    if (date && time) return `${date} · ${time}`;
    return date || time;
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
                    Manage Notifications
                  </h1>
                  <p className="text-[#7A8088] text-sm mt-2 max-w-[780px] leading-[170%]">
                    Create and manage manual broadcast messages for employees,
                    applicants, selected groups, and urgent communication needs
                    outside automatic system notifications.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  title="Total Messages"
                  value={totalCount}
                  subtitle="All manual broadcast messages"
                />
                <StatCard
                  title="Drafts"
                  value={draftCount}
                  subtitle="Prepared but not yet sent"
                />
                <StatCard
                  title="Sent"
                  value={sentCount}
                  subtitle="Already delivered broadcasts"
                />
                <StatCard
                  title="Scheduled"
                  value={scheduledCount}
                  subtitle="Waiting for planned sending"
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1.8fr_320px] gap-6">
                {/* Broadcast Editor */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h2 className="text-[24px] font-bold text-[#2F343B]">
                    Broadcast Editor
                  </h2>
                  <p className="text-sm text-[#7A8088] mt-1 mb-4">
                    Prepare a manual notification for a selected audience.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                        Message Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="Enter notification title..."
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                        Audience
                      </label>
                      <select
                        value={formData.audience}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, audience: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                      >
                        <option>All Employees</option>
                        <option>All Applicants</option>
                        <option>Pending Applicants</option>
                        <option>Selected Participants</option>
                        <option>Selected Families</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                          Scheduled Date
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, date: e.target.value }))
                          }
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                          Scheduled Time
                        </label>
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, time: e.target.value }))
                          }
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                        Message Body
                      </label>
                      <textarea
                        rows={7}
                        value={formData.body}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, body: e.target.value }))
                        }
                        placeholder="Write your broadcast message..."
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => openModal("draft")}
                        className="px-4 py-2.5 rounded-[12px] border border-[#E5E2DC] text-sm font-medium text-[#2F343B]"
                      >
                        Save draft
                      </button>

                      <button
                        onClick={handleScheduleEditor}
                        className="px-4 py-2.5 rounded-[12px] border border-[#E5E2DC] text-sm font-medium text-[#2F343B]"
                      >
                        Schedule
                      </button>

                      <button
                        onClick={handleSendEditorNow}
                        className="px-4 py-2.5 rounded-[12px] bg-[#ED8D31] text-white text-sm font-medium"
                      >
                        Send now
                      </button>
                    </div>
                  </div>
                </section>

                {/* Table */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                    <div>
                      <h3 className="text-[24px] font-bold text-[#2F343B]">
                        Broadcast Message List
                      </h3>
                      <p className="text-sm text-[#7A8088] mt-1">
                        Review manual notifications, statuses, and target audiences.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                      {notifications.length} items
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1040px]">
                      <thead className="bg-[#FBFAF8]">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Title
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Message Body
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Audience
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Date & Time
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
                        {notifications.map((item) => (
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
                              </button>
                            </td>

                            <td className="px-5 py-5">
                              <p className="text-xs text-[#7A8088] max-w-[320px]">
                                {item.body}
                              </p>
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {item.audience}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {formatDateTime(item.date, item.time)}
                            </td>

                            <td className="px-5 py-5">
                              <StatusBadge status={item.status} />
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex flex-wrap gap-2">
                                {item.status !== "Sent" && item.status !== "Deleted" && (
                                  <button
                                    onClick={() => openModal("send", item.id)}
                                    className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium"
                                  >
                                    Send now
                                  </button>
                                )}

                                {item.status !== "Deleted" &&
                                  item.status !== "Sent" &&
                                  item.status !== "Scheduled" && (
                                    <button
                                      onClick={() => openModal("schedule", item.id)}
                                      className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                    >
                                      Schedule
                                    </button>
                                  )}

                                {item.status !== "Deleted" && (
                                  <button
                                    onClick={() => openModal("delete", item.id)}
                                    className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}

                        {notifications.length === 0 && (
                          <tr>
                            <td
                              colSpan="6"
                              className="px-5 py-10 text-center text-sm text-[#7A8088]"
                            >
                              No broadcast messages available.
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
                      Overview of notification broadcast statuses.
                    </p>

                    <div className="space-y-3">
                      <SummaryRow label="Drafts" value={draftCount} />
                      <SummaryRow label="Sent" value={sentCount} />
                      <SummaryRow label="Scheduled" value={scheduledCount} />
                    </div>
                  </section>

                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Selected message
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1 mb-4">
                      Quick summary of the currently selected broadcast.
                    </p>

                    {selectedMessage && (
                      <div className="space-y-3">
                        <SummaryRow label="Title" value={selectedMessage.title} />
                        <SummaryRow label="Audience" value={selectedMessage.audience} />
                        <SummaryRow
                          label="Date & Time"
                          value={formatDateTime(selectedMessage.date, selectedMessage.time)}
                        />
                        <SummaryRow label="Status" value={selectedMessage.status} />
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {modal.open && modal.type === "send" && selectedNotification && (
        <ConfirmModal
          title="Send Broadcast Message"
          message={`Do you want to send "${selectedNotification.title}" now to ${selectedNotification.audience}?`}
          confirmLabel="Send now"
          onCancel={closeModal}
          onConfirm={() => handleSendNow(selectedNotification.id)}
        />
      )}

      {modal.open && modal.type === "delete" && selectedNotification && (
        <ConfirmModal
          title="Delete Broadcast Message"
          message={`Do you want to delete "${selectedNotification.title}"?`}
          confirmLabel="Delete"
          onCancel={closeModal}
          onConfirm={() => handleDelete(selectedNotification.id)}
        />
      )}

      {modal.open && modal.type === "draft" && (
        <ConfirmModal
          title="Save Draft"
          message="Do you want to save this broadcast as a draft?"
          confirmLabel="Save draft"
          onCancel={closeModal}
          onConfirm={handleSaveDraft}
        />
      )}

      {modal.open && modal.type === "schedule" && selectedNotification && (
        <ScheduleModal
          title="Schedule Broadcast"
          scheduleForm={scheduleForm}
          setScheduleForm={setScheduleForm}
          onCancel={closeModal}
          onConfirm={() => handleSchedule(selectedNotification.id)}
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
    Sent: "bg-[#D4F4DD] text-[#2D7A4A]",
    Scheduled: "bg-[#E7F0FF] text-[#3563B9]",
    Deleted: "bg-[#F1F0EC] text-[#7A8088]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
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

function ScheduleModal({
  title,
  scheduleForm,
  setScheduleForm,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[460px] shadow-lg">
        <h2 className="text-xl font-bold text-[#2F343B] mb-3">{title}</h2>
        <p className="text-sm text-[#7A8088] mb-5 leading-[170%]">
          Select the date and hour for this broadcast message.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#2F343B] mb-2">
              Date
            </label>
            <input
              type="date"
              value={scheduleForm.date}
              onChange={(e) =>
                setScheduleForm((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2F343B] mb-2">
              Time
            </label>
            <input
              type="time"
              value={scheduleForm.time}
              onChange={(e) =>
                setScheduleForm((prev) => ({ ...prev, time: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
            />
          </div>
        </div>

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
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}