import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet } from "../../api";

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function actionStyle(action) {
  if (!action) return "bg-[#F1F0EC] text-[#7A8088]";
  if (action.includes("VALIDATED") || action.includes("ACCEPTED") || action.includes("PUBLISHED") || action.includes("APPROVED")) {
    return "bg-[#D4F4DD] text-[#2D7A4A]";
  }
  if (action.includes("REJECTED") || action.includes("DELETED") || action.includes("ARCHIVED") || action.includes("REMOVED")) {
    return "bg-[#FBE1E1] text-[#A93B3B]";
  }
  if (action.startsWith("DRAW")) return "bg-[#DAE7FB] text-[#2A52BE]";
  if (action.startsWith("ROLE")) return "bg-[#E7E5FB] text-[#5240A1]";
  if (action.startsWith("DOCUMENT")) return "bg-[#FFF4D6] text-[#B98900]";
  return "bg-[#F1F0EC] text-[#7A8088]";
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [filters, setFilters] = useState({ search: "", action: "all", target: "all" });
  const [detailsModal, setDetailsModal] = useState({ open: false, log: null });

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/system/audit-logs")
      .then((res) => setLogs(res.data || []))
      .catch((err) => setPageError(err.message || "Could not load audit logs."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const actions = useMemo(() => {
    const set = new Set();
    logs.forEach((l) => l.action && set.add(l.action));
    return Array.from(set).sort();
  }, [logs]);

  const targets = useMemo(() => {
    const set = new Set();
    logs.forEach((l) => l.target_table && set.add(l.target_table));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return logs.filter((l) => {
      if (filters.action !== "all" && l.action !== filters.action) return false;
      if (filters.target !== "all" && l.target_table !== filters.target) return false;
      if (q) {
        const hay = [
          l.action,
          l.target_name,
          l.user_first_name,
          l.user_last_name,
          l.employee_number,
          l.ip_address,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, filters]);

  return (
    <>
      <div className="flex h-screen bg-[#F7F7F5]">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopBar />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  Audit Log
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Trace of all sensitive actions performed by admins,
                  communicators and system admins. Last 500 entries shown.
                </p>
              </div>

              {pageError && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {pageError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total entries" value={logs.length} />
                <StatCard title="Distinct actions" value={actions.length} />
                <StatCard title="Distinct tables" value={targets.length} />
                <StatCard
                  title="Last entry"
                  value={
                    logs[0]?.action_date
                      ? formatDateTime(logs[0].action_date)
                      : "—"
                  }
                />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, search: e.target.value }))
                    }
                    placeholder="Search action, user, target name, IP..."
                    className="min-w-[260px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select
                    value={filters.action}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, action: e.target.value }))
                    }
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option value="all">All actions</option>
                    {actions.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.target}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, target: e.target.value }))
                    }
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option value="all">All target tables</option>
                    {targets.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      setFilters({ search: "", action: "all", target: "all" })
                    }
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B]"
                  >
                    Reset
                  </button>
                </div>
              </section>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Date
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          User
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Action
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Target
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          IP
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Details
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
                            Loading audit logs...
                          </td>
                        </tr>
                      )}

                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            No audit entries match the filters.
                          </td>
                        </tr>
                      )}

                      {filtered.map((l) => (
                        <tr key={l.id} className="border-t border-[#E5E2DC]">
                          <td className="px-5 py-4 text-sm text-[#7A8088] whitespace-nowrap">
                            {formatDateTime(l.action_date)}
                          </td>
                          <td className="px-5 py-4 text-sm text-[#2F343B]">
                            {l.user_first_name || l.user_last_name ? (
                              <>
                                <p className="font-semibold">
                                  {l.user_first_name} {l.user_last_name}
                                </p>
                                <p className="text-xs text-[#7A8088]">
                                  {l.employee_number}
                                </p>
                              </>
                            ) : (
                              <span className="text-[#7A8088] italic">
                                System
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${actionStyle(
                                l.action
                              )}`}
                            >
                              {l.action}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-[#2F343B]">
                            {l.target_name || (
                              <span className="text-[#7A8088] italic">—</span>
                            )}
                            {l.target_table && (
                              <p className="text-xs text-[#7A8088] mt-1">
                                {l.target_table}
                                {l.target_id ? ` #${l.target_id}` : ""}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-xs text-[#7A8088] whitespace-nowrap">
                            {l.ip_address || "—"}
                          </td>
                          <td className="px-5 py-4">
                            {l.details ? (
                              <button
                                onClick={() =>
                                  setDetailsModal({ open: true, log: l })
                                }
                                className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white"
                              >
                                View
                              </button>
                            ) : (
                              <span className="text-[#7A8088] text-xs">—</span>
                            )}
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

      {detailsModal.open && detailsModal.log && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDetailsModal({ open: false, log: null })}
        >
          <div
            className="bg-white rounded-[20px] p-6 w-full max-w-[520px] shadow-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              Action details
            </h2>
            <p className="text-sm text-[#7A8088] mb-3">
              {detailsModal.log.action} · {formatDateTime(detailsModal.log.action_date)}
            </p>
            <pre className="bg-[#F9F8F6] rounded-[12px] p-4 text-xs text-[#2F343B] overflow-x-auto">
              {JSON.stringify(detailsModal.log.details, null, 2)}
            </pre>
            <div className="flex justify-end mt-5">
              <button
                onClick={() => setDetailsModal({ open: false, log: null })}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{title}</p>
      <p className="text-2xl font-extrabold text-[#2F343B] mt-2 break-all">
        {value}
      </p>
    </div>
  );
}