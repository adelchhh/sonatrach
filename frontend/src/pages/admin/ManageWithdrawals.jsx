import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const initialWithdrawals = [
  {
    id: 1,
    employee: "Yacine Bensaïd",
    employeeId: "IM 005284",
    activity: "Excursion à Djanet",
    activityType: "Travel activity",
    session: "Session Autumn 2024",
    date: "Oct 12, 2024",
    status: "Pending",
    replacementCandidate: "Nadia Meziane",
    reassigned: false,
  },
  {
    id: 2,
    employee: "Nadia Meziane",
    employeeId: "IM 004913",
    activity: "Vacances nature & détente",
    activityType: "Family stay",
    session: "Family Session A",
    date: "Oct 10, 2024",
    status: "Processed",
    replacementCandidate: "Karim Touati",
    reassigned: true,
  },
  {
    id: 3,
    employee: "Karim Touati",
    employeeId: "IM 006107",
    activity: "Thermal stay - Hammam Righa",
    activityType: "Wellness stay",
    session: "Reallocation Session",
    date: "Oct 08, 2024",
    status: "Pending",
    replacementCandidate: null,
    reassigned: false,
  },
  {
    id: 4,
    employee: "Samira Ghezali",
    employeeId: "IM 003822",
    activity: "Annual Corporate Retreat",
    activityType: "Corporate event",
    session: "Main Session",
    date: "Oct 05, 2024",
    status: "Processed",
    replacementCandidate: "Anis Cherif",
    reassigned: true,
  },
  {
    id: 5,
    employee: "Anis Cherif",
    employeeId: "IM 007224",
    activity: "Excursion à Djanet",
    activityType: "Travel activity",
    session: "Late Allocation Session",
    date: "Oct 01, 2024",
    status: "Pending",
    replacementCandidate: "Lina Haddad",
    reassigned: false,
  },
];

