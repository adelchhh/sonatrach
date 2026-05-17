import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { useT } from "../../i18n/LanguageContext";

const API_URL = "http://127.0.0.1:8000/api";

export default function CreateSurveyNotice() {
  const t = useT();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    deadline: "",
    summary: "",
    status: "DRAFT",
    question: {
      text: "",
      type: "single_choice",
      options: ["", ""],
    },
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuestionChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      question: {
        ...prev.question,
        [field]: value,
      },
    }));
  };

  const handleOptionChange = (index, value) => {
    setForm((prev) => {
      const nextOptions = [...prev.question.options];
      nextOptions[index] = value;

      return {
        ...prev,
        question: {
          ...prev.question,
          options: nextOptions,
        },
      };
    });
  };

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      question: {
        ...prev.question,
        options: [...prev.question.options, ""],
      },
    }));
  };

  const removeOption = (index) => {
    setForm((prev) => ({
      ...prev,
      question: {
        ...prev.question,
        options: prev.question.options.filter((_, i) => i !== index),
      },
    }));
  };

  const submitSurvey = async (status) => {
    try {
      setLoading(true);
      setError("");

      if (!form.title.trim()) {
        setError(t("communicator.createSurvey.titleRequired"));
        return;
      }

      if (!form.question.text.trim()) {
        setError(t("communicator.createSurvey.questionRequired"));
        return;
      }

      if (
        form.question.type === "single_choice" &&
        form.question.options.filter((option) => option.trim()).length < 2
      ) {
        setError(t("communicator.createSurvey.minTwoOptions"));
        return;
      }

      const payload = {
        title: form.title,
        deadline: form.deadline,
        summary: form.summary,
        status,
        question: {
          text: form.question.text,
          type: form.question.type,
          options:
            form.question.type === "single_choice"
              ? form.question.options.filter((option) => option.trim())
              : [],
        },
      };

      const res = await fetch(`${API_URL}/communicator/surveys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user?.id,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || t("communicator.createSurvey.saveFailed"));
        return;
      }

      navigate("/dashboard/communicator/surveys");
    } catch (err) {
      console.error(err);
      setError(t("communicator.createSurvey.serverError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => submitSurvey("DRAFT");
  const handlePublish = () => submitSurvey("PUBLISHED");

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#ED8D31] mb-2">
                  {t("dashboard.sidebar.communicatorTools")}
                </p>

                <h1 className="text-[36px] font-extrabold text-[#2F343B] leading-[110%]">
                  {t("communicator.createSurvey.title")}
                </h1>

                <p className="text-[#7A8088] text-sm mt-2 max-w-[760px] leading-[170%]">
                  {t("communicator.createSurvey.subtitle")}
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Link
                  to="/dashboard/communicator/surveys"
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  {t("communicator.common.cancel")}
                </Link>

                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold disabled:opacity-60"
                >
                  {t("communicator.createSurvey.draft")}
                </button>

                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold disabled:opacity-60"
                >
                  {t("communicator.createSurvey.publish")}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-[14px] bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
              <div className="space-y-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      {t("communicator.createSurvey.sectionInfo")}
                    </h2>
                  </div>

                  <div className="p-5 space-y-5">
                    <Field label={t("communicator.createSurvey.titleField")}>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder={t("communicator.createSurvey.titlePlaceholder")}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <Field label={t("communicator.createSurvey.deadline")}>
                      <input
                        type="date"
                        value={form.deadline}
                        onChange={(e) => handleChange("deadline", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <Field label={t("communicator.createSurvey.summary")}>
                      <textarea
                        value={form.summary}
                        onChange={(e) => handleChange("summary", e.target.value)}
                        rows={3}
                        placeholder={t("communicator.createSurvey.summaryPlaceholder")}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm resize-none"
                      />
                    </Field>
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h2 className="text-[24px] font-bold text-[#2F343B]">
                      {t("communicator.createSurvey.sectionQuestion")}
                    </h2>
                  </div>

                  <div className="p-5 space-y-5">
                    <Field label={t("communicator.createSurvey.type")}>
                      <select
                        value={form.question.type}
                        onChange={(e) => handleQuestionChange("type", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        <option value="single_choice">{t("communicator.createSurvey.typeChoice")}</option>
                        <option value="text">{t("communicator.createSurvey.typeText")}</option>
                      </select>
                    </Field>

                    <Field label={t("communicator.createSurvey.question")}>
                      <textarea
                        value={form.question.text}
                        onChange={(e) => handleQuestionChange("text", e.target.value)}
                        rows={3}
                        placeholder={t("communicator.createSurvey.questionPlaceholder")}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm resize-none"
                      />
                    </Field>

                    {form.question.type === "single_choice" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-semibold text-[#2F343B]">
                            {t("communicator.createSurvey.options")}
                          </label>

                          <button
                            type="button"
                            onClick={addOption}
                            className="text-sm font-semibold text-[#ED8D31]"
                          >
                            {t("communicator.createSurvey.addOption")}
                          </button>
                        </div>

                        {form.question.options.map((option, index) => (
                          <div key={index} className="flex gap-3">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={t("communicator.createSurvey.optionPlaceholder", { n: index + 1 })}
                              className="flex-1 px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                            />

                            {form.question.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="px-4 py-3 rounded-[14px] border border-red-200 text-red-500 text-sm font-semibold"
                              >
                                {t("communicator.createSurvey.remove")}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <div className="flex justify-end gap-3 flex-wrap">
                  <Link
                    to="/dashboard/communicator/surveys"
                    className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                  >
                    {t("communicator.common.cancel")}
                  </Link>

                  <button
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold disabled:opacity-60"
                  >
                    {t("communicator.createSurvey.draft")}
                  </button>

                  <button
                    onClick={handlePublish}
                    disabled={loading}
                    className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {t("communicator.createSurvey.publish")}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E2DC]">
                    <h3 className="text-[24px] font-bold text-[#2F343B]">
                      {t("communicator.createSurvey.sectionPreview")}
                    </h3>
                  </div>

                  <div className="p-5 space-y-3">
                    <SummaryRow label={t("communicator.createSurvey.titleField")} value={form.title || t("communicator.createSurvey.notDefined")} />
                    <SummaryRow
                      label={t("communicator.createSurvey.deadline")}
                      value={form.deadline || t("communicator.createSurvey.notDefined")}
                    />
                    <SummaryRow
                      label={t("communicator.createSurvey.summaryType")}
                      value={
                        form.question.type === "single_choice"
                          ? t("communicator.createSurvey.typeChoiceShort")
                          : t("communicator.createSurvey.typeTextShort")
                      }
                    />
                    <SummaryRow label={t("system.common.status")} value={t(`statuses.${form.status}`) || form.status} />
                    <SummaryRow
                      label={t("communicator.createSurvey.summaryOptions")}
                      value={
                        form.question.type === "single_choice"
                          ? form.question.options.filter((o) => o.trim()).length
                          : "—"
                      }
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#2F343B] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F9F8F6] px-4 py-3 gap-4">
      <span className="text-sm text-[#7A8088]">{label}</span>
      <span className="text-sm font-semibold text-[#2F343B] text-right">
        {value}
      </span>
    </div>
  );
}