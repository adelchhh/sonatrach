import { Link, useParams } from "react-router-dom";

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
    content: `
Winter family trip registration is now officially open for eligible employees.

Participants can browse the available destinations, review participation rules, check required documents, and follow the submission process directly from the platform.

Employees are encouraged to read all conditions carefully before submitting a request. In case of quota limitations, selection may be subject to internal eligibility and draw rules.

Please make sure all supporting documents are uploaded before the stated deadline to avoid incomplete processing.
    `,
    audience: "All Employees",
    category: "Campaign",
    status: "Published",
    hasDocument: true,
    documentTitle: "Official Registration Notice",
    documentName: "winter_family_trips_notice.pdf",
    documentNote:
      "Please read the official circular attached to this announcement before submitting your participation request.",
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
    content: `
A new on-site medical campaign is scheduled this week across the concerned locations.

Employees are invited to consult the available schedules and practical guidance communicated through the platform. The purpose of this communication is to centralize reminders, dates, and useful instructions.

Please attend according to the communicated schedule and bring any requested supporting information if needed.
    `,
    audience: "All Employees",
    category: "Information",
    status: "Published",
    hasDocument: false,
    documentTitle: "",
    documentName: "",
    documentNote: "",
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
    content: `
Employees and families are invited to join a weekend community gathering in Algiers.

The event will include sports, cultural activities, and family-friendly moments designed to strengthen social engagement and participation across the platform community.

Further organizational information will be shared through the relevant participation and event communication channels.
    `,
    audience: "Employees + Families",
    category: "Event",
    status: "Published",
    hasDocument: false,
    documentTitle: "",
    documentName: "",
    documentNote: "",
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
    content: `
The new employee satisfaction survey is now live and available for participation.

Employees are encouraged to share their feedback on activities, communication quality, and overall engagement experience. The collected responses will help improve future communication and program organization.

Participation is voluntary but highly encouraged.
    `,
    audience: "All Employees",
    category: "Survey",
    status: "Published",
    hasDocument: false,
    documentTitle: "",
    documentName: "",
    documentNote: "",
  },
];

function RelatedAnnouncementCard({ item }) {
  return (
    <Link
      to={`/announcements/${item.slug}`}
      className="block rounded-[22px] border border-[#E5E2DC] bg-white p-5 hover:shadow-[0_10px_24px_rgba(47,52,59,0.08)] transition-all"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <span
          className="px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: item.tagBg, color: item.tagColor }}
        >
          {item.tag}
        </span>

        <span className="text-[#7A8088] text-xs">{item.date}</span>
      </div>

      <h3 className="text-[#2F343B] text-[22px] font-bold leading-[115%] mb-3">
        {item.title}
      </h3>

      <p className="text-[#7A8088] text-sm leading-[170%]">
        {item.description}
      </p>
    </Link>
  );
}