export default function ManageWithdrawals() {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);

  const totalWithdrawals = withdrawals.length;
  const pendingCount = withdrawals.filter((w) => w.status === "Pending").length;
  const processedCount = withdrawals.filter((w) => w.status === "Processed").length;
  const reassignedCount = withdrawals.filter((w) => w.reassigned).length;

  const processWithdrawal = (id) => {
    setWithdrawals((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Processed" } : item
      )
    );
  };

  const reassignSeat = (id) => {
    setWithdrawals((prev) =>
      prev.map((item) =>
        item.id === id && item.replacementCandidate
          ? { ...item, status: "Processed", reassigned: true }
          : item
      )
    );
  };

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
                  Manage Withdrawals
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Process employee withdrawals, review replacement candidates,
                  and reassign available seats to the waiting list when possible.
                </p>
              </div>

              <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors">
                Export Withdrawals
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Total Withdrawals"
                value={totalWithdrawals}
                subtitle="Total withdrawals recorded this period"
              />
              <StatCard
                title="Pending Processing"
                value={pendingCount}
                subtitle="Withdrawals waiting for admin validation"
              />
              <StatCard
                title="Processed"
                value={processedCount}
                subtitle="Withdrawals confirmed and removed"
              />
              <StatCard
                title="Seats Reassigned"
                value={reassignedCount}
                subtitle="Seats transferred to waiting list employees"
              />
            </div>

            {/* Filters */}
            <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
              <h2 className="text-[24px] font-bold text-[#2F343B]">
                Withdrawals table
              </h2>
              <p className="text-sm text-[#7A8088] mt-1 mb-4">
                Search by employee name or ID and narrow results by activity,
                session, or processing status.
              </p>

              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Search by employee name or ID"
                  className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                />

                <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                  <option>All activities</option>
                </select>

                <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                  <option>All sessions</option>
                </select>

                <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                  <option>Pending processing</option>
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
              {/* Withdrawals table */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                  <div>
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Withdrawal Requests
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Review withdrawals, validate them, and reassign freed seats.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                    {totalWithdrawals} entries
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Employee
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Activity
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Session
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Withdrawal Date
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Replacement
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
                      {withdrawals.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-[#E5E2DC] align-top"
                        >
                          <td className="px-5 py-5">
                            <p className="font-semibold text-[#2F343B] text-sm">
                              {item.employee}
                            </p>
                            <p className="text-xs text-[#7A8088] mt-1">
                              {item.employeeId}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <p className="font-semibold text-[#2F343B] text-sm">
                              {item.activity}
                            </p>
                            <p className="text-xs text-[#7A8088] mt-1">
                              {item.activityType}
                            </p>
                          </td>

                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {item.session}
                          </td>

                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {item.date}
                          </td>

                          <td className="px-5 py-5">
                            {item.replacementCandidate ? (
                              <div>
                                <p className="text-sm font-semibold text-[#2F343B]">
                                  {item.replacementCandidate}
                                </p>
                                <p className="text-xs text-[#7A8088] mt-1">
                                  {item.reassigned ? "Seat reassigned" : "Waiting list candidate"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-[#B0B5BB]">No candidate</span>
                            )}
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex flex-col gap-2">
                              <StatusBadge status={item.status} />

                              {item.reassigned && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D4F4DD] text-[#2D7A4A] w-fit">
                                  Reassigned
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex flex-wrap gap-2">
                              <button className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm">
                                View details
                              </button>

                              {!item.reassigned && (
                                <button
                                  onClick={() => processWithdrawal(item.id)}
                                  className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                >
                                  Process
                                </button>
                              )}

                              {!item.reassigned && item.replacementCandidate && (
                                <button
                                  onClick={() => reassignSeat(item.id)}
                                  className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium"
                                >
                                  Reassign seat
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-5 py-4 border-t border-[#E5E2DC] flex items-center justify-between">
                  <p className="text-sm text-[#7A8088]">
                    Showing 1-5 of {totalWithdrawals} withdrawals
                  </p>

                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-lg border border-[#E5E2DC] text-sm">
                      1
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-[#ED8D31] text-white text-sm">
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

              {/* Right panel */}
              <div className="space-y-5">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[24px] font-bold text-[#2F343B]">
                    Status summary
                  </h3>
                  <p className="text-sm text-[#7A8088] mt-1 mb-4">
                    Current distribution of withdrawals by processing state.
                  </p>

                  <div className="space-y-3">
                    <SummaryRow label="Pending" value={pendingCount} />
                    <SummaryRow label="Processed" value={processedCount} />
                    <SummaryRow label="Reassigned" value={reassignedCount} />
                  </div>

                  <div className="mt-4 rounded-[16px] bg-[#F6EADB] p-4">
                    <p className="text-sm text-[#5A4A36] leading-[170%]">
                      When a withdrawal is approved, the next eligible suppléant
                      should be promoted from the waiting list whenever available.
                    </p>
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[24px] font-bold text-[#2F343B]">
                    Admin actions
                  </h3>
                  <p className="text-sm text-[#7A8088] mt-1 mb-4">
                    Common actions available for withdrawal management.
                  </p>

                  <div className="space-y-3">
                    <ActionCard
                      title="View withdrawal details"
                      desc="Open the employee's request, review the reason, and attached files."
                      button="Open"
                    />
                    <ActionCard
                      title="Process withdrawal"
                      desc="Formally approve the withdrawal and release the seat."
                      button="Open"
                    />
                    <ActionCard
                      title="Promote suppléant"
                      desc="Transfer the available capacity to the next waiting-list employee."
                      button="Open"
                    />
                    <ActionCard
                      title="Export withdrawals"
                      desc="Download the filtered list for reporting or archives."
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

        <button className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-xs font-semibold whitespace-nowrap">
          {button}
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-[#FFF4D6] text-[#B98900]",
    Processed: "bg-[#F1F0EC] text-[#7A8088]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${styles[status]}`}>
      {status}
    </span>
  );
}