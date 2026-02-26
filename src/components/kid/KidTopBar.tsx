import * as React from "react";

interface KidTopBarProps {
  avatarUrl?: string;
  kidName?: string;
  onAvatarClick?: () => void;
}

const KidTopBar: React.FC<KidTopBarProps> = ({
  avatarUrl,
  kidName = "Miguel",
  onAvatarClick,
}) => {
  return (
    <header
      className="sticky top-0 z-50 bg-background"
      style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
    >
      <div className="flex items-center justify-between px-5 py-3">
        {/* Profile Avatar */}
        <button
          onClick={onAvatarClick}
          className="touch-target flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-xl overflow-hidden border-2 border-primary/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt={kidName} className="w-full h-full object-cover" />
            ) : (
              <span>🦊</span>
            )}
          </div>
          <span className="font-display font-bold text-foreground text-lg">
            Hi, {kidName}! 👋
          </span>
        </button>
      </div>
    </header>
  );
};

export { KidTopBar };
