import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Rocket, ChevronRight } from "lucide-react";
import { MobileButton, CoinIcon } from "@/components/mobile";
import loopoMascot from "@/assets/loopo-mascot.png";

const ParentFirstMission: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="mx-auto max-w-md w-full min-h-screen flex flex-col pt-12">
        {/* Success badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-1.5 bg-success/15 text-success border border-success/30 rounded-full px-4 py-1.5 font-body text-sm font-bold">
            <CheckCircle className="w-4 h-4" />
            Family setup complete
          </div>
        </motion.div>

        {/* Mascot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex justify-center mt-6"
        >
          <motion.img
            src={loopoMascot}
            alt="Loopo mascot"
            className="h-[140px] w-auto object-contain"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-6 text-center font-display font-bold text-[26px] text-foreground"
        >
          Now let's make Loopo come alive
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-3 text-center px-6 font-body text-sm text-muted-foreground leading-relaxed"
        >
          Create your first mission and assign it to your kid.
          They'll see it the moment they log in.
        </motion.p>

        {/* Preview card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mt-8 mx-5"
        >
          <div className="bg-card rounded-2xl p-4 shadow-soft border border-border flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[15px] text-foreground">
                Clean your room
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <CoinIcon size={14} />
                <span className="text-xs text-muted-foreground">500 credits</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </div>
          <p className="text-center mt-2 text-[11px] font-body text-muted-foreground">
            This is just a preview — you'll create the real one next
          </p>
        </motion.div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="mt-auto pb-8 px-5 safe-area-bottom space-y-3"
        >
          <MobileButton
            variant="gold"
            fullWidth
            onClick={() => navigate("/parent/add-task")}
          >
            Create My First Mission →
          </MobileButton>
          <button
            type="button"
            onClick={() => navigate("/parent")}
            className="w-full text-center font-body text-sm text-muted-foreground py-2"
          >
            Explore the dashboard first
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ParentFirstMission;
