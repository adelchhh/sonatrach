import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const recentDraws = [
  {
    id: 1,
    activity: "Excursion à Djanet",
    session: "Session Autumn 2024",
    executedOn: "Sep 22, 2024, 09:14 AM",
    totalDrawn: "50 / 50",
    status: "Draft",
  },
  {
    id: 2,
    activity: "Vacances nature & détente",
    session: "Family Session A",
    executedOn: "Sep 20, 2024, 14:30 PM",
    totalDrawn: "120 / 120",
    status: "Published",
  },
  {
    id: 3,
    activity: "Thermal stay - Hammam Righa",
    session: "Reallocation Session",
    executedOn: "Sep 18, 2024, 10:05 AM",
    totalDrawn: "15 / 15",
    status: "Published",
  },
  {
    id: 4,
    activity: "Annual Corporate Retreat",
    session: "Main Session",
    executedOn: "Sep 10, 2024, 11:20 AM",
    totalDrawn: "300 / 300",
    status: "Published",
  },
];

export default function LaunchDraw() {
  const [activity, setActivity] = useState("Excursion à Djanet");
  const [session, setSession] = useState("Late Allocation Session (Sep 2024)");
  const [excludeRecent, setExcludeRecent] = useState(true);
  const [waitingList, setWaitingList] = useState(true);
  const [prioritizeFamilies, setPrioritizeFamilies] = useState(false);

  const handleExecute = () => {
    alert("Draw executed successfully.");
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-[38px] font-extrabold text-[#2F343B] leading-[110%]">
                Launch Draw
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 leading-[170%]">
                Select an activity and session to execute the random draw algorithm
                based on defined quotas and constraints.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_340px] gap-6">
              {/* Left side */}
              <div className="space-y-6">
                {/* Configuration */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[28px] font-bold text-[#2F343B]">
                      Draw Configuration
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Choose the target activity and review the applied rules before execution.
                    </p>
                  </div>

                  <div className="p-5 space-y-6">
                    <div className="space-y-4">
                      <Field label="Activity">
                        <select
                          value={activity}
                          onChange={(e) => setActivity(e.target.value)}
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                        >
                          <option>Excursion à Djanet</option>
                          <option>Vacances nature & détente</option>
                          <option>Thermal stay - Hammam Righa</option>
                        </select>
                      </Field>

                      <Field label="Session">
                        <select
                          value={session}
                          onChange={(e) => setSession(e.target.value)}
                          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                        >
                          <option>Late Allocation Session (Sep 2024)</option>
                          <option>Session Autumn 2024</option>
                          <option>Main Session</option>
                        </select>
                      </Field>
                    </div>

                    <div className="pt-4 border-t border-[#E5E2DC]">
                      <h3 className="text-sm font-semibold text-[#2F343B] mb-4">
                        Draw Rules & Constraints
                      </h3>

                      <div className="space-y-3">
                        <ToggleCard
                          title="Exclude recent participants"
                          desc="Automatically exclude employees who participated in a similar activity within the last 12 months."
                          checked={excludeRecent}
                          onChange={() => setExcludeRecent(!excludeRecent)}
                        />

                        <ToggleCard
                          title="Generate waiting list"
                          desc="Draw additional participants to build a waiting list (typically 20% of total quota)."
                          checked={waitingList}
                          onChange={() => setWaitingList(!waitingList)}
                        />

                        <ToggleCard
                          title="Prioritize employees with children"
                          desc="Increase the selection weight for employees registered with family dependents."
                          checked={prioritizeFamilies}
                          onChange={() => setPrioritizeFamilies(!prioritizeFamilies)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleExecute}
                        className="px-6 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                      >
                        Execute Algorithm
                      </button>
                    </div>
                  </div>
                </section>

                {/* Recent draws */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                    <div>
                      <h2 className="text-[28px] font-bold text-[#2F343B]">
                        Recent Draws
                      </h2>
                      <p className="text-sm text-[#7A8088] mt-1">
                        Latest algorithm executions across all activities and sessions.
                      </p>
                    </div>

                    <button className="px-4 py-2 rounded-[14px] border border-[#E5E2DC] text-sm font-medium text-[#2F343B] bg-white">
                      View full history
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-[#FBFAF8]">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Activity
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Session
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Executed On
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Total Drawn
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Status
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentDraws.map((draw) => (
                          <tr
                            key={draw.id}
                            className="border-t border-[#E5E2DC] align-top"
                          >
                            <td className="px-5 py-5 text-sm font-semibold text-[#2F343B]">
                              {draw.activity}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {draw.session}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {draw.executedOn}
                            </td>

                            <td className="px-5 py-5 text-sm font-medium text-[#2F343B]">
                              {draw.totalDrawn}
                            </td>

                            <td className="px-5 py-5">
                              <StatusBadge status={draw.status} />
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex gap-2">
                                <button className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] text-sm bg-white">
                                  View Results
                                </button>

                                {draw.status === "Draft" && (
                                  <button className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium">
                                    Publish
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* Right side */}
              <div className="space-y-5">
                {/* Session context */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[28px] font-bold text-[#2F343B]">
                    Session Context
                  </h3>
                  <p className="text-sm text-[#7A8088] mt-1 mb-5">
                    Pre-draw statistics for the selected session.
                  </p>

                  <div className="space-y-3">
                    <ContextRow label="Total Quota (Capacity)" value="50 places" />
                    <ContextRow label="Total Registrations" value="142 applicants" />
                    <ContextRow label="Eligible for Draw" value="128 applicants" />
                    <ContextRow label="Selection Rate" value="~39%" />
                  </div>

                  <div className="mt-4 rounded-[16px] bg-[#FBE7B9] p-4">
                    <p className="text-sm font-semibold text-[#8A5A00]">
                      This session is heavily overbooked.
                    </p>
                    <p className="text-xs text-[#8A5A00] mt-1 leading-[160%]">
                      The algorithm will strictly apply the quotas. Please review the constraints before executing.
                    </p>
                  </div>
                </section>

                {/* Guidelines */}
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[28px] font-bold text-[#2F343B]">
                    Draw Guidelines
                  </h3>
                  <p className="text-sm text-[#7A8088] mt-1 mb-4">
                    Best practices before running the algorithm.
                  </p>

                  <ul className="space-y-3 text-sm text-[#7A8088] leading-[170%] list-disc pl-5">
                    <li>Ensure all manual registrations and withdrawals are processed before launching.</li>
                    <li>Verify the total capacity and quota distribution for the session.</li>
                    <li>Once executed, results are generated in "Draft" state and must be manually published.</li>
                    <li>A draw can be reset and re-executed as long as it remains in Draft state.</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleCard({ title, desc, checked, onChange }) {
  return (
    <div className="rounded-[18px] border border-[#E5E2DC] bg-[#FBFAF8] p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[#2F343B]">{title}</p>
        <p className="text-xs text-[#7A8088] mt-1 leading-[160%]">{desc}</p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? "bg-[#ED8D31]" : "bg-[#E5E2DC]"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
            checked ? "left-5" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function ContextRow({ label, value }) {
  return (
    <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3 flex items-center justify-between">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B]">{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Draft: "bg-[#FFF4D6] text-[#B98900]",
    Published: "bg-[#D4F4DD] text-[#2D7A4A]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}