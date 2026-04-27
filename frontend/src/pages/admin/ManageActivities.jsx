import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { API_BASE_URL, apiGet, apiPatch, apiDelete } from "../../api";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop";

const STATUS_BADGE = {
  PUBLISHED: "bg-[#D4F4DD] text-[#2D7A4A]",
  DRAFT: "bg-[#FFF4D6] text-[#B98900]",
  ARCHIVED: "bg-[#F1F0EC] text-[#7A8088]",
  CANCELLED: "bg-[#FBE4E4] text-[#A23B3B]",
};

function imageOf(activity) {
  if (!activity.image_url) return DEFAULT_IMAGE;
  if (activity.image_url.startsWith("http")) return activity.image_url;
  return `${API_BASE_URL}${activity.image_url}`;
}

export default function ManageActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modal, setModal] = useState({ open: false, type: null, activity: null });
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet("/activities?include_all=1");
      setActivities(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load activities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (categoryFilter !== "ALL" && a.category !== categoryFilter) return false;
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activities, search, categoryFilter, statusFilter]);

  const active = filtered.filter((a) => a.status === "PUBLISHED");
  const inactive = filtered.filter((a) => a.status !== "PUBLISHED");

  const stats = useMemo(() => {
    const total = activities.length;
    const published = activities.filter((a) => a.status === "PUBLISHED").length;
    const drafts = activities.filter((a) => a.status === "DRAFT").length;
    const archived = activities.filter((a) => a.status === "ARCHIVED").length;
    const cancelled = activities.filter((a) => a.status === "CANCELLED").length;
    return { total, published, drafts, archived, cancelled };
  }, [activities]);

  const categories = useMemo(() => {
    const set = new Set(activities.map((a) => a.category));
    return ["ALL", ...Array.from(set)];
  }, [activities]);

  const handleConfirm = async () => {
    if (!modal.activity) return;
    setActionLoading(true);
    try {
      if (modal.type === "archive") {
        await apiPatch(`/activities/${modal.activity.id}/status`, { status: "ARCHIVED" });
      } else if (modal.type === "activate") {
        await apiPatch(`/activities/${modal.activity.id}/status`, { status: "PUBLISHED" });
      } else if (modal.type === "deactivate") {
        await apiPatch(`/activities/${modal.activity.id}/status`, { status: "DRAFT" });
      } else if (modal.type === "delete") {
        await apiDelete(`/activities/${modal.activity.id}`);
      }
      await load();
      closeModal();
    } catch (err) {
      alert(err.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () =>
    setModal({ open: false, type: null, activity: null });

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
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
                    Manage Activities
                  </h1>
                  <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                    Keep track of active and inactive activities, search quickly,
                    and manage each activity with direct admin actions.
                  </p>
                </div>

                <Link
                  to="/dashboard/admin/activities/create"
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors inline-block"
                >
                  + Create New Activity
                </Link>
              </div>

              {error && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  title="Total Activities"
                  value={stats.total}
                  subtitle="Across all categories and statuses"
                />
                <StatCard
                  title="Published"
                  value={stats.published}
                  subtitle="Visible in the public catalog"
                />
                <StatCard
                  title="Drafts"
                  value={stats.drafts}
                  subtitle="Not yet published"
                />
                <StatCard
                  title="Archived / Cancelled"
                  value={stats.archived + stats.cancelled}
                  subtitle="Closed or cancelled"
                />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  Activities Directory
                </h2>
                <p className="text-sm text-[#7A8088] mt-1 mb-4">
                  Search by activity name and narrow results by category or status.
                </p>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c === "ALL" ? "All Categories" : c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  <button
                    onClick={resetFilters}
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B]"
                  >
                    Reset filters
                  </button>
                </div>
              </section>

              {loading ? (
                <div className="text-center py-10 text-[#7A8088]">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
                  <div className="space-y-6">
                    <ActivityTable
                      title="Active Activities"
                      subtitle="Activities currently published and visible in the catalog."
                      badge={`${active.length} Active`}
                      badgeClass="bg-[#D4F4DD] text-[#2D7A4A]"
                      items={active}
                      onArchive={(a) => setModal({ open: true, type: "archive", activity: a })}
                      onDeactivate={(a) => setModal({ open: true, type: "deactivate", activity: a })}
                      onDelete={(a) => setModal({ open: true, type: "delete", activity: a })}
                      showActivate={false}
                    />

                    <ActivityTable
                      title="Inactive Activities"
                      subtitle="Drafts, archived and cancelled activities."
                      badge={`${inactive.length} Inactive`}
                      badgeClass="bg-[#F1F0EC] text-[#7A8088]"
                      items={inactive}
                      onArchive={(a) => setModal({ open: true, type: "archive", activity: a })}
                      onActivate={(a) => setModal({ open: true, type: "activate", activity: a })}
                      onDelete={(a) => setModal({ open: true, type: "delete", activity: a })}
                      showActivate
                    />
                  </div>

                  <div className="space-y-5">
                    <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                      <h3 className="text-[24px] font-bold text-[#2F343B]">
                        Activity summary
                      </h3>
                      <p className="text-sm text-[#7A8088] mt-1 mb-4">
                        Overview of all activity statuses.
                      </p>

                      <div className="space-y-3">
                        <SummaryRow label="Total Activities" value={stats.total} />
                        <SummaryRow label="Published" value={stats.published} />
                        <SummaryRow label="Drafts" value={stats.drafts} />
                        <SummaryRow label="Archived" value={stats.archived} />
                        <SummaryRow label="Cancelled" value={stats.cancelled} />
                      </div>
                    </section>

                    <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                      <h3 className="text-[24px] font-bold text-[#2F343B]">
                        Admin actions
                      </h3>
                      <p className="text-sm text-[#7A8088] mt-1 mb-4">
                        Quick shortcuts for activity management.
                      </p>

                      <div className="space-y-3">
                        <ActionCard
                          title="Create new activity"
                          desc="Set up a new activity, define rules, and upload assets."
                          button="Create"
                          to="/dashboard/admin/activities/create"
                        />
                        <ActionCard
                          title="Launch a draw"
                          desc="Run the random selection algorithm for ready sessions."
                          button="Launch"
                          to="/dashboard/admin/draw"
                        />
                        <ActionCard
                          title="Export reports"
                          desc="Download activity participation data and history."
                          button="Export"
                          to="/dashboard/admin/reports"
                        />
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg">
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              {modal.type === "archive" && "Archive Activity"}
              {modal.type === "activate" && "Publish Activity"}
              {modal.type === "deactivate" && "Move to Draft"}
              {modal.type === "delete" && "Delete Activity"}
            </h2>

            <p className="text-sm text-[#7A8088] mb-6">
              {modal.type === "archive" && "This will archive the activity and remove it from the public catalog."}
              {modal.type === "activate" && "This will publish the activity so it appears in the public catalog."}
              {modal.type === "deactivate" && "This will move the activity back to draft and remove it from the public catalog."}
              {modal.type === "delete" && "This will permanently delete the activity. This action cannot be undone."}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-medium disabled:opacity-60"
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ActivityTable({
  title,
  subtitle,
  badge,
  badgeClass,
  items,
  onArchive,
  onActivate,
  onDeactivate,
  onDelete,
  showActivate,
}) {
  return (
    <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
        <div>
          <h3 className="text-[24px] font-bold text-[#2F343B]">{title}</h3>
          <p className="text-sm text-[#7A8088] mt-1">{subtitle}</p>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
          {badge}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead className="bg-[#FBFAF8]">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">Activity</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">Category</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">Status</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">Created</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-[#7A8088]">
                  No activities found.
                </td>
              </tr>
            )}

            {items.map((activity) => (
              <tr key={activity.id} className="border-t border-[#E5E2DC] align-top">
                <td className="px-5 py-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={imageOf(activity)}
                      alt={activity.title}
                      className="w-12 h-12 rounded-[10px] object-cover"
                    />
                    <div>
                      <p className="font-semibold text-[#2F343B] text-sm">
                        {activity.title}
                      </p>
                      <p className="text-xs text-[#7A8088] line-clamp-1 max-w-[280px]">
                        {activity.description || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-5 text-sm text-[#7A8088]">{activity.category}</td>

                <td className="px-5 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      STATUS_BADGE[activity.status] || "bg-[#F1F0EC] text-[#7A8088]"
                    }`}
                  >
                    {activity.status}
                  </span>
                </td>

                <td className="px-5 py-5 text-sm text-[#7A8088]">
                  {activity.created_at
                    ? new Date(activity.created_at).toLocaleDateString()
                    : "—"}
                </td>

                <td className="px-5 py-5">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/dashboard/admin/activities/${activity.id}/edit`}
                      className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white inline-block"
                    >
                      Modify
                    </Link>

                    {showActivate ? (
                      <button
                        onClick={() => onActivate?.(activity)}
                        className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => onDeactivate?.(activity)}
                        className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white"
                      >
                        Unpublish
                      </button>
                    )}

                    <button
                      onClick={() => onArchive?.(activity)}
                      className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white"
                    >
                      Archive
                    </button>

                    <button
                      onClick={() => onDelete?.(activity)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-sm bg-white text-red-600"
                    >
                      Delete
                    </button>

                    <Link
                      to={`/dashboard/admin/activities/${activity.id}/sessions`}
                      className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white inline-block"
                    >
                      Sessions
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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

function ActionCard({ title, desc, button, to }) {
  return (
    <div className="rounded-[18px] border border-[#E5E2DC] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-[#2F343B]">{title}</h4>
          <p className="text-xs text-[#7A8088] mt-1 leading-[160%]">{desc}</p>
        </div>

        {to ? (
          <Link
            to={to}
            className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-xs font-semibold whitespace-nowrap inline-block"
          >
            {button}
          </Link>
        ) : (
          <button className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-xs font-semibold whitespace-nowrap">
            {button}
          </button>
        )}
      </div>
    </div>
  );
}
