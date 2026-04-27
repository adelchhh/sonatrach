import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, getCurrentUserId, API_BASE_URL } from "../../api";

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

export default function ParticipationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const userId = getCurrentUserId();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setPageError("Please log in.");
      return;
    }
    apiGet(`/me/participations?user_id=${userId}`)
      .then((res) => setHistory(res.data || []))
      .catch((err) => setPageError(err.message || "Could not load history."))
      .finally(() => setLoading(false));
  }, [userId]);

  const stats = useMemo(() => {
    const total = history.length;
    const ratings = history.filter((p) => p.rating != null).map((p) => Number(p.rating));
    const avgRating = ratings.length
      ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)
      : "—";
    const certs = history.filter((p) => p.certificate_path).length;
    return { total, avgRating, certs };
  }, [history]);

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                Participation History
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                All activities you've participated in, your ratings, and your
                certificates.
              </p>
            </div>

            {pageError && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {pageError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Activities attended" value={stats.total} />
              <StatCard title="Average rating" value={stats.avgRating} />
              <StatCard title="Certificates earned" value={stats.certs} />
            </div>

            <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px]">
                  <thead className="bg-[#FBFAF8]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Activity
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Period
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Site
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        My rating
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Certificate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-5 py-10 text-center text-sm text-[#7A8088]"
                        >
                          Loading...
                        </td>
                      </tr>
                    )}

                    {!loading && history.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-5 py-10 text-center text-sm text-[#7A8088]"
                        >
                          No past participation yet.
                        </td>
                      </tr>
                    )}

                    {history.map((p) => (
                      <tr key={p.id} className="border-t border-[#E5E2DC]">
                        <td className="px-5 py-4 text-sm font-semibold text-[#2F343B]">
                          {p.activity_title}
                          <p className="text-xs text-[#7A8088] mt-1">
                            {p.activity_category}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#7A8088]">
                          {formatDate(p.start_date)} → {formatDate(p.end_date)}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#2F343B]">
                          {p.site_name}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#2F343B]">
                          {p.rating != null ? (
                            <span className="text-[#ED8D31] font-semibold">
                              {"★".repeat(p.rating)}
                              {"☆".repeat(5 - p.rating)}
                            </span>
                          ) : (
                            <span className="text-[#7A8088] italic">
                              Not rated
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {p.certificate_path ? (
                            <a
                              href={`${API_BASE_URL}/storage/${p.certificate_path}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-xs font-medium"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="text-[#7A8088] italic">
                              Not yet
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
