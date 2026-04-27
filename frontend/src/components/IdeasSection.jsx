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
    <div className="flex justify-center px-4 py-12" id="ideas">
      <div className="w-full max-w-[1336px]">
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-[28px] border border-[rgba(229,226,220,0.92)] bg-[rgba(255,255,255,0.82)] backdrop-blur-[5px] p-[30px] flex flex-col gap-[13.2px]">
            <div className="flex items-center gap-2 w-fit px-[14px] py-[6.25px] rounded-full bg-[rgba(255,255,255,0.76)] backdrop-blur-[5px]">
              <div className="w-[7px] h-[7px] rounded-full bg-[#ED8D31]" />
              <span className="text-[#50565E] text-[13px] font-semibold leading-[19.5px]">
                {t("homeSections.ideasTag")}
              </span>
            </div>

            <h2
              className="text-[#2F343B] font-extrabold leading-[96%] tracking-[-3.24px] max-w-[520px]"
              style={{ fontSize: "54px" }}
            >
              {heading.map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < heading.length - 1 && <br />}
                </span>
              ))}
            </h2>

            <p className="text-[#7A8088] text-base font-normal leading-[175%] max-w-[500px]">
              {description}
            </p>

            <div className="flex flex-col gap-[14px] pt-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="flex gap-[14px] px-[40px] py-[18px] rounded-[18px] border border-[rgba(229,226,220,0.86)] bg-[rgba(245,244,241,0.76)]"
                >
                  <div className="w-[42px] h-[42px] flex justify-center items-center flex-shrink-0 rounded-[14px] bg-[rgba(255,255,255,0.92)]">
                    <span className="text-[#ED8D31] text-xl">💡</span>
                  </div>
                  <div className="flex flex-col gap-[3px]">
                    <h3 className="text-[#2F343B] text-base font-bold leading-[120%]">
                      {f.title}
                    </h3>
                    <p className="text-[#7A8088] text-sm font-normal leading-[160%]">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[rgba(229,226,220,0.92)] bg-[rgba(255,255,255,0.82)] backdrop-blur-[5px] p-[30px]">
            <div className="rounded-[24px] border border-[rgba(229,226,220,0.90)] bg-[rgba(255,255,255,0.96)] p-6 flex flex-col gap-[13.5px] relative min-h-[420px]">
              <div className="flex flex-col gap-2">
                <label className="text-[#2F343B] text-[13px] font-semibold leading-[19.5px]">
                  {form.category}
                </label>
                <div className="flex items-center gap-2 px-[14px] py-[12px] rounded-[14px] border border-[#E5E2DC] bg-[#F5F4F1] min-h-[48px]">
                  <span className="text-[#7A8088] text-sm">
                    {form.categoryPlaceholder}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#2F343B] text-[13px] font-semibold leading-[19.5px]">
                  {form.title}
                </label>
                <div className="flex items-center gap-2 px-[14px] py-[12px] rounded-[14px] border border-[#E5E2DC] bg-[#F5F4F1] min-h-[48px]">
                  <span className="text-[#7A8088] text-sm">
                    {form.titlePlaceholder}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#2F343B] text-[13px] font-semibold leading-[19.5px]">
                  {form.description}
                </label>
                <div className="flex items-start gap-2 px-[14px] py-[11.5px] rounded-[14px] border border-[#E5E2DC] bg-[#F5F4F1] min-h-[130px]">
                  <span className="text-[#7A8088] text-sm leading-[165%] pt-1">
                    {form.descriptionPlaceholder}
                  </span>
                </div>
              </div>

              <button className="flex items-center justify-center min-h-[46px] px-[18px] rounded-lg bg-[#ED8D31] text-white text-sm font-medium hover:bg-[#d47d29] transition-colors absolute bottom-6 left-6 right-6">
                {form.submit}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
