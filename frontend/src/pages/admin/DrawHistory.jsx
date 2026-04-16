import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const drawLogs = [
  {
    id: 1,
    date: "Sep 22, 2024",
    time: "09:14 AM",
    activity: "Excursion à Djanet",
    session: "Session Autumn 2024",
    rules: ["Family", "Exclude 12m"],
    selected: "50 / 50",
    waiting: "+10 waiting",
    status: "Draft",
  },
  {
    id: 2,
    date: "Sep 20, 2024",
    time: "14:30 PM",
    activity: "Vacances nature & détente",
    session: "Family Session A",
    rules: ["Family Strict"],
    selected: "120 / 120",
    waiting: "+24 waiting",
    status: "Published",
  },
  {
    id: 3,
    date: "Sep 18, 2024",
    time: "10:05 AM",
    activity: "Thermal stay - Hammam Righa",
    session: "Reallocation Session",
    rules: ["Seniority"],
    selected: "15 / 15",
    waiting: "+0 waiting",
    status: "Published",
  },
  {
    id: 4,
    date: "Sep 10, 2024",
    time: "11:20 AM",
    activity: "Annual Corporate Retreat",
    session: "Main Session",
    rules: ["Global"],
    selected: "300 / 300",
    waiting: "+50 waiting",
    status: "Published",
  },
  {
    id: 5,
    date: "Sep 05, 2024",
    time: "08:00 AM",
    activity: "Vacances nature & détente",
    session: "Family Session B",
    rules: ["Family Strict"],
    selected: "0 / 120",
    waiting: "Aborted",
    status: "Cancelled",
  },
];

export default function DrawHistory() {
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
                  Draw History
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Review previous draw executions, access results, and track
                  historical selection algorithms.
                </p>
              </div>

              <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors">
                Export Full History
              </button>
            </div>

            {/* Filters */}
            <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <FilterField label="Activity">
                  <select className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>All Activities</option>
                  </select>
                </FilterField>

                <FilterField label="Session">
                  <select className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>All Sessions</option>
                  </select>
                </FilterField>

                <FilterField label="Execution Date">
                  <select className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>Past 6 Months</option>
                  </select>
                </FilterField>

                <FilterField label="Status">
                  <select className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>All Statuses</option>
                  </select>
                </FilterField>
              </div>
            </section>

            {/* Logs */}
            <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DC]">
                <h2 className="text-[28px] font-bold text-[#2F343B]">
                  Execution Logs
                </h2>
                <p className="text-sm text-[#7A8088] mt-1">
                  Showing 24 algorithm executions matching your filters.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="bg-[#FBFAF8]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Execution Date
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Activity & Session
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Rules Applied
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Selected / Quota
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
                    {drawLogs.map((log) => (
                      <tr key={log.id} className="border-t border-[#E5E2DC] align-top">
                        <td className="px-5 py-5">
                          <p className="font-semibold text-[#2F343B] text-sm">
                            {log.date}
                          </p>
                          <p className="text-xs text-[#7A8088] mt-1">{log.time}</p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-semibold text-[#2F343B] text-sm">
                            {log.activity}
                          </p>
                          <p className="text-xs text-[#7A8088] mt-1">{log.session}</p>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex flex-wrap gap-2">
                            {log.rules.map((rule) => (
                              <span
                                key={rule}
                                className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold"
                              >
                                {rule}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-semibold text-[#2F343B] text-sm">
                            {log.selected}
                          </p>
                          <p className="text-xs text-[#7A8088] mt-1">{log.waiting}</p>
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge status={log.status} />
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <button className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-medium">
                              View Results
                            </button>

                            <button className="w-9 h-9 rounded-[12px] border border-[#E5E2DC] bg-white text-[#7A8088]">
                              ⋮
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
                  Showing 1 to 5 of 24 results
                </p>

                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-lg border border-[#E5E2DC] text-sm">
                    ‹
                  </button>
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
                    …
                  </button>
                  <button className="w-8 h-8 rounded-lg border border-[#E5E2DC] text-sm">
                    5
                  </button>
                  <button className="w-8 h-8 rounded-lg border border-[#E5E2DC] text-sm">
                    ›
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Draft: "bg-[#FFF4D6] text-[#B98900]",
    Published: "bg-[#D4F4DD] text-[#2D7A4A]",
    Cancelled: "bg-[#F1F0EC] text-[#7A8088]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}