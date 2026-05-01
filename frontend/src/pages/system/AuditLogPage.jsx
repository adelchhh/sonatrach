import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const API_URL = "http://127.0.0.1:8000/api";

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/system/audit-logs`);
      const data = await res.json();
      setLogs(data.data || []);
    } catch (error) {
      console.error("Could not load audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();

    return (
      String(log.user || "").toLowerCase().includes(q) ||
      String(log.action || "").toLowerCase().includes(q) ||
      String(log.target || "").toLowerCase().includes(q) ||
      String(log.role || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#ED8D31] mb-2">
                System admin tools
              </p>

              <h1 className="text-[36px] font-extrabold text-[#2F343B]">
                Audit Log
              </h1>

              <p className="text-[#7A8088] text-sm mt-2 max-w-[700px]">
                Track system activity including role assignments, actions, and
                administrative operations.
              </p>
            </div>

            <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user, action, target, or role..."
                className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
              />
            </div>

            <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DC] flex justify-between items-center">
                <h2 className="text-[22px] font-bold text-[#2F343B]">
                  Activity History
                </h2>

                <span className="text-xs text-[#7A8088] font-semibold">
                  {filteredLogs.length} records
                </span>
              </div>

              {loading ? (
                <div className="p-6 text-sm text-[#7A8088]">
                  Loading audit logs...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs text-[#7A8088] uppercase">
                          Date
                        </th>
                        <th className="px-5 py-4 text-left text-xs text-[#7A8088] uppercase">
                          User
                        </th>
                        <th className="px-5 py-4 text-left text-xs text-[#7A8088] uppercase">
                          Role
                        </th>
                        <th className="px-5 py-4 text-left text-xs text-[#7A8088] uppercase">
                          Action
                        </th>
                        <th className="px-5 py-4 text-left text-xs text-[#7A8088] uppercase">
                          Target
                        </th>
                        <th className="px-5 py-4 text-left text-xs text-[#7A8088] uppercase">
                          Details
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="border-t border-[#E5E2DC]">
                          <td className="px-5 py-4 text-sm text-[#7A8088]">
                            {log.date || log.created_at || "-"}
                          </td>

                          <td className="px-5 py-4 text-sm text-[#2F343B] font-medium">
                            {log.user || "-"}
                          </td>

                          <td className="px-5 py-4 text-sm text-[#7A8088]">
                            {log.role || "-"}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-[#ED8D31]">
                            {log.action || "-"}
                          </td>

                          <td className="px-5 py-4 text-sm text-[#7A8088]">
                            {log.target || "-"}
                          </td>

                          <td className="px-5 py-4 text-sm text-[#7A8088]">
                            {log.details || "-"}
                          </td>
                        </tr>
                      ))}

                      {filteredLogs.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center py-10 text-sm text-[#7A8088]"
                          >
                            No records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}