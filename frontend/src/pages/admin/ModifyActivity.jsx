import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL, apiGet, apiPostForm, apiDelete } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  DataPanel,
  Button,
  Alert,
  StatusPill,
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
const STATUS_TONE = {
  PUBLISHED: "success",
  DRAFT: "warn",
  ARCHIVED: "neutral",
  CANCELLED: "danger",
};

function imageUrlOf(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
}

export default function ModifyActivity() {
  const t = useT();
  const { slug: id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "LEISURE",
    minimum_seniority: 1,
    draw_enabled: true,
    demand_level: "MEDIUM",
    status: "DRAFT",
    image_url: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet(`/activities/${id}`);
        if (cancelled) return;
        const a = res.data;
        setForm({
          title: a.title || "",
          description: a.description || "",
          category: a.category || "LEISURE",
          minimum_seniority: a.minimum_seniority ?? 1,
          draw_enabled: !!a.draw_enabled,
          demand_level: a.demand_level || "MEDIUM",
          status: a.status || "DRAFT",
          image_url: a.image_url || null,
        });
      } catch (err) {
        setError(err.message || "Impossible de charger l'activité.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

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
        minimum_seniority: Number(form.minimum_seniority || 1),
        draw_enabled: !!form.draw_enabled,
        demand_level: form.demand_level,
        status: form.status,
        _method: "PUT",
      };
      if (imageFile) payload.image = imageFile;
      await apiPostForm(`/activities/${id}`, payload);
      navigate("/dashboard/admin/activities");
    } catch (err) {
      setError(err.message || "Sauvegarde impossible.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm("Archiver cette activité ? Elle ne sera plus visible.")) return;
    try {
      await apiPostForm(`/activities/${id}`, {
        status: "ARCHIVED",
        _method: "PUT",
      });
      navigate("/dashboard/admin/activities");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cette activité ?")) return;
    try {
      await apiDelete(`/activities/${id}`);
      navigate("/dashboard/admin/activities");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <PageBody>
          <div className="text-center text-[#737373] text-[13px] py-12">
            Chargement…
          </div>
        </PageBody>
      </PageShell>
    );
  }

  const statusTr = {
    PUBLISHED: "Publié",
    DRAFT: "Brouillon",
    ARCHIVED: "Archivé",
    CANCELLED: "Annulé",
  }[form.status] || form.status;

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.administration")}
        title={`Modifier · ${form.title}`}
        subtitle="Mettez à jour les informations, les règles et l'image de couverture."
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Activités", to: "/dashboard/admin/activities" },
          { label: form.title },
        ]}
        actions={
          <>
            <StatusPill tone={STATUS_TONE[form.status] || "neutral"} label={statusTr} />
            <Button to="/dashboard/admin/activities" variant="outline" size="md">
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

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <DataPanel
              title="Informations générales"
              subtitle="Détails de présentation"
            >
              <div className="p-6 space-y-5">
                <TextField
                  label="Titre"
                  value={form.title}
                  onChange={(v) => update("title", v)}
                  required
                />
                <TextArea
                  label="Description"
                  value={form.description}
                  onChange={(v) => update("description", v)}
                  rows={4}
                />
                <Select
                  label="Catégorie"
                  value={form.category}
                  onChange={(v) => update("category", v)}
                  options={CATEGORY_OPTIONS}
                />
              </div>
            </DataPanel>

            <DataPanel
              title="Règles d'activité"
              subtitle="Éligibilité et tirage au sort"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                <TextField
                  label="Ancienneté min. (années)"
                  value={form.minimum_seniority}
                  onChange={(v) => update("minimum_seniority", v)}
                  type="number"
                />
                <Select
                  label="Niveau de demande"
                  value={form.demand_level}
                  onChange={(v) => update("demand_level", v)}
                  options={DEMAND_OPTIONS}
                />
                <Select
                  label="Tirage au sort"
                  value={form.draw_enabled ? "yes" : "no"}
                  onChange={(v) => update("draw_enabled", v === "yes")}
                  options={[
                    { value: "yes", label: "Oui" },
                    { value: "no", label: "Non" },
                  ]}
                />
              </div>
            </DataPanel>
          </div>

          <div className="space-y-6">
            <DataPanel title="Image de couverture" subtitle="Affichée dans le catalogue">
              <div className="p-6 space-y-4">
                {(imagePreview || form.image_url) && (
                  <img
                    src={imagePreview || imageUrlOf(form.image_url)}
                    alt="Couverture"
                    className="w-full h-[180px] object-cover bg-[#1A1A1A]"
                  />
                )}
                <label className="block">
                  <span className="block bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] cursor-pointer text-center px-4 py-3 text-[12px] uppercase tracking-[0.15em] font-bold text-[#0A0A0A] transition-colors">
                    Remplacer l'image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </DataPanel>

            <DataPanel title="Statut" subtitle="Visibilité dans le catalogue">
              <div className="p-6">
                <Select
                  label="Statut courant"
                  value={form.status}
                  onChange={(v) => update("status", v)}
                  options={STATUS_OPTIONS}
                  hint="Seul le statut Publié rend l'activité visible aux collaborateurs."
                />
              </div>
            </DataPanel>

            <DataPanel title="Zone dangereuse">
              <div className="p-6 space-y-3">
                <Button variant="outline" size="md" onClick={handleArchive}>
                  Archiver l'activité
                </Button>
                <Button variant="danger" size="md" onClick={handleDelete}>
                  Supprimer définitivement
                </Button>
              </div>
            </DataPanel>
          </div>
        </div>
      </PageBody>
    </PageShell>
  );
}
