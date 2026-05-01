import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getPublicAnnouncement,
  getPublicAnnouncements,
} from "../services/announcementService";

const API_BASE_URL = "http://127.0.0.1:8000";

function formatDate(item) {
  return item?.publish_date || item?.created_at?.slice(0, 10) || "";
}

function shortText(text, max = 120) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function RelatedAnnouncementCard({ item }) {
  return (
    <Link
      to={`/announcements/${item.id}`}
      className="block rounded-[20px] bg-white border border-[#E5E2DC] p-5 hover:shadow-md transition"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="px-3 py-1 rounded-full bg-[#F3C38F] text-[#2F343B] text-xs font-bold">
          Announcement
        </span>

        <span className="text-xs text-[#7A8088]">{formatDate(item)}</span>
      </div>

      <h3 className="text-lg font-bold text-[#2F343B] mt-4">{item.title}</h3>

      <p className="text-sm text-[#7A8088] mt-2 leading-[160%]">
        {shortText(item.content)}
      </p>
    </Link>
  );
}

export default function AnnouncementDetails() {
  const { slug, id } = useParams();
  const announcementId = id || slug;

  const [announcement, setAnnouncement] = useState(null);
  const [relatedAnnouncements, setRelatedAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnnouncement() {
      try {
        const item = await getPublicAnnouncement(announcementId);
        setAnnouncement(item);

        const all = await getPublicAnnouncements();
        setRelatedAnnouncements(
          all.filter((a) => Number(a.id) !== Number(announcementId)).slice(0, 3)
        );
      } catch (err) {
        console.error("Failed to load announcement:", err);
        setAnnouncement(null);
      } finally {
        setLoading(false);
      }
    }

    loadAnnouncement();
  }, [announcementId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F7F5] p-8">
        <p className="text-[#7A8088]">Loading announcement...</p>
      </main>
    );
  }

  if (!announcement) {
    return (
      <main className="min-h-screen bg-[#F7F7F5] py-12">
        <div className="max-w-[900px] mx-auto px-4">
          <p className="text-sm font-bold text-[#ED8D31] uppercase tracking-[0.18em]">
            Announcement
          </p>

          <h1 className="text-[42px] font-bold text-[#2F343B] mt-3">
            Announcement not found
          </h1>

          <p className="text-[#7A8088] mt-4">
            The announcement you are looking for does not exist or is no longer
            available.
          </p>

          <Link
            to="/announcements"
            className="inline-flex mt-6 px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold"
          >
            Back to announcements
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F7F5] py-12">
      <div className="max-w-[1180px] mx-auto px-4">
        <Link
          to="/announcements"
          className="inline-flex mb-8 text-sm font-semibold text-[#ED8D31]"
        >
          ← Back to announcements
        </Link>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-8">
            <section className="rounded-[30px] bg-white border border-[#E5E2DC] p-8">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#F3C38F] text-[#2F343B] text-xs font-bold">
                  Announcement
                </span>

                <span className="text-sm text-[#7A8088]">
                  {formatDate(announcement)}
                </span>
              </div>

              <h1 className="text-[42px] font-bold text-[#2F343B] mt-5 leading-tight">
                {announcement.title}
              </h1>
            </section>

            <section className="rounded-[30px] bg-white border border-[#E5E2DC] p-8">
              <h2 className="text-2xl font-bold text-[#2F343B]">
                Announcement Content
              </h2>

              <p className="text-sm text-[#7A8088] mt-2">
                Full communication details shared with employees.
              </p>

              <div className="mt-6 text-[#2F343B] leading-[180%] whitespace-pre-line">
                {announcement.content}
              </div>
            </section>

            {announcement.document_path && (
              <section className="rounded-[30px] bg-white border border-[#E5E2DC] p-8">
                <h2 className="text-2xl font-bold text-[#2F343B]">
                  Official Document
                </h2>

                <p className="text-sm text-[#7A8088] mt-2">
                  Attached file associated with this announcement.
                </p>

                <div className="mt-6 rounded-[20px] bg-[#FBFAF8] border border-[#E5E2DC] p-5">
                  <p className="text-sm text-[#7A8088]">Document</p>

                  <h3 className="text-lg font-bold text-[#2F343B] mt-1">
                    {announcement.document_name || "Attached document"}
                  </h3>

                  <a
                    href={`${API_BASE_URL}${announcement.document_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex mt-5 px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold"
                  >
                    View document
                  </a>
                </div>
              </section>
            )}

            {relatedAnnouncements.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-[#2F343B]">
                  Related Announcements
                </h2>

                <p className="text-sm text-[#7A8088] mt-2">
                  Other published communication items you may want to read.
                </p>

                <div className="grid md:grid-cols-3 gap-5 mt-5">
                  {relatedAnnouncements.map((item) => (
                    <RelatedAnnouncementCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-6">
              <h3 className="text-xl font-bold text-[#2F343B]">
                Announcement Info
              </h3>

              <div className="mt-5 space-y-3">
                <SummaryRow label="Status" value={announcement.status} />
                <SummaryRow label="Date" value={formatDate(announcement)} />
                <SummaryRow
                  label="Document"
                  value={announcement.document_path ? "Attached" : "None"}
                />
              </div>
            </section>

            <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-6">
              <h3 className="text-xl font-bold text-[#2F343B]">
                Quick Actions
              </h3>

              <div className="mt-5 space-y-3">
                <Link
                  to="/announcements"
                  className="block px-4 py-3 rounded-[14px] bg-[#F7F7F5] text-sm font-semibold text-[#2F343B]"
                >
                  Browse all announcements
                </Link>

                <Link
                  to="/activities"
                  className="block px-4 py-3 rounded-[14px] bg-[#F7F7F5] text-sm font-semibold text-[#2F343B]"
                >
                  Explore activities
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3 gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B] text-right">
        {value || "-"}
      </span>
    </div>
  );
}