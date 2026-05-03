import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPost } from "../../api";

const TYPES = [
  { value: "GENERAL", label: "General" },
  { value: "DRAW", label: "Draw" },
  { value: "CONFIRMATION", label: "Confirmation" },
  { value: "DOCUMENT", label: "Document" },
  { value: "SURVEY", label: "Survey" },
  { value: "WITHDRAWAL", label: "Withdrawal" },
  { value: "REASSIGNMENT", label: "Reassignment" },
];

const AUDIENCES = [
  { value: "ALL", label: "All users" },
  { value: "EMPLOYEES", label: "Employees only" },
  { value: "FUNCTIONAL_ADMIN", label: "Functional admins" },
  { value: "COMMUNICATOR", label: "Communicators" },
  { value: "SYSTEM_ADMIN", label: "System admins" },
];

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function ManageNotifications() {
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "GENERAL",
    audience: "EMPLOYEES",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/notifications/sent")
      .then((res) => setSent(res.data || []))
      .catch((err) => setPageError(err.message || "Could not load notifications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);

    if (!form.message.trim()) {
      setSubmitError("Message is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiPost("/notifications", {
        title: form.title.trim() || null,
        message: form.message.trim(),
        type: form.type,
        audience: form.audience,
      });
      setSuccess(`Notification sent to ${res.sent_count} recipient(s).`);
      setForm({ title: "", message: "", type: "GENERAL", audience: "EMPLOYEES" });
      load();
    } catch (err) {
      setSubmitError(err.message || "Could not send notification.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                Manage notifications
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                Send broadcast notifications to a target audience and review
                what has been sent recently.
              </p>
            </div>

            {pageError && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {pageError}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-6">
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5 h-fit">
                <h2 className="text-[22px] font-bold text-[#2F343B] mb-2">
                  Send notification
                </h2>
                <p className="text-sm text-[#7A8088] mb-4">
                  Pick the audience and write the message.
                </p>

                {success && (
                  <div className="rounded-[12px] border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm mb-3">
                    {success}
                  </div>
                )}

                {submitError && (
                  <div className="rounded-[12px] border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm mb-3">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, title: e.target.value }))
                      }
                      placeholder="e.g., Important update"
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                      Message *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, message: e.target.value }))
                      }
                      rows={5}
                      placeholder="Write the notification body..."
                      maxLength={5000}
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none"
                    />
                    <p className="text-xs text-[#7A8088] mt-1">
                      {form.message.length} / 5000
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                      Type
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, type: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                    >
                      {TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                      Audience *
                    </label>
                    <select
                      value={form.audience}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, audience: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                    >
                      {AUDIENCES.map((a) => (
                        <option key={a.value} value={a.value}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-4 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Send notification"}
                  </button>
                </form>
              </section>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DC]">
                  <h2 className="text-[22px] font-bold text-[#2F343B]">
                    Recently sent
                  </h2>
                  <p className="text-sm text-[#7A8088] mt-1">
                    Last 200 broadcasts. Open rate = how many recipients have
                    read it.
                  </p>
                </div>

                {loading && (
                  <p className="px-5 py-10 text-center text-sm text-[#7A8088]">
                    Loading...
                  </p>
                )}

                {!loading && sent.length === 0 && (
                  <p className="px-5 py-10 text-center text-sm text-[#7A8088]">
                    No notifications sent yet.
                  </p>
                )}

                <div className="divide-y divide-[#E5E2DC]">
                  {sent.map((n, i) => {
                    const recipients = Number(n.recipient_count || 0);
                    const reads = Number(n.read_count || 0);
                    const pct = recipients > 0 ? Math.round((reads / recipients) * 100) : 0;
                    return (
                      <div key={i} className="px-5 py-4">
                        <div className="flex justify-between items-start gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F1F0EC] text-[#7A8088]">
                            {n.type}
                          </span>
                          <span className="text-xs text-[#7A8088]">
                            {formatDateTime(n.created_at)}
                          </span>
                        </div>
                        {n.title && (
                          <p className="font-semibold text-[#2F343B] text-sm mb-1">
                            {n.title}
                          </p>
                        )}
                        <p className="text-sm text-[#2F343B] leading-[170%]">
                          {n.message}
                        </p>
                        <div className="mt-2 text-xs text-[#7A8088] flex flex-wrap gap-3">
                          <span>📨 {recipients} recipients</span>
                          <span>👁 {reads} read ({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
