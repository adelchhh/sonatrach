import { useRef } from "react";
import { Link } from "react-router-dom";

const announcements = [
  {
    tag: "Official note",
    tagBg: "#F3C38F",
    tagColor: "#2F343B",
    date: "Today · 09:00",
    title: "Registration opens for winter family trips",
    description:
      "Employees can browse new seasonal stays, participation rules and available quotas directly from the activity pages.",
  },
  {
    tag: "Health",
    tagBg: "#3FA56B",
    tagColor: "#FFFFFF",
    date: "Yesterday · 14:30",
    title: "On-site medical campaign this week",
    description:
      "Schedules, reminders and practical guidance are grouped in one visible communication format for all employees.",
  },
  {
    tag: "Social event",
    tagBg: "#F2B54A",
    tagColor: "#2F343B",
    date: "12 Oct 2024",
    title: "Weekend community gathering in Algiers",
    description:
      "Join sports, culture and family-friendly moments with a clearer event announcement and participation path.",
  },
  {
    tag: "Survey",
    tagBg: "#F1F0EC",
    tagColor: "#50565E",
    date: "10 Oct 2024",
    title: "New employee satisfaction survey is live",
    description:
      "Share your feedback and help improve activities, communication flows and community engagement across the platform.",
  },
  {
    tag: "Reminder",
    tagBg: "#F3C38F",
    tagColor: "#2F343B",
    date: "08 Oct 2024",
    title: "Document deadline for approved beneficiaries",
    description:
      "Accepted participants can upload the required files before validation through the next steps of the activity flow.",
  },
];

export default function AnnouncementsSection() {
  const railRef = useRef(null); // ✅ FIXED

  const scrollLeft = () => {
    railRef.current?.scrollBy({ left: -336, behavior: "smooth" });
  };

  const scrollRight = () => {
    railRef.current?.scrollBy({ left: 336, behavior: "smooth" });
  };

  return (
    <div className="flex justify-center px-4 py-8">
      <div className="w-full max-w-[1336px] rounded-[28px] border border-[rgba(229,226,220,0.92)] bg-[rgba(255,255,255,0.82)] backdrop-blur-[5px] p-[35px]">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div className="flex flex-col gap-[10px]">
            <span className="text-[#ED8D31] text-[13px] font-semibold">
              Latest internal news
            </span>

            <h2 className="text-[#2F343B] text-[42px] font-extrabold">
              Announcements for this period
            </h2>

            <p className="text-[#7A8088] text-base max-w-[760px]">
              A wide horizontal carousel keeps official notes, updates and employee reminders visible and easy to browse.
            </p>
          </div>

          <Link to="/announcements" className="text-[#ED8D31] text-sm font-semibold">
  View All
</Link>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-5">
          <span className="text-[#7A8088] text-[13px] font-semibold">
            Auto-swipable announcements rail
          </span>

          <div className="flex gap-[10px]">
            <button onClick={scrollLeft} className="w-[38px] h-[38px] rounded-full border bg-white">
              ◀
            </button>
            <button onClick={scrollRight} className="w-[38px] h-[38px] rounded-full border bg-white">
              ▶
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={railRef}
          className="flex gap-4 overflow-x-auto pb-1"
        >
          {announcements.map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[320px] p-6 rounded-[22px] border h-[288px]"
            >
              <div className="flex justify-between items-center">
                <span
                  className="px-[10px] py-[6px] rounded-full text-xs font-semibold"
                  style={{ background: item.tagBg, color: item.tagColor }}
                >
                  {item.tag}
                </span>

                <span className="text-[#7A8088] text-xs">
                  {item.date}
                </span>
              </div>

              <h3 className="text-[#2F343B] text-2xl font-bold">
                {item.title}
              </h3>

              <p className="text-[#7A8088] text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}