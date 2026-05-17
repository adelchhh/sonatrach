import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet } from "../../api";
import { useT } from "../../i18n/LanguageContext";

const STATUS_COLORS = {
  PENDING: "#F2B54A",
  VALIDATED: "#3FA56B",
  REJECTED: "#D85C5C",
  SELECTED: "#2A52BE",
  WAITING_LIST: "#ED8D31",
  CONFIRMED: "#2D7A4A",
  WITHDRAWN: "#7A8088",
  CANCELLED: "#7A8088",
};

function formatMonth(yyyymm) {
  if (!yyyymm) return "—";
  const [y, m] = yyyymm.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

export default function Reports() {
  const t = useT();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setPageError(null);
    apiGet("/reports/summary")
      .then((res) => setSummary(res.data))
      .catch((err) => setPageError(err.message || t("common.serverError")))
      .finally(() => setLoading(false));
  }, []);

  const monthly = summary?.monthly_applications || [];
  const maxMonthly = useMemo(
    () => Math.max(1, ...monthly.map((m) => Number(m.count))),
    [monthly]
  );

  const totalRegistrations = useMemo(() => {
    if (!summary?.status_breakdown) return 0;
    return summary.status_breakdown.reduce(
      (s, r) => s + Number(r.count || 0),
      0
    );
  }, [summary]);

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                {t("admin.reports.title")}
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                {t("admin.reports.subtitle")}
              </p>
            </div>

            {pageError && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {pageError}
              </div>
            )}

            {loading && (
              <div className="rounded-[14px] border border-[#E5E2DC] bg-white p-8 text-center text-sm text-[#7A8088]">
                {t("admin.reports.loading")}
              </div>
            )}

            {!loading && summary && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                  <StatCard label={t("admin.reports.statUsers")} value={summary.totals.total_users} />
                  <StatCard label={t("admin.reports.statActivities")} value={summary.totals.total_activities} />
                  <StatCard label={t("admin.reports.statSessions")} value={summary.totals.total_sessions} />
                  <StatCard label={t("admin.reports.statRegistrations")} value={summary.totals.total_registrations} />
                  <StatCard label={t("admin.reports.statDocuments")} value={summary.totals.total_documents} />
                  <StatCard label={t("admin.reports.statDraws")} value={summary.totals.executed_draws} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-6">
                    <h2 className="text-[20px] font-bold text-[#2F343B] mb-4">
                      {t("admin.reports.monthlyTitle")}
                    </h2>
                    {monthly.length === 0 ? (
                      <p className="text-sm text-[#7A8088]">{t("admin.reports.noData")}</p>
                    ) : (
                      <div className="flex items-end gap-2 h-[220px]">
                        {monthly.map((m) => {
                          const pct = (Number(m.count) / maxMonthly) * 100;
                          return (
                            <div key={m.month} className="flex-1 flex flex-col items-center">
                              <div
                                className="w-full bg-[#ED8D31] rounded-t-md flex items-end justify-center text-white text-xs font-medium pb-1 transition-all"
                                style={{ height: `${Math.max(pct, 4)}%` }}
                              >
                                {m.count}
                              </div>
                              <p className="text-xs text-[#7A8088] mt-2">
                                {formatMonth(m.month)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-6">
                    <h2 className="text-[20px] font-bold text-[#2F343B] mb-4">
                      {t("admin.reports.outcomesTitle")}
                    </h2>
                    {totalRegistrations === 0 ? (
                      <p className="text-sm text-[#7A8088]">{t("admin.reports.noData")}</p>
                    ) : (
                      <div className="space-y-3">
                        {summary.status_breakdown.map((row) => {
                          const count = Number(row.count);
                          const pct = totalRegistrations > 0
                            ? Math.round((count / totalRegistrations) * 100)
                            : 0;
                          const color = STATUS_COLORS[row.status] || "#7A8088";
                          return (
                            <div key={row.status}>
                              <div className="flex justify-between text-sm">
                                <span className="text-[#2F343B] font-medium">
                                  {t(`statuses.${row.status}`) || row.status}
                                </span>
                                <span className="text-[#7A8088]">
                                  {count} ({pct}%)
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-[#F1F0EC] mt-1">
                                <div
                                  className="h-2 rounded-full"
                                  style={{ width: `${pct}%`, background: color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[20px] font-bold text-[#2F343B]">
                      {t("admin.reports.performanceTitle")}
                    </h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-[#FBFAF8]">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.reports.performanceCol.activity")}</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.reports.performanceCol.category")}</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.reports.performanceCol.totalQuota")}</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.reports.performanceCol.applications")}</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.reports.performanceCol.approved")}</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.reports.performanceCol.approvalRate")}</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.reports.performanceCol.status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.activity_performance.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-5 py-8 text-center text-sm text-[#7A8088]">
                              {t("admin.reports.noActivities")}
                            </td>
                          </tr>
                        ) : (
                          summary.activity_performance.map((row) => (
                            <tr key={row.id} className="border-t border-[#E5E2DC]">
                              <td className="px-5 py-3 text-sm font-semibold text-[#2F343B]">{row.title}</td>
                              <td className="px-5 py-3 text-sm text-[#7A8088]">{row.category}</td>
                              <td className="px-5 py-3 text-sm text-[#2F343B]">{row.total_quota}</td>
                              <td className="px-5 py-3 text-sm text-[#2F343B]">{row.total_applications}</td>
                              <td className="px-5 py-3 text-sm text-[#2F343B]">{row.approved_count}</td>
                              <td className="px-5 py-3 text-sm font-semibold text-[#2D7A4A]">{row.approval_rate}%</td>
                              <td className="px-5 py-3 text-xs uppercase font-semibold text-[#7A8088]">{t(`statuses.${row.status}`) || row.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-6">
                    <h2 className="text-[18px] font-bold text-[#2F343B] mb-4">
                      {t("admin.reports.withdrawals")}
                    </h2>
                    {summary.withdrawals_breakdown.length === 0 ? (
                      <p className="text-sm text-[#7A8088]">{t("admin.reports.noWithdrawals")}</p>
                    ) : (
                      <ul className="space-y-2">
                        {summary.withdrawals_breakdown.map((w) => (
                          <li key={w.status} className="flex justify-between text-sm bg-[#F9F8F6] px-3 py-2 rounded-lg">
                            <span className="text-[#2F343B] font-medium">{t(`statuses.${w.status}`) || w.status}</span>
                            <span className="text-[#7A8088]">{w.count}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-6">
                    <h2 className="text-[18px] font-bold text-[#2F343B] mb-4">
                      {t("admin.reports.documents")}
                    </h2>
                    {summary.documents_breakdown.length === 0 ? (
                      <p className="text-sm text-[#7A8088]">{t("admin.reports.noDocuments")}</p>
                    ) : (
                      <ul className="space-y-2">
                        {summary.documents_breakdown.map((d) => (
                          <li key={d.status} className="flex justify-between text-sm bg-[#F9F8F6] px-3 py-2 rounded-lg">
                            <span className="text-[#2F343B] font-medium">{t(`statuses.${d.status}`) || d.status}</span>
                            <span className="text-[#7A8088]">{d.count}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-4">
      <p className="text-xs font-semibold text-[#7A8088] uppercase">{label}</p>
      <p className="text-2xl font-extrabold text-[#2F343B] mt-2">{value}</p>
    </div>
  );
}
