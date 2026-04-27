import { useT } from "../i18n/LanguageContext";

export default function Footer() {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <div className="flex justify-center px-4 pt-8 pb-4">
      <div className="w-full max-w-[1336px] flex justify-between items-center border-t border-[#E5E2DC] pt-6">
        <div className="text-[#7A8088] text-sm font-normal">
          {t("footer.copyright", { year })}
        </div>

        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-[#7A8088] text-sm hover:text-[#2F343B] transition-colors"
          >
            {t("footer.legal")}
          </a>
          <a
            href="#"
            className="text-[#7A8088] text-sm hover:text-[#2F343B] transition-colors"
          >
            {t("footer.contact")}
          </a>
          <a
            href="#"
            className="text-[#7A8088] text-sm hover:text-[#2F343B] transition-colors"
          >
            {t("footer.privacy")}
          </a>
        </div>
      </div>
    </div>
  );
}
