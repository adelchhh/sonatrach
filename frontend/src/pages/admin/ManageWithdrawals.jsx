import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPatch } from "../../api";

const STATUS_LABEL = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PROCESSED: "Processed",
};

const STATUS_STYLES = {
  PENDING: "bg-[#FFF4D6] text-[#B98900]",
  APPROVED: "bg-[#D4F4DD] text-[#2D7A4A]",
  REJECTED: "bg-[#FBE1E1] text-[#A93B3B]",
  PROCESSED: "bg-[#DAE7FB] text-[#2A52BE]",
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

function getCurrentUserId() {
  try {
    return JSON.parse(localStorage.getItem("user"))?.id || null;
  } catch {
    return null;
  }
}

export default function ManageWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actingOn, setActingOn] = useState(null);

  const [filters, setFilters] = useState({ search: "", status: "all" });
  const [modal, setModal] = useState({ open: false, type: null, id: null });
  const [comment, setComment] = useState("");

  const adminId = getCurrentUserId();

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/withdrawals")
      .then((res) => setWithdrawals(res.data || []))
      .catch((err) =>
        setPageError(err.message || "Could not load withdrawals.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return withdrawals.filter((w) => {
      if (filters.status !== "all" && w.status !== filters.status) return false;
      if (q) {
        const haystack = [
          w.employee_number,
          w.user_first_name,
          w.user_last_name,
          w.activity_title,
          w.reason,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [withdrawals, filters]);

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter((w) => w.status === "PENDING").length,
    approved: withdrawals.filter((w) => w.status === "APPROVED").length,
    processed: withdrawals.filter((w) => w.status === "PROCESSED").length,
  };

  const closeModal = () => {
    setModal({ open: false, type: null, id: null });
    setComment("");
  };

  const handleAction = async (id, status, requireComment = false) => {
    if (requireComment && !comment.trim()) {
      alert("Please provide a comment.");
      return;
    }
    setActingOn(id);
    try {
      await apiPatch(`/withdrawals/${id}/status`, {
        status,
        admin_comment: comment.trim() || null,
        processed_by: adminId,
      });
      closeModal();
      load();
    } catch (err) {
      alert(err.message || "Could not update withdrawal.");
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
                  Manage Withdrawals
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Review withdrawal requests submitted by employees. Approving
                  marks the registration as withdrawn and frees the spot.
                </p>
              </div>

              {pageError && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {pageError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total requests" value={stats.total} />
                <StatCard title="Pending" value={stats.pending} />
                <StatCard title="Approved" value={stats.approved} />
                <StatCard title="Processed" value={stats.processed} />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, search: e.target.value }))
                    }
                    placeholder="Search employee, activity, reason..."
                    className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, status: e.target.value }))
                    }
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option value="all">All statuses</option>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setFilters({ search: "", status: "all" })}
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
                          Requested
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Reason
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
                            Loading withdrawals...
                          </td>
                        </tr>
                      )}

                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            No withdrawal requests match the filters.
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        filtered.map((w) => (
                          <tr
                            key={w.id}
                            className="border-t border-[#E5E2DC] align-top"
                          >
                            <td className="px-5 py-5">
                              <p className="font-semibold text-[#2F343B] text-sm">
                                {w.user_first_name} {w.user_last_name}
                              </p>
                              <p className="text-xs text-[#7A8088] mt-1">
                                Matricule {w.employee_number}
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <p className="text-sm font-medium text-[#2F343B]">
                                {w.activity_title}
                              </p>
                              <p className="text-xs text-[#7A8088] mt-1">
                                Session #{w.session_id} ·{" "}
                                {formatDate(w.start_date)} →{" "}
                                {formatDate(w.end_date)}
                              </p>
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {formatDate(w.requested_at)}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#2F343B] max-w-[260px]">
                              {w.reason || "—"}
                              {w.admin_comment && (
                                <p className="text-xs text-[#7A8088] mt-1">
                                  Admin: {w.admin_comment}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-5">
                              <StatusBadge status={w.status} />
                            </td>

                            <td className="px-5 py-5">
                              {w.status === "PENDING" ? (
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() =>
                                      setModal({
                                        open: true,
                                        type: "approve",
                                        id: w.id,
                                      })
                                    }
                                    disabled={actingOn === w.id}
                                    className="px-3 py-1.5 rounded-lg bg-[#2D7A4A] text-white text-sm font-medium disabled:opacity-60"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      setModal({
                                        open: true,
                                        type: "reject",
                                        id: w.id,
                                      })
                                    }
                                    disabled={actingOn === w.id}
                                    className="px-3 py-1.5 rounded-lg bg-[#A93B3B] text-white text-sm font-medium disabled:opacity-60"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : w.status === "APPROVED" ? (
                                <button
                                  onClick={() =>
                                    handleAction(w.id, "PROCESSED")
                                  }
                                  disabled={actingOn === w.id}
                                  className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium disabled:opacity-60"
                                >
                                  Mark processed
                                </button>
                              ) : (
                                <span className="text-xs text-[#7A8088]">
                                  {formatDate(w.processed_at)}
                                </span>
                              )}
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

      {modal.open && (modal.type === "approve" || modal.type === "reject") && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              {modal.type === "approve"
                ? "Approve Withdrawal"
                : "Reject Withdrawal"}
            </h2>

            <p className="text-sm text-[#7A8088] mb-4">
              {modal.type === "approve"
                ? "Approving will mark the registration as withdrawn and free the spot. Add an optional admin comment."
                : "Add a comment to explain the rejection."}
            </p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder={
                modal.type === "approve"
                  ? "Optional admin comment..."
                  : "Required reason for rejection..."
              }
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
                onClick={() =>
                  handleAction(
                    modal.id,
                    modal.type === "approve" ? "APPROVED" : "REJECTED",
                    modal.type === "reject"
                  )
                }
                disabled={actingOn === modal.id}
                className={`px-4 py-2 rounded-[12px] text-white text-sm font-medium disabled:opacity-60 ${
                  modal.type === "approve" ? "bg-[#2D7A4A]" : "bg-[#A93B3B]"
                }`}
              >
                {actingOn === modal.id
                  ? "Processing..."
                  : modal.type === "approve"
                  ? "Confirm approval"
                  : "Confirm rejection"}
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
