import * as React from "react";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { MissionCard, MissionStatus } from "./MissionCard";
import loopoMascot from "@/assets/loopo-mascot.png";

interface Mission {
  id: string;
  title: string;
  description: string;
  creditReward: number;
  status: MissionStatus;
}

interface MissionCarouselProps {
  missions: Mission[];
  onMissionAction?: (missionId: string) => void;
  onSeeAll?: () => void;
  className?: string;
}

const EmptyMissions: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-8 px-5">
    <motion.img
      src={loopoMascot}
      alt="Loopo mascot"
      className="w-28 h-28 object-contain mb-4"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    <h3 className="font-display font-bold text-xl text-foreground mb-2">
      No missions yet!
    </h3>
    <p className="font-body text-sm text-muted-foreground text-center">
      Ask your parent to create tasks for you to earn credits! 🎮
    </p>
  </div>
);

const MissionCarousel: React.FC<MissionCarouselProps> = ({
  missions,
  onMissionAction,
  onSeeAll,
  className,
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  return (
    <section className={cn("mt-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-4">
        <div className="flex items-center gap-2">
          <Rocket className="w-6 h-6 text-primary" />
          <h2 className="font-display font-bold text-xl text-foreground">
            Active Missions
          </h2>
        </div>
        {missions.length > 0 && (
          <button
            onClick={onSeeAll}
            className="font-body text-sm font-semibold text-primary touch-target"
          >
            See All
          </button>
        )}
      </div>

      {/* Carousel or Empty State */}
      {missions.length === 0 ? (
        <EmptyMissions />
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-5 pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {missions.map((mission) => (
            <div key={mission.id} className="snap-start">
              <MissionCard
                id={mission.id}
                title={mission.title}
                description={mission.description}
                creditReward={mission.creditReward}
                status={mission.status}
                onAction={() => onMissionAction?.(mission.id)}
              />
            </div>
          ))}
          {/* Peek indicator - empty space for visual hint */}
          <div className="w-4 flex-shrink-0" />
        </div>
      )}
    </section>
  );
};

export { MissionCarousel };
export type { Mission };
