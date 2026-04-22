import { Link } from "react-router-dom";

const announcements = [
  {
    id: 1,
    slug: "registration-opens-winter-family-trips",
    tag: "Official note",
    tagBg: "#F3C38F",
    tagColor: "#2F343B",
    date: "Today · 09:00",
    title: "Registration opens for winter family trips",
    description:
      "Employees can browse new seasonal stays, participation rules and available quotas directly from the activity pages.",
    content:
      "Winter family trip registration is now officially open. Employees can review available destinations, eligibility conditions, quotas, and required documents directly through the platform before the deadline.",
    status: "Published",
  },
  {
    id: 2,
    slug: "on-site-medical-campaign-this-week",
    tag: "Health",
    tagBg: "#3FA56B",
    tagColor: "#FFFFFF",
    date: "Yesterday · 14:30",
    title: "On-site medical campaign this week",
    description:
      "Schedules, reminders and practical guidance are grouped in one visible communication format for all employees.",
    content:
      "A new on-site medical campaign is scheduled this week. Employees are invited to consult schedules, preparation guidance, and communication updates through the platform.",
    status: "Published",
  },
  {
    id: 3,
    slug: "weekend-community-gathering-algiers",
    tag: "Social event",
    tagBg: "#F2B54A",
    tagColor: "#2F343B",
    date: "12 Oct 2024",
    title: "Weekend community gathering in Algiers",
    description:
      "Join sports, culture and family-friendly moments with a clearer event announcement and participation path.",
    content:
      "Employees and families are invited to join a weekend community gathering in Algiers featuring sports, cultural moments, and family-friendly activities.",
    status: "Published",
  },
  {
    id: 4,
    slug: "employee-satisfaction-survey-live",
    tag: "Survey",
    tagBg: "#F1F0EC",
    tagColor: "#50565E",
    date: "10 Oct 2024",
    title: "New employee satisfaction survey is live",
    description:
      "Share your feedback and help improve activities, communication flows and community engagement across the platform.",
    content:
      "The new employee satisfaction survey is now live. Your feedback helps improve activity quality, internal communication, and platform usability.",
    status: "Published",
  },
  {
    id: 5,
    slug: "document-deadline-approved-beneficiaries",
    tag: "Reminder",
    tagBg: "#F3C38F",
    tagColor: "#2F343B",
    date: "08 Oct 2024",
    title: "Document deadline for approved beneficiaries",
    description:
      "Accepted participants can upload the required files before validation through the next steps of the activity flow.",
    content:
      "Approved beneficiaries are reminded to upload all required documents before the validation deadline to avoid delays or cancellation.",
    status: "Published",
  },
  {
    id: 6,
    slug: "draw-results-published-for-seasonal-campaign",
    tag: "Results",
    tagBg: "#E7E2FF",
    tagColor: "#5746A3",
    date: "06 Oct 2024",
    title: "Draw results published for seasonal campaign",
    description:
      "Applicants can now review the latest draw outcomes and next actions directly from the platform.",
    content:
      "The latest seasonal draw results are now available. Applicants can consult their status and follow the required next steps directly online.",
    status: "Published",
  },
];

function AnnouncementCard({ announcement, featured = false }) {
  return (
    <Link
      to={`/announcements/${announcement.slug}`}
      className={`group block rounded-[24px] border border-[#E5E2DC] bg-white overflow-hidden hover:shadow-[0_10px_30px_rgba(47,52,59,0.08)] transition-all ${
        featured ? "min-h-[320px]" : "min-h-[260px]"
      }`}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between gap-3 mb-5">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: announcement.tagBg,
              color: announcement.tagColor,
            }}
          >
            {announcement.tag}
          </span>

          <span className="text-[#7A8088] text-xs">{announcement.date}</span>
        </div>

        <div className="flex-1">
          <h3
            className={`text-[#2F343B] font-bold leading-[115%] mb-3 ${
              featured ? "text-[30px]" : "text-[24px]"
            }`}
          >
            {announcement.title}
          </h3>

          <p className="text-[#7A8088] text-sm leading-[170%]">
            {announcement.description}
          </p>
        </div>

        <div className="pt-6 mt-6 border-t border-[#F0EDE7] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#7A8088]">
            {announcement.status}
          </span>

          <span className="text-sm font-semibold text-[#ED8D31] group-hover:translate-x-1 transition-transform">
            Read more →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function AnnouncementsPage({ compact = false }) {
  const featured = announcements.slice(0, 2);
  const others = announcements.slice(2);

  return (
    <div className={compact ? "" : "px-4 py-10"}>
      <div className="w-full max-w-[1336px] mx-auto">
        <div className={`text-center ${compact ? "mb-8" : "mb-10"}`}>
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#E5E2DC] bg-white text-[#7A8088] text-sm mb-4">
            Internal communication
          </div>

          <h1 className="text-[#2F343B] text-[56px] font-extrabold leading-[100%] tracking-[-2px] mb-4">
            Explore Announcements
          </h1>

          <p className="text-[#7A8088] text-lg leading-[170%] max-w-[760px] mx-auto">
            Browse the latest internal news, official notes, reminders, surveys,
            social updates, and employee communication published across the platform.
          </p>
        </div>

        <div className="mb-8 rounded-[20px] border border-[#E5E2DC] bg-white p-4 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search announcements..."
            className="flex-1 min-w-[220px] px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none"
          />

          <button className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-[#50565E]">
            All Categories
          </button>

          <button className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-[#50565E]">
            Latest First
          </button>

          <button className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-[#50565E]">
            Published Only
          </button>

          <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white font-medium">
            Apply Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <AnnouncementCard announcement={featured[0]} featured />
          </div>

          <div>
            <AnnouncementCard announcement={featured[1]} featured />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {others.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
            />
          ))}
        </div>
      </div>
    </div>
  );
}