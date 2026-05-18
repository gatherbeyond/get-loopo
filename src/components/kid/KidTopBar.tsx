import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface KidTopBarProps {
  avatarUrl?: string;
  kidName?: string;
  kidAge?: number;
  kidEmoji?: string;
  onLogout?: () => void;
}

const KidTopBar: React.FC<KidTopBarProps> = ({
  avatarUrl,
  kidName = "Miguel",
  kidEmoji = "🦊",
  onLogout,
}) => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const confirmLogout = () => {
    setConfirmOpen(false);
    onLogout?.();
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-background"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
      >
        <div className="flex items-center justify-between px-5 py-3">
          <button
            onClick={() => navigate("/kid/profile")}
            className="touch-target flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-xl overflow-hidden border-2 border-primary/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt={kidName} className="w-full h-full object-cover" />
              ) : (
                <span>{kidEmoji}</span>
              )}
            </div>
            <span className="font-display font-bold text-foreground text-lg">
              Hi, {kidName}! 👋
            </span>
          </button>

          <button
            onClick={() => setConfirmOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-error/10 hover:bg-error/20 transition-colors text-xl"
            aria-label="Log out"
          >
            🚪
          </button>
        </div>
      </header>

      <AnimatePresence>
        {confirmOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[70]"
              onClick={() => setConfirmOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-[80] flex items-center justify-center px-8"
            >
              <div className="bg-card rounded-3xl p-6 w-full max-w-xs shadow-xl">
                <h2 className="font-display font-bold text-xl text-foreground text-center mb-2">
                  Log Out?
                </h2>
                <p className="font-body text-sm text-muted-foreground text-center mb-6">
                  You'll need to log in again to play
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmOpen(false)}
                    className="flex-1 h-12 rounded-xl border border-border font-display font-bold text-base text-foreground transition-colors hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 h-12 rounded-xl bg-error font-display font-bold text-base text-error-foreground transition-colors hover:bg-error/90"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export { KidTopBar };
