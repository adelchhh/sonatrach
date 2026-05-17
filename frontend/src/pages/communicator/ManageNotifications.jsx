import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { createNotification, getSentNotifications } from "../../services/notificationService";
import { useT } from "../../i18n/LanguageContext";

export default function ManageNotifications() {
  const t = useT();
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ title: "", message: "" });
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
      const data = Array.isArray(response) ? response : response.data || response.notifications || [];
      setNotifications(data);
    } catch (err) {
      setError(err.message || t("communicator.notifications.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSend() {
    if (!form.title.trim() || !form.message.trim()) {
      setError(t("communicator.notifications.requiredFields"));
      return;
    }

    try {
      setSending(true);
      setError("");
      await createNotification({ title: form.title, message: form.message });
      setForm({ title: "", message: "" });
      await loadNotifications();
    } catch (err) {
      setError(err.message || t("communicator.notifications.sendFailed"));
    } finally {
      setSending(false);
    }
  }

  const totalCount = notifications.length;
  const generalCount = notifications.filter((n) => n.type === "GENERAL").length;
  const surveyCount = notifications.filter((n) => n.type === "SURVEY").length;
  const announcementCount = notifications.filter((n) => n.type === "ANNOUNCEMENT").length;

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
                  {t("dashboard.sidebar.communicatorTools")}
                </p>
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  {t("communicator.notifications.title")}
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[780px] leading-[170%]">
                  {t("communicator.notifications.subtitle")}
                </p>
              </div>

              {error && (
                <div className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title={t("communicator.notifications.statTotal")} value={totalCount} />
                <StatCard title={t("communicator.notifications.statGeneral")} value={generalCount} />
                <StatCard title={t("communicator.notifications.statSurvey")} value={surveyCount} />
                <StatCard title={t("communicator.notifications.statAnnouncement")} value={announcementCount} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h2 className="text-[24px] font-bold text-[#2F343B]">
                    {t("communicator.notifications.panelSend")}
                  </h2>
                  <p className="text-sm text-[#7A8088] mt-1 mb-5">
                    {t("communicator.notifications.panelSendSub")}
                  </p>

                  <div className="space-y-5">
                    <Field label={t("communicator.notifications.titleField")}>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder={t("communicator.notifications.titlePlaceholder")}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                      />
                    </Field>

                    <Field label={t("communicator.notifications.messageField")}>
                      <textarea
                        value={form.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        rows={7}
                        placeholder={t("communicator.notifications.messagePlaceholder")}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none"
                      />
                    </Field>

                    <button
                      onClick={handleSend}
                      disabled={sending}
                      className="w-full px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors disabled:opacity-60"
                    >
                      {sending ? t("communicator.notifications.sending") : t("communicator.notifications.send")}
                    </button>
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                    <div>
                      <h2 className="text-[24px] font-bold text-[#2F343B]">
                        {t("communicator.notifications.panelHistory")}
                      </h2>
                      <p className="text-sm text-[#7A8088] mt-1">
                        {t("communicator.notifications.panelHistorySub")}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                      {notifications.length}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                      <thead className="bg-[#FBFAF8]">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("communicator.notifications.col.title")}</th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("communicator.notifications.col.message")}</th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("communicator.notifications.col.type")}</th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("communicator.notifications.col.sent")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="4" className="px-5 py-10 text-center text-sm text-[#7A8088]">
                              {t("communicator.common.loading")}
                            </td>
                          </tr>
                        ) : (
                          notifications.map((item) => (
                            <tr key={item.id} className="border-t border-[#E5E2DC] align-top">
                              <td className="px-5 py-5">
                                <p className="font-semibold text-[#2F343B] text-sm">{item.title}</p>
                              </td>
                              <td className="px-5 py-5 text-sm text-[#7A8088] max-w-[360px]">
                                {shortText(item.message)}
                              </td>
                              <td className="px-5 py-5">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F0EC] text-[#7A8088]">
                                  {t(`notificationTypes.${item.type}`) || item.type}
                                </span>
                              </td>
                              <td className="px-5 py-5 text-sm text-[#7A8088]">
                                {formatDate(item)}
                              </td>
                            </tr>
                          ))
                        )}

                        {!loading && notifications.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-5 py-10 text-center text-sm text-[#7A8088]">
                              {t("communicator.notifications.empty")}
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
