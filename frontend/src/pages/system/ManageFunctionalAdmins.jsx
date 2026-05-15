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

export default function ManageFunctionalAdmins() {
  const t = useT();
  const [admins, setAdmins] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [foundEmployee, setFoundEmployee] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [removeModal, setRemoveModal] = useState({ open: false, id: null });

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/system/roles/functional-admins`);
      const data = await res.json();
      setAdmins(data.data || []);
    } catch (err) {
      setError("Impossible de charger les administrateurs.");
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
      setError("Saisissez un matricule ou un identifiant.");
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
        `${API_URL}/system/users/${foundEmployee.id}/roles/functional-admin`,
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
        `${API_URL}/system/users/${removeModal.id}/roles/functional-admin`,
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

  const activeCount = admins.filter((a) => a.active).length;

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.systemAdmin")}
        title="Administrateurs fonctionnels"
        subtitle="Recherchez un collaborateur par matricule et attribuez-lui le rôle d'administrateur fonctionnel."
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Administrateurs fonctionnels" },
        ]}
      />

      <PageBody>
        {error && (
          <Alert tone="danger" title={t("sg.error")}>
            {error}
          </Alert>
        )}

        <StatBar>
          <StatCell label="Total" value={admins.length} sub="Comptes attribués" />
          <StatCell label="Actifs" value={activeCount} sub="Connexions valides" accent={activeCount > 0} />
          <StatCell label="Inactifs" value={admins.length - activeCount} sub="Suspendus" />
        </StatBar>

        <DataPanel
          title="Attribuer le rôle"
          subtitle="Saisissez le matricule du collaborateur à promouvoir"
        >
          <div className="p-6 space-y-5">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <TextField
                  label="Matricule"
                  value={searchValue}
                  onChange={(v) => {
                    setSearchValue(v);
                    setFoundEmployee(null);
                    setError("");
                  }}
                  placeholder="ex : 002016"
                />
              </div>
              <Button variant="dark" size="md" onClick={handleSearch}>
                Rechercher
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
                  Attribuer le rôle
                </Button>
              </div>
            )}
          </div>
        </DataPanel>

        <DataPanel
          title="Administrateurs fonctionnels actuels"
          subtitle="Comptes disposant du rôle"
          badge={`${admins.length}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  {["Nom", "Matricule", "Email", "Statut", "Action"].map(
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
                      Chargement…
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                      Aucun administrateur fonctionnel.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
                    >
                      <td className="px-6 py-4 text-[14px] font-bold text-[#0A0A0A]">
                        {admin.first_name} {admin.name}
                      </td>
                      <td className="px-6 py-4 text-[12px] font-mono tabular-nums text-[#525252]">
                        {admin.employee_number}
                      </td>
                      <td className="px-6 py-4 text-[12px] text-[#525252]">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill
                          tone={admin.active ? "success" : "neutral"}
                          label={admin.active ? "Actif" : "Inactif"}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            setRemoveModal({ open: true, id: admin.id })
                          }
                        >
                          Retirer
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
        title="Retirer le rôle"
        description="Confirmer le retrait du rôle d'administrateur fonctionnel ?"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setRemoveModal({ open: false, id: null })}
            >
              Annuler
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
