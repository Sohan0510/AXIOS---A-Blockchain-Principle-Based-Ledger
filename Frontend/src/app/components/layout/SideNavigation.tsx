import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  PlusSquare,
  ShieldCheck,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

export function SideNavigation() {
  const { logout, adminName } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: t('sidebar.overview'), end: true },
    { to: "/dashboard/create", icon: PlusSquare, label: t('sidebar.createRecord') },
    { to: "/verify", icon: ShieldCheck, label: t('sidebar.verifyIntegrity') },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 224 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="sticky top-0 h-screen flex flex-col border-r border-surface-3 bg-[#0a0d11]"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-surface-3 px-4 h-16">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-status-blue/20 to-status-blue/5 border border-status-blue/30">
          <Shield size={16} className="text-status-blue" />
          <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-status-green border border-[#0a0d11]" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="overflow-hidden"
          >
            <div
              className="text-xs text-text-primary truncate"
              style={{ lineHeight: "1.2" }}
            >
              {t('sidebar.title')}
            </div>
            <div
              className="text-[10px] text-text-muted truncate"
              style={{ lineHeight: "1.2" }}
            >
              {adminName || "Administrator"}
            </div>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-status-blue/10 text-status-blue border border-status-blue/20"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary border border-transparent"
                } ${collapsed ? "justify-center px-0" : ""}`
              }
            >
              <item.icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-surface-3 p-2 space-y-0.5">
        <NavLink
          to="/"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-text-muted hover:bg-surface-2 hover:text-text-secondary transition-all duration-200 ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <Home size={14} className="shrink-0" />
          {!collapsed && t('sidebar.publicPortal')}
        </NavLink>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-text-muted hover:bg-surface-2 hover:text-text-secondary transition-all duration-200 ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
          {!collapsed && t('sidebar.collapse')}
        </button>
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-text-muted hover:bg-surface-2 hover:text-status-red transition-all duration-200 ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <LogOut size={14} className="shrink-0" />
          {!collapsed && t('sidebar.signOut')}
        </button>
      </div>
    </motion.aside>
  );
}
