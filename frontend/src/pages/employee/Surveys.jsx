import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const surveys = [
  {
    id: 1,
    title: "Q3 Activities Satisfaction",
    category: "Feedback",
    description:
      "Help us improve future activities by sharing your experience with recent programs and participation flow.",
    deadline: "Oct 30, 2024",
    duration: "2 min",
    status: "Open",
  },
  {
    id: 2,
    title: "Family Stay Preferences",
    category: "Planning",
    description:
      "Tell us which destinations and accommodation formats you prefer for future family stays.",
    deadline: "Nov 05, 2024",
    duration: "3 min",
    status: "Open",
  },
  {
    id: 3,
    title: "Transport & Logistics Review",
    category: "Evaluation",
    description:
      "Rate the transport arrangements and logistics communication for your recent activities.",
    deadline: "Sep 28, 2024",
    duration: "4 min",
    status: "Completed",
  },
  {
    id: 4,
    title: "Winter Campaign Interest Survey",
    category: "Interest",
    description:
      "Share which winter activities you would most likely join this season.",
    deadline: "Nov 20, 2024",
    duration: "2 min",
    status: "Open",
  },
];

export default function Surveys() {
  const openCount = surveys.filter((survey) => survey.status === "Open").length;
  const completedCount = surveys.filter(
    (survey) => survey.status === "Completed"
  ).length;

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                Surveys
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                Participate in active surveys and help improve activities,
                planning, and the overall employee experience.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Surveys"
                value={surveys.length}
                subtitle="All available surveys"
              />
              <StatCard
                title="Open"
                value={openCount}
                subtitle="Available for participation"
              />
              <StatCard
                title="Completed"
                value={completedCount}
                subtitle="Already answered surveys"
              />
            </div>

            {/* Filters */}
            <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
              <h2 className="text-[24px] font-bold text-[#2F343B]">
                Survey Directory
              </h2>
              <p className="text-sm text-[#7A8088] mt-1 mb-4">
                Search and filter surveys by title, category, or status.
              </p>

              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Search survey..."
                  className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                />

                <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                  <option>All categories</option>
                </select>

                <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                  <option>All status</option>
                </select>

                <button className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B]">
                  Reset
                </button>

                <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold">
                  Apply filters
                </button>
              </div>
            </section>

            {/* Survey cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="rounded-[24px] bg-white border border-[#E5E2DC] p-5 flex flex-col"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                      {survey.category}
                    </span>

                    <StatusBadge status={survey.status} />
                  </div>

                  <h3 className="text-[22px] font-bold text-[#2F343B] leading-[120%] mb-3">
                    {survey.title}
                  </h3>

                  <p className="text-sm text-[#7A8088] leading-[170%] mb-5 flex-1">
                    {survey.description}
                  </p>

                  <div className="space-y-2 mb-5">
                    <InfoRow label="Deadline" value={survey.deadline} />
                    <InfoRow label="Estimated time" value={survey.duration} />
                  </div>

                  <div className="flex gap-3">
                    {survey.status === "Open" ? (
                      <button className="px-4 py-2.5 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors">
                        Participate
                      </button>
                    ) : (
                      <button className="px-4 py-2.5 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-[#7A8088] text-sm font-semibold">
                        Completed
                      </button>
                    )}

                    <button className="px-4 py-2.5 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-medium">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{title}</p>
      <p className="text-3xl font-extrabold text-[#2F343B] mt-2">{value}</p>
      <p className="text-xs text-[#7A8088] mt-2">{subtitle}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Open: "bg-[#D4F4DD] text-[#2D7A4A]",
    Completed: "bg-[#F1F0EC] text-[#7A8088]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B]">{value}</span>
    </div>
  );
}