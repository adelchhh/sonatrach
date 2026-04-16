import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const initialSites = [
  {
    id: 1,
    name: "Algiers Center",
    location: "Algiers",
    activities: 12,
    sessions: 18,
    status: "Active",
  },
  {
    id: 2,
    name: "Oran Leisure Site",
    location: "Oran",
    activities: 8,
    sessions: 11,
    status: "Active",
  },
  {
    id: 3,
    name: "Constantine Family Site",
    location: "Constantine",
    activities: 6,
    sessions: 9,
    status: "Active",
  },
  {
    id: 4,
    name: "Bejaia Coastal Site",
    location: "Bejaia",
    activities: 5,
    sessions: 7,
    status: "Inactive",
  },
];

export default function ManageSite() {
  const [sites, setSites] = useState(initialSites);
  const [form, setForm] = useState({
    name: "",
    location: "",
    status: "Active",
  });

  const handleAddSite = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.location.trim()) {
      alert("Please fill in site name and location.");
      return;
    }

    const newSite = {
      id: Date.now(),
      name: form.name,
      location: form.location,
      activities: 0,
      sessions: 0,
      status: form.status,
    };

    setSites((prev) => [newSite, ...prev]);
    setForm({
      name: "",
      location: "",
      status: "Active",
    });
  };

  const handleDeleteSite = (id) => {
    setSites((prev) => prev.filter((site) => site.id !== id));
  };

  const totalSites = sites.length;
  const activeSites = sites.filter((site) => site.status === "Active").length;
  const totalActivities = sites.reduce((sum, site) => sum + site.activities, 0);
  const totalSessions = sites.reduce((sum, site) => sum + site.sessions, 0);

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <p className="text-sm font-semibold text-[#ED8D31] mb-2">
                Admin tools
              </p>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                Manage Sites
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[720px] leading-[170%]">
                Manage the available sites used to organize activities and sessions.
                Add new sites, review activity distribution, and remove unused ones.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
                <p className="text-sm font-semibold text-[#7A8088] mb-2">Total sites</p>
                <p className="text-3xl font-extrabold text-[#2F343B]">{totalSites}</p>
              </div>

              <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
                <p className="text-sm font-semibold text-[#7A8088] mb-2">Active sites</p>
                <p className="text-3xl font-extrabold text-[#2F343B]">{activeSites}</p>
              </div>

              <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
                <p className="text-sm font-semibold text-[#7A8088] mb-2">Activities linked</p>
                <p className="text-3xl font-extrabold text-[#2F343B]">{totalActivities}</p>
              </div>

              <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
                <p className="text-sm font-semibold text-[#7A8088] mb-2">Sessions linked</p>
                <p className="text-3xl font-extrabold text-[#2F343B]">{totalSessions}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
              {/* Sites list */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E5E2DC]">
                  <h2 className="text-[22px] font-bold text-[#2F343B]">
                    Existing Sites
                  </h2>
                  <p className="text-sm text-[#7A8088] mt-1">
                    Review current sites and their linked activity volume.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="text-left bg-[#F9F8F6]">
                        <th className="px-6 py-4 text-xs font-semibold text-[#7A8088] uppercase tracking-wide">
                          Site
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-[#7A8088] uppercase tracking-wide">
                          Location
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-[#7A8088] uppercase tracking-wide">
                          Activities
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-[#7A8088] uppercase tracking-wide">
                          Sessions
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-[#7A8088] uppercase tracking-wide">
                          Status
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-[#7A8088] uppercase tracking-wide">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {sites.map((site) => (
                        <tr
                          key={site.id}
                          className="border-t border-[#E5E2DC] hover:bg-[#FCFBF9]"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-[#2F343B] text-sm">
                              {site.name}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-sm text-[#7A8088]">
                            {site.location}
                          </td>

                          <td className="px-6 py-4 text-sm text-[#2F343B] font-medium">
                            {site.activities}
                          </td>

                          <td className="px-6 py-4 text-sm text-[#2F343B] font-medium">
                            {site.sessions}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                site.status === "Active"
                                  ? "bg-[#D4F4DD] text-[#2D7A4A]"
                                  : "bg-[#F1F0EC] text-[#7A8088]"
                              }`}
                            >
                              {site.status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteSite(site.id)}
                              className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm font-medium text-[#C95454] hover:bg-[#FFF5F5] transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}

                      {sites.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-10 text-center text-sm text-[#7A8088]"
                          >
                            No sites available yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Add site form */}
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-6 h-fit">
                <h2 className="text-[22px] font-bold text-[#2F343B] mb-2">
                  Add New Site
                </h2>
                <p className="text-sm text-[#7A8088] mb-5 leading-[170%]">
                  Create a new site that can later be linked to activities, sessions,
                  and registration quotas.
                </p>

                <form onSubmit={handleAddSite} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                      Site name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Ex: Algiers Center"
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm text-[#2F343B] placeholder:text-[#7A8088] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, location: e.target.value }))
                      }
                      placeholder="Ex: Oran"
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm text-[#2F343B] placeholder:text-[#7A8088] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, status: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm text-[#2F343B] outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-3 rounded-[14px] bg-[#ED8D31] text-white font-semibold text-sm hover:bg-[#d97d26] transition-colors"
                  >
                    Add Site
                  </button>
                </form>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}