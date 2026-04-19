import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const initialDocuments = [
  {
    id: 1,
    activity: "Omra",
    session: "Winter Session 2024",
    document: "Passport Copy",
    deadline: "Nov 05, 2024",
    status: "Missing",
    fileName: "",
    note: "This document is required to validate your travel eligibility.",
  },
  {
    id: 2,
    activity: "Omra",
    session: "Winter Session 2024",
    document: "Medical Certificate",
    deadline: "Nov 05, 2024",
    status: "Uploaded",
    fileName: "medical_certificate.pdf",
    note: "Uploaded successfully and waiting for admin review.",
  },
  {
    id: 3,
    activity: "Summer Camp",
    session: "Kids Session 2",
    document: "Family Record Book",
    deadline: "Sep 01, 2024",
    status: "Validated",
    fileName: "family_record_book.pdf",
    note: "Document approved.",
  },
  {
    id: 4,
    activity: "Camping",
    session: "Autumn Session",
    document: "ID Copy",
    deadline: "Oct 02, 2024",
    status: "Rejected",
    fileName: "id_copy_old.jpg",
    note: "The uploaded file was not clear. Please upload a better version.",
  },
];

export default function Documents() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [modal, setModal] = useState({
    open: false,
    type: null, // upload | details
    documentId: null,
  });
  const [selectedFile, setSelectedFile] = useState("");

  const selectedDoc = documents.find((d) => d.id === modal.documentId);

  const missing = documents.filter((d) => d.status === "Missing").length;
  const uploaded = documents.filter((d) => d.status === "Uploaded").length;
  const validated = documents.filter((d) => d.status === "Validated").length;
  const rejected = documents.filter((d) => d.status === "Rejected").length;

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      documentId: null,
    });
    setSelectedFile("");
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedDoc) return;

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === modal.documentId
          ? {
              ...doc,
              status: "Uploaded",
              fileName: selectedFile,
              note: "Uploaded successfully and waiting for admin review.",
            }
          : doc
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
                  Documents
                </h1>
                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  Upload and track the required documents for your selected
                  activities and sessions.
                </p>
              </div>

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
                              {(item.status === "Missing" ||
                                item.status === "Rejected") && (
                                <button
                                  onClick={() =>
                                    setModal({
                                      open: true,
                                      type: "upload",
                                      documentId: item.id,
                                    })
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium"
                                >
                                  Upload
                                </button>
                              )}

                              {item.status === "Uploaded" && (
                                <span className="text-sm text-[#7A8088] flex items-center">
                                  Awaiting review
                                </span>
                              )}

                              {item.status === "Validated" && (
                                <span className="text-sm text-[#2D7A4A] font-semibold flex items-center">
                                  Approved
                                </span>
                              )}

                              <button
                                onClick={() =>
                                  setModal({
                                    open: true,
                                    type: "details",
                                    documentId: item.id,
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                              >
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

      {modal.open && modal.type === "upload" && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[460px] shadow-lg">
            <h2 className="text-xl font-bold text-[#2F343B] mb-3">
              Upload Document
            </h2>

            <p className="text-sm text-[#7A8088] mb-4">
              Upload your document for{" "}
              <span className="font-semibold text-[#2F343B]">
                {selectedDoc.document}
              </span>
              .
            </p>

            <div className="space-y-3 mb-6">
              <DetailRow label="Activity" value={selectedDoc.activity} />
              <DetailRow label="Session" value={selectedDoc.session} />
              <DetailRow label="Deadline" value={selectedDoc.deadline} />
            </div>

            <div className="rounded-[16px] border border-dashed border-[#D9D5CE] bg-[#FBFAF8] p-5 mb-6">
              <label className="block text-sm font-semibold text-[#2F343B] mb-3">
                Choose file
              </label>

              <input
                type="file"
                onChange={(e) =>
                  setSelectedFile(e.target.files?.[0]?.name || "")
                }
                className="w-full text-sm text-[#7A8088]"
              />

              {selectedFile && (
                <p className="text-sm text-[#2F343B] mt-3">
                  Selected file:{" "}
                  <span className="font-semibold">{selectedFile}</span>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleUpload}
                className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-medium"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.open && modal.type === "details" && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[500px] shadow-lg">
            <h2 className="text-xl font-bold text-[#2F343B] mb-4">
              Document Details
            </h2>

            <div className="space-y-3 mb-6">
              <DetailRow label="Activity" value={selectedDoc.activity} />
              <DetailRow label="Session" value={selectedDoc.session} />
              <DetailRow label="Document" value={selectedDoc.document} />
              <DetailRow label="Deadline" value={selectedDoc.deadline} />
              <DetailRow label="Status" value={selectedDoc.status} />
              <DetailRow
                label="File"
                value={selectedDoc.fileName || "No file uploaded yet"}
              />
            </div>

            <div className="rounded-[16px] bg-[#F9F8F6] p-4 mb-6">
              <p className="text-sm font-semibold text-[#2F343B] mb-2">
                Note
              </p>
              <p className="text-sm text-[#7A8088] leading-[170%]">
                {selectedDoc.note}
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
    <div className="flex justify-between bg-[#F9F8F6] px-4 py-3 rounded-[14px] gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B] text-right">
        {value}
      </span>
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
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}