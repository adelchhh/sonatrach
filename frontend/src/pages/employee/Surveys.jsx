import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, getCurrentUserId } from "../../api";
import { useT } from "../../i18n/LanguageContext";
import {
  PageShell,
  PageHeader,
  PageBody,
  SearchInput,
  FilterChip,
  DataPanel,
  StatusPill,
  Button,
  Alert,
} from "../../components/ui/Studio";

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

export default function Surveys() {
  const t = useT();
  const userId = getCurrentUserId();

  const [surveys, setSurveys] = useState([]);
  const [draftAnswers, setDraftAnswers] = useState({});
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [tab, setTab] = useState("ACTIVE");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [submitting, setSubmitting] = useState(null);

  async function loadSurveys() {
    if (!userId) {
      setLoading(false);
      setPageError(t("sg.error"));
      return;
    }
    try {
      setLoading(true);
      setPageError("");
      const res = await apiGet(`/surveys?user_id=${userId}`);
      const list = Array.isArray(res) ? res : res.data || [];
      setSurveys(list);
      const drafts = {};
      list.forEach((s) => {
        if (s.type === "CHOICE" && s.my_option_id) drafts[s.id] = s.my_option_id;
        if (s.type === "TEXT" && s.my_response) drafts[s.id] = s.my_response;
      });
      setDraftAnswers(drafts);
    } catch (err) {
      setPageError(err.message || t("sg.loadingFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSurveys();
  }, [userId]);

  const activeSurveys = surveys.filter(
    (s) => s.status === "PUBLISHED" && !s.my_response && !s.my_option_id
  );
  const completedSurveys = surveys.filter(
    (s) => s.my_response || s.my_option_id
  );

  const filteredSurveys = useMemo(() => {
    const source = tab === "ACTIVE" ? activeSurveys : completedSurveys;
    return source.filter((s) =>
      String(s.title || "").toLowerCase().includes(search.toLowerCase())
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search, surveys]);

  async function submitAnswer(survey) {
    const value = draftAnswers[survey.id];
    if (!value) {
      alert(t("sg.error"));
      return;
    }
    try {
      setSubmitting(survey.id);
      const payload =
        survey.type === "CHOICE"
          ? { user_id: userId, option_id: value }
          : { user_id: userId, answer: String(value).trim() };
      await apiPost(`/surveys/${survey.id}/respond`, payload);
      setSelectedSurvey(null);
      await loadSurveys();
    } catch (err) {
      alert(err.message || t("sg.saveImpossible"));
    } finally {
      setSubmitting(null);
    }
  }

  if (selectedSurvey) {
    return (
      <PageShell>
        <PageHeader
          eyebrow={t("sg.surveys")}
          title={selectedSurvey.title}
          subtitle={`${t("sg.labelDeadline")} : ${formatDate(selectedSurvey.end_date)}`}
          breadcrumbs={[
            { label: t("sg.dashboard"), to: "/dashboard" },
            { label: t("sg.surveys"), to: "#" },
            { label: selectedSurvey.title },
          ]}
          actions={
            <Button
              variant="outline"
              size="md"
              onClick={() => setSelectedSurvey(null)}
            >
              ← {t("sg.back")}
            </Button>
          }
        />
        <PageBody>
          <TakeSurveyView
            survey={selectedSurvey}
            answer={draftAnswers[selectedSurvey.id]}
            setAnswer={(value) =>
              setDraftAnswers((prev) => ({ ...prev, [selectedSurvey.id]: value }))
            }
            onBack={() => setSelectedSurvey(null)}
            onSubmit={() => submitAnswer(selectedSurvey)}
            submitting={submitting === selectedSurvey.id}
          />
        </PageBody>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sg.myArea")}
        title={t("sg.surveys")}
        subtitle={t("sg.subMySurveys")}
        breadcrumbs={[
          { label: t("sg.dashboard"), to: "/dashboard" },
          { label: t("sg.surveys") },
        ]}
      />

      <PageBody>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E5] pb-4">
          <div className="flex gap-2">
            <FilterChip
              label={`${t("sg.active")} · ${activeSurveys.length}`}
              active={tab === "ACTIVE"}
              onClick={() => setTab("ACTIVE")}
            />
            <FilterChip
              label={`${t("sg.processed")} · ${completedSurveys.length}`}
              active={tab === "COMPLETED"}
              onClick={() => setTab("COMPLETED")}
            />
          </div>
          <div className="w-full lg:w-[320px]">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t("sg.phSearchTitle")}
            />
          </div>
        </div>

        {pageError && (
          <Alert tone="danger" title={t("sg.error")}>
            {pageError}
          </Alert>
        )}

        {loading ? (
          <div className="border border-[#E5E5E5] bg-white py-14 text-center text-[13px] text-[#737373]">
            {t("sg.loading")}
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="border border-[#E5E5E5] bg-white py-14 text-center text-[13px] text-[#737373]">
            {t("sg.emptySurveys")}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                completed={!!survey.my_response || !!survey.my_option_id}
                onOpen={() => setSelectedSurvey(survey)}
              />
            ))}
          </div>
        )}
      </PageBody>
    </PageShell>
  );
}

