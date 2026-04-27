import { useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

const announcements = [
  {
    tagKey: "official",
    tagBg: "#F3C38F",
    tagColor: "#2F343B",
    dateKey: "today",
  },
  {
    tagKey: "health",
    tagBg: "#3FA56B",
    tagColor: "#FFFFFF",
    dateKey: "yesterday",
  },
  {
    tagKey: "social",
    tagBg: "#F2B54A",
    tagColor: "#2F343B",
    date: "12 Oct 2026",
  },
  {
    tagKey: "survey",
    tagBg: "#F1F0EC",
    tagColor: "#50565E",
    date: "10 Oct 2026",
  },
  {
    tagKey: "reminder",
    tagBg: "#F3C38F",
    tagColor: "#2F343B",
    date: "08 Oct 2026",
  },
];

const TAG_LABELS = {
  en: {
    official: "Official note",
    health: "Health",
    social: "Social event",
    survey: "Survey",
    reminder: "Reminder",
  },
  fr: {
    official: "Note officielle",
    health: "Santé",
    social: "Événement social",
    survey: "Sondage",
    reminder: "Rappel",
  },
};

const ITEM_TEXTS = {
  en: {
    today: "Today · 09:00",
    yesterday: "Yesterday · 14:30",
    titles: [
      "Registration opens for winter family trips",
      "On-site medical campaign this week",
      "Weekend community gathering in Algiers",
      "New employee satisfaction survey is live",
      "Document deadline for approved beneficiaries",
    ],
    descriptions: [
      "Employees can browse new seasonal stays, participation rules and available quotas directly from the activity pages.",
      "Schedules, reminders and practical guidance are grouped in one visible communication format for all employees.",
      "Join sports, culture and family-friendly moments with a clearer event announcement and participation path.",
      "Share your feedback and help improve activities, communication flows and community engagement across the platform.",
      "Accepted participants can upload the required files before validation through the next steps of the activity flow.",
    ],
  },
  fr: {
    today: "Aujourd'hui · 09:00",
    yesterday: "Hier · 14:30",
    titles: [
      "Inscriptions ouvertes pour les voyages d'hiver en famille",
      "Campagne médicale sur site cette semaine",
      "Rencontre communautaire le week-end à Alger",
      "Nouveau sondage de satisfaction employé en ligne",
      "Date limite des documents pour les bénéficiaires acceptés",
    ],
    descriptions: [
      "Les employés peuvent consulter les nouveaux séjours saisonniers, règles de participation et quotas disponibles directement depuis les pages d'activités.",
      "Horaires, rappels et conseils pratiques sont regroupés dans un format de communication clair et visible pour tous les employés.",
      "Rejoignez le sport, la culture et les moments en famille avec une annonce d'événement plus claire et un parcours d'inscription simplifié.",
      "Partagez votre avis et aidez à améliorer les activités, la communication et l'engagement communautaire sur la plateforme.",
      "Les participants acceptés peuvent téléverser les documents requis avant validation lors des étapes suivantes de l'activité.",
    ],
  },
};

export default function AnnouncementsSection() {
  const { t, lang } = useLanguage();
  const railRef = useRef(null);
  const tags = TAG_LABELS[lang] || TAG_LABELS.en;
  const texts = ITEM_TEXTS[lang] || ITEM_TEXTS.en;

  const scrollLeft = () => {
    railRef.current?.scrollBy({ left: -336, behavior: "smooth" });
  };

  const scrollRight = () => {
    railRef.current?.scrollBy({ left: 336, behavior: "smooth" });
  };

  return (
    <div className="flex justify-center px-4 py-8" id="announcements">
      <div className="w-full max-w-[1336px] rounded-[28px] border border-[rgba(229,226,220,0.92)] bg-[rgba(255,255,255,0.82)] backdrop-blur-[5px] p-[35px]">
        <div className="flex justify-between items-end mb-8">
          <div className="flex flex-col gap-[10px]">
            <span className="text-[#ED8D31] text-[13px] font-semibold">
              {t("homeSections.announcementsTag")}
            </span>

            <h2 className="text-[#2F343B] text-[42px] font-extrabold">
              {t("homeSections.announcementsTitle")}
            </h2>

            <p className="text-[#7A8088] text-base max-w-[760px]">
              {t("homeSections.announcementsSubtitle")}
            </p>
          </div>

          <Link
            to="/announcements"
            className="text-[#ED8D31] text-sm font-semibold"
          >
            {t("homeSections.seeAll")}
          </Link>
        </div>

        <div className="flex justify-end items-center mb-5">
          <div className="flex gap-[10px]">
            <button
              onClick={scrollLeft}
              className="w-[38px] h-[38px] rounded-full border bg-white"
            >
              ◀
            </button>
            <button
              onClick={scrollRight}
              className="w-[38px] h-[38px] rounded-full border bg-white"
            >
              ▶
            </button>
          </div>
        </div>

        <div ref={railRef} className="flex gap-4 overflow-x-auto pb-1">
          {announcements.map((item, i) => {
            const dateText = item.dateKey ? texts[item.dateKey] : item.date;
            return (
              <div
                key={i}
                className="flex-shrink-0 w-[320px] p-6 rounded-[22px] border h-[288px]"
              >
                <div className="flex justify-between items-center mb-3">
                  <span
                    className="px-[10px] py-[6px] rounded-full text-xs font-semibold"
                    style={{ background: item.tagBg, color: item.tagColor }}
                  >
                    {tags[item.tagKey]}
                  </span>

                  <span className="text-[#7A8088] text-xs">{dateText}</span>
                </div>

                <h3 className="text-[#2F343B] text-xl font-bold mb-2">
                  {texts.titles[i]}
                </h3>

                <p className="text-[#7A8088] text-sm">
                  {texts.descriptions[i]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
