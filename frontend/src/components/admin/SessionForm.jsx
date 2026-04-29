import { useState, useEffect } from "react";
import { useT } from "../../i18n/LanguageContext";

const STATUS_VALUES = ["DRAFT", "OPEN", "CLOSED", "DRAW_DONE", "FINISHED", "CANCELLED"];

export default function SessionForm({
  initial,
  showDrawFields = true,
  submitting = false,
  errorMessage = null,
  onSubmit,
  onCancel,
  submitLabel,
}) {
  const t = useT();
  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    registration_deadline: "",
    draw_date: "",
    draw_location: "",
    confirmation_delay_hours: 48,
    document_upload_deadline: "",
    transport_included: false,
    telefax_url: "",
    substitutes_count: 2,
    status: "DRAFT",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        start_date: initial.start_date || "",
        end_date: initial.end_date || "",
        registration_deadline: initial.registration_deadline || "",
        draw_date: initial.draw_date || "",
        draw_location: initial.draw_location || "",
        confirmation_delay_hours:
          initial.confirmation_delay_hours ?? 48,
        document_upload_deadline: initial.document_upload_deadline || "",
        transport_included: !!initial.transport_included,
        telefax_url: initial.telefax_url || "",
        substitutes_count: initial.substitutes_count ?? 2,
        status: initial.status || "DRAFT",
      });
    }
  }, [initial]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      draw_date: form.draw_date || null,
      draw_location: form.draw_location || null,
      document_upload_deadline: form.document_upload_deadline || null,
      telefax_url: form.telefax_url || null,
      confirmation_delay_hours: Number(form.confirmation_delay_hours) || 0,
      substitutes_count: Number(form.substitutes_count) || 0,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-6">
        {/* Left side */}
        <div className="space-y-6">
          <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DC]">
              <h2 className="text-[24px] font-bold text-[#2F343B]">
                {t("admin.sessionForm.sessionDates")}
              </h2>
              <p className="text-sm text-[#7A8088] mt-1">
                {t("admin.sessionForm.sessionDatesHint")}
              </p>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={t("admin.sessionForm.startDate")}>
                  <input
                    type="date"
                    required
                    value={form.start_date}
                    onChange={(e) =>
                      handleChange("start_date", e.target.value)
                    }
                    className="input-text"
                  />
                </Field>

                <Field label={t("admin.sessionForm.endDate")}>
                  <input
                    type="date"
                    required
                    value={form.end_date}
                    onChange={(e) => handleChange("end_date", e.target.value)}
                    className="input-text"
                  />
                </Field>

                <Field label={t("admin.sessionForm.registrationDeadline")}>
                  <input
                    type="date"
                    required
                    value={form.registration_deadline}
                    onChange={(e) =>
                      handleChange("registration_deadline", e.target.value)
                    }
                    className="input-text"
                  />
                </Field>

                <Field label={t("admin.sessionForm.documentUploadDeadline")}>
                  <input
                    type="date"
                    value={form.document_upload_deadline}
                    onChange={(e) =>
                      handleChange("document_upload_deadline", e.target.value)
                    }
                    className="input-text"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={t("admin.sessionForm.confirmationDelay")}>
                  <input
                    type="number"
                    min="0"
                    max="8760"
                    value={form.confirmation_delay_hours}
                    onChange={(e) =>
                      handleChange(
                        "confirmation_delay_hours",
                        e.target.value
                      )
                    }
                    className="input-text"
                  />
                </Field>

                <Field label={t("admin.sessionForm.substitutesCount")}>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={form.substitutes_count}
                    onChange={(e) =>
                      handleChange("substitutes_count", e.target.value)
                    }
                    className="input-text"
                  />
                </Field>
              </div>
            </div>
          </section>

          {showDrawFields && (
            <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E2DC]">
                <h2 className="text-[24px] font-bold text-[#2F343B]">
                  {t("admin.sessionForm.drawSettings")}
                </h2>
                <p className="text-sm text-[#7A8088] mt-1">
                  {t("admin.sessionForm.drawSettingsHint")}
                </p>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label={t("admin.sessionForm.drawDate")}>
                    <input
                      type="date"
                      value={form.draw_date}
                      onChange={(e) =>
                        handleChange("draw_date", e.target.value)
                      }
                      className="input-text"
                    />
                  </Field>

                  <Field label={t("admin.sessionForm.drawLocation")}>
                    <input
                      type="text"
                      value={form.draw_location}
                      onChange={(e) =>
                        handleChange("draw_location", e.target.value)
                      }
                      placeholder={t("admin.sessionForm.drawLocationPlaceholder")}
                      className="input-text"
                    />
                  </Field>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DC]">
              <h2 className="text-[24px] font-bold text-[#2F343B]">
                {t("admin.sessionForm.logistics")}
              </h2>
              <p className="text-sm text-[#7A8088] mt-1">
                {t("admin.sessionForm.logisticsHint")}
              </p>
            </div>

            <div className="p-5 space-y-5">
              <ToggleCard
                title={t("admin.sessionForm.transportCovered")}
                description={t("admin.sessionForm.transportHint")}
                checked={form.transport_included}
                onToggle={() =>
                  handleChange("transport_included", !form.transport_included)
                }
              />

              <Field label={t("admin.sessionForm.telefax")}>
                <input
                  type="text"
                  value={form.telefax_url}
                  onChange={(e) =>
                    handleChange("telefax_url", e.target.value)
                  }
                  placeholder={t("admin.sessionForm.telefaxPlaceholder")}
                  className="input-text"
                />
              </Field>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
              >
                {t("common.cancel")}
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors disabled:opacity-60"
            >
              {submitting ? t("common.saving") : (submitLabel || t("admin.createSession.save"))}
            </button>
          </div>
        </div>

        {/* Right side */}
        <div className="space-y-6">
          <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DC]">
              <h3 className="text-[24px] font-bold text-[#2F343B]">
                {t("admin.sessionForm.sessionStatus")}
              </h3>
              <p className="text-sm text-[#7A8088] mt-1">
                {t("admin.sessionForm.sessionStatusHint")}
              </p>
            </div>

            <div className="p-5">
              <Field label={t("common.status")}>
                <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="input-text"
                >
                  {STATUS_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {t(`statuses.${v}`)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className="rounded-[24px] bg-white border border-[#E5E2DC] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E2DC]">
              <h3 className="text-[24px] font-bold text-[#2F343B]">
                {t("admin.sessionForm.previewSummary")}
              </h3>
              <p className="text-sm text-[#7A8088] mt-1">
                {t("admin.sessionForm.previewHint")}
              </p>
            </div>

            <div className="p-5 space-y-3">
              <SummaryRow label={t("admin.sessionForm.summaryStart")} value={form.start_date || t("common.notSet")} />
              <SummaryRow label={t("admin.sessionForm.summaryEnd")} value={form.end_date || t("common.notSet")} />
              <SummaryRow
                label={t("admin.sessionForm.summaryRegDeadline")}
                value={form.registration_deadline || t("common.notSet")}
              />
              <SummaryRow
                label={t("admin.sessionForm.summaryDocsDeadline")}
                value={form.document_upload_deadline || t("common.notSet")}
              />
              <SummaryRow
                label={t("admin.sessionForm.summaryDrawDate")}
                value={form.draw_date || t("common.notSet")}
              />
              <SummaryRow
                label={t("admin.sessionForm.summaryTransport")}
                value={form.transport_included ? t("admin.sessionForm.transportCoveredYes") : t("admin.sessionForm.transportCoveredNo")}
              />
              <SummaryRow
                label={t("admin.sessionForm.summarySubstitutes")}
                value={String(form.substitutes_count)}
              />
              <SummaryRow
                label={t("common.status")}
                value={t(`statuses.${form.status}`)}
              />
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .input-text {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 14px;
          border: 1px solid #E5E2DC;
          background: #F7F7F5;
          font-size: 0.875rem;
          outline: none;
        }
        .input-text:focus {
          border-color: #ED8D31;
        }
      `}</style>
    </form>
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

function ToggleCard({ title, description, checked, onToggle }) {
  return (
    <div className="rounded-[18px] border border-[#E5E2DC] bg-[#FBFAF8] p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[#2F343B]">{title}</p>
        <p className="text-xs text-[#7A8088] mt-1 leading-[160%]">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? "bg-[#ED8D31]" : "bg-[#E5E2DC]"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
            checked ? "left-5" : "left-1"
          }`}
        />
      </button>
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
