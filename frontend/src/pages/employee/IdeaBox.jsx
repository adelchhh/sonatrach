import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, getCurrentUserId } from "../../api";
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
  TextArea,
  Select,
} from "../../components/ui/Studio";

const CATEGORY_OPTIONS = [
  { value: "ACTIVITIES", label: "Activités" },
  { value: "SERVICES", label: "Services" },
  { value: "COMMUNICATION", label: "Communication" },
  { value: "WORKPLACE", label: "Lieu de travail" },
  { value: "WELLBEING", label: "Bien-être" },
];

const STATUS_TONE = {
  UNDER_REVIEW: "warn",
  ACCEPTED: "success",
  ARCHIVED: "neutral",
};
const STATUS_LABEL_FR = {
  UNDER_REVIEW: "En cours d'examen",
  ACCEPTED: "Acceptée",
  ARCHIVED: "Archivée",
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

export default function IdeaBox() {
  const t = useT();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [form, setForm] = useState({ category: "ACTIVITIES", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);

  const userId = getCurrentUserId();

  const load = () => {
    if (!userId) {
      setLoading(false);
      setPageError("Veuillez vous connecter.");
      return;
    }
    setLoading(true);
    apiGet(`/me/ideas?user_id=${userId}`)
      .then((res) => setIdeas(res.data || []))
      .catch((err) =>
        setPageError(err.message || "Impossible de charger vos idées.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [userId]);

  const stats = useMemo(
    () => ({
      total: ideas.length,
      review: ideas.filter((i) => i.status === "UNDER_REVIEW").length,
      accepted: ideas.filter((i) => i.status === "ACCEPTED").length,
    }),
    [ideas]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    if (!form.content.trim()) {
      setFormError("Veuillez décrire votre idée.");
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/ideas", {
        user_id: userId,
        content: form.content.trim(),
        category: form.category,
      });
      setForm({ category: "ACTIVITIES", content: "" });
      setSuccess("Merci ! Votre idée a bien été transmise au comité.");
      load();
    } catch (err) {
      setFormError(err.message || "Soumission impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.myArea")}
        title="Boîte à idées"
        subtitle="Proposez des améliorations pour les activités, services et bien-être Sonatrach. Le comité de communication examine chaque idée."
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: "Boîte à idées" },
        ]}
      />

      <PageBody>
        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        <StatBar>
          <StatCell label="Mes idées" value={stats.total} sub="Soumises" />
          <StatCell label="En examen" value={stats.review} sub="Avis du comité" />
          <StatCell label="Acceptées" value={stats.accepted} sub="Validées" accent={stats.accepted > 0} />
        </StatBar>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.65fr] gap-6">
          <DataPanel
            title="Soumettre une nouvelle idée"
            subtitle="Soyez précis : les suggestions concrètes sont plus faciles à évaluer"
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {success && (
                <Alert tone="success" title="Idée transmise">
                  {success}
                </Alert>
              )}
              {formError && (
                <Alert tone="danger" title={t("sg.error")}>
                  {formError}
                </Alert>
              )}
              <Select
                label="Catégorie"
                value={form.category}
                onChange={(v) => setForm((p) => ({ ...p, category: v }))}
                options={CATEGORY_OPTIONS}
              />
              <div>
                <TextArea
                  label="Votre idée"
                  value={form.content}
                  onChange={(v) => setForm((p) => ({ ...p, content: v }))}
                  placeholder="Décrivez votre idée, pourquoi elle est utile, et comment l'implémenter…"
                  rows={6}
                  required
                />
                <p className="text-[11px] text-[#A3A3A3] mt-1.5 tabular-nums text-right">
                  {form.content.length} / 2000
                </p>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
              >
                {submitting ? "Envoi…" : "Transmettre l'idée"}
              </Button>
            </form>
          </DataPanel>

          <DataPanel title="Mes idées transmises" badge={`${ideas.length}`}>
            {loading ? (
              <div className="px-6 py-14 text-center text-[13px] text-[#737373]">
                Chargement…
              </div>
            ) : ideas.length === 0 ? (
              <div className="px-6 py-14 text-center text-[13px] text-[#737373]">
                Aucune idée transmise pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E5E5]">
                {ideas.map((i) => (
                  <div key={i.id} className="px-6 py-5">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <span className="px-2.5 py-1 bg-[#F5F5F5] text-[#525252] text-[10px] uppercase tracking-[0.15em] font-bold">
                        {i.category}
                      </span>
                      <StatusPill
                        tone={STATUS_TONE[i.status] || "neutral"}
                        label={STATUS_LABEL_FR[i.status] || i.status}
                      />
                    </div>
                    <p className="text-[13px] text-[#0A0A0A] leading-[1.7]">
                      {i.content}
                    </p>
                    <p className="text-[11px] text-[#A3A3A3] mt-3 uppercase tracking-wider tabular-nums">
                      Soumise le {formatDate(i.submitted_at)}
                    </p>
                    {i.moderator_response && (
                      <div className="mt-4 bg-[#FAFAFA] border-l-2 border-[#0A0A0A] px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#737373] mb-1.5">
                          Réponse du comité
                        </p>
                        <p className="text-[12px] text-[#0A0A0A] leading-[1.6]">
                          {i.moderator_response}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DataPanel>
        </div>
      </PageBody>
    </PageShell>
  );
}
