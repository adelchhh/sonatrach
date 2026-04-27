import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPost } from "../../api";

const STATUS_LABEL = {
  UPLOADED: "Uploaded",
  VALIDATED: "Validated",
  REJECTED: "Rejected",
};

const STATUS_STYLES = {
  UPLOADED: "bg-[#FFF4D6] text-[#B98900]",
  VALIDATED: "bg-[#D4F4DD] text-[#2D7A4A]",
  REJECTED: "bg-[#FBE1E1] text-[#A93B3B]",
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
    const raw = JSON.parse(localStorage.getItem("user"));
    return raw?.id || null;
  } catch {
    return null;
  }
}

export default function ManageDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actingOn, setActingOn] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    activity: "all",
    status: "all",
  });

  const [modal, setModal] = useState({ open: false, type: null, id: null });
  const [comment, setComment] = useState("");

  const adminId = getCurrentUserId();

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/documents")
      .then((res) => setDocuments(res.data || []))
      .catch((err) =>
        setPageError(err.message || "Could not load documents.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const activities = useMemo(() => {
    const set = new Map();
    documents.forEach((d) => {
      set.set(d.activity_title, d.activity_title);
    });
    return Array.from(set.values());
  }, [documents]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return documents.filter((d) => {
      if (filters.activity !== "all" && d.activity_title !== filters.activity)
        return false;
      if (filters.status !== "all" && d.status !== filters.status) return false;
      if (q) {
        const haystack = [
          d.employee_number,
          d.user_first_name,
          d.user_last_name,
          d.file_name,
          d.document_type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [documents, filters]);

  const stats = {
    total: documents.length,
    uploaded: documents.filter((d) => d.status === "UPLOADED").length,
    validated: documents.filter((d) => d.status === "VALIDATED").length,
    rejected: documents.filter((d) => d.status === "REJECTED").length,
  };

  const closeModal = () => {
    setModal({ open: false, type: null, id: null });
    setComment("");
  };

  const handleValidate = async (id) => {
    setActingOn(id);
    try {
      await apiPost(`/documents/${id}/validate`, {
        comment: null,
        validated_by: adminId,
      });
      load();
    } catch (err) {
      alert(err.message || "Could not validate document.");
    } finally {
      setActingOn(null);
    }
  };

  const submitReject = async () => {
    if (!comment.trim()) {
      alert("Please provide a rejection comment.");
      return;
    }
    setActingOn(modal.id);
    try {
      await apiPost(`/documents/${modal.id}/reject`, {
        comment: comment.trim(),
        validated_by: adminId,
      });
      closeModal();
      load();
    } catch (err) {
      alert(err.message || "Could not reject document.");
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
                  Manage Documents
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Review documents uploaded by employees, validate them, or
                  reject them with a comment that the employee will see.
                </p>
              </div>

              {pageError && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {pageError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total documents" value={stats.total} />
                <StatCard title="Pending review" value={stats.uploaded} />
                <StatCard title="Validated" value={stats.validated} />
                <StatCard title="Rejected" value={stats.rejected} />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, search: e.target.value }))
                    }
                    placeholder="Search employee, file name, type..."
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
                    {activities.map((a) => (
                      <option key={a} value={a}>
                        {a}
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
                    <option value="all">All statuses</option>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      setFilters({ search: "", activity: "all", status: "all" })
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
                          Activity
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Document
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Uploaded
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
                            Loading documents...
                          </td>
                        </tr>
                      )}

                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            No documents match the filters.
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        filtered.map((d) => (
                          <tr
                            key={d.id}
                            className="border-t border-[#E5E2DC] align-top"
                          >
                            <td className="px-5 py-5">
                              <p className="font-semibold text-[#2F343B] text-sm">
                                {d.user_first_name} {d.user_last_name}
                              </p>
                              <p className="text-xs text-[#7A8088] mt-1">
                                Matricule {d.employee_number}
                              </p>
                            </td>

                            <td className="px-5 py-5 text-sm text-[#2F343B]">
                              {d.activity_title}
                              <p className="text-xs text-[#7A8088] mt-1">
                                Session #{d.session_id}
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <p className="text-sm font-medium text-[#2F343B]">
                                {d.document_type || "—"}
                              </p>
                              <p className="text-xs text-[#7A8088] mt-1 break-all">
                                {d.file_name}
                              </p>
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {formatDate(d.uploaded_at)}
                            </td>

                            <td className="px-5 py-5">
                              <StatusBadge status={d.status} />
                              {d.validation_comment && (
                                <p
                                  className="text-xs text-[#7A8088] mt-1 max-w-[180px]"
                                  title={d.validation_comment}
                                >
                                  {d.validation_comment}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex flex-wrap gap-2">
                                {d.status === "UPLOADED" && (
                                  <>
                                    <button
                                      onClick={() => handleValidate(d.id)}
                                      disabled={actingOn === d.id}
                                      className="px-3 py-1.5 rounded-lg bg-[#2D7A4A] text-white text-sm font-medium disabled:opacity-60"
                                    >
                                      Validate
                                    </button>
                                    <button
                                      onClick={() => {
                                        setComment("");
                                        setModal({
                                          open: true,
                                          type: "reject",
                                          id: d.id,
                                        });
                                      }}
                                      disabled={actingOn === d.id}
                                      className="px-3 py-1.5 rounded-lg bg-[#A93B3B] text-white text-sm font-medium disabled:opacity-60"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {d.status !== "UPLOADED" && (
                                  <button
                                    onClick={() => handleValidate(d.id)}
                                    disabled={actingOn === d.id}
                                    className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white text-[#7A8088] disabled:opacity-60"
                                    title="Re-validate"
                                  >
                                    Re-validate
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
              Reject Document
            </h2>

            <p className="text-sm text-[#7A8088] mb-4">
              Provide a comment so the employee knows what to fix.
            </p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="e.g., The scan is unreadable, please re-upload..."
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
