import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost, getCurrentUser, getCurrentUserId } from "../../api";

export default function DashboardRightPanel() {
  const user = getCurrentUser();
  const [surveys, setSurveys] = useState([]);
  const [drawResults, setDrawResults] = useState([]);
  const [docs, setDocs] = useState([]);
  const [ideaForm, setIdeaForm] = useState({ title: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  const roles = (user?.roles || []).map((r) =>
    typeof r === "string" ? r : r?.name || r?.role
  );
  const isAdmin =
    roles.includes("FUNCTIONAL_ADMIN") || roles.includes("SYSTEM_ADMIN");

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) return;
    const safe = (p) => p.catch(() => ({ data: [] }));

    Promise.all([
      safe(apiGet(`/surveys?user_id=${userId}`)),
      safe(apiGet(`/me/draw-results?user_id=${userId}`)),
      safe(apiGet(`/me/documents?user_id=${userId}`)),
    ]).then(([s, d, doc]) => {
      setSurveys(s?.data || []);
      setDrawResults(d?.data || []);
      setDocs(doc?.data || []);
    });
  }, []);

  const latestDrawResult = drawResults?.[0] || null;
  const pendingDocs = (docs || []).filter(
    (d) => d.status === "PENDING" || d.status === "REQUIRED"
  );

  const handleSubmitIdea = async (e) => {
    e.preventDefault();
    if (!ideaForm.title.trim() || !ideaForm.description.trim()) return;
    const userId = getCurrentUserId();
    if (!userId) {
      setSubmitMessage({ ok: false, text: "Connectez-vous d'abord." });
      return;
    }
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      await apiPost("/ideas", {
        user_id: userId,
        title: ideaForm.title,
        description: ideaForm.description,
      });
      setIdeaForm({ title: "", description: "" });
      setSubmitMessage({ ok: true, text: "Idée transmise. Merci." });
    } catch (err) {
      setSubmitMessage({
        ok: false,
        text: err.message || "Envoi impossible pour le moment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="w-[320px] min-w-[320px] bg-[#FAFAF8] border-l border-[#E4E4E7] overflow-y-auto">
      <div className="px-7 py-10 space-y-12">
        {/* ─── DRAW RESULT ──────────────────────────────── */}
        <Section number="A" title={isAdmin ? "Dernier tirage" : "Mon dernier tirage"}>
          {latestDrawResult ? (
            <DrawResultCard result={latestDrawResult} />
          ) : (
            <Placeholder
              eyebrow="Aucun résultat"
              text={
                isAdmin
                  ? "Les tirages exécutés apparaîtront ici."
                  : "Vos résultats de tirage apparaîtront ici dès leur publication."
              }
              link={{
                to: isAdmin ? "/dashboard/admin/draw-history" : "/dashboard/draw",
                label: isAdmin ? "Historique des tirages" : "Voir mes tirages",
              }}
            />
          )}
        </Section>

        {/* ─── DOCUMENTS ───────────────────────────────── */}
        <Section
          number="B"
          title={isAdmin ? "Documents à valider" : "Documents à fournir"}
        >
          {pendingDocs.length === 0 ? (
            <Placeholder
              eyebrow="Aucun document"
              text={
                isAdmin
                  ? "Les pièces déposées par les collaborateurs apparaîtront ici."
                  : "Les pièces requises pour vos inscriptions apparaîtront ici."
              }
              link={{
                to: isAdmin
                  ? "/dashboard/admin/documents"
                  : "/dashboard/documents",
                label: isAdmin ? "Gérer les documents" : "Mes documents",
              }}
            />
          ) : (
            <DocList items={pendingDocs.slice(0, 4)} isAdmin={isAdmin} />
          )}
        </Section>

        {/* ─── SURVEYS ─────────────────────────────────── */}
        <Section number="C" title="Sondages actifs">
          {surveys.length === 0 ? (
            <Placeholder
              eyebrow="Aucun sondage"
              text="Les sondages publiés apparaîtront ici dès leur ouverture."
              link={{
                to: "/dashboard/surveys",
                label: "Tous les sondages",
              }}
            />
          ) : (
            <ul className="space-y-5">
              {surveys.slice(0, 3).map((s, i) => (
                <SurveyItem key={s.id} survey={s} index={i + 1} />
              ))}
            </ul>
          )}
        </Section>

        {/* ─── IDEA BOX ────────────────────────────────── */}
        <Section number="D" title="Boîte à idées">
          <p className="text-[12px] leading-[1.7] text-[#52525B] mb-5">
            Proposez de nouvelles activités, des destinations de voyage ou
            toute amélioration utile à la vie sociale de Sonatrach.
          </p>

          <form onSubmit={handleSubmitIdea} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.28em] font-bold text-[#71717A] mb-2 block">
                Titre
              </label>
              <input
                type="text"
                value={ideaForm.title}
                onChange={(e) =>
                  setIdeaForm({ ...ideaForm, title: e.target.value })
                }
                placeholder="Une voile à Tipaza…"
                className="w-full bg-transparent border-b border-[#0A0A0A] py-2 text-[13px] text-[#0A0A0A] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#ED8D31] transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.28em] font-bold text-[#71717A] mb-2 block">
                Description
              </label>
              <textarea
                value={ideaForm.description}
                onChange={(e) =>
                  setIdeaForm({ ...ideaForm, description: e.target.value })
                }
                placeholder="Décrivez votre idée en quelques lignes…"
                rows={4}
                className="w-full bg-transparent border-b border-[#0A0A0A] py-2 text-[13px] text-[#0A0A0A] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#ED8D31] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] font-bold text-[#0A0A0A] hover:text-[#ED8D31] transition-colors disabled:opacity-50"
            >
              <span className="inline-block w-5 h-px bg-[#0A0A0A]" />
              {submitting ? "Envoi…" : "Transmettre l'idée →"}
            </button>

            {submitMessage && (
              <p
                className={`text-[11px] mt-3 ${
                  submitMessage.ok ? "text-[#15803D]" : "text-[#B91C1C]"
                }`}
              >
                {submitMessage.text}
              </p>
            )}
          </form>
        </Section>
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════════════ */
/*  SUB-COMPONENTS                                  */
/* ════════════════════════════════════════════════ */

function Section({ number, title, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-3 pb-3 border-b border-[#E4E4E7] mb-5">
        <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-[#71717A]">
          §{number}
        </p>
        <h3 className="text-[14px] font-medium tracking-[-0.01em] text-[#0A0A0A]">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Placeholder({ eyebrow, text, link }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-[#A1A1AA] mb-2">
        {eyebrow}
      </p>
      <p className="text-[12px] leading-[1.65] text-[#52525B] mb-4">{text}</p>
      {link && (
        <Link
          to={link.to}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold text-[#0A0A0A] hover:text-[#ED8D31] transition-colors"
        >
          <span className="inline-block w-4 h-px bg-current" />
          {link.label} →
        </Link>
      )}
    </div>
  );
}

function DrawResultCard({ result }) {
  const kind = result.is_selected
    ? "selected"
    : result.is_substitute
    ? "substitute"
    : "waiting";
  const kindLabel = {
    selected: "Sélectionné",
    substitute: "Suppléant",
    waiting: "Non retenu",
  }[kind];
  const kindColor = {
    selected: "#15803D",
    substitute: "#ED8D31",
    waiting: "#71717A",
  }[kind];

  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-[0.28em] font-bold mb-2"
        style={{ color: kindColor }}
      >
        {kindLabel}
      </p>
      <p className="text-[15px] font-medium text-[#0A0A0A] leading-snug mb-2">
        {result.activity_title || result.session_title || "Tirage récent"}
      </p>
      {result.draw_date && (
        <p className="text-[11px] uppercase tracking-[0.2em] tabular-nums text-[#71717A] mb-4">
          {new Date(result.draw_date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}
      <Link
        to="/dashboard/draw"
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold text-[#0A0A0A] hover:text-[#ED8D31] transition-colors"
      >
        <span className="inline-block w-4 h-px bg-current" />
        Voir le détail →
      </Link>
    </div>
  );
}

function DocList({ items, isAdmin }) {
  return (
    <ul className="space-y-4">
      {items.map((d, i) => (
        <li
          key={d.id || i}
          className="flex items-baseline gap-3 pb-3 border-b border-[#E4E4E7] last:border-0"
        >
          <p className="text-[10px] tabular-nums font-bold text-[#A1A1AA]">
            {String(i + 1).padStart(2, "0")}
          </p>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[#0A0A0A] truncate">
              {d.document_name || d.title || "Document"}
            </p>
            {d.activity_title && (
              <p className="text-[10px] text-[#71717A] mt-0.5 truncate">
                {d.activity_title}
              </p>
            )}
          </div>
        </li>
      ))}
      <li>
        <Link
          to={isAdmin ? "/dashboard/admin/documents" : "/dashboard/documents"}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold text-[#0A0A0A] hover:text-[#ED8D31] transition-colors"
        >
          <span className="inline-block w-4 h-px bg-current" />
          Tout voir →
        </Link>
      </li>
    </ul>
  );
}

function SurveyItem({ survey, index }) {
  return (
    <li className="border-b border-[#E4E4E7] pb-4 last:border-0">
      <div className="flex items-baseline gap-3">
        <p className="text-[10px] tabular-nums font-bold text-[#A1A1AA]">
          {String(index).padStart(2, "0")}
        </p>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-[#0A0A0A] leading-snug mb-1.5">
            {survey.title || "Sondage"}
          </p>
          <p className="text-[11px] text-[#71717A] leading-[1.55] line-clamp-2">
            {survey.question || survey.description}
          </p>
          <Link
            to={`/dashboard/surveys`}
            className="inline-flex items-center gap-2 mt-2 text-[10px] uppercase tracking-[0.25em] font-semibold text-[#0A0A0A] hover:text-[#ED8D31] transition-colors"
          >
            Répondre →
          </Link>
        </div>
      </div>
    </li>
  );
}
