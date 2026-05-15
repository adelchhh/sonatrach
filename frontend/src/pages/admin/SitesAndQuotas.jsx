import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPost, apiDelete, apiPut } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  DataPanel,
  Modal,
  Button,
  Alert,
  Select,
  TextField,
} from "../../components/ui/Studio";

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
        setPageError(err.message || "Impossible de charger les attributions.")
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
      setFormError("Sélectionnez un site et précisez un quota.");
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
      setFormError(err.message || "Attribution impossible.");
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
      alert(err.message || "Mise à jour du quota impossible.");
    }
  };

  const handleDelete = async () => {
    try {
      await apiDelete(`/session-sites/${modal.allocationId}`);
      setModal({ open: false, allocationId: null });
      load();
    } catch (err) {
      alert(err.message || "Suppression impossible.");
      setModal({ open: false, allocationId: null });
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.administration")}
        title={t("admin.sitesQuotas.title")}
        subtitle={t("admin.sitesQuotas.subtitle", { id: sessionId })}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Activités", to: "/dashboard/admin/activities" },
          {
            label: "Sessions",
            to: `/dashboard/admin/activities/${id}/sessions`,
          },
          { label: t("admin.sessions.sitesQuotas") },
        ]}
        actions={
          <Button
            to={`/dashboard/admin/activities/${id}/sessions`}
            variant="outline"
            size="md"
          >
            {t("admin.sitesQuotas.backToSessions")}
          </Button>
        }
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        <StatBar>
          <StatCell
            label={t("admin.sitesQuotas.statSites")}
            value={allocations.length}
            sub={t("admin.sitesQuotas.statForSession", { id: sessionId })}
          />
          <StatCell
            label={t("admin.sitesQuotas.statQuota")}
            value={totalQuota}
            sub={t("admin.sitesQuotas.statAllocated")}
            accent={totalQuota > 0}
          />
          <StatCell
            label={t("admin.sitesQuotas.statChoices")}
            value={totalChoices}
            sub={t("admin.sitesQuotas.statPickedByEmployees")}
          />
          <StatCell
            label={t("admin.sitesQuotas.statRemaining")}
            value={remainingPlaces}
            sub={t("admin.sitesQuotas.statAfterSelections")}
          />
        </StatBar>

        <div className="grid grid-cols-1 xl:grid-cols-[1.65fr_1fr] gap-6">
          <DataPanel
            title={t("admin.sitesQuotas.assigned")}
            subtitle={t("admin.sitesQuotas.assignedHint")}
            badge={`${allocations.length}`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead className="bg-[#0A0A0A]">
                  <tr>
                    {[
                      t("admin.sitesQuotas.col.site"),
                      t("admin.sitesQuotas.col.quota"),
                      t("admin.sitesQuotas.col.choices"),
                      t("admin.sitesQuotas.col.selected"),
                      t("admin.sitesQuotas.col.action"),
                    ].map((h, i) => (
                      <th
                        key={i}
                        className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                        {t("common.loading")}
                      </td>
                    </tr>
                  ) : allocations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                        {t("admin.sitesQuotas.emptyAllocations")}
                      </td>
                    </tr>
                  ) : (
                    allocations.map((alloc) => (
                      <tr
                        key={alloc.id}
                        className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                      >
                        <td className="px-6 py-5">
                          <p className="text-[#0A0A0A] text-[14px] font-bold">
                            {alloc.site_name}
                          </p>
                          <p className="text-[11px] text-[#737373] mt-1">
                            {alloc.site_address || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <input
                            type="number"
                            min="1"
                            defaultValue={alloc.quota}
                            onBlur={(e) => {
                              if (Number(e.target.value) !== Number(alloc.quota)) {
                                handleQuotaChange(alloc, e.target.value);
                              }
                            }}
                            className="w-24 px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] text-[14px] font-bold tabular-nums text-[#0A0A0A] outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors"
                          />
                        </td>
                        <td className="px-6 py-5 text-[14px] font-bold tabular-nums text-[#0A0A0A]">
                          {alloc.choices_count}
                        </td>
                        <td className="px-6 py-5 text-[14px] font-bold tabular-nums text-[#0A0A0A]">
                          {alloc.selected_count} / {alloc.quota}
                        </td>
                        <td className="px-6 py-5">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              setModal({ open: true, allocationId: alloc.id })
                            }
                          >
                            {t("common.delete")}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </DataPanel>

          <div className="space-y-6">
            <DataPanel
              title={t("admin.sitesQuotas.assignSite")}
              subtitle={t("admin.sitesQuotas.assignSiteHint")}
            >
              <form onSubmit={handleAddSite} className="p-6 space-y-5">
                {formError && (
                  <Alert tone="danger" title={t("sg.error")}>
                    {formError}
                  </Alert>
                )}
                <Select
                  label={t("admin.sitesQuotas.siteLabel")}
                  value={form.site_id}
                  onChange={(v) => setForm((p) => ({ ...p, site_id: v }))}
                  options={[
                    {
                      value: "",
                      label:
                        availableSites.length === 0
                          ? t("admin.sitesQuotas.allAssigned")
                          : t("admin.sitesQuotas.selectSite"),
                    },
                    ...availableSites.map((s) => ({
                      value: s.id,
                      label: s.name + (s.address ? ` — ${s.address}` : ""),
                    })),
                  ]}
                />
                <TextField
                  label={t("admin.sitesQuotas.quotaLabel")}
                  type="number"
                  value={form.quota}
                  onChange={(v) => setForm((p) => ({ ...p, quota: v }))}
                  placeholder={t("admin.sitesQuotas.quotaPlaceholder")}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting || availableSites.length === 0}
                >
                  {submitting
                    ? t("admin.sitesQuotas.adding")
                    : t("admin.sitesQuotas.addToSession")}
                </Button>
              </form>
            </DataPanel>

            <Alert tone="info" title={t("admin.sitesQuotas.addNote")}>
              {t("admin.sitesQuotas.addNoteHint")}
            </Alert>
          </div>
        </div>
      </PageBody>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, allocationId: null })}
        title={t("admin.sitesQuotas.removeModal.title")}
        description={t("admin.sitesQuotas.removeModal.text")}
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setModal({ open: false, allocationId: null })}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="danger" size="md" onClick={handleDelete}>
              {t("common.confirm")}
            </Button>
          </>
        }
      />
    </PageShell>
  );
}
