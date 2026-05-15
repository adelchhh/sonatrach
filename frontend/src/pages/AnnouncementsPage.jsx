import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getPublicAnnouncements } from "../services/announcementService";
import { PageHero } from "../components/ui/Studio";

function formatDate(item) {
  if (!item.publish_date && !item.created_at) return "";
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

function shortText(text, max = 180) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicAnnouncements()
      .then(setAnnouncements)
      .catch((err) => console.error("Failed to load announcements:", err))
      .finally(() => setLoading(false));
  }, []);

  const featured = announcements[0];
  const rest = announcements.slice(1);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="Communication interne"
        title="Annonces & actualités"
        subtitle="Les dernières communications officielles, rappels et actualités diffusés par le comité socio-activités de Sonatrach."
        height="tall"
      />

      <main className="flex-1 py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-12">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#FAFAFA] border border-[#E5E5E5] h-[280px] animate-pulse"
                />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="border border-dashed border-[#E5E5E5] bg-[#FAFAFA] py-20 px-8 text-center">
              <Megaphone
                size={32}
                strokeWidth={1.5}
                className="text-[#A3A3A3] mx-auto mb-4"
              />
              <p className="text-[14px] text-[#737373]">
                Aucune annonce publiée pour le moment.
              </p>
            </div>
          ) : (
            <>
              {featured && (
                <Link
                  to={`/announcements/${featured.id}`}
                  className="group block bg-black text-white p-8 lg:p-10 mb-10 relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{
                      background:
                        "radial-gradient(ellipse at 80% 20%, rgba(237,141,49,0.4) 0%, transparent 50%)",
                    }}
                  />
                  <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-end">
                    <div>
                      <div className="flex items-center gap-3 mb-5 flex-wrap">
                        <span className="px-3 py-1 bg-[#ED8D31] text-black text-[10px] uppercase tracking-[0.2em] font-bold">
                          À la une
                        </span>
                        <span className="text-white/60 text-[10px] uppercase tracking-[0.25em] tabular-nums">
                          {formatDate(featured)}
                        </span>
                      </div>
                      <h2
                        className="font-bold leading-[1.05] tracking-[-0.02em] mb-5"
                        style={{ fontSize: "clamp(28px, 3.6vw, 44px)" }}
                      >
                        {featured.title}
                      </h2>
                      <p className="text-white/75 text-[15px] leading-[1.7] max-w-[680px]">
                        {shortText(featured.content, 220)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] font-bold text-[#ED8D31] group-hover:text-[#fa9d40] transition-colors">
                      Lire l'annonce →
                    </div>
                  </div>
                </Link>
              )}

              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((a) => (
                    <AnnouncementCard key={a.id} announcement={a} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function AnnouncementCard({ announcement }) {
  return (
    <Link
      to={`/announcements/${announcement.id}`}
      className="group block bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] transition-colors p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#ED8D31] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
      <div className="flex items-center justify-between gap-3 mb-5">
        <span className="px-2.5 py-1 bg-[#0A0A0A] text-white text-[10px] uppercase tracking-[0.18em] font-bold">
          Annonce
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A3A3A3] tabular-nums">
          {formatDate(announcement)}
        </span>
      </div>
      <h3 className="text-[#0A0A0A] text-[20px] font-bold tracking-[-0.015em] leading-tight mb-3 group-hover:text-[#ED8D31] transition-colors">
        {announcement.title}
      </h3>
      <p className="text-[13px] text-[#525252] leading-[1.7] mb-5 line-clamp-3">
        {shortText(announcement.content)}
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-[#E5E5E5]">
        <span className="inline-block w-4 h-px bg-[#0A0A0A] group-hover:bg-[#ED8D31] group-hover:w-8 transition-all" />
        <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#0A0A0A] group-hover:text-[#ED8D31] transition-colors">
          Lire la suite
        </p>
      </div>
    </Link>
  );
}
