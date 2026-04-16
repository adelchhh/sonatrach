import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { Link } from "react-router-dom";

const activeActivities = [
  {
    id: 1,
    title: "Excursion à Djanet",
    category: "Travel activity",
    sessions: "2 Sessions",
    endDate: "Oct 15, 2024",
    registrations: "240 registered",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Vacances nature & détente",
    category: "Family stay",
    sessions: "4 Sessions",
    endDate: "Oct 20, 2024",
    registrations: "185 registered",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Thermal stay - Hammam Righa",
    category: "Wellness stay",
    sessions: "1 Session",
    endDate: "Nov 01, 2024",
    registrations: "89 registered",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop",
  },
];

const inactiveActivities = [
  {
    id: 4,
    title: "Annual Corporate Retreat",
    category: "Corporate event",
    lastActive: "Sep 10, 2024",
    status: "Closed",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Summer Camp for Kids",
    category: "Family",
    lastActive: "Aug 30, 2024",
    status: "Closed",
    image:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Ski Trip - Chrea",
    category: "Travel activity",
    lastActive: "-",
    status: "Draft",
    image:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=600&auto=format&fit=crop",
  },
];

export default function ManageActivities() {
  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  Manage Activities
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Keep track of active and inactive activities, search quickly,
                  and manage each activity with direct admin actions.
                </p>
              </div>

              <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors">
                + Create New Activity
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Total Activities"
                value="24"
                subtitle="Across all categories and statuses"
              />
              <StatCard
                title="Active Activities"
                value="5"
                subtitle="Currently accepting registrations"
              />
              <StatCard
                title="Pending Draws"
                value="2"
                subtitle="Ready for random selection"
              />
              <StatCard
                title="Inactive / Drafts"
                value="19"
                subtitle="Closed campaigns and drafts"
              />
            </div>

            {/* Directory filters */}
            <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
              <h2 className="text-[24px] font-bold text-[#2F343B]">
                Activities Directory
              </h2>
              <p className="text-sm text-[#7A8088] mt-1 mb-4">
                Search by activity name and narrow results by category or status.
              </p>

              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                />

                <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                  <option>All Categories</option>
                </select>

                <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                  <option>All Status</option>
                </select>

                <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                  <option>Sort by: Newest</option>
                </select>

                <button className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B]">
                  Reset filters
                </button>

                <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold">
                  Apply filters
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
              {/* Left content */}
              <div className="space-y-6">
                {/* Active activities */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                    <div>
                      <h3 className="text-[24px] font-bold text-[#2F343B]">
                        Active Activities
                      </h3>
                      <p className="text-sm text-[#7A8088] mt-1">
                        Activities currently accepting registrations or awaiting a draw.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#D4F4DD] text-[#2D7A4A] text-xs font-semibold">
                      5 Active
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px]">
                      <thead className="bg-[#FBFAF8]">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Activity
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Sessions
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            End Date
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Registrations
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {activeActivities.map((activity) => (
                          <tr
                            key={activity.id}
                            className="border-t border-[#E5E2DC] align-top"
                          >
                            <td className="px-5 py-5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={activity.image}
                                  alt={activity.title}
                                  className="w-12 h-12 rounded-[10px] object-cover"
                                />
                                <div>
                                  <p className="font-semibold text-[#2F343B] text-sm">
                                    {activity.title}
                                  </p>
                                  <p className="text-xs text-[#7A8088]">
                                    {activity.category}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {activity.sessions}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {activity.endDate}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#2F343B] font-medium">
                              {activity.registrations}
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex flex-wrap gap-2">

                              <Link
  to={`/dashboard/admin/activities/${activity.id}/edit`}
  className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white inline-block"
>
  Modify
</Link>


                                
                                <button className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white">
                                  Archive
                                </button>
                                <button className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white">
                                  Deactivate
                                </button>
                                <Link
  to={`/dashboard/admin/activities/${activity.id}/sessions`}
  className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium inline-block"
>
  Manage Session
</Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-5 py-4 border-t border-[#E5E2DC]">
                    <button className="px-4 py-2 rounded-lg border border-[#E5E2DC] text-sm font-medium text-[#2F343B]">
                      View all 5 active activities
                    </button>
                  </div>
                </section>

                {/* Inactive activities */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                    <div>
                      <h3 className="text-[24px] font-bold text-[#2F343B]">
                        Inactive Activities
                      </h3>
                      <p className="text-sm text-[#7A8088] mt-1">
                        Past activities, closed registrations, or drafts pending activation.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                      19 Inactive
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px]">
                      <thead className="bg-[#FBFAF8]">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Activity
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Category
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Last Active
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Status
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {inactiveActivities.map((activity) => (
                          <tr
                            key={activity.id}
                            className="border-t border-[#E5E2DC] align-top"
                          >
                            <td className="px-5 py-5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={activity.image}
                                  alt={activity.title}
                                  className="w-12 h-12 rounded-[10px] object-cover"
                                />
                                <div>
                                  <p className="font-semibold text-[#2F343B] text-sm">
                                    {activity.title}
                                  </p>
                                  <p className="text-xs text-[#7A8088]">
                                    {activity.category}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {activity.category}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {activity.lastActive}
                            </td>

                            <td className="px-5 py-5">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  activity.status === "Closed"
                                    ? "bg-[#F1F0EC] text-[#7A8088]"
                                    : "bg-[#FFF4D6] text-[#B98900]"
                                }`}
                              >
                                {activity.status}
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex flex-wrap gap-2">
                                <button className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white">
                                  Modify
                                </button>
                                <button className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white">
                                  Archive
                                </button>
                                <button className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium">
                                  Activate
                                </button>
                                <button className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white">
                                  Manage Session
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-5 py-4 border-t border-[#E5E2DC] flex items-center justify-between">
                    <p className="text-sm text-[#7A8088]">
                      Showing 1-3 of 19 inactive activities
                    </p>

                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-lg bg-[#ED8D31] text-white text-sm">
                        1
                      </button>
                      <button className="w-8 h-8 rounded-lg border border-[#E5E2DC] text-sm">
                        2
                      </button>
                      <button className="w-8 h-8 rounded-lg border border-[#E5E2DC] text-sm">
                        3
                      </button>
                      <button className="w-8 h-8 rounded-lg border border-[#E5E2DC] text-sm">
                        4
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right panel */}
              <div className="space-y-5">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[24px] font-bold text-[#2F343B]">
                    Activity summary
                  </h3>
                  <p className="text-sm text-[#7A8088] mt-1 mb-4">
                    Overview of all activity statuses.
                  </p>

                  <div className="space-y-3">
                    <SummaryRow label="Total Activities" value="24" />
                    <SummaryRow label="Active" value="5" />
                    <SummaryRow label="Closed" value="16" />
                    <SummaryRow label="Drafts" value="3" />
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[24px] font-bold text-[#2F343B]">
                    Admin actions
                  </h3>
                  <p className="text-sm text-[#7A8088] mt-1 mb-4">
                    Quick shortcuts for activity management.
                  </p>

                  <div className="space-y-3">
                    <ActionCard
                      title="Create new activity"
                      desc="Set up a new activity, define rules, and upload assets."
                      button="Create"
                    />
                    <ActionCard
                      title="Launch a draw"
                      desc="Run the random selection algorithm for ready sessions."
                      button="Launch"
                    />
                    <ActionCard
                      title="Sessions & Quotas"
                      desc="Manage capacity and dates for upcoming activities."
                      button="Manage"
                    />
                    <ActionCard
                      title="Export reports"
                      desc="Download activity participation data and history."
                      button="Export"
                    />
                  </div>
                </section>
              </div>
            </div>
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

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-bold text-[#2F343B]">{value}</span>
    </div>
  );
}

function ActionCard({ title, desc, button }) {
  return (
    <div className="rounded-[18px] border border-[#E5E2DC] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-[#2F343B]">{title}</h4>
          <p className="text-xs text-[#7A8088] mt-1 leading-[160%]">{desc}</p>
        </div>

        <button className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-xs font-semibold whitespace-nowrap">
          {button}
        </button>
      </div>
    </div>
  );
}