import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const documents = [
  {
    id: 1,
    activity: "Omra",
    session: "Winter Session 2024",
    document: "Passport Copy",
    deadline: "Nov 05, 2024",
    status: "Missing",
  },
  {
    id: 2,
    activity: "Omra",
    session: "Winter Session 2024",
    document: "Medical Certificate",
    deadline: "Nov 05, 2024",
    status: "Uploaded",
  },
  {
    id: 3,
    activity: "Summer Camp",
    session: "Kids Session 2",
    document: "Family Record Book",
    deadline: "Sep 01, 2024",
    status: "Validated",
  },
  {
    id: 4,
    activity: "Camping",
    session: "Autumn Session",
    document: "ID Copy",
    deadline: "Oct 02, 2024",
    status: "Rejected",
  },
];

export default function Documents() {
  const missing = documents.filter((d) => d.status === "Missing").length;
  const uploaded = documents.filter((d) => d.status === "Uploaded").length;
  const validated = documents.filter((d) => d.status === "Validated").length;
  const rejected = documents.filter((d) => d.status === "Rejected").length;

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                Documents
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                Upload and track the required documents for your selected
                activities and sessions.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Missing"
                value={missing}
                subtitle="Documents still required"
              />
              <StatCard
                title="Uploaded"
                value={uploaded}
                subtitle="Waiting for admin review"
              />
              <StatCard
                title="Validated"
                value={validated}
                subtitle="Approved documents"
              />
              <StatCard
                title="Rejected"
                value={rejected}
                subtitle="Need re-upload"
              />
            </div>

            {/* Filters */}
            <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
              <h2 className="text-[24px] font-bold text-[#2F343B]">
                Required Documents
              </h2>
              <p className="text-sm text-[#7A8088] mt-1 mb-4">
                Review your document requirements by activity and session.
              </p>

              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Search activity or document..."
                  className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                />

                <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                  <option>All activities</option>
                </select>

                <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                  <option>All status</option>
                </select>

                <button className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B]">
                  Reset
                </button>

                <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold">
                  Apply filters
                </button>
              </div>
            </section>

            {/* Table */}
            <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                <div>
                  <h2 className="text-[24px] font-bold text-[#2F343B]">
                    Documents List
                  </h2>
                  <p className="text-sm text-[#7A8088] mt-1">
                    Keep track of uploads, deadlines, and validation results.
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                  {documents.length} documents
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead className="bg-[#FBFAF8]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Activity
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Session
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Document
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                        Deadline
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
                    {documents.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-[#E5E2DC] align-top"
                      >
                        <td className="px-5 py-5 font-semibold text-[#2F343B] text-sm">
                          {item.activity}
                        </td>

                        <td className="px-5 py-5 text-sm text-[#7A8088]">
                          {item.session}
                        </td>

                        <td className="px-5 py-5 text-sm text-[#2F343B]">
                          {item.document}
                        </td>

                        <td className="px-5 py-5 text-sm text-[#7A8088]">
                          {item.deadline}
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex flex-wrap gap-2">
                            {(item.status === "Missing" || item.status === "Rejected") && (
                              <button className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium">
                                Upload
                              </button>
                            )}

                            {item.status === "Uploaded" && (
                              <span className="text-sm text-[#7A8088]">
                                Awaiting review
                              </span>
                            )}

                            {item.status === "Validated" && (
                              <span className="text-sm text-[#2D7A4A] font-semibold">
                                Approved
                              </span>
                            )}

                            <button className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm">
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{title}</p>
      <p className="text-3xl font-extrabold text-[#2F343B] mt-2">{value}</p>
      <p className="text-xs text-[#7A8088] mt-2">{subtitle}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Missing: "bg-[#FFF4D6] text-[#B98900]",
    Uploaded: "bg-[#F1F0EC] text-[#7A8088]",
    Validated: "bg-[#D4F4DD] text-[#2D7A4A]",
    Rejected: "bg-[#FFE4E4] text-[#C95454]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}