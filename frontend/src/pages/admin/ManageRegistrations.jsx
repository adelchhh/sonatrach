import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

export default function ManageRegistrations() {
  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">

            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-[28px] font-bold text-[#2F343B]">
                  Manage Registrations
                </h1>
                <p className="text-sm text-[#7A8088] mt-1">
                  Manage all employee applications to activities, filter by activity or session,
                  review documents, and update registration status when needed.
                </p>
              </div>

              <button className="px-4 py-2 rounded-xl bg-[#ED8D31] text-white text-sm font-semibold">
                Export Registrations
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Stat title="Total Registrations" value="642" />
              <Stat title="Pending Review" value="84" />
              <Stat title="Confirmed" value="246" />
              <Stat title="Waiting List" value="39" />
            </div>

            {/* Filters */}
            <div className="bg-white border border-[#E5E2DC] rounded-[20px] p-4 flex flex-wrap gap-3 items-center">
              <input
                placeholder="Search by employee name or ID"
                className="px-3 py-2 rounded-lg border border-[#E5E2DC] text-sm w-[240px]"
              />

              <select className="px-3 py-2 rounded-lg border border-[#E5E2DC] text-sm">
                <option>All activities</option>
              </select>

              <select className="px-3 py-2 rounded-lg border border-[#E5E2DC] text-sm">
                <option>All sessions</option>
              </select>

              <select className="px-3 py-2 rounded-lg border border-[#E5E2DC] text-sm">
                <option>All status</option>
              </select>

              <button className="ml-auto px-4 py-2 text-sm rounded-lg border border-[#E5E2DC]">
                Reset
              </button>

              <button className="px-4 py-2 bg-[#ED8D31] text-white text-sm rounded-lg">
                Apply filters
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">

              {/* Applications table */}
              <div className="bg-white border border-[#E5E2DC] rounded-[20px] overflow-hidden">

                <div className="px-6 py-4 border-b border-[#E5E2DC]">
                  <h2 className="font-bold text-[#2F343B]">Applications</h2>
                </div>

                <table className="w-full">
                  <thead className="bg-[#F9F8F6] text-xs text-[#7A8088]">
                    <tr>
                      <th className="px-6 py-3 text-left">Employee</th>
                      <th className="px-6 py-3 text-left">Activity</th>
                      <th className="px-6 py-3 text-left">Session</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    <Row name="Yacine Bensaïd" activity="Excursion à Djanet" status="Pending" />
                    <Row name="Nadia Meziane" activity="Vacances nature" status="Selected" />
                    <Row name="Karim Touati" activity="Thermal stay" status="Rejected" />
                    <Row name="Samira Ghezali" activity="Corporate Retreat" status="Confirmed" />
                  </tbody>
                </table>
              </div>

              {/* Right panel */}
              <div className="space-y-4">

                {/* Status summary */}
                <div className="bg-white border border-[#E5E2DC] rounded-[20px] p-4">
                  <h3 className="font-semibold mb-3 text-[#2F343B]">
                    Status summary
                  </h3>

                  <SummaryItem label="Pending" value="84" />
                  <SummaryItem label="Selected" value="157" />
                  <SummaryItem label="Waiting list" value="39" />
                  <SummaryItem label="Rejected" value="116" />
                  <SummaryItem label="Confirmed" value="246" />
                </div>

                {/* Admin actions */}
                <div className="bg-white border border-[#E5E2DC] rounded-[20px] p-4">
                  <h3 className="font-semibold mb-3 text-[#2F343B]">
                    Admin actions
                  </h3>

                  <ActionItem title="View application details" />
                  <ActionItem title="Approve or reject manually" />
                  <ActionItem title="Mark as confirmed" />
                  <ActionItem title="Check uploaded documents" />
                  <ActionItem title="Export registrations" />
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white border border-[#E5E2DC] rounded-[16px] p-4">
      <p className="text-xs text-[#7A8088]">{title}</p>
      <p className="text-xl font-bold text-[#2F343B] mt-2">{value}</p>
    </div>
  );
}

function Row({ name, activity, status }) {
  return (
    <tr className="border-t border-[#E5E2DC]">
      <td className="px-6 py-4 text-sm font-medium text-[#2F343B]">{name}</td>
      <td className="px-6 py-4 text-sm text-[#7A8088]">{activity}</td>
      <td className="px-6 py-4 text-sm text-[#7A8088]">Session A</td>
      <td className="px-6 py-4">
        <span className="text-xs px-3 py-1 rounded-full bg-[#F5F4F1]">
          {status}
        </span>
      </td>
    </tr>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="flex justify-between py-2 text-sm">
      <span className="text-[#7A8088]">{label}</span>
      <span className="font-semibold text-[#2F343B]">{value}</span>
    </div>
  );
}

function ActionItem({ title }) {
  return (
    <div className="flex justify-between items-center py-2 text-sm border-t border-[#F0EEEA]">
      <span className="text-[#2F343B]">{title}</span>
      <button className="text-xs px-3 py-1 border rounded-lg">Open</button>
    </div>
  );
}