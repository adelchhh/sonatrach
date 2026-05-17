import { Link, useLocation, useNavigate } from "react-router-dom";
import { useT } from "../../i18n/LanguageContext";
import { getCurrentUser } from "../../api";
import sonatrachLogo from "../../assets/logo/sonatrach_logo2-1024x1024.png";

function buildEmployeeItems(t) {
  return [
    { labelKey: "dashboard.sidebar.dashboard", path: "/dashboard", icon: "📊" },
    { labelKey: "dashboard.sidebar.catalog", path: "/dashboard/catalog", icon: "🏕" },
    { labelKey: "dashboard.sidebar.myRequests", path: "/dashboard/requests", icon: "📄" },
    { labelKey: "dashboard.sidebar.drawResults", path: "/dashboard/draw", icon: "🎯" },
    { labelKey: "dashboard.sidebar.documents", path: "/dashboard/documents", icon: "📁" },
    { labelKey: "dashboard.sidebar.history", path: "/dashboard/history", icon: "🕒" },
    { labelKey: "dashboard.sidebar.surveys", path: "/dashboard/surveys", icon: "📋" },
    { labelKey: "dashboard.sidebar.ideas", path: "/dashboard/ideas", icon: "💡" },
    { labelKey: "dashboard.sidebar.notifications", path: "/dashboard/notifications", icon: "🔔" },
  ];
}

function buildAdminItems() {
  return [
    { labelKey: "dashboard.sidebar.manageActivities", path: "/dashboard/admin/activities", icon: "⚙️" },
    { labelKey: "dashboard.sidebar.manageDocuments", path: "/dashboard/admin/documents", icon: "📋" },
    { labelKey: "dashboard.sidebar.manageSites", path: "/dashboard/admin/site", icon: "🏢" },
    { labelKey: "dashboard.sidebar.manageRegistrations", path: "/dashboard/admin/registrations", icon: "📝" },
    { labelKey: "dashboard.sidebar.launchDraw", path: "/dashboard/admin/draw", icon: "🎯" },
    { labelKey: "dashboard.sidebar.manageWithdrawals", path: "/dashboard/admin/withdrawals", icon: "↩️" },
    { labelKey: "dashboard.sidebar.reports", path: "/dashboard/admin/reports", icon: "📊" },
    { labelKey: "dashboard.sidebar.drawHistory", path: "/dashboard/admin/draw-history", icon: "🕘" },
  ];
}

function buildCommunicatorItems() {
  return [
    { labelKey: "dashboard.sidebar.manageAnnouncements", path: "/dashboard/communicator/announcements", icon: "📢" },
    { labelKey: "dashboard.sidebar.manageSurveys", path: "/dashboard/communicator/surveys", icon: "📝" },
    { labelKey: "dashboard.sidebar.ideaModeration", path: "/dashboard/communicator/ideas", icon: "💡" },
    { labelKey: "dashboard.sidebar.manageNotifications", path: "/dashboard/communicator/notifications", icon: "🔔" },
  ];
}

function buildSystemItems() {
  return [
    { labelKey: "dashboard.sidebar.manageFunctionalAdmins", path: "/dashboard/system/functional-admins", icon: "🛡️" },
    { labelKey: "dashboard.sidebar.manageCommunicators", path: "/dashboard/system/communicators", icon: "📢" },
    { labelKey: "dashboard.sidebar.manageSystemAdmins", path: "/dashboard/system/system-admins", icon: "👑" },
    { labelKey: "dashboard.sidebar.auditLog", path: "/dashboard/system/audit-log", icon: "📜" },
  ];
}

function NavSection({ title, items, location, t }) {
  return (
    <div className="mb-4">
      <p className="px-4 mb-2 text-xs font-semibold text-[#7A8088] uppercase">
        {title}
      </p>

      {items.map((item) => {
        const isActive =
          item.path === "/dashboard"
            ? location.pathname === "/dashboard"
            : location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors mb-1 ${
              isActive
                ? "bg-[#ED8D31] text-white"
                : "text-[#2F343B] hover:bg-[#F5F4F1]"
            }`}
          >
            <span className="w-5 text-center">{item.icon}</span>
            <span className="flex-1 text-[13px]">{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT();

  const user = getCurrentUser();

  const roles = (user?.roles || []).map((role) => {
    if (typeof role === "string") return role;
    return role.name || role.role || role.label;
  });

  const isSystemAdmin = roles.includes("SYSTEM_ADMIN");
  const isFunctionalAdmin = roles.includes("FUNCTIONAL_ADMIN");
  const isCommunicator = roles.includes("COMMUNICATOR");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="w-[240px] min-w-[240px] h-screen bg-white border-r border-[#E5E2DC] flex flex-col sticky top-0">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-[#E5E2DC]">
        <img
          src={sonatrachLogo}
          alt="Sonatrach"
          className="w-11 h-11 object-contain"
        />
        <span className="font-bold text-[#2F343B] text-sm tracking-tight">
          SONATRACH
        </span>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        <NavSection
          title={t("dashboard.title")}
          items={buildEmployeeItems(t)}
          location={location}
          t={t}
        />

        {(isFunctionalAdmin || isSystemAdmin) && (
          <>
            <div className="my-3 border-t border-[#E5E2DC]" />
            <NavSection
              title={t("dashboard.sidebar.adminTools")}
              items={buildAdminItems()}
              location={location}
              t={t}
            />
          </>
        )}

        {(isCommunicator || isSystemAdmin) && (
          <>
            <div className="my-3 border-t border-[#E5E2DC]" />
            <NavSection
              title={t("dashboard.sidebar.communicatorTools")}
              items={buildCommunicatorItems()}
              location={location}
              t={t}
            />
          </>
        )}

        {isSystemAdmin && (
          <>
            <div className="my-3 border-t border-[#E5E2DC]" />
            <NavSection
              title={t("dashboard.sidebar.systemTools")}
              items={buildSystemItems()}
              location={location}
              t={t}
            />
          </>
        )}
      </nav>

      <div className="p-3 border-t border-[#E5E2DC]">
        <button
          onClick={handleLogout}
          className="w-full py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
        >
          {t("common.logout")}
        </button>
      </div>
    </aside>
  );
}
