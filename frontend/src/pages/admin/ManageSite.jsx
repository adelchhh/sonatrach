import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "../../api";
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
  TextField,
} from "../../components/ui/Studio";

export default function ManageSite() {
  const t = useT();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [pageError, setPageError] = useState(null);

  const [form, setForm] = useState({ name: "", address: "" });
  const [modal, setModal] = useState({ open: false, siteId: null });
  const selectedSite = sites.find((s) => s.id === modal.siteId);

  const loadSites = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/sites")
      .then((res) => setSites(res.data || []))
      .catch((err) =>
        setPageError(err.message || "Impossible de charger les sites.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSites();
  }, []);

  const handleAddSite = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) {
      setFormError("Le nom du site est obligatoire.");
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/sites", {
        name: form.name.trim(),
        address: form.address.trim() || null,
      });
      setForm({ name: "", address: "" });
      loadSites();
    } catch (err) {
      setFormError(err.message || "Création du site impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => setModal({ open: false, siteId: null });

  const handleDeleteSite = async () => {
    try {
      await apiDelete(`/sites/${modal.siteId}`);
      closeModal();
      loadSites();
    } catch (err) {
      alert(err.message || "Suppression impossible.");
      closeModal();
    }
  };

  const totalSites = sites.length;
  const totalActivities = sites.reduce(
    (sum, s) => sum + Number(s.activities_count || 0),
    0
  );
  const totalSessions = sites.reduce(
    (sum, s) => sum + Number(s.sessions_count || 0),
    0
  );
  const sitesInUse = sites.filter(
    (s) => Number(s.sessions_count || 0) > 0
  ).length;

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("admin.site.adminTools")}
        title={t("admin.site.title")}
        subtitle={t("admin.site.subtitle")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Sites" },
        ]}
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        <StatBar>
          <StatCell label={t("admin.site.statTotal")} value={totalSites} sub={t("sg.total")} />
          <StatCell
            label={t("admin.site.statInUse")}
            value={sitesInUse}
            sub={t("sg.subActive")}
            accent={sitesInUse > 0}
          />
          <StatCell label={t("admin.site.statActivities")} value={totalActivities} sub={t("sg.activities")} />
          <StatCell label={t("admin.site.statSessions")} value={totalSessions} sub={t("sg.sessions")} />
        </StatBar>

        <div className="grid grid-cols-1 xl:grid-cols-[1.65fr_1fr] gap-6">
          <DataPanel
            title={t("admin.site.existing")}
            subtitle={t("admin.site.existingHint")}
            badge={`${sites.length}`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-[#0A0A0A]">
                  <tr>
                    {[
                      t("admin.site.col.site"),
                      t("admin.site.col.address"),
                      t("admin.site.col.activities"),
                      t("admin.site.col.sessions"),
                      t("admin.site.col.action"),
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
                        {t("admin.site.loading")}
                      </td>
                    </tr>
                  ) : sites.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                        {t("admin.site.empty")}
                      </td>
                    </tr>
                  ) : (
                    sites.map((site) => (
                      <tr
                        key={site.id}
                        className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
                      >
                        <td className="px-6 py-4 text-[14px] font-bold text-[#0A0A0A]">
                          {site.name}
                        </td>
                        <td className="px-6 py-4 text-[12px] text-[#525252]">
                          {site.address || "—"}
                        </td>
                        <td className="px-6 py-4 text-[14px] font-bold tabular-nums text-[#0A0A0A]">
                          {site.activities_count}
                        </td>
                        <td className="px-6 py-4 text-[14px] font-bold tabular-nums text-[#0A0A0A]">
                          {site.sessions_count}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              setModal({ open: true, siteId: site.id })
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

          <DataPanel
            title={t("admin.site.addNew")}
            subtitle={t("admin.site.addNewHint")}
          >
            <form onSubmit={handleAddSite} className="p-6 space-y-5">
              {formError && (
                <Alert tone="danger" title={t("sg.error")}>
                  {formError}
                </Alert>
              )}

              <TextField
                label={t("admin.site.siteName")}
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder={t("admin.site.siteNamePlaceholder")}
                required
              />

              <TextField
                label={t("admin.site.address")}
                value={form.address}
                onChange={(v) => setForm((p) => ({ ...p, address: v }))}
                placeholder={t("admin.site.addressPlaceholder")}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
              >
                {submitting ? t("admin.site.adding") : t("admin.site.addBtn")}
              </Button>
            </form>
          </DataPanel>
        </div>
      </PageBody>

      <Modal
        open={modal.open && !!selectedSite}
        onClose={closeModal}
        title={t("admin.site.deleteTitle")}
        description={
          selectedSite
            ? t("admin.site.deleteText", { name: selectedSite.name })
            : ""
        }
        footer={
          <>
            <Button variant="outline" size="md" onClick={closeModal}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" size="md" onClick={handleDeleteSite}>
              {t("common.confirm")}
            </Button>
          </>
        }
      >
        {selectedSite && Number(selectedSite.sessions_count) > 0 && (
          <Alert tone="warn" title={t("sg.error")}>
            {t("admin.site.deleteWarn", { count: selectedSite.sessions_count })}
          </Alert>
        )}
      </Modal>
    </PageShell>
  );
}
