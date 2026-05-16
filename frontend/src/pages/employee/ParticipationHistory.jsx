import { useEffect, useMemo, useState } from "react";
import { apiGet, getCurrentUserId, API_BASE_URL } from "../../api";
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

export default function ParticipationHistory() {
  const t = useT();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const userId = getCurrentUserId();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setPageError(t("sg.error"));
      return;
    }
    apiGet(`/me/participations?user_id=${userId}`)
      .then((res) => setHistory(res.data || []))
      .catch((err) =>
        setPageError(err.message || t("sg.loadingFailed"))
      )
      .finally(() => setLoading(false));
  }, [userId, t]);

  const stats = useMemo(() => {
    const total = history.length;
    const ratings = history
      .filter((p) => p.rating != null)
      .map((p) => Number(p.rating));
    const avgRating = ratings.length
      ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)
      : "—";
    const certs = history.filter((p) => p.certificate_path).length;
    return { total, avgRating, certs };
  }, [history]);

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.myArea")}
        title={t("sg.myHistory")}
        subtitle={t("sg.subMyHistory")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("sg.myHistory") },
        ]}
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        <StatBar>
          <StatCell label={t("sg.activities")} value={stats.total} sub={t("sg.subFollowed")} />
          <StatCell label={t("sg.labelRating")} value={stats.avgRating} sub={t("sg.colMyRating")} accent />
          <StatCell label={t("sg.certificate")} value={stats.certs} sub={t("sg.subCertificates")} />
        </StatBar>

        <DataPanel title={t("sg.myHistory")} badge={`${history.length}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {[
                    t("sg.colActivity"),
                    t("sg.colPeriod"),
                    t("sg.colSite"),
                    t("sg.colMyRating"),
                    t("sg.colCertificate"),
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
                    <td colSpan={5} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      {t("sg.loading")}
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      {t("sg.emptyHistory")}
                    </td>
                  </tr>
                ) : (
                  history.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                    >
                      <td className="px-6 py-5">
                        <p className="text-[#0A0A0A] text-[14px] font-bold">
                          {p.activity_title}
                        </p>
                        <p className="text-[11px] uppercase tracking-wider text-[#737373] mt-1">
                          {p.activity_category}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                        {formatDate(p.start_date)} → {formatDate(p.end_date)}
                      </td>
                      <td className="px-6 py-5 text-[13px] text-[#0A0A0A]">
                        {p.site_name}
                      </td>
                      <td className="px-6 py-5">
                        {p.rating != null ? (
                          <span className="text-[#ED8D31] font-bold text-[14px] tracking-wider">
                            {"★".repeat(p.rating)}
                            <span className="text-[#E5E5E5]">
                              {"★".repeat(5 - p.rating)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#A3A3A3] italic">
                            {t("common.notRated")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <a
                          href={`${API_BASE_URL}/participations/${p.id}/certificate`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-2 text-[11px] uppercase tracking-[0.15em] font-bold bg-[#ED8D31] text-black hover:bg-[#fa9d40] transition-colors"
                        >
                          {t("sg.certificate")} ↓
                        </a>
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
