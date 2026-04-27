import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { Link, useParams } from "react-router-dom";
import { apiGet, apiDelete } from "../../api";

const STATUS_LABEL = {
  DRAFT: "Draft",
  OPEN: "Open",
  CLOSED: "Closed",
  DRAW_DONE: "Draw done",
  FINISHED: "Finished",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES = {
  DRAFT: "bg-[#FFF4D6] text-[#B98900]",
  OPEN: "bg-[#D4F4DD] text-[#2D7A4A]",
  CLOSED: "bg-[#F1F0EC] text-[#7A8088]",
  DRAW_DONE: "bg-[#DAE7FB] text-[#2A52BE]",
  FINISHED: "bg-[#F1F0EC] text-[#7A8088]",
  CANCELLED: "bg-[#FBE1E1] text-[#A93B3B]",
};

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

export default function ManageSessions() {
  const { id } = useParams();

  const [activity, setActivity] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [modal, setModal] = useState({ open: false, sessionId: null });
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet(`/activities/${id}/sessions`)
      .then((res) => {
        setActivity(res.data.activity);
        setSessions(res.data.sessions || []);
      })
      .catch((err) => setPageError(err.message || "Failed to load sessions."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const closeModal = () => setModal({ open: false, sessionId: null });

  const handleDeleteSession = async () => {
    setDeleting(true);
    try {
      await apiDelete(`/sessions/${modal.sessionId}`);
      closeModal();
      load();
    } catch (err) {
      alert(err.message || "Failed to delete session.");
      closeModal();
    } finally {
      setDeleting(false);
    }
  };

  const totalSessions = sessions.length;
  const totalSites = sessions.reduce(
    (sum, s) => sum + Number(s.sites_count || 0),
    0
  );
  const totalQuota = sessions.reduce(
    (sum, s) => sum + Number(s.total_quota || 0),
    0
  );
  const upcomingDraw = sessions
    .filter((s) => s.draw_date && new Date(s.draw_date) >= new Date())
    .sort((a, b) => new Date(a.draw_date) - new Date(b.draw_date))[0];

  return (
    <>
      <div className="flex h-screen bg-[#F7F7F5]">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopBar />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="text-sm text-[#7A8088]">
                <Link
                  to="/dashboard/admin/activities"
                  className="text-[#ED8D31] font-medium"
                >
                  Manage Activities
                </Link>
                <span className="mx-2">›</span>
                <span className="text-[#2F343B] font-medium">
                  {activity ? activity.title : `Activity ${id}`}
                </span>
              </div>

              <div>
                <h1 className="text-[38px] font-extrabold text-[#2F343B] leading-[110%]">
                  Session Management
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 leading-[170%]">
                  Create and manage sessions, define draw dates, and configure
                  site allocations.
                </p>
              </div>

              {pageError && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {pageError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  title="Total Sessions"
                  value={totalSessions}
                  subtitle={activity ? `For ${activity.title}` : ""}
                />
                <StatCard
                  title="Assigned Sites"
                  value={totalSites}
                  subtitle="Across all sessions"
                />
                <StatCard
                  title="Total Quota"
                  value={totalQuota}
                  subtitle="Places available"
                />
                <StatCard
                  title="Next Draw"
                  value={upcomingDraw ? formatDate(upcomingDraw.draw_date) : "—"}
                  subtitle={upcomingDraw ? `Session #${upcomingDraw.id}` : "No upcoming draw"}
                />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                  <div>
                    <h2 className="text-[28px] font-bold text-[#2F343B]">
                      Sessions List
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Manage all sessions and their assigned sites for this
                      activity.
                    </p>
                  </div>

                  <Link
                    to={`/dashboard/admin/activities/${id}/sessions/create`}
                    className="px-4 py-2.5 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold inline-block"
                  >
                    + Add Session
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Session
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Dates (Start - End)
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Draw
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Sites / Quota
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
                      {loading && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            Loading sessions...
                          </td>
                        </tr>
                      )}

                      {!loading && sessions.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            No sessions yet for this activity. Click "Add Session"
                            to create one.
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        sessions.map((session, idx) => (
                          <tr
                            key={session.id}
                            className="border-t border-[#E5E2DC] align-top"
                          >
                            <td className="px-5 py-5">
                              <p className="font-semibold text-[#2F343B] text-sm">
                                Session #{session.id}
                              </p>
                              <p className="text-xs text-[#7A8088] mt-1">
                                {session.registrations_count} registration(s)
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <p className="text-sm font-medium text-[#2F343B]">
                                {formatDate(session.start_date)}
                              </p>
                              <p className="text-xs text-[#7A8088] mt-1">
                                → {formatDate(session.end_date)}
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <p className="text-sm font-medium text-[#2F343B]">
                                {formatDate(session.draw_date)}
                              </p>
                              <p className="text-xs text-[#7A8088] mt-1">
                                {session.draw_location || "—"}
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <p className="text-sm font-medium text-[#2F343B]">
                                {session.sites_count} site(s)
                              </p>
                              <p className="text-xs text-[#7A8088] mt-1">
                                Quota: {session.total_quota}
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <StatusBadge status={session.status} />
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex flex-wrap gap-2">
                                <Link
                                  to={`/dashboard/admin/activities/${id}/sessions/${session.id}`}
                                  className="w-9 h-9 rounded-lg border border-[#E5E2DC] bg-white text-[#7A8088] flex items-center justify-center"
                                  title="View session"
                                >
                                  👁
                                </Link>

                                <Link
                                  to={`/dashboard/admin/activities/${id}/sessions/${session.id}/edit`}
                                  className="w-9 h-9 rounded-lg border border-[#E5E2DC] bg-white text-[#7A8088] flex items-center justify-center"
                                  title="Edit session"
                                >
                                  ✎
                                </Link>

                                <button
                                  onClick={() =>
                                    setModal({
                                      open: true,
                                      sessionId: session.id,
                                    })
                                  }
                                  className="w-9 h-9 rounded-lg border border-[#F0B1B1] bg-white text-[#D85C5C]"
                                  title="Delete session"
                                >
                                  🗑
                                </button>

                                <Link
                                  to={`/dashboard/admin/activities/${id}/sessions/${session.id}/sites-quotas`}
                                  className="px-4 py-2 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-medium inline-block"
                                >
                                  Sites & Quotas
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[400px] shadow-lg">
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              Delete Session
            </h2>

            <p className="text-sm text-[#7A8088] mb-6">
              Are you sure you want to delete this session? This action cannot be
              undone, and will fail if registrations already exist.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={deleting}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteSession}
                disabled={deleting}
                className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-medium disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{title}</p>
      <p className="text-3xl font-extrabold text-[#2F343B] mt-2">{value}</p>
      {subtitle && (
        <p className="text-xs text-[#7A8088] mt-2">{subtitle}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || "bg-[#F1F0EC] text-[#7A8088]";
  const label = STATUS_LABEL[status] || status;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
