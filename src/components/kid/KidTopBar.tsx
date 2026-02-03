import * as React from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface KidTopBarProps {
  avatarUrl?: string;
  kidName?: string;
  notificationCount?: number;
  onAvatarClick?: () => void;
  onNotificationClick?: () => void;
}

const KidTopBar: React.FC<KidTopBarProps> = ({
  avatarUrl,
  kidName = "Miguel",
  notificationCount = 0,
  onAvatarClick,
  onNotificationClick,
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

        {/* Notification Bell */}
        <button
          onClick={onNotificationClick}
          className="touch-target relative flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
        >
          <Bell className="w-6 h-6 text-foreground" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export { KidTopBar };
