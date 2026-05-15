import { useEffect, useMemo, useState } from "react";
import { apiGet, getCurrentUserId } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  DataPanel,
  StatusPill,
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

function outcomeFor(r) {
  if (r.is_selected === 1 || r.is_selected === true)
    return { label: "Sélectionné", tone: "accent" };
  if (r.is_substitute === 1 || r.is_substitute === true)
    return {
      label: `Substitut #${r.substitute_rank ?? "—"}`,
      tone: "warn",
    };
  return { label: "Non retenu", tone: "neutral" };
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
      setPageError("Veuillez vous connecter.");
      return;
    }
    apiGet(`/me/draw-results?user_id=${userId}`)
      .then((res) => setResults(res.data || []))
      .catch((err) =>
        setPageError(err.message || "Impossible de charger les résultats.")
      )
      .finally(() => setLoading(false));
  }, [userId]);

  const stats = useMemo(
    () => ({
      total: results.length,
      selected: results.filter(
        (r) => r.is_selected === 1 || r.is_selected === true
      ).length,
      substitute: results.filter(
        (r) => r.is_substitute === 1 || r.is_substitute === true
      ).length,
    }),
    [results]
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.myArea")}
        title="Résultats des tirages"
        subtitle="Issue de tous les tirages au sort auxquels vous avez participé."
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Résultats de tirage" },
        ]}
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        <StatBar>
          <StatCell label="Tirages" value={stats.total} sub="Auxquels j'ai participé" />
          <StatCell label="Sélectionné" value={stats.selected} sub="Place obtenue" accent={stats.selected > 0} />
          <StatCell label="Substitut" value={stats.substitute} sub="En attente de place" />
        </StatBar>

        <DataPanel title="Tous mes tirages" badge={`${results.length}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {[
                    "Activité",
                    "Session",
                    "Date du tirage",
                    "Site",
                    "Issue",
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
                      Chargement…
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      Vous n'avez participé à aucun tirage pour le moment.
                    </td>
                  </tr>
                ) : (
                  results.map((r) => {
                    const out = outcomeFor(r);
                    return (
                      <tr
                        key={r.id}
                        className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                      >
                        <td className="px-6 py-5">
                          <p className="text-[#0A0A0A] text-[14px] font-bold">
                            {r.activity_title}
                          </p>
                          <p className="text-[11px] uppercase tracking-wider text-[#737373] mt-1">
                            {r.activity_category}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                          {formatDate(r.start_date)} → {formatDate(r.end_date)}
                        </td>
                        <td className="px-6 py-5 text-[12px] tabular-nums text-[#0A0A0A]">
                          {formatDate(r.draw_date)}
                          {r.draw_location && (
                            <p className="text-[11px] text-[#737373] mt-0.5">
                              {r.draw_location}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-5 text-[13px] text-[#0A0A0A]">
                          {r.site_name || "—"}
                        </td>
                        <td className="px-6 py-5">
                          <StatusPill tone={out.tone} label={out.label} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </DataPanel>
      </PageBody>
    </PageShell>
  );
}
