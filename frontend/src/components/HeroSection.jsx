import { useEffect, useState } from "react";
import { useT } from "../i18n/LanguageContext";

import hero1 from "../assets/hero/hero1.jpg";
import hero2 from "../assets/hero/hero2.jpg";
import hero3 from "../assets/hero/hero3.jpg";

const heroImages = [hero1, hero2, hero3];

export default function HeroSection() {
  const t = useT();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center px-4 pb-10">
      <div className="w-full max-w-[1336px]">
        <div className="flex flex-col gap-5 mb-8">
          <h1 className="text-[#2F343B] font-extrabold tracking-[-2px] text-[48px]">
            {t("hero.title")}
          </h1>

          <p className="text-[#7A8088] max-w-[600px]">{t("hero.subtitle")}</p>

          <div className="flex gap-3">
            <button
              onClick={() =>
                document
                  .getElementById("activities")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-5 py-3 rounded-lg bg-[#ED8D31] text-white"
            >
              {t("hero.ctaActivities")}
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("announcements")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-5 py-3 rounded-lg border"
            >
              {t("nav.announcements")}
            </button>
          </div>
        </div>

        <div className="relative h-[600px] rounded-[30px] overflow-hidden">
          {heroImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
            <h2 className="text-[42px] font-bold">{t("hero.tag")}</h2>

            <p className="max-w-[500px] mt-3">{t("hero.subtitle")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
