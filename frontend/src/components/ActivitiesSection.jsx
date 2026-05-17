import { Link } from "react-router-dom";
import { useT } from "../i18n/LanguageContext";
import runningImg from "../assets/activities/running.jpg";
import summerCampImg from "../assets/activities/summer-camp.jpg";
import bungalowImg from "../assets/activities/bungalow-stay.jpg";
import campingImg from "../assets/activities/camping.jpg";
import omraImg from "../assets/activities/omra.jpg";

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M5.25 5.25H12.75V12.75M5.25 12.75L12.75 5.25"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function ActivityCard({ image, tag, title, subtitle, tall = false }) {
  return (
    <div
      className={`relative rounded-[24px] overflow-hidden bg-white flex flex-col justify-end ${
        tall ? "h-[560px]" : "h-[270px]"
      }`}
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(47,52,59,0.04) 0%, rgba(47,52,59,0.18) 45%, rgba(47,52,59,0.76) 100%)",
        }}
      />

      <div className="absolute top-[18px] left-[18px]">
        <span className="px-3 py-[6.5px] rounded-full bg-[rgba(255,255,255,0.88)] text-[#2F343B] text-xs font-semibold">
          {tag}
        </span>
      </div>

      <div className="absolute top-[18px] right-[18px]">
        <button className="w-[38px] h-[38px] flex justify-center items-center rounded-full bg-[rgba(255,255,255,0.18)] backdrop-blur-[4px] hover:bg-[rgba(255,255,255,0.28)] transition-colors">
          <ArrowIcon />
        </button>
      </div>

      <div className="relative flex flex-col gap-[5px] p-[22px]">
        <h3
          className="text-white font-bold leading-[102%] tracking-[-1.2px]"
          style={{ fontSize: tall ? "30px" : "28px" }}
        >
          {title}
        </h3>
        <p className="text-[rgba(255,255,255,0.84)] text-[13px] leading-[150%]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default function ActivitiesSection() {
  const t = useT();

  return (
    <div className="flex flex-col items-center px-4 py-8 gap-8" id="activities">
      <div className="w-full max-w-[1336px]">
        <div className="flex justify-between items-end mb-[42px]">
          <div className="flex flex-col gap-[10px]">
            <span className="text-[#ED8D31] text-[13px] font-semibold">
              {t("homeSections.featuredTag")}
            </span>
            <h2 className="text-[#2F343B] text-[42px] font-extrabold leading-[103%] tracking-[-2.1px]">
              {t("homeSections.featuredTitle")}
            </h2>
            <p className="text-[#7A8088] text-base font-normal leading-[170%] max-w-[760px]">
              {t("homeSections.featuredSubtitle")}
            </p>
          </div>

          <Link
            to="/catalog"
            className="text-[#ED8D31] text-sm font-semibold leading-[21px] whitespace-nowrap"
          >
            {t("hero.browseCatalog")}
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <ActivityCard
            image={runningImg}
            tag={t("categories.SPORT")}
            title={t("homeSections.activitiesData.running.title")}
            subtitle={t("homeSections.activitiesData.running.subtitle")}
            tall
          />

          <div className="flex flex-col gap-5">
            <ActivityCard
              image={summerCampImg}
              tag={t("categories.FAMILY")}
              title={t("homeSections.activitiesData.summerCamp.title")}
              subtitle={t("homeSections.activitiesData.summerCamp.subtitle")}
            />
            <ActivityCard
              image={bungalowImg}
              tag={t("categories.STAY")}
              title={t("homeSections.activitiesData.bungalow.title")}
              subtitle={t("homeSections.activitiesData.bungalow.subtitle")}
            />
          </div>

          <div className="flex flex-col gap-5">
            <ActivityCard
              image={campingImg}
              tag={t("categories.NATURE")}
              title={t("homeSections.activitiesData.camping.title")}
              subtitle={t("homeSections.activitiesData.camping.subtitle")}
            />
            <ActivityCard
              image={omraImg}
              tag={t("categories.SPIRITUAL")}
              title={t("homeSections.activitiesData.omra.title")}
              subtitle={t("homeSections.activitiesData.omra.subtitle")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
