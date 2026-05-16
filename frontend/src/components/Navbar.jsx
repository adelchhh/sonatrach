import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import sonatrachLogo from "../assets/logo/sonatrach_logo2-1024x1024.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, setLang } = useLanguage();

  const goToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5]">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12 h-[68px] flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 group"
        >
          <img
            src={sonatrachLogo}
            alt="Sonatrach"
            className="w-14 h-14 object-contain"
          />
          <span className="font-black text-[#0A0A0A] text-[15px] tracking-[0.18em]">
            SONATRACH
          </span>
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink onClick={() => goToSection("activities")}>
            {t("nav.activities")}
          </NavLink>
          <NavLink onClick={() => goToSection("announcements")}>
            {t("nav.announcements")}
          </NavLink>
          <NavLink onClick={() => goToSection("ideas")}>
            {t("nav.ideas")}
          </NavLink>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
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
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`px-3 h-8 text-[10px] uppercase tracking-[0.15em] font-bold transition-colors border-l border-[#E5E5E5] ${
                lang === "ar"
                  ? "bg-[#0A0A0A] text-white"
                  : "text-[#737373] hover:text-[#0A0A0A]"
              }`}
            >
              AR
            </button>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center px-5 h-9 bg-[#ED8D31] text-black text-[11px] uppercase tracking-[0.15em] font-bold hover:bg-[#fa9d40] transition-colors"
          >
            {t("nav.login")}
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-[12px] uppercase tracking-[0.15em] font-bold text-[#0A0A0A] hover:text-[#ED8D31] transition-colors"
    >
      {children}
    </button>
  );
}
