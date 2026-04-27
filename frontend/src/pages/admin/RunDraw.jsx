import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPost } from "../../api";

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

export default function RunDraw() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [drawDetails, setDrawDetails] = useState(null);

  const adminId = getCurrentUserId();

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet(`/sessions/${sessionId}/draw-preview`)
      .then((res) => setPreview(res.data))
      .catch((err) =>
        setPageError(err.message || "Could not load draw preview.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [sessionId]);

  const handleLaunch = async () => {
    if (!adminId) {
      alert("You must be logged in to run a draw.");
      return;
    }

    if (
      !window.confirm(
        "Launch the draw now? This action cannot be undone for this session."
      )
    ) {
      return;
    }

    setRunning(true);
    try {
      const res = await apiPost(`/sessions/${sessionId}/execute-draw`, {
        admin_id: adminId,
        mode: "BY_SITE",
        draw_location: preview?.session?.draw_location || null,
      });
      setResults(res.data);
      // Load full draw details
      const detailsRes = await apiGet(`/draws/${res.data.draw_id}`);
      setDrawDetails(detailsRes.data);
    } catch (err) {
      alert(err.message || "Could not run the draw.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-[1100px]">
            <div className="text-sm text-[#7A8088]">
              <Link
                to="/dashboard/admin/draw"
                className="text-[#ED8D31] font-medium"
              >
                Launch Draw
              </Link>
              <span className="mx-2">›</span>
              <span className="text-[#2F343B] font-medium">
                Session #{sessionId}
              </span>
            </div>

            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                Execute Draw
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                Review eligible candidates and site capacities, then launch the
                random selection algorithm.
              </p>
            </div>

            {pageError && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {pageError}
              </div>
            )}

            {loading && (
              <div className="rounded-[14px] border border-[#E5E2DC] bg-white p-8 text-center text-sm text-[#7A8088]">
                Loading draw preview...
              </div>
            )}

            {!loading && preview && (
              <>
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-6">
                  <h2 className="text-[22px] font-bold text-[#2F343B] mb-4">
                    {preview.session.activity_title}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Info
                      label="Session dates"
                      value={`${formatDate(preview.session.start_date)} → ${formatDate(preview.session.end_date)}`}
                    />
                    <Info
                      label="Eligible candidates"
                      value={preview.eligible_count}
                    />
                    <Info
                      label="Substitutes count"
                      value={preview.session.substitutes_count}
                    />
                    <Info
                      label="Draw location"
                      value={preview.session.draw_location || "—"}
                    />
                    <Info
                      label="Draw date"
                      value={formatDate(preview.session.draw_date)}
                    />
                    <Info
                      label="Status"
                      value={preview.session.status}
                    />
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h3 className="text-[20px] font-bold text-[#2F343B]">
                      Site capacities
                    </h3>
                  </div>

                  <table className="w-full">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Site
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Quota
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Interested
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.sites.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-5 py-8 text-center text-sm text-[#7A8088]"
                          >
                            No sites configured.
                          </td>
                        </tr>
                      ) : (
                        preview.sites.map((s) => (
                          <tr key={s.id} className="border-t border-[#E5E2DC]">
                            <td className="px-5 py-3 text-sm font-semibold text-[#2F343B]">
                              {s.name}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#2F343B]">
                              {s.quota}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#7A8088]">
                              {s.interested_count}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </section>

                {preview.existing_draw && preview.existing_draw.executed && !results && (
                  <div className="rounded-[14px] border border-yellow-200 bg-yellow-50 text-yellow-800 px-4 py-3 text-sm">
                    A draw has already been executed for this session on{" "}
                    {formatDate(preview.existing_draw.executed_at)}. Re-execution
                    is blocked. Visit{" "}
                    <Link
                      to="/dashboard/admin/draw-history"
                      className="font-semibold underline"
                    >
                      Draw History
                    </Link>{" "}
                    to see results.
                  </div>
                )}

                {!preview.existing_draw?.executed && !results && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleLaunch}
                      disabled={running || preview.sites.length === 0 || preview.eligible_count === 0}
                      className="px-6 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors disabled:opacity-60"
                    >
                      {running ? "Running draw..." : "🎲 Launch draw"}
                    </button>
                  </div>
                )}
              </>
            )}

            {results && drawDetails && (
              <>
                <section className="rounded-[24px] bg-[#D4F4DD] border border-[#9FD9B5] p-6">
                  <h2 className="text-[22px] font-bold text-[#2D7A4A] mb-3">
                    ✅ Draw completed
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <ResultStat label="Selected" value={results.selected_count} />
                    <ResultStat
                      label="Substitutes"
                      value={results.substitute_count}
                    />
                    <ResultStat
                      label="Waiting list"
                      value={results.waiting_count}
                    />
                  </div>
                </section>

                <ResultsList title="Selected" filter="selected" items={drawDetails.results} />
                <ResultsList
                  title="Substitutes"
                  filter="substitute"
                  items={drawDetails.results}
                />
                <ResultsList
                  title="Waiting list"
                  filter="waiting"
                  items={drawDetails.results}
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => navigate("/dashboard/admin/draw-history")}
                    className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                  >
                    See all draws
                  </button>
                  <button
                    onClick={() => navigate("/dashboard/admin/registrations")}
                    className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold"
                  >
                    View registrations
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-[14px] bg-[#F7F7F5] px-4 py-3">
      <p className="text-xs text-[#7A8088] uppercase font-semibold">{label}</p>
      <p className="text-base text-[#2F343B] font-semibold mt-1">{value}</p>
    </div>
  );
}

function ResultStat({ label, value }) {
  return (
    <div className="bg-white rounded-[14px] px-4 py-3">
      <p className="text-xs text-[#7A8088] uppercase font-semibold">{label}</p>
      <p className="text-2xl font-extrabold text-[#2D7A4A] mt-1">{value}</p>
    </div>
  );
}

function ResultsList({ title, filter, items }) {
  const filtered = items.filter((r) => {
    if (filter === "selected") return r.is_selected === 1 || r.is_selected === true;
    if (filter === "substitute")
      return r.is_substitute === 1 || r.is_substitute === true;
    return (
      (r.is_selected === 0 || r.is_selected === false) &&
      (r.is_substitute === 0 || r.is_substitute === false)
    );
  });

  return (
    <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E2DC]">
        <h3 className="text-[20px] font-bold text-[#2F343B]">
          {title} ({filtered.length})
        </h3>
      </div>
      {filtered.length === 0 ? (
        <p className="px-5 py-6 text-sm text-[#7A8088]">None.</p>
      ) : (
        <table className="w-full">
          <thead className="bg-[#FBFAF8]">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">
                Employee
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">
                Matricule
              </th>
              {filter === "selected" && (
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">
                  Site
                </th>
              )}
              {filter === "substitute" && (
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#7A8088] uppercase">
                  Rank
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-[#E5E2DC]">
                <td className="px-5 py-3 text-sm font-semibold text-[#2F343B]">
                  {r.user_first_name} {r.user_last_name}
                </td>
                <td className="px-5 py-3 text-sm text-[#7A8088]">
                  {r.employee_number}
                </td>
                {filter === "selected" && (
                  <td className="px-5 py-3 text-sm text-[#2F343B]">
                    {r.site_name || "—"}
                  </td>
                )}
                {filter === "substitute" && (
                  <td className="px-5 py-3 text-sm text-[#2F343B]">
                    #{r.substitute_rank}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
