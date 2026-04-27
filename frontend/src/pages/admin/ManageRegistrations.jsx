import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPost, apiPatch } from "../../api";

const STATUS_LABEL = {
  PENDING: "Pending",
  VALIDATED: "Validated",
  REJECTED: "Rejected",
  SELECTED: "Selected",
  WAITING_LIST: "Waiting list",
  CONFIRMED: "Confirmed",
  WITHDRAWN: "Withdrawn",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES = {
  PENDING: "bg-[#FFF4D6] text-[#B98900]",
  VALIDATED: "bg-[#E2F4D9] text-[#3D7B22]",
  REJECTED: "bg-[#FBE1E1] text-[#A93B3B]",
  SELECTED: "bg-[#DAE7FB] text-[#2A52BE]",
  WAITING_LIST: "bg-[#F7E6CC] text-[#A9651E]",
  CONFIRMED: "bg-[#D4F4DD] text-[#2D7A4A]",
  WITHDRAWN: "bg-[#F1F0EC] text-[#7A8088]",
  CANCELLED: "bg-[#F1F0EC] text-[#7A8088]",
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function ManageRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actingOn, setActingOn] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    activity: "all",
    session: "all",
    status: "all",
  });

  const [modal, setModal] = useState({ open: false, type: null, id: null });
  const [details, setDetails] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/registrations")
      .then((res) => setRegistrations(res.data || []))
      .catch((err) =>
        setPageError(err.message || "Could not load registrations.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const activities = useMemo(() => {
    const set = new Map();
    registrations.forEach((r) => {
      if (r.activity_id) {
        set.set(r.activity_id, r.activity_title);
      }
    });
    return Array.from(set.entries());
  }, [registrations]);

  const sessions = useMemo(() => {
    const set = new Map();
    registrations.forEach((r) => {
      if (r.session_id) {
        const label = `#${r.session_id} (${r.activity_title})`;
        set.set(r.session_id, label);
      }
    });
    return Array.from(set.entries());
  }, [registrations]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return registrations.filter((r) => {
      if (filters.activity !== "all" && r.activity_id !== Number(filters.activity)) return false;
      if (filters.session !== "all" && r.session_id !== Number(filters.session)) return false;
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (q) {
        const haystack = [
          r.employee_number,
          r.user_first_name,
          r.user_last_name,
          r.user_email,
          r.reference_number,
          r.activity_title,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [registrations, filters]);

  const stats = useMemo(() => {
    const total = registrations.length;
    const pending = registrations.filter((r) => r.status === "PENDING").length;
    const validated = registrations.filter(
      (r) => r.status === "VALIDATED" || r.status === "SELECTED" || r.status === "CONFIRMED"
    ).length;
    const rejected = registrations.filter(
      (r) => r.status === "REJECTED" || r.status === "CANCELLED"
    ).length;
    return { total, pending, validated, rejected };
  }, [registrations]);

  const openDetails = async (id) => {
    setModal({ open: true, type: "details", id });
    setDetails(null);
    try {
      const res = await apiGet(`/registrations/${id}`);
      setDetails(res.data);
    } catch (err) {
      setDetails({ error: err.message || "Could not load details." });
    }
  };

  const openReject = (id) => {
    setRejectReason("");
    setModal({ open: true, type: "reject", id });
  };

  const closeModal = () => {
    setModal({ open: false, type: null, id: null });
    setDetails(null);
  };

  const handleValidate = async (id) => {
    setActingOn(id);
    try {
      await apiPost(`/registrations/${id}/validate`);
      load();
    } catch (err) {
      alert(err.message || "Could not validate registration.");
    } finally {
      setActingOn(null);
    }
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setActingOn(modal.id);
    try {
      await apiPost(`/registrations/${modal.id}/reject`, {
        reason: rejectReason.trim(),
      });
      closeModal();
      load();
    } catch (err) {
      alert(err.message || "Could not reject registration.");
    } finally {
      setActingOn(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActingOn(id);
    try {
      await apiPatch(`/registrations/${id}/status`, { status });
      load();
    } catch (err) {
      alert(err.message || "Could not change status.");
    } finally {
      setActingOn(null);
    }
  };

  return (
    <>
      <div className="flex h-screen bg-[#F7F7F5]">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopBar />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  Manage Registrations
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Review employee registrations, validate eligibility, reject
                  with a reason, or change registration status.
                </p>
              </div>

              {pageError && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {pageError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total" value={stats.total} />
                <StatCard title="Pending" value={stats.pending} />
                <StatCard title="Validated / Selected" value={stats.validated} />
                <StatCard title="Rejected / Cancelled" value={stats.rejected} />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, search: e.target.value }))
                    }
                    placeholder="Search name, matricule, email, ref..."
                    className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select
                    value={filters.activity}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, activity: e.target.value }))
                    }
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option value="all">All activities</option>
                    {activities.map(([id, title]) => (
                      <option key={id} value={id}>
                        {title}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.session}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, session: e.target.value }))
                    }
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option value="all">All sessions</option>
                    {sessions.map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, status: e.target.value }))
                    }
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option value="all">All status</option>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      setFilters({
                        search: "",
                        activity: "all",
                        session: "all",
                        status: "all",
                      })
                    }
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B]"
                  >
                    Reset
                  </button>
                </div>
              </section>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Employee
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Activity / Session
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Submitted
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Documents
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
                      {loading && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            Loading registrations...
                          </td>
                        </tr>
                      )}

                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            No registrations match the filters.
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        filtered.map((r) => (
                          <tr
                            key={r.id}
                            className="border-t border-[#E5E2DC] align-top"
                          >
                            <td className="px-5 py-5">
                              <p className="font-semibold text-[#2F343B] text-sm">
                                {r.user_first_name} {r.user_last_name}
                              </p>
                              <p className="text-xs text-[#7A8088] mt-1">
                                Matricule {r.employee_number}
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <p className="text-sm font-medium text-[#2F343B]">
                                {r.activity_title}
                              </p>
                              <p className="text-xs text-[#7A8088] mt-1">
                                Session #{r.session_id} ·{" "}
                                {formatDate(r.start_date)} →{" "}
                                {formatDate(r.end_date)}
                              </p>
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {formatDate(r.registered_at)}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#2F343B]">
                              {r.documents_validated_count} /{" "}
                              {r.documents_count} validated
                            </td>

                            <td className="px-5 py-5">
                              <StatusBadge status={r.status} />
                              {r.rejection_reason && (
                                <p
                                  className="text-xs text-red-600 mt-1 max-w-[180px]"
                                  title={r.rejection_reason}
                                >
                                  {r.rejection_reason}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => openDetails(r.id)}
                                  className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white"
                                >
                                  View
                                </button>

                                {r.status === "PENDING" && (
                                  <>
                                    <button
                                      onClick={() => handleValidate(r.id)}
                                      disabled={actingOn === r.id}
                                      className="px-3 py-1.5 rounded-lg bg-[#2D7A4A] text-white text-sm font-medium disabled:opacity-60"
                                    >
                                      Validate
                                    </button>
                                    <button
                                      onClick={() => openReject(r.id)}
                                      disabled={actingOn === r.id}
                                      className="px-3 py-1.5 rounded-lg bg-[#A93B3B] text-white text-sm font-medium disabled:opacity-60"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}

                                {r.status === "SELECTED" && (
                                  <button
                                    onClick={() =>
                                      handleStatusChange(r.id, "CONFIRMED")
                                    }
                                    disabled={actingOn === r.id}
                                    className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium disabled:opacity-60"
                                  >
                                    Mark confirmed
                                  </button>
                                )}
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

      {modal.open && modal.type === "details" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-[20px] p-6 w-full max-w-[640px] shadow-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#2F343B] mb-4">
              Registration Details
            </h2>

            {!details && (
              <p className="text-sm text-[#7A8088]">Loading...</p>
            )}

            {details?.error && (
              <p className="text-sm text-red-600">{details.error}</p>
            )}

            {details?.registration && (
              <div className="space-y-4 text-sm">
                <DetailRow
                  label="Employee"
                  value={`${details.registration.user_first_name} ${details.registration.user_last_name} (${details.registration.employee_number})`}
                />
                <DetailRow
                  label="Email"
                  value={details.registration.user_email}
                />
                <DetailRow
                  label="Activity"
                  value={`${details.registration.activity_title} (${details.registration.activity_category})`}
                />
                <DetailRow
                  label="Session"
                  value={`${formatDate(details.registration.start_date)} → ${formatDate(details.registration.end_date)}`}
                />
                <DetailRow
                  label="Status"
                  value={STATUS_LABEL[details.registration.status]}
                />
                <DetailRow
                  label="Eligible"
                  value={details.registration.is_eligible ? "Yes" : "No"}
                />
                <DetailRow
                  label="Submitted"
                  value={formatDate(details.registration.registered_at)}
                />
                {details.registration.rejection_reason && (
                  <DetailRow
                    label="Rejection reason"
                    value={details.registration.rejection_reason}
                  />
                )}

                <div>
                  <p className="text-xs text-[#7A8088] uppercase font-semibold mb-2">
                    Site choices ({details.choices.length})
                  </p>
                  {details.choices.length === 0 ? (
                    <p className="text-[#7A8088]">No site choices recorded.</p>
                  ) : (
                    <ul className="space-y-1">
                      {details.choices.map((c) => (
                        <li key={c.id} className="text-[#2F343B]">
                          #{c.choice_order} — {c.site_name} (quota {c.quota})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <p className="text-xs text-[#7A8088] uppercase font-semibold mb-2">
                    Documents ({details.documents.length})
                  </p>
                  {details.documents.length === 0 ? (
                    <p className="text-[#7A8088]">No documents uploaded.</p>
                  ) : (
                    <ul className="space-y-1">
                      {details.documents.map((d) => (
                        <li key={d.document_id} className="text-[#2F343B]">
                          {d.file_name} —{" "}
                          <span className="text-[#7A8088]">{d.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.open && modal.type === "reject" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              Reject Registration
            </h2>

            <p className="text-sm text-[#7A8088] mb-4">
              Provide a reason. This will be visible to the employee.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="e.g., Documents are missing or incomplete..."
              className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={closeModal}
                disabled={actingOn === modal.id}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={submitReject}
                disabled={actingOn === modal.id}
                className="px-4 py-2 rounded-[12px] bg-[#A93B3B] text-white text-sm font-medium disabled:opacity-60"
              >
                {actingOn === modal.id ? "Rejecting..." : "Confirm rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{title}</p>
      <p className="text-3xl font-extrabold text-[#2F343B] mt-2">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || "bg-[#F1F0EC] text-[#7A8088]";
  const label = STATUS_LABEL[status] || status;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-[#7A8088] min-w-[140px]">{label}:</span>
      <span className="text-[#2F343B] font-medium break-words">{value}</span>
    </div>
  );
}
