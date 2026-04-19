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
    reason: "Personal constraints prevented participation.",
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
    reason: "Family schedule changed before departure.",
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
    reason: "Medical incompatibility reported after selection.",
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
    reason: "Unable to travel due to work assignment conflict.",
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
    reason: "Requested withdrawal before final confirmation.",
  },
];

export default function ManageWithdrawals() {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [selectedId, setSelectedId] = useState(initialWithdrawals[0]?.id ?? null);

  const [modal, setModal] = useState({
    open: false,
    type: null, // details | process | reassign | export
    withdrawalId: null,
  });

  const selectedWithdrawal =
    withdrawals.find((item) => item.id === (modal.withdrawalId ?? selectedId)) || null;

  const totalWithdrawals = withdrawals.length;
  const pendingCount = withdrawals.filter((w) => w.status === "Pending").length;
  const processedCount = withdrawals.filter((w) => w.status === "Processed").length;
  const reassignedCount = withdrawals.filter((w) => w.reassigned).length;

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      withdrawalId: null,
    });
  };

  const openModal = (type, withdrawalId = selectedId) => {
    setModal({
      open: true,
      type,
      withdrawalId,
    });
  };

  const processWithdrawal = (id) => {
    setWithdrawals((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Processed" } : item
      )
    );
    closeModal();
  };

  const reassignSeat = (id) => {
    setWithdrawals((prev) =>
      prev.map((item) =>
        item.id === id && item.replacementCandidate
          ? { ...item, status: "Processed", reassigned: true }
          : item
      )
    );
    closeModal();
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

                <button
                  onClick={() => openModal("export")}
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                >
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
                            className={`border-t border-[#E5E2DC] align-top ${
                              selectedId === item.id ? "bg-[#FCFBF9]" : ""
                            }`}
                          >
                            <td className="px-5 py-5">
                              <button
                                onClick={() => setSelectedId(item.id)}
                                className="text-left"
                              >
                                <p className="font-semibold text-[#2F343B] text-sm">
                                  {item.employee}
                                </p>
                                <p className="text-xs text-[#7A8088] mt-1">
                                  {item.employeeId}
                                </p>
                              </button>
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
                                <button
                                  onClick={() => openModal("details", item.id)}
                                  className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                >
                                  View details
                                </button>

                                {!item.reassigned && (
                                  <button
                                    onClick={() => openModal("process", item.id)}
                                    className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                  >
                                    Process
                                  </button>
                                )}

                                {!item.reassigned && item.replacementCandidate && (
                                  <button
                                    onClick={() => openModal("reassign", item.id)}
                                    className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium"
                                  >
                                    Reassign seat
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}

                        {withdrawals.length === 0 && (
                          <tr>
                            <td
                              colSpan="7"
                              className="px-5 py-10 text-center text-sm text-[#7A8088]"
                            >
                              No withdrawals available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-5 py-4 border-t border-[#E5E2DC] flex items-center justify-between">
                    <p className="text-sm text-[#7A8088]">
                      Showing 1-{withdrawals.length} of {totalWithdrawals} withdrawals
                    </p>

                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-lg bg-[#ED8D31] text-white text-sm">
                        1
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
                        onClick={() => openModal("details")}
                      />
                      <ActionCard
                        title="Process withdrawal"
                        desc="Formally approve the withdrawal and release the seat."
                        button="Open"
                        onClick={() => openModal("process")}
                      />
                      <ActionCard
                        title="Promote suppléant"
                        desc="Transfer the available capacity to the next waiting-list employee."
                        button="Open"
                        onClick={() => openModal("reassign")}
                      />
                      <ActionCard
                        title="Export withdrawals"
                        desc="Download the filtered list for reporting or archives."
                        button="Export"
                        onClick={() => openModal("export")}
                      />
                    </div>
                  </section>

                  {selectedWithdrawal && (
                    <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                      <h3 className="text-[24px] font-bold text-[#2F343B]">
                        Selected withdrawal
                      </h3>
                      <p className="text-sm text-[#7A8088] mt-1 mb-4">
                        Quick summary of the currently selected request.
                      </p>

                      <div className="space-y-3">
                        <SummaryRow label="Employee" value={selectedWithdrawal.employee} />
                        <SummaryRow label="ID" value={selectedWithdrawal.employeeId} />
                        <SummaryRow label="Activity" value={selectedWithdrawal.activity} />
                        <SummaryRow label="Session" value={selectedWithdrawal.session} />
                        <SummaryRow label="Status" value={selectedWithdrawal.status} />
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Details modal */}
      {modal.open && modal.type === "details" && selectedWithdrawal && (
        <ModalShell title="Withdrawal Details" onClose={closeModal}>
          <DetailRow label="Employee" value={selectedWithdrawal.employee} />
          <DetailRow label="Employee ID" value={selectedWithdrawal.employeeId} />
          <DetailRow label="Activity" value={selectedWithdrawal.activity} />
          <DetailRow label="Activity Type" value={selectedWithdrawal.activityType} />
          <DetailRow label="Session" value={selectedWithdrawal.session} />
          <DetailRow label="Withdrawal Date" value={selectedWithdrawal.date} />
          <DetailRow label="Status" value={selectedWithdrawal.status} />

          <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
            <p className="text-sm font-semibold text-[#2F343B] mb-2">
              Withdrawal Reason
            </p>
            <p className="text-sm text-[#7A8088] leading-[170%]">
              {selectedWithdrawal.reason}
            </p>
          </div>
        </ModalShell>
      )}

      {/* Process modal */}
      {modal.open && modal.type === "process" && selectedWithdrawal && (
        <ConfirmModal
          title="Process Withdrawal"
          message={`Do you want to process the withdrawal for ${selectedWithdrawal.employee}?`}
          confirmLabel="Process"
          onCancel={closeModal}
          onConfirm={() => processWithdrawal(selectedWithdrawal.id)}
        />
      )}

      {/* Reassign modal */}
      {modal.open && modal.type === "reassign" && selectedWithdrawal && (
        <ConfirmModal
          title="Reassign Seat"
          message={
            selectedWithdrawal.replacementCandidate
              ? `Do you want to reassign this seat to ${selectedWithdrawal.replacementCandidate}?`
              : "No replacement candidate is available for this withdrawal."
          }
          confirmLabel="Reassign"
          onCancel={closeModal}
          onConfirm={() => reassignSeat(selectedWithdrawal.id)}
          disabled={!selectedWithdrawal.replacementCandidate}
        />
      )}

      {/* Export modal */}
      {modal.open && modal.type === "export" && (
        <ConfirmModal
          title="Export Withdrawals"
          message="Do you want to export the current withdrawals list?"
          confirmLabel="Export"
          onCancel={closeModal}
          onConfirm={closeModal}
        />
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

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3 gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-bold text-[#2F343B] text-right">{value}</span>
    </div>
  );
}

function ActionCard({ title, desc, button, onClick }) {
  return (
    <div className="rounded-[18px] border border-[#E5E2DC] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-[#2F343B]">{title}</h4>
          <p className="text-xs text-[#7A8088] mt-1 leading-[160%]">{desc}</p>
        </div>

        <button
          onClick={onClick}
          className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-xs font-semibold whitespace-nowrap"
        >
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

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[520px] shadow-lg">
        <h2 className="text-xl font-bold text-[#2F343B] mb-4">{title}</h2>
        <div className="space-y-3 mb-6">{children}</div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[12px] border border-[#E5E2DC]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
  disabled = false,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg">
        <h2 className="text-xl font-bold text-[#2F343B] mb-3">{title}</h2>
        <p className="text-sm text-[#7A8088] mb-6 leading-[170%]">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={disabled}
            className={`px-4 py-2 rounded-[12px] text-sm font-medium ${
              disabled
                ? "bg-[#ED8D31]/50 text-white cursor-not-allowed"
                : "bg-[#ED8D31] text-white"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3 gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B] text-right">
        {value}
      </span>
    </div>
  );
}