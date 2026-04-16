import { Link, useLocation } from "react-router-dom";

const employeeItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "📊",
  },
  {
    label: "Activities Catalog",
    path: "/dashboard/catalog",
    icon: "🏕",
  },
  {
    label: "My Requests",
    path: "/dashboard/requests",
    icon: "📄",
    badge: "3",
  },
  {
    label: "Draw Results",
    path: "/dashboard/draw",
    icon: "🎯",
  },
  {
    label: "Documents",
    path: "/dashboard/documents",
    icon: "📁",
  },
  {
    label: "Participation History",
    path: "/dashboard/history",
    icon: "🕒",
  },
  {
    label: "Surveys",
    path: "/dashboard/surveys",
    icon: "📋",
  },
  {
    label: "Idea Box",
    path: "/dashboard/ideas",
    icon: "💡",
  },
];

const adminItems = [
  {
    label: "Manage Activities",
    path: "/dashboard/admin/activities",
    icon: "⚙️",
  },
  {
    label: "Manage Site",
    path: "/dashboard/admin/site",
    icon: "🏢",
  },
  {
    label: "Manage Registrations",
    path: "/dashboard/admin/registrations",
    icon: "📝",
  },
  {
    label: "Launch Draw",
    path: "/dashboard/admin/draw",
    icon: "🎯",
  },
  {
    label: "Withdrawals",
    path: "/dashboard/admin/withdrawals",
    icon: "↩️",
    badge: "4",
  },
  {
    label: "Reports",
    path: "/dashboard/admin/reports",
    icon: "📊",
  },
  {
    label: "Draw History",
    path: "/dashboard/admin/draw-history",
    icon: "🕘",
  },
];

function NavSection({ title, items, location }) {
  return (
    <div className="mb-4">
      <p className="px-4 mb-2 text-xs font-semibold text-[#7A8088]">
        {title}
      </p>

      {items.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1 ${
              isActive
                ? "bg-[#ED8D31] text-white"
                : "text-[#7A8088] hover:bg-[#F5F4F1] hover:text-[#2F343B]"
            }`}
          >
            <span>{item.icon}</span>

            <span className="flex-1 text-[13px]">{item.label}</span>

            {item.badge && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isActive
                    ? "bg-white text-[#ED8D31]"
                    : "bg-[#ED8D31] text-white"
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside className="w-[240px] min-w-[240px] h-screen bg-white border-r border-[#E5E2DC] flex flex-col sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-[#E5E2DC]">
        <div className="w-8 h-8 rounded-lg bg-[#ED8D31] flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <span className="font-bold text-[#2F343B] text-sm tracking-tight">
          SONATRACH
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <NavSection
          title="Employee space"
          items={employeeItems}
          location={location}
        />

        <div className="my-3 border-t border-[#E5E2DC]" />

        <NavSection
          title="Admin tools"
          items={adminItems}
          location={location}
        />
      </nav>

      {/* Bottom role card */}
      <div className="p-3 border-t border-[#E5E2DC]">
        <div className="rounded-[16px] bg-[#F5F4F1] p-3">
          <p className="text-xs text-[#7A8088] mb-2">Connected role</p>
          <p className="text-sm font-semibold text-[#2F343B] mb-2">
            Employee + Functional Admin
          </p>
          <p className="text-xs text-[#7A8088] leading-[160%]">
            You keep access to your personal employee tools while managing
            activities, quotas, registrations, draws, withdrawals, and reporting.
          </p>
        </div>
      </div>
    </aside>
  );
}