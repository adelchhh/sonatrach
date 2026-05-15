import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPatch } from "../../api";
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

export default function ManageRegistrations() {
  const t = useT();
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

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actingOn, setActingOn] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    activity: "all",
    session: "all",
    status: "all",
  });

  const [modal, setModal] = useState({ open: false, type: null, id: null });
  const [details, setDetails] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/registrations")
      .then((res) => setRegistrations(res.data || []))
      .catch((err) =>
        setPageError(err.message || "Impossible de charger les inscriptions.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const activities = useMemo(() => {
    const set = new Map();
    registrations.forEach((r) => {
      if (r.activity_id) set.set(r.activity_id, r.activity_title);
    });
    return Array.from(set.entries());
  }, [registrations]);

  const sessions = useMemo(() => {
    const set = new Map();
    registrations.forEach((r) => {
      if (r.session_id) {
        set.set(r.session_id, `#${r.session_id} (${r.activity_title})`);
      }
    });
    return Array.from(set.entries());
  }, [registrations]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return registrations.filter((r) => {
      if (filters.activity !== "all" && r.activity_id !== Number(filters.activity)) return false;
      if (filters.session !== "all" && r.session_id !== Number(filters.session)) return false;
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (q) {
        const hay = [
          r.employee_number,
          r.user_first_name,
          r.user_last_name,
          r.user_email,
          r.reference_number,
          r.activity_title,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [registrations, filters]);

  const stats = useMemo(() => {
    const total = registrations.length;
    const pending = registrations.filter((r) => r.status === "PENDING").length;
    const validated = registrations.filter((r) =>
      ["VALIDATED", "SELECTED", "CONFIRMED"].includes(r.status)
    ).length;
    const rejected = registrations.filter((r) =>
      ["REJECTED", "CANCELLED"].includes(r.status)
    ).length;
    return { total, pending, validated, rejected };
  }, [registrations]);

  const openDetails = async (id) => {
    setModal({ open: true, type: "details", id });
    setDetails(null);
    try {
      const res = await apiGet(`/registrations/${id}`);
      setDetails(res.data);
    } catch (err) {
      setDetails({ error: err.message || "Détails indisponibles." });
    }
  };

  const openReject = (id) => {
    setRejectReason("");
    setModal({ open: true, type: "reject", id });
  };

  const closeModal = () => {
    setModal({ open: false, type: null, id: null });
    setDetails(null);
  };

  const handleValidate = async (id) => {
    setActingOn(id);
    try {
      await apiPost(`/registrations/${id}/validate`);
      load();
    } catch (err) {
      alert(err.message || "Validation impossible.");
    } finally {
      setActingOn(null);
    }
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      alert("Veuillez préciser un motif.");
      return;
    }
    setActingOn(modal.id);
    try {
      await apiPost(`/registrations/${modal.id}/reject`, {
        reason: rejectReason.trim(),
      });
      closeModal();
      load();
    } catch (err) {
      alert(err.message || "Rejet impossible.");
    } finally {
      setActingOn(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActingOn(id);
    try {
      await apiPatch(`/registrations/${id}/status`, { status });
      load();
    } catch (err) {
      alert(err.message || "Changement de statut impossible.");
    } finally {
      setActingOn(null);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Administration"
        title={t("admin.registrations.title")}
        subtitle={t("admin.registrations.subtitle")}
        breadcrumbs={[
          { label: "Tableau de bord", to: "/dashboard" },
          { label: "Inscriptions" },
        ]}
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title="Erreur">
            {pageError}
          </Alert>
        )}

        <StatBar>
          <StatCell
            label={t("admin.registrations.statTotal")}
            value={stats.total}
            sub="Toutes inscriptions"
          />
          <StatCell
            label={t("admin.registrations.statPending")}
            value={stats.pending}
            sub="À valider"
            accent={stats.pending > 0}
          />
          <StatCell
            label={t("admin.registrations.statValidated")}
            value={stats.validated}
            sub="Validées / sélectionnées"
          />
          <StatCell
            label={t("admin.registrations.statRejected")}
            value={stats.rejected}
            sub="Rejets / annulations"
          />
        </StatBar>

        <Toolbar>
          <SearchInput
            value={filters.search}
            onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
            placeholder={t("admin.registrations.searchPlaceholder")}
          />
          <SelectInput
            value={filters.activity}
            onChange={(v) => setFilters((f) => ({ ...f, activity: v }))}
            options={[
              { value: "all", label: t("admin.registrations.allActivities") },
              ...activities.map(([id, title]) => ({ value: id, label: title })),
            ]}
          />
          <SelectInput
            value={filters.session}
            onChange={(v) => setFilters((f) => ({ ...f, session: v }))}
            options={[
              { value: "all", label: t("admin.registrations.allSessions") },
              ...sessions.map(([id, label]) => ({ value: id, label })),
            ]}
          />
          <SelectInput
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={[
              { value: "all", label: t("common.allStatuses") },
              ...Object.entries(STATUS_LABEL).map(([k, v]) => ({
                value: k,
                label: v,
              })),
            ]}
          />
          <Button
            variant="outline"
            size="md"
            onClick={() =>
              setFilters({
                search: "",
                activity: "all",
                session: "all",
                status: "all",
              })
            }
          >
            {t("common.reset")}
          </Button>
        </Toolbar>

        <DataPanel
          title="Inscriptions"
          subtitle="Validez, rejetez ou confirmez les inscriptions"
          badge={`${filtered.length} / ${registrations.length}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {[
                    t("admin.registrations.col.employee"),
                    t("admin.registrations.col.activitySession"),
                    t("admin.registrations.col.submitted"),
                    t("admin.registrations.col.documents"),
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
                    <td
                      colSpan={6}
                      className="px-6 py-14 text-center text-[13px] text-[#737373]"
                    >
                      {t("admin.registrations.loading")}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-14 text-center text-[13px] text-[#737373]"
                    >
                      {t("admin.registrations.emptyFiltered")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                    >
                      <td className="px-6 py-5">
                        <p className="text-[#0A0A0A] text-[14px] font-bold">
                          {r.user_first_name} {r.user_last_name}
                        </p>
                        <p className="text-[11px] font-mono tabular-nums text-[#737373] mt-1">
                          {t("admin.registrations.matricule", {
                            number: r.employee_number,
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[13px] font-semibold text-[#0A0A0A]">
                          {r.activity_title}
                        </p>
                        <p className="text-[11px] text-[#737373] mt-1 tabular-nums">
                          Session #{r.session_id} ·{" "}
                          {formatDate(r.start_date)} → {formatDate(r.end_date)}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                        {formatDate(r.registered_at)}
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#0A0A0A]">
                        {r.documents_validated_count} / {r.documents_count}
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
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetails(r.id)}
                          >
                            {t("common.view")}
                          </Button>
                          {r.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="dark"
                                onClick={() => handleValidate(r.id)}
                                disabled={actingOn === r.id}
                              >
                                {t("admin.registrations.validate")}
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => openReject(r.id)}
                                disabled={actingOn === r.id}
                              >
                                {t("admin.registrations.reject")}
                              </Button>
                            </>
                          )}
                          {r.status === "SELECTED" && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() =>
                                handleStatusChange(r.id, "CONFIRMED")
                              }
                              disabled={actingOn === r.id}
                            >
                              {t("admin.registrations.markConfirmed")}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DataPanel>
      </PageBody>

      {/* DETAILS MODAL */}
      <Modal
        open={modal.open && modal.type === "details"}
        onClose={closeModal}
        title={t("admin.registrations.details.title")}
        width="lg"
        footer={
          <Button variant="outline" size="md" onClick={closeModal}>
            {t("common.close")}
          </Button>
        }
      >
        {!details && (
          <p className="text-[13px] text-[#737373]">
            {t("admin.registrations.details.loading")}
          </p>
        )}
        {details?.error && (
          <Alert tone="danger" title="Erreur">
            {details.error}
          </Alert>
        )}
        {details?.registration && (
          <div className="space-y-5">
            <DetailGrid>
              <DetailRow
                label={t("admin.registrations.details.employee")}
                value={`${details.registration.user_first_name} ${details.registration.user_last_name} (${details.registration.employee_number})`}
              />
              <DetailRow
                label={t("admin.registrations.details.email")}
                value={details.registration.user_email}
              />
              <DetailRow
                label={t("admin.registrations.details.activity")}
                value={`${details.registration.activity_title} (${details.registration.activity_category})`}
              />
              <DetailRow
                label={t("admin.registrations.details.session")}
                value={`${formatDate(details.registration.start_date)} → ${formatDate(details.registration.end_date)}`}
              />
              <DetailRow
                label={t("admin.registrations.details.status")}
                value={STATUS_LABEL[details.registration.status]}
              />
              <DetailRow
                label={t("admin.registrations.details.eligible")}
                value={
                  details.registration.is_eligible
                    ? t("common.yes")
                    : t("common.no")
                }
              />
              <DetailRow
                label={t("admin.registrations.details.submitted")}
                value={formatDate(details.registration.registered_at)}
              />
              {details.registration.rejection_reason && (
                <DetailRow
                  label={t("admin.registrations.details.rejectionReason")}
                  value={details.registration.rejection_reason}
                />
              )}
            </DetailGrid>

            <SubBlock
              title={`${t("admin.registrations.details.siteChoices")} · ${details.choices.length}`}
            >
              {details.choices.length === 0 ? (
                <p className="text-[12px] text-[#737373] italic">
                  {t("admin.registrations.details.noChoices")}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {details.choices.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-baseline gap-3 text-[13px]"
                    >
                      <span className="text-[#ED8D31] font-bold tabular-nums">
                        #{c.choice_order}
                      </span>
                      <span className="text-[#0A0A0A] font-semibold">
                        {c.site_name}
                      </span>
                      <span className="text-[11px] text-[#737373]">
                        quota {c.quota}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SubBlock>

            <SubBlock
              title={`${t("admin.registrations.details.documents")} · ${details.documents.length}`}
            >
              {details.documents.length === 0 ? (
                <p className="text-[12px] text-[#737373] italic">
                  {t("admin.registrations.details.noDocs")}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {details.documents.map((d) => (
                    <li
                      key={d.document_id}
                      className="flex items-center justify-between gap-3 text-[13px]"
                    >
                      <span className="text-[#0A0A0A]">{d.file_name}</span>
                      <StatusPill
                        tone={
                          d.status === "VALIDATED"
                            ? "success"
                            : d.status === "REJECTED"
                            ? "danger"
                            : "warn"
                        }
                        label={d.status}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </SubBlock>
          </div>
        )}
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        open={modal.open && modal.type === "reject"}
        onClose={closeModal}
        title={t("admin.registrations.rejectModal.title")}
        description={t("admin.registrations.rejectModal.text")}
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
              variant="danger"
              size="md"
              onClick={submitReject}
              disabled={actingOn === modal.id}
            >
              {actingOn === modal.id
                ? t("admin.registrations.rejectModal.rejecting")
                : t("admin.registrations.rejectModal.confirm")}
            </Button>
          </>
        }
      >
        <TextArea
          label="Motif du rejet"
          value={rejectReason}
          onChange={setRejectReason}
          placeholder={t("admin.registrations.rejectModal.placeholder")}
          rows={4}
          required
        />
      </Modal>
    </PageShell>
  );
}

function DetailGrid({ children }) {
  return <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">{children}</dl>;
}

function DetailRow({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#737373] mb-1">
        {label}
      </dt>
      <dd className="text-[13px] text-[#0A0A0A] font-semibold break-words">
        {value}
      </dd>
    </div>
  );
}

function SubBlock({ title, children }) {
  return (
    <div className="border-t border-[#E5E5E5] pt-5">
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}
