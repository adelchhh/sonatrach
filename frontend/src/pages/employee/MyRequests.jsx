import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const initialRequests = [
  {
    id: 1,
    activity: "Omra",
    category: "Spiritual",
    session: "Winter Session 2024",
    submittedOn: "Sep 20, 2024",
    status: "Pending Draw",
    details:
      "Your request is submitted and waiting for the lottery draw. You will be notified once results are published.",
  },
  {
    id: 2,
    activity: "Bungalow Stay",
    category: "Family Stay",
    session: "Session A",
    submittedOn: "Sep 12, 2024",
    status: "Under Review",
    details:
      "Your application is under administrative review. Documents and eligibility checks are in progress.",
  },
  {
    id: 3,
    activity: "Camping",
    category: "Nature",
    session: "Autumn Session",
    submittedOn: "Aug 30, 2024",
    status: "Accepted",
    details:
      "Congratulations. Your request has been accepted and is awaiting your participation confirmation.",
  },
  {
    id: 4,
    activity: "Summer Camp",
    category: "Family",
    session: "Kids Session 2",
    submittedOn: "Aug 15, 2024",
    status: "Rejected",
    details:
      "Your request was not selected during the draw due to limited quota.",
  },
  {
    id: 5,
    activity: "Running",
    category: "Sport",
    session: "Community Run 2024",
    submittedOn: "Jul 21, 2024",
    status: "Confirmed",
    details:
      "Your participation is fully confirmed. No further action is required.",
  },
];

export default function MyRequests() {
  const [requests, setRequests] = useState(initialRequests);
  const [modal, setModal] = useState({
    open: false,
    type: null, // details | confirm | withdraw
    requestId: null,
  });

  const selectedRequest = requests.find((r) => r.id === modal.requestId);

  const pending = requests.filter((r) => r.status === "Pending Draw").length;
  const accepted = requests.filter((r) => r.status === "Accepted").length;
  const rejected = requests.filter((r) => r.status === "Rejected").length;
  const confirmed = requests.filter((r) => r.status === "Confirmed").length;

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      requestId: null,
    });
  };

  const handleConfirmParticipation = () => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === modal.requestId
          ? { ...request, status: "Confirmed" }
          : request
      )
    );
    closeModal();
  };

  const handleWithdrawRequest = () => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === modal.requestId
          ? { ...request, status: "Withdrawn" }
          : request
      )
    );
    closeModal();
  };

  return (
    <>
      <div className="flex h-screen bg-[#F7F7F5]">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopBar />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  My Requests
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Track all your activity applications, follow their status, and
                  review the latest updates for each request.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  title="Pending Draw"
                  value={pending}
                  subtitle="Requests waiting for the lottery"
                />
                <StatCard
                  title="Accepted"
                  value={accepted}
                  subtitle="Selected requests awaiting confirmation"
                />
                <StatCard
                  title="Rejected"
                  value={rejected}
                  subtitle="Requests not selected"
                />
                <StatCard
                  title="Confirmed"
                  value={confirmed}
                  subtitle="Participation fully confirmed"
                />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  Request History
                </h2>
                <p className="text-sm text-[#7A8088] mt-1 mb-4">
                  Search and filter your requests by activity, session, or status.
                </p>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Search activity..."
                    className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>All activities</option>
                  </select>

                  <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>All sessions</option>
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

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                  <div>
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      Requests List
                    </h2>
                    <p className="text-sm text-[#7A8088] mt-1">
                      Overview of your submitted requests and their current state.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                    {requests.length} requests
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Activity
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Category
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Session
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Submitted On
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
                      {requests.map((request) => (
                        <tr
                          key={request.id}
                          className="border-t border-[#E5E2DC] align-top"
                        >
                          <td className="px-5 py-5 font-semibold text-[#2F343B] text-sm">
                            {request.activity}
                          </td>

                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {request.category}
                          </td>

                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {request.session}
                          </td>

                          <td className="px-5 py-5 text-sm text-[#7A8088]">
                            {request.submittedOn}
                          </td>

                          <td className="px-5 py-5">
                            <StatusBadge status={request.status} />
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  setModal({
                                    open: true,
                                    type: "details",
                                    requestId: request.id,
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                              >
                                View details
                              </button>

                              {request.status === "Accepted" && (
                                <button
                                  onClick={() =>
                                    setModal({
                                      open: true,
                                      type: "confirm",
                                      requestId: request.id,
                                    })
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium"
                                >
                                  Confirm
                                </button>
                              )}

                              {request.status === "Pending Draw" && (
                                <button
                                  onClick={() =>
                                    setModal({
                                      open: true,
                                      type: "withdraw",
                                      requestId: request.id,
                                    })
                                  }
                                  className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                >
                                  Withdraw
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-5 py-4 border-t border-[#E5E2DC] flex items-center justify-between">
                  <p className="text-sm text-[#7A8088]">
                    Showing 1-{requests.length} of {requests.length} requests
                  </p>

                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-lg bg-[#ED8D31] text-white text-sm">
                      1
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      {modal.open && modal.type === "details" && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[500px] shadow-lg">
            <h2 className="text-xl font-bold text-[#2F343B] mb-4">
              Request Details
            </h2>

            <div className="space-y-3 mb-6">
              <DetailRow label="Activity" value={selectedRequest.activity} />
              <DetailRow label="Category" value={selectedRequest.category} />
              <DetailRow label="Session" value={selectedRequest.session} />
              <DetailRow label="Submitted On" value={selectedRequest.submittedOn} />
              <DetailRow label="Status" value={selectedRequest.status} />
            </div>

            <div className="rounded-[16px] bg-[#F9F8F6] p-4 mb-6">
              <p className="text-sm font-semibold text-[#2F343B] mb-2">Latest Update</p>
              <p className="text-sm text-[#7A8088] leading-[170%]">
                {selectedRequest.details}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.open && modal.type === "confirm" && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg">
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              Confirm Participation
            </h2>

            <p className="text-sm text-[#7A8088] mb-6">
              Are you sure you want to confirm your participation in{" "}
              <span className="font-semibold text-[#2F343B]">
                {selectedRequest.activity}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmParticipation}
                className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.open && modal.type === "withdraw" && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg">
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              Withdraw Request
            </h2>

            <p className="text-sm text-[#7A8088] mb-6">
              Are you sure you want to withdraw your request for{" "}
              <span className="font-semibold text-[#2F343B]">
                {selectedRequest.activity}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleWithdrawRequest}
                className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B]">{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Pending Draw": "bg-[#FFF4D6] text-[#B98900]",
    "Under Review": "bg-[#F1F0EC] text-[#7A8088]",
    Accepted: "bg-[#D4F4DD] text-[#2D7A4A]",
    Rejected: "bg-[#FFE4E4] text-[#C95454]",
    Confirmed: "bg-[#E8F4FF] text-[#2B6CB0]",
    Withdrawn: "bg-[#F1F0EC] text-[#7A8088]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}