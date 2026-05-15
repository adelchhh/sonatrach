import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[620px] bg-[#0A0A0A] overflow-hidden">
      {/* Image carousel with cross-fade + ken-burns */}
      <AnimatePresence mode="sync">
        <motion.img
          key={current}
          src={heroImages[current]}
          alt=""
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.75, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{
            opacity: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: 6, ease: "linear" },
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Layered gradient — strong on left, gentle elsewhere */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

      {/* Subtle grain */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Orange top accent */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-[#ED8D31] z-10" />

      {/* Main content */}
      <div className="relative h-full max-w-[1400px] mx-auto px-8 lg:px-12 flex flex-col justify-end pb-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[820px]"
        >
          <p className="text-[#ED8D31] text-[11px] uppercase tracking-[0.4em] font-bold mb-5">
            {t("hero.tag")}
          </p>
          <h1
            className="text-white font-bold leading-[1.04] tracking-[-0.025em] mb-6 drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)]"
            style={{ fontSize: "clamp(38px, 5.4vw, 68px)" }}
          >
            {t("hero.title")}
          </h1>
          <p className="text-white/85 text-[16px] leading-[1.7] max-w-[600px] mb-8">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                document
                  .getElementById("activities")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center px-7 py-3.5 bg-[#ED8D31] text-black text-[12px] uppercase tracking-[0.18em] font-bold hover:bg-[#fa9d40] transition-colors"
            >
              {t("hero.ctaActivities")}
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("announcements")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center px-7 py-3.5 bg-white/10 backdrop-blur-sm border border-white/25 text-white text-[12px] uppercase tracking-[0.18em] font-bold hover:bg-white/20 transition-colors"
            >
              {t("nav.announcements")}
            </button>
          </div>
        </motion.div>

        {/* Slider dots */}
        <div className="absolute bottom-8 right-8 lg:right-12 flex gap-2 z-10">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-[3px] transition-all duration-500 ${
                i === current ? "w-10 bg-[#ED8D31]" : "w-4 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
