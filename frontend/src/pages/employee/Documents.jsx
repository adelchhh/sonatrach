import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPostForm, getCurrentUserId } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  StatBar,
  StatCell,
  DataPanel,
  StatusPill,
  Button,
  Alert,
  TextField,
  Select,
} from "../../components/ui/Studio";

const STATUS_TONE = {
  UPLOADED: "warn",
  VALIDATED: "success",
  REJECTED: "danger",
};
const STATUS_LABEL_FR = {
  UPLOADED: "En attente",
  VALIDATED: "Validé",
  REJECTED: "Rejeté",
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function Documents() {
  const t = useT();
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
      setPageError("Veuillez vous connecter.");
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
      .catch((err) =>
        setPageError(err.message || "Impossible de charger les documents.")
      )
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
      setUploadError("Choisissez une inscription et un fichier.");
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
      const input = document.getElementById("doc-file-input");
      if (input) input.value = "";
      load();
    } catch (err) {
      setUploadError(err.message || "Téléversement impossible.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.myArea")}
        title="Mes documents"
        subtitle="Téléversez les pièces justificatives requises pour vos inscriptions et suivez leur validation."
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Mes documents" },
        ]}
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        <StatBar>
          <StatCell label="Téléversés" value={stats.total} sub="Total" />
          <StatCell
            label="En attente"
            value={stats.pending}
            sub="À valider"
            accent={stats.pending > 0}
          />
          <StatCell label="Validés" value={stats.validated} sub="Conformes" />
          <StatCell label="Rejetés" value={stats.rejected} sub="Non conformes" />
        </StatBar>

        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
          <DataPanel title="Mes documents" badge={`${documents.length}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead className="bg-[#0A0A0A]">
                  <tr>
                    {[
                      "Fichier",
                      "Pour l'activité",
                      "Téléversé",
                      "Statut",
                    ].map((h, i) => (
                      <th
                        key={i}
                        className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                        Chargement…
                      </td>
                    </tr>
                  ) : documents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-14 text-center text-[13px] text-[#737373]">
                        Vous n'avez encore téléversé aucun document.
                      </td>
                    </tr>
                  ) : (
                    documents.map((d) => (
                      <tr
                        key={d.id}
                        className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors align-top"
                      >
                        <td className="px-6 py-4">
                          <p className="text-[#0A0A0A] text-[13px] font-bold break-all">
                            {d.file_name}
                          </p>
                          <p className="text-[11px] text-[#737373] mt-1">
                            {d.document_type || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[#0A0A0A]">
                          {d.activity_title}
                          <p className="text-[11px] text-[#737373] mt-0.5 tabular-nums">
                            Session #{d.session_id}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-[12px] tabular-nums text-[#525252]">
                          {formatDate(d.uploaded_at)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusPill
                            tone={STATUS_TONE[d.status] || "neutral"}
                            label={STATUS_LABEL_FR[d.status] || d.status}
                          />
                          {d.validation_comment && (
                            <p className="text-[11px] text-[#9F1F1F] mt-2 max-w-[200px]">
                              {d.validation_comment}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </DataPanel>

          <DataPanel
            title="Téléverser un document"
            subtitle="Sélectionnez l'inscription concernée"
          >
            <div className="p-6">
              {uploadableRegistrations.length === 0 ? (
                <p className="text-[13px] text-[#737373] italic">
                  Inscrivez-vous d'abord à une activité.
                </p>
              ) : (
                <form onSubmit={handleUpload} className="space-y-5">
                  {uploadError && (
                    <Alert tone="danger" title={t("sg.error")}>
                      {uploadError}
                    </Alert>
                  )}
                  <Select
                    label="Inscription"
                    value={uploadForm.registration_id}
                    onChange={(v) =>
                      setUploadForm((p) => ({ ...p, registration_id: v }))
                    }
                    options={[
                      { value: "", label: "Sélectionner…" },
                      ...uploadableRegistrations.map((r) => ({
                        value: r.id,
                        label: `${r.activity_title} — ${formatDate(r.start_date)}`,
                      })),
                    ]}
                    required
                  />
                  <TextField
                    label="Type de document"
                    value={uploadForm.document_type}
                    onChange={(v) =>
                      setUploadForm((p) => ({ ...p, document_type: v }))
                    }
                    placeholder="Ex : Passeport, certificat médical…"
                  />
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] mb-2">
                      Fichier
                      <span className="text-[#ED8D31] ml-1">*</span>
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
                      className="w-full text-[12px] text-[#0A0A0A] file:mr-3 file:bg-[#0A0A0A] file:text-white file:px-4 file:py-2 file:border-0 file:text-[11px] file:uppercase file:tracking-wider file:font-bold file:cursor-pointer hover:file:bg-black"
                    />
                    <p className="text-[11px] text-[#737373] mt-1.5">
                      PDF, JPG, PNG, DOC. 10 Mo max.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={uploading}
                  >
                    {uploading ? "Envoi…" : "Téléverser"}
                  </Button>
                </form>
              )}
            </div>
          </DataPanel>
        </div>
      </PageBody>
    </PageShell>
  );
}
