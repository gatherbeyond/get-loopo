import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

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
  kidAge = 9,
  kidEmoji = "🦊",
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu on outside click
  React.useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleLogoutClick = () => {
    setMenuOpen(false);
    setConfirmOpen(true);
  };

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
          {/* Profile Avatar & Greeting */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((p) => !p)}
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

            {/* Dropdown Menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-56 rounded-2xl bg-card shadow-[0px_4px_12px_rgba(0,0,0,0.1)] z-[60] overflow-hidden border border-border"
                >
                  {/* Kid Info Section */}
                  <div className="bg-primary/5 p-4 flex items-center gap-3">
                    <span className="text-[32px]">{kidEmoji}</span>
                    <div>
                      <p className="font-display font-bold text-lg text-foreground">{kidName}</p>
                      <p className="font-body text-sm text-muted-foreground">Age {kidAge}</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border" />

                  {/* Log Out */}
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 p-4 font-display font-bold text-base text-error hover:bg-error/5 transition-colors"
                  >
                    <span className="text-xl">🚪</span>
                    Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
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
