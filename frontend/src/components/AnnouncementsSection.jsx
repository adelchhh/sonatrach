import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { getPublicAnnouncements } from "../services/announcementService";

function formatDate(item) {
  const raw = item.publish_date || item.created_at?.slice(0, 10);
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d
    .toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

function shortText(text, max = 140) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function AnnouncementsSection() {
  const { t } = useLanguage();
  const railRef = useRef(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicAnnouncements()
      .then((data) => setAnnouncements(data.slice(0, 5)))
      .catch((err) => console.error("Failed to load announcements:", err))
      .finally(() => setLoading(false));
  }, []);

  const scrollLeft = () =>
    railRef.current?.scrollBy({ left: -336, behavior: "smooth" });
  const scrollRight = () =>
    railRef.current?.scrollBy({ left: 336, behavior: "smooth" });

  return (
    <section className="py-16 lg:py-20 bg-[#FAFAFA] border-y border-[#E5E5E5]">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12">
        <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
          <div className="max-w-[680px]">
            <p className="text-[#ED8D31] text-[11px] uppercase tracking-[0.35em] font-bold mb-3">
              {t("homeSections.announcementsTag")}
            </p>
            <h2 className="text-[#0A0A0A] text-[36px] lg:text-[42px] font-bold tracking-[-0.02em] leading-tight">
              {t("homeSections.announcementsTitle")}
            </h2>
            <p className="text-[#525252] text-[14px] mt-3 leading-[1.7] max-w-[620px]">
              {t("homeSections.announcementsSubtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/announcements"
              className="hidden md:inline-flex items-center px-5 py-2.5 bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[11px] uppercase tracking-[0.15em] font-bold text-[#0A0A0A] transition-colors"
            >
              {t("homeSections.seeAll")} →
            </Link>
            <div className="hidden md:flex gap-1">
              <button
                onClick={scrollLeft}
                className="w-9 h-9 flex items-center justify-center bg-white border border-[#E5E5E5] hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] transition-colors text-[#0A0A0A]"
              >
                ‹
              </button>
              <button
                onClick={scrollRight}
                className="w-9 h-9 flex items-center justify-center bg-white border border-[#E5E5E5] hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] transition-colors text-[#0A0A0A]"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-5 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[320px] h-[240px] bg-white border border-[#E5E5E5] animate-pulse"
              />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="border border-dashed border-[#E5E5E5] bg-white py-16 px-8 text-center">
            <p className="text-[13px] text-[#737373]">
              {t("homeSections.seeAll")}
            </p>
          </div>
        ) : (
          <div
            ref={railRef}
            className="flex gap-5 overflow-x-auto pb-3 scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            <style>{`section [ref] { scrollbar-width: none; } .hide-sb::-webkit-scrollbar { display: none; }`}</style>
            {announcements.map((item) => (
              <Link
                key={item.id}
                to={`/announcements/${item.id}`}
                className="group min-w-[320px] bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] transition-colors p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#ED8D31] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                <div className="flex items-center justify-between gap-3 mb-5">
                  <span className="px-2.5 py-1 bg-[#0A0A0A] text-white text-[10px] uppercase tracking-[0.18em] font-bold">
                    {t("homeSections.announcementsTag")}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A3A3A3] tabular-nums">
                    {formatDate(item)}
                  </span>
                </div>
                <h3 className="text-[#0A0A0A] text-[18px] font-bold tracking-[-0.015em] leading-tight mb-3 group-hover:text-[#ED8D31] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-[13px] text-[#525252] leading-[1.7] line-clamp-3">
                  {shortText(item.content)}
                </p>
              </Link>
            ))}
          </div>
        )}

        <Link
          to="/announcements"
          className="md:hidden inline-flex mt-6 items-center px-5 py-2.5 bg-white border border-[#E5E5E5] text-[11px] uppercase tracking-[0.15em] font-bold text-[#0A0A0A]"
        >
          {t("homeSections.seeAll")} →
        </Link>
      </div>
    </section>
  );
}