function SurveyCard({ survey, completed, onOpen }) {
  const isChoice = survey.type === "CHOICE";
  return (
    <article className="bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] transition-colors p-6 flex flex-col gap-5 min-h-[280px]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[18px] font-bold text-[#0A0A0A] leading-tight tracking-tight">
          {survey.title || "Sondage"}
        </h3>
        <div className="w-12 h-12 bg-[#0A0A0A] text-white flex items-center justify-center text-[18px] font-bold flex-shrink-0">
          {isChoice ? "☑" : "✎"}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {Number(survey.required) === 1 && (
          <StatusPill tone="warn" label="Obligatoire" />
        )}
        {completed && <StatusPill tone="success" label="Complété" />}
      </div>
      <p className="text-[13px] text-[#525252] leading-[1.65] line-clamp-3 flex-1">
        {survey.question}
      </p>
      <div className="flex gap-2 flex-wrap text-[10px] uppercase tracking-[0.15em] font-bold">
        <span className="px-2.5 py-1 bg-[#F5F5F5] text-[#525252]">
          {isChoice ? "Choix" : "Texte"}
        </span>
        <span className="px-2.5 py-1 bg-[#F5F5F5] text-[#525252] tabular-nums">
          Avant le {formatDate(survey.end_date)}
        </span>
      </div>
      <Button
        onClick={onOpen}
        variant={completed ? "outline" : "primary"}
        size="md"
      >
        {completed ? "Voir ma réponse" : "Répondre →"}
      </Button>
    </article>
  );
}

function TakeSurveyView({
  survey,
  answer,
  setAnswer,
  onBack,
  onSubmit,
  submitting,
}) {
  const alreadyAnswered = !!survey.my_response || !!survey.my_option_id;
  const isChoice = survey.type === "CHOICE";
  const progress = alreadyAnswered ? "100" : answer ? "50" : "0";

  return (
    <div className="space-y-6 max-w-[900px]">
      <DataPanel title="Progression">
        <div className="p-6">
          <div className="flex items-baseline justify-between text-[12px] mb-3">
            <span className="uppercase tracking-[0.15em] font-bold text-[#0A0A0A]">
              Avancement
            </span>
            <span className="tabular-nums font-bold text-[#0A0A0A]">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 bg-[#F5F5F5] overflow-hidden">
            <div
              className="h-full bg-[#0A0A0A] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </DataPanel>

      <DataPanel
        title={survey.question}
        subtitle={
          isChoice
            ? "Choisissez une option dans la liste ci-dessous."
            : "Rédigez votre réponse dans le champ ci-dessous."
        }
      >
        <div className="p-6">
          {isChoice ? (
            <div className="space-y-3">
              {(survey.options || []).map((option) => {
                const selected =
                  Number(answer) === Number(option.id) ||
                  Number(survey.my_option_id) === Number(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={alreadyAnswered}
                    onClick={() => setAnswer(option.id)}
                    className={`w-full flex items-center gap-4 border px-5 py-4 text-left text-[13px] font-bold transition-colors ${
                      selected
                        ? "border-[#0A0A0A] bg-[#FFF7E8] text-[#0A0A0A]"
                        : "border-[#E5E5E5] bg-white text-[#0A0A0A] hover:border-[#0A0A0A]"
                    } ${alreadyAnswered ? "opacity-75 cursor-default" : ""}`}
                  >
                    <span
                      className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? "border-[#ED8D31]" : "border-[#A3A3A3]"
                      }`}
                    >
                      {selected && (
                        <span className="w-2.5 h-2.5 bg-[#ED8D31]" />
                      )}
                    </span>
                    {option.option_text}
                  </button>
                );
              })}
            </div>
          ) : (
            <textarea
              value={answer || survey.my_response || ""}
              disabled={alreadyAnswered}
              onChange={(e) => setAnswer(e.target.value)}
              rows={7}
              placeholder="Rédigez votre réponse…"
              className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] text-[14px] text-[#0A0A0A] placeholder:text-[#A3A3A3] outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors resize-y disabled:opacity-70"
            />
          )}
        </div>
      </DataPanel>

      {!alreadyAnswered && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="md" onClick={onBack}>
            ← Retour
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? "Envoi…" : "Soumettre la réponse →"}
          </Button>
        </div>
      )}
    </div>
  );
}
