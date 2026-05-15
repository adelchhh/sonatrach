import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, getCurrentUser } from "../../api";
import { useT } from "../../i18n/LanguageContext";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1600&q=80";

const POSTER_FALLBACKS = [
  "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80",
];

function buildCategoryLabels(t) {
  return {
    SPORT: t("categories.SPORT"),
    FAMILY: t("categories.FAMILY"),
    STAY: t("categories.STAY"),
    NATURE: t("categories.NATURE"),
    SPIRITUAL: t("categories.SPIRITUAL"),
    TRAVEL: t("categories.TRAVEL"),
    LEISURE: t("categories.LEISURE"),
  };
}

function buildRoleLabels(t) {
  return {
    FUNCTIONAL_ADMIN: t("statuses.FUNCTIONAL_ADMIN") === "statuses.FUNCTIONAL_ADMIN" ? "Functional administrator" : t("statuses.FUNCTIONAL_ADMIN"),
    SYSTEM_ADMIN: t("statuses.SYSTEM_ADMIN") === "statuses.SYSTEM_ADMIN" ? "System administrator" : t("statuses.SYSTEM_ADMIN"),
    COMMUNICATOR: t("statuses.COMMUNICATOR") === "statuses.COMMUNICATOR" ? "Communicator" : t("statuses.COMMUNICATOR"),
    EMPLOYEE: t("statuses.EMPLOYEE") === "statuses.EMPLOYEE" ? "Employee" : t("statuses.EMPLOYEE"),
  };
}

function pickImage(activity, index = 0) {
  return (
    activity?.image_url ||
    activity?.image ||
    POSTER_FALLBACKS[index % POSTER_FALLBACKS.length]
  );
}

