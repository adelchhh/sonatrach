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
      setError(err.message || t("sg.loadingFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!form.title.trim() || !form.message.trim()) {
      setError(t("sg.mandatoryFields"));
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
      setError(err.message || t("sg.sendImpossible"));
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
        title={t("sg.notifications")}
        subtitle={t("sg.subNotifications")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("sg.notifications") },
        ]}
      />

      <PageBody>
        {error && (
          <Alert tone="danger" title={t("sg.error")}>
            {error}
          </Alert>
        )}

        <StatBar>
          <StatCell label={t("sg.total")} value={totalCount} sub={t("sg.subAllNotifs")} />
          <StatCell label={t("sg.typeGeneral")} value={generalCount} sub={t("sg.subGeneric")} accent={generalCount > 0} />
          <StatCell label={t("sg.typeSurvey")} value={surveyCount} sub={t("sg.subLinkedToSurveys")} />
          <StatCell label={t("sg.typeAnnouncement")} value={announcementCount} sub={t("sg.subLinkedToAnnouncements")} />
        </StatBar>

        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6">
          <DataPanel
            title={t("sg.panelSendNotif")}
            subtitle={t("sg.panelSendNotifSub")}
          >
            <div className="p-6 space-y-5">
              <TextField
                label={t("sg.colTitle")}
                value={form.title}
                onChange={(v) => setForm((p) => ({ ...p, title: v }))}
                placeholder={t("sg.phTitle")}
                required
              />
              <TextArea
                label={t("sg.labelMessage")}
                value={form.message}
                onChange={(v) => setForm((p) => ({ ...p, message: v }))}
                placeholder={t("sg.phMessage")}
                rows={7}
                required
              />
              <Button
                variant="primary"
                size="lg"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? t("sg.sending") : t("sg.sendNow")}
              </Button>
            </div>
          </DataPanel>

          <DataPanel
            title={t("sg.sentHistory")}
            subtitle={t("sg.subAllNotifs")}
            badge={`${notifications.length}`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-[#0A0A0A]">
                  <tr>
                    {[t("sg.colTitle"), t("sg.colMessage"), t("sg.colType"), t("sg.colSent")].map((h, i) => (
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
                        {t("sg.loading")}
                      </td>
                    </tr>
                  ) : notifications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                        {t("sg.emptySent")}
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