export default function AnnouncementDetails() {
  const { slug } = useParams();

  const announcement = announcements.find((item) => item.slug === slug);

  if (!announcement) {
    return (
      <div className="px-4 py-16">
        <div className="w-full max-w-[900px] mx-auto rounded-[28px] border border-[#E5E2DC] bg-white p-10 text-center">
          <p className="text-[#ED8D31] text-sm font-semibold mb-3">
            Announcement
          </p>
          <h1 className="text-[#2F343B] text-[40px] font-extrabold mb-4">
            Announcement not found
          </h1>
          <p className="text-[#7A8088] text-base leading-[170%] mb-8">
            The announcement you are looking for does not exist or is no longer available.
          </p>

          <Link
            to="/announcements"
            className="inline-flex px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold"
          >
            Back to announcements
          </Link>
        </div>
      </div>
    );
  }

  const relatedAnnouncements = announcements
    .filter((item) => item.slug !== slug)
    .slice(0, 3);

  return (
    <div className="px-4 py-10">
      <div className="w-full max-w-[1336px] mx-auto">
        {/* Back */}
        <div className="mb-6">
          <Link
            to="/announcements"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E2DC] bg-white text-[#50565E] text-sm font-medium"
          >
            ← Back to announcements
          </Link>
        </div>

        {/* Hero */}
        <div className="rounded-[28px] border border-[#E5E2DC] bg-[rgba(255,255,255,0.88)] backdrop-blur-[5px] p-8 md:p-10 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: announcement.tagBg,
                color: announcement.tagColor,
              }}
            >
              {announcement.tag}
            </span>

            <span className="text-[#7A8088] text-sm">{announcement.date}</span>
          </div>

          <h1 className="text-[#2F343B] text-[42px] md:text-[56px] font-extrabold leading-[100%] tracking-[-2px] mb-5">
            {announcement.title}
          </h1>

          <p className="text-[#7A8088] text-lg leading-[170%] max-w-[900px]">
            {announcement.description}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
          {/* Main content */}
          <div className="space-y-6">
            <section className="rounded-[24px] border border-[#E5E2DC] bg-white overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E2DC]">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  Announcement Content
                </h2>
                <p className="text-sm text-[#7A8088] mt-1">
                  Full communication details shared with employees.
                </p>
              </div>

              <div className="p-6">
                <div className="text-[#50565E] text-[15px] leading-[190%] whitespace-pre-line">
                  {announcement.content.trim()}
                </div>
              </div>
            </section>

            {announcement.hasDocument && (
              <section className="rounded-[24px] border border-[#E5E2DC] bg-white overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E5E2DC]">
                  <h2 className="text-[24px] font-bold text-[#2F343B]">
                    Official Document
                  </h2>
                  <p className="text-sm text-[#7A8088] mt-1">
                    Attached file associated with this announcement.
                  </p>
                </div>

                <div className="p-6">
                  <div className="rounded-[18px] border border-[#E5E2DC] bg-[#FBFAF8] p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <p className="text-sm text-[#7A8088] mb-2">
                          Document Title
                        </p>
                        <h3 className="text-[#2F343B] text-lg font-bold mb-2">
                          {announcement.documentTitle}
                        </h3>
                        <p className="text-sm text-[#7A8088] mb-4">
                          {announcement.documentName}
                        </p>

                        {announcement.documentNote && (
                          <p className="text-sm text-[#50565E] leading-[170%] max-w-[720px]">
                            {announcement.documentNote}
                          </p>
                        )}
                      </div>

                      <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors">
                        View document
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-[24px] border border-[#E5E2DC] bg-white overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E2DC]">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  Related Announcements
                </h2>
                <p className="text-sm text-[#7A8088] mt-1">
                  Other published communication items you may want to read.
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                {relatedAnnouncements.map((item) => (
                  <RelatedAnnouncementCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          </div>

          {/* Side info */}
          <div className="space-y-6">
            <section className="rounded-[24px] border border-[#E5E2DC] bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DC]">
                <h3 className="text-[24px] font-bold text-[#2F343B]">
                  Announcement Info
                </h3>
                <p className="text-sm text-[#7A8088] mt-1">
                  Main publication details.
                </p>
              </div>

              <div className="p-5 space-y-3">
                <SummaryRow label="Category" value={announcement.category} />
                <SummaryRow label="Audience" value={announcement.audience} />
                <SummaryRow label="Status" value={announcement.status} />
                <SummaryRow label="Date" value={announcement.date} />
                <SummaryRow
                  label="Document"
                  value={announcement.hasDocument ? "Attached" : "None"}
                />
              </div>
            </section>

            <section className="rounded-[24px] border border-[#E5E2DC] bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DC]">
                <h3 className="text-[24px] font-bold text-[#2F343B]">
                  Quick Actions
                </h3>
                <p className="text-sm text-[#7A8088] mt-1">
                  Navigation shortcuts for employees.
                </p>
              </div>

              <div className="p-5 space-y-3">
                <Link
                  to="/announcements"
                  className="block w-full text-center px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  Browse all announcements
                </Link>

                <Link
                  to="/activities"
                  className="block w-full text-center px-4 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold"
                >
                  Explore activities
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3 gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B] text-right">
        {value}
      </span>
    </div>
  );
}