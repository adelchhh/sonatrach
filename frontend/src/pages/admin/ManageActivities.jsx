import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, apiGet, apiPatch, apiDelete } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  Toolbar,
  SearchInput,
  SelectInput,
  DataPanel,
  StatusPill,
  Modal,
  Button,
  Alert,
} from "../../components/ui/Studio";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop";

const STATUS_TONE = {
  PUBLISHED: "success",
  DRAFT: "warn",
  ARCHIVED: "neutral",
  CANCELLED: "danger",
};

function imageOf(activity) {
  if (!activity?.image_url) return DEFAULT_IMAGE;
  if (activity.image_url.startsWith("http")) return activity.image_url;
  return `${API_BASE_URL}${activity.image_url}`;
}

export default function ManageActivities() {
  const t = useT();
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
      setError(err.message || "Échec du chargement des activités.");
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
      if (search && !a.title.toLowerCase().includes(search.toLowerCase()))
        return false;
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
    return [
      { value: "ALL", label: t("common.allCategories") },
      ...Array.from(set).map((c) => ({
        value: c,
        label:
          t(`categories.${c}`) === `categories.${c}` ? c : t(`categories.${c}`),
      })),
    ];
  }, [activities, t]);

  const statusOptions = [
    { value: "ALL", label: t("common.allStatuses") },
    { value: "PUBLISHED", label: t("statuses.PUBLISHED") },
    { value: "DRAFT", label: t("statuses.DRAFT") },
    { value: "ARCHIVED", label: t("statuses.ARCHIVED") },
    { value: "CANCELLED", label: t("statuses.CANCELLED") },
  ];

  const handleConfirm = async () => {
    if (!modal.activity) return;
    setActionLoading(true);
    try {
      if (modal.type === "archive") {
        await apiPatch(`/activities/${modal.activity.id}/status`, {
          status: "ARCHIVED",
        });
      } else if (modal.type === "activate") {
        await apiPatch(`/activities/${modal.activity.id}/status`, {
          status: "PUBLISHED",
        });
      } else if (modal.type === "deactivate") {
        await apiPatch(`/activities/${modal.activity.id}/status`, {
          status: "DRAFT",
        });
      } else if (modal.type === "delete") {
        await apiDelete(`/activities/${modal.activity.id}`);
      }
      await load();
      closeModal();
    } catch (err) {
      alert(err.message || "Action impossible.");
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
    <PageShell>
      <PageHeader
        eyebrow="Administration"
        title={t("admin.activities.title")}
        subtitle={t("admin.activities.subtitle")}
        breadcrumbs={[
          { label: "Tableau de bord", to: "/dashboard" },
          { label: "Activités" },
        ]}
        actions={
          <Button
            to="/dashboard/admin/activities/create"
            variant="primary"
            size="md"
            icon={<span className="text-[14px] leading-none">＋</span>}
          >
            {t("admin.activities.createNew")}
          </Button>
        }
      />

      <PageBody>
        {error && (
          <Alert tone="danger" title="Erreur">
            {error}
          </Alert>
        )}

        <StatBar>
          <StatCell
            label={t("admin.reports.statActivities")}
            value={stats.total}
            sub="Toutes statuts confondus"
          />
          <StatCell
            label={t("statuses.PUBLISHED")}
            value={stats.published}
            sub="Visibles dans le catalogue"
            accent
          />
          <StatCell
            label={t("statuses.DRAFT")}
            value={stats.drafts}
            sub="En cours de préparation"
          />
          <StatCell
            label={`${t("statuses.ARCHIVED")} / ${t("statuses.CANCELLED")}`}
            value={stats.archived + stats.cancelled}
            sub="Hors-circuit"
          />
        </StatBar>

        <Toolbar>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("admin.activities.searchPlaceholder")}
          />
          <SelectInput
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories}
          />
          <SelectInput
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
          <Button variant="outline" size="md" onClick={resetFilters}>
            {t("common.reset")}
          </Button>
        </Toolbar>

        <ActivityPanel
          title={t("admin.activities.active")}
          subtitle={t("admin.activities.activeHint")}
          badge={`${active.length} actives`}
          items={active}
          loading={loading}
          onArchive={(a) =>
            setModal({ open: true, type: "archive", activity: a })
          }
          onDeactivate={(a) =>
            setModal({ open: true, type: "deactivate", activity: a })
          }
          onDelete={(a) =>
            setModal({ open: true, type: "delete", activity: a })
          }
          showActivate={false}
          t={t}
        />

        <ActivityPanel
          title={t("admin.activities.inactive")}
          subtitle={t("admin.activities.inactiveHint")}
          badge={`${inactive.length} inactives`}
          items={inactive}
          loading={loading}
          onArchive={(a) =>
            setModal({ open: true, type: "archive", activity: a })
          }
          onActivate={(a) =>
            setModal({ open: true, type: "activate", activity: a })
          }
          onDelete={(a) =>
            setModal({ open: true, type: "delete", activity: a })
          }
          showActivate
          t={t}
        />
      </PageBody>

      <Modal
        open={modal.open}
        onClose={closeModal}
        title={
          modal.type === "archive"
            ? t("admin.activities.modal.archiveTitle")
            : modal.type === "activate"
            ? t("admin.activities.activate")
            : modal.type === "deactivate"
            ? t("admin.activities.deactivate")
            : t("common.delete")
        }
        description={
          modal.type === "archive"
            ? t("admin.activities.modal.archiveText")
            : modal.type === "activate"
            ? t("admin.activities.modal.deactivateText")
            : modal.type === "deactivate"
            ? t("admin.activities.modal.deactivateText")
            : t("admin.site.deleteText", { name: modal.activity?.title || "" })
        }
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={closeModal}
              disabled={actionLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant={modal.type === "delete" ? "danger" : "primary"}
              size="md"
              onClick={handleConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? t("common.processing") : t("common.confirm")}
            </Button>
          </>
        }
      />
    </PageShell>
  );
}

