import { useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const initialRegistrations = [
  {
    id: 1,
    name: "Yacine Bensaïd",
    employeeId: "EMP-2041",
    activity: "Excursion à Djanet",
    session: "Session A",
    registrationType: "Draw",
    status: "Pending Draw",
    submittedOn: "Sep 18, 2024",
    documentsStatus: "Complete",
  },
  {
    id: 2,
    name: "Nadia Meziane",
    employeeId: "EMP-1987",
    activity: "Vacances nature",
    session: "Session A",
    registrationType: "Direct",
    status: "Accepted",
    submittedOn: "Sep 14, 2024",
    documentsStatus: "Complete",
  },
  {
    id: 3,
    name: "Karim Touati",
    employeeId: "EMP-1763",
    activity: "Thermal stay",
    session: "Session B",
    registrationType: "Draw",
    status: "Waiting List",
    submittedOn: "Sep 10, 2024",
    documentsStatus: "Missing",
  },
  {
    id: 4,
    name: "Samira Ghezali",
    employeeId: "EMP-2210",
    activity: "Corporate Retreat",
    session: "Session A",
    registrationType: "Direct",
    status: "Confirmed",
    submittedOn: "Sep 05, 2024",
    documentsStatus: "Complete",
  },
  {
    id: 5,
    name: "Rania Belkacem",
    employeeId: "EMP-2334",
    activity: "Omra",
    session: "Winter Session 2024",
    registrationType: "Draw",
    status: "Selected",
    submittedOn: "Sep 22, 2024",
    documentsStatus: "Complete",
  },
  {
    id: 6,
    name: "Walid Merabet",
    employeeId: "EMP-2450",
    activity: "Summer Camp",
    session: "Kids Session 2",
    registrationType: "Direct",
    status: "Cancelled",
    submittedOn: "Aug 28, 2024",
    documentsStatus: "Complete",
  },
  {
    id: 7,
    name: "Lina Derradji",
    employeeId: "EMP-2502",
    activity: "Omra",
    session: "Winter Session 2024",
    registrationType: "Draw",
    status: "Pending Draw",
    submittedOn: "Sep 23, 2024",
    documentsStatus: "Complete",
  },
  {
    id: 8,
    name: "Sofiane Rahmani",
    employeeId: "EMP-2391",
    activity: "Excursion à Djanet",
    session: "Session A",
    registrationType: "Draw",
    status: "Selected",
    submittedOn: "Sep 19, 2024",
    documentsStatus: "Missing",
  },
];

export default function ManageRegistrations() {
  const [registrations] = useState(initialRegistrations);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedSingleId, setSelectedSingleId] = useState(
    initialRegistrations[0]?.id ?? null
  );

  const [filters, setFilters] = useState({
    search: "",
    activity: "All activities",
    session: "All sessions",
    status: "All status",
    documentsStatus: "All documents",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [modal, setModal] = useState({
    open: false,
    type: null, // details | export
    registrationId: null,
  });

  const activities = ["All activities", ...new Set(registrations.map((r) => r.activity))];
  const sessions = ["All sessions", ...new Set(registrations.map((r) => r.session))];
  const statuses = [
    "All status",
    "Pending Draw",
    "Selected",
    "Accepted",
    "Waiting List",
    "Confirmed",
    "Rejected",
    "Cancelled",
  ];
  const documentStatuses = ["All documents", "Complete", "Missing"];

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      const matchesSearch =
        !appliedFilters.search.trim() ||
        r.name.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
        r.employeeId.toLowerCase().includes(appliedFilters.search.toLowerCase());

      const matchesActivity =
        appliedFilters.activity === "All activities" ||
        r.activity === appliedFilters.activity;

      const matchesSession =
        appliedFilters.session === "All sessions" ||
        r.session === appliedFilters.session;

      const matchesStatus =
        appliedFilters.status === "All status" ||
        r.status === appliedFilters.status;

      const matchesDocuments =
        appliedFilters.documentsStatus === "All documents" ||
        r.documentsStatus === appliedFilters.documentsStatus;

      return (
        matchesSearch &&
        matchesActivity &&
        matchesSession &&
        matchesStatus &&
        matchesDocuments
      );
    });
  }, [registrations, appliedFilters]);

  const selectedRegistration =
    registrations.find((r) => r.id === (modal.registrationId ?? selectedSingleId)) || null;

  const stats = useMemo(() => {
    return {
      total: registrations.length,
      pendingDraw: registrations.filter((r) => r.status === "Pending Draw").length,
      confirmed: registrations.filter((r) => r.status === "Confirmed").length,
      waiting: registrations.filter((r) => r.status === "Waiting List").length,
    };
  }, [registrations]);

  const allVisibleIds = filteredRegistrations.map((r) => r.id);
  const allVisibleSelected =
    allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      registrationId: null,
    });
  };

  const openModal = (type, registrationId = selectedSingleId) => {
    setModal({
      open: true,
      type,
      registrationId,
    });
  };

  const toggleRowSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...allVisibleIds])]);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setSelectedIds([]);
  };

  const handleResetFilters = () => {
    const reset = {
      search: "",
      activity: "All activities",
      session: "All sessions",
      status: "All status",
      documentsStatus: "All documents",
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setSelectedIds([]);
  };

  return (
    <>
      <div className="flex h-screen bg-[#F7F7F5]">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopBar />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h1 className="text-[28px] font-bold text-[#2F343B]">
                    Manage Registrations
                  </h1>
                  <p className="text-sm text-[#7A8088] mt-1 max-w-[820px]">
                    Monitor employee registrations per activity and session,
                    follow automatic statuses, apply filters, and export
                    registration lists when needed.
                  </p>
                </div>

                <button
                  onClick={() => openModal("export")}
                  className="px-4 py-2 rounded-xl bg-[#ED8D31] text-white text-sm font-semibold"
                >
                  Export Registrations
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Stat title="Total Registrations" value={stats.total} />
                <Stat title="Pending Draw" value={stats.pendingDraw} />
                <Stat title="Confirmed" value={stats.confirmed} />
                <Stat title="Waiting List" value={stats.waiting} />
              </div>

              <div className="bg-white border border-[#E5E2DC] rounded-[20px] p-4 flex flex-wrap gap-3 items-center">
                <input
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  placeholder="Search by employee name or ID"
                  className="px-3 py-2 rounded-lg border border-[#E5E2DC] text-sm w-[240px]"
                />

                <select
                  value={filters.activity}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, activity: e.target.value }))
                  }
                  className="px-3 py-2 rounded-lg border border-[#E5E2DC] text-sm"
                >
                  {activities.map((activity) => (
                    <option key={activity}>{activity}</option>
                  ))}
                </select>

                <select
                  value={filters.session}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, session: e.target.value }))
                  }
                  className="px-3 py-2 rounded-lg border border-[#E5E2DC] text-sm"
                >
                  {sessions.map((session) => (
                    <option key={session}>{session}</option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="px-3 py-2 rounded-lg border border-[#E5E2DC] text-sm"
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>

                <select
                  value={filters.documentsStatus}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      documentsStatus: e.target.value,
                    }))
                  }
                  className="px-3 py-2 rounded-lg border border-[#E5E2DC] text-sm"
                >
                  {documentStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>

                <button
                  onClick={handleResetFilters}
                  className="ml-auto px-4 py-2 text-sm rounded-lg border border-[#E5E2DC]"
                >
                  Reset
                </button>

                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-[#ED8D31] text-white text-sm rounded-lg"
                >
                  Apply filters
                </button>
              </div>

              {selectedIds.length > 0 && (
                <div className="bg-white border border-[#E5E2DC] rounded-[20px] p-4 flex flex-wrap gap-3 items-center">
                  <p className="text-sm font-semibold text-[#2F343B]">
                    {selectedIds.length} registration(s) selected
                  </p>

                  <button
                    onClick={() => openModal("export")}
                    className="px-4 py-2 rounded-lg border border-[#E5E2DC] text-sm bg-white"
                  >
                    Export Selected
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
                <div className="bg-white border border-[#E5E2DC] rounded-[20px] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                    <h2 className="font-bold text-[#2F343B]">Applications</h2>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] font-semibold">
                      {filteredRegistrations.length} visible
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1040px]">
                      <thead className="bg-[#F9F8F6] text-xs text-[#7A8088]">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={allVisibleSelected}
                              onChange={toggleSelectAllVisible}
                            />
                          </th>
                          <th className="px-6 py-3 text-left">Employee</th>
                          <th className="px-6 py-3 text-left">Activity</th>
                          <th className="px-6 py-3 text-left">Session</th>
                          <th className="px-6 py-3 text-left">Type</th>
                          <th className="px-6 py-3 text-left">Documents</th>
                          <th className="px-6 py-3 text-left">Status</th>
                          <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredRegistrations.map((row) => (
                          <tr
                            key={row.id}
                            className={`border-t border-[#E5E2DC] ${
                              selectedSingleId === row.id ? "bg-[#FCFBF9]" : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(row.id)}
                                onChange={() => toggleRowSelection(row.id)}
                              />
                            </td>

                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedSingleId(row.id)}
                                className="text-left"
                              >
                                <p className="text-sm font-medium text-[#2F343B]">
                                  {row.name}
                                </p>
                                <p className="text-xs text-[#7A8088] mt-1">
                                  {row.employeeId}
                                </p>
                              </button>
                            </td>

                            <td className="px-6 py-4 text-sm text-[#7A8088]">
                              {row.activity}
                            </td>

                            <td className="px-6 py-4 text-sm text-[#7A8088]">
                              {row.session}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`text-xs px-3 py-1 rounded-full ${
                                  row.registrationType === "Draw"
                                    ? "bg-[#FFF4D6] text-[#B98900]"
                                    : "bg-[#E8F4FF] text-[#2B6CB0]"
                                }`}
                              >
                                {row.registrationType}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`text-xs px-3 py-1 rounded-full ${
                                  row.documentsStatus === "Complete"
                                    ? "bg-[#D4F4DD] text-[#2D7A4A]"
                                    : "bg-[#FFF4D6] text-[#B98900]"
                                }`}
                              >
                                {row.documentsStatus}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <StatusBadge status={row.status} />
                            </td>

                            <td className="px-6 py-4">
                              <button
                                onClick={() => openModal("details", row.id)}
                                className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}

                        {filteredRegistrations.length === 0 && (
                          <tr>
                            <td
                              colSpan="8"
                              className="px-6 py-10 text-center text-sm text-[#7A8088]"
                            >
                              No registrations found for the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white border border-[#E5E2DC] rounded-[20px] p-4">
                    <h3 className="font-semibold mb-3 text-[#2F343B]">
                      Status summary
                    </h3>

                    <SummaryItem label="Pending Draw" value={stats.pendingDraw} />
                    <SummaryItem label="Confirmed" value={stats.confirmed} />
                    <SummaryItem label="Waiting list" value={stats.waiting} />
                    <SummaryItem label="Total" value={stats.total} />
                  </div>

                  <div className="bg-white border border-[#E5E2DC] rounded-[20px] p-4">
                    <h3 className="font-semibold mb-3 text-[#2F343B]">
                      Admin actions
                    </h3>

                    <ActionItem
                      title="View registration details"
                      onOpen={() => openModal("details")}
                    />
                    <ActionItem
                      title="Export registrations"
                      onOpen={() => openModal("export")}
                    />
                  </div>

                  {selectedRegistration && (
                    <div className="bg-white border border-[#E5E2DC] rounded-[20px] p-4">
                      <h3 className="font-semibold mb-3 text-[#2F343B]">
                        Selected application
                      </h3>

                      <SummaryItem label="Employee" value={selectedRegistration.name} />
                      <SummaryItem label="ID" value={selectedRegistration.employeeId} />
                      <SummaryItem label="Activity" value={selectedRegistration.activity} />
                      <SummaryItem label="Session" value={selectedRegistration.session} />
                      <SummaryItem label="Type" value={selectedRegistration.registrationType} />
                      <SummaryItem label="Status" value={selectedRegistration.status} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {modal.open && modal.type === "details" && selectedRegistration && (
        <ModalShell title="Registration Details" onClose={closeModal}>
          <DetailRow label="Employee" value={selectedRegistration.name} />
          <DetailRow label="Employee ID" value={selectedRegistration.employeeId} />
          <DetailRow label="Activity" value={selectedRegistration.activity} />
          <DetailRow label="Session" value={selectedRegistration.session} />
          <DetailRow label="Registration Type" value={selectedRegistration.registrationType} />
          <DetailRow label="Submitted On" value={selectedRegistration.submittedOn} />
          <DetailRow label="Documents Status" value={selectedRegistration.documentsStatus} />
          <DetailRow label="Status" value={selectedRegistration.status} />
        </ModalShell>
      )}

      {modal.open && modal.type === "export" && (
        <ConfirmModal
          title="Export Registrations"
          message={
            selectedIds.length > 0
              ? `Do you want to export ${selectedIds.length} selected registration(s)?`
              : "Do you want to export the current registrations list?"
          }
          confirmLabel="Export"
          onCancel={closeModal}
          onConfirm={closeModal}
        />
      )}
    </>
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

function StatusBadge({ status }) {
  const styles = {
    "Pending Draw": "bg-[#FFF4D6] text-[#B98900]",
    Selected: "bg-[#D4F4DD] text-[#2D7A4A]",
    Accepted: "bg-[#E8F4FF] text-[#2B6CB0]",
    Confirmed: "bg-[#DDF5E5] text-[#2D7A4A]",
    "Waiting List": "bg-[#F1F0EC] text-[#7A8088]",
    Rejected: "bg-[#FFE4E4] text-[#C95454]",
    Cancelled: "bg-[#F1F0EC] text-[#7A8088]",
  };

  return (
    <span className={`text-xs px-3 py-1 rounded-full ${styles[status] || "bg-[#F5F4F1]"}`}>
      {status}
    </span>
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

function ActionItem({ title, onOpen }) {
  return (
    <div className="flex justify-between items-center py-2 text-sm border-t border-[#F0EEEA]">
      <span className="text-[#2F343B]">{title}</span>
      <button onClick={onOpen} className="text-xs px-3 py-1 border rounded-lg">
        Open
      </button>
    </div>
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