export default function DashboardMain() {
  const t = useT();
  const CATEGORY_LABEL = buildCategoryLabels(t);
  const ROLE_LABEL = buildRoleLabels(t);
  const user = getCurrentUser();
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const safe = (p) => p.catch(() => ({ data: [] }));
    (async () => {
      const [a, s, si] = await Promise.all([
        safe(apiGet("/activities")),
        safe(apiGet("/sessions")),
        safe(apiGet("/sites")),
      ]);
      if (cancelled) return;
      setActivities(a?.data || []);
      setSessions(s?.data || []);
      setSites(si?.data || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const roles = (user?.roles || []).map((r) =>
    typeof r === "string" ? r : r?.name || r?.role
  );
  const primaryRole = roles[0] || "EMPLOYEE";
  const isAdmin =
    roles.includes("FUNCTIONAL_ADMIN") || roles.includes("SYSTEM_ADMIN");
  const isCommunicator = roles.includes("COMMUNICATOR");

  const fullName = `${user?.first_name || ""} ${user?.name || ""}`.trim();
  const firstName = user?.first_name || "";
  const roleLabel = ROLE_LABEL[primaryRole] || primaryRole;

  const publishedActivities = activities.filter(
    (a) => a.status === "PUBLISHED"
  );
  const activeSessions = sessions.filter((s) =>
    ["OPEN", "CLOSED"].includes(s.status)
  );
  const drawDoneSessions = sessions.filter((s) => s.status === "DRAW_DONE");
  const openSessions = sessions.filter((s) => s.status === "OPEN");

  const featuredActivity = publishedActivities[0] || null;

  const kpis = isAdmin
    ? [
        { label: t("sg.activities"), value: publishedActivities.length, sub: t("sg.published") },
        { label: t("sg.sessions"), value: activeSessions.length, sub: t("sg.active") },
        { label: t("sg.registrations"), value: "—", sub: t("sg.toValidate") },
        { label: t("admin.drawHistory.title") || "Draws", value: drawDoneSessions.length, sub: t("sg.executed") },
        { label: t("sg.sites"), value: sites.length, sub: t("sg.configured") },
        { label: "Sonatrach", value: "50K+", sub: "" },
      ]
    : [
        { label: t("sg.activities"), value: publishedActivities.length, sub: "" },
        { label: t("sg.myRequests"), value: "—", sub: t("sg.inProgress") },
        { label: t("admin.drawHistory.title") || "Draws", value: openSessions.length, sub: "" },
        { label: t("sg.sites"), value: sites.length, sub: "" },
        { label: t("sg.notifications"), value: "—", sub: "" },
        { label: t("sg.documents"), value: "—", sub: "" },
      ];

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      <HeroFeatured
        activity={featuredActivity}
        loading={loading}
        userName={firstName}
        roleLabel={roleLabel}
      />

      <KpiStrip kpis={kpis} loading={loading} />

      <ContentRow
        title={t("homeSections.featuredTitle")}
        subtitle={`${publishedActivities.length} ${t("sg.activities").toLowerCase()}`}
        seeAllTo="/dashboard/catalog"
        seeAllLabel={t("hero.browseCatalog")}
        loading={loading}
        items={publishedActivities}
        renderItem={(a, i) => <PosterCard key={a.id} activity={a} index={i} CATEGORY_LABEL={CATEGORY_LABEL} t={t} />}
      />

      {isAdmin && (
        <ContentRow
          title={t("sg.sessions")}
          subtitle=""
          seeAllTo="/dashboard/admin/activities"
          seeAllLabel={t("sg.activities")}
          loading={loading}
          items={openSessions}
          renderItem={(s, i) => (
            <SessionCard
              key={s.id}
              session={s}
              activities={activities}
              index={i}
              CATEGORY_LABEL={CATEGORY_LABEL}
              t={t}
            />
          )}
          emptyText={t("sg.empty")}
        />
      )}

      <ContentRow
        title={t("admin.launchDraw.title") === "admin.launchDraw.title" ? "Draws" : t("admin.launchDraw.title")}
        subtitle=""
        seeAllTo={isAdmin ? "/dashboard/admin/draw" : "/dashboard/draw"}
        seeAllLabel={isAdmin ? t("sg.drawCenter") : t("sg.myDrawResults")}
        loading={loading}
        items={activeSessions.filter((s) => s.status === "CLOSED")}
        renderItem={(s, i) => (
          <DrawCard
            key={s.id}
            session={s}
            activities={activities}
            isAdmin={isAdmin}
            index={i}
            t={t}
          />
        )}
        emptyText={t("sg.empty")}
      />

      <QuickActions isAdmin={isAdmin} isCommunicator={isCommunicator} t={t} />

      <SiteFooter />
    </main>
  );
}

/* ════════════════════════════════════════════════ */
/*  HERO — Netflix-style featured activity          */
/* ════════════════════════════════════════════════ */

function HeroFeatured({ activity, loading, userName, roleLabel }) {
  const heroImage = activity ? pickImage(activity, 0) : FALLBACK_IMG;
  const categoryLabel = activity
    ? CATEGORY_LABEL[activity.category] || activity.category
    : "—";

  return (
    <section className="relative h-[560px] bg-black overflow-hidden">
      {/* Background image */}
      <img
        src={heroImage}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-65"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_IMG;
        }}
      />
      {/* Multi-direction gradient overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

      {/* Subtle grain */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Top mini-bar */}
      <div className="relative px-8 lg:px-12 pt-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#ED8D31] animate-pulse" />
          <p className="text-white/70 text-[10px] uppercase tracking-[0.4em] font-bold">
            En direct · Tableau de bord
          </p>
        </div>
        <p className="text-white/60 text-[11px] uppercase tracking-[0.25em] tabular-nums font-medium hidden md:block">
          {new Date()
            .toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            .toUpperCase()}
        </p>
      </div>

      {/* Hero content (bottom-left anchor) */}
      <div className="absolute inset-0 flex items-end z-10">
        <div className="w-full px-8 lg:px-12 pb-14 max-w-[1100px]">
          <p className="text-[#ED8D31] text-[11px] uppercase tracking-[0.35em] font-bold mb-3">
            Bonjour {userName || ""} · {roleLabel}
          </p>

          {loading ? (
            <div className="space-y-4">
              <div className="h-4 w-32 bg-white/15 rounded animate-pulse" />
              <div className="h-14 w-3/4 bg-white/15 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-white/15 rounded animate-pulse" />
            </div>
          ) : !activity ? (
            <>
              <h1 className="text-white text-[clamp(36px,5vw,68px)] font-bold leading-[1.05] tracking-[-0.02em] mb-5 max-w-[760px]">
                Bienvenue sur la plateforme socio-activités Sonatrach
              </h1>
              <p className="text-white/85 text-[16px] leading-[1.6] max-w-[560px] mb-7">
                Découvrez les activités sociales, sportives et culturelles
                proposées aux collaborateurs Sonatrach et à leurs familles.
              </p>
              <Link
                to="/dashboard/catalog"
                className="inline-flex items-center gap-3 px-7 py-3.5 bg-white text-black text-sm font-bold hover:bg-[#ED8D31] hover:text-white transition-colors"
              >
                <PlayIcon /> Découvrir le catalogue
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-[#ED8D31] text-black text-[11px] uppercase tracking-[0.2em] font-bold">
                  À la une
                </span>
                <span className="text-white/70 text-[11px] uppercase tracking-[0.3em] font-semibold">
                  {categoryLabel}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span className="text-white/70 text-[11px] uppercase tracking-[0.25em]">
                  Sélection officielle
                </span>
              </div>
              <h1 className="text-white text-[clamp(40px,5.5vw,76px)] font-bold leading-[1.02] tracking-[-0.025em] mb-5 max-w-[760px]">
                {activity.title}
              </h1>
              <p className="text-white/85 text-[16px] leading-[1.65] max-w-[600px] mb-7 line-clamp-3">
                {activity.description ||
                  "Activité phare proposée par le comité social de Sonatrach. Découvrez tous les détails et les modalités d'inscription."}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/activities/${activity.id}`}
                  className="inline-flex items-center gap-3 px-7 py-3.5 bg-white text-black text-sm font-bold hover:bg-[#ED8D31] hover:text-white transition-colors"
                >
                  <PlayIcon /> Voir l'activité
                </Link>
                <Link
                  to="/dashboard/catalog"
                  className="inline-flex items-center gap-3 px-7 py-3.5 bg-white/15 backdrop-blur-sm text-white text-sm font-bold hover:bg-white/25 transition-colors border border-white/20"
                >
                  <InfoIcon /> Plus de détails
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}

/* ════════════════════════════════════════════════ */
/*  KPI STRIP                                       */
/* ════════════════════════════════════════════════ */

function KpiStrip({ kpis, loading }) {
  return (
    <section className="relative -mt-10 z-20 px-4 lg:px-8">
      <div className="max-w-[1200px] mx-auto bg-white border border-[#E5E5E5] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-[#E5E5E5]">
          {(loading ? Array.from({ length: 6 }) : kpis).map((kpi, i) => (
            <div key={i} className="px-5 py-5 group">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-2 w-16 bg-[#E5E5E5] mb-3" />
                  <div className="h-8 w-12 bg-[#E5E5E5]" />
                  <div className="h-2 w-20 bg-[#E5E5E5] mt-3" />
                </div>
              ) : (
                <>
                  <p className="text-[#737373] text-[10px] uppercase tracking-[0.18em] font-bold mb-2">
                    {kpi.label}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-[#0A0A0A] text-[32px] font-bold leading-none tabular-nums tracking-tight">
                      {kpi.value}
                    </p>
                    <span className="w-1 h-1 rounded-full bg-[#ED8D31] mb-1.5" />
                  </div>
                  <p className="text-[#A3A3A3] text-[11px] mt-2">{kpi.sub}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════ */
/*  CONTENT ROW — horizontal scroll                 */
/* ════════════════════════════════════════════════ */

function ContentRow({
  title,
  subtitle,
  seeAllTo,
  seeAllLabel,
  loading,
  items,
  renderItem,
  emptyText = "Aucun élément à afficher pour le moment.",
}) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 600, behavior: "smooth" });
  };

  return (
    <section className="py-12 lg:py-14 bg-white">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12">
        <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
          <div>
            <h2 className="text-[#0A0A0A] text-[28px] lg:text-[32px] font-bold tracking-[-0.02em] leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[#737373] text-[13px] mt-1.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {seeAllTo && (
              <Link
                to={seeAllTo}
                className="text-[#0A0A0A] text-[12px] uppercase tracking-[0.15em] font-bold hover:text-[#ED8D31] transition-colors"
              >
                {seeAllLabel || "Tout voir"} →
              </Link>
            )}
            <div className="hidden md:flex gap-1">
              <button
                onClick={() => scroll(-1)}
                className="w-9 h-9 flex items-center justify-center bg-white border border-[#E5E5E5] hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] transition-colors text-[#0A0A0A]"
                aria-label="Précédent"
              >
                ‹
              </button>
              <button
                onClick={() => scroll(1)}
                className="w-9 h-9 flex items-center justify-center bg-white border border-[#E5E5E5] hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] transition-colors text-[#0A0A0A]"
                aria-label="Suivant"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-5 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[260px] aspect-[3/4] bg-[#F5F5F5] animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="border border-[#E5E5E5] bg-[#FAFAFA] py-16 px-8 text-center">
            <p className="text-[#737373] text-[13px]">{emptyText}</p>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory hide-scrollbar"
            style={{ scrollbarWidth: "none" }}
          >
            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            {items.map((item, i) => renderItem(item, i))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════ */
/*  POSTER CARD — Netflix-style activity            */
/* ════════════════════════════════════════════════ */

function PosterCard({ activity, index, CATEGORY_LABEL = {}, t = (k) => k }) {
  const img = pickImage(activity, index);
  const categoryLabel =
    CATEGORY_LABEL[activity.category] || activity.category || "—";

  return (
    <Link
      to={`/activities/${activity.id}`}
      className="group relative w-[260px] flex-shrink-0 snap-start aspect-[3/4] bg-[#1A1A1A] overflow-hidden cursor-pointer"
    >
      <img
        src={img}
        alt={activity.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={(e) => {
          e.currentTarget.src = POSTER_FALLBACKS[index % POSTER_FALLBACKS.length];
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Category tag — top-left */}
      <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 text-black text-[10px] uppercase tracking-[0.15em] font-bold">
        {categoryLabel}
      </div>

      {/* Index number — top-right */}
      <div className="absolute top-3 right-3 text-white/40 text-[28px] font-black leading-none tabular-nums group-hover:text-[#ED8D31] transition-colors">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Bottom block — always visible */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-bold text-[18px] leading-[1.2] mb-1.5 line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {activity.title}
        </h3>
        <p className="text-white/70 text-[11px] leading-[1.4] line-clamp-2 mb-3 transition-all duration-300 max-h-0 overflow-hidden group-hover:max-h-[60px]">
          {activity.description || ""}
        </p>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ED8D31] text-black text-[11px] font-bold tracking-wide">
            <PlayIcon size={10} /> {t("sg.view")}
          </span>
        </div>
      </div>

      {/* Orange hover bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#ED8D31] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
    </Link>
  );
}

/* ════════════════════════════════════════════════ */
/*  SESSION CARD — wide card for ongoing sessions   */
/* ════════════════════════════════════════════════ */

function SessionCard({ session, activities, index, CATEGORY_LABEL = {}, t = (k) => k }) {
  const activity = activities.find((a) => a.id === session.activity_id);
  const img = pickImage(activity, index);
  const categoryLabel = activity
    ? CATEGORY_LABEL[activity.category] || activity.category
    : "—";

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d)
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      })
      .toUpperCase();
  };

  return (
    <Link
      to={`/dashboard/admin/sessions/${session.id}`}
      className="group relative w-[340px] flex-shrink-0 snap-start aspect-[16/10] bg-[#1A1A1A] overflow-hidden"
    >
      <img
        src={img}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/60 to-transparent" />

      <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#ED8D31] text-black text-[10px] uppercase tracking-[0.15em] font-bold">
        {session.status === "OPEN" ? t("sg.registrations") : session.status}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-[#ED8D31] text-[10px] uppercase tracking-[0.25em] font-bold mb-1.5">
          {categoryLabel} · Session #{session.id}
        </p>
        <h3 className="text-white font-bold text-[19px] leading-[1.2] mb-3 line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {activity?.title || "Session"}
        </h3>
        <div className="flex items-center gap-4 text-white/80 text-[11px]">
          <div>
            <p className="text-white/45 uppercase tracking-[0.18em] text-[9px] mb-0.5">
              {t("admin.sessionForm.startDate")}
            </p>
            <p className="font-semibold tabular-nums">
              {fmtDate(session.start_date)}
            </p>
          </div>
          <div className="w-px h-7 bg-white/20" />
          <div>
            <p className="text-white/45 uppercase tracking-[0.18em] text-[9px] mb-0.5">
              {t("admin.sessionForm.registrationDeadline")}
            </p>
            <p className="font-semibold tabular-nums">
              {fmtDate(session.registration_deadline)}
            </p>
          </div>
          {session.draw_date && (
            <>
              <div className="w-px h-7 bg-white/20" />
              <div>
                <p className="text-white/45 uppercase tracking-[0.18em] text-[9px] mb-0.5">
                  {t("admin.sessionForm.drawDate")}
                </p>
                <p className="font-semibold tabular-nums">
                  {fmtDate(session.draw_date)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════ */
/*  DRAW CARD — sessions awaiting draw              */
/* ════════════════════════════════════════════════ */

function DrawCard({ session, activities, isAdmin, index, t = (k) => k }) {
  const activity = activities.find((a) => a.id === session.activity_id);
  const img = pickImage(activity, index + 3);

  return (
    <Link
      to={
        isAdmin
          ? `/dashboard/admin/draw/run/${session.id}`
          : `/activities/${session.activity_id}`
      }
      className="group relative w-[320px] flex-shrink-0 snap-start aspect-[16/10] bg-black overflow-hidden border border-[#262626] hover:border-[#ED8D31] transition-colors"
    >
      <img
        src={img}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-45 transition-opacity"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/80 to-black/60" />

      {/* Animated pulse dot top-left */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <span className="relative flex w-2 h-2">
          <span className="absolute inline-flex w-full h-full rounded-full bg-[#ED8D31] opacity-75 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-[#ED8D31]" />
        </span>
        <p className="text-[#ED8D31] text-[10px] uppercase tracking-[0.3em] font-bold">
          {t("sg.drawCenter")}
        </p>
      </div>

      <div className="relative h-full flex flex-col justify-between p-5">
        <div />
        <div>
          <h3 className="text-white font-bold text-[20px] leading-[1.2] mb-2 line-clamp-2">
            {activity?.title || `Session #${session.id}`}
          </h3>
          <p className="text-white/55 text-[11px] uppercase tracking-[0.2em] mb-4">
            {t("statuses.CLOSED")}
          </p>
          <div className="inline-flex items-center gap-2 text-white text-[11px] uppercase tracking-[0.15em] font-bold group-hover:text-[#ED8D31] transition-colors">
            {isAdmin ? t("admin.launchDraw.runDraw") : t("sg.view")} →
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════ */
/*  QUICK ACTIONS — Amazon-style compact grid       */
/* ════════════════════════════════════════════════ */

function QuickActions({ isAdmin, isCommunicator, t = (k) => k }) {
  const adminActions = [
    { icon: "🎯", title: t("admin.launchDraw.runDraw"), sub: "", to: "/dashboard/admin/draw" },
    { icon: "📝", title: t("admin.registrations.title"), sub: "", to: "/dashboard/admin/registrations" },
    { icon: "⚙️", title: t("admin.activities.title"), sub: "", to: "/dashboard/admin/activities" },
    { icon: "📁", title: t("admin.documents.title"), sub: "", to: "/dashboard/admin/documents" },
    { icon: "🏢", title: t("admin.site.title"), sub: "", to: "/dashboard/admin/site" },
    { icon: "📊", title: t("sg.reports"), sub: "", to: "/dashboard/admin/reports" },
    { icon: "↩️", title: t("admin.withdrawals.title"), sub: "", to: "/dashboard/admin/withdrawals" },
    { icon: "🕘", title: t("sg.drawHistory"), sub: "", to: "/dashboard/admin/draw-history" },
  ];

  const employeeActions = [
    { icon: "🏕", title: t("dashboard.sidebar.catalog"), sub: "", to: "/dashboard/catalog" },
    { icon: "📄", title: t("sg.myRequests"), sub: "", to: "/dashboard/requests" },
    { icon: "🎯", title: t("sg.myDrawResults"), sub: "", to: "/dashboard/draw" },
    { icon: "📁", title: t("sg.myDocuments"), sub: "", to: "/dashboard/documents" },
    { icon: "🕒", title: t("sg.myHistory"), sub: "", to: "/dashboard/history" },
    { icon: "📋", title: t("sg.surveys"), sub: "", to: "/dashboard/surveys" },
    { icon: "💡", title: t("sg.ideas"), sub: "", to: "/dashboard/ideas" },
    { icon: "🔔", title: t("sg.notifications"), sub: "", to: "/dashboard/notifications" },
  ];

  const actions = isAdmin ? adminActions : employeeActions;

  return (
    <section className="py-14 bg-[#FAFAFA] border-t border-[#E5E5E5]">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12">
        <div className="mb-7">
          <h2 className="text-[#0A0A0A] text-[28px] lg:text-[32px] font-bold tracking-[-0.02em]">
            {t("dashboard.sidebar.adminTools") === "dashboard.sidebar.adminTools" ? "Quick access" : t("dashboard.sidebar.adminTools")}
          </h2>
          <p className="text-[#737373] text-[13px] mt-1.5"></p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.15)] transition-all p-5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#ED8D31] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              <div className="text-[28px] mb-3 grayscale group-hover:grayscale-0 transition-all">
                {action.icon}
              </div>
              <h3 className="text-[#0A0A0A] text-[14px] font-bold leading-tight mb-1">
                {action.title}
              </h3>
              <p className="text-[#737373] text-[11px] leading-[1.4]">
                {action.sub}
              </p>
              <div className="mt-3 text-[#0A0A0A] text-[11px] uppercase tracking-[0.15em] font-bold group-hover:text-[#ED8D31] transition-colors">
                Ouvrir →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════ */
/*  FOOTER                                          */
/* ════════════════════════════════════════════════ */

function SiteFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-9 h-9 flex items-center justify-center font-black text-white text-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #ED8D31 0%, #B5560F 100%)",
                }}
              >
                S
              </div>
              <p className="font-bold text-[15px] tracking-tight">SONATRACH</p>
            </div>
            <p className="text-white/55 text-[12px] leading-[1.65]">
              Plateforme socio-activités · Direction Centrale Capital Humain.
              Au service des collaborateurs depuis 1963.
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/45 mb-4">
              Activités
            </p>
            <ul className="space-y-2.5 text-[13px]">
              <FooterLink to="/dashboard/catalog">Catalogue complet</FooterLink>
              <FooterLink to="/dashboard/draw">Résultats des tirages</FooterLink>
              <FooterLink to="/dashboard/surveys">Sondages</FooterLink>
              <FooterLink to="/dashboard/ideas">Boîte à idées</FooterLink>
            </ul>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/45 mb-4">
              Espace personnel
            </p>
            <ul className="space-y-2.5 text-[13px]">
              <FooterLink to="/dashboard/requests">Mes demandes</FooterLink>
              <FooterLink to="/dashboard/documents">Mes documents</FooterLink>
              <FooterLink to="/dashboard/history">Mon historique</FooterLink>
              <FooterLink to="/dashboard/notifications">Notifications</FooterLink>
            </ul>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/45 mb-4">
              À propos
            </p>
            <ul className="space-y-2.5 text-[13px]">
              <li className="text-white/75">Sonatrach SpA</li>
              <li className="text-white/55 text-[12px]">
                Djenane El Malik, Hydra
              </li>
              <li className="text-white/55 text-[12px]">Alger, Algérie</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-wrap justify-between items-center gap-3">
          <p className="text-white/40 text-[11px] uppercase tracking-[0.25em]">
            © {new Date().getFullYear()} Sonatrach SpA · Tous droits réservés
          </p>
          <p className="text-white/40 text-[11px] uppercase tracking-[0.25em] tabular-nums">
            Plateforme v.2.6
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="text-white/65 hover:text-[#ED8D31] transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

/* ════════════════════════════════════════════════ */
/*  ICONS                                           */
/* ════════════════════════════════════════════════ */

function PlayIcon({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden
    >
      <path d="M2 1.5v9l8-4.5L2 1.5z" />
    </svg>
  );
}

function InfoIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="7" cy="7" r="6" />
      <line x1="7" y1="6" x2="7" y2="10" />
      <circle cx="7" cy="4" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}
