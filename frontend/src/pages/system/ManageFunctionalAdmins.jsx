import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { useT } from "../../i18n/LanguageContext";

const API_URL = "http://127.0.0.1:8000/api";

export default function ManageFunctionalAdmins() {
  const t = useT();
  const [admins, setAdmins] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [foundEmployee, setFoundEmployee] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAdmins = async () => {
    try {
      const res = await fetch(`${API_URL}/system/roles/functional-admins`);
      const data = await res.json();
      setAdmins(data.data || []);
    } catch (err) {
      console.error(err);
      setError(t("system.manageFunctionalAdmins.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleSearch = async () => {
    setError("");
    setFoundEmployee(null);

    if (!searchValue.trim()) {
      setError(t("system.common.emptySearch"));
      return;
    }

    try {
      const res = await fetch(`${API_URL}/system/employees/search?query=${searchValue}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || t("system.common.notFound"));
        return;
      }
      setFoundEmployee(data.data);
    } catch (err) {
      console.error(err);
      setError(t("system.common.searchFailed"));
    }
  };

  const handleAssign = async () => {
    if (!foundEmployee) return;
    try {
      const res = await fetch(`${API_URL}/system/users/${foundEmployee.id}/roles/functional-admin`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || t("system.manageFunctionalAdmins.errorAssign"));
        return;
      }
      setFoundEmployee(null);
      setSearchValue("");
      await loadAdmins();
    } catch (err) {
      console.error(err);
      setError(t("system.manageFunctionalAdmins.errorAssign"));
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await fetch(`${API_URL}/system/users/${id}/roles/functional-admin`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || t("system.manageFunctionalAdmins.errorRemove"));
        return;
      }
      await loadAdmins();
    } catch (err) {
      console.error(err);
      setError(t("system.manageFunctionalAdmins.errorRemove"));
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <p className="text-sm font-semibold text-[#ED8D31] mb-2">{t("system.adminTools")}</p>
            <h1 className="text-[36px] font-extrabold text-[#2F343B]">
              {t("system.manageFunctionalAdmins.title")}
            </h1>
            <p className="text-[#7A8088] text-sm mt-2">
              {t("system.manageFunctionalAdmins.subtitle")}
            </p>
          </div>

          <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
            <h2 className="text-[22px] font-bold text-[#2F343B] mb-4">
              {t("system.manageFunctionalAdmins.assignTitle")}
            </h2>

            <div className="flex gap-3">
              <input
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setFoundEmployee(null);
                  setError("");
                }}
                placeholder={t("system.manageFunctionalAdmins.searchPlaceholder")}
                className="flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none"
              />
              <button onClick={handleSearch} className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white hover:bg-[#F7F7F5]">
                {t("system.common.search")}
              </button>
            </div>

            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

            {foundEmployee && (
              <div className="mt-4 flex justify-between items-center border border-[#E5E2DC] bg-[#FBFAF8] p-4 rounded-[14px]">
                <div>
                  <p className="font-semibold text-[#2F343B]">
                    {foundEmployee.name} {foundEmployee.first_name}
                  </p>
                  <p className="text-xs text-[#7A8088]">
                    {foundEmployee.employee_number} · {foundEmployee.email}
                  </p>
                </div>
                <button onClick={handleAssign} className="px-4 py-2 bg-[#ED8D31] text-white rounded-[10px]">
                  {t("system.common.addRole")}
                </button>
              </div>
            )}
          </section>

          <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="font-bold text-lg text-[#2F343B]">
                {t("system.manageFunctionalAdmins.currentTitle")}
              </h2>
            </div>

            {loading ? (
              <div className="p-6 text-[#7A8088]">{t("communicator.common.loading")}</div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#FBFAF8] text-xs text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">{t("system.common.name")}</th>
                    <th className="px-5 py-3 text-left">{t("system.common.employeeNumber")}</th>
                    <th className="px-5 py-3 text-left">{t("system.common.email")}</th>
                    <th className="px-5 py-3 text-left">{t("system.common.status")}</th>
                    <th className="px-5 py-3 text-left">{t("system.common.action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="px-5 py-4">{a.name} {a.first_name}</td>
                      <td className="px-5 py-4">{a.employee_number}</td>
                      <td className="px-5 py-4">{a.email}</td>
                      <td className="px-5 py-4">{a.active ? t("system.common.active") : t("system.common.inactive")}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleRemove(a.id)} className="text-red-500 font-semibold">
                          {t("system.common.remove")}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-400">
                        {t("system.manageFunctionalAdmins.emptyText")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
