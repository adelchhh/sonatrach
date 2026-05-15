import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPostForm } from "../../api";
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
  Select,
} from "../../components/ui/Studio";

const CATEGORY_OPTIONS = [
  { value: "SPORT", label: "Sport" },
  { value: "FAMILY", label: "Famille" },
  { value: "STAY", label: "Séjour" },
  { value: "NATURE", label: "Nature" },
  { value: "SPIRITUAL", label: "Spirituel" },
  { value: "TRAVEL", label: "Voyage" },
  { value: "LEISURE", label: "Loisirs" },
];
const DEMAND_OPTIONS = [
  { value: "HIGH", label: "Élevée" },
  { value: "MEDIUM", label: "Moyenne" },
  { value: "LOW", label: "Faible" },
];
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "PUBLISHED", label: "Publié" },
  { value: "ARCHIVED", label: "Archivé" },
  { value: "CANCELLED", label: "Annulé" },
];
const SENIORITY_OPTIONS = [
  { value: "1", label: "1 an" },
  { value: "3", label: "3 ans" },
  { value: "5", label: "5 ans" },
  { value: "10", label: "10 ans" },
];

export default function CreateActivity() {
  const t = useT();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "LEISURE",
    minimumSeniority: "1",
    drawEnabled: "yes",
    demandLevel: "MEDIUM",
    status: "DRAFT",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError(null);
    if (!form.title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        category: form.category,
        minimum_seniority: Number(form.minimumSeniority || 1),
        draw_enabled: form.drawEnabled === "yes",
        demand_level: form.demandLevel,
        status: form.status,
      };
      if (imageFile) payload.image = imageFile;
      const res = await apiPostForm("/activities", payload);
      const newId = res?.data?.id;
      navigate(
        newId
          ? `/dashboard/admin/activities/${newId}/sessions`
          : "/dashboard/admin/activities"
      );
    } catch (err) {
      setError(err.message || "Création impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.administration")}
        title="Créer une activité"
        subtitle="Définissez les informations principales avant de configurer les sessions, les sites et les quotas."
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Activités", to: "/dashboard/admin/activities" },
          { label: "Nouvelle" },
        ]}
        actions={
          <>
            <Button
              to="/dashboard/admin/activities"
              variant="outline"
              size="md"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      />

      <PageBody>
        {error && (
          <Alert tone="danger" title={t("sg.error")}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            <DataPanel
              title="Informations générales"
              subtitle="Détails de présentation de l'activité"
            >
              <div className="p-6 space-y-5">
                <TextField
                  label="Titre de l'activité"
                  value={form.title}
                  onChange={(v) => update("title", v)}
                  placeholder="ex : Colonie de vacances été 2026"
                  required
                />
                <TextArea
                  label="Description"
                  value={form.description}
                  onChange={(v) => update("description", v)}
                  placeholder="Décrivez en détail l'activité…"
                  rows={5}
                />
                <Select
                  label="Catégorie"
                  value={form.category}
                  onChange={(v) => update("category", v)}
                  options={CATEGORY_OPTIONS}
                />
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] mb-2">
                    Image de couverture
                  </label>
                  <label className="block bg-[#FAFAFA] border border-dashed border-[#E5E5E5] hover:border-[#0A0A0A] hover:bg-white transition-colors h-[180px] cursor-pointer overflow-hidden relative">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-10 h-10 border border-[#0A0A0A] flex items-center justify-center mb-3 text-[#0A0A0A]">
                          ⬆
                        </div>
                        <p className="text-[13px] text-[#0A0A0A] font-bold">
                          <span className="text-[#ED8D31]">Cliquez</span> pour
                          téléverser ou glissez-déposez
                        </p>
                        <p className="text-[11px] text-[#737373] mt-1">
                          SVG · PNG · JPG · GIF · WEBP (4 Mo max)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            </DataPanel>

            <DataPanel
              title="Règles d'activité"
              subtitle="Critères d'éligibilité et tirage"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select
                  label="Ancienneté minimale"
                  value={form.minimumSeniority}
                  onChange={(v) => update("minimumSeniority", v)}
                  options={SENIORITY_OPTIONS}
                />
                <Select
                  label="Tirage au sort"
                  value={form.drawEnabled}
                  onChange={(v) => update("drawEnabled", v)}
                  options={[
                    { value: "yes", label: "Oui" },
                    { value: "no", label: "Non" },
                  ]}
                />
                <Select
                  label="Niveau de demande"
                  value={form.demandLevel}
                  onChange={(v) => update("demandLevel", v)}
                  options={DEMAND_OPTIONS}
                />
              </div>
            </DataPanel>

            <div className="flex justify-end gap-3">
              <Button
                to="/dashboard/admin/activities"
                variant="outline"
                size="md"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Enregistrement…" : "Enregistrer l'activité"}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <DataPanel title="Publication" subtitle="Statut courant">
              <div className="p-6">
                <Select
                  label="Statut"
                  value={form.status}
                  onChange={(v) => update("status", v)}
                  options={STATUS_OPTIONS}
                  hint="Seules les activités publiées apparaissent dans le catalogue."
                />
              </div>
            </DataPanel>

            <DataPanel title="Résumé" subtitle="Aperçu de la configuration">
              <div className="p-6 space-y-2">
                <SummaryRow label="Titre" value={form.title || "Non défini"} />
                <SummaryRow label="Catégorie" value={form.category} />
                <SummaryRow
                  label="Ancienneté min."
                  value={`${form.minimumSeniority} an(s)`}
                />
                <SummaryRow
                  label="Tirage"
                  value={form.drawEnabled === "yes" ? "Oui" : "Non"}
                />
                <SummaryRow label="Demande" value={form.demandLevel} />
                <SummaryRow label="Statut" value={form.status} />
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
