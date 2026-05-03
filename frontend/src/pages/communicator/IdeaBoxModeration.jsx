import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPatch, getCurrentUserId } from "../../api";

const STATUS_STYLES = {
  UNDER_REVIEW: "bg-[#FFF4D6] text-[#B98900]",
  ACCEPTED: "bg-[#D4F4DD] text-[#2D7A4A]",
  ARCHIVED: "bg-[#F1F0EC] text-[#7A8088]",
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

export default function IdeaBoxModeration() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actingOn, setActingOn] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "all", category: "all" });
  const [modal, setModal] = useState({ open: false, type: null, idea: null });
  const [response, setResponse] = useState("");

  const moderatorId = getCurrentUserId();

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/ideas")
      .then((res) => setIdeas(res.data || []))
      .catch((err) => setPageError(err.message || "Could not load ideas."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return ideas.filter((i) => {
      if (filters.status !== "all" && i.status !== filters.status) return false;
      if (filters.category !== "all" && i.category !== filters.category) return false;
      if (q) {
        const hay = [
          i.content,
          i.author_first_name,
          i.author_last_name,
          i.employee_number,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [ideas, filters]);

  const stats = {
    total: ideas.length,
    review: ideas.filter((i) => i.status === "UNDER_REVIEW").length,
    accepted: ideas.filter((i) => i.status === "ACCEPTED").length,
    archived: ideas.filter((i) => i.status === "ARCHIVED").length,
  };

  const closeModal = () => {
    setModal({ open: false, type: null, idea: null });
    setResponse("");
  };

  const handleModerate = async () => {
    if (!moderatorId) {
      alert("You must be logged in to moderate.");
      return;
    }
    setActingOn(modal.idea.id);
    try {
      await apiPatch(`/ideas/${modal.idea.id}/moderate`, {
        status: modal.type === "accept" ? "ACCEPTED" : "ARCHIVED",
        moderator_response: response.trim() || null,
        moderated_by: moderatorId,
      });
      closeModal();
      load();
    } catch (err) {
      alert(err.message || "Could not moderate.");
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
                  Idea moderation
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Review ideas submitted by employees, accept good ones with a
                  response, or archive duplicates and out-of-scope suggestions.
                </p>
              </div>

              {pageError && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {pageError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total" value={stats.total} />
                <StatCard title="Under review" value={stats.review} />
                <StatCard title="Accepted" value={stats.accepted} />
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
                    placeholder="Search content, author..."
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
                    <option value="UNDER_REVIEW">Under review</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>

                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, category: e.target.value }))
                    }
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  >
                    <option value="all">All categories</option>
                    <option value="ACTIVITIES">Activities</option>
                    <option value="SERVICES">Services</option>
                    <option value="COMMUNICATION">Communication</option>
                    <option value="WORKPLACE">Workplace</option>
                    <option value="WELLBEING">Wellbeing</option>
                  </select>

                  <button
                    onClick={() =>
                      setFilters({ search: "", status: "all", category: "all" })
                    }
                    className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B]"
                  >
                    Reset
                  </button>
                </div>
              </section>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                {loading && (
                  <p className="px-5 py-10 text-center text-sm text-[#7A8088]">
                    Loading ideas...
                  </p>
                )}

                {!loading && filtered.length === 0 && (
                  <p className="px-5 py-10 text-center text-sm text-[#7A8088]">
                    No ideas match the filters.
                  </p>
                )}

                <div className="divide-y divide-[#E5E2DC]">
                  {filtered.map((i) => (
                    <div key={i.id} className="px-5 py-5">
                      <div className="flex justify-between items-start gap-3 mb-3 flex-wrap">
                        <div>
                          <p className="font-semibold text-[#2F343B] text-sm">
                            {i.author_first_name} {i.author_last_name}
                          </p>
                          <p className="text-xs text-[#7A8088] mt-1">
                            Matricule {i.employee_number} · Submitted{" "}
                            {formatDate(i.submitted_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F1F0EC] text-[#7A8088]">
                            {i.category}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              STATUS_STYLES[i.status] || ""
                            }`}
                          >
                            {i.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-[#2F343B] leading-[170%]">
                        {i.content}
                      </p>

                      {i.moderator_response && (
                        <div className="mt-3 rounded-[12px] bg-[#F9F8F6] px-3 py-2 text-sm">
                          <p className="text-xs text-[#7A8088] uppercase font-semibold mb-1">
                            Moderator response{" "}
                            {i.moderator_first_name &&
                              `· ${i.moderator_first_name} ${i.moderator_last_name}`}
                          </p>
                          <p className="text-[#2F343B]">
                            {i.moderator_response}
                          </p>
                        </div>
                      )}

                      {i.status === "UNDER_REVIEW" && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => {
                              setResponse("");
                              setModal({ open: true, type: "accept", idea: i });
                            }}
                            disabled={actingOn === i.id}
                            className="px-3 py-1.5 rounded-lg bg-[#2D7A4A] text-white text-sm font-medium disabled:opacity-60"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              setResponse("");
                              setModal({ open: true, type: "archive", idea: i });
                            }}
                            disabled={actingOn === i.id}
                            className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#7A8088] text-sm font-medium disabled:opacity-60"
                          >
                            Archive
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-[20px] p-6 w-full max-w-[460px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              {modal.type === "accept" ? "Accept idea" : "Archive idea"}
            </h2>

            <p className="text-sm text-[#7A8088] mb-3 line-clamp-3">
              {modal.idea?.content}
            </p>

            <p className="text-xs font-semibold text-[#2F343B] mb-2">
              Response to the employee (optional)
            </p>

            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={3}
              placeholder="Thanks for your suggestion..."
              className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={closeModal}
                disabled={actingOn === modal.idea?.id}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleModerate}
                disabled={actingOn === modal.idea?.id}
                className={`px-4 py-2 rounded-[12px] text-white text-sm font-medium disabled:opacity-60 ${
                  modal.type === "accept" ? "bg-[#2D7A4A]" : "bg-[#7A8088]"
                }`}
              >
                {actingOn === modal.idea?.id
                  ? "Submitting..."
                  : `Confirm ${modal.type}`}
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
