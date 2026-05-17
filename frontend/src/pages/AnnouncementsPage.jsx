import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicAnnouncements } from "../services/announcementService";

function formatDate(item) {
  return item.publish_date || item.created_at?.slice(0, 10) || "";
}

function shortText(text, max = 180) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function AnnouncementCard({ announcement, featured = false }) {
  return (
    <Link
      to={`/announcements/${announcement.id}`}
      className={`block rounded-[26px] bg-white border border-[#E5E2DC] p-6 hover:shadow-md transition ${
        featured ? "min-h-[260px]" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="px-3 py-1 rounded-full bg-[#F3C38F] text-[#2F343B] text-xs font-bold">
          Announcement
        </span>

        <span className="text-xs text-[#7A8088]">
          {formatDate(announcement)}
        </span>
      </div>

      <h3 className="text-2xl font-bold text-[#2F343B] mt-5">
        {announcement.title}
      </h3>

      <p className="text-sm text-[#7A8088] mt-3 leading-[170%]">
        {shortText(announcement.content)}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs font-bold text-[#3FA56B]">
          {announcement.status}
        </span>

        <span className="text-sm font-semibold text-[#ED8D31]">
          Read more →
        </span>
      </div>
    </Link>
  );
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

  const featured = announcements.slice(0, 2);
  const others = announcements.slice(2);

  return (
    <main className="min-h-screen bg-[#F7F7F5] py-12">
      <div className="max-w-[1180px] mx-auto px-4">
        <p className="text-sm font-bold text-[#ED8D31] uppercase tracking-[0.18em]">
          Internal communication
        </p>

        <h1 className="text-[44px] font-bold text-[#2F343B] mt-3">
          Explore Announcements
        </h1>

        <p className="text-[#7A8088] mt-4 max-w-[720px] leading-[170%]">
          Browse the latest internal news, official notes, reminders, and
          employee communication published across the platform.
        </p>

        {loading ? (
          <p className="mt-10 text-[#7A8088]">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p className="mt-10 text-[#7A8088]">No announcements available yet.</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 mt-10">
              {featured.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  featured
                />
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {others.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}