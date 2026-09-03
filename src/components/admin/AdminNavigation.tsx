import {
  Bell,
  CalendarDays,
  FileText,
  FolderOpen,
  Headphones,
  LayoutDashboard,
  ShoppingBag,
  Users,
  Wrench,
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import { translate } from "../../i18n";
import {
  adminTranslations,
  type AdminCopyKey,
} from "../../i18n/locales/admin";

type AdminSection =
  | "dashboard"
  | "clients"
  | "quotes"
  | "services"
  | "appointments"
  | "documents"
  | "support"
  | "store"
  | "notifications";

type AdminNavigationProps = {
  activeSection: AdminSection;
  onChange: (section: AdminSection) => void;
  unreadCounts?: Partial<
    Record<AdminSection, number>
  >;
};

const items: Array<{
  id: AdminSection;
  labelKey: AdminCopyKey;
  icon: typeof LayoutDashboard;
}> = [
  {
    id: "dashboard",
    labelKey: "overview",
    icon: LayoutDashboard,
  },
  {
    id: "clients",
    labelKey: "clients",
    icon: Users,
  },
  {
    id: "quotes",
    labelKey: "quotesRequests",
    icon: FileText,
  },
  {
    id: "services",
    labelKey: "interventions",
    icon: Wrench,
  },
  {
    id: "appointments",
    labelKey: "appointments",
    icon: CalendarDays,
  },
  {
    id: "documents",
    labelKey: "documents",
    icon: FolderOpen,
  },
  {
    id: "support",
    labelKey: "support",
    icon: Headphones,
  },
  {
    id: "store",
    labelKey: "tsbStore",
    icon: ShoppingBag,
  },
  {
    id: "notifications",
    labelKey: "notifications",
    icon: Bell,
  },
];

function AdminNavigation({
  activeSection,
  onChange,
  unreadCounts = {},
}: AdminNavigationProps) {
  const { locale } = useLanguage();

  const at = (key: AdminCopyKey) =>
    translate(
      adminTranslations,
      locale,
      `admin.copy.${key}`
    );

  return (
    <nav
      aria-label={at("administrationNavigation")}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "5px",
        overflowX: "visible",
        padding: "6px",
        marginBottom: "18px",
        borderRadius: "18px",
        border:
          "1px solid rgba(255,255,255,0.08)",
        background:
          "rgba(255,255,255,0.035)",
        WebkitOverflowScrolling: "touch",
        alignItems: "center",
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          activeSection === item.id;
        const unreadCount =
          unreadCounts[item.id] ?? 0;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              onChange(item.id)
            }
            style={{
              minWidth: 0,
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding:
                item.id === "dashboard"
                  ? "8px 8px"
                  : "8px 9px",
              borderRadius: "12px",
              border: isActive
                ? "1px solid rgba(56,189,248,0.55)"
                : "1px solid transparent",
              background: isActive
                ? "rgba(56,189,248,0.12)"
                : "transparent",
              color: isActive
                ? "#38bdf8"
                : "rgba(255,255,255,0.72)",
              fontSize:
                item.id === "dashboard"
                  ? "0.76rem"
                  : "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              transition:
                "background 0.2s ease, color 0.2s ease, border-color 0.2s ease",
            }}
          >
            <Icon
              size={
                item.id === "dashboard"
                  ? 15
                  : 16
              }
            />

            {at(item.labelKey)}

            {unreadCount > 0 && (
              <span
                aria-label={String(unreadCount)}
                style={{
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 5px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "999px",
                  background: "#1688ff",
                  color: "#ffffff",
                  fontSize: "0.64rem",
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export type { AdminSection };
export default AdminNavigation;
