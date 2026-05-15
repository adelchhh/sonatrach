import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Download } from "lucide-react";
import { API_BASE_URL, apiGet } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  DataPanel,
  Alert,
  Button,
} from "../../components/ui/Studio";

const DONUT_COLORS = [
  "#0A0A0A",
  "#ED8D31",
  "#525252",
  "#737373",
  "#A3A3A3",
  "#C4C4C4",
  "#E5E5E5",
  "#F5F5F5",
];

function formatMonth(yyyymm) {
  if (!yyyymm) return "";
  const [y, m] = yyyymm.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d
    .toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })
    .toUpperCase();
}

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#0A0A0A] text-white px-3 py-2 shadow-2xl">
      {label && (
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#A3A3A3] mb-1">
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <p key={i} className="text-[13px] font-bold tabular-nums">
          {p.name && (
            <span className="text-[#A3A3A3] font-medium mr-2">{p.name}:</span>
          )}
          {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const t = useT();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const STATUS_LABEL = {
    PENDING: t("statuses.PENDING"),
    VALIDATED: t("statuses.VALIDATED"),
    REJECTED: t("statuses.REJECTED"),
    SELECTED: t("statuses.SELECTED"),
    WAITING_LIST: t("statuses.WAITING_LIST"),
    CONFIRMED: t("statuses.CONFIRMED"),
    WITHDRAWN: t("statuses.WITHDRAWN"),
    CANCELLED: t("statuses.CANCELLED"),
  };

  useEffect(() => {
    setLoading(true);
    setPageError(null);
    apiGet("/reports/summary")
      .then((res) => setSummary(res.data))
      .catch((err) =>
        setPageError(err.message || "Impossible de charger les rapports.")
      )
      .finally(() => setLoading(false));
  }, []);

  const monthly = useMemo(
    () =>
      (summary?.monthly_applications || []).map((m) => ({
        month: formatMonth(m.month),
        count: Number(m.count),
      })),
    [summary]
  );

  const statusData = useMemo(
    () =>
      (summary?.status_breakdown || []).map((s) => ({
        name: STATUS_LABEL[s.status] || s.status,
        value: Number(s.count),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [summary]
  );

  const totalRegistrations = useMemo(
    () => statusData.reduce((sum, s) => sum + s.value, 0),
    [statusData]
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.administration")}
        title={t("sg.reports")}
        subtitle={
          t("admin.reports.subtitle") === "admin.reports.subtitle"
            ? null
            : t("admin.reports.subtitle")
        }
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("sg.reports") },
        ]}
        actions={
          <>
            <a
              href={`${API_BASE_URL}/export/registrations.csv`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[11px] uppercase tracking-[0.15em] font-bold text-[#0A0A0A] transition-colors"
            >
              <Download size={13} strokeWidth={2.2} />
              {t("sg.exportRegistrations")}
            </a>
            <a
              href={`${API_BASE_URL}/export/draws.csv`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[11px] uppercase tracking-[0.15em] font-bold text-[#0A0A0A] transition-colors"
            >
              <Download size={13} strokeWidth={2.2} />
              {t("sg.exportDraws")}
            </a>
            <a
              href={`${API_BASE_URL}/export/audit-log.csv`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-white hover:bg-black text-[11px] uppercase tracking-[0.15em] font-bold transition-colors"
            >
              <Download size={13} strokeWidth={2.2} />
              {t("sg.exportAuditLog")}
            </a>
          </>
        }
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        {loading && (
          <div className="border border-[#E5E5E5] bg-white p-14 text-center text-[13px] text-[#737373]">
            {t("sg.loading")}
          </div>
        )}

        {!loading && summary && (
          <>
            <StatBar>
              <StatCell label={t("admin.reports.statUsers")} value={Number(summary.totals.total_users)} sub={t("sg.active")} />
              <StatCell label={t("sg.activities")} value={Number(summary.totals.total_activities)} sub={t("sg.allStatuses")} />
              <StatCell label={t("sg.sessions")} value={Number(summary.totals.total_sessions)} sub={t("sg.allStatuses")} />
              <StatCell label={t("sg.registrations")} value={Number(summary.totals.total_registrations)} sub={t("sg.total")} />
              <StatCell label={t("sg.documents")} value={Number(summary.totals.total_documents)} sub={t("admin.documents.statTotal")} />
              <StatCell label={t("admin.drawHistory.title") || "Tirages"} value={Number(summary.totals.executed_draws)} sub={t("sg.executed")} accent />
            </StatBar>

            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
              <DataPanel
                title={t("sg.monthlyApplications")}
                subtitle={t("admin.reports.monthlySubtitle") === "admin.reports.monthlySubtitle" ? "" : t("admin.reports.monthlySubtitle")}
              >
                {monthly.length === 0 ? (
                  <div className="p-8 text-[13px] text-[#737373]">
                    {t("sg.empty")}
                  </div>
                ) : (
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={monthly}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          stroke="#F5F5F5"
                          strokeDasharray="0"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#737373",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                          }}
                          dy={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#A3A3A3",
                            fontSize: 11,
                          }}
                          width={28}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(237,141,49,0.05)" }}
                          content={<TooltipBox />}
                        />
                        <Bar
                          dataKey="count"
                          fill="#0A0A0A"
                          radius={[0, 0, 0, 0]}
                          maxBarSize={42}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </DataPanel>

              <DataPanel
                title={t("sg.registrations") + " — " + t("sg.summary")}
                subtitle=""
              >
                {totalRegistrations === 0 ? (
                  <div className="p-8 text-[13px] text-[#737373]">
                    {t("sg.empty")}
                  </div>
                ) : (
                  <div className="p-6 flex flex-col lg:flex-row items-center gap-4">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                          strokeWidth={0}
                        >
                          {statusData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<TooltipBox />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <ul className="flex-1 space-y-2 w-full">
                      {statusData.map((s, i) => {
                        const pct = totalRegistrations
                          ? Math.round((s.value / totalRegistrations) * 100)
                          : 0;
                        return (
                          <li
                            key={s.name}
                            className="flex items-center gap-3 text-[12px]"
                          >
                            <span
                              className="w-2.5 h-2.5 flex-shrink-0"
                              style={{
                                background:
                                  DONUT_COLORS[i % DONUT_COLORS.length],
                              }}
                            />
                            <span className="text-[#0A0A0A] uppercase tracking-wider font-bold text-[10px] flex-1 truncate">
                              {s.name}
                            </span>
                            <span className="text-[#737373] tabular-nums">
                              {s.value}
                            </span>
                            <span className="text-[#A3A3A3] tabular-nums w-9 text-right">
                              {pct}%
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </DataPanel>
            </div>

            <DataPanel
              title={t("sg.activities") + " — Performance"}
              subtitle=""
              badge={`${summary.activity_performance.length}`}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-[#0A0A0A]">
                    <tr>
                      {[
                        t("sg.activities"),
                        t("admin.activities.col.category"),
                        t("admin.sessions.statQuota"),
                        t("sg.registrations"),
                        t("sg.validated"),
                        "Taux",
                        t("common.status"),
                      ].map((h, i) => (
                        <th
                          key={i}
                          className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.activity_performance.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                          {t("sg.empty")}
                        </td>
                      </tr>
                    ) : (
                      summary.activity_performance.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
                        >
                          <td className="px-6 py-4 text-[14px] font-bold text-[#0A0A0A]">
                            {row.title}
                          </td>
                          <td className="px-6 py-4 text-[11px] uppercase tracking-wider text-[#525252]">
                            {row.category}
                          </td>
                          <td className="px-6 py-4 text-[13px] font-bold tabular-nums text-[#0A0A0A]">
                            {row.total_quota}
                          </td>
                          <td className="px-6 py-4 text-[13px] font-bold tabular-nums text-[#0A0A0A]">
                            {row.total_applications}
                          </td>
                          <td className="px-6 py-4 text-[13px] font-bold tabular-nums text-[#0A0A0A]">
                            {row.approved_count}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-1.5 bg-[#F5F5F5] overflow-hidden">
                                <div
                                  className="h-full bg-[#ED8D31]"
                                  style={{ width: `${Math.min(row.approval_rate, 100)}%` }}
                                />
                              </div>
                              <span className="text-[13px] font-bold tabular-nums text-[#ED8D31]">
                                {row.approval_rate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] font-bold text-[#737373]">
                            {row.status}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </DataPanel>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <DataPanel title={t("sg.withdrawals")}>
                {summary.withdrawals_breakdown.length === 0 ? (
                  <div className="p-8 text-[13px] text-[#737373]">
                    {t("sg.empty")}
                  </div>
                ) : (
                  <ul className="p-2">
                    {summary.withdrawals_breakdown.map((w) => (
                      <li
                        key={w.status}
                        className="flex justify-between items-baseline px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors border-b border-[#F5F5F5] last:border-b-0"
                      >
                        <span className="text-[#0A0A0A] text-[12px] font-bold uppercase tracking-wider">
                          {STATUS_LABEL[w.status] || w.status}
                        </span>
                        <span className="text-[18px] font-bold tabular-nums text-[#0A0A0A]">
                          {w.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </DataPanel>

              <DataPanel title={t("sg.documents")}>
                {summary.documents_breakdown.length === 0 ? (
                  <div className="p-8 text-[13px] text-[#737373]">
                    {t("sg.empty")}
                  </div>
                ) : (
                  <ul className="p-2">
                    {summary.documents_breakdown.map((d) => (
                      <li
                        key={d.status}
                        className="flex justify-between items-baseline px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors border-b border-[#F5F5F5] last:border-b-0"
                      >
                        <span className="text-[#0A0A0A] text-[12px] font-bold uppercase tracking-wider">
                          {d.status}
                        </span>
                        <span className="text-[18px] font-bold tabular-nums text-[#0A0A0A]">
                          {d.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </DataPanel>
            </div>
          </>
        )}
      </PageBody>
    </PageShell>
  );
}
