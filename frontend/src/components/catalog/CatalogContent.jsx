import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, apiGet } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageHero,
  Toolbar,
  SearchInput,
  FilterChip,
  EmptyState,
  Button,
  SectionHeader,
} from "../ui/Studio";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

const POSTER_FALLBACKS = [
  "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80",
];

const CATEGORIES = ["ALL", "SPORT", "FAMILY", "STAY", "NATURE", "SPIRITUAL", "TRAVEL", "LEISURE"];

function imageOf(activity, idx = 0) {
  const url = activity.image_url || activity.image;
  if (!url) return POSTER_FALLBACKS[idx % POSTER_FALLBACKS.length];
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
}

export default function CatalogContent({ compact = false }) {
  const t = useT();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  useEffect(() => {
    apiGet("/activities")
      .then((data) => setActivities(data.data || []))
      .catch((err) => console.error("Catalog fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (category !== "ALL" && a.category !== category) return false;
      if (
        search &&
        !a.title.toLowerCase().includes(search.toLowerCase()) &&
        !(a.description || "").toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [activities, search, category]);

  const featured = filtered.slice(0, 2);
  const others = filtered.slice(2);

  return (
    <>
      {!compact && (
        <PageHero
          eyebrow={t("catalog.tag")}
          title={t("catalog.title")}
          subtitle={t("catalog.subtitle")}
          height="tall"
          image={
            activities[0]
              ? imageOf(activities[0])
              : DEFAULT_IMAGE
          }
        />
      )}

      <div className={compact ? "px-8 lg:px-12 py-10" : "px-8 lg:px-12 py-12"}>
        <div className="max-w-[1400px] mx-auto">
          {compact && (
            <div className="mb-8">
              <p className="text-[#ED8D31] text-[11px] uppercase tracking-[0.35em] font-bold mb-3">
                {t("catalog.tag")}
              </p>
              <h1 className="text-[#0A0A0A] text-[36px] lg:text-[44px] font-bold tracking-[-0.02em] leading-tight">
                {t("catalog.title")}
              </h1>
              <p className="text-[#737373] text-[14px] mt-3 max-w-[680px] leading-[1.65]">
                {t("catalog.subtitle")}
              </p>
            </div>
          )}

          <div className="mb-10">
            <Toolbar>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={t("catalog.searchPlaceholder")}
              />
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <FilterChip
                    key={c}
                    active={category === c}
                    onClick={() => setCategory(c)}
                    label={
                      c === "ALL"
                        ? t("catalog.allTypes")
                        : t(`categories.${c}`) === `categories.${c}`
                        ? c
                        : t(`categories.${c}`)
                    }
                  />
                ))}
              </div>
            </Toolbar>
          </div>

          {loading ? (
            <div className="py-20 text-center text-[13px] text-[#737373]">
              {t("common.loading")}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="🔍"
              title={t("catalog.noActivities")}
              description="Essayez de modifier vos filtres ou de réinitialiser votre recherche."
              action={
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setSearch("");
                    setCategory("ALL");
                  }}
                >
                  {t("common.reset")}
                </Button>
              }
            />
          ) : (
            <>
              {featured.length > 0 && (
                <>
                  <SectionHeader
                    title="À l'affiche"
                    subtitle="Les activités phares du moment"
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    <div className="lg:col-span-2">
                      <FeatureCard activity={featured[0]} t={t} index={0} />
                    </div>
                    {featured[1] && (
                      <div>
                        <FeatureCard activity={featured[1]} t={t} index={1} />
                      </div>
                    )}
                  </div>
                </>
              )}

              {others.length > 0 && (
                <>
                  <SectionHeader
                    title="Toutes les activités"
                    subtitle={`${others.length} autres activités disponibles`}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {others.map((activity, i) => (
                      <PosterCard
                        key={activity.id}
                        activity={activity}
                        t={t}
                        index={i + 2}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function FeatureCard({ activity, t, index }) {
  const categoryLabel =
    t(`categories.${activity.category}`) === `categories.${activity.category}`
      ? activity.category
      : t(`categories.${activity.category}`);
  return (
    <Link
      to={`/activities/${activity.id}`}
      className="group relative h-[400px] block overflow-hidden bg-black"
    >
      <img
        src={imageOf(activity, index)}
        alt={activity.title}
        className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
        onError={(e) => {
          e.currentTarget.src = POSTER_FALLBACKS[index % POSTER_FALLBACKS.length];
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      <div className="absolute top-5 left-5 flex items-center gap-3">
        <span className="px-3 py-1 bg-[#ED8D31] text-black text-[10px] uppercase tracking-[0.2em] font-bold">
          À la une
        </span>
        <span className="px-3 py-1 bg-white/95 text-black text-[10px] uppercase tracking-[0.15em] font-bold">
          {categoryLabel}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-white text-[28px] lg:text-[34px] font-bold leading-[1.1] tracking-tight mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          {activity.title}
        </h3>
        <p className="text-white/85 text-[13px] leading-[1.6] line-clamp-2 max-w-[600px] mb-4">
          {activity.description}
        </p>
        <div className="flex items-center gap-3">
          <span className="inline-block w-6 h-px bg-[#ED8D31] group-hover:w-10 transition-all duration-500" />
          <p className="text-white text-[10px] uppercase tracking-[0.25em] font-bold">
            Découvrir →
          </p>
        </div>
      </div>
    </Link>
  );
}

function PosterCard({ activity, t, index }) {
  const categoryLabel =
    t(`categories.${activity.category}`) === `categories.${activity.category}`
      ? activity.category
      : t(`categories.${activity.category}`);

  return (
    <Link
      to={`/activities/${activity.id}`}
      className="group block relative bg-black overflow-hidden aspect-[16/11]"
    >
      <img
        src={imageOf(activity, index)}
        alt={activity.title}
        className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
        onError={(e) => {
          e.currentTarget.src = POSTER_FALLBACKS[index % POSTER_FALLBACKS.length];
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

      <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 text-black text-[10px] uppercase tracking-[0.15em] font-bold">
        {categoryLabel}
      </div>

      <div className="absolute top-3 right-3 text-white/40 text-[22px] font-black leading-none tabular-nums group-hover:text-[#ED8D31] transition-colors">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white text-[18px] font-bold leading-tight mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] line-clamp-2">
          {activity.title}
        </h3>
        <p className="text-white/65 text-[11px] line-clamp-2 mt-1">
          {activity.description}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-block w-4 h-px bg-white group-hover:bg-[#ED8D31] group-hover:w-8 transition-all" />
          <p className="text-white text-[10px] uppercase tracking-[0.2em] font-bold group-hover:text-[#ED8D31] transition-colors">
            Voir la fiche
          </p>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#ED8D31] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
    </Link>
  );
}
