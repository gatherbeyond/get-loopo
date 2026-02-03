import * as React from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/mobile/ProgressBar";

interface WishlistItem {
  id: string;
  name: string;
  imageUrl?: string;
  currentCredits: number;
  targetCredits: number;
}

interface WishlistPreviewProps {
  items: WishlistItem[];
  onViewAll?: () => void;
  className?: string;
}

const WishlistItemCard: React.FC<{ item: WishlistItem }> = ({ item }) => {
  const progress = Math.round((item.currentCredits / item.targetCredits) * 100);

  return (
    <motion.div
      className="bg-card rounded-2xl p-3 mx-5 mb-2 flex items-center gap-3"
      style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.06)" }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Item Image */}
      <div className="w-[60px] h-[60px] rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">🎁</span>
        )}
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-bold text-base text-foreground truncate mb-1">
          {item.name}
        </h4>
        <p className="font-body text-xs text-muted-foreground mb-2">
          {item.currentCredits.toLocaleString()} / {item.targetCredits.toLocaleString()} credits
        </p>
        <ProgressBar
          value={item.currentCredits}
          max={item.targetCredits}
          size="sm"
          variant="primary"
          animated={false}
        />
      </div>

      {/* Progress Percentage */}
      <div className="flex-shrink-0">
        <span className="font-display font-bold text-sm text-primary">
          {progress}%
        </span>
      </div>
    </motion.div>
  );
};

const WishlistPreview: React.FC<WishlistPreviewProps> = ({
  items,
  onViewAll,
  className,
}) => {
  const displayItems = items.slice(0, 2);

  return (
    <section className={cn("mt-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          <h2 className="font-display font-bold text-xl text-foreground">
            My Wishlist 🎯
          </h2>
        </div>
        {items.length > 0 && (
          <button
            onClick={onViewAll}
            className="font-body text-sm font-semibold text-primary touch-target"
          >
            View All
          </button>
        )}
      </div>

      {/* Wishlist Items */}
      {displayItems.length > 0 ? (
        displayItems.map((item) => <WishlistItemCard key={item.id} item={item} />)
      ) : (
        <div className="mx-5 py-8 text-center">
          <span className="text-4xl mb-3 block">🛒</span>
          <p className="font-body text-sm text-muted-foreground">
            Add items to your wishlist to save up for!
          </p>
        </div>
      )}
    </section>
  );
};

export { WishlistPreview };
export type { WishlistItem };
