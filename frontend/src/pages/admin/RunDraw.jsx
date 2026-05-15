import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dice5 } from "lucide-react";
import DrawWheel from "../../components/admin/DrawWheel";
import { apiGet, apiPost } from "../../api";
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

function getCurrentUserId() {
  try {
    return JSON.parse(localStorage.getItem("user"))?.id || null;
  } catch {
    return null;
  }
}

export default function RunDraw() {
  const t = useT();
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [running, setRunning] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [results, setResults] = useState(null);
  const [drawDetails, setDrawDetails] = useState(null);

  const adminId = getCurrentUserId();

  const winnersForWheel = drawDetails?.results
    ? [...drawDetails.results]
        .map((r) => ({
          user_id: r.registration_id,
          first_name: r.user_first_name,
          name: r.user_last_name,
          employee_number: r.employee_number,
          site_name: r.site_name,
          substitute_rank: r.substitute_rank,
          kind:
            r.is_selected === 1 || r.is_selected === true
              ? "selected"
              : r.is_substitute === 1 || r.is_substitute === true
              ? "substitute"
              : "waiting",
        }))
        .sort((a, b) => {
          const order = { selected: 0, substitute: 1, waiting: 2 };
          return order[a.kind] - order[b.kind];
        })
    : [];

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet(`/sessions/${sessionId}/draw-preview`)
      .then((res) => setPreview(res.data))
      .catch((err) =>
        setPageError(err.message || "Impossible de charger l'aperçu.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [sessionId]);

  const handleLaunch = async () => {
    if (!adminId) {
      alert(t("admin.runDraw.loginRequired"));
      return;
    }
    if (!window.confirm(t("admin.runDraw.confirmLaunch"))) return;

    setRunning(true);
    try {
      const res = await apiPost(`/sessions/${sessionId}/execute-draw`, {
        admin_id: adminId,
        mode: "BY_SITE",
        draw_location: preview?.session?.draw_location || null,
      });
      const detailsRes = await apiGet(`/draws/${res.data.draw_id}`);
      setResults(res.data);
      setDrawDetails(detailsRes.data);
      setAnimating(true);
    } catch (err) {
      alert(err.message || "Tirage impossible.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("admin.launchDraw.title")}
        title={t("admin.runDraw.title") === "admin.runDraw.title" ? t("admin.launchDraw.runDraw") : t("admin.runDraw.title")}
        subtitle={t("admin.runDraw.subtitle") === "admin.runDraw.subtitle" ? "" : t("admin.runDraw.subtitle")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("sg.drawCenter"), to: "/dashboard/admin/draw" },
          { label: `Session #${sessionId}` },
        ]}
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        {loading && (
          <div className="border border-[#E5E5E5] bg-white py-10 text-center text-[13px] text-[#737373]">
            {t("sg.loading")}
          </div>
        )}

        {!loading && preview && (
          <>
            <DataPanel
              title={preview.session.activity_title}
              subtitle={`Session #${sessionId} · ${formatDate(preview.session.start_date)} → ${formatDate(preview.session.end_date)}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-y divide-[#E5E5E5]">
                <Info
                  label={t("admin.sessions.col.dates")}
                  value={`${formatDate(preview.session.start_date)} → ${formatDate(preview.session.end_date)}`}
                />
                <Info
                  label={t("admin.launchDraw.col.eligible")}
                  value={preview.eligible_count}
                />
                <Info
                  label={t("admin.sessionForm.substitutesCount")}
                  value={preview.session.substitutes_count}
                />
                <Info
                  label={t("admin.sessionForm.drawLocation")}
                  value={preview.session.draw_location || "—"}
                />
                <Info
                  label={t("admin.sessionForm.drawDate")}
                  value={formatDate(preview.session.draw_date)}
                />
                <Info label={t("common.status")} value={preview.session.status} />
              </div>
            </DataPanel>

            <DataPanel
              title={t("admin.sessionDetails.sitesAndQuotas")}
              subtitle=""
              badge={`${preview.sites.length}`}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0A0A0A]">
                    <tr>
                      {[t("admin.site.col.site"), t("admin.sitesQuotas.col.quota"), t("admin.sitesQuotas.col.choices")].map((h, i) => (
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
                    {preview.sites.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-10 text-center text-[13px] text-[#737373]">
                          Aucun site configuré.
                        </td>
                      </tr>
                    ) : (
                      preview.sites.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
                        >
                          <td className="px-6 py-4 text-[14px] font-bold text-[#0A0A0A]">
                            {s.name}
                          </td>
                          <td className="px-6 py-4 text-[14px] font-bold tabular-nums text-[#0A0A0A]">
                            {s.quota}
                          </td>
                          <td className="px-6 py-4 text-[13px] tabular-nums text-[#525252]">
                            {s.interested_count}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </DataPanel>

            {preview.existing_draw &&
              preview.existing_draw.executed &&
              !results && (
                <Alert tone="warn" title={t("statuses.DRAW_DONE")}>
                  {formatDate(preview.existing_draw.executed_at)}
                  <div className="mt-3">
                    <Button
                      to="/dashboard/admin/draw-history"
                      variant="outline"
                      size="sm"
                    >
                      {t("sg.drawHistory")} →
                    </Button>
                  </div>
                </Alert>
              )}

            {!preview.existing_draw?.executed && !results && (
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleLaunch}
                  disabled={
                    running ||
                    preview.sites.length === 0 ||
                    preview.eligible_count === 0
                  }
                  icon={<Dice5 size={16} strokeWidth={2.2} />}
                >
                  {running ? t("sg.processing") : t("admin.launchDraw.runDraw")}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Cinematic full-screen ceremony */}
        {animating && drawDetails && (
          <DrawWheel
            candidates={preview?.eligible_candidates || []}
            winners={winnersForWheel}
            running={animating}
            sessionTitle={
              preview?.session?.activity_title || "Selection ceremony"
            }
            drawId={results?.draw_id}
            onComplete={() => setAnimating(false)}
          />
        )}

        {results && drawDetails && !animating && (
          <>
            <div className="bg-[#0A0A0A] text-white p-8 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "radial-gradient(ellipse at 80% 30%, rgba(237,141,49,0.4) 0%, transparent 50%)",
                }}
              />
              <div className="relative">
                <p className="text-[#ED8D31] text-[11px] uppercase tracking-[0.35em] font-bold mb-3">
                  {t("statuses.DRAW_DONE")}
                </p>
                <h2 className="text-white text-[32px] font-bold tracking-[-0.02em] mb-7">
                  {t("sg.selected")}
                </h2>
                <div className="grid grid-cols-3 gap-6">
                  <ResultStat label={t("sg.selected")} value={results.selected_count} />
                  <ResultStat label={t("sg.substitute")} value={results.substitute_count} />
                  <ResultStat
                    label={t("sg.waitingList")}
                    value={results.waiting_count}
                  />
                </div>
              </div>
            </div>

            <ResultsList
              title={t("sg.selected")}
              filter="selected"
              items={drawDetails.results}
              t={t}
            />
            <ResultsList
              title={t("sg.substitute")}
              filter="substitute"
              items={drawDetails.results}
              t={t}
            />
            <ResultsList
              title={t("sg.waitingList")}
              filter="waiting"
              items={drawDetails.results}
              t={t}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate("/dashboard/admin/draw-history")}
              >
                {t("sg.drawHistory")}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate("/dashboard/admin/registrations")}
              >
                {t("sg.registrations")} →
              </Button>
            </div>
          </>
        )}
      </PageBody>
    </PageShell>
  );
}

function Info({ label, value }) {
  return (
    <div className="p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#737373] mb-2">
        {label}
      </p>
      <p className="text-[15px] font-bold text-[#0A0A0A] break-words">
        {value}
      </p>
    </div>
  );
}

function ResultStat({ label, value }) {
  return (
    <div className="border-l-2 border-[#ED8D31] pl-5">
      <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/60 mb-2">
        {label}
      </p>
      <p className="text-[44px] font-bold leading-none tabular-nums tracking-[-0.03em] text-white">
        {value}
      </p>
    </div>
  );
}

function ResultsList({ title, filter, items, t = (k) => k }) {
  const filtered = items.filter((r) => {
    if (filter === "selected")
      return r.is_selected === 1 || r.is_selected === true;
    if (filter === "substitute")
      return r.is_substitute === 1 || r.is_substitute === true;
    return (
      (r.is_selected === 0 || r.is_selected === false) &&
      (r.is_substitute === 0 || r.is_substitute === false)
    );
  });

  return (
    <DataPanel title={title} badge={`${filtered.length}`}>
      {filtered.length === 0 ? (
        <div className="px-6 py-10 text-center text-[13px] text-[#737373]">
          {t("sg.empty")}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0A0A0A]">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]">
                  {t("admin.registrations.col.employee")}
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]">
                  {t("admin.registrations.matricule", { number: "" }).replace(/Mat\.?\s*:?\s*$/, "Matricule")}
                </th>
                {filter === "selected" && (
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]">
                    Site
                  </th>
                )}
                {filter === "substitute" && (
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]">
                    Rang
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
                >
                  <td className="px-6 py-4 text-[14px] font-bold text-[#0A0A0A]">
                    {r.user_first_name} {r.user_last_name}
                  </td>
                  <td className="px-6 py-4 text-[12px] font-mono tabular-nums text-[#525252]">
                    {r.employee_number}
                  </td>
                  {filter === "selected" && (
                    <td className="px-6 py-4 text-[13px] text-[#0A0A0A]">
                      {r.site_name || "—"}
                    </td>
                  )}
                  {filter === "substitute" && (
                    <td className="px-6 py-4 text-[14px] font-bold tabular-nums text-[#ED8D31]">
                      #{r.substitute_rank}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DataPanel>
  );
}
