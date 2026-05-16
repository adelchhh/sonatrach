import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, getCurrentUserId } from "../../api";
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
  UPLOADED: "warn",
  VALIDATED: "success",
  REJECTED: "danger",
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

export default function ManageDocuments() {
  const t = useT();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actingOn, setActingOn] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    activity: "all",
    status: "all",
  });

  const [modal, setModal] = useState({ open: false, type: null, id: null });
  const [comment, setComment] = useState("");

  const adminId = getCurrentUserId();

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/documents")
      .then((res) => setDocuments(res.data || []))
      .catch((err) =>
        setPageError(err.message || "Impossible de charger les documents.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const activities = useMemo(() => {
    const set = new Set();
    documents.forEach((d) => set.add(d.activity_title));
    return Array.from(set);
  }, [documents]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return documents.filter((d) => {
      if (filters.activity !== "all" && d.activity_title !== filters.activity)
        return false;
      if (filters.status !== "all" && d.status !== filters.status) return false;
      if (q) {
        const hay = [
          d.employee_number,
          d.user_first_name,
          d.user_last_name,
          d.file_name,
          d.document_type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [documents, filters]);

  const stats = {
    total: documents.length,
    uploaded: documents.filter((d) => d.status === "UPLOADED").length,
    validated: documents.filter((d) => d.status === "VALIDATED").length,
    rejected: documents.filter((d) => d.status === "REJECTED").length,
  };

  const statusLabel = (status) => {
    if (status === "UPLOADED") return t("admin.documents.statPending");
    const tr = t(`statuses.${status}`);
    return tr === `statuses.${status}` ? status : tr;
  };

  const closeModal = () => {
    setModal({ open: false, type: null, id: null });
    setComment("");
  };

  const handleValidate = async (id) => {
    setActingOn(id);
    try {
      await apiPost(`/documents/${id}/validate`, {
        comment: null,
        validated_by: adminId,
      });
      load();
    } catch (err) {
      alert(err.message || "Validation impossible.");
    } finally {
      setActingOn(null);
    }
  };

  const submitReject = async () => {
    if (!comment.trim()) {
      alert("Précisez un motif de rejet.");
      return;
    }
    setActingOn(modal.id);
    try {
      await apiPost(`/documents/${modal.id}/reject`, {
        comment: comment.trim(),
        validated_by: adminId,
      });
      closeModal();
      load();
    } catch (err) {
      alert(err.message || "Rejet impossible.");
    } finally {
      setActingOn(null);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.administration")}
        title={t("admin.documents.title")}
        subtitle={t("admin.documents.subtitle")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Documents" },
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
            label={t("admin.documents.statTotal")}
            value={stats.total}
            sub={t("sg.subUploaded")}
          />
          <StatCell
            label={t("admin.documents.statPending")}
            value={stats.uploaded}
            sub={t("sg.subToReview")}
            accent={stats.uploaded > 0}
          />
          <StatCell
            label={t("admin.documents.statValidated")}
            value={stats.validated}
            sub={t("sg.validated")}
          />
          <StatCell
            label={t("admin.documents.statRejected")}
            value={stats.rejected}
            sub={t("sg.rejected")}
          />
        </StatBar>

        <Toolbar>
          <SearchInput
            value={filters.search}
            onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
            placeholder={t("admin.documents.searchPlaceholder")}
          />
          <SelectInput
            value={filters.activity}
            onChange={(v) => setFilters((f) => ({ ...f, activity: v }))}
            options={[
              { value: "all", label: t("admin.registrations.allActivities") },
              ...activities.map((a) => ({ value: a, label: a })),
            ]}
          />
          <SelectInput
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={[
              { value: "all", label: t("common.allStatuses") },
              ...["UPLOADED", "VALIDATED", "REJECTED"].map((k) => ({
                value: k,
                label: statusLabel(k),
              })),
            ]}
          />
          <Button
            variant="outline"
            size="md"
            onClick={() =>
              setFilters({ search: "", activity: "all", status: "all" })
            }
          >
            {t("common.reset")}
          </Button>
        </Toolbar>

        <DataPanel
          title={t("sg.documents")}
          subtitle={t("sg.operations")}
          badge={`${filtered.length} / ${documents.length}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {[
                    t("admin.documents.col.employee"),
                    t("admin.documents.col.activity"),
                    t("admin.documents.col.document"),
                    t("admin.documents.col.uploaded"),
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
                      {t("admin.documents.loading")}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      {t("admin.documents.emptyFiltered")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                    >
                      <td className="px-6 py-5">
                        <p className="text-[#0A0A0A] text-[14px] font-bold">
                          {d.user_first_name} {d.user_last_name}
                        </p>
                        <p className="text-[11px] font-mono tabular-nums text-[#737373] mt-1">
                          {t("admin.registrations.matricule", {
                            number: d.employee_number,
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[13px] font-semibold text-[#0A0A0A]">
                          {d.activity_title}
                        </p>
                        <p className="text-[11px] text-[#737373] mt-0.5 tabular-nums">
                          Session #{d.session_id}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[13px] font-semibold text-[#0A0A0A]">
                          {d.document_type || "—"}
                        </p>
                        <p className="text-[11px] text-[#737373] mt-0.5 break-all">
                          {d.file_name}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-[12px] tabular-nums text-[#525252]">
                        {formatDate(d.uploaded_at)}
                      </td>
                      <td className="px-6 py-5">
                        <StatusPill
                          tone={STATUS_TONE[d.status] || "neutral"}
                          label={statusLabel(d.status)}
                        />
                        {d.validation_comment && (
                          <p
                            className="text-[11px] text-[#737373] mt-2 max-w-[200px]"
                            title={d.validation_comment}
                          >
                            {d.validation_comment}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {d.status === "UPLOADED" ? (
                            <>
                              <Button
                                size="sm"
                                variant="dark"
                                onClick={() => handleValidate(d.id)}
                                disabled={actingOn === d.id}
                              >
                                {t("admin.documents.validate")}
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                  setComment("");
                                  setModal({
                                    open: true,
                                    type: "reject",
                                    id: d.id,
                                  });
                                }}
                                disabled={actingOn === d.id}
                              >
                                {t("admin.documents.reject")}
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleValidate(d.id)}
                              disabled={actingOn === d.id}
                            >
                              {t("admin.documents.revalidate")}
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

      <Modal
        open={modal.open && modal.type === "reject"}
        onClose={closeModal}
        title={t("admin.documents.rejectModal.title")}
        description={t("admin.documents.rejectModal.text")}
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
                ? t("admin.documents.rejectModal.rejecting")
                : t("admin.documents.rejectModal.confirm")}
            </Button>
          </>
        }
      >
        <TextArea
          label={t("sg.colReason")}
          value={comment}
          onChange={setComment}
          placeholder={t("admin.documents.rejectModal.placeholder")}
          rows={4}
          required
        />
      </Modal>
    </PageShell>
  );
}
