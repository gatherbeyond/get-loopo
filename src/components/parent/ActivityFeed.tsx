import React from "react";
import { motion } from "framer-motion";
import { CoinIcon } from "@/components/mobile/CreditDisplay";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  kidName: string;
  kidAvatar: string;
  action: string;
  taskName: string;
  credits: number;
  timeAgo: string;
}

interface ActivityItemCardProps {
  item: ActivityItem;
}

const ActivityItemCard: React.FC<ActivityItemCardProps> = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "bg-card rounded-xl border border-border p-4",
        "flex items-center gap-3 cursor-pointer",
        "transition-all hover:shadow-soft"
      )}
    >
      {/* Kid Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
        {item.kidAvatar}
      </div>

      {/* Text Section */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body text-foreground truncate">
          <span className="font-semibold">{item.kidName}</span> {item.action}{" "}
          <span className="text-primary">'{item.taskName}'</span>
        </p>
        <p className="text-xs font-body text-muted-foreground mt-0.5">
          {item.timeAgo}
        </p>
      </div>

      {/* Credits */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-base font-display font-bold text-accent-gold">
          +{item.credits}
        </span>
        <CoinIcon size={16} />
      </div>
    </motion.div>
  );
};

interface ActivityFeedProps {
  activities: ActivityItem[];
  onViewAll?: () => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onViewAll,
}) => {
  return (
    <section className="mt-8 px-5 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold text-foreground">
          Recent Activity
        </h2>
        <button
          onClick={onViewAll}
          className="text-sm font-body text-primary font-semibold"
        >
          View All
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-2">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-4xl mb-3">🌱</p>
            <p className="font-display font-bold text-base text-foreground">No activity yet</p>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Create your first mission and get the loop going!
            </p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ActivityItemCard item={activity} />
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
};

export { ActivityFeed };
export type { ActivityItem };
