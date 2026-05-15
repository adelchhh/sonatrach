import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch, getCurrentUserId } from "../../api";
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
  TextArea,
} from "../../components/ui/Studio";

const STATUS_TONE = {
  PENDING: "warn",
  APPROVED: "success",
  REJECTED: "danger",
  PROCESSED: "accent",
};

const STATUS_LABEL_FR = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
  PROCESSED: "Traité",
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

export default function ManageWithdrawals() {
  const t = useT();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actingOn, setActingOn] = useState(null);

  const [filters, setFilters] = useState({ search: "", status: "all" });
  const [modal, setModal] = useState({ open: false, type: null, id: null });
  const [comment, setComment] = useState("");

  const adminId = getCurrentUserId();

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/withdrawals")
      .then((res) => setWithdrawals(res.data || []))
      .catch((err) =>
        setPageError(err.message || "Impossible de charger les retraits.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return withdrawals.filter((w) => {
      if (filters.status !== "all" && w.status !== filters.status) return false;
      if (q) {
        const hay = [
          w.employee_number,
          w.user_first_name,
          w.user_last_name,
          w.activity_title,
          w.reason,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [withdrawals, filters]);

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter((w) => w.status === "PENDING").length,
    approved: withdrawals.filter((w) => w.status === "APPROVED").length,
    processed: withdrawals.filter((w) => w.status === "PROCESSED").length,
  };

  const statusLabel = (status) => {
    const tr = t(`statuses.${status}`);
    if (tr === `statuses.${status}`) return STATUS_LABEL_FR[status] || status;
    return tr;
  };

  const closeModal = () => {
    setModal({ open: false, type: null, id: null });
    setComment("");
  };

  const handleAction = async (id, status, requireComment = false) => {
    if (requireComment && !comment.trim()) {
      alert("Précisez un commentaire.");
      return;
    }
    setActingOn(id);
    try {
      await apiPatch(`/withdrawals/${id}/status`, {
        status,
        admin_comment: comment.trim() || null,
        processed_by: adminId,
      });
      closeModal();
      load();
    } catch (err) {
      alert(err.message || "Mise à jour impossible.");
    } finally {
      setActingOn(null);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.administration")}
        title={t("admin.withdrawals.title")}
        subtitle={t("admin.withdrawals.subtitle")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Retraits" },
        ]}
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        <StatBar>
          <StatCell
            label={t("admin.withdrawals.statTotal")}
            value={stats.total}
            sub="Toutes demandes"
          />
          <StatCell
            label={t("admin.withdrawals.statPending")}
            value={stats.pending}
            sub="À traiter"
            accent={stats.pending > 0}
          />
          <StatCell
            label={t("admin.withdrawals.statApproved")}
            value={stats.approved}
            sub="Approuvés"
          />
          <StatCell
            label={t("admin.withdrawals.statProcessed")}
            value={stats.processed}
            sub="Définitivement traités"
          />
        </StatBar>

        <Toolbar>
          <SearchInput
            value={filters.search}
            onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
            placeholder={t("admin.withdrawals.searchPlaceholder")}
          />
          <SelectInput
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={[
              { value: "all", label: t("common.allStatuses") },
              ...["PENDING", "APPROVED", "REJECTED", "PROCESSED"].map((k) => ({
                value: k,
                label: statusLabel(k),
              })),
            ]}
          />
          <Button
            variant="outline"
            size="md"
            onClick={() => setFilters({ search: "", status: "all" })}
          >
            {t("common.reset")}
          </Button>
        </Toolbar>

        <DataPanel
          title="Demandes de retrait"
          subtitle="Approuvez, rejetez ou marquez comme traitées"
          badge={`${filtered.length} / ${withdrawals.length}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {[
                    t("admin.withdrawals.col.employee"),
                    t("admin.withdrawals.col.activitySession"),
                    t("admin.withdrawals.col.requested"),
                    t("admin.withdrawals.col.reason"),
                    t("common.status"),
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      {t("admin.withdrawals.loading")}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      {t("admin.withdrawals.emptyFiltered")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((w) => (
                    <tr
                      key={w.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                    >
                      <td className="px-6 py-5">
                        <p className="text-[#0A0A0A] text-[14px] font-bold">
                          {w.user_first_name} {w.user_last_name}
                        </p>
                        <p className="text-[11px] font-mono tabular-nums text-[#737373] mt-1">
                          {t("admin.registrations.matricule", {
                            number: w.employee_number,
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[13px] font-semibold text-[#0A0A0A]">
                          {w.activity_title}
                        </p>
                        <p className="text-[11px] text-[#737373] mt-1 tabular-nums">
                          Session #{w.session_id} · {formatDate(w.start_date)} → {formatDate(w.end_date)}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                        {formatDate(w.requested_at)}
                      </td>
                      <td className="px-6 py-5 text-[12px] text-[#0A0A0A] max-w-[280px]">
                        {w.reason || "—"}
                        {w.admin_comment && (
                          <p className="text-[11px] text-[#737373] mt-1 italic">
                            {t("admin.withdrawals.adminLabel")}: {w.admin_comment}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <StatusPill tone={STATUS_TONE[w.status] || "neutral"} label={statusLabel(w.status)} />
                      </td>
                      <td className="px-6 py-5">
                        {w.status === "PENDING" ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="dark"
                              onClick={() =>
                                setModal({ open: true, type: "approve", id: w.id })
                              }
                              disabled={actingOn === w.id}
                            >
                              {t("admin.withdrawals.approve")}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() =>
                                setModal({ open: true, type: "reject", id: w.id })
                              }
                              disabled={actingOn === w.id}
                            >
                              {t("admin.withdrawals.reject")}
                            </Button>
                          </div>
                        ) : w.status === "APPROVED" ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleAction(w.id, "PROCESSED")}
                            disabled={actingOn === w.id}
                          >
                            {t("admin.withdrawals.markProcessed")}
                          </Button>
                        ) : (
                          <span className="text-[11px] text-[#A3A3A3] tabular-nums">
                            {formatDate(w.processed_at)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DataPanel>
      </PageBody>

      <Modal
        open={modal.open && (modal.type === "approve" || modal.type === "reject")}
        onClose={closeModal}
        title={
          modal.type === "approve"
            ? t("admin.withdrawals.modal.approveTitle")
            : t("admin.withdrawals.modal.rejectTitle")
        }
        description={
          modal.type === "approve"
            ? t("admin.withdrawals.modal.approveText")
            : t("admin.withdrawals.modal.rejectText")
        }
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={closeModal}
              disabled={actingOn === modal.id}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant={modal.type === "approve" ? "dark" : "danger"}
              size="md"
              onClick={() =>
                handleAction(
                  modal.id,
                  modal.type === "approve" ? "APPROVED" : "REJECTED",
                  modal.type === "reject"
                )
              }
              disabled={actingOn === modal.id}
            >
              {actingOn === modal.id
                ? t("admin.withdrawals.modal.processing")
                : modal.type === "approve"
                ? t("admin.withdrawals.modal.confirmApprove")
                : t("admin.withdrawals.modal.confirmReject")}
            </Button>
          </>
        }
      >
        <TextArea
          label={modal.type === "approve" ? "Note (optionnelle)" : "Motif"}
          value={comment}
          onChange={setComment}
          placeholder={
            modal.type === "approve"
              ? t("admin.withdrawals.modal.approvePlaceholder")
              : t("admin.withdrawals.modal.rejectPlaceholder")
          }
          rows={3}
          required={modal.type === "reject"}
        />
      </Modal>
    </PageShell>
  );
}
