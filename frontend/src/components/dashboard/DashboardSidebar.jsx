import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Tent,
  FileText,
  Target,
  Folder,
  Clock,
  ClipboardList,
  Lightbulb,
  Bell,
  Settings,
  Building2,
  ClipboardCheck,
  Undo2,
  BarChart3,
  History,
  Megaphone,
  Crown,
  Shield,
  ScrollText,
  LogOut,
} from "lucide-react";
import { useT } from "../../i18n/LanguageContext";
import { getCurrentUser } from "../../api";

const ICON_SIZE = 16;
const ICON_STROKE = 1.7;

function buildEmployeeItems() {
  return [
    { labelKey: "dashboard.sidebar.dashboard", path: "/dashboard", icon: LayoutDashboard },
    { labelKey: "dashboard.sidebar.catalog", path: "/dashboard/catalog", icon: Tent },
    { labelKey: "dashboard.sidebar.myRequests", path: "/dashboard/requests", icon: FileText },
    { labelKey: "dashboard.sidebar.drawResults", path: "/dashboard/draw", icon: Target },
    { labelKey: "dashboard.sidebar.documents", path: "/dashboard/documents", icon: Folder },
    { labelKey: "dashboard.sidebar.history", path: "/dashboard/history", icon: Clock },
    { labelKey: "dashboard.sidebar.surveys", path: "/dashboard/surveys", icon: ClipboardList },
    { labelKey: "dashboard.sidebar.ideas", path: "/dashboard/ideas", icon: Lightbulb },
    { labelKey: "dashboard.sidebar.notifications", path: "/dashboard/notifications", icon: Bell },
  ];
}

function buildAdminItems() {
  return [
    { labelKey: "dashboard.sidebar.manageActivities", path: "/dashboard/admin/activities", icon: Settings },
    { labelKey: "dashboard.sidebar.manageDocuments", path: "/dashboard/admin/documents", icon: ClipboardCheck },
    { labelKey: "dashboard.sidebar.manageSites", path: "/dashboard/admin/site", icon: Building2 },
    { labelKey: "dashboard.sidebar.manageRegistrations", path: "/dashboard/admin/registrations", icon: FileText },
    { labelKey: "dashboard.sidebar.launchDraw", path: "/dashboard/admin/draw", icon: Target },
    { labelKey: "dashboard.sidebar.manageWithdrawals", path: "/dashboard/admin/withdrawals", icon: Undo2 },
    { labelKey: "dashboard.sidebar.reports", path: "/dashboard/admin/reports", icon: BarChart3 },
    { labelKey: "dashboard.sidebar.drawHistory", path: "/dashboard/admin/draw-history", icon: History },
  ];
}

function buildCommunicatorItems() {
  return [
    { labelKey: "dashboard.sidebar.manageAnnouncements", path: "/dashboard/communicator/announcements", icon: Megaphone },
    { labelKey: "dashboard.sidebar.manageSurveys", path: "/dashboard/communicator/surveys", icon: ClipboardList },
    { labelKey: "dashboard.sidebar.ideaModeration", path: "/dashboard/communicator/ideas", icon: Lightbulb },
    { labelKey: "dashboard.sidebar.manageNotifications", path: "/dashboard/communicator/notifications", icon: Bell },
  ];
}

function buildSystemItems() {
  return [
    { labelKey: "dashboard.sidebar.manageFunctionalAdmins", path: "/dashboard/system/functional-admins", icon: Shield },
    { labelKey: "dashboard.sidebar.manageCommunicators", path: "/dashboard/system/communicators", icon: Megaphone },
    { labelKey: "dashboard.sidebar.manageSystemAdmins", path: "/dashboard/system/system-admins", icon: Crown },
    { labelKey: "dashboard.sidebar.auditLog", path: "/dashboard/system/audit-log", icon: ScrollText },
  ];
}

function NavSection({ title, items, location, t }) {
  return (
    <div className="mb-5">
      <p className="px-4 mb-2.5 text-[10px] font-bold text-[#737373] uppercase tracking-[0.18em]">
        {title}
      </p>

      {items.map((item) => {
        const isActive =
          item.path === "/dashboard"
            ? location.pathname === "/dashboard"
            : location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);

        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`group relative flex items-center gap-3 mx-2 px-3 py-2.5 text-[13px] font-medium transition-colors mb-0.5 ${
              isActive
                ? "bg-[#0A0A0A] text-white"
                : "text-[#0A0A0A] hover:bg-[#FAFAFA]"
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#ED8D31]" />
            )}
            <Icon
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              className={
                isActive
                  ? "text-[#ED8D31]"
                  : "text-[#525252] group-hover:text-[#0A0A0A]"
              }
            />
            <span className="flex-1">{t(item.labelKey)}</span>
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
    <aside className="w-[240px] min-w-[240px] h-screen bg-white border-r border-[#E5E5E5] flex flex-col sticky top-0">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#E5E5E5]">
        <div
          className="w-9 h-9 flex items-center justify-center font-black text-white text-base"
          style={{
            background: "linear-gradient(135deg, #ED8D31 0%, #B5560F 100%)",
          }}
        >
          S
        </div>
        <span className="font-black text-[#0A0A0A] text-[13px] tracking-[0.18em]">
          SONATRACH
        </span>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <NavSection
          title={t("dashboard.title")}
          items={buildEmployeeItems()}
          location={location}
          t={t}
        />

        {(isFunctionalAdmin || isSystemAdmin) && (
          <>
            <div className="mx-4 my-3 border-t border-[#E5E5E5]" />
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
            <div className="mx-4 my-3 border-t border-[#E5E5E5]" />
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
            <div className="mx-4 my-3 border-t border-[#E5E5E5]" />
            <NavSection
              title={t("dashboard.sidebar.systemTools")}
              items={buildSystemItems()}
              location={location}
              t={t}
            />
          </>
        )}
      </nav>

      <div className="p-3 border-t border-[#E5E5E5]">
        <button
          onClick={handleLogout}
          className="w-full py-2.5 flex items-center justify-center gap-2 bg-[#0A0A0A] text-white text-[11px] uppercase tracking-[0.15em] font-bold hover:bg-black transition-colors"
        >
          <LogOut size={14} strokeWidth={2} />
          {t("common.logout")}
        </button>
      </div>
    </aside>
  );
}
