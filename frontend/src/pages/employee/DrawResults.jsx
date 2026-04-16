import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const results = [
  {
    id: 1,
    activity: "Omra",
    session: "Winter Session 2024",
    drawDate: "Oct 10, 2024",
    status: "Selected",
  },
  {
    id: 2,
    activity: "Camping",
    session: "Autumn Session",
    drawDate: "Sep 28, 2024",
    status: "Waiting List",
  },
  {
    id: 3,
    activity: "Bungalow Stay",
    session: "Session A",
    drawDate: "Sep 15, 2024",
    status: "Not Selected",
  },
  {
    id: 4,
    activity: "Summer Camp",
    session: "Kids Session 2",
    drawDate: "Aug 20, 2024",
    status: "Confirmed",
  },
];

export default function DrawResults() {
  const selected = results.filter(r => r.status === "Selected").length;
  const waiting = results.filter(r => r.status === "Waiting List").length;
  const rejected = results.filter(r => r.status === "Not Selected").length;
  const confirmed = results.filter(r => r.status === "Confirmed").length;

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B]">
                Draw Results
              </h1>
              <p className="text-[#7A8088] text-sm mt-2">
                Check the outcome of your activity applications and confirm your participation if selected.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard title="Selected" value={selected} />
              <StatCard title="Waiting List" value={waiting} />
              <StatCard title="Not Selected" value={rejected} />
              <StatCard title="Confirmed" value={confirmed} />
            </div>

            {/* Results table */}
            <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DC]">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  Results List
                </h2>
                <p className="text-sm text-[#7A8088] mt-1">
                  Overview of all your draw results.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-[#FBFAF8]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs text-[#7A8088] uppercase">
                        Activity
                      </th>
                      <th className="px-5 py-4 text-left text-xs text-[#7A8088] uppercase">
                        Session
                      </th>
                      <th className="px-5 py-4 text-left text-xs text-[#7A8088] uppercase">
                        Draw Date
                      </th>
                      <th className="px-5 py-4 text-left text-xs text-[#7A8088] uppercase">
                        Result
                      </th>
                      <th className="px-5 py-4 text-left text-xs text-[#7A8088] uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.map((item) => (
                      <tr key={item.id} className="border-t border-[#E5E2DC]">
                        <td className="px-5 py-5 font-semibold text-[#2F343B]">
                          {item.activity}
                        </td>

                        <td className="px-5 py-5 text-[#7A8088]">
                          {item.session}
                        </td>

                        <td className="px-5 py-5 text-[#7A8088]">
                          {item.drawDate}
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex gap-2">

                            {item.status === "Selected" && (
                              <button className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm">
                                Confirm
                              </button>
                            )}

                            {item.status === "Waiting List" && (
                              <span className="text-sm text-[#7A8088]">
                                Waiting...
                              </span>
                            )}

                            {item.status === "Confirmed" && (
                              <span className="text-sm text-[#2D7A4A] font-semibold">
                                Confirmed
                              </span>
                            )}

                            {item.status === "Not Selected" && (
                              <span className="text-sm text-[#C95454]">
                                Not selected
                              </span>
                            )}

                            <button className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm">
                              Details
                            </button>

                          </div>
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

function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-[#E5E2DC] rounded-[20px] p-5">
      <p className="text-sm text-[#7A8088]">{title}</p>
      <p className="text-3xl font-bold text-[#2F343B] mt-2">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Selected": "bg-[#D4F4DD] text-[#2D7A4A]",
    "Waiting List": "bg-[#FFF4D6] text-[#B98900]",
    "Not Selected": "bg-[#FFE4E4] text-[#C95454]",
    "Confirmed": "bg-[#E8F4FF] text-[#2B6CB0]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}