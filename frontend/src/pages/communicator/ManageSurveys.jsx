import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiDelete, apiPut } from "../../api";

const STATUS_STYLES = {
  DRAFT: "bg-[#FFF4D6] text-[#B98900]",
  PUBLISHED: "bg-[#D4F4DD] text-[#2D7A4A]",
  ARCHIVED: "bg-[#F1F0EC] text-[#7A8088]",
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

export default function ManageSurveys() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actingOn, setActingOn] = useState(null);
  const [modal, setModal] = useState({ open: false, id: null });

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/admin/surveys")
      .then((res) => setSurveys(res.data || []))
      .catch((err) => setPageError(err.message || "Could not load surveys."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const stats = {
    total: surveys.length,
    drafts: surveys.filter((s) => s.status === "DRAFT").length,
    published: surveys.filter((s) => s.status === "PUBLISHED").length,
    responses: surveys.reduce((sum, s) => sum + Number(s.responses_count || 0), 0),
  };

  const togglePublish = async (s) => {
    setActingOn(s.id);
    try {
      await apiPut(`/admin/surveys/${s.id}`, {
        status: s.status === "PUBLISHED" ? "ARCHIVED" : "PUBLISHED",
      });
      load();
    } catch (err) {
      alert(err.message || "Could not update.");
    } finally {
      setActingOn(null);
    }
  };

  const confirmDelete = async () => {
    setActingOn(modal.id);
    try {
      await apiDelete(`/admin/surveys/${modal.id}`);
      setModal({ open: false, id: null });
      load();
    } catch (err) {
      alert(err.message || "Could not delete.");
      setModal({ open: false, id: null });
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
                    Manage Surveys
                  </h1>
                  <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                    Create and publish surveys, monitor responses, and archive
                    when complete.
                  </p>
                </div>

                <Link
                  to="/dashboard/communicator/surveys/create"
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold inline-block"
                >
                  + New survey
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
                <StatCard title="Responses" value={stats.responses} />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Title / Question
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Activity
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Open period
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Responses
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
                            Loading...
                          </td>
                        </tr>
                      )}

                      {!loading && surveys.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            No surveys yet.
                          </td>
                        </tr>
                      )}

                      {surveys.map((s) => (
                        <tr key={s.id} className="border-t border-[#E5E2DC]">
                          <td className="px-5 py-5">
                            <p className="font-semibold text-[#2F343B] text-sm">
                              {s.title || "Untitled"}
                            </p>
                            <p className="text-xs text-[#7A8088] mt-1 line-clamp-2 max-w-[400px]">
                              {s.question}
                            </p>
                          </td>
                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {s.activity_title || "—"}
                          </td>
                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {formatDate(s.start_date)} → {formatDate(s.end_date)}
                          </td>
                          <td className="px-5 py-5 text-sm font-semibold text-[#2F343B]">
                            {s.responses_count}
                          </td>
                          <td className="px-5 py-5">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                STATUS_STYLES[s.status] || ""
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="px-5 py-5">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => togglePublish(s)}
                                disabled={actingOn === s.id}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-60 ${
                                  s.status === "PUBLISHED"
                                    ? "border border-[#E5E2DC] bg-white text-[#2F343B]"
                                    : "bg-[#2D7A4A] text-white"
                                }`}
                              >
                                {s.status === "PUBLISHED" ? "Archive" : "Publish"}
                              </button>
                              <button
                                onClick={() => setModal({ open: true, id: s.id })}
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

      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setModal({ open: false, id: null })}
        >
          <div
            className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">Delete survey</h2>
            <p className="text-sm text-[#7A8088] mb-6">
              This will also delete all responses. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal({ open: false, id: null })}
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
