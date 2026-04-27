import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPatch, getCurrentUserId } from "../../api";

const TYPE_STYLES = {
  DRAW: "bg-[#DAE7FB] text-[#2A52BE]",
  CONFIRMATION: "bg-[#D4F4DD] text-[#2D7A4A]",
  DOCUMENT: "bg-[#FFF4D6] text-[#B98900]",
  SURVEY: "bg-[#F7E6CC] text-[#A9651E]",
  WITHDRAWAL: "bg-[#FBE1E1] text-[#A93B3B]",
  REASSIGNMENT: "bg-[#E7E5FB] text-[#5240A1]",
  GENERAL: "bg-[#F1F0EC] text-[#7A8088]",
};

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [filter, setFilter] = useState("all");

  const userId = getCurrentUserId();

  const load = () => {
    if (!userId) {
      setLoading(false);
      setPageError("Please log in.");
      return;
    }
    setLoading(true);
    setPageError(null);
    apiGet(`/me/notifications?user_id=${userId}`)
      .then((res) => setNotifications(res.data || []))
      .catch((err) =>
        setPageError(err.message || "Could not load notifications.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [userId]);

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.is_read);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const stats = useMemo(
    () => ({
      total: notifications.length,
      unread: notifications.filter((n) => !n.is_read).length,
    }),
    [notifications]
  );

  const handleMarkRead = async (id) => {
    try {
      await apiPatch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      alert(err.message || "Could not mark as read.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiPatch(`/me/notifications/read-all?user_id=${userId}`);
      load();
    } catch (err) {
      alert(err.message || "Could not mark all as read.");
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-[900px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  Notifications
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Updates about draws, confirmations, documents and surveys.
                </p>
              </div>

              {stats.unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] bg-white text-sm text-[#2F343B] font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {pageError && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {pageError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard title="Total" value={stats.total} />
              <StatCard title="Unread" value={stats.unread} />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterChip
                value="all"
                label="All"
                active={filter === "all"}
                onClick={setFilter}
              />
              <FilterChip
                value="unread"
                label="Unread"
                active={filter === "unread"}
                onClick={setFilter}
              />
              {Object.keys(TYPE_STYLES).map((t) => (
                <FilterChip
                  key={t}
                  value={t}
                  label={t.charAt(0) + t.slice(1).toLowerCase()}
                  active={filter === t}
                  onClick={setFilter}
                />
              ))}
            </div>

            <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
              {loading && (
                <p className="px-5 py-10 text-center text-sm text-[#7A8088]">
                  Loading...
                </p>
              )}

              {!loading && filtered.length === 0 && (
                <p className="px-5 py-10 text-center text-sm text-[#7A8088]">
                  No notifications match this filter.
                </p>
              )}

              <div className="divide-y divide-[#E5E2DC]">
                {filtered.map((n) => (
                  <div
                    key={n.id}
                    className={`px-5 py-4 ${
                      !n.is_read ? "bg-[#FFFAF0]" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            TYPE_STYLES[n.type] || TYPE_STYLES.GENERAL
                          }`}
                        >
                          {n.type}
                        </span>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[#ED8D31]" />
                        )}
                      </div>
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
                    {n.activity_title && (
                      <p className="text-xs text-[#7A8088] mt-2">
                        About: {n.activity_title}
                      </p>
                    )}

                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-xs text-[#ED8D31] font-semibold mt-2"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
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

function FilterChip({ value, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active
          ? "bg-[#ED8D31] text-white border-[#ED8D31]"
          : "bg-white text-[#2F343B] border-[#E5E2DC]"
      }`}
    >
      {label}
    </button>
  );
}
