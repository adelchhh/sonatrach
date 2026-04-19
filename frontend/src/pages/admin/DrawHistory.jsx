import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const initialDrawLogs = [
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
    note: "Results generated successfully and saved in draft state pending publication.",
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
    note: "Published draw results were shared with the relevant employee groups.",
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
    note: "This run was executed for reallocation after previous withdrawals.",
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
    note: "Main session draw completed successfully with waiting list generation.",
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
    note: "Execution was cancelled before completion due to configuration conflict.",
  },
];

export default function DrawHistory() {
  const [drawLogs, setDrawLogs] = useState(initialDrawLogs);
  const [selectedId, setSelectedId] = useState(initialDrawLogs[0]?.id ?? null);

  const [modal, setModal] = useState({
    open: false,
    type: null, // results | actions | export
    drawId: null,
  });

  const selectedLog =
    drawLogs.find((log) => log.id === (modal.drawId ?? selectedId)) || null;

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      drawId: null,
    });
  };

  const openModal = (type, drawId = selectedId) => {
    setModal({
      open: true,
      type,
      drawId,
    });
  };

  const handleExport = () => {
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

                <button
                  onClick={() => openModal("export")}
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                >
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

              <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
                {/* Logs */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[28px] font-bold text-[#2F343B]">
                      Execution Logs
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Showing {drawLogs.length} algorithm executions matching your filters.
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
                          <tr
                            key={log.id}
                            className={`border-t border-[#E5E2DC] align-top ${
                              selectedId === log.id ? "bg-[#FCFBF9]" : ""
                            }`}
                          >
                            <td className="px-5 py-5">
                              <button
                                onClick={() => setSelectedId(log.id)}
                                className="text-left"
                              >
                                <p className="font-semibold text-[#2F343B] text-sm">
                                  {log.date}
                                </p>
                                <p className="text-xs text-[#7A8088] mt-1">{log.time}</p>
                              </button>
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
                                <button
                                  onClick={() => openModal("results", log.id)}
                                  className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-medium"
                                >
                                  View Results
                                </button>

                                <button
                                  onClick={() => openModal("actions", log.id)}
                                  className="w-9 h-9 rounded-[12px] border border-[#E5E2DC] bg-white text-[#7A8088]"
                                >
                                  ⋮
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {drawLogs.length === 0 && (
                          <tr>
                            <td
                              colSpan="6"
                              className="px-5 py-10 text-center text-sm text-[#7A8088]"
                            >
                              No draw history available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-5 py-4 border-t border-[#E5E2DC] flex items-center justify-between">
                    <p className="text-sm text-[#7A8088]">
                      Showing 1 to {drawLogs.length} of {drawLogs.length} results
                    </p>

                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-lg border border-[#E5E2DC] text-sm">
                        ‹
                      </button>
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
                      Selected log
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1 mb-4">
                      Quick summary of the currently selected execution.
                    </p>

                    {selectedLog && (
                      <div className="space-y-3">
                        <SummaryRow label="Activity" value={selectedLog.activity} />
                        <SummaryRow label="Session" value={selectedLog.session} />
                        <SummaryRow label="Date" value={selectedLog.date} />
                        <SummaryRow label="Time" value={selectedLog.time} />
                        <SummaryRow label="Status" value={selectedLog.status} />
                      </div>
                    )}
                  </section>

                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Quick actions
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1 mb-4">
                      Access the most common operations for draw history review.
                    </p>

                    <div className="space-y-3">
                      <ActionCard
                        title="View draw results"
                        desc="Open the selected execution and inspect generated outcomes."
                        button="Open"
                        onClick={() => openModal("results")}
                      />
                      <ActionCard
                        title="More actions"
                        desc="Inspect additional actions available for the selected execution."
                        button="Open"
                        onClick={() => openModal("actions")}
                      />
                      <ActionCard
                        title="Export history"
                        desc="Download the complete execution history for reporting."
                        button="Export"
                        onClick={() => openModal("export")}
                      />
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Results modal */}
      {modal.open && modal.type === "results" && selectedLog && (
        <ModalShell title="Draw Execution Details" onClose={closeModal}>
          <DetailRow label="Activity" value={selectedLog.activity} />
          <DetailRow label="Session" value={selectedLog.session} />
          <DetailRow label="Execution Date" value={selectedLog.date} />
          <DetailRow label="Execution Time" value={selectedLog.time} />
          <DetailRow label="Selected / Quota" value={selectedLog.selected} />
          <DetailRow label="Waiting List" value={selectedLog.waiting} />
          <DetailRow label="Status" value={selectedLog.status} />

          <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
            <p className="text-sm font-semibold text-[#2F343B] mb-2">
              Applied Rules
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedLog.rules.map((rule) => (
                <span
                  key={rule}
                  className="px-3 py-1 rounded-full bg-white border border-[#E5E2DC] text-[#7A8088] text-xs font-semibold"
                >
                  {rule}
                </span>
              ))}
            </div>
            <p className="text-sm text-[#7A8088] leading-[170%]">
              {selectedLog.note}
            </p>
          </div>
        </ModalShell>
      )}

      {/* Actions modal */}
      {modal.open && modal.type === "actions" && selectedLog && (
        <ModalShell title="Execution Actions" onClose={closeModal}>
          <DetailRow label="Activity" value={selectedLog.activity} />
          <DetailRow label="Session" value={selectedLog.session} />
          <DetailRow label="Status" value={selectedLog.status} />

          <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
            <p className="text-sm font-semibold text-[#2F343B] mb-3">
              Available actions
            </p>

            <div className="space-y-3">
              <ActionCard
                title="View results"
                desc="Open the detailed result summary for this draw execution."
                button="Open"
                onClick={() => openModal("results", selectedLog.id)}
              />

              <ActionCard
                title="Export this execution"
                desc="Download a report for this specific draw run."
                button="Export"
                onClick={closeModal}
              />
            </div>
          </div>
        </ModalShell>
      )}

      {/* Export modal */}
      {modal.open && modal.type === "export" && (
        <ConfirmModal
          title="Export Full History"
          message="Do you want to export the full draw execution history?"
          confirmLabel="Export"
          onCancel={closeModal}
          onConfirm={handleExport}
        />
      )}
    </>
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
            className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-medium"
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