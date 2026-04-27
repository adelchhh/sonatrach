import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPost, getCurrentUserId } from "../../api";

const STATUS_LABEL = {
  PENDING: "Pending validation",
  VALIDATED: "Validated — awaiting draw",
  REJECTED: "Rejected",
  SELECTED: "Selected ✨",
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

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actingOn, setActingOn] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState({
    open: false,
    registrationId: null,
  });
  const [withdrawReason, setWithdrawReason] = useState("");

  const userId = getCurrentUserId();

  const load = () => {
    if (!userId) {
      setLoading(false);
      setPageError("Please log in to see your requests.");
      return;
    }
    setLoading(true);
    setPageError(null);
    apiGet(`/me/registrations?user_id=${userId}`)
      .then((res) => setRequests(res.data || []))
      .catch((err) => setPageError(err.message || "Could not load requests."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [userId]);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) =>
      ["PENDING", "VALIDATED", "WAITING_LIST"].includes(r.status)
    ).length;
    const selected = requests.filter((r) =>
      ["SELECTED", "CONFIRMED"].includes(r.status)
    ).length;
    const closed = requests.filter((r) =>
      ["REJECTED", "WITHDRAWN", "CANCELLED"].includes(r.status)
    ).length;
    return { total, pending, selected, closed };
  }, [requests]);

  const handleCancel = async (registrationId) => {
    if (!window.confirm("Cancel this registration? This cannot be undone.")) {
      return;
    }
    setActingOn(registrationId);
    try {
      await apiPost(`/registrations/${registrationId}/cancel`, {
        user_id: userId,
      });
      load();
    } catch (err) {
      alert(err.message || "Could not cancel.");
    } finally {
      setActingOn(null);
    }
  };

  const submitWithdraw = async () => {
    if (!withdrawReason.trim()) {
      alert("Please provide a reason.");
      return;
    }
    setActingOn(withdrawModal.registrationId);
    try {
      await apiPost(`/withdrawals`, {
        registration_id: withdrawModal.registrationId,
        reason: withdrawReason.trim(),
      });
      setWithdrawModal({ open: false, registrationId: null });
      setWithdrawReason("");
      load();
    } catch (err) {
      alert(err.message || "Could not submit withdrawal.");
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
                  My Requests
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Track all your activity registrations, see draw outcomes and
                  withdraw if needed.
                </p>
              </div>

              {pageError && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {pageError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total requests" value={stats.total} />
                <StatCard title="In progress" value={stats.pending} />
                <StatCard title="Selected / Confirmed" value={stats.selected} />
                <StatCard title="Closed" value={stats.closed} />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                  <h2 className="text-[24px] font-bold text-[#2F343B]">
                    All my registrations
                  </h2>
                  <Link
                    to="/dashboard/catalog"
                    className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-semibold"
                  >
                    + Register to a new activity
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Activity / Session
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Submitted
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          My choices
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Status
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Reference
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
                            Loading your requests...
                          </td>
                        </tr>
                      )}

                      {!loading && requests.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            You haven't registered for any activity yet.{" "}
                            <Link
                              to="/dashboard/catalog"
                              className="text-[#ED8D31] font-semibold"
                            >
                              Browse the catalog
                            </Link>
                            .
                          </td>
                        </tr>
                      )}

                      {requests.map((r) => (
                        <tr
                          key={r.id}
                          className="border-t border-[#E5E2DC] align-top"
                        >
                          <td className="px-5 py-5">
                            <p className="font-semibold text-[#2F343B] text-sm">
                              {r.activity_title}
                            </p>
                            <p className="text-xs text-[#7A8088] mt-1">
                              {formatDate(r.start_date)} →{" "}
                              {formatDate(r.end_date)}
                            </p>
                          </td>

                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {formatDate(r.registered_at)}
                          </td>

                          <td className="px-5 py-5 text-sm text-[#2F343B]">
                            {r.choices && r.choices.length > 0 ? (
                              <ul className="space-y-1">
                                {r.choices.map((c) => (
                                  <li key={c.session_site_id}>
                                    #{c.choice_order} {c.site_name}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-[#7A8088] italic">
                                No site selected
                              </span>
                            )}
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

                          <td className="px-5 py-5 text-xs text-[#7A8088]">
                            {r.reference_number || "—"}
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex flex-wrap gap-2">
                              {["PENDING", "VALIDATED"].includes(r.status) && (
                                <button
                                  onClick={() => handleCancel(r.id)}
                                  disabled={actingOn === r.id}
                                  className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-sm text-[#A93B3B] disabled:opacity-60"
                                >
                                  Cancel
                                </button>
                              )}

                              {["SELECTED", "CONFIRMED"].includes(r.status) && (
                                <button
                                  onClick={() =>
                                    setWithdrawModal({
                                      open: true,
                                      registrationId: r.id,
                                    })
                                  }
                                  disabled={actingOn === r.id}
                                  className="px-3 py-1.5 rounded-lg bg-[#A93B3B] text-white text-sm disabled:opacity-60"
                                >
                                  Withdraw
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

      {withdrawModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() =>
            setWithdrawModal({ open: false, registrationId: null })
          }
        >
          <div
            className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              Request Withdrawal
            </h2>

            <p className="text-sm text-[#7A8088] mb-4">
              Your withdrawal request will be reviewed by an admin. Provide a
              reason.
            </p>

            <textarea
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              rows={4}
              placeholder="e.g., Family emergency, work conflict..."
              className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() =>
                  setWithdrawModal({ open: false, registrationId: null })
                }
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
              >
                Cancel
              </button>

              <button
                onClick={submitWithdraw}
                disabled={actingOn === withdrawModal.registrationId}
                className="px-4 py-2 rounded-[12px] bg-[#A93B3B] text-white text-sm disabled:opacity-60"
              >
                Submit withdrawal
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
