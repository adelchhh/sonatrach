import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch, getCurrentUserId } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  DataPanel,
  FilterChip,
  Button,
  Alert,
} from "../../components/ui/Studio";

const TYPE_LABEL = {
  DRAW: "Tirage",
  CONFIRMATION: "Confirmation",
  DOCUMENT: "Document",
  SURVEY: "Sondage",
  WITHDRAWAL: "Retrait",
  REASSIGNMENT: "Réaffectation",
  GENERAL: "Général",
};

const TYPE_KEYS = Object.keys(TYPE_LABEL);

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const t = useT();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [filter, setFilter] = useState("all");

  const userId = getCurrentUserId();

  const load = () => {
    if (!userId) {
      setLoading(false);
      setPageError("Veuillez vous connecter.");
      return;
    }
    setLoading(true);
    setPageError(null);
    apiGet(`/me/notifications?user_id=${userId}`)
      .then((res) => setNotifications(res.data || []))
      .catch((err) =>
        setPageError(err.message || "Impossible de charger les notifications.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [userId]);

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.is_read);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const stats = useMemo(
    () => ({
      total: notifications.length,
      unread: notifications.filter((n) => !n.is_read).length,
    }),
    [notifications]
  );

  const handleMarkRead = async (id) => {
    try {
      await apiPatch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      alert(err.message || "Impossible de marquer comme lu.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiPatch(`/me/notifications/read-all?user_id=${userId}`);
      load();
    } catch (err) {
      alert(err.message || "Action impossible.");
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.myArea")}
        title="Notifications"
        subtitle="Mises à jour sur les tirages, confirmations, documents et sondages."
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Notifications" },
        ]}
        actions={
          stats.unread > 0 ? (
            <Button variant="outline" size="md" onClick={handleMarkAllRead}>
              Tout marquer comme lu
            </Button>
          ) : null
        }
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        <StatBar>
          <StatCell label="Total" value={stats.total} sub="Notifications reçues" />
          <StatCell label="Non lues" value={stats.unread} sub="Nécessitent votre attention" accent={stats.unread > 0} />
        </StatBar>

        <div className="flex flex-wrap gap-2">
          <FilterChip label="Toutes" active={filter === "all"} onClick={() => setFilter("all")} />
          <FilterChip label="Non lues" active={filter === "unread"} onClick={() => setFilter("unread")} />
          {TYPE_KEYS.map((k) => (
            <FilterChip
              key={k}
              label={TYPE_LABEL[k]}
              active={filter === k}
              onClick={() => setFilter(k)}
            />
          ))}
        </div>

        <DataPanel>
          {loading ? (
            <div className="px-6 py-14 text-center text-[13px] text-[#737373]">
              Chargement…
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-14 text-center text-[13px] text-[#737373]">
              Aucune notification ne correspond à ce filtre.
            </div>
          ) : (
            <div className="divide-y divide-[#E5E5E5]">
              {filtered.map((n) => (
                <div
                  key={n.id}
                  className={`px-6 py-5 ${
                    !n.is_read ? "bg-[#FFF7E8]" : ""
                  } hover:bg-[#FAFAFA] transition-colors`}
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-[#0A0A0A] text-white text-[10px] uppercase tracking-[0.15em] font-bold">
                        {TYPE_LABEL[n.type] || n.type}
                      </span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#ED8D31] animate-pulse" />
                      )}
                    </div>
                    <span className="text-[11px] tabular-nums uppercase tracking-wider text-[#737373]">
                      {formatDateTime(n.created_at)}
                    </span>
                  </div>

                  {n.title && (
                    <p className="text-[14px] font-bold text-[#0A0A0A] mb-1">
                      {n.title}
                    </p>
                  )}
                  <p className="text-[13px] text-[#0A0A0A] leading-[1.7]">
                    {n.message}
                  </p>
                  {n.activity_title && (
                    <p className="text-[11px] text-[#737373] mt-2 uppercase tracking-wider">
                      À propos : {n.activity_title}
                    </p>
                  )}

                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#0A0A0A] hover:text-[#ED8D31] mt-3 transition-colors"
                    >
                      Marquer comme lu →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </DataPanel>
      </PageBody>
    </PageShell>
  );
}
