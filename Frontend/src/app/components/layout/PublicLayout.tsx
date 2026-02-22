import { Outlet, useLocation, Link } from "react-router";
import { NavBar } from "./NavBar";
import { motion, AnimatePresence } from "motion/react";


export function PublicLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <NavBar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-3 bg-surface-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Links */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-muted">
              <Link to="/privacy" className="hover:text-text-secondary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-text-secondary transition-colors">
                Terms of Service
              </Link>
              <Link to="/support" className="hover:text-text-secondary transition-colors">
                Contact Support
              </Link>
              <Link to="/login" className="hover:text-text-secondary transition-colors">
                Admin Portal
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-xs text-text-muted">
              © 2026 AXIOS Ledger. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
