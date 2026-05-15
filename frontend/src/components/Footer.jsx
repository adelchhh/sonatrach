import { useT } from "../i18n/LanguageContext";

export default function Footer() {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white mt-16">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 flex items-center justify-center font-black text-white text-base"
                style={{
                  background:
                    "linear-gradient(135deg, #ED8D31 0%, #B5560F 100%)",
                }}
              >
                S
              </div>
              <p className="font-black text-[14px] tracking-[0.18em]">
                SONATRACH
              </p>
            </div>
            <p className="text-white/55 text-[12px] leading-[1.7]">
              Plateforme socio-activités · Direction Centrale Capital Humain. Au
              service des collaborateurs depuis 1963.
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/45 mb-4">
              Plateforme
            </p>
            <ul className="space-y-2.5 text-[13px]">
              <FooterLink href="/catalog">Catalogue</FooterLink>
              <FooterLink href="/announcements">Annonces</FooterLink>
              <FooterLink href="/login">Connexion</FooterLink>
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
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/45 mb-4">
              Légal
            </p>
            <ul className="space-y-2.5 text-[13px]">
              <FooterLink href="#">{t("footer.legal")}</FooterLink>
              <FooterLink href="#">{t("footer.contact")}</FooterLink>
              <FooterLink href="#">{t("footer.privacy")}</FooterLink>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-wrap justify-between items-center gap-3">
          <p className="text-white/40 text-[11px] uppercase tracking-[0.25em]">
            {t("footer.copyright", { year })}
          </p>
          <p className="text-white/40 text-[11px] uppercase tracking-[0.25em] tabular-nums">
            Plateforme v.2.6
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }) {
  return (
    <li>
      <a
        href={href}
        className="text-white/65 hover:text-[#ED8D31] transition-colors"
      >
        {children}
      </a>
    </li>
  );
}
