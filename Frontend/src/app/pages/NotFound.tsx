import { Link } from "react-router";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-surface-1 border border-surface-3 mb-6"
        >
          <FileQuestion size={32} className="text-text-muted" />
        </motion.div>
        <h2 className="text-text-primary mb-2">Page Not Found</h2>
        <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
          The requested resource does not exist in this system.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg bg-status-blue text-white hover:bg-status-blue/85 transition-all duration-200 shadow-sm shadow-status-blue/20"
        >
          <ArrowLeft size={15} />
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
}
