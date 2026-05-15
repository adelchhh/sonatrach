import { useEffect, useState } from "react";
import {
  createNotification,
  getSentNotifications,
} from "../../services/notificationService";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  DataPanel,
  StatusPill,
  Button,
  Alert,
  TextField,
  TextArea,
} from "../../components/ui/Studio";

function formatDate(item) {
  return item.created_at?.slice(0, 10) || "—";
}

function shortText(text, max = 120) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function ManageNotifications() {
  const t = useT();
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ title: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      const response = await getSentNotifications();
      const data = Array.isArray(response)
        ? response
        : response.data || response.notifications || [];
      setNotifications(data);
    } catch (err) {
      setError(err.message || "Impossible de charger les notifications.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!form.title.trim() || !form.message.trim()) {
      setError("Titre et message sont obligatoires.");
      return;
    }
    try {
      setSending(true);
      setError("");
      await createNotification({
        title: form.title,
        message: form.message,
      });
      setForm({ title: "", message: "" });
      await loadNotifications();
    } catch (err) {
      setError(err.message || "Envoi impossible.");
    } finally {
      setSending(false);
    }
  }

  const totalCount = notifications.length;
  const generalCount = notifications.filter((n) => n.type === "GENERAL").length;
  const surveyCount = notifications.filter((n) => n.type === "SURVEY").length;
  const announcementCount = notifications.filter(
    (n) => n.type === "ANNOUNCEMENT"
  ).length;

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.communication")}
        title="Notifications"
        subtitle="Créez des notifications globales destinées à tous les collaborateurs et consultez l'historique des envois."
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Notifications" },
        ]}
      />

      <PageBody>
        {error && (
          <Alert tone="danger" title={t("sg.error")}>
            {error}
          </Alert>
        )}

        <StatBar>
          <StatCell label="Total" value={totalCount} sub="Envoyées" />
          <StatCell label="Général" value={generalCount} sub="Messages génériques" accent={generalCount > 0} />
          <StatCell label="Sondage" value={surveyCount} sub="Liées aux sondages" />
          <StatCell label="Annonce" value={announcementCount} sub="Liées aux annonces" />
        </StatBar>

        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6">
          <DataPanel
            title="Envoyer une notification"
            subtitle="Visible par tous les collaborateurs"
          >
            <div className="p-6 space-y-5">
              <TextField
                label="Titre"
                value={form.title}
                onChange={(v) => setForm((p) => ({ ...p, title: v }))}
                placeholder="Saisissez le titre…"
                required
              />
              <TextArea
                label="Message"
                value={form.message}
                onChange={(v) => setForm((p) => ({ ...p, message: v }))}
                placeholder="Rédigez le message…"
                rows={7}
                required
              />
              <Button
                variant="primary"
                size="lg"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? "Envoi…" : "Envoyer maintenant"}
              </Button>
            </div>
          </DataPanel>

          <DataPanel
            title="Historique d'envoi"
            subtitle="Notifications globales envoyées"
            badge={`${notifications.length}`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-[#0A0A0A]">
                  <tr>
                    {["Titre", "Message", "Type", "Envoyée"].map((h, i) => (
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
                      <td colSpan={4} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                        Chargement…
                      </td>
                    </tr>
                  ) : notifications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                        Aucune notification envoyée pour le moment.
                      </td>
                    </tr>
                  ) : (
                    notifications.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                      >
                        <td className="px-6 py-5">
                          <p className="text-[#0A0A0A] text-[14px] font-bold">
                            {item.title}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-[12px] text-[#525252] max-w-[360px]">
                          {shortText(item.message)}
                        </td>
                        <td className="px-6 py-5">
                          <StatusPill tone="info" label={item.type} />
                        </td>
                        <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                          {formatDate(item)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </DataPanel>
        </div>
      </PageBody>
    </PageShell>
  );
}
