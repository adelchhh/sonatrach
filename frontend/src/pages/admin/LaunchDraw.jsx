import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  DataPanel,
  Button,
  Alert,
} from "../../components/ui/Studio";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR", {
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
        setPageError(err.message || t("sg.error"))
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
    <PageShell>
      <PageHeader
        eyebrow={t("admin.launchDraw.adminTools")}
        title={t("admin.launchDraw.title")}
        subtitle={t("admin.launchDraw.subtitle")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("admin.launchDraw.title") },
        ]}
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        <StatBar>
          <StatCell
            label={t("admin.launchDraw.statTotal")}
            value={stats.total}
            sub={t("admin.launchDraw.statTotalHint")}
          />
          <StatCell
            label={t("admin.launchDraw.statReady")}
            value={stats.ready}
            sub={t("admin.launchDraw.statReadyHint")}
            accent={stats.ready > 0}
          />
          <StatCell
            label={t("admin.launchDraw.statNotReady")}
            value={stats.notReady}
            sub={t("admin.launchDraw.statNotReadyHint")}
          />
          <StatCell
            label={t("admin.launchDraw.statEligible")}
            value={stats.eligible}
            sub={t("admin.launchDraw.statEligibleHint")}
          />
        </StatBar>

        <DataPanel
          title={t("admin.launchDraw.readyTitle")}
          subtitle={t("admin.launchDraw.readyHint")}
          badge={`${ready.length}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {[
                    t("admin.launchDraw.col.activity"),
                    t("admin.launchDraw.col.session"),
                    t("admin.launchDraw.col.drawDate"),
                    t("admin.launchDraw.col.applicants"),
                    t("admin.launchDraw.col.eligible"),
                    t("admin.launchDraw.col.quota"),
                    t("admin.launchDraw.col.action"),
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
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-14 text-center text-[13px] text-[#737373]"
                    >
                      {t("admin.launchDraw.loading")}
                    </td>
                  </tr>
                ) : ready.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-14 text-center text-[13px] text-[#737373]"
                    >
                      {t("admin.launchDraw.noReady")}
                    </td>
                  </tr>
                ) : (
                  ready.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                    >
                      <td className="px-6 py-5">
                        <p className="text-[#0A0A0A] text-[14px] font-bold">
                          {s.activity_title}
                        </p>
                        <p className="text-[11px] uppercase tracking-wider text-[#737373] mt-1">
                          {s.activity_category}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                        #{s.id}
                        <p className="text-[11px] text-[#A3A3A3] mt-0.5">
                          {formatDate(s.start_date)} → {formatDate(s.end_date)}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#0A0A0A]">
                        {formatDate(s.draw_date)}
                        {s.draw_location && (
                          <p className="text-[11px] text-[#737373] mt-0.5">
                            {s.draw_location}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-5 text-[14px] font-bold tabular-nums text-[#0A0A0A]">
                        {s.applicants}
                      </td>
                      <td className="px-6 py-5 text-[14px] font-bold tabular-nums text-[#0A0A0A]">
                        {s.eligible_count}
                      </td>
                      <td className="px-6 py-5 text-[14px] font-bold tabular-nums text-[#0A0A0A]">
                        {s.total_quota}
                      </td>
                      <td className="px-6 py-5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            navigate(`/dashboard/admin/draw/run/${s.id}`)
                          }
                        >
                          {t("admin.launchDraw.runDraw")} →
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DataPanel>

        <DataPanel
          title={t("admin.launchDraw.notReadyTitle")}
          subtitle={t("admin.launchDraw.notReadyHint")}
          badge={`${notReady.length}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {[
                    t("admin.launchDraw.col.activity"),
                    t("admin.launchDraw.col.session"),
                    t("admin.launchDraw.col.blocking"),
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
                {!loading && notReady.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-14 text-center text-[13px] text-[#737373]"
                    >
                      {t("admin.launchDraw.allReady")}
                    </td>
                  </tr>
                ) : (
                  notReady.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                    >
                      <td className="px-6 py-5 text-[14px] font-bold text-[#0A0A0A]">
                        {s.activity_title}
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                        #{s.id} · draw {formatDate(s.draw_date)}
                      </td>
                      <td className="px-6 py-5">
                        <ul className="space-y-1.5">
                          {(s.blocking_reasons || []).map((r, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-[12px] text-[#9F1F1F]"
                            >
                              <span className="inline-block w-1 h-1 rounded-full bg-[#9F1F1F] mt-1.5" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DataPanel>
      </PageBody>
    </PageShell>
  );
}
