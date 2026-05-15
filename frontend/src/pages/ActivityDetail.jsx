import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiGet, apiPost, getCurrentUserId } from "../api";
import { useT } from "../i18n/LanguageContext";
import {
  PageHero,
  Modal,
  Button,
  Alert,
  StatusPill,
  DataPanel,
  Select,
  SectionHeader,
} from "../components/ui/Studio";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

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

export default function ActivityDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const t = useT();

  const [activity, setActivity] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [siteChoices, setSiteChoices] = useState([]);

  const [modal, setModal] = useState({ open: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const userId = getCurrentUserId();
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  useEffect(() => {
    setLoading(true);
    setPageError(null);
    Promise.all([
      apiGet(`/activities/${slug}`),
      apiGet(`/activities/${slug}/open-sessions`),
    ])
      .then(([actRes, sessRes]) => {
        setActivity(actRes.data);
        const sessList = sessRes.data || [];
        setSessions(sessList);
        if (sessList.length > 0) setSelectedSessionId(sessList[0].id);
      })
      .catch((err) =>
        setPageError(err.message || t("activityDetail.couldNotLoad"))
      )
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleSiteChoice = (sessionSiteId) => {
    setSiteChoices((prev) => {
      if (prev.includes(sessionSiteId))
        return prev.filter((id) => id !== sessionSiteId);
      if (prev.length >= 3) return prev;
      return [...prev, sessionSiteId];
    });
  };

  const moveChoice = (index, direction) => {
    const newOrder = [...siteChoices];
    const swap = index + direction;
    if (swap < 0 || swap >= newOrder.length) return;
    [newOrder[index], newOrder[swap]] = [newOrder[swap], newOrder[index]];
    setSiteChoices(newOrder);
  };

  const handleConfirm = async () => {
    if (!userId) {
      navigate("/login");
      return;
    }
    if (!selectedSessionId) {
      setSubmitError(t("activityDetail.selectSession"));
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiPost(`/sessions/${selectedSessionId}/register`, {
        user_id: userId,
        site_choices: siteChoices,
      });
      setSuccessMessage(res.message || t("activityDetail.registrationSuccess"));
      setModal({ open: false });
      setSiteChoices([]);
    } catch (err) {
      setSubmitError(err.message || "Inscription impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="px-8 py-20 text-center">
          <p className="text-[#737373] text-[14px]">{t("common.loading")}</p>
        </div>
      </Layout>
    );
  }

  if (pageError || !activity) {
    return (
      <Layout>
        <div className="px-8 py-20 max-w-[800px] mx-auto">
          <Alert tone="danger" title="Activité introuvable">
            {pageError || t("activityDetail.activityNotFound")}
          </Alert>
          <div className="mt-6">
            <Button to="/catalog" variant="outline" size="md">
              ← {t("activityDetail.breadcrumbActivities")}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const categoryLabel =
    t(`categories.${activity.category}`) === `categories.${activity.category}`
      ? activity.category
      : t(`categories.${activity.category}`);
  const statusLabel =
    t(`statuses.${activity.status}`) === `statuses.${activity.status}`
      ? activity.status
      : t(`statuses.${activity.status}`);

  const heroImage = activity.image_url || activity.image || DEFAULT_IMAGE;

  return (
    <Layout>
      <PageHero
        eyebrow={categoryLabel}
        title={activity.title}
        subtitle={activity.description}
        image={heroImage}
        height="tall"
        breadcrumbs={[
          { label: t("activityDetail.breadcrumbActivities"), to: "/catalog" },
          { label: activity.title },
        ]}
        actions={
          sessions.length > 0 ? (
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (!userId) {
                  navigate("/login");
                  return;
                }
                setModal({ open: true });
              }}
            >
              {t("activityDetail.register")} →
            </Button>
          ) : (
            <StatusPill tone="warn" label={t("activityDetail.noOpenSessions")} solid />
          )
        }
      />

      <div className="px-8 lg:px-12 py-12 bg-white">
        <div className="max-w-[1280px] mx-auto">
          {successMessage && (
            <div className="mb-8">
              <Alert tone="success" title="Inscription enregistrée">
                {successMessage}{" "}
                <Link
                  to="/dashboard/requests"
                  className="font-semibold underline ml-1"
                >
                  {t("activityDetail.seeMyRequests")} →
                </Link>
              </Alert>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 mb-16">
            {/* MAIN COLUMN — description + sessions */}
            <div className="space-y-12">
              <section>
                <SectionHeader
                  title={t("activityDetail.overview")}
                  subtitle="Tout ce que vous devez savoir sur cette activité"
                />
                <p className="text-[#525252] text-[15px] leading-[1.8]">
                  {activity.description}
                </p>
              </section>

              <section>
                <SectionHeader
                  title={t("activityDetail.availableSessions")}
                  subtitle={`${sessions.length} session${sessions.length > 1 ? "s" : ""} ouverte${sessions.length > 1 ? "s" : ""} à l'inscription`}
                />
                {sessions.length === 0 ? (
                  <DataPanel>
                    <div className="px-6 py-10 text-center text-[#737373] text-[13px]">
                      {t("activityDetail.noSessions")}
                    </div>
                  </DataPanel>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        className="bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] transition-colors p-5 flex items-start gap-5"
                      >
                        <div className="min-w-[110px]">
                          <p className="text-[#ED8D31] text-[10px] uppercase tracking-[0.2em] font-bold mb-1">
                            Début
                          </p>
                          <p className="text-[#0A0A0A] text-[18px] font-bold tabular-nums leading-tight">
                            {formatDate(s.start_date)}
                          </p>
                          <p className="text-[#737373] text-[11px] mt-1 tabular-nums">
                            → {formatDate(s.end_date)}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#0A0A0A] text-[14px] font-bold mb-2">
                            Session #{s.id}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px]">
                            <div>
                              <p className="text-[#A3A3A3] uppercase tracking-[0.15em] font-bold text-[10px] mb-0.5">
                                {t("activityDetail.registrationDeadline")}
                              </p>
                              <p className="text-[#0A0A0A] font-semibold tabular-nums">
                                {formatDate(s.registration_deadline)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#A3A3A3] uppercase tracking-[0.15em] font-bold text-[10px] mb-0.5">
                                {t("activityDetail.quota")}
                              </p>
                              <p className="text-[#0A0A0A] font-semibold tabular-nums">
                                {s.total_quota} {t("activityDetail.places")}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#A3A3A3] uppercase tracking-[0.15em] font-bold text-[10px] mb-0.5">
                                {t("activityDetail.transport")}
                              </p>
                              <p className="text-[#0A0A0A] font-semibold">
                                {s.transport_included ? "Inclus" : "Non inclus"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* SIDE COLUMN — registration card */}
            <aside>
              <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-6 sticky top-6">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#737373]">
                    Inscription
                  </p>
                  <StatusPill tone="success" label={statusLabel} />
                </div>

                <h2 className="text-[#0A0A0A] text-[20px] font-bold tracking-tight mb-5 leading-tight">
                  {t("activityDetail.registerForSession")}
                </h2>

                <dl className="space-y-3 mb-6 pb-6 border-b border-[#E5E5E5]">
                  <InfoRow
                    label={t("activityDetail.minimumSeniority")}
                    value={`${activity.minimum_seniority} ${t("activityDetail.yearsShort")}`}
                  />
                  <InfoRow
                    label={t("activityDetail.demandLevel")}
                    value={activity.demand_level || "—"}
                  />
                  <InfoRow
                    label={t("activityDetail.randomDraw")}
                    value={activity.draw_enabled ? t("common.yes") : t("common.no")}
                  />
                </dl>

                {sessions.length === 0 ? (
                  <p className="text-[12px] text-[#737373] italic">
                    {t("activityDetail.noOpenSessions")}
                  </p>
                ) : (
                  <>
                    <Select
                      label={t("activityDetail.selectSession")}
                      value={selectedSessionId || ""}
                      onChange={(v) => {
                        setSelectedSessionId(Number(v));
                        setSiteChoices([]);
                      }}
                      options={sessions.map((s) => ({
                        value: s.id,
                        label: `${formatDate(s.start_date)} → ${formatDate(s.end_date)} (${s.total_quota} ${t("activityDetail.places")})`,
                      }))}
                    />

                    {selectedSession && selectedSession.sites?.length > 0 && (
                      <div className="mt-5">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] mb-1">
                          {t("activityDetail.sitePreferences")}
                        </p>
                        <p className="text-[11px] text-[#737373] mb-3 leading-[1.55]">
                          {t("activityDetail.sitePrefHint")}
                        </p>

                        <div className="space-y-2 mb-3">
                          {siteChoices.length === 0 ? (
                            <p className="text-[11px] text-[#A3A3A3] italic">
                              {t("activityDetail.noSiteSelected")}
                            </p>
                          ) : (
                            siteChoices.map((id, idx) => {
                              const site = selectedSession.sites.find(
                                (s) => s.session_site_id === id
                              );
                              return (
                                <div
                                  key={id}
                                  className="flex items-center justify-between bg-white border border-[#0A0A0A] px-3 py-2 text-[12px]"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="text-[#ED8D31] font-bold tabular-nums">
                                      #{idx + 1}
                                    </span>
                                    <span className="text-[#0A0A0A] font-semibold">
                                      {site?.site_name}
                                    </span>
                                  </span>
                                  <span className="flex gap-1">
                                    <button
                                      onClick={() => moveChoice(idx, -1)}
                                      className="w-6 h-6 text-[#0A0A0A] hover:bg-[#FAFAFA] text-xs"
                                      title="Monter"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      onClick={() => moveChoice(idx, 1)}
                                      className="w-6 h-6 text-[#0A0A0A] hover:bg-[#FAFAFA] text-xs"
                                      title="Descendre"
                                    >
                                      ↓
                                    </button>
                                    <button
                                      onClick={() => toggleSiteChoice(id)}
                                      className="w-6 h-6 text-[#9F1F1F] hover:bg-[#FFEFEF] text-xs"
                                      title="Retirer"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {selectedSession.sites
                            .filter(
                              (s) => !siteChoices.includes(s.session_site_id)
                            )
                            .map((s) => (
                              <button
                                key={s.session_site_id}
                                onClick={() =>
                                  toggleSiteChoice(s.session_site_id)
                                }
                                disabled={siteChoices.length >= 3}
                                className="px-3 py-1.5 text-[11px] bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[#0A0A0A] uppercase tracking-[0.1em] font-bold disabled:opacity-40 transition-colors"
                              >
                                + {s.site_name} ({s.quota})
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => {
                          if (!userId) {
                            navigate("/login");
                            return;
                          }
                          setModal({ open: true });
                        }}
                      >
                        {t("activityDetail.register")} →
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={t("activityDetail.confirmRegistration")}
        description={
          <>
            {t("activityDetail.confirmRegistrationText", {
              title: activity.title,
            })}
            {selectedSession && (
              <>
                {" "}— session {formatDate(selectedSession.start_date)} →{" "}
                {formatDate(selectedSession.end_date)}.
              </>
            )}
            {siteChoices.length > 0 && (
              <p className="text-[11px] text-[#737373] mt-3">
                {t("activityDetail.sitesSelected", {
                  count: siteChoices.length,
                })}
              </p>
            )}
          </>
        }
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setModal({ open: false })}
              disabled={submitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? t("common.submitting") : t("common.confirm")}
            </Button>
          </>
        }
      >
        {submitError && (
          <Alert tone="danger" title="Erreur">
            {submitError}
          </Alert>
        )}
      </Modal>
    </Layout>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#737373]">
        {label}
      </dt>
      <dd className="text-[13px] font-bold text-[#0A0A0A] text-right">
        {value}
      </dd>
    </div>
  );
}
