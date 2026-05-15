import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { apiGet, apiPost, getCurrentUserId } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  DataPanel,
  StatusPill,
  Modal,
  Button,
  Alert,
  TextArea,
  EmptyState,
} from "../../components/ui/Studio";

const STATUS_TONE = {
  PENDING: "warn",
  VALIDATED: "info",
  REJECTED: "danger",
  SELECTED: "accent",
  WAITING_LIST: "warn",
  CONFIRMED: "success",
  WITHDRAWN: "neutral",
  CANCELLED: "neutral",
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function MyRequests() {
  const t = useT();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actingOn, setActingOn] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState({
    open: false,
    registrationId: null,
  });
  const [withdrawReason, setWithdrawReason] = useState("");

  const userId = getCurrentUserId();

  const STATUS_LABEL = {
    PENDING: t("statuses.PENDING"),
    VALIDATED: t("statuses.VALIDATED"),
    REJECTED: t("statuses.REJECTED"),
    SELECTED: t("statuses.SELECTED"),
    WAITING_LIST: t("statuses.WAITING_LIST"),
    CONFIRMED: t("statuses.CONFIRMED"),
    WITHDRAWN: t("statuses.WITHDRAWN"),
    CANCELLED: t("statuses.CANCELLED"),
  };

  const load = () => {
    if (!userId) {
      setLoading(false);
      setPageError("Veuillez vous connecter pour voir vos demandes.");
      return;
    }
    setLoading(true);
    setPageError(null);
    apiGet(`/me/registrations?user_id=${userId}`)
      .then((res) => setRequests(res.data || []))
      .catch((err) =>
        setPageError(err.message || t("sg.error"))
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [userId]);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) =>
      ["PENDING", "VALIDATED", "WAITING_LIST"].includes(r.status)
    ).length;
    const selected = requests.filter((r) =>
      ["SELECTED", "CONFIRMED"].includes(r.status)
    ).length;
    const closed = requests.filter((r) =>
      ["REJECTED", "WITHDRAWN", "CANCELLED"].includes(r.status)
    ).length;
    return { total, pending, selected, closed };
  }, [requests]);

  const handleCancel = async (registrationId) => {
    if (!window.confirm(t("sg.confirmCancelRegistration")))
      return;
    setActingOn(registrationId);
    try {
      await apiPost(`/registrations/${registrationId}/cancel`, {
        user_id: userId,
      });
      toast.success(t("sg.registrationCancelled"));
      load();
    } catch (err) {
      toast.error(err.message || t("sg.error"));
    } finally {
      setActingOn(null);
    }
  };

  const submitWithdraw = async () => {
    if (!withdrawReason.trim()) {
      toast.error(t("sg.confirmReason"));
      return;
    }
    setActingOn(withdrawModal.registrationId);
    try {
      await apiPost(`/withdrawals`, {
        registration_id: withdrawModal.registrationId,
        reason: withdrawReason.trim(),
      });
      setWithdrawModal({ open: false, registrationId: null });
      setWithdrawReason("");
      toast.success(t("sg.withdrawalSent"));
      load();
    } catch (err) {
      toast.error(err.message || t("sg.error"));
    } finally {
      setActingOn(null);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.myArea")}
        title={t("sg.myRequests")}
        subtitle=""
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("sg.myRequests") },
        ]}
        actions={
          <Button
            to="/dashboard/catalog"
            variant="primary"
            size="md"
            icon={<span className="text-[14px] leading-none">＋</span>}
          >
            {t("sg.newRecord")}
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
          <StatCell label={t("sg.myRequests")} value={stats.total} sub={t("sg.total")} />
          <StatCell
            label={t("sg.inProgress")}
            value={stats.pending}
            sub={t("sg.pending")}
            accent={stats.pending > 0}
          />
          <StatCell
            label={t("sg.selected")}
            value={stats.selected}
            sub=""
          />
          <StatCell label={t("statuses.WITHDRAWN")} value={stats.closed} sub="" />
        </StatBar>

        <DataPanel
          title={t("sg.myRequests")}
          subtitle=""
          badge={`${requests.length}`}
        >
          {loading ? (
            <div className="px-6 py-14 text-center text-[13px] text-[#737373]">
              {t("sg.loading")}
            </div>
          ) : requests.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon="📄"
                title={t("sg.emptyRegistrations")}
                description=""
                action={
                  <Button to="/dashboard/catalog" variant="primary" size="md">
                    {t("hero.browseCatalog")}
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-[#0A0A0A]">
                  <tr>
                    {[
                      t("admin.registrations.col.activitySession"),
                      t("admin.registrations.col.submitted"),
                      t("admin.registrations.details.siteChoices"),
                      t("common.status"),
                      t("admin.registrations.col.reference") === "admin.registrations.col.reference" ? "Reference" : t("admin.registrations.col.reference"),
                      t("common.actions"),
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
                  {requests.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                    >
                      <td className="px-6 py-5">
                        <p className="text-[#0A0A0A] text-[14px] font-bold leading-tight">
                          {r.activity_title}
                        </p>
                        <p className="text-[#737373] text-[11px] mt-1 tabular-nums uppercase tracking-wider">
                          {formatDate(r.start_date)} → {formatDate(r.end_date)}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                        {formatDate(r.registered_at)}
                      </td>
                      <td className="px-6 py-5 text-[12px] text-[#0A0A0A]">
                        {r.choices && r.choices.length > 0 ? (
                          <ul className="space-y-1">
                            {r.choices.map((c) => (
                              <li
                                key={c.session_site_id}
                                className="flex items-baseline gap-2"
                              >
                                <span className="text-[#A3A3A3] tabular-nums font-bold">
                                  {String(c.choice_order).padStart(2, "0")}
                                </span>
                                <span>{c.site_name}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-[#A3A3A3] italic">
                            {t("activityDetail.noSiteSelected")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <StatusPill
                          tone={STATUS_TONE[r.status] || "neutral"}
                          label={STATUS_LABEL[r.status] || r.status}
                        />
                        {r.rejection_reason && (
                          <p
                            className="text-[11px] text-[#9F1F1F] mt-2 max-w-[200px]"
                            title={r.rejection_reason}
                          >
                            {r.rejection_reason}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-5 text-[11px] font-mono tabular-nums text-[#737373]">
                        {r.reference_number || "—"}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {["PENDING", "VALIDATED"].includes(r.status) && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleCancel(r.id)}
                              disabled={actingOn === r.id}
                            >
                              {t("common.cancel")}
                            </Button>
                          )}
                          {["SELECTED", "CONFIRMED"].includes(r.status) && (
                            <Button
                              size="sm"
                              variant="dark"
                              onClick={() =>
                                setWithdrawModal({
                                  open: true,
                                  registrationId: r.id,
                                })
                              }
                              disabled={actingOn === r.id}
                            >
                              {t("statuses.WITHDRAWN")}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataPanel>
      </PageBody>

      <Modal
        open={withdrawModal.open}
        onClose={() =>
          setWithdrawModal({ open: false, registrationId: null })
        }
        title={t("statuses.WITHDRAWN")}
        description=""
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() =>
                setWithdrawModal({ open: false, registrationId: null })
              }
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="dark"
              size="md"
              onClick={submitWithdraw}
              disabled={actingOn === withdrawModal.registrationId}
            >
              {t("common.submit")}
            </Button>
          </>
        }
      >
        <TextArea
          label={t("admin.withdrawals.col.reason") === "admin.withdrawals.col.reason" ? "Motif" : t("admin.withdrawals.col.reason")}
          value={withdrawReason}
          onChange={setWithdrawReason}
          placeholder=""
          rows={4}
          required
        />
      </Modal>
    </PageShell>
  );
}
