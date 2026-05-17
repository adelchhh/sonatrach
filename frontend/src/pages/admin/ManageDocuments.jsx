import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPost } from "../../api";
import { useT } from "../../i18n/LanguageContext";

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
  const t = useT();
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
                  {t("admin.documents.title")}
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  {t("admin.documents.subtitle")}
                </p>
              </div>

              {pageError && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {pageError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title={t("admin.documents.statTotal")} value={stats.total} />
                <StatCard title={t("admin.documents.statPending")} value={stats.uploaded} />
                <StatCard title={t("admin.documents.statValidated")} value={stats.validated} />
                <StatCard title={t("admin.documents.statRejected")} value={stats.rejected} />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, search: e.target.value }))
                    }
                    placeholder={t("admin.documents.searchPlaceholder")}
                    className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select
                    value={filters.activity}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, activity: e.target.value }))
                    }
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option value="all">{t("admin.registrations.allActivities")}</option>
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
                    <option value="all">{t("common.allStatuses")}</option>
                    {["UPLOADED", "VALIDATED", "REJECTED"].map((k) => (
                      <option key={k} value={k}>
                        {k === "UPLOADED" ? t("admin.documents.statPending") : t(`statuses.${k}`)}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      setFilters({ search: "", activity: "all", status: "all" })
                    }
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B]"
                  >
                    {t("common.reset")}
                  </button>
                </div>
              </section>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          {t("admin.documents.col.employee")}
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          {t("admin.documents.col.activity")}
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          {t("admin.documents.col.document")}
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          {t("admin.documents.col.uploaded")}
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          {t("common.status")}
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          {t("common.actions")}
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
                            {t("admin.documents.loading")}
                          </td>
                        </tr>
                      )}

                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            {t("admin.documents.emptyFiltered")}
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
                                {t("admin.registrations.matricule", { number: d.employee_number })}
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
                                      {t("admin.documents.validate")}
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
                                      {t("admin.documents.reject")}
                                    </button>
                                  </>
                                )}
                                {d.status !== "UPLOADED" && (
                                  <button
                                    onClick={() => handleValidate(d.id)}
                                    disabled={actingOn === d.id}
                                    className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white text-[#7A8088] disabled:opacity-60"
                                    title={t("admin.documents.revalidate")}
                                  >
                                    {t("admin.documents.revalidate")}
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
              {t("admin.documents.rejectModal.title")}
            </h2>

            <p className="text-sm text-[#7A8088] mb-4">
              {t("admin.documents.rejectModal.text")}
            </p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={t("admin.documents.rejectModal.placeholder")}
              className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={closeModal}
                disabled={actingOn === modal.id}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm disabled:opacity-60"
              >
                {t("common.cancel")}
              </button>

              <button
                onClick={submitReject}
                disabled={actingOn === modal.id}
                className="px-4 py-2 rounded-[12px] bg-[#A93B3B] text-white text-sm font-medium disabled:opacity-60"
              >
                {actingOn === modal.id ? t("admin.documents.rejectModal.rejecting") : t("admin.documents.rejectModal.confirm")}
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
  const t = useT();
  const cls = STATUS_STYLES[status] || "bg-[#F1F0EC] text-[#7A8088]";
  const labelMap = {
    UPLOADED: t("admin.documents.statPending"),
    VALIDATED: t("statuses.VALIDATED"),
    REJECTED: t("statuses.REJECTED"),
  };
  const label = labelMap[status] || status;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
