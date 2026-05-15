import { Lightbulb } from "lucide-react";
import { useT, useLanguage } from "../i18n/LanguageContext";

const FEATURES = {
  en: [
    {
      title: "Simple and inviting",
      desc: "Short fields and clear structure make participation easier for every employee.",
    },
    {
      title: "Visible feedback culture",
      desc: "The section keeps engagement present on the public landing page without heavy admin content.",
    },
  ],
  fr: [
    {
      title: "Simple et accueillant",
      desc: "Des champs courts et une structure claire facilitent la participation de chaque employé.",
    },
    {
      title: "Culture du retour visible",
      desc: "La section maintient l'engagement présent sur la page d'accueil sans contenu administratif lourd.",
    },
  ],
};

const HEADING = {
  en: ["Encourage ideas,", "feedback and", "suggestions from", "every employee"],
  fr: ["Encouragez les", "idées, retours et", "suggestions de", "chaque employé"],
};

const DESCRIPTION = {
  en: "The landing page ends with a simple contribution area so employees can quickly suggest an activity, share feedback or propose an improvement.",
  fr: "La page d'accueil se termine par une zone de contribution simple permettant aux employés de suggérer rapidement une activité, partager un retour ou proposer une amélioration.",
};

const FORM = {
  en: {
    category: "Category",
    categoryPlaceholder: "Activity suggestion",
    title: "Title",
    titlePlaceholder: "Ex: cultural stay in Constantine",
    description: "Description",
    descriptionPlaceholder:
      "Describe your idea, who it benefits and why it would improve the employee experience.",
    submit: "Submit idea",
  },
  fr: {
    category: "Catégorie",
    categoryPlaceholder: "Suggestion d'activité",
    title: "Titre",
    titlePlaceholder: "Ex : séjour culturel à Constantine",
    description: "Description",
    descriptionPlaceholder:
      "Décrivez votre idée, à qui elle profite et pourquoi elle améliorerait l'expérience employé.",
    submit: "Soumettre l'idée",
  },
};

export default function IdeasSection() {
  const t = useT();
  const { lang } = useLanguage();
  const features = FEATURES[lang] || FEATURES.en;
  const heading = HEADING[lang] || HEADING.en;
  const description = DESCRIPTION[lang] || DESCRIPTION.en;
  const form = FORM[lang] || FORM.en;

  return (
    <section className="bg-[#FAFAFA] border-t border-[#E5E5E5] py-16 lg:py-20" id="ideas">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E5E5E5] p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FAFAFA] border border-[#E5E5E5] mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ED8D31]" />
              <span className="text-[#0A0A0A] text-[10px] uppercase tracking-[0.2em] font-bold">
                {t("homeSections.ideasTag")}
              </span>
            </div>

            <h2
              className="text-[#0A0A0A] font-bold leading-[1.02] tracking-[-0.025em] max-w-[540px]"
              style={{ fontSize: "clamp(34px, 4.2vw, 50px)" }}
            >
              {heading.map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < heading.length - 1 && <br />}
                </span>
              ))}
            </h2>

            <p className="text-[#525252] text-[14px] leading-[1.75] max-w-[500px] mt-6">
              {description}
            </p>

            <div className="space-y-3 mt-8">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-[#FAFAFA] border border-[#E5E5E5] hover:border-[#0A0A0A] transition-colors px-6 py-5"
                >
                  <div className="w-10 h-10 flex justify-center items-center flex-shrink-0 bg-[#0A0A0A] text-[#ED8D31]">
                    <Lightbulb size={18} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-[#0A0A0A] text-[14px] font-bold tracking-tight leading-tight mb-1">
                      {f.title}
                    </h3>
                    <p className="text-[#525252] text-[12px] leading-[1.65]">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E5] p-8 lg:p-10 flex flex-col">
            <div className="flex-1 space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] mb-2">
                  {form.category}
                </label>
                <div className="px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] min-h-[48px] flex items-center">
                  <span className="text-[#A3A3A3] text-[13px]">
                    {form.categoryPlaceholder}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] mb-2">
                  {form.title}
                </label>
                <div className="px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] min-h-[48px] flex items-center">
                  <span className="text-[#A3A3A3] text-[13px]">
                    {form.titlePlaceholder}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] mb-2">
                  {form.description}
                </label>
                <div className="px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] min-h-[140px]">
                  <span className="text-[#A3A3A3] text-[13px] leading-[1.65]">
                    {form.descriptionPlaceholder}
                  </span>
                </div>
              </div>
            </div>

            <button className="mt-7 w-full inline-flex items-center justify-center px-6 py-3.5 bg-[#ED8D31] text-black text-[12px] uppercase tracking-[0.15em] font-bold hover:bg-[#fa9d40] transition-colors">
              {form.submit}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
