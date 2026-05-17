import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPost, apiDelete, apiPut } from "../../api";
import { useT } from "../../i18n/LanguageContext";

export default function SitesAndQuotas() {
  const t = useT();
  const { id, sessionId } = useParams();

  const [allocations, setAllocations] = useState([]);
  const [availableSites, setAvailableSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [formError, setFormError] = useState(null);

  const [form, setForm] = useState({ site_id: "", quota: "" });
  const [modal, setModal] = useState({ open: false, allocationId: null });

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet(`/sessions/${sessionId}/sites`)
      .then((res) => {
        setAllocations(res.data.allocations || []);
        setAvailableSites(res.data.available_sites || []);
      })
      .catch((err) =>
        setPageError(err.message || "Could not load allocations.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [sessionId]);

  const totalQuota = allocations.reduce(
    (sum, a) => sum + Number(a.quota || 0),
    0
  );
  const totalChoices = allocations.reduce(
    (sum, a) => sum + Number(a.choices_count || 0),
    0
  );
  const totalSelected = allocations.reduce(
    (sum, a) => sum + Number(a.selected_count || 0),
    0
  );
  const remainingPlaces = Math.max(totalQuota - totalSelected, 0);

  const handleAddSite = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.site_id || !form.quota) {
      setFormError("Please select a site and set a quota.");
      return;
    }

    setSubmitting(true);
    try {
      await apiPost(`/sessions/${sessionId}/sites`, {
        site_id: Number(form.site_id),
        quota: Number(form.quota),
      });
      setForm({ site_id: "", quota: "" });
      load();
    } catch (err) {
      setFormError(err.message || "Could not assign site.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuotaChange = async (allocation, newQuota) => {
    const value = Number(newQuota);
    if (!value || value < 1) return;
    try {
      await apiPut(`/session-sites/${allocation.id}`, { quota: value });
      load();
    } catch (err) {
      alert(err.message || "Could not update quota.");
    }
  };

  const handleDelete = async () => {
    try {
      await apiDelete(`/session-sites/${modal.allocationId}`);
      setModal({ open: false, allocationId: null });
      load();
    } catch (err) {
      alert(err.message || "Could not remove allocation.");
      setModal({ open: false, allocationId: null });
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="text-sm text-[#7A8088]">
              <Link
                to="/dashboard/admin/activities"
                className="text-[#ED8D31] font-medium"
              >
                {t("admin.activities.title")}
              </Link>
              <span className="mx-2">›</span>
              <Link
                to={`/dashboard/admin/activities/${id}/sessions`}
                className="text-[#ED8D31] font-medium"
              >
                {t("admin.createSession.backToSessions")}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-[#2F343B] font-medium">{t("admin.sessions.sitesQuotas")}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-[38px] font-extrabold text-[#2F343B] leading-[110%]">
                  {t("admin.sitesQuotas.title")}
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 leading-[170%]">
                  {t("admin.sitesQuotas.subtitle", { id: sessionId })}
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  to={`/dashboard/admin/activities/${id}/sessions`}
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  {t("admin.sitesQuotas.backToSessions")}
                </Link>
              </div>
            </div>

            {pageError && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {pageError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title={t("admin.sitesQuotas.statSites")}
                value={allocations.length}
                subtitle={t("admin.sitesQuotas.statForSession", { id: sessionId })}
              />
              <StatCard
                title={t("admin.sitesQuotas.statQuota")}
                value={totalQuota}
                subtitle={t("admin.sitesQuotas.statAllocated")}
              />
              <StatCard
                title={t("admin.sitesQuotas.statChoices")}
                value={totalChoices}
                subtitle={t("admin.sitesQuotas.statPickedByEmployees")}
              />
              <StatCard
                title={t("admin.sitesQuotas.statRemaining")}
                value={remainingPlaces}
                subtitle={t("admin.sitesQuotas.statAfterSelections")}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_340px] gap-6">
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DC]">
                  <h2 className="text-[28px] font-bold text-[#2F343B]">
                    {t("admin.sitesQuotas.assigned")}
                  </h2>
                  <p className="text-sm text-[#7A8088] mt-1">
                    {t("admin.sitesQuotas.assignedHint")}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          {t("admin.sitesQuotas.col.site")}
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          {t("admin.sitesQuotas.col.quota")}
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          {t("admin.sitesQuotas.col.choices")}
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          {t("admin.sitesQuotas.col.selected")}
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          {t("admin.sitesQuotas.col.action")}
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
                            {t("common.loading")}
                          </td>
                        </tr>
                      )}

                      {!loading && allocations.length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            {t("admin.sitesQuotas.emptyAllocations")}
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        allocations.map((alloc) => (
                          <tr
                            key={alloc.id}
                            className="border-t border-[#E5E2DC] align-top"
                          >
                            <td className="px-5 py-5">
                              <p className="font-semibold text-[#2F343B] text-sm">
                                {alloc.site_name}
                              </p>
                              <p className="text-xs text-[#7A8088] mt-1">
                                {alloc.site_address || "—"}
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <input
                                type="number"
                                min="1"
                                defaultValue={alloc.quota}
                                onBlur={(e) => {
                                  if (Number(e.target.value) !== Number(alloc.quota)) {
                                    handleQuotaChange(alloc, e.target.value);
                                  }
                                }}
                                className="w-24 px-3 py-2 rounded-lg border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                              />
                            </td>

                            <td className="px-5 py-5 text-sm font-semibold text-[#2F343B]">
                              {alloc.choices_count}
                            </td>

                            <td className="px-5 py-5 text-sm font-semibold text-[#2F343B]">
                              {alloc.selected_count} / {alloc.quota}
                            </td>

                            <td className="px-5 py-5">
                              <button
                                onClick={() =>
                                  setModal({
                                    open: true,
                                    allocationId: alloc.id,
                                  })
                                }
                                className="w-9 h-9 rounded-lg border border-[#F0B1B1] bg-white text-[#D85C5C]"
                                title="Remove allocation"
                              >
                                🗑
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="space-y-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[28px] font-bold text-[#2F343B]">
                    {t("admin.sitesQuotas.assignSite")}
                  </h3>
                  <p className="text-sm text-[#7A8088] mt-1 mb-5">
                    {t("admin.sitesQuotas.assignSiteHint")}
                  </p>

                  <form onSubmit={handleAddSite} className="space-y-4">
                    {formError && (
                      <div className="rounded-[12px] border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                        {formError}
                      </div>
                    )}

                    <Field label={t("admin.sitesQuotas.siteLabel")}>
                      <select
                        value={form.site_id}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            site_id: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        <option value="">
                          {availableSites.length === 0
                            ? t("admin.sitesQuotas.allAssigned")
                            : t("admin.sitesQuotas.selectSite")}
                        </option>
                        {availableSites.map((site) => (
                          <option key={site.id} value={site.id}>
                            {site.name}
                            {site.address ? ` — ${site.address}` : ""}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label={t("admin.sitesQuotas.quotaLabel")}>
                      <input
                        type="number"
                        min="1"
                        value={form.quota}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            quota: e.target.value,
                          }))
                        }
                        placeholder={t("admin.sitesQuotas.quotaPlaceholder")}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <button
                      type="submit"
                      disabled={submitting || availableSites.length === 0}
                      className="w-full px-4 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors disabled:opacity-50"
                    >
                      {submitting ? t("admin.sitesQuotas.adding") : t("admin.sitesQuotas.addToSession")}
                    </button>
                  </form>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-lg font-bold text-[#2F343B] mb-2">
                    💡 {t("admin.sitesQuotas.addNote")}
                  </h3>
                  <p className="text-sm text-[#7A8088] leading-[170%]">
                    {t("admin.sitesQuotas.addNoteHint")}
                  </p>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[400px] shadow-lg">
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              {t("admin.sitesQuotas.removeModal.title")}
            </h2>

            <p className="text-sm text-[#7A8088] mb-6">
              {t("admin.sitesQuotas.removeModal.text")}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal({ open: false, allocationId: null })}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
              >
                {t("common.cancel")}
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-medium"
              >
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
