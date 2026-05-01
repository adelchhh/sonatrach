import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import {
  createNotification,
  getSentNotifications,
} from "../../services/notificationService";

export default function ManageNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({
    title: "",
    message: "",
  });

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);

      const response = await getSentNotifications();
      const data = Array.isArray(response)
        ? response
        : response.data || response.notifications || [];

      setNotifications(data);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSend() {
    if (!form.title.trim() || !form.message.trim()) {
      setError("Title and message are required.");
      return;
    }

    try {
      setSending(true);
      setError("");

      await createNotification({
        title: form.title,
        message: form.message,
      });

      setForm({
        title: "",
        message: "",
      });

      await loadNotifications();
    } catch (err) {
      setError(err.message || "Failed to send notification");
    } finally {
      setSending(false);
    }
  }

  const totalCount = notifications.length;
  const generalCount = notifications.filter((n) => n.type === "GENERAL").length;
  const surveyCount = notifications.filter((n) => n.type === "SURVEY").length;
  const announcementCount = notifications.filter(
    (n) => n.type === "ANNOUNCEMENT"
  ).length;

  return (
    <>
      <div className="flex h-screen bg-[#F7F7F5]">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopBar />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-[#ED8D31] mb-2">
                  Communicateur tools
                </p>

                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  Manage Notifications
                </h1>

                <p className="text-[#7A8088] text-sm mt-2 max-w-[780px] leading-[170%]">
                  Create global employee notifications and review previously
                  sent communication alerts.
                </p>
              </div>

              {error && (
                <div className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Sent" value={totalCount} />
                <StatCard title="General" value={generalCount} />
                <StatCard title="Survey" value={surveyCount} />
                <StatCard title="Announcement" value={announcementCount} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h2 className="text-[24px] font-bold text-[#2F343B]">
                    Send Notification
                  </h2>

                  <p className="text-sm text-[#7A8088] mt-1 mb-5">
                    This notification will be visible to all employees.
                  </p>

                  <div className="space-y-5">
                    <Field label="Notification title">
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="Enter notification title..."
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                      />
                    </Field>

       

                    <Field label="Message">
                      <textarea
                        value={form.message}
                        onChange={(e) =>
                          handleChange("message", e.target.value)
                        }
                        rows={7}
                        placeholder="Write the notification message..."
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none"
                      />
                    </Field>

                    <button
                      onClick={handleSend}
                      disabled={sending}
                      className="w-full px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors disabled:opacity-60"
                    >
                      {sending ? "Sending..." : "Send Notification"}
                    </button>
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                    <div>
                      <h2 className="text-[24px] font-bold text-[#2F343B]">
                        Sent Notifications
                      </h2>

                      <p className="text-sm text-[#7A8088] mt-1">
                        Previously created global notifications.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                      {notifications.length} items
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                      <thead className="bg-[#FBFAF8]">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Title
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Message
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Type
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Sent Date
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {loading ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="px-5 py-10 text-center text-sm text-[#7A8088]"
                            >
                              Loading notifications...
                            </td>
                          </tr>
                        ) : (
                          notifications.map((item) => (
                            <tr
                              key={item.id}
                              className="border-t border-[#E5E2DC] align-top"
                            >
                              <td className="px-5 py-5">
                                <p className="font-semibold text-[#2F343B] text-sm">
                                  {item.title}
                                </p>
                              </td>

                              <td className="px-5 py-5 text-sm text-[#7A8088] max-w-[360px]">
                                {shortText(item.message)}
                              </td>

                              <td className="px-5 py-5">
                                <TypeBadge type={item.type} />
                              </td>

                              <td className="px-5 py-5 text-sm text-[#7A8088]">
                                {formatDate(item)}
                              </td>
                            </tr>
                          ))
                        )}

                        {!loading && notifications.length === 0 && (
                          <tr>
                            <td
                              colSpan="4"
                              className="px-5 py-10 text-center text-sm text-[#7A8088]"
                            >
                              No notifications sent yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

function formatDate(item) {
  return item.created_at?.slice(0, 10) || "-";
}

function shortText(text, max = 120) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{title}</p>
      <p className="text-3xl font-extrabold text-[#2F343B] mt-2">{value}</p>
    </div>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F0EC] text-[#7A8088]">
      {type}
    </span>
  );
}