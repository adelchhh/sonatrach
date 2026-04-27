import { useState } from "react";
import { Link } from "react-router-dom";
import loginBg from "../assets/login/login-bg.jpg";
import { apiPost } from "../api";
import { useT } from "../i18n/LanguageContext";

export default function Login() {
  const t = useT();
  const [showPassword, setShowPassword] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = await apiPost("/login", {
        employee_number: employeeId,
        password: password,
      });

      localStorage.setItem("user", JSON.stringify(data.user));

      const roles = data.user.roles || [];
      if (roles.includes("SYSTEM_ADMIN")) {
        window.location.href = "/dashboard/system/system-admins";
      } else if (roles.includes("FUNCTIONAL_ADMIN")) {
        window.location.href = "/dashboard/admin/activities";
      } else if (roles.includes("COMMUNICATOR")) {
        window.location.href = "/dashboard/communicator/announcements";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Server error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel - Building Image */}
      <div className="relative hidden md:flex md:w-[56%] flex-col justify-end overflow-hidden">
        {/* Background Image */}
        <img
  src={loginBg}
  alt="Sonatrach headquarters"
  className="absolute inset-0 w-full h-full object-cover object-center"
/>


        

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(30,34,40,0.18) 0%, rgba(30,34,40,0.32) 40%, rgba(30,34,40,0.72) 100%)",
          }}
        />



        {/* Bottom content */}
        <div className="relative z-10 p-10 pb-12">
          <h1 className="text-white font-bold leading-[1.06] tracking-[-1.5px] mb-4"
              style={{ fontSize: "clamp(36px, 4vw, 52px)" }}>
            {t("login.panelTitle")}
          </h1>
          <p className="text-[rgba(255,255,255,0.82)] text-base font-normal leading-[170%] max-w-[420px]">
            {t("login.panelSubtitle")}
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 flex-col bg-[#F7F7F5] px-8 py-10 md:px-14 lg:px-20 overflow-y-auto">
        {/* Back to home */}
        <div className="mb-10">
          <Link
            to="/"
            className="flex items-center gap-2 text-[#7A8088] text-sm font-medium hover:text-[#2F343B] transition-colors group"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("login.back")}
          </Link>
        </div>

        {/* Form content, vertically centered */}
        <div className="flex flex-col justify-center flex-1 max-w-[400px] w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/af72391ae8971f15efed2311d265b92f2f3a69fd?width=84"
              alt="Sonatrach"
              className="w-11 h-11 rounded-[10px] object-cover"
            />
            <span className="text-[#2F343B] font-bold text-2xl tracking-[-0.72px]">
              SONATRACH
            </span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-[#2F343B] font-bold text-[36px] leading-[112%] tracking-[-1px] mb-2">
              {t("login.welcome")}
            </h2>
            <p className="text-[#7A8088] text-[15px] font-normal leading-[170%]">
              {t("login.subtitle")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="rounded-[12px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            {/* Employee ID */}
            <div className="flex flex-col gap-2">
              <label className="text-[#2F343B] text-sm font-semibold leading-[21px]">
                {t("login.employeeId")}
              </label>
              <div className="flex items-center gap-3 px-4 py-[13px] rounded-[14px] border border-[#E5E2DC] bg-white focus-within:border-[#ED8D31] focus-within:ring-2 focus-within:ring-[rgba(237,141,49,0.12)] transition-all">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="flex-shrink-0 text-[#7A8088]"
                >
                  <path
                    d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
                    stroke="currentColor"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.66699 14C2.66699 11.0545 5.05448 8.66699 8.00033 8.66699C10.9462 8.66699 13.3337 11.0545 13.3337 14"
                    stroke="currentColor"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder={t("login.employeeIdPlaceholder")}
                  className="flex-1 bg-transparent text-[#2F343B] text-sm font-normal placeholder-[#B0B5BB] outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[#2F343B] text-sm font-semibold leading-[21px]">
                {t("login.password")}
              </label>
              <div className="flex items-center gap-3 px-4 py-[13px] rounded-[14px] border border-[#E5E2DC] bg-white focus-within:border-[#ED8D31] focus-within:ring-2 focus-within:ring-[rgba(237,141,49,0.12)] transition-all">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="flex-shrink-0 text-[#7A8088]"
                >
                  <rect
                    x="2"
                    y="7.33333"
                    width="12"
                    height="7.33333"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.33333"
                  />
                  <path
                    d="M4.66699 7.33333V5.33333C4.66699 3.49238 6.15938 2 8.00033 2C9.84127 2 11.3337 3.49238 11.3337 5.33333V7.33333"
                    stroke="currentColor"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-[#2F343B] text-sm font-normal placeholder-[#B0B5BB] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex-shrink-0 text-[#7A8088] hover:text-[#2F343B] transition-colors"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 8C2 8 4.36364 3.63636 8 3.63636C11.6364 3.63636 14 8 14 8C14 8 11.6364 12.3636 8 12.3636C4.36364 12.3636 2 8 2 8Z"
                        stroke="currentColor"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="8" cy="8" r="1.81818" stroke="currentColor" strokeWidth="1.33333" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2.66699 2.66663L13.3337 13.3333M6.59499 6.59534C6.22295 6.96817 5.99967 7.4777 5.99967 8.03996C5.99967 9.14449 6.89514 10.04 8.00033 10.04C8.56313 10.04 9.07303 9.8166 9.44564 9.44396M4.26766 4.25996C3.06766 5.10929 2.04966 6.3373 1.33367 8.03996C2.43833 10.6493 5.02833 12.48 8.00033 12.48C9.23367 12.48 10.3837 12.1466 11.3803 11.5666M7.08566 3.62929C7.38566 3.57996 7.69233 3.55996 8.00033 3.55996C10.9723 3.55996 13.563 5.3913 14.667 7.99996C14.4143 8.59729 14.0977 9.14729 13.7263 9.63996"
                        stroke="currentColor"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    rememberMe
                      ? "bg-[#ED8D31] border-[#ED8D31]"
                      : "border-[#D0CCC6] bg-white"
                  }`}
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5L4 7L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-[#50565E] text-sm font-normal">
                  {t("login.rememberMe")}
                </span>
              </label>
              <a
                href="#"
                className="text-[#ED8D31] text-sm font-semibold hover:opacity-80 transition-opacity"
              >
                {t("login.forgotPassword")}
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 w-full py-[14px] rounded-[14px] bg-[#ED8D31] text-white text-base font-semibold hover:bg-[#d47d29] active:bg-[#c06e22] transition-colors mt-1 shadow-[0_4px_14px_0_rgba(237,141,49,0.28)] disabled:opacity-60"
            >
              {submitting ? t("login.signingIn") : t("login.signIn")}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3.33301 7.99992H12.6663M7.99967 3.33325L12.6663 7.99992L7.99967 12.6666"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}