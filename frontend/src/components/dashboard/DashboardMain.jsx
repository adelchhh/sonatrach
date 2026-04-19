import { Link } from "react-router-dom";
import { activities } from "../../data/activities";

const stats = [
  {
    icon: "📌",
    label: "Open activities",
    value: "5",
    sub: "Available to apply right now",
    to: "/dashboard/catalog",
  },
  {
    icon: "⏳",
    label: "Pending requests",
    value: "3",
    sub: "Waiting for validation or draw",
    to: "/dashboard/requests",
  },
  {
    icon: "✓",
    label: "Past participations",
    value: "8",
    sub: "Activities joined since 2023",
    to: "/dashboard/history",
  },
  {
    icon: "📊",
    label: "Profile completion",
    value: "68%",
    sub: "Complete your information and documents",
    progress: true,
    to: "/dashboard/documents",
  },
];

const requests = [
  {
    title: "Omra",
    date: "Submitted on Sep 20, 2024",
    status: "Pending Draw",
    statusColor: "#F2B54A",
  },
  {
    title: "Bungalow Stay",
    date: "Submitted on Sep 03, 2024",
    status: "Under Review",
    statusColor: "#7A8088",
  },
  {
    title: "Summer Camp",
    date: "Submitted on Aug 15, 2024",
    status: "Accepted",
    statusColor: "#3FA56B",
  },
];

const history = [
  {
    title: "Camping",
    date: "Joined in May 2024 · 5 days",
    status: "Completed",
  },
  {
    title: "Running",
    date: "Joined in February 2024 · 2 days",
    status: "Completed",
  },
];

export default function DashboardMain() {
  const featuredActivities = activities.slice(0, 3);

  return (
    <main className="flex-1 overflow-y-auto bg-[#F7F7F5]">
      <div className="p-6 space-y-6">
        {/* Welcome Hero */}
        <div className="rounded-[24px] bg-gradient-to-r from-[#2F343B] to-[#5A6470] text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 w-72 h-72 bg-[#ED8D31] rounded-full blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold leading-tight mb-2">
              Welcome back!
            </h1>
            <p className="text-[rgba(255,255,255,0.88)] max-w-[620px] leading-[170%]">
              Explore available activities, track your requests, confirm your
              participation, and keep your documents ready in one clear space.
            </p>

            <Link
              to="/dashboard/catalog"
              className="inline-block mt-5 px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
            >
              Explore Activities
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Link
              key={i}
              to={stat.to}
              className="rounded-[20px] bg-white p-5 border border-[#E5E2DC] hover:shadow-md transition-shadow block"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#7A8088]">
                  {stat.label}
                </h3>
                <span className="text-xl">{stat.icon}</span>
              </div>

              <div>
                <p className="text-3xl font-extrabold text-[#2F343B]">
                  {stat.value}
                </p>

                {stat.progress && (
                  <div className="mt-2 w-full h-1.5 bg-[#F1EFEA] rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-[#ED8D31] rounded-full" />
                  </div>
                )}

                <p className="text-xs text-[#7A8088] mt-1">{stat.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Activities Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#2F343B]">
              Activities you can apply for
            </h2>

            <Link
              to="/dashboard/catalog"
              className="text-[#ED8D31] text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              View catalog
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {featuredActivities.map((activity) => (
              <div
                key={activity.slug}
                className="rounded-[20px] bg-white border border-[#E5E2DC] overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="relative h-[180px] overflow-hidden">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute top-3 left-3 inline-flex px-3 py-1 rounded-full bg-[rgba(255,255,255,0.9)] text-xs font-semibold text-[#2F343B]">
                    {activity.category}
                  </div>

                  <div className="absolute top-3 right-3 inline-flex px-3 py-1 rounded-full bg-[rgba(47,52,59,0.78)] text-xs font-semibold text-white">
                    {activity.status}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-[#2F343B] text-sm mb-2">
                    {activity.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-[#7A8088]">
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1zm0 11a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
                          stroke="currentColor"
                          strokeWidth="0.8"
                        />
                        <path
                          d="M7 3.5v3l2.5 1.5"
                          stroke="currentColor"
                          strokeWidth="0.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      {activity.date}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M7 1C4.24 1 2 3.24 2 6c0 3.5 5 7 5 7s5-3.5 5-7c0-2.76-2.24-5-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                          fill="currentColor"
                        />
                      </svg>
                      {activity.location}
                    </div>
                  </div>

                  <Link
                    to={`/activities/${activity.slug}`}
                    className="text-[#ED8D31] text-xs font-semibold mt-3 inline-block hover:opacity-80 transition-opacity"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requests Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#2F343B]">My requests</h2>

            <Link
              to="/dashboard/requests"
              className="text-[#ED8D31] text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              See all requests
            </Link>
          </div>

          <div className="space-y-3">
            {requests.map((req, i) => (
              <Link
                key={i}
                to="/dashboard/requests"
                className="rounded-[16px] bg-white p-4 border border-[#E5E2DC] flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M10 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7l-5-5z"
                      stroke="#7A8088"
                      strokeWidth="1.5"
                    />
                  </svg>

                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#2F343B]">
                      {req.title}
                    </p>
                    <p className="text-xs text-[#7A8088]">{req.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: req.statusColor }}
                  >
                    {req.status}
                  </span>

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-[#7A8088]"
                  >
                    <path
                      d="M6 12.5l4.5-4.5L6 3.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Participation History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#2F343B]">
              Participation history
            </h2>

            <Link
              to="/dashboard/history"
              className="text-[#ED8D31] text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              View archive
            </Link>
          </div>

          <div className="space-y-3">
            {history.map((item, i) => (
              <Link
                key={i}
                to="/dashboard/history"
                className="rounded-[16px] bg-white p-4 border border-[#E5E2DC] flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M3 6h12M9 6v5l3 2"
                      stroke="#7A8088"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="9" cy="9" r="6" stroke="#7A8088" strokeWidth="1.5" />
                  </svg>

                  <div>
                    <p className="font-semibold text-sm text-[#2F343B]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#7A8088]">{item.date}</p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#D4F4DD] text-[#2D7A4A]">
                  {item.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}