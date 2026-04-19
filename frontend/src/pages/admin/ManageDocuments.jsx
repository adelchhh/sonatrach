import { useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";

const initialDocuments = [
  {
    id: 1,
    employee: "Yacine Bensaïd",
    employeeId: "EMP-2041",
    activity: "Omra",
    session: "Winter Session 2024",
    documentName: "Passport Copy",
    uploadedOn: "Oct 12, 2024",
    status: "Uploaded",
    fileName: "passport_yacine.pdf",
    note: "",
  },
  {
    id: 2,
    employee: "Nadia Meziane",
    employeeId: "EMP-1987",
    activity: "Omra",
    session: "Winter Session 2024",
    documentName: "Medical Certificate",
    uploadedOn: "Oct 11, 2024",
    status: "Validated",
    fileName: "medical_nadia.pdf",
    note: "Valid medical certificate.",
  },
  {
    id: 3,
    employee: "Karim Touati",
    employeeId: "EMP-1763",
    activity: "Summer Camp",
    session: "Kids Session 2",
    documentName: "Family Book",
    uploadedOn: "Oct 09, 2024",
    status: "Rejected",
    fileName: "family_book_karim.jpg",
    note: "Uploaded copy is unclear. Please provide a clearer scan.",
  },
  {
    id: 4,
    employee: "Samira Ghezali",
    employeeId: "EMP-2210",
    activity: "Excursion à Djanet",
    session: "Session A",
    documentName: "ID Copy",
    uploadedOn: "Oct 08, 2024",
    status: "Uploaded",
    fileName: "id_samira.pdf",
    note: "",
  },
  {
    id: 5,
    employee: "Rania Belkacem",
    employeeId: "EMP-2334",
    activity: "Thermal Stay",
    session: "Session B",
    documentName: "Medical Certificate",
    uploadedOn: "Oct 07, 2024",
    status: "Uploaded",
    fileName: "medical_rania.pdf",
    note: "",
  },
];

export default function ManageDocuments() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedId, setSelectedId] = useState(initialDocuments[0]?.id ?? null);
  const [rejectReason, setRejectReason] = useState("");

  const [modal, setModal] = useState({
    open: false,
    type: null, // details | validate | reject | export
    documentId: null,
  });

  const selectedDocument =
    documents.find((doc) => doc.id === (modal.documentId ?? selectedId)) || null;

  const totalDocuments = documents.length;
  const uploadedCount = documents.filter((d) => d.status === "Uploaded").length;
  const validatedCount = documents.filter((d) => d.status === "Validated").length;
  const rejectedCount = documents.filter((d) => d.status === "Rejected").length;

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      documentId: null,
    });
    setRejectReason("");
  };

  const openModal = (type, documentId = selectedId) => {
    setModal({
      open: true,
      type,
      documentId,
    });
  };

  const handleValidate = (id) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? { ...doc, status: "Validated", note: "Document approved." }
          : doc
      )
    );
    closeModal();
  };

  const handleReject = (id) => {
    if (!rejectReason.trim()) return;

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? { ...doc, status: "Rejected", note: rejectReason }
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
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#ED8D31] mb-2">
                    Admin tools
                  </p>
                  <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                    Manage Documents
                  </h1>
                  <p className="text-[#7A8088] text-sm mt-2 max-w-[780px] leading-[170%]">
                    Review uploaded employee documents, validate or reject them,
                    and ensure all required files are ready before final confirmation.
                  </p>
                </div>

                <button
                  onClick={() => openModal("export")}
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors"
                >
                  Export Documents
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  title="Total Documents"
                  value={totalDocuments}
                  subtitle="All uploaded documents"
                />
                <StatCard
                  title="Pending Review"
                  value={uploadedCount}
                  subtitle="Documents waiting for validation"
                />
                <StatCard
                  title="Validated"
                  value={validatedCount}
                  subtitle="Approved by admin"
                />
                <StatCard
                  title="Rejected"
                  value={rejectedCount}
                  subtitle="Require re-upload"
                />
              </div>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  Documents Filters
                </h2>
                <p className="text-sm text-[#7A8088] mt-1 mb-4">
                  Search by employee or filter by activity, session, or document status.
                </p>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Search by employee name or ID"
                    className="min-w-[220px] flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                  />

                  <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>All activities</option>
                  </select>

                  <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>All sessions</option>
                  </select>

                  <select className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none">
                    <option>All statuses</option>
                  </select>

                  <button className="px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-sm font-medium text-[#2F343B]">
                    Reset filters
                  </button>

                  <button className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold">
                    Apply filters
                  </button>
                </div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
                    <div>
                      <h3 className="text-[24px] font-bold text-[#2F343B]">
                        Uploaded Documents
                      </h3>
                      <p className="text-sm text-[#7A8088] mt-1">
                        Review each uploaded file and validate or reject it.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#F1F0EC] text-[#7A8088] text-xs font-semibold">
                      {documents.length} entries
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px]">
                      <thead className="bg-[#FBFAF8]">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                            Employee
                          </th>
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
                            Uploaded On
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
                            className={`border-t border-[#E5E2DC] align-top ${
                              selectedId === item.id ? "bg-[#FCFBF9]" : ""
                            }`}
                          >
                            <td className="px-5 py-5">
                              <button
                                onClick={() => setSelectedId(item.id)}
                                className="text-left"
                              >
                                <p className="font-semibold text-[#2F343B] text-sm">
                                  {item.employee}
                                </p>
                                <p className="text-xs text-[#7A8088] mt-1">
                                  {item.employeeId}
                                </p>
                              </button>
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {item.activity}
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {item.session}
                            </td>

                            <td className="px-5 py-5">
                              <p className="font-semibold text-[#2F343B] text-sm">
                                {item.documentName}
                              </p>
                              <p className="text-xs text-[#7A8088] mt-1">
                                {item.fileName}
                              </p>
                            </td>

                            <td className="px-5 py-5 text-sm text-[#7A8088]">
                              {item.uploadedOn}
                            </td>

                            <td className="px-5 py-5">
                              <StatusBadge status={item.status} />
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => openModal("details", item.id)}
                                  className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#2F343B] text-sm"
                                >
                                  View
                                </button>

                                {item.status === "Uploaded" && (
                                  <>
                                    <button
                                      onClick={() => openModal("validate", item.id)}
                                      className="px-3 py-1.5 rounded-lg bg-[#ED8D31] text-white text-sm font-medium"
                                    >
                                      Validate
                                    </button>

                                    <button
                                      onClick={() => openModal("reject", item.id)}
                                      className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white text-[#C95454] text-sm"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}

                        {documents.length === 0 && (
                          <tr>
                            <td
                              colSpan="7"
                              className="px-5 py-10 text-center text-sm text-[#7A8088]"
                            >
                              No documents available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <div className="space-y-5">
                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Status summary
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1 mb-4">
                      Current distribution of document review states.
                    </p>

                    <div className="space-y-3">
                      <SummaryRow label="Uploaded" value={uploadedCount} />
                      <SummaryRow label="Validated" value={validatedCount} />
                      <SummaryRow label="Rejected" value={rejectedCount} />
                    </div>
                  </section>

                  <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      Selected document
                    </h3>
                    <p className="text-sm text-[#7A8088] mt-1 mb-4">
                      Quick summary of the currently selected document.
                    </p>

                    {selectedDocument && (
                      <div className="space-y-3">
                        <SummaryRow label="Employee" value={selectedDocument.employee} />
                        <SummaryRow label="Activity" value={selectedDocument.activity} />
                        <SummaryRow label="Document" value={selectedDocument.documentName} />
                        <SummaryRow label="Status" value={selectedDocument.status} />
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {modal.open && modal.type === "details" && selectedDocument && (
        <ModalShell title="Document Details" onClose={closeModal}>
          <DetailRow label="Employee" value={selectedDocument.employee} />
          <DetailRow label="Employee ID" value={selectedDocument.employeeId} />
          <DetailRow label="Activity" value={selectedDocument.activity} />
          <DetailRow label="Session" value={selectedDocument.session} />
          <DetailRow label="Document" value={selectedDocument.documentName} />
          <DetailRow label="File" value={selectedDocument.fileName} />
          <DetailRow label="Uploaded On" value={selectedDocument.uploadedOn} />
          <DetailRow label="Status" value={selectedDocument.status} />

          <div className="rounded-[14px] bg-[#F9F8F6] px-4 py-3">
            <p className="text-sm font-semibold text-[#2F343B] mb-2">Review Note</p>
            <p className="text-sm text-[#7A8088] leading-[170%]">
              {selectedDocument.note || "No review note yet."}
            </p>
          </div>
        </ModalShell>
      )}

      {modal.open && modal.type === "validate" && selectedDocument && (
        <ConfirmModal
          title="Validate Document"
          message={`Validate ${selectedDocument.documentName} for ${selectedDocument.employee}?`}
          confirmLabel="Validate"
          onCancel={closeModal}
          onConfirm={() => handleValidate(selectedDocument.id)}
        />
      )}

      {modal.open && modal.type === "reject" && selectedDocument && (
        <RejectModal
          title="Reject Document"
          reason={rejectReason}
          setReason={setRejectReason}
          onCancel={closeModal}
          onConfirm={() => handleReject(selectedDocument.id)}
        />
      )}

      {modal.open && modal.type === "export" && (
        <ConfirmModal
          title="Export Documents"
          message="Do you want to export the current documents list?"
          confirmLabel="Export"
          onCancel={closeModal}
          onConfirm={closeModal}
        />
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

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3 gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-bold text-[#2F343B] text-right">{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Uploaded: "bg-[#FFF4D6] text-[#B98900]",
    Validated: "bg-[#D4F4DD] text-[#2D7A4A]",
    Rejected: "bg-[#FFE4E4] text-[#C95454]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[520px] shadow-lg">
        <h2 className="text-xl font-bold text-[#2F343B] mb-4">{title}</h2>
        <div className="space-y-3 mb-6">{children}</div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[12px] border border-[#E5E2DC]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-lg">
        <h2 className="text-xl font-bold text-[#2F343B] mb-3">{title}</h2>
        <p className="text-sm text-[#7A8088] mb-6 leading-[170%]">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-[12px] bg-[#ED8D31] text-white text-sm font-medium"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({
  title,
  reason,
  setReason,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[460px] shadow-lg">
        <h2 className="text-xl font-bold text-[#2F343B] mb-3">{title}</h2>

        <p className="text-sm text-[#7A8088] mb-4 leading-[170%]">
          Add a rejection note so the employee knows what to correct before re-uploading.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={5}
          placeholder="Ex: The uploaded file is unclear or incomplete..."
          className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none resize-none mb-6"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-[12px] border border-[#E5E2DC] text-sm"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={!reason.trim()}
            className={`px-4 py-2 rounded-[12px] text-sm font-medium ${
              !reason.trim()
                ? "bg-[#ED8D31]/50 text-white cursor-not-allowed"
                : "bg-[#ED8D31] text-white"
            }`}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3 gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B] text-right">
        {value}
      </span>
    </div>
  );
}