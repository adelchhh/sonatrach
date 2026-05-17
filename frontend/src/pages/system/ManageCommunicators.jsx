import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { useT } from "../../i18n/LanguageContext";

const API_URL = "http://127.0.0.1:8000/api";

export default function ManageCommunicators() {
  const t = useT();
  const [communicators, setCommunicators] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [foundEmployee, setFoundEmployee] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCommunicators = async () => {
    try {
      const res = await fetch(`${API_URL}/system/roles/communicators`);
      const data = await res.json();
      setCommunicators(data.data || []);
    } catch (err) {
      console.error(err);
      setError(t("system.manageCommunicators.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunicators();
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
      const res = await fetch(`${API_URL}/system/users/${foundEmployee.id}/roles/communicator`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || t("system.manageCommunicators.errorAssign"));
        return;
      }
      setFoundEmployee(null);
      setSearchValue("");
      await loadCommunicators();
    } catch (err) {
      console.error(err);
      setError(t("system.manageCommunicators.errorAssign"));
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await fetch(`${API_URL}/system/users/${id}/roles/communicator`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || t("system.manageCommunicators.errorRemove"));
        return;
      }
      await loadCommunicators();
    } catch (err) {
      console.error(err);
      setError(t("system.manageCommunicators.errorRemove"));
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <p className="text-sm font-semibold text-[#ED8D31] mb-2">
              {t("system.adminTools")}
            </p>
            <h1 className="text-[36px] font-extrabold text-[#2F343B]">
              {t("system.manageCommunicators.title")}
            </h1>
            <p className="text-[#7A8088] text-sm mt-2">
              {t("system.manageCommunicators.subtitle")}
            </p>
          </div>

          <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
            <h2 className="text-[22px] font-bold text-[#2F343B] mb-4">
              {t("system.manageCommunicators.assignTitle")}
            </h2>

            <div className="flex gap-3">
              <input
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setFoundEmployee(null);
                  setError("");
                }}
                placeholder={t("system.manageCommunicators.searchPlaceholder")}
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
                {t("system.manageCommunicators.currentTitle")}
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
                  {communicators.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="px-5 py-4">{c.name} {c.first_name}</td>
                      <td className="px-5 py-4">{c.employee_number}</td>
                      <td className="px-5 py-4">{c.email}</td>
                      <td className="px-5 py-4">{c.active ? t("system.common.active") : t("system.common.inactive")}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleRemove(c.id)} className="text-red-500 font-semibold">
                          {t("system.common.remove")}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {communicators.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-400">
                        {t("system.manageCommunicators.emptyText")}
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
