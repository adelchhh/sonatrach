import { useNavigate } from "react-router-dom";
import { Search, Bell, LogOut } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { getCurrentUser } from "../../api";

export default function DashboardTopBar() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const user = getCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const initial = (user?.first_name || user?.name || "?")
    .charAt(0)
    .toUpperCase();
  const displayName = user
    ? `${user.first_name || ""} ${(user.name || "").charAt(0)}.`.trim()
    : "—";
  const role = user?.roles?.[0] || "";
  const roleTr = role ? t(`statuses.${role}`) : "";
  const roleLabel =
    roleTr && roleTr !== `statuses.${role}` ? roleTr : role || "";

  return (
    <header className="h-[60px] bg-white border-b border-[#E5E5E5] flex items-center px-6 lg:px-8 gap-5 sticky top-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-[420px]">
        <div className="flex items-center gap-2.5 px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus-within:border-[#0A0A0A] focus-within:bg-white transition-colors">
          <Search size={14} strokeWidth={2} className="text-[#737373]" />
          <input
            type="text"
            placeholder={t("dashboard.topbar.searchPlaceholder")}
            className="bg-transparent text-[13px] text-[#0A0A0A] placeholder:text-[#A3A3A3] outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Lang switch */}
        <div className="flex items-center border border-[#E5E5E5] overflow-hidden">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-3 h-8 text-[10px] uppercase tracking-[0.15em] font-bold transition-colors ${
              lang === "en"
                ? "bg-[#0A0A0A] text-white"
                : "text-[#737373] hover:text-[#0A0A0A]"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang("fr")}
            className={`px-3 h-8 text-[10px] uppercase tracking-[0.15em] font-bold transition-colors border-l border-[#E5E5E5] ${
              lang === "fr"
                ? "bg-[#0A0A0A] text-white"
                : "text-[#737373] hover:text-[#0A0A0A]"
            }`}
          >
            FR
          </button>
        </div>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => navigate("/dashboard/notifications")}
          className="relative w-9 h-9 flex items-center justify-center bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] transition-colors"
          title={t("dashboard.sidebar.notifications")}
        >
          <Bell size={14} strokeWidth={2} className="text-[#0A0A0A]" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#ED8D31]" />
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="hidden md:inline-flex items-center gap-2 px-3.5 h-9 bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[10px] uppercase tracking-[0.15em] font-bold text-[#0A0A0A] transition-colors"
          title={t("common.logout")}
        >
          <LogOut size={13} strokeWidth={2} />
          {t("common.logout")}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#E5E5E5]">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-bold text-[#0A0A0A] leading-tight">
              {displayName}
            </p>
            {roleLabel && (
              <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#737373] leading-tight mt-0.5">
                {roleLabel}
              </p>
            )}
          </div>
          <div
            className="w-9 h-9 flex items-center justify-center text-white text-[13px] font-black"
            style={{
              background:
                "linear-gradient(135deg, #ED8D31 0%, #B5560F 100%)",
            }}
          >
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
