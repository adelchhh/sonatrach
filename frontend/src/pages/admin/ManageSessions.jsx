import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet, apiDelete } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  DataPanel,
  StatusPill,
  Modal,
  Button,
  Alert,
  EmptyState,
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

export default function ManageSessions() {
  const t = useT();
  const { id } = useParams();

  const [activity, setActivity] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [modal, setModal] = useState({ open: false, sessionId: null });
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet(`/activities/${id}/sessions`)
      .then((res) => {
        setActivity(res.data.activity);
        setSessions(res.data.sessions || []);
      })
      .catch((err) =>
        setPageError(err.message || "Impossible de charger les sessions.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const closeModal = () => setModal({ open: false, sessionId: null });

  const handleDeleteSession = async () => {
    setDeleting(true);
    try {
      await apiDelete(`/sessions/${modal.sessionId}`);
      closeModal();
      load();
    } catch (err) {
      alert(err.message || "Suppression impossible.");
      closeModal();
    } finally {
      setDeleting(false);
    }
  };

  const totalSessions = sessions.length;
  const totalSites = sessions.reduce(
    (sum, s) => sum + Number(s.sites_count || 0),
    0
  );
  const totalQuota = sessions.reduce(
    (sum, s) => sum + Number(s.total_quota || 0),
    0
  );
  const upcomingDraw = sessions
    .filter((s) => s.draw_date && new Date(s.draw_date) >= new Date())
    .sort((a, b) => new Date(a.draw_date) - new Date(b.draw_date))[0];

  const statusLabel = (status) => {
    const tr = t(`statuses.${status}`);
    return tr === `statuses.${status}` ? status : tr;
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.administration")}
        title={t("admin.sessions.title")}
        subtitle={t("admin.sessions.subtitle")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("admin.activities.title"), to: "/dashboard/admin/activities" },
          { label: activity ? activity.title : `#${id}` },
        ]}
        actions={
          <Button
            to={`/dashboard/admin/activities/${id}/sessions/create`}
            variant="primary"
            size="md"
            icon={<span className="text-[14px] leading-none">＋</span>}
          >
            {t("admin.sessions.addSession")}
          </Button>
        }
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        <StatBar>
          <StatCell
            label={t("admin.sessions.statTotal")}
            value={totalSessions}
            sub={
              activity
                ? t("admin.sessions.statForActivity", { title: activity.title })
                : ""
            }
          />
          <StatCell
            label={t("admin.sessions.statSites")}
            value={totalSites}
            sub={t("admin.sessions.statAcrossSessions")}
          />
          <StatCell
            label={t("admin.sessions.statQuota")}
            value={totalQuota}
            sub={t("admin.sessions.statPlacesAvailable")}
            accent={totalQuota > 0}
          />
          <StatCell
            label={t("admin.sessions.statNextDraw")}
            value={upcomingDraw ? formatDate(upcomingDraw.draw_date) : "—"}
            sub={
              upcomingDraw
                ? t("admin.sessions.sessionRef", { id: upcomingDraw.id })
                : t("admin.sessions.noUpcomingDraw")
            }
          />
        </StatBar>

        <DataPanel
          title={t("admin.sessions.list")}
          subtitle={t("admin.sessions.listHint")}
          badge={`${sessions.length}`}
        >
          {loading ? (
            <div className="px-6 py-14 text-center text-[13px] text-[#737373]">
              {t("common.loading")}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon="📅"
                title={t("admin.sessions.empty")}
                description="Créez la première session pour cette activité."
                action={
                  <Button
                    to={`/dashboard/admin/activities/${id}/sessions/create`}
                    variant="primary"
                    size="md"
                  >
                    {t("admin.sessions.addSession")}
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-[#0A0A0A]">
                  <tr>
                    {[
                      t("admin.sessions.col.session"),
                      t("admin.sessions.col.dates"),
                      t("admin.sessions.col.draw"),
                      t("admin.sessions.col.sitesQuota"),
                      t("common.status"),
                      t("common.actions"),
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
                  {sessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                    >
                      <td className="px-6 py-5">
                        <p className="text-[#0A0A0A] text-[14px] font-bold tabular-nums">
                          {t("admin.sessions.sessionRef", { id: session.id })}
                        </p>
                        <p className="text-[11px] text-[#737373] mt-1">
                          {t("admin.sessions.registrationsCount", {
                            count: session.registrations_count,
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[13px] font-semibold text-[#0A0A0A] tabular-nums">
                          {formatDate(session.start_date)}
                        </p>
                        <p className="text-[11px] text-[#737373] mt-0.5 tabular-nums">
                          → {formatDate(session.end_date)}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[13px] font-semibold text-[#0A0A0A] tabular-nums">
                          {formatDate(session.draw_date)}
                        </p>
                        <p className="text-[11px] text-[#737373] mt-0.5">
                          {session.draw_location || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[13px] font-semibold text-[#0A0A0A]">
                          {t("admin.sessions.sitesCount", {
                            count: session.sites_count,
                          })}
                        </p>
                        <p className="text-[11px] text-[#737373] mt-0.5 tabular-nums">
                          Quota {session.total_quota}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <StatusPill
                          tone={STATUS_TONE[session.status] || "neutral"}
                          label={statusLabel(session.status)}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            to={`/dashboard/admin/activities/${id}/sessions/${session.id}`}
                          >
                            {t("common.view")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            to={`/dashboard/admin/activities/${id}/sessions/${session.id}/edit`}
                          >
                            {t("admin.activities.modify")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            to={`/dashboard/admin/activities/${id}/sessions/${session.id}/sites-quotas`}
                          >
                            {t("admin.sessions.sitesQuotas")}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              setModal({ open: true, sessionId: session.id })
                            }
                          >
                            {t("common.delete")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataPanel>
      </PageBody>

      <Modal
        open={modal.open}
        onClose={closeModal}
        title={t("admin.sessions.deleteModal.title")}
        description={t("admin.sessions.deleteModal.text")}
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={closeModal}
              disabled={deleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDeleteSession}
              disabled={deleting}
            >
              {deleting ? t("common.deleting") : t("common.confirm")}
            </Button>
          </>
        }
      />
    </PageShell>
  );
}
