import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
      .catch((err) => setError(err.message || t("admin.createSession.loadingSession")))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="text-sm text-[#7A8088]">
              <Link
                to="/dashboard/admin/activities"
                className="text-[#ED8D31] font-medium"
              >
                {t("admin.activities.title")}
              </Link>
              <span className="mx-2">›</span>
              <Link
                to={`/dashboard/admin/activities/${id}/sessions`}
                className="text-[#ED8D31] font-medium"
              >
                {t("admin.createSession.backToSessions")}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-[#2F343B] font-medium">
                {t("admin.sessions.sessionRef", { id: sessionId })}
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-[36px] font-extrabold text-[#2F343B]">
                  {t("admin.sessionDetails.title")}
                </h1>
                <p className="text-[#7A8088] text-sm mt-2">
                  {t("admin.sessionDetails.subtitle")}
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  to={`/dashboard/admin/activities/${id}/sessions/${sessionId}/edit`}
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  {t("admin.sessionDetails.editSession")}
                </Link>
                <Link
                  to={`/dashboard/admin/activities/${id}/sessions/${sessionId}/sites-quotas`}
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold"
                >
                  {t("admin.sessionDetails.manageSitesQuotas")}
                </Link>
              </div>
            </div>

            {error && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-[14px] border border-[#E5E2DC] bg-white px-4 py-6 text-sm text-[#7A8088]">
                {t("admin.createSession.loadingSession")}
              </div>
            ) : session ? (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <InfoCard
                    label={t("admin.sessionDetails.info.activity")}
                    value={session.activity_title || `Activity ${id}`}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.status")}
                    value={t(`statuses.${session.status}`) === `statuses.${session.status}` ? session.status : t(`statuses.${session.status}`)}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.startDate")}
                    value={formatDate(session.start_date)}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.endDate")}
                    value={formatDate(session.end_date)}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.registrationDeadline")}
                    value={formatDate(session.registration_deadline)}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.docsDeadline")}
                    value={formatDate(session.document_upload_deadline)}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.drawDate")}
                    value={formatDate(session.draw_date)}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.drawLocation")}
                    value={session.draw_location || "—"}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.confirmationDelay")}
                    value={t("admin.sessionDetails.info.hours", { count: session.confirmation_delay_hours })}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.substitutes")}
                    value={String(session.substitutes_count)}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.transport")}
                    value={session.transport_included ? t("admin.sessionForm.transportCoveredYes") : t("admin.sessionForm.transportCoveredNo")}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.telefax")}
                    value={session.telefax_url || "—"}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.totalSites")}
                    value={t("admin.sessions.sitesCount", { count: session.sites_count })}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.totalQuota")}
                    value={`${session.total_quota} ${t("activityDetail.places")}`}
                  />
                  <InfoCard
                    label={t("admin.sessionDetails.info.registrations")}
                    value={String(session.registrations_count)}
                  />
                </div>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[22px] font-bold text-[#2F343B]">
                      {t("admin.sessionDetails.sitesAndQuotas")}
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      {t("admin.sessionDetails.sitesQuotasHint")}
                    </p>
                  </div>

                  {sites.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-[#7A8088]">
                      {t("admin.sessionDetails.noSitesAssigned")}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-[#FBFAF8]">
                          <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">
                              {t("admin.site.col.site")}
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">
                              {t("admin.site.col.address")}
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">
                              {t("admin.sitesQuotas.col.quota")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sites.map((site) => (
                            <tr
                              key={site.session_site_id}
                              className="border-t border-[#E5E2DC]"
                            >
                              <td className="px-5 py-3 text-sm font-semibold text-[#2F343B]">
                                {site.name}
                              </td>
                              <td className="px-5 py-3 text-sm text-[#7A8088]">
                                {site.address || "—"}
                              </td>
                              <td className="px-5 py-3 text-sm font-medium text-[#2F343B]">
                                {site.quota}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{label}</p>
      <p className="text-lg font-bold text-[#2F343B] mt-2 break-words">
        {value}
      </p>
    </div>
  );
}
