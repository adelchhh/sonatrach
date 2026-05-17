import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, getCurrentUserId } from "../../api";
import { useT } from "../../i18n/LanguageContext";

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

function outcomeFor(r, t) {
  if (r.is_selected === 1 || r.is_selected === true) {
    return { label: t("employee.drawResults.outcomeSelected"), style: "bg-[#D4F4DD] text-[#2D7A4A]" };
  }
  if (r.is_substitute === 1 || r.is_substitute === true) {
    return {
      label: t("employee.drawResults.outcomeSubstitute", { rank: r.substitute_rank ?? "—" }),
      style: "bg-[#F7E6CC] text-[#A9651E]",
    };
  }
  return { label: t("employee.drawResults.outcomeNotSelected"), style: "bg-[#F1F0EC] text-[#7A8088]" };
}

export default function DrawResults() {
  const t = useT();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const userId = getCurrentUserId();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setPageError(t("common.pleaseLogin"));
      return;
    }
    apiGet(`/me/draw-results?user_id=${userId}`)
      .then((res) => setResults(res.data || []))
      .catch((err) =>
        setPageError(err.message || t("common.serverError"))
      )
      .finally(() => setLoading(false));
  }, [userId, t]);

  const stats = useMemo(
    () => ({
      total: results.length,
      selected: results.filter((r) => r.is_selected === 1 || r.is_selected === true)
        .length,
      substitute: results.filter(
        (r) => r.is_substitute === 1 || r.is_substitute === true
      ).length,
    }),
    [results]
  );

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                {t("employee.drawResults.title")}
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                {t("employee.drawResults.subtitle")}
              </p>
            </div>

            {pageError && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {pageError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title={t("employee.drawResults.statTotal")} value={stats.total} />
              <StatCard title={t("employee.drawResults.statSelected")} value={stats.selected} />
              <StatCard title={t("employee.drawResults.statSubstitute")} value={stats.substitute} />
            </div>

            <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px]">
                  <thead className="bg-[#FBFAF8]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("employee.drawResults.col.activity")}
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("employee.drawResults.col.session")}
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("employee.drawResults.col.drawDate")}
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("employee.drawResults.col.site")}
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("employee.drawResults.col.outcome")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-5 py-10 text-center text-sm text-[#7A8088]"
                        >
                          {t("employee.drawResults.loading")}
                        </td>
                      </tr>
                    )}

                    {!loading && results.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-5 py-10 text-center text-sm text-[#7A8088]"
                        >
                          {t("employee.drawResults.empty")}
                        </td>
                      </tr>
                    )}

                    {results.map((r) => {
                      const out = outcomeFor(r, t);
                      return (
                        <tr
                          key={r.id}
                          className="border-t border-[#E5E2DC]"
                        >
                          <td className="px-5 py-4 text-sm font-semibold text-[#2F343B]">
                            {r.activity_title}
                            <p className="text-xs text-[#7A8088] mt-1">
                              {r.activity_category}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-sm text-[#7A8088]">
                            {formatDate(r.start_date)} → {formatDate(r.end_date)}
                          </td>
                          <td className="px-5 py-4 text-sm text-[#7A8088]">
                            {formatDate(r.draw_date)}
                            {r.draw_location && (
                              <p className="text-xs mt-1">{r.draw_location}</p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm text-[#2F343B]">
                            {r.site_name || "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${out.style}`}
                            >
                              {out.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
