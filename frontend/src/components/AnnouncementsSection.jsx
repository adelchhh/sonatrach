import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { getPublicAnnouncements } from "../services/announcementService";

function formatDate(item) {
  return item.publish_date || item.created_at?.slice(0, 10) || "";
}

function shortText(text, max = 140) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
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

  const scrollLeft = () => {
    railRef.current?.scrollBy({ left: -336, behavior: "smooth" });
  };

  const scrollRight = () => {
    railRef.current?.scrollBy({ left: 336, behavior: "smooth" });
  };

  return (
    <section className="py-20 bg-[#F7F7F5]">
      <div className="max-w-[1180px] mx-auto px-4">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-sm font-bold text-[#ED8D31] uppercase tracking-[0.18em]">
              {t("homeSections.announcementsTag")}
            </p>

            <h2 className="text-[38px] font-bold text-[#2F343B] mt-3">
              {t("homeSections.announcementsTitle")}
            </h2>

            <p className="text-[#7A8088] mt-3 max-w-[620px]">
              {t("homeSections.announcementsSubtitle")}
            </p>
          </div>

          <Link
            to="/announcements"
            className="hidden md:inline-flex px-5 py-3 rounded-full bg-white border border-[#E5E2DC] text-sm font-semibold text-[#2F343B]"
          >
            {t("homeSections.seeAll")}
          </Link>
        </div>

        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 rounded-full bg-white border border-[#E5E2DC]"
          >
            ◀
          </button>
          <button
            onClick={scrollRight}
            className="w-10 h-10 rounded-full bg-white border border-[#E5E2DC]"
          >
            ▶
          </button>
        </div>

        {loading ? (
          <p className="text-[#7A8088]">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p className="text-[#7A8088]">No announcements available yet.</p>
        ) : (
          <div
            ref={railRef}
            className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
          >
            {announcements.map((item) => (
              <Link
                key={item.id}
                to={`/announcements/${item.id}`}
                className="min-w-[310px] bg-white rounded-[24px] border border-[#E5E2DC] p-5 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="px-3 py-1 rounded-full bg-[#F3C38F] text-[#2F343B] text-xs font-bold">
                    Announcement
                  </span>

                  <span className="text-xs text-[#7A8088]">
                    {formatDate(item)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#2F343B] mt-5">
                  {item.title}
                </h3>

                <p className="text-sm text-[#7A8088] mt-3 leading-[170%]">
                  {shortText(item.content)}
                </p>
              </Link>
            ))}
          </div>
        )}

        <Link
          to="/announcements"
          className="md:hidden inline-flex mt-6 px-5 py-3 rounded-full bg-white border border-[#E5E2DC] text-sm font-semibold text-[#2F343B]"
        >
          {t("homeSections.seeAll")}
        </Link>
      </div>
    </section>
  );
}