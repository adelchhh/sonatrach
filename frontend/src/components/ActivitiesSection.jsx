import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useT } from "../i18n/LanguageContext";
import runningImg from "../assets/activities/running.jpg";
import summerCampImg from "../assets/activities/summer-camp.jpg";
import bungalowImg from "../assets/activities/bungalow-stay.jpg";
import campingImg from "../assets/activities/camping.jpg";
import omraImg from "../assets/activities/omra.jpg";

function ActivityCard({ image, tag, title, subtitle, tall = false }) {
  return (
    <div
      className={`group relative overflow-hidden bg-black flex flex-col justify-end ${
        tall ? "h-[560px]" : "h-[270px]"
      }`}
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

      <div className="absolute top-4 left-4">
        <span className="px-2.5 py-1 bg-white text-black text-[10px] uppercase tracking-[0.18em] font-bold">
          {tag}
        </span>
      </div>

      <div className="absolute top-4 right-4">
        <button className="w-9 h-9 flex justify-center items-center bg-white/15 backdrop-blur-sm border border-white/25 hover:bg-[#ED8D31] hover:border-[#ED8D31] transition-colors text-white hover:text-black">
          <ArrowUpRight size={16} strokeWidth={2.2} />
        </button>
      </div>

      <div className="relative p-6">
        <h3
          className="text-white font-bold leading-[1.1] tracking-[-0.02em] mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
          style={{ fontSize: tall ? "32px" : "26px" }}
        >
          {title}
        </h3>
        <p className="text-white/80 text-[13px] leading-[1.6] line-clamp-2 max-w-[440px]">
          {subtitle}
        </p>
      </div>

      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#ED8D31] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
    </div>
  );
}

export default function ActivitiesSection() {
  const t = useT();

  return (
    <section className="bg-white py-16 lg:py-20" id="activities">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12">
        <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
          <div className="max-w-[760px]">
            <p className="text-[#ED8D31] text-[11px] uppercase tracking-[0.35em] font-bold mb-3">
              {t("homeSections.featuredTag")}
            </p>
            <h2 className="text-[#0A0A0A] text-[36px] lg:text-[44px] font-bold tracking-[-0.02em] leading-tight">
              {t("homeSections.featuredTitle")}
            </h2>
            <p className="text-[#525252] text-[14px] mt-3 leading-[1.7] max-w-[680px]">
              {t("homeSections.featuredSubtitle")}
            </p>
          </div>

          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] font-bold text-[#0A0A0A] hover:text-[#ED8D31] transition-colors whitespace-nowrap"
          >
            {t("hero.browseCatalog")} →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
    </section>
  );
}
