import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  DataPanel,
  Button,
  Alert,
  StatusPill,
} from "../../components/ui/Studio";

const STATUS_TONE = {
  DRAFT: "warn",
  OPEN: "success",
  CLOSED: "info",
  DRAW_DONE: "accent",
  FINISHED: "neutral",
  CANCELLED: "danger",
};

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

export default function SessionDetails() {
  const t = useT();
  const { id, sessionId } = useParams();

  const [session, setSession] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiGet(`/sessions/${sessionId}`)
      .then((res) => {
        setSession(res.data.session);
        setSites(res.data.sites || []);
      })
      .catch((err) =>
        setError(err.message || t("admin.createSession.loadingSession"))
      )
      .finally(() => setLoading(false));
  }, [sessionId]);

  const statusLabel = (status) => {
    const tr = t(`statuses.${status}`);
    return tr === `statuses.${status}` ? status : tr;
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.administration")}
        title={t("admin.sessionDetails.title")}
        subtitle={t("admin.sessionDetails.subtitle")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("admin.activities.title"), to: "/dashboard/admin/activities" },
          {
            label: "Sessions",
            to: `/dashboard/admin/activities/${id}/sessions`,
          },
          { label: t("admin.sessions.sessionRef", { id: sessionId }) },
        ]}
        actions={
          <>
            <Button
              to={`/dashboard/admin/activities/${id}/sessions/${sessionId}/edit`}
              variant="outline"
              size="md"
            >
              {t("admin.sessionDetails.editSession")}
            </Button>
            <Button
              to={`/dashboard/admin/activities/${id}/sessions/${sessionId}/sites-quotas`}
              variant="primary"
              size="md"
            >
              {t("admin.sessionDetails.manageSitesQuotas")}
            </Button>
          </>
        }
      />

      <PageBody>
        {error && (
          <Alert tone="danger" title={t("sg.error")}>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="border border-[#E5E5E5] bg-white py-10 text-center text-[13px] text-[#737373]">
            {t("admin.createSession.loadingSession")}
          </div>
        ) : session ? (
          <>
            <DataPanel
              title="Informations"
              subtitle="Tous les paramètres de la session"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 divide-x divide-y divide-[#E5E5E5]">
                <InfoCell label={t("admin.sessionDetails.info.activity")} value={session.activity_title || `Activité #${id}`} />
                <InfoCell label={t("admin.sessionDetails.info.status")}>
                  <StatusPill tone={STATUS_TONE[session.status] || "neutral"} label={statusLabel(session.status)} />
                </InfoCell>
                <InfoCell label={t("admin.sessionDetails.info.startDate")} value={formatDate(session.start_date)} tabular />
                <InfoCell label={t("admin.sessionDetails.info.endDate")} value={formatDate(session.end_date)} tabular />
                <InfoCell label={t("admin.sessionDetails.info.registrationDeadline")} value={formatDate(session.registration_deadline)} tabular />
                <InfoCell label={t("admin.sessionDetails.info.docsDeadline")} value={formatDate(session.document_upload_deadline)} tabular />
                <InfoCell label={t("admin.sessionDetails.info.drawDate")} value={formatDate(session.draw_date)} tabular />
                <InfoCell label={t("admin.sessionDetails.info.drawLocation")} value={session.draw_location || "—"} />
                <InfoCell label={t("admin.sessionDetails.info.confirmationDelay")} value={t("admin.sessionDetails.info.hours", { count: session.confirmation_delay_hours })} tabular />
                <InfoCell label={t("admin.sessionDetails.info.substitutes")} value={String(session.substitutes_count)} tabular />
                <InfoCell
                  label={t("admin.sessionDetails.info.transport")}
                  value={
                    session.transport_included
                      ? t("admin.sessionForm.transportCoveredYes")
                      : t("admin.sessionForm.transportCoveredNo")
                  }
                />
                <InfoCell label={t("admin.sessionDetails.info.telefax")} value={session.telefax_url || "—"} />
                <InfoCell label={t("admin.sessionDetails.info.totalSites")} value={t("admin.sessions.sitesCount", { count: session.sites_count })} tabular />
                <InfoCell label={t("admin.sessionDetails.info.totalQuota")} value={`${session.total_quota} ${t("activityDetail.places")}`} tabular />
                <InfoCell label={t("admin.sessionDetails.info.registrations")} value={String(session.registrations_count)} tabular />
              </div>
            </DataPanel>

            <DataPanel
              title={t("admin.sessionDetails.sitesAndQuotas")}
              subtitle={t("admin.sessionDetails.sitesQuotasHint")}
              badge={`${sites.length}`}
            >
              {sites.length === 0 ? (
                <div className="px-6 py-14 text-center text-[13px] text-[#737373]">
                  {t("admin.sessionDetails.noSitesAssigned")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-[#0A0A0A]">
                      <tr>
                        {[
                          t("admin.site.col.site"),
                          t("admin.site.col.address"),
                          t("admin.sitesQuotas.col.quota"),
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
                      {sites.map((site) => (
                        <tr
                          key={site.session_site_id}
                          className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
                        >
                          <td className="px-6 py-4 text-[14px] font-bold text-[#0A0A0A]">
                            {site.name}
                          </td>
                          <td className="px-6 py-4 text-[12px] text-[#525252]">
                            {site.address || "—"}
                          </td>
                          <td className="px-6 py-4 text-[14px] font-bold tabular-nums text-[#0A0A0A]">
                            {site.quota}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DataPanel>
          </>
        ) : null}
      </PageBody>
    </PageShell>
  );
}

function InfoCell({ label, value, children, tabular }) {
  return (
    <div className="p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#737373] mb-2">
        {label}
      </p>
      {children ? (
        children
      ) : (
        <p
          className={`text-[15px] font-bold text-[#0A0A0A] break-words ${
            tabular ? "tabular-nums" : ""
          }`}
        >
          {value}
        </p>
      )}
    </div>
  );
}
