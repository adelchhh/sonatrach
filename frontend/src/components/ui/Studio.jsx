import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import DashboardSidebar from "../dashboard/DashboardSidebar";
import DashboardTopBar from "../dashboard/DashboardTopBar";
import {
  easings,
  fadeIn,
  fadeInDown,
  fadeInUp,
  modalOverlay,
  modalPanel,
  staggerContainer,
  staggerItem,
} from "./motion";

/**
 * Sonatrach UI Studio — primitives partagées au design Netflix/Amazon
 * Palette stricte : blanc / noir / orange #ED8D31 / gris.
 *
 * Composants exportés :
 *   PageShell, PageHero, PageHeader, SectionHeader,
 *   StatBar, StatCell, Toolbar, FilterChip, SearchInput,
 *   DataPanel, DataTable, StatusPill, Modal, EmptyState,
 *   Button, IconButton, Card, ActionCard, Breadcrumbs
 */

/* ════════════════════════════════════════════════ */
/*  SHELL — sidebar + topbar + main                 */
/* ════════════════════════════════════════════════ */

export function PageShell({ children }) {
  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto bg-white">{children}</main>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════ */
/*  HERO — black banner for top of pages            */
/* ════════════════════════════════════════════════ */

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  actions,
  breadcrumbs,
  height = "compact", // compact | tall
}) {
  const h = height === "tall" ? "h-[420px]" : "h-[300px]";
  return (
    <section className={`relative ${h} bg-black overflow-hidden`}>
      {image && (
        <>
          <img
            src={image}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </>
      )}
      {!image && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at 20% 20%, rgba(237,141,49,0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(60,60,60,0.4) 0%, transparent 50%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(0deg, white 1px, transparent 1px)",
              backgroundSize: "70px 70px",
            }}
          />
        </div>
      )}

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative h-full flex flex-col justify-end px-8 lg:px-12 pb-10 z-10 max-w-[1400px]"
      >
        {breadcrumbs && (
          <motion.div variants={staggerItem} className="mb-5">
            <Breadcrumbs items={breadcrumbs} variant="dark" />
          </motion.div>
        )}
        {eyebrow && (
          <motion.p
            variants={staggerItem}
            className="text-[#ED8D31] text-[11px] uppercase tracking-[0.35em] font-bold mb-3"
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          variants={staggerItem}
          className="text-white font-bold leading-[1.05] tracking-[-0.02em] max-w-[820px]"
          style={{ fontSize: "clamp(32px, 4.5vw, 56px)" }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            variants={staggerItem}
            className="text-white/80 text-[15px] leading-[1.65] max-w-[640px] mt-4"
          >
            {subtitle}
          </motion.p>
        )}
        {actions && (
          <motion.div variants={staggerItem} className="flex flex-wrap gap-3 mt-7">
            {actions}
          </motion.div>
        )}
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ED8D31]/50 to-transparent" />
    </section>
  );
}

/* ════════════════════════════════════════════════ */
/*  BREADCRUMBS                                     */
/* ════════════════════════════════════════════════ */

export function Breadcrumbs({ items, variant = "light" }) {
  const colors =
    variant === "dark"
      ? {
          link: "text-white/55 hover:text-[#ED8D31]",
          sep: "text-white/30",
          current: "text-white",
        }
      : {
          link: "text-[#737373] hover:text-[#ED8D31]",
          sep: "text-[#A3A3A3]",
          current: "text-[#0A0A0A]",
        };
  return (
    <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {item.to && !isLast ? (
              <Link to={item.to} className={`${colors.link} transition-colors`}>
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? colors.current : colors.link}>
                {item.label}
              </span>
            )}
            {!isLast && <span className={colors.sep}>·</span>}
          </span>
        );
      })}
    </nav>
  );
}

/* ════════════════════════════════════════════════ */
/*  LIGHT PAGE HEADER (no image hero)               */
/* ════════════════════════════════════════════════ */

