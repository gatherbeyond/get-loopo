import React from "react";
import { motion, PanInfo } from "framer-motion";
import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoinIcon } from "@/components/mobile";

export interface TaskApprovalItem {
  id: string;
  type: "task";
  kidName: string;
  kidAvatar: string;
  taskTitle: string;
  credits: number;
  timeAgo: string;
  photoUrl?: string;
  videoUrl?: string;
  voiceUrl?: string;
}

interface TaskApprovalCardProps {
  item: TaskApprovalItem;
  swipingId: string | null;
  swipeDirection: "left" | "right" | null;
  onSwipeUpdate: (id: string, info: PanInfo) => void;
  onSwipeEnd: (id: string, info: PanInfo) => void;
  onPhotoTap: (url: string) => void;
  onApprove: () => void;
  onDeny: () => void;
}

const TaskApprovalCard: React.FC<TaskApprovalCardProps> = ({
  item,
  swipingId,
  swipeDirection,
  onSwipeUpdate,
  onSwipeEnd,
  onPhotoTap,
  onApprove,
  onDeny,
}) => {
  return (
    <div className="relative">
      {/* Swipe Background Indicators */}
      <div className="absolute inset-0 rounded-[20px] overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-success transition-opacity duration-200",
            swipingId === item.id && swipeDirection === "right" ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 bg-error transition-opacity duration-200",
            swipingId === item.id && swipeDirection === "left" ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={(_, info) => onSwipeUpdate(item.id, info)}
        onDragEnd={(_, info) => onSwipeEnd(item.id, info)}
        className="bg-card rounded-[20px] border border-border p-5 shadow-soft relative"
      >
        {/* Top Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
              {item.kidAvatar}
            </div>
            <span className="font-display font-bold text-base text-foreground">
              {item.kidName}
            </span>
          </div>
          <span className="font-body text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {item.timeAgo}
          </span>
        </div>

        {/* Task & Credits */}
        <div className="mb-4">
          <h3 className="font-display font-bold text-lg text-foreground mb-1">
            {item.taskTitle}
          </h3>
          <div className="flex items-center gap-2">
            <CoinIcon size={20} />
            <span className="font-body text-sm text-accent-gold font-semibold">
              {item.credits} credits
            </span>
          </div>
        </div>

        {/* Photo Preview */}
        {item.photoUrl && (
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => onPhotoTap(item.photoUrl!)}
            className="relative mb-4 cursor-pointer"
          >
            <img
              src={item.photoUrl}
              alt="Task proof"
              className="w-full h-40 object-cover rounded-2xl"
            />
            <div className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-foreground" />
            </div>
          </motion.div>
        )}

        {item.videoUrl && (
          <div className="relative mb-4">
            <video
              src={item.videoUrl}
              controls
              playsInline
              className="w-full h-40 rounded-2xl object-cover bg-black"
            />
          </div>
        )}

        {item.voiceUrl && (
          <div className="mb-3">
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-1">Kid's voice note</p>
            <audio
              src={item.voiceUrl}
              controls
              className="w-full"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onDeny}
            className="flex-1 h-[52px] rounded-2xl border-2 border-border bg-transparent font-display font-bold text-sm text-muted-foreground transition-colors hover:bg-muted/50"
          >
            Needs work
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onApprove}
            className="flex-1 h-[52px] rounded-2xl bg-success font-display font-bold text-sm text-success-foreground transition-colors hover:bg-success/90"
          >
            Approve
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskApprovalCard;
