import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const API_URL = "http://127.0.0.1:8000/api";

export default function ManageFunctionalAdmins() {
  const [functionalAdmins, setFunctionalAdmins] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [foundEmployee, setFoundEmployee] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadFunctionalAdmins = async () => {
    try {
      const res = await fetch(`${API_URL}/system/roles/functional-admins`);
      const data = await res.json();
      setFunctionalAdmins(data.data || []);
    } catch (err) {
      console.error(err);
      setError("Could not load functional admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunctionalAdmins();
  }, []);

  const handleSearch = async () => {
    setError("");
    setFoundEmployee(null);

    if (!searchValue.trim()) {
      setError("Please enter employee number or user ID");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/system/employees/search?query=${searchValue}`
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Employee not found");
        return;
      }

      setFoundEmployee(data.data);
    } catch (err) {
      console.error(err);
      setError("Search failed");
    }
  };

  const handleAssign = async () => {
    if (!foundEmployee) return;

    try {
      const res = await fetch(
        `${API_URL}/system/users/${foundEmployee.id}/roles/functional-admin`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not assign role");
        return;
      }

      setFoundEmployee(null);
      setSearchValue("");
      await loadFunctionalAdmins();
    } catch (err) {
      console.error(err);
      setError("Could not assign role");
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await fetch(
        `${API_URL}/system/users/${id}/roles/functional-admin`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not remove role");
        return;
      }

      await loadFunctionalAdmins();
    } catch (err) {
      console.error(err);
      setError("Could not remove role");
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
              System admin tools
            </p>

            <h1 className="text-[36px] font-extrabold text-[#2F343B]">
              Manage Functional Admins
            </h1>

            <p className="text-[#7A8088] text-sm mt-2">
              Search an employee by employee number or user ID and assign the Functional Admin role.
            </p>
          </div>

          <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
            <h2 className="text-[22px] font-bold text-[#2F343B] mb-4">
              Assign Functional Admin Role
            </h2>

            <div className="flex gap-3">
              <input
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setFoundEmployee(null);
                  setError("");
                }}
                placeholder="Enter employee number, e.g. 002016"
                className="flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none"
              />

              <button
                onClick={handleSearch}
                className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white hover:bg-[#F7F7F5]"
              >
                Search
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

                <button
                  onClick={handleAssign}
                  className="px-4 py-2 bg-[#ED8D31] text-white rounded-[10px]"
                >
                  Add Role
                </button>
              </div>
            )}
          </section>

          <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="font-bold text-lg text-[#2F343B]">
                Current Functional Admins
              </h2>
            </div>

            {loading ? (
              <div className="p-6 text-[#7A8088]">Loading...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#FBFAF8] text-xs text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Name</th>
                    <th className="px-5 py-3 text-left">Employee Number</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {functionalAdmins.map((admin) => (
                    <tr key={admin.id} className="border-t">
                      <td className="px-5 py-4">
                        {admin.name} {admin.first_name}
                      </td>
                      <td className="px-5 py-4">
                        {admin.employee_number}
                      </td>
                      <td className="px-5 py-4">{admin.email}</td>
                      <td className="px-5 py-4">
                        {admin.active ? "Active" : "Inactive"}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleRemove(admin.id)}
                          className="text-red-500 font-semibold"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}

                  {functionalAdmins.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-400">
                        No functional admins yet
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