export function PageHeader({ eyebrow, title, subtitle, actions, breadcrumbs }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="px-8 lg:px-12 pt-10 pb-8 bg-white border-b border-[#E5E5E5]"
    >
      <div className="max-w-[1400px] mx-auto">
        {breadcrumbs && (
          <motion.div variants={staggerItem} className="mb-5">
            <Breadcrumbs items={breadcrumbs} />
          </motion.div>
        )}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            {eyebrow && (
              <motion.p
                variants={staggerItem}
                className="text-[#ED8D31] text-[11px] uppercase tracking-[0.35em] font-bold mb-3"
              >
                {eyebrow}
              </motion.p>
            )}
            <motion.h1
              variants={staggerItem}
              className="text-[#0A0A0A] font-bold tracking-[-0.02em] leading-tight"
              style={{ fontSize: "clamp(32px, 3.5vw, 44px)" }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                variants={staggerItem}
                className="text-[#737373] text-[14px] mt-3 max-w-[680px] leading-[1.65]"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
          {actions && (
            <motion.div
              variants={staggerItem}
              className="flex flex-wrap gap-3 items-center"
            >
              {actions}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════ */
/*  SECTION HEADER                                  */
/* ════════════════════════════════════════════════ */

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h2 className="text-[#0A0A0A] text-[22px] lg:text-[26px] font-bold tracking-[-0.018em] leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[#737373] text-[13px] mt-1.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ════════════════════════════════════════════════ */
/*  STAT BAR                                        */
/* ════════════════════════════════════════════════ */

export function StatBar({ children }) {
  const count = Array.isArray(children) ? children.length : 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easings.smooth }}
      className="bg-white border border-[#E5E5E5] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)]"
    >
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid divide-x divide-[#E5E5E5]"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function StatCell({ label, value, sub, accent = false }) {
  const isNumeric = typeof value === "number" && Number.isFinite(value);

  return (
    <motion.div variants={staggerItem} className="px-5 py-5">
      <p className="text-[#737373] text-[10px] uppercase tracking-[0.18em] font-bold mb-2">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <p
          className={`text-[28px] lg:text-[32px] font-bold leading-none tabular-nums tracking-tight ${
            accent ? "text-[#ED8D31]" : "text-[#0A0A0A]"
          }`}
        >
          {isNumeric ? <AnimatedNumber value={value} /> : value}
        </p>
        <span className="w-1 h-1 rounded-full bg-[#ED8D31] mb-1.5" />
      </div>
      {sub && <p className="text-[#A3A3A3] text-[11px] mt-2">{sub}</p>}
    </motion.div>
  );
}

/** Compteur qui monte de 0 vers la valeur cible. Durée capée pour rester pro. */
export function AnimatedNumber({ value, duration = 0.9 }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString("fr-FR"));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: easings.smooth,
    });
    return () => controls.stop();
  }, [value, duration, motionValue]);

  return <motion.span>{rounded}</motion.span>;
}

/* ════════════════════════════════════════════════ */
/*  TOOLBAR — search + filters                      */
/* ════════════════════════════════════════════════ */

export function Toolbar({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easings.smooth, delay: 0.05 }}
      className="bg-white border border-[#E5E5E5] p-4 flex flex-wrap items-center gap-3"
    >
      {children}
    </motion.div>
  );
}

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1 min-w-[240px]">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M9.5 9.5L12 12"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] text-[13px] text-[#0A0A0A] placeholder:text-[#A3A3A3] outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors"
      />
    </div>
  );
}

