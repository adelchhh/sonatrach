import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet } from "../../api";
import { useT } from "../../i18n/LanguageContext";

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DrawHistory() {
  const t = useT();
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [modal, setModal] = useState({ open: false, drawId: null });
  const [details, setDetails] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/draws/history")
      .then((res) => setDraws(res.data || []))
      .catch((err) =>
        setPageError(err.message || t("common.serverError"))
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openDetails = async (drawId) => {
    setModal({ open: true, drawId });
    setDetails(null);
    try {
      const res = await apiGet(`/draws/${drawId}`);
      setDetails(res.data);
    } catch (err) {
      setDetails({ error: err.message || t("common.serverError") });
    }
  };

  const closeModal = () => {
    setModal({ open: false, drawId: null });
    setDetails(null);
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
                  {t("admin.drawHistory.title")}
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  {t("admin.drawHistory.subtitle")}
                </p>
              </div>

              {pageError && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {pageError}
                </div>
              )}

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.drawHistory.col.executedAt")}</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.drawHistory.col.activity")}</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.drawHistory.col.session")}</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.drawHistory.col.mode")}</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.drawHistory.col.admin")}</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.drawHistory.col.results")}</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">{t("admin.drawHistory.col.action")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading && (
                        <tr>
                          <td colSpan="7" className="px-5 py-10 text-center text-sm text-[#7A8088]">
                            {t("admin.drawHistory.loading")}
                          </td>
                        </tr>
                      )}

                      {!loading && draws.length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-5 py-10 text-center text-sm text-[#7A8088]">
                            {t("admin.drawHistory.empty")}
                          </td>
                        </tr>
                      )}

                      {draws.map((d) => (
                        <tr key={d.draw_id} className="border-t border-[#E5E2DC] hover:bg-[#FCFBF9]">
                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {formatDateTime(d.executed_at)}
                          </td>
                          <td className="px-5 py-5 text-sm font-semibold text-[#2F343B]">
                            {d.activity_title}
                            <p className="text-xs text-[#7A8088] mt-1">
                              {d.activity_category}
                            </p>
                          </td>
                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            #{d.session_id}
                            <p className="text-xs mt-1">{d.draw_location || "—"}</p>
                          </td>
                          <td className="px-5 py-5 text-sm text-[#2F343B]">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#F1F0EC]">
                              {d.mode}
                            </span>
                          </td>
                          <td className="px-5 py-5 text-sm text-[#2F343B]">
                            {d.admin_first_name} {d.admin_last_name}
                          </td>
                          <td className="px-5 py-5 text-sm text-[#2F343B]">
                            <span className="text-green-700 font-semibold">
                              {d.selected_count} {t("admin.drawHistory.suffix.selected")}
                            </span>{" "}
                            ·{" "}
                            <span className="text-orange-600 font-medium">
                              {d.substitute_count} {t("admin.drawHistory.suffix.sub")}
                            </span>{" "}
                            ·{" "}
                            <span className="text-[#7A8088]">
                              {d.waiting_count} {t("admin.drawHistory.suffix.wait")}
                            </span>
                          </td>
                          <td className="px-5 py-5">
                            <button
                              onClick={() => openDetails(d.draw_id)}
                              className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-sm text-[#2F343B]"
                            >
                              {t("common.view")}
                            </button>
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
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-[20px] p-6 w-full max-w-[720px] shadow-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#2F343B] mb-4">
              {t("admin.drawHistory.modalTitle", { id: modal.drawId })}
            </h2>

            {!details && (
              <p className="text-sm text-[#7A8088]">{t("admin.drawHistory.loadingDetails")}</p>
            )}

            {details?.error && (
              <p className="text-sm text-red-600">{details.error}</p>
            )}

            {details?.results && (
              <div className="space-y-4">
                <ResultsBlock
                  title={t("admin.drawHistory.sectionSelected")}
                  items={details.results.filter(
                    (r) => r.is_selected === 1 || r.is_selected === true
                  )}
                  showSite
                  emptyLabel={t("common.none")}
                />
                <ResultsBlock
                  title={t("admin.drawHistory.sectionSubstitutes")}
                  items={details.results.filter(
                    (r) =>
                      (r.is_substitute === 1 || r.is_substitute === true) &&
                      !(r.is_selected === 1 || r.is_selected === true)
                  )}
                  showRank
                  emptyLabel={t("common.none")}
                  rankLabel={t("admin.runDraw.resultsCol.rank")}
                />
                <ResultsBlock
                  title={t("admin.drawHistory.sectionWaiting")}
                  items={details.results.filter(
                    (r) =>
                      (r.is_selected === 0 || r.is_selected === false) &&
                      (r.is_substitute === 0 || r.is_substitute === false)
                  )}
                  emptyLabel={t("common.none")}
                />
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ResultsBlock({ title, items, showSite, showRank, emptyLabel = "None.", rankLabel = "Rank" }) {
  return (
    <div>
      <p className="text-xs uppercase font-semibold text-[#7A8088] mb-2">
        {title} ({items.length})
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-[#7A8088]">{emptyLabel}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((r) => (
            <li
              key={r.id}
              className="text-sm text-[#2F343B] px-3 py-2 rounded-lg bg-[#F9F8F6] flex justify-between"
            >
              <span>
                {r.user_first_name} {r.user_last_name} ({r.employee_number})
              </span>
              {showSite && r.site_name && (
                <span className="text-[#7A8088]">{r.site_name}</span>
              )}
              {showRank && r.substitute_rank && (
                <span className="text-[#7A8088]">{rankLabel} #{r.substitute_rank}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
