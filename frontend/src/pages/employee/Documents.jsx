import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { apiGet, apiPostForm, getCurrentUserId, API_BASE_URL } from "../../api";

const STATUS_LABEL = {
  UPLOADED: "Pending review",
  VALIDATED: "Validated ✅",
  REJECTED: "Rejected ❌",
};

const STATUS_STYLES = {
  UPLOADED: "bg-[#FFF4D6] text-[#B98900]",
  VALIDATED: "bg-[#D4F4DD] text-[#2D7A4A]",
  REJECTED: "bg-[#FBE1E1] text-[#A93B3B]",
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [uploadForm, setUploadForm] = useState({
    registration_id: "",
    document_type: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const userId = getCurrentUserId();

  const load = () => {
    if (!userId) {
      setLoading(false);
      setPageError("Please log in.");
      return;
    }
    setLoading(true);
    setPageError(null);
    Promise.all([
      apiGet(`/me/documents?user_id=${userId}`),
      apiGet(`/me/registrations?user_id=${userId}`),
    ])
      .then(([docs, regs]) => {
        setDocuments(docs.data || []);
        setRegistrations(regs.data || []);
      })
      .catch((err) => setPageError(err.message || "Could not load documents."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [userId]);

  const stats = useMemo(
    () => ({
      total: documents.length,
      pending: documents.filter((d) => d.status === "UPLOADED").length,
      validated: documents.filter((d) => d.status === "VALIDATED").length,
      rejected: documents.filter((d) => d.status === "REJECTED").length,
    }),
    [documents]
  );

  const uploadableRegistrations = useMemo(
    () =>
      registrations.filter((r) =>
        ["PENDING", "VALIDATED", "SELECTED", "CONFIRMED"].includes(r.status)
      ),
    [registrations]
  );

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError(null);

    if (!uploadForm.registration_id || !uploadForm.file) {
      setUploadError("Choose a registration and a file.");
      return;
    }

    setUploading(true);
    try {
      await apiPostForm(
        `/registrations/${uploadForm.registration_id}/documents`,
        {
          file: uploadForm.file,
          document_type: uploadForm.document_type || null,
        }
      );
      setUploadForm({ registration_id: "", document_type: "", file: null });
      // Reset the file input
      const input = document.getElementById("doc-file-input");
      if (input) input.value = "";
      load();
    } catch (err) {
      setUploadError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                My Documents
              </h1>
              <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                Upload supporting documents for your registrations and track
                validation status.
              </p>
            </div>

            {pageError && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {pageError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard title="Uploaded" value={stats.total} />
              <StatCard title="Pending review" value={stats.pending} />
              <StatCard title="Validated" value={stats.validated} />
              <StatCard title="Rejected" value={stats.rejected} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_340px] gap-6">
              <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E2DC]">
                  <h2 className="text-[22px] font-bold text-[#2F343B]">
                    My documents
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px]">
                    <thead className="bg-[#FBFAF8]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          File
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          For activity
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Uploaded
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold text-[#7A8088] uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            Loading...
                          </td>
                        </tr>
                      )}

                      {!loading && documents.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-5 py-10 text-center text-sm text-[#7A8088]"
                          >
                            You haven't uploaded any documents yet.
                          </td>
                        </tr>
                      )}

                      {documents.map((d) => (
                        <tr
                          key={d.id}
                          className="border-t border-[#E5E2DC] align-top"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[#2F343B] text-sm break-all">
                              {d.file_name}
                            </p>
                            <p className="text-xs text-[#7A8088] mt-1">
                              {d.document_type || "—"}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-sm text-[#2F343B]">
                            {d.activity_title}
                            <p className="text-xs text-[#7A8088] mt-1">
                              Session #{d.session_id}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-sm text-[#7A8088]">
                            {formatDate(d.uploaded_at)}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={d.status} />
                            {d.validation_comment && (
                              <p className="text-xs text-[#A93B3B] mt-1 max-w-[180px]">
                                {d.validation_comment}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5 h-fit">
                <h2 className="text-[22px] font-bold text-[#2F343B] mb-2">
                  Upload a document
                </h2>
                <p className="text-sm text-[#7A8088] mb-4">
                  Pick the registration this document belongs to.
                </p>

                {uploadableRegistrations.length === 0 ? (
                  <p className="text-sm text-[#7A8088] italic">
                    Register to an activity first.
                  </p>
                ) : (
                  <form onSubmit={handleUpload} className="space-y-4">
                    {uploadError && (
                      <div className="rounded-[12px] border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                        {uploadError}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                        Registration *
                      </label>
                      <select
                        value={uploadForm.registration_id}
                        onChange={(e) =>
                          setUploadForm((p) => ({
                            ...p,
                            registration_id: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                      >
                        <option value="">Select...</option>
                        {uploadableRegistrations.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.activity_title} — {formatDate(r.start_date)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                        Document type
                      </label>
                      <input
                        type="text"
                        value={uploadForm.document_type}
                        onChange={(e) =>
                          setUploadForm((p) => ({
                            ...p,
                            document_type: e.target.value,
                          }))
                        }
                        placeholder="e.g., Passport, Medical certificate..."
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
                        File *
                      </label>
                      <input
                        id="doc-file-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) =>
                          setUploadForm((p) => ({
                            ...p,
                            file: e.target.files[0],
                          }))
                        }
                        className="w-full text-sm"
                      />
                      <p className="text-xs text-[#7A8088] mt-1">
                        PDF, JPG, PNG, DOC. Max 10MB.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full px-4 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold disabled:opacity-60"
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                  </form>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-[20px] bg-white border border-[#E5E2DC] p-5">
      <p className="text-sm font-semibold text-[#7A8088]">{title}</p>
      <p className="text-3xl font-extrabold text-[#2F343B] mt-2">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || "bg-[#F1F0EC] text-[#7A8088]";
  const label = STATUS_LABEL[status] || status;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
