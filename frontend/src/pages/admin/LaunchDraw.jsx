import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet } from "../../api";
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

export default function LaunchDraw() {
  const t = useT();
  const [ready, setReady] = useState([]);
  const [notReady, setNotReady] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/draws/readiness")
      .then((res) => {
        setReady(res.data.ready || []);
        setNotReady(res.data.not_ready || []);
      })
      .catch((err) =>
        setPageError(err.message || "Could not load draw readiness.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(
    () => ({
      total: ready.length + notReady.length,
      ready: ready.length,
      notReady: notReady.length,
      eligible: ready.reduce((s, r) => s + Number(r.eligible_count || 0), 0),
    }),
    [ready, notReady]
  );

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#ED8D31] mb-2">
                {t("admin.launchDraw.adminTools")}
              </p>
              <h1 className="text-[38px] font-extrabold text-[#2F343B] leading-[110%]">
                {t("admin.launchDraw.title")}
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 leading-[170%] max-w-[850px]">
                {t("admin.launchDraw.subtitle")}
              </p>
            </div>

            {pageError && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {pageError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title={t("admin.launchDraw.statTotal")}
                value={stats.total}
                subtitle={t("admin.launchDraw.statTotalHint")}
              />
              <StatCard
                title={t("admin.launchDraw.statReady")}
                value={stats.ready}
                subtitle={t("admin.launchDraw.statReadyHint")}
              />
              <StatCard
                title={t("admin.launchDraw.statNotReady")}
                value={stats.notReady}
                subtitle={t("admin.launchDraw.statNotReadyHint")}
              />
              <StatCard
                title={t("admin.launchDraw.statEligible")}
                value={stats.eligible}
                subtitle={t("admin.launchDraw.statEligibleHint")}
              />
            </div>

            <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DC]">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  {t("admin.launchDraw.readyTitle")}
                </h2>
                <p className="text-sm text-[#7A8088] mt-1">
                  {t("admin.launchDraw.readyHint")}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="bg-[#FBFAF8]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("admin.launchDraw.col.activity")}
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("admin.launchDraw.col.session")}
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("admin.launchDraw.col.drawDate")}
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("admin.launchDraw.col.applicants")}
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("admin.launchDraw.col.eligible")}
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("admin.launchDraw.col.quota")}
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("admin.launchDraw.col.action")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-5 py-10 text-center text-sm text-[#7A8088]"
                        >
                          {t("admin.launchDraw.loading")}
                        </td>
                      </tr>
                    )}

                    {!loading && ready.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-5 py-10 text-center text-sm text-[#7A8088]"
                        >
                          {t("admin.launchDraw.noReady")}
                        </td>
                      </tr>
                    )}

                    {ready.map((s) => (
                      <tr key={s.id} className="border-t border-[#E5E2DC]">
                        <td className="px-5 py-5 text-sm font-semibold text-[#2F343B]">
                          {s.activity_title}
                          <p className="text-xs text-[#7A8088] mt-1">
                            {s.activity_category}
                          </p>
                        </td>
                        <td className="px-5 py-5 text-sm text-[#7A8088]">
                          #{s.id} ({formatDate(s.start_date)} →{" "}
                          {formatDate(s.end_date)})
                        </td>
                        <td className="px-5 py-5 text-sm text-[#7A8088]">
                          {formatDate(s.draw_date)}
                          {s.draw_location && (
                            <p className="text-xs mt-1">{s.draw_location}</p>
                          )}
                        </td>
                        <td className="px-5 py-5 text-sm font-medium text-[#2F343B]">
                          {s.applicants}
                        </td>
                        <td className="px-5 py-5 text-sm font-medium text-[#2F343B]">
                          {s.eligible_count}
                        </td>
                        <td className="px-5 py-5 text-sm font-medium text-[#2F343B]">
                          {s.total_quota}
                        </td>
                        <td className="px-5 py-5">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/admin/draw/run/${s.id}`)
                            }
                            className="px-4 py-2 rounded-lg bg-[#ED8D31] text-white text-sm font-semibold"
                          >
                            {t("admin.launchDraw.runDraw")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DC]">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  {t("admin.launchDraw.notReadyTitle")}
                </h2>
                <p className="text-sm text-[#7A8088] mt-1">
                  {t("admin.launchDraw.notReadyHint")}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-[#FBFAF8]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("admin.launchDraw.col.activity")}
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("admin.launchDraw.col.session")}
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        {t("admin.launchDraw.col.blocking")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!loading && notReady.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-5 py-10 text-center text-sm text-[#7A8088]"
                        >
                          {t("admin.launchDraw.allReady")}
                        </td>
                      </tr>
                    )}

                    {notReady.map((s) => (
                      <tr key={s.id} className="border-t border-[#E5E2DC]">
                        <td className="px-5 py-5 text-sm font-semibold text-[#2F343B]">
                          {s.activity_title}
                        </td>
                        <td className="px-5 py-5 text-sm text-[#7A8088]">
                          #{s.id} (draw date {formatDate(s.draw_date)})
                        </td>
                        <td className="px-5 py-5 text-sm text-[#A93B3B]">
                          <ul className="list-disc list-inside">
                            {(s.blocking_reasons || []).map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
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
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{title}</p>
      <p className="text-3xl font-extrabold text-[#2F343B] mt-2">{value}</p>
      {subtitle && <p className="text-xs text-[#7A8088] mt-2">{subtitle}</p>}
    </div>
  );
}
