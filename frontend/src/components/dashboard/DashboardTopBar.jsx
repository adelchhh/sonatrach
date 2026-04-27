import { useNavigate } from "react-router-dom";
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

  const initial =
    (user?.first_name || user?.name || "?").charAt(0).toUpperCase();
  const displayName = user
    ? `${user.first_name || ""} ${(user.name || "").charAt(0)}.`.trim()
    : "—";
  const role = user?.roles?.[0] || "";
  const roleLabel = role
    ? t(`statuses.${role}`) === `statuses.${role}`
      ? role
      : t(`statuses.${role}`)
    : "";

  return (
    <header className="h-[60px] bg-white border-b border-[#E5E2DC] flex items-center px-6 gap-4 sticky top-0 z-40">
      <div className="flex-1 max-w-[360px]">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[#E5E2DC] bg-[#F5F4F1]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="#7A8088" strokeWidth="1.33333" />
            <path
              d="M10.5 10.5L13.5 13.5"
              stroke="#7A8088"
              strokeWidth="1.33333"
              strokeLinecap="round"
            />
          </svg>

          <input
            type="text"
            placeholder={t("dashboard.topbar.searchPlaceholder")}
            className="bg-transparent text-sm text-[#2F343B] placeholder:text-[#7A8088] outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="flex min-h-[42px] p-1 items-center gap-1 rounded-full border border-[#E5E2DC] bg-[rgba(255,255,255,0.88)]">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`flex h-8 min-w-[38px] px-[11.5px] justify-center items-center rounded-full transition-colors ${
              lang === "en" ? "bg-[#ED8D31]" : ""
            }`}
          >
            <span
              className={`text-xs font-semibold ${
                lang === "en" ? "text-white" : "text-[#7A8088]"
              }`}
            >
              EN
            </span>
          </button>

          <button
            type="button"
            onClick={() => setLang("fr")}
            className={`flex h-8 min-w-[38px] px-[10.7px] justify-center items-center rounded-full transition-colors ${
              lang === "fr" ? "bg-[#ED8D31]" : ""
            }`}
          >
            <span
              className={`text-xs font-semibold ${
                lang === "fr" ? "text-white" : "text-[#7A8088]"
              }`}
            >
              FR
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/notifications")}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-[#E5E2DC] bg-white hover:bg-[#F5F4F1] transition-colors"
          title={t("dashboard.sidebar.notifications")}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 1.5C6.1 1.5 3.75 3.85 3.75 6.75v.75L2.25 10.5v.75h13.5v-.75L14.25 7.5v-.75C14.25 3.85 11.9 1.5 9 1.5z"
              stroke="#2F343B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.75 11.25v.75A2.25 2.25 0 0 0 11.25 12v-.75"
              stroke="#2F343B"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="hidden sm:inline-flex items-center px-3 h-9 rounded-xl border border-[#E5E2DC] bg-white text-sm text-[#2F343B] hover:bg-[#F5F4F1] transition-colors"
          title={t("common.logout")}
        >
          {t("common.logout")}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#2F343B] leading-tight">
              {displayName}
            </p>
            <p className="text-xs text-[#7A8088] leading-tight">{roleLabel}</p>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#ED8D31] flex items-center justify-center overflow-hidden flex-shrink-0">
            <span className="text-white text-sm font-bold">{initial}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
