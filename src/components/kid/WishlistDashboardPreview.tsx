import * as React from "react";
import { motion } from "framer-motion";
import { Target, Plus, ChevronRight, Check } from "lucide-react";

interface PreviewItem {
  id: string;
  title: string;
  credits_goal: number;
}

interface WishlistDashboardPreviewProps {
  items: PreviewItem[];
  credits: number;
  onSeeAll: () => void;
  onAdd: () => void;
}

const WishlistDashboardPreview: React.FC<WishlistDashboardPreviewProps> = ({
  items,
  credits,
  onSeeAll,
  onAdd,
}) => {
  const display = items.slice(0, 3);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="font-display font-bold text-xl text-foreground">
          My Wishlist
        </h2>
        {items.length > 0 && (
          <button
            onClick={onSeeAll}
            className="touch-target inline-flex items-center gap-0.5 font-body font-semibold text-sm text-primary"
          >
            See all
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {display.length === 0 ? (
        <div className="px-5">
          <button
            type="button"
            onClick={onAdd}
            className="w-full bg-primary/10 border border-dashed border-primary/40 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-transform touch-target"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-foreground text-base">
              Add a wishlist goal
            </span>
          </button>
        </div>
      ) : (
        <div className="px-5 space-y-2">
          {display.map((item, idx) => {
            const pct = Math.min(
              100,
              Math.round((credits / item.credits_goal) * 100)
            );
            const ready = credits >= item.credits_goal;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={onSeeAll}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="w-full text-left bg-card rounded-2xl p-3 shadow-card flex items-center gap-3 active:scale-[0.99] transition-transform"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-bold text-foreground text-base leading-tight truncate">
                      {item.title}
                    </h3>
                    {ready ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15 text-success font-display font-bold text-xs whitespace-nowrap">
                        <Check className="w-3 h-3" />
                        Ready!
                      </span>
                    ) : (
                      <span className="font-display font-bold text-xs text-primary whitespace-nowrap">
                        {pct}%
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={
                        ready
                          ? "h-full bg-gradient-gold rounded-full"
                          : "h-full bg-gradient-primary rounded-full"
                      }
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export { WishlistDashboardPreview };