export function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors min-w-[150px] cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 text-[12px] uppercase tracking-[0.12em] font-bold transition-colors border ${
        active
          ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
          : "bg-white text-[#0A0A0A] border-[#E5E5E5] hover:border-[#0A0A0A]"
      }`}
    >
      {label}
    </button>
  );
}

/* ════════════════════════════════════════════════ */
/*  DATA PANEL                                      */
/* ════════════════════════════════════════════════ */

export function DataPanel({ title, subtitle, badge, action, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.4, ease: easings.smooth }}
      className="bg-white border border-[#E5E5E5] overflow-hidden"
    >
      {(title || badge || action) && (
        <div className="px-6 py-5 border-b border-[#E5E5E5] flex flex-wrap items-center justify-between gap-3">
          <div>
            {title && (
              <div className="flex items-center gap-3">
                <h3 className="text-[#0A0A0A] text-[18px] font-bold tracking-[-0.01em]">
                  {title}
                </h3>
                {badge != null && (
                  <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#737373] tabular-nums">
                    {badge}
                  </span>
                )}
              </div>
            )}
            {subtitle && (
              <p className="text-[#737373] text-[12px] mt-1">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}

/* ════════════════════════════════════════════════ */
/*  DATA TABLE                                      */
/* ════════════════════════════════════════════════ */

export function DataTable({ columns, rows, emptyText = "Aucun élément." }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#0A0A0A]">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-[0.18em] whitespace-nowrap"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-14 text-center text-[13px] text-[#737373]"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.key || i}
                className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
              >
                {columns.map((col, j) => (
                  <td
                    key={j}
                    className="px-6 py-4 text-[13px] text-[#0A0A0A] align-top"
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ════════════════════════════════════════════════ */
/*  STATUS PILL                                     */
/* ════════════════════════════════════════════════ */

const STATUS_TONES = {
  // grayscale + orange + a small palette of muted accents
  success: { bg: "bg-[#0A0A0A]", text: "text-white", dot: "bg-[#22C55E]" },
  warn: { bg: "bg-[#FFF7E8]", text: "text-[#7A4F0A]", dot: "bg-[#ED8D31]" },
  danger: { bg: "bg-[#FFEFEF]", text: "text-[#9F1F1F]", dot: "bg-[#DC2626]" },
  info: { bg: "bg-[#F5F5F5]", text: "text-[#0A0A0A]", dot: "bg-[#737373]" },
  accent: { bg: "bg-[#ED8D31]", text: "text-black", dot: "bg-black" },
  neutral: { bg: "bg-[#F5F5F5]", text: "text-[#525252]", dot: "bg-[#A3A3A3]" },
};

export function StatusPill({ label, tone = "neutral", solid = false }) {
  const c = STATUS_TONES[tone] || STATUS_TONES.neutral;
  if (solid) {
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-bold ${c.bg} ${c.text}`}
      >
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-bold bg-white border border-[#E5E5E5] text-[#0A0A0A]">
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {label}
    </span>
  );
}

/* ════════════════════════════════════════════════ */
/*  BUTTONS                                         */
/* ════════════════════════════════════════════════ */

const MotionLink = motion.create(Link);

export function Button({
  children,
  variant = "primary",
  to,
  onClick,
  disabled,
  type = "button",
  size = "md",
  icon,
}) {
  const sizing = {
    sm: "px-3.5 py-2 text-[11px] uppercase tracking-[0.15em]",
    md: "px-5 py-2.5 text-[12px] uppercase tracking-[0.15em]",
    lg: "px-7 py-3.5 text-[13px] uppercase tracking-[0.18em]",
  }[size];

  const variants = {
    primary:
      "bg-[#ED8D31] text-black font-bold hover:bg-[#fa9d40] disabled:opacity-50",
    dark: "bg-[#0A0A0A] text-white font-bold hover:bg-black disabled:opacity-50",
    outline:
      "bg-white border border-[#E5E5E5] text-[#0A0A0A] font-bold hover:border-[#0A0A0A] disabled:opacity-50",
    ghost: "bg-transparent text-[#0A0A0A] font-bold hover:bg-[#FAFAFA]",
    danger:
      "bg-white border border-[#FFD1D1] text-[#9F1F1F] font-bold hover:bg-[#FFEFEF]",
  };

  const cls = `inline-flex items-center justify-center gap-2 transition-colors ${sizing} ${variants[variant]}`;
  const motionProps = {
    whileTap: disabled ? undefined : { scale: 0.97 },
    transition: { duration: 0.12, ease: easings.swift },
  };

  if (to) {
    return (
      <MotionLink to={to} className={cls} {...motionProps}>
        {icon}
        {children}
      </MotionLink>
    );
  }
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cls}
      {...motionProps}
    >
      {icon}
      {children}
    </motion.button>
  );
}

