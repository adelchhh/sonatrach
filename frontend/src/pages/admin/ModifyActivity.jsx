import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../../components/dashboard/DashboardTopBar";
import { API_BASE_URL, apiGet, apiPostForm, apiDelete } from "../../api";
import { useT } from "../../i18n/LanguageContext";

const STATUS_BADGE = {
  PUBLISHED: "bg-[#D4F4DD] text-[#2D7A4A]",
  DRAFT: "bg-[#FFF4D6] text-[#B98900]",
  ARCHIVED: "bg-[#F1F0EC] text-[#7A8088]",
  CANCELLED: "bg-[#FBE4E4] text-[#A23B3B]",
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

  const CATEGORY_OPTIONS = [
    { value: "SPORT", label: t("categories.SPORT") },
    { value: "FAMILY", label: t("categories.FAMILY") || "Family" },
    { value: "STAY", label: t("categories.STAY") || "Stay" },
    { value: "NATURE", label: t("categories.NATURE") || "Nature" },
    { value: "SPIRITUAL", label: t("categories.SPIRITUAL") || "Spiritual" },
    { value: "TRAVEL", label: t("categories.TRAVEL") || "Travel" },
    { value: "LEISURE", label: t("categories.LEISURE") },
  ];
  const DEMAND_OPTIONS = [
    { value: "HIGH", label: "High" },
    { value: "MEDIUM", label: "Medium" },
    { value: "LOW", label: "Low" },
  ];
  const STATUS_OPTIONS = [
    { value: "DRAFT", label: t("statuses.DRAFT") },
    { value: "PUBLISHED", label: t("statuses.PUBLISHED") },
    { value: "ARCHIVED", label: t("statuses.ARCHIVED") },
    { value: "CANCELLED", label: t("statuses.CANCELLED") },
  ];

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
        setError(err.message || t("common.serverError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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
      setError(t("common.genericError"));
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
      setError(err.message || t("common.serverError"));
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm(t("admin.activities.modal.archiveText"))) return;
    try {
      await apiPostForm(`/activities/${id}`, { status: "ARCHIVED", _method: "PUT" });
      navigate("/dashboard/admin/activities");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("admin.site.deleteTitle"))) return;
    try {
      await apiDelete(`/activities/${id}`);
      navigate("/dashboard/admin/activities");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F7F7F5]">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopBar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="text-center text-[#7A8088] py-10">{t("common.loading")}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F7F7F5]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="text-sm text-[#7A8088]">
              <Link to="/dashboard/admin/activities" className="text-[#ED8D31] font-medium">
                {t("admin.activities.title")}
              </Link>{" "}
              <span className="mx-2">›</span>
              <span>{form.title}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-[38px] font-extrabold text-[#2F343B] leading-[110%]">
                    {t("admin.activities.modify")}: {form.title}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_BADGE[form.status] || ""}`}>
                    {t(`statuses.${form.status}`) || form.status}
                  </span>
                </div>
                <p className="text-[#7A8088] text-sm leading-[170%]">
                  {t("admin.createActivity.subtitle")}
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  to="/dashboard/admin/activities"
                  className="px-5 py-3 rounded-[14px] border border-[#E5E2DC] bg-white text-[#2F343B] text-sm font-semibold"
                >
                  {t("common.cancel")}
                </Link>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-3 rounded-[14px] bg-[#ED8D31] text-white text-sm font-semibold hover:bg-[#d97d26] transition-colors disabled:opacity-60"
                >
                  {saving ? t("common.saving") : t("common.save")}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_340px] gap-6">
              <div className="space-y-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h2 className="text-[28px] font-bold text-[#2F343B]">{t("admin.createActivity.basicInfo")}</h2>
                  <p className="text-sm text-[#7A8088] mt-1 mb-5">
                    {t("admin.createActivity.basicInfoHint")}
                  </p>

                  <div className="space-y-5">
                    <Field label={t("admin.createActivity.activityTitle")}>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <Field label={t("admin.createActivity.description")}>
                      <textarea
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm resize-none"
                      />
                    </Field>

                    <Field label={t("common.all")}>
                      <select
                        value={form.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h2 className="text-[28px] font-bold text-[#2F343B]">{t("admin.createActivity.rules")}</h2>
                  <p className="text-sm text-[#7A8088] mt-1 mb-5">
                    {t("admin.createActivity.rulesHint")}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Field label={t("admin.createActivity.minimumSeniority")}>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={form.minimum_seniority}
                        onChange={(e) => handleChange("minimum_seniority", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      />
                    </Field>

                    <Field label={t("activityDetail.demandLevel")}>
                      <select
                        value={form.demand_level}
                        onChange={(e) => handleChange("demand_level", e.target.value)}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        {DEMAND_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label={t("admin.createActivity.requiresDraw")}>
                      <select
                        value={form.draw_enabled ? "Yes" : "No"}
                        onChange={(e) => handleChange("draw_enabled", e.target.value === "Yes")}
                        className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                      >
                        <option value="Yes">{t("common.yes")}</option>
                        <option value="No">{t("common.no")}</option>
                      </select>
                    </Field>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[24px] font-bold text-[#2F343B]">{t("admin.createActivity.coverImage")}</h3>
                  <p className="text-sm text-[#7A8088] mt-1 mb-4">
                    {t("admin.createActivity.basicInfoHint")}
                  </p>

                  {(imagePreview || form.image_url) && (
                    <img
                      src={imagePreview || imageUrlOf(form.image_url)}
                      alt=""
                      className="w-full h-[180px] rounded-[16px] object-cover mb-4"
                    />
                  )}

                  <label className="block w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] text-sm font-semibold text-[#2F343B] bg-white text-center cursor-pointer">
                    {t("admin.createActivity.uploadHint")}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </section>

                <section className="rounded-[24px] bg-white border border-[#E5E2DC] p-5">
                  <h3 className="text-[24px] font-bold text-[#2F343B]">{t("admin.createActivity.publishingStatus")}</h3>
                  <p className="text-sm text-[#7A8088] mt-1 mb-4">
                    {t("admin.createActivity.publishingHint")}
                  </p>

                  <Field label={t("common.status")}>
                    <select
                      value={form.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2DC] bg-[#F7F7F5] outline-none text-sm"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </Field>
                </section>

                <section className="rounded-[24px] border border-[#F0B1B1] bg-white p-5 space-y-3">
                  <h3 className="text-[24px] font-bold text-[#D85C5C]">{t("sg.dangerZone")}</h3>

                  <button
                    onClick={handleArchive}
                    className="w-full px-4 py-3 rounded-[14px] border border-[#F0B1B1] text-[#D85C5C] text-sm font-semibold bg-white hover:bg-[#FFF7F7] transition-colors"
                  >
                    {t("admin.activities.archive")}
                  </button>

                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-3 rounded-[14px] bg-[#D85C5C] text-white text-sm font-semibold hover:bg-[#c04d4d] transition-colors"
                  >
                    {t("common.delete")}
                  </button>
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
