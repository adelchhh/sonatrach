import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { Link } from "react-router-dom";
import { apiGet, apiPatch, apiDelete, getCurrentUserId } from "../../api";

const TYPE_STYLES = {
  OFFICIAL: "bg-[#FFE6CC] text-[#A95A1B]",
  GENERAL: "bg-[#F1F0EC] text-[#7A8088]",
  REMINDER: "bg-[#FFF4D6] text-[#B98900]",
  EVENT: "bg-[#F2B54A] text-white",
  HEALTH: "bg-[#D4F4DD] text-[#2D7A4A]",
  SOCIAL: "bg-[#DAE7FB] text-[#2A52BE]",
  SURVEY: "bg-[#F7E6CC] text-[#A9651E]",
};

const STATUS_STYLES = {
  DRAFT: "bg-[#FFF4D6] text-[#B98900]",
  PUBLISHED: "bg-[#D4F4DD] text-[#2D7A4A]",
  ARCHIVED: "bg-[#F1F0EC] text-[#7A8088]",
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

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actingOn, setActingOn] = useState(null);

  const [filters, setFilters] = useState({ search: "", status: "all", type: "all" });
  const [modal, setModal] = useState({ open: false, type: null, id: null });

  const userId = getCurrentUserId();

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/admin/announcements")
      .then((res) => setAnnouncements(res.data || []))
      .catch((err) => setPageError(err.message || "Could not load announcements."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return announcements.filter((a) => {
      if (filters.status !== "all" && a.status !== filters.status) return false;
      if (filters.type !== "all" && a.type !== filters.type) return false;
      if (q) {
        const hay = [a.title, a.content].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [announcements, filters]);

  const stats = {
    total: announcements.length,
    drafts: announcements.filter((a) => a.status === "DRAFT").length,
    published: announcements.filter((a) => a.status === "PUBLISHED").length,
    archived: announcements.filter((a) => a.status === "ARCHIVED").length,
  };

  const closeModal = () => setModal({ open: false, type: null, id: null });

  const handlePublish = async (id) => {
    setActingOn(id);
    try {
      await apiPatch(`/admin/announcements/${id}/publish`);
      load();
    } catch (err) {
      alert(err.message || "Could not publish.");
    } finally {
      setActingOn(null);
    }
  };

  const handleArchive = async (id) => {
    setActingOn(id);
    try {
      await apiPatch(`/admin/announcements/${id}/archive`);
      load();
    } catch (err) {
      alert(err.message || "Could not archive.");
    } finally {
      setActingOn(null);
    }
  };

  const confirmDelete = async () => {
    setActingOn(modal.id);
    try {
      await apiDelete(`/admin/announcements/${modal.id}`);
      closeModal();
      load();
    } catch (err) {
      alert(err.message || "Could not delete.");
      closeModal();
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
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                    Manage Announcements
                  </h1>
                  <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                    Create, publish and archive official notes broadcast to
                    employees.
                  </p>
                </div>

                <Link
                  to="/dashboard/communicator/announcements/create"
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold inline-block"
                >
                  + New announcement
                </Link>
              </div>

              {pageError && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {pageError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total" value={stats.total} />
                <StatCard title="Published" value={stats.published} />
                <StatCard title="Drafts" value={stats.drafts} />
                <StatCard title="Archived" value={stats.archived} />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, search: e.target.value }))
                    }
                    placeholder="Search title, content..."
                    className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, type: e.target.value }))
                    }
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option value="all">All types</option>
                    {Object.keys(TYPE_STYLES).map((t) => (
                      <option key={t} value={t}>
                        {t}
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
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>

                  <button
                    onClick={() =>
                      setFilters({ search: "", status: "all", type: "all" })
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
                          Title
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Type
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Audience
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Published
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
                            Loading announcements...
                          </td>
                        </tr>
                      )}

                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            No announcements yet.
                          </td>
                        </tr>
                      )}

                      {filtered.map((a) => (
                        <tr key={a.id} className="border-t border-[#E5E2DC] align-top">
                          <td className="px-5 py-5">
                            <p className="font-semibold text-[#2F343B] text-sm">
                              {a.title}
                            </p>
                            <p className="text-xs text-[#7A8088] mt-1 line-clamp-2 max-w-[400px]">
                              {a.content}
                            </p>
                          </td>
                          <td className="px-5 py-5">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                TYPE_STYLES[a.type] || ""
                              }`}
                            >
                              {a.type}
                            </span>
                          </td>
                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {a.audience}
                          </td>
                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {formatDate(a.published_at)}
                          </td>
                          <td className="px-5 py-5">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                STATUS_STYLES[a.status] || ""
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="px-5 py-5">
                            <div className="flex flex-wrap gap-2">
                              {a.status === "DRAFT" && (
                                <button
                                  onClick={() => handlePublish(a.id)}
                                  disabled={actingOn === a.id}
                                  className="px-3 py-1.5 rounded-lg bg-[#2D7A4A] text-white text-sm font-medium disabled:opacity-60"
                                >
                                  Publish
                                </button>
                              )}
                              {a.status === "PUBLISHED" && (
                                <button
                                  onClick={() => handleArchive(a.id)}
                                  disabled={actingOn === a.id}
                                  className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white"
                                >
                                  Archive
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  setModal({
                                    open: true,
                                    type: "delete",
                                    id: a.id,
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg border border-red-200 text-sm bg-white text-red-600"
                              >
                                Delete
                              </button>
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

      {modal.open && modal.type === "delete" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              Delete announcement
            </h2>
            <p className="text-sm text-[#7A8088] mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={actingOn === modal.id}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={actingOn === modal.id}
                className="px-4 py-2 rounded-[12px] bg-[#A93B3B] text-white text-sm font-medium disabled:opacity-60"
              >
                Confirm delete
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
