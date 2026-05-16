import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../api";
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
  TextField,
} from "../../components/ui/Studio";

const API_URL = `${API_BASE_URL}/api`;
const ROLE_PATH = "communicator";
const ROLE_PATH_PLURAL = "communicators";

export default function ManageCommunicators() {
  const t = useT();
  const [users, setUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [foundEmployee, setFoundEmployee] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [removeModal, setRemoveModal] = useState({ open: false, id: null });

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/system/roles/${ROLE_PATH_PLURAL}`);
      const data = await res.json();
      setUsers(data.data || []);
    } catch {
      setError("Impossible de charger les communicants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = async () => {
    setError("");
    setFoundEmployee(null);
    if (!searchValue.trim()) {
      setError("Saisissez un matricule.");
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/system/employees/search?query=${searchValue}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Collaborateur introuvable.");
        return;
      }
      setFoundEmployee(data.data);
    } catch {
      setError("La recherche a échoué.");
    }
  };

  const handleAssign = async () => {
    if (!foundEmployee) return;
    try {
      const res = await fetch(
        `${API_URL}/system/users/${foundEmployee.id}/roles/${ROLE_PATH}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Attribution impossible.");
        return;
      }
      setFoundEmployee(null);
      setSearchValue("");
      await load();
    } catch {
      setError("Attribution impossible.");
    }
  };

  const handleRemove = async () => {
    try {
      const res = await fetch(
        `${API_URL}/system/users/${removeModal.id}/roles/${ROLE_PATH}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Retrait impossible.");
        return;
      }
      setRemoveModal({ open: false, id: null });
      await load();
    } catch {
      setError("Retrait impossible.");
    }
  };

  const activeCount = users.filter((u) => u.active).length;

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.systemAdmin")}
        title={t("sg.communicators")}
        subtitle={t("sg.subSystemAdminCom")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("sg.communicators") },
        ]}
      />

      <PageBody>
        {error && (
          <Alert tone="danger" title={t("sg.error")}>
            {error}
          </Alert>
        )}

        <StatBar>
          <StatCell label={t("sg.total")} value={users.length} sub={t("sg.total")} />
          <StatCell label={t("sg.active")} value={activeCount} sub={t("sg.subActive")} accent={activeCount > 0} />
          <StatCell label={t("sg.inactive")} value={users.length - activeCount} sub={t("sg.subInactive")} />
        </StatBar>

        <DataPanel
          title={t("sg.approve")}
          subtitle={t("sg.colMatricule")}
        >
          <div className="p-6 space-y-5">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <TextField
                  label={t("sg.colMatricule")}
                  value={searchValue}
                  onChange={(v) => {
                    setSearchValue(v);
                    setFoundEmployee(null);
                    setError("");
                  }}
                  placeholder="ex : 002017"
                />
              </div>
              <Button variant="dark" size="md" onClick={handleSearch}>
                {t("common.search")}
              </Button>
            </div>

            {foundEmployee && (
              <div className="bg-[#FFF7E8] border border-[#ED8D31] p-4 flex justify-between items-center gap-4">
                <div>
                  <p className="text-[14px] font-bold text-[#0A0A0A]">
                    {foundEmployee.first_name} {foundEmployee.name}
                  </p>
                  <p className="text-[11px] text-[#737373] mt-1 tabular-nums">
                    Matricule {foundEmployee.employee_number} · {foundEmployee.email}
                  </p>
                </div>
                <Button variant="primary" size="md" onClick={handleAssign}>
                  {t("sg.approve")}
                </Button>
              </div>
            )}
          </div>
        </DataPanel>

        <DataPanel
          title={t("sg.communicators")}
          subtitle={t("sg.communicators")}
          badge={`${users.length}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {[t("sg.colEmployee"), t("sg.colMatricule"), t("sg.colEmail"), t("sg.colStatus"), t("sg.colAction")].map(
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
                    <td colSpan={5} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      {t("sg.loading")}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      {t("sg.emptyUsers")}
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
                    >
                      <td className="px-6 py-4 text-[14px] font-bold text-[#0A0A0A]">
                        {u.first_name} {u.name}
                      </td>
                      <td className="px-6 py-4 text-[12px] font-mono tabular-nums text-[#525252]">
                        {u.employee_number}
                      </td>
                      <td className="px-6 py-4 text-[12px] text-[#525252]">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill
                          tone={u.active ? "success" : "neutral"}
                          label={u.active ? t("sg.active") : t("sg.inactive")}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            setRemoveModal({ open: true, id: u.id })
                          }
                        >
                          {t("sg.remove")}
                        </Button>
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
        open={removeModal.open}
        onClose={() => setRemoveModal({ open: false, id: null })}
        title={t("sg.remove")}
        description={t("sg.confirmReason")}
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setRemoveModal({ open: false, id: null })}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="danger" size="md" onClick={handleRemove}>
              Retirer
            </Button>
          </>
        }
      />
    </PageShell>
  );
}
