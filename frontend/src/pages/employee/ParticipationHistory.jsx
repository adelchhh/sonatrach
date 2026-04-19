import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const initialHistory = [
  {
    id: 1,
    activity: "Summer Camp",
    category: "Family",
    session: "Kids Session 2",
    participatedOn: "Aug 20, 2024",
    duration: "7 days",
    location: "Bejaia",
    status: "Completed",
    note: "You completed this activity successfully and participated for the full duration.",
  },
  {
    id: 2,
    activity: "Running",
    category: "Sport",
    session: "Community Run 2024",
    participatedOn: "Jul 21, 2024",
    duration: "1 day",
    location: "Algiers",
    status: "Completed",
    note: "Your participation was recorded and completed without issues.",
  },
  {
    id: 3,
    activity: "Camping",
    category: "Nature",
    session: "Spring Camp",
    participatedOn: "May 14, 2024",
    duration: "3 days",
    location: "Chrea",
    status: "Completed",
    note: "You attended the full camping session and the activity was marked as completed.",
  },
  {
    id: 4,
    activity: "Bungalow Stay",
    category: "Family Stay",
    session: "Session B",
    participatedOn: "Mar 09, 2024",
    duration: "5 days",
    location: "Oran",
    status: "Cancelled",
    note: "This activity was cancelled before completion due to organizational constraints.",
  },
];

export default function ParticipationHistory() {
  const [history] = useState(initialHistory);
  const [modal, setModal] = useState({
    open: false,
    historyId: null,
  });

  const selectedItem = history.find((item) => item.id === modal.historyId);

  const completed = history.filter((item) => item.status === "Completed").length;
  const cancelled = history.filter((item) => item.status === "Cancelled").length;

  const closeModal = () => {
    setModal({
      open: false,
      historyId: null,
    });
  };

  return (
    <>
      <div className="flex h-screen bg-[#F7F7F5]">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopBar />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  Participation History
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Review the activities you joined in the past and keep track of
                  your participation journey across sessions and categories.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title="Total Participations"
                  value={history.length}
                  subtitle="All recorded activity experiences"
                />
                <StatCard
                  title="Completed"
                  value={completed}
                  subtitle="Successfully completed activities"
                />
                <StatCard
                  title="Cancelled"
                  value={cancelled}
                  subtitle="Activities that did not take place"
                />
              </div>

              {/* Filters */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  Archive Filters
                </h2>
                <p className="text-sm text-[#7A8088] mt-1 mb-4">
                  Search through your participation archive by activity, location, or status.
                </p>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Search activity..."
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

              {/* History table */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                  <div>
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      History List
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Past activities you were registered in and their final outcomes.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                    {history.length} entries
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Activity
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Category
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Session
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Date
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Duration
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Location
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
                      {history.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-[#E5E2DC] align-top"
                        >
                          <td className="px-5 py-5 font-semibold text-[#2F343B] text-sm">
                            {item.activity}
                          </td>

                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {item.category}
                          </td>

                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {item.session}
                          </td>

                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {item.participatedOn}
                          </td>

                          <td className="px-5 py-5 text-sm text-[#2F343B]">
                            {item.duration}
                          </td>

                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {item.location}
                          </td>

                          <td className="px-5 py-5">
                            <StatusBadge status={item.status} />
                          </td>

                          <td className="px-5 py-5">
                            <button
                              onClick={() =>
                                setModal({
                                  open: true,
                                  historyId: item.id,
                                })
                              }
                              className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                            >
                              View details
                            </button>
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

      {/* Details Modal */}
      {modal.open && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[520px] shadow-lg">
            <h2 className="text-xl font-bold text-[#2F343B] mb-4">
              Participation Details
            </h2>

            <div className="space-y-3 mb-6">
              <DetailRow label="Activity" value={selectedItem.activity} />
              <DetailRow label="Category" value={selectedItem.category} />
              <DetailRow label="Session" value={selectedItem.session} />
              <DetailRow label="Date" value={selectedItem.participatedOn} />
              <DetailRow label="Duration" value={selectedItem.duration} />
              <DetailRow label="Location" value={selectedItem.location} />
              <DetailRow label="Status" value={selectedItem.status} />
            </div>

            <div className="rounded-[16px] bg-[#F9F8F6] p-4 mb-6">
              <p className="text-sm font-semibold text-[#2F343B] mb-2">
                Participation Note
              </p>
              <p className="text-sm text-[#7A8088] leading-[170%]">
                {selectedItem.note}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3 gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B] text-right">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Completed: "bg-[#D4F4DD] text-[#2D7A4A]",
    Cancelled: "bg-[#F1F0EC] text-[#7A8088]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}