export function IconButton({ children, onClick, title, variant = "outline" }) {
  const variants = {
    outline:
      "bg-white border border-[#E5E5E5] text-[#0A0A0A] hover:border-[#0A0A0A]",
    dark: "bg-[#0A0A0A] text-white hover:bg-black",
    ghost: "bg-transparent text-[#0A0A0A] hover:bg-[#FAFAFA]",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-9 h-9 flex items-center justify-center transition-colors ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════ */
/*  EMPTY STATE                                     */
/* ════════════════════════════════════════════════ */

export function EmptyState({ title, description, action, icon = "▢" }) {
  return (
    <div className="border border-dashed border-[#E5E5E5] bg-[#FAFAFA] py-16 px-8 text-center">
      <div className="text-[40px] text-[#A3A3A3] mb-4">{icon}</div>
      <h3 className="text-[#0A0A0A] text-[16px] font-bold mb-2">{title}</h3>
      {description && (
        <p className="text-[#737373] text-[13px] max-w-[420px] mx-auto leading-[1.6] mb-5">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

/* ════════════════════════════════════════════════ */
/*  MODAL                                           */
/* ════════════════════════════════════════════════ */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "md",
}) {
  const w = {
    sm: "max-w-[400px]",
    md: "max-w-[500px]",
    lg: "max-w-[680px]",
    xl: "max-w-[860px]",
  }[width];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...modalOverlay}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            {...modalPanel}
            className={`bg-white w-full ${w} border border-[#E5E5E5] shadow-2xl max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-7 py-6 border-b border-[#E5E5E5]">
              {title && (
                <h2 className="text-[#0A0A0A] text-[20px] font-bold tracking-[-0.01em]">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-[#737373] text-[13px] mt-2 leading-[1.6]">
                  {description}
                </p>
              )}
            </div>
            {children && <div className="px-7 py-6">{children}</div>}
            {footer && (
              <div className="px-7 py-5 border-t border-[#E5E5E5] bg-[#FAFAFA] flex justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ════════════════════════════════════════════════ */
/*  CARD — generic                                  */
/* ════════════════════════════════════════════════ */

export function Card({ children, className = "" }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22, ease: easings.smooth }}
      className={`bg-white border border-[#E5E5E5] p-5 hover:border-[#0A0A0A] transition-colors ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════ */
/*  ALERT BANNER                                    */
/* ════════════════════════════════════════════════ */

export function Alert({ tone = "info", title, children, onClose }) {
  const tones = {
    info: "border-[#E5E5E5] bg-[#FAFAFA] text-[#0A0A0A]",
    success: "border-[#0A0A0A] bg-[#0A0A0A] text-white",
    warn: "border-[#ED8D31] bg-[#FFF7E8] text-[#7A4F0A]",
    danger: "border-[#FFD1D1] bg-[#FFEFEF] text-[#9F1F1F]",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: easings.smooth }}
      className={`border ${tones[tone]} px-5 py-4 flex items-start gap-4`}
    >
      <div className="flex-1">
        {title && <p className="font-bold text-[13px] mb-1">{title}</p>}
        {children && (
          <div className="text-[12px] leading-[1.65] opacity-90">{children}</div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-[18px] leading-none opacity-60 hover:opacity-100"
        >
          ×
        </button>
      )}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════ */
/*  TEXT FIELD / TEXT AREA                          */
/* ════════════════════════════════════════════════ */

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  hint,
  error,
}) {
  return (
    <label className="block">
      {label && (
        <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] mb-2">
          {label}
          {required && <span className="text-[#ED8D31] ml-1">*</span>}
        </span>
      )}
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] text-[14px] text-[#0A0A0A] placeholder:text-[#A3A3A3] outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors"
      />
      {hint && !error && (
        <p className="text-[11px] text-[#737373] mt-1.5">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-[#9F1F1F] mt-1.5 font-medium">{error}</p>
      )}
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required,
  hint,
}) {
  return (
    <label className="block">
      {label && (
        <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] mb-2">
          {label}
          {required && <span className="text-[#ED8D31] ml-1">*</span>}
        </span>
      )}
      <textarea
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] text-[14px] text-[#0A0A0A] placeholder:text-[#A3A3A3] outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors resize-y"
      />
      {hint && <p className="text-[11px] text-[#737373] mt-1.5">{hint}</p>}
    </label>
  );
}

export function Select({ label, value, onChange, options, required, hint }) {
  return (
    <label className="block">
      {label && (
        <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] mb-2">
          {label}
          {required && <span className="text-[#ED8D31] ml-1">*</span>}
        </span>
      )}
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] text-[14px] text-[#0A0A0A] outline-none focus:border-[#0A0A0A] focus:bg-white transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-[11px] text-[#737373] mt-1.5">{hint}</p>}
    </label>
  );
}

/* ════════════════════════════════════════════════ */
/*  PAGE BODY — consistent padding wrapper          */
/* ════════════════════════════════════════════════ */

export function PageBody({ children, className = "" }) {
  return (
    <div className="px-8 lg:px-12 py-10">
      <div className={`max-w-[1400px] mx-auto space-y-8 ${className}`}>
        {children}
      </div>
    </div>
  );
}
