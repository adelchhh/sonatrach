import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../api";
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

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actionTone(action) {
  if (!action) return "neutral";
  if (
    action.includes("VALIDATED") ||
    action.includes("ACCEPTED") ||
    action.includes("PUBLISHED") ||
    action.includes("APPROVED")
  )
    return "success";
  if (
    action.includes("REJECTED") ||
    action.includes("DELETED") ||
    action.includes("ARCHIVED") ||
    action.includes("REMOVED")
  )
    return "danger";
  if (action.startsWith("DRAW")) return "accent";
  if (action.startsWith("ROLE")) return "info";
  if (action.startsWith("DOCUMENT")) return "warn";
  return "neutral";
}

export default function AuditLogPage() {
  const t = useT();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    action: "all",
    target: "all",
  });
  const [detailsModal, setDetailsModal] = useState({ open: false, log: null });

  const load = () => {
    setLoading(true);
    setPageError(null);
    apiGet("/api/system/audit-logs")
      .then((res) => setLogs(res.data || []))
      .catch((err) =>
        setPageError(err.message || "Impossible de charger le journal d'audit.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const actions = useMemo(() => {
    const set = new Set();
    logs.forEach((l) => l.action && set.add(l.action));
    return Array.from(set).sort();
  }, [logs]);

  const targets = useMemo(() => {
    const set = new Set();
    logs.forEach((l) => l.target_table && set.add(l.target_table));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return logs.filter((l) => {
      if (filters.action !== "all" && l.action !== filters.action) return false;
      if (filters.target !== "all" && l.target_table !== filters.target)
        return false;
      if (q) {
        const hay = [
          l.action,
          l.target_name,
          l.user_first_name,
          l.user_last_name,
          l.employee_number,
          l.ip_address,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, filters]);

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.systemAdmin")}
        title={t("sg.auditLog")}
        subtitle={t("sg.subAuditLog")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("sg.auditLog") },
        ]}
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        <StatBar>
          <StatCell label={t("sg.colAction")} value={logs.length} sub={t("sg.total")} />
          <StatCell label={t("sg.labelType")} value={actions.length} sub={t("sg.total")} accent={actions.length > 0} />
          <StatCell label={t("sg.colTarget")} value={targets.length} sub={t("sg.total")} />
          <StatCell
            label={t("sg.lastUpdate")}
            value={logs[0]?.action_date ? formatDateTime(logs[0].action_date) : "—"}
            sub={t("sg.colWhen")}
          />
        </StatBar>

        <Toolbar>
          <SearchInput
            value={filters.search}
            onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
            placeholder={t("sg.search")}
          />
          <SelectInput
            value={filters.action}
            onChange={(v) => setFilters((f) => ({ ...f, action: v }))}
            options={[
              { value: "all", label: t("sg.allTypes") },
              ...actions.map((a) => ({ value: a, label: a })),
            ]}
          />
          <SelectInput
            value={filters.target}
            onChange={(v) => setFilters((f) => ({ ...f, target: v }))}
            options={[
              { value: "all", label: t("sg.allTypes") },
              ...targets.map((tg) => ({ value: tg, label: tg })),
            ]}
          />
          <Button
            variant="outline"
            size="md"
            onClick={() =>
              setFilters({ search: "", action: "all", target: "all" })
            }
          >
            {t("sg.reset")}
          </Button>
        </Toolbar>

        <DataPanel
          title={t("sg.auditLog")}
          subtitle={t("sg.subAuditLog")}
          badge={`${filtered.length} / ${logs.length}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {[t("sg.colDate"), t("sg.colEmployee"), t("sg.colAction"), t("sg.colTarget"), "IP", t("sg.details")].map(
                    (h, i) => (
                      <th
                        key={i}
                        className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      {t("sg.loading")}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      {t("sg.emptyAuditLog")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => (
                    <tr
                      key={l.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                    >
                      <td className="px-6 py-4 text-[11px] tabular-nums uppercase tracking-wider text-[#525252] whitespace-nowrap">
                        {formatDateTime(l.action_date)}
                      </td>
                      <td className="px-6 py-4">
                        {l.user_first_name || l.user_last_name ? (
                          <>
                            <p className="text-[13px] font-bold text-[#0A0A0A]">
                              {l.user_first_name} {l.user_last_name}
                            </p>
                            <p className="text-[11px] font-mono tabular-nums text-[#737373] mt-0.5">
                              {l.employee_number}
                            </p>
                          </>
                        ) : (
                          <span className="text-[11px] text-[#A3A3A3] italic uppercase tracking-wider">
                            {t("sg.systemAdmin")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill tone={actionTone(l.action)} label={l.action} />
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#0A0A0A]">
                        {l.target_name || (
                          <span className="text-[#A3A3A3] italic">—</span>
                        )}
                        {l.target_table && (
                          <p className="text-[11px] uppercase tracking-wider text-[#737373] mt-0.5">
                            {l.target_table}
                            {l.target_id ? ` · #${l.target_id}` : ""}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[11px] font-mono tabular-nums text-[#737373] whitespace-nowrap">
                        {l.ip_address || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {l.details ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setDetailsModal({ open: true, log: l })
                            }
                          >
                            {t("sg.view")}
                          </Button>
                        ) : (
                          <span className="text-[11px] text-[#A3A3A3]">—</span>
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
        open={detailsModal.open && !!detailsModal.log}
        onClose={() => setDetailsModal({ open: false, log: null })}
        title={t("sg.details")}
        description={
          detailsModal.log
            ? `${detailsModal.log.action} · ${formatDateTime(detailsModal.log.action_date)}`
            : ""
        }
        width="lg"
        footer={
          <Button
            variant="outline"
            size="md"
            onClick={() => setDetailsModal({ open: false, log: null })}
          >
            {t("common.close")}
          </Button>
        }
      >
        {detailsModal.log && (
          <pre className="bg-[#0A0A0A] text-[#E5E5E5] p-4 text-[11px] font-mono leading-[1.6] overflow-x-auto">
            {JSON.stringify(detailsModal.log.details, null, 2)}
          </pre>
        )}
      </Modal>
    </PageShell>
  );
}
