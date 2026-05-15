import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FileText, ExternalLink } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getPublicAnnouncement,
  getPublicAnnouncements,
} from "../services/announcementService";
import { API_BASE_URL } from "../api";
import {
  PageHero,
  Button,
  Alert,
  StatusPill,
} from "../components/ui/Studio";

function formatDate(item) {
  if (!item) return "";
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

function shortText(text, max = 130) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function AnnouncementDetails() {
  const { slug, id } = useParams();
  const announcementId = id || slug;

  const [announcement, setAnnouncement] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const item = await getPublicAnnouncement(announcementId);
        setAnnouncement(item);
        const all = await getPublicAnnouncements();
        setRelated(
          all
            .filter((a) => Number(a.id) !== Number(announcementId))
            .slice(0, 3)
        );
      } catch (err) {
        setAnnouncement(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [announcementId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 py-20 text-center text-[13px] text-[#737373]">
          Chargement…
        </main>
        <Footer />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 py-20 max-w-[800px] mx-auto px-8 w-full">
          <Alert tone="danger" title="Annonce introuvable">
            L'annonce demandée n'existe pas ou a été retirée.
          </Alert>
          <div className="mt-6">
            <Button to="/announcements" variant="outline" size="md">
              ← Retour aux annonces
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="Communication interne"
        title={announcement.title}
        subtitle={`Publiée le ${formatDate(announcement)}`}
        height="tall"
        breadcrumbs={[
          { label: "Accueil", to: "/" },
          { label: "Annonces", to: "/announcements" },
          { label: announcement.title },
        ]}
      />

      <main className="flex-1 py-14 lg:py-16">
        <div className="max-w-[1280px] mx-auto px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">
            <article className="space-y-10">
              <div className="bg-white border border-[#E5E5E5] p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <span className="px-2.5 py-1 bg-[#0A0A0A] text-white text-[10px] uppercase tracking-[0.18em] font-bold">
                    Annonce
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#737373] tabular-nums">
                    {formatDate(announcement)}
                  </span>
                </div>
                <div className="text-[#0A0A0A] text-[15px] leading-[1.85] whitespace-pre-line">
                  {announcement.content}
                </div>
              </div>

              {announcement.document_path && (
                <div className="bg-white border border-[#E5E5E5] p-8">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#737373] mb-4">
                    Document officiel
                  </p>
                  <div className="flex items-center justify-between gap-4 p-4 bg-[#FAFAFA] border border-[#E5E5E5]">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-[#0A0A0A] text-white flex items-center justify-center">
                        <FileText size={18} strokeWidth={1.7} />
                      </div>
                      <div>
                        <p className="text-[#0A0A0A] text-[14px] font-bold">
                          {announcement.document_name || "Document attaché"}
                        </p>
                        <p className="text-[11px] text-[#737373] uppercase tracking-wider mt-0.5">
                          Pièce jointe officielle
                        </p>
                      </div>
                    </div>
                    <a
                      href={`${API_BASE_URL}${announcement.document_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ED8D31] text-black text-[11px] uppercase tracking-[0.15em] font-bold hover:bg-[#fa9d40] transition-colors"
                    >
                      <ExternalLink size={13} strokeWidth={2.5} />
                      Consulter
                    </a>
                  </div>
                </div>
              )}

              {related.length > 0 && (
                <div>
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className="text-[#ED8D31] text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
                        À lire aussi
                      </p>
                      <h2 className="text-[#0A0A0A] text-[24px] font-bold tracking-tight">
                        Annonces récentes
                      </h2>
                    </div>
                    <Link
                      to="/announcements"
                      className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] hover:text-[#ED8D31] transition-colors"
                    >
                      Toutes →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {related.map((item) => (
                      <RelatedCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </article>

            <aside className="space-y-6">
              <div className="bg-white border border-[#E5E5E5] p-6">
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#737373] mb-5">
                  Informations
                </p>
                <div className="space-y-4">
                  <InfoRow label="Statut">
                    <StatusPill tone="success" label={announcement.status} />
                  </InfoRow>
                  <InfoRow label="Date">
                    <span className="text-[13px] font-bold text-[#0A0A0A] tabular-nums">
                      {formatDate(announcement)}
                    </span>
                  </InfoRow>
                  <InfoRow label="Document">
                    <span className="text-[12px] font-bold text-[#0A0A0A]">
                      {announcement.document_path ? "Attaché" : "Aucun"}
                    </span>
                  </InfoRow>
                </div>
              </div>

              <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-6">
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#737373] mb-4">
                  Aller plus loin
                </p>
                <div className="space-y-2.5">
                  <Link
                    to="/announcements"
                    className="block px-4 py-3 bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[11px] uppercase tracking-[0.15em] font-bold text-[#0A0A0A] transition-colors"
                  >
                    Toutes les annonces →
                  </Link>
                  <Link
                    to="/catalog"
                    className="block px-4 py-3 bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[11px] uppercase tracking-[0.15em] font-bold text-[#0A0A0A] transition-colors"
                  >
                    Catalogue d'activités →
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-4 pb-3 border-b border-[#F5F5F5] last:border-b-0 last:pb-0">
      <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#737373]">
        {label}
      </span>
      <div className="text-right">{children}</div>
    </div>
  );
}

function RelatedCard({ item }) {
  return (
    <Link
      to={`/announcements/${item.id}`}
      className="group block bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] transition-colors p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="px-2 py-0.5 bg-[#0A0A0A] text-white text-[9px] uppercase tracking-[0.15em] font-bold">
          Annonce
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#A3A3A3] tabular-nums">
          {formatDate(item)}
        </span>
      </div>
      <h3 className="text-[14px] font-bold text-[#0A0A0A] tracking-tight leading-tight mb-2 group-hover:text-[#ED8D31] transition-colors">
        {item.title}
      </h3>
      <p className="text-[12px] text-[#525252] leading-[1.6] line-clamp-2">
        {shortText(item.content)}
      </p>
    </Link>
  );
}
