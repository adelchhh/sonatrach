import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../api";
import { useT } from "../../i18n/LanguageContext";

const defaultImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

function imageOf(activity) {
  const url = activity.image_url || activity.image;
  if (!url) return defaultImage;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
}

  function ActivityCard({ activity, featured = false, t }) {
    const categoryLabel =
      t(`categories.${activity.category}`) === `categories.${activity.category}`
        ? activity.category
        : t(`categories.${activity.category}`);
    const statusLabel =
      t(`statuses.${activity.status}`) === `statuses.${activity.status}`
        ? activity.status
        : t(`statuses.${activity.status}`);
    return (
      <Link
        to={`/activities/${activity.id}`}
        className={`relative overflow-hidden rounded-[24px] block group ${
          featured ? "h-[340px]" : "h-[300px]"
        }`}
      >
        <img
          src={imageOf(activity)}
          alt={activity.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
  
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(47,52,59,0.12) 0%, rgba(47,52,59,0.20) 45%, rgba(47,52,59,0.82) 100%)",
          }}
        />
  
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.92)] text-[#2F343B] text-xs font-semibold">
            {categoryLabel}
          </span>
        </div>

        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 rounded-full bg-[rgba(47,52,59,0.72)] text-white text-xs font-medium">
            {statusLabel}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-white text-[22px] font-bold leading-[110%] mb-2">
            {activity.title}
          </h3>
          <div className="text-[rgba(255,255,255,0.82)] text-sm">
            {categoryLabel} · {activity.demand_level}
          </div>
        </div>
      </Link>
    );
  }

export default function CatalogContent({ compact = false }) {
  const t = useT();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/activities")
      .then((res) => res.json())
      .then((data) => {
        setActivities(data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching activities:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const featured = activities.slice(0, 2);
  const others = activities.slice(2);

  if (loading) {
    return (
      <div className="px-4 py-10 text-center text-[#7A8088]">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className={compact ? "" : "px-4 py-10"}>
      <div className="w-full max-w-[1336px] mx-auto">
        <div className={`text-center ${compact ? "mb-8" : "mb-10"}`}>
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#E5E2DC] bg-white text-[#7A8088] text-sm mb-4">
            {t("catalog.tag")}
          </div>

          <h1 className="text-[#2F343B] text-[56px] font-extrabold leading-[100%] tracking-[-2px] mb-4">
            {t("catalog.title")}
          </h1>

          <p className="text-[#7A8088] text-lg leading-[170%] max-w-[700px] mx-auto">
            {t("catalog.subtitle")}
          </p>
        </div>

        <div className="mb-8 rounded-[20px] border border-[#E5E2DC] bg-white p-4 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder={t("catalog.searchPlaceholder")}
            className="flex-1 min-w-[220px] px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none"
          />

          <button className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-[#50565E]">
            {t("catalog.allTypes")}
          </button>

          <button className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-[#50565E]">
            {t("catalog.upcoming")}
          </button>

          <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white font-medium">
            {t("catalog.openOnly")}
          </button>
        </div>

        {activities.length === 0 ? (
          <div className="text-center text-[#7A8088] py-12">
            {t("catalog.noActivities")}
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <ActivityCard activity={featured[0]} featured t={t} />
                </div>

                {featured[1] && (
                  <div>
                    <ActivityCard activity={featured[1]} featured t={t} />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
              {others.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} t={t} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}