function ActivityPanel({
  title,
  subtitle,
  badge,
  items,
  loading,
  onArchive,
  onActivate,
  onDeactivate,
  onDelete,
  showActivate,
  t,
}) {
  return (
    <DataPanel title={title} subtitle={subtitle} badge={badge}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px]">
          <thead className="bg-[#0A0A0A]">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]">
                {t("admin.activities.col.activity")}
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]">
                {t("admin.activities.col.category")}
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]">
                {t("common.status")}
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]">
                {t("common.date")}
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-white uppercase tracking-[0.18em]">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-14 text-center text-[13px] text-[#737373]"
                >
                  {t("common.loading")}
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-14 text-center text-[13px] text-[#737373]"
                >
                  {t("catalog.noActivities")}
                </td>
              </tr>
            ) : (
              items.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={imageOf(activity)}
                        alt={activity.title}
                        className="w-14 h-14 object-cover bg-[#1A1A1A]"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_IMAGE;
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-[#0A0A0A] text-[14px] font-bold leading-tight">
                          {activity.title}
                        </p>
                        <p className="text-[#737373] text-[12px] mt-1 line-clamp-1 max-w-[320px]">
                          {activity.description || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[12px] text-[#525252]">
                    {t(`categories.${activity.category}`) ===
                    `categories.${activity.category}`
                      ? activity.category
                      : t(`categories.${activity.category}`)}
                  </td>
                  <td className="px-6 py-5">
                    <StatusPill
                      tone={STATUS_TONE[activity.status] || "neutral"}
                      label={
                        t(`statuses.${activity.status}`) ===
                        `statuses.${activity.status}`
                          ? activity.status
                          : t(`statuses.${activity.status}`)
                      }
                    />
                  </td>
                  <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                    {activity.created_at
                      ? new Date(activity.created_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        to={`/dashboard/admin/activities/${activity.id}/edit`}
                      >
                        {t("admin.activities.modify")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        to={`/dashboard/admin/activities/${activity.id}/sessions`}
                      >
                        {t("admin.activities.col.sessions")}
                      </Button>
                      {showActivate ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onActivate?.(activity)}
                        >
                          {t("admin.activities.activate")}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeactivate?.(activity)}
                        >
                          {t("admin.activities.deactivate")}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onArchive?.(activity)}
                      >
                        {t("admin.activities.archive")}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDelete?.(activity)}
                      >
                        {t("common.delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DataPanel>
  );
}
