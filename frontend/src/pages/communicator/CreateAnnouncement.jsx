import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAnnouncement } from "../../services/announcementService";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  DataPanel,
  Button,
  Alert,
  TextField,
  TextArea,
} from "../../components/ui/Studio";

export default function CreateAnnouncement() {
  const t = useT();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    content: "",
    hasDocument: false,
    document: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submitAnnouncement = async (status) => {
    setLoading(true);
    setError("");
    try {
      await createAnnouncement({
        title: form.title,
        content: form.content,
        status,
        document: form.hasDocument ? form.document : null,
      });
      navigate("/dashboard/communicator/announcements");
    } catch (err) {
      setError(err.message || "Création impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.communication")}
        title="Créer une annonce"
        subtitle="Rédigez une nouvelle communication interne avec titre, contenu et document optionnel."
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          {
            label: "Annonces",
            to: "/dashboard/communicator/announcements",
          },
          { label: "Nouvelle" },
        ]}
        actions={
          <Button
            to="/dashboard/communicator/announcements"
            variant="outline"
            size="md"
          >
            ← Retour
          </Button>
        }
      />

      <PageBody>
        {error && (
          <Alert tone="danger" title={t("sg.error")}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            <DataPanel
              title="Informations principales"
              subtitle="Titre et contenu de l'annonce"
            >
              <div className="p-6 space-y-5">
                <TextField
                  label="Titre"
                  value={form.title}
                  onChange={(v) => update("title", v)}
                  placeholder="Saisissez le titre de l'annonce…"
                  required
                />
                <TextArea
                  label="Contenu"
                  value={form.content}
                  onChange={(v) => update("content", v)}
                  placeholder="Rédigez le message complet pour les collaborateurs…"
                  rows={10}
                  required
                />
              </div>
            </DataPanel>

            <DataPanel
              title="Document attaché (optionnel)"
              subtitle="PDF, Word ou image"
            >
              <div className="p-6 space-y-5">
                <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-[#0A0A0A]">
                      Joindre un document
                    </p>
                    <p className="text-[11px] text-[#737373] mt-1 leading-[1.55]">
                      Activez pour téléverser un PDF, un fichier Word ou une
                      image.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => update("hasDocument", !form.hasDocument)}
                    className={`relative w-11 h-6 transition-colors ${
                      form.hasDocument ? "bg-[#0A0A0A]" : "bg-[#E5E5E5]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white transition-all ${
                        form.hasDocument ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                {form.hasDocument && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] mb-2">
                      Fichier
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(e) => update("document", e.target.files[0])}
                      className="w-full text-[12px] text-[#0A0A0A] file:mr-3 file:bg-[#0A0A0A] file:text-white file:px-4 file:py-2 file:border-0 file:text-[11px] file:uppercase file:tracking-wider file:font-bold file:cursor-pointer hover:file:bg-black"
                    />
                    {form.document && (
                      <p className="text-[11px] text-[#737373] mt-2">
                        Sélectionné : {form.document.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </DataPanel>
          </div>

          <div className="space-y-6">
            <DataPanel title="Aperçu" subtitle="Résumé avant publication">
              <div className="p-6 space-y-2">
                <SummaryRow label="Titre" value={form.title || "Non défini"} />
                <SummaryRow
                  label="Document"
                  value={form.hasDocument ? "Attaché" : "Aucun"}
                />
                <SummaryRow
                  label="Caractères"
                  value={`${form.content.length}`}
                />
              </div>
            </DataPanel>

            <DataPanel title="Actions" subtitle="Brouillon ou publication directe">
              <div className="p-6 space-y-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => submitAnnouncement("DRAFT")}
                  disabled={loading}
                >
                  {loading ? "Enregistrement…" : "Sauvegarder en brouillon"}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => submitAnnouncement("PUBLISHED")}
                  disabled={loading}
                >
                  {loading ? "Publication…" : "Publier maintenant"}
                </Button>
              </div>
            </DataPanel>
          </div>
        </div>
      </PageBody>
    </PageShell>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-[#F5F5F5] last:border-b-0">
      <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#737373]">
        {label}
      </span>
      <span className="text-[13px] font-bold text-[#0A0A0A] text-right truncate">
        {value}
      </span>
    </div>
  );
}
