import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const monthlyApplications = [
  { month: "Jan", value: 120 },
  { month: "Feb", value: 210 },
  { month: "Mar", value: 380 },
  { month: "Apr", value: 410 },
  { month: "May", value: 450 },
  { month: "Jun", value: 320 },
  { month: "Jul", value: 280 },
  { month: "Aug", value: 350 },
  { month: "Sep", value: 200 },
  { month: "Oct", value: 180 },
];

const outcomes = [
  {
    label: "Approved & Confirmed",
    value: "2,209 (64%)",
    percent: 64,
    color: "#3FA56B",
  },
  {
    label: "Rejected (Not selected)",
    value: "863 (25%)",
    percent: 25,
    color: "#D85C5C",
  },
  {
    label: "Waiting List",
    value: "241 (7%)",
    percent: 7,
    color: "#F2B54A",
  },
  {
    label: "Pending Processing",
    value: "139 (4%)",
    percent: 4,
    color: "#ED8D31",
  },
];

const performanceRows = [
  {
    activity: "Excursion à Djanet",
    category: "Travel",
    capacity: 150,
    applications: 845,
    approvalRate: "17.7%",
    status: "Completed",
  },
  {
    activity: "Vacances nature & détente",
    category: "Family Stay",
    capacity: 300,
    applications: 512,
    approvalRate: "58.6%",
    status: "Completed",
  },
  {
    activity: "Thermal stay - Hammam Righa",
    category: "Wellness",
    capacity: 200,
    applications: 430,
    approvalRate: "46.5%",
    status: "Active",
  },
  {
    activity: "Annual Corporate Retreat",
    category: "Event",
    capacity: 500,
    applications: 610,
    approvalRate: "82.0%",
    status: "Draft",
  },
];

export default function Reports() {
  const maxMonthly = Math.max(...monthlyApplications.map((item) => item.value));

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  Reports & Analytics
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Comprehensive insights on employee participation, activity
                  performance, and system usage.
                </p>
              </div>

              <div className="flex gap-3">
                <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B] outline-none">
                  <option>Year 2024</option>
                  <option>Year 2023</option>
                </select>

                <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors">
                  Export PDF
                </button>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Total Applications"
                value="3,452"
                subtitle="+12% vs last year"
                subtitleColor="#3FA56B"
              />
              <StatCard
                title="Unique Participants"
                value="1,840"
                subtitle="Employees participated this year"
              />
              <StatCard
                title="Overall Approval Rate"
                value="64%"
                subtitle="Average across all activities"
              />
              <StatCard
                title="Active Campaigns"
                value="18"
                subtitle="Activities hosted this year"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
              {/* Monthly Applications */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <h2 className="text-[28px] font-bold text-[#2F343B]">
                  Monthly Applications
                </h2>
                <p className="text-sm text-[#7A8088] mt-1 mb-4">
                  Volume of requests submitted across all activities per month.
                </p>

                <div className="flex items-end gap-6 h-[240px] pt-4">
                  {monthlyApplications.map((item) => {
                    const height = (item.value / maxMonthly) * 100;

                    return (
                      <div
                        key={item.month}
                        className="flex-1 flex flex-col items-center justify-end gap-2"
                      >
                        <span className="text-xs font-semibold text-[#2F343B]">
                          {item.value}
                        </span>

                        <div className="w-full flex justify-center items-end h-[180px]">
                          <div
                            className="w-[34px] rounded-t-[8px] bg-[#ED8D31]"
                            style={{ height: `${height}%` }}
                          />
                        </div>

                        <span className="text-sm text-[#7A8088]">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Application Outcomes */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <h2 className="text-[28px] font-bold text-[#2F343B]">
                  Application Outcomes
                </h2>
                <p className="text-sm text-[#7A8088] mt-1 mb-5">
                  Distribution of request statuses year to date.
                </p>

                <div className="space-y-5">
                  {outcomes.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-[#2F343B]">
                          {item.label}
                        </span>
                        <span className="text-sm text-[#7A8088]">{item.value}</span>
                      </div>

                      <div className="w-full h-3 rounded-full bg-[#F1F0EC] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.percent}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Activity performance */}
            <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                <div>
                  <h2 className="text-[28px] font-bold text-[#2F343B]">
                    Activity Performance
                  </h2>
                  <p className="text-sm text-[#7A8088] mt-1">
                    Detailed breakdown of engagement metrics by activity.
                  </p>
                </div>

                <button className="px-4 py-2 rounded-[14px] border border-[#E5E2DC] text-sm font-medium text-[#2F343B] bg-white">
                  View All Activities
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-[#FBFAF8]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Activity Name
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Category
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Capacity
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Applications
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Approval Rate
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {performanceRows.map((row) => (
                      <tr
                        key={row.activity}
                        className="border-t border-[#E5E2DC]"
                      >
                        <td className="px-5 py-5 font-semibold text-[#2F343B] text-sm">
                          {row.activity}
                        </td>
                        <td className="px-5 py-5 text-sm text-[#7A8088]">
                          {row.category}
                        </td>
                        <td className="px-5 py-5 text-sm text-[#2F343B]">
                          {row.capacity}
                        </td>
                        <td className="px-5 py-5 text-sm text-[#2F343B]">
                          {row.applications}
                        </td>
                        <td className="px-5 py-5 text-sm text-[#7A8088]">
                          {row.approvalRate}
                        </td>
                        <td className="px-5 py-5">
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, subtitleColor = "#7A8088" }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{title}</p>
      <p className="text-3xl font-extrabold text-[#2F343B] mt-2">{value}</p>
      <p className="text-xs mt-2" style={{ color: subtitleColor }}>
        {subtitle}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Completed: "bg-[#D4F4DD] text-[#2D7A4A]",
    Active: "bg-[#FFF4D6] text-[#B98900]",
    Draft: "bg-[#F1F0EC] text-[#7A8088]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}