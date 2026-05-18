import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import loopoMascot from "@/assets/loopo-mascot.png";

const DeviceQuestionScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="mx-auto max-w-md w-full min-h-screen flex flex-col px-5 pt-16 pb-10">

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center"
        >
          <motion.img
            src={loopoMascot}
            alt="Loopo mascot"
            className="h-[120px] w-auto object-contain"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-8 text-center font-display font-bold text-[26px] text-foreground"
        >
          One last thing…
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-3 text-center font-body text-sm text-muted-foreground leading-relaxed px-4"
        >
          Will your kid use this same device, or do they have their own?
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-10 space-y-4"
        >
          <button
            onClick={() => navigate("/parent/hand-off")}
            className="w-full bg-card border-2 border-primary rounded-2xl p-5 flex items-center gap-4 text-left active:scale-[0.98] transition-transform shadow-soft"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-2xl">📱</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-base text-foreground">
                Yes, we share a device
              </p>
              <p className="font-body text-xs text-muted-foreground mt-0.5 leading-relaxed">
                I'll hand my phone to my kid right now so they can log in
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/parent")}
            className="w-full bg-card border-2 border-border rounded-2xl p-5 flex items-center gap-4 text-left active:scale-[0.98] transition-transform shadow-soft"
          >
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <span className="text-2xl">💻</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-base text-foreground">
                My kid has their own device
              </p>
              <p className="font-body text-xs text-muted-foreground mt-0.5 leading-relaxed">
                They'll log in on their phone using the family code and PIN
              </p>
            </div>
          </button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          onClick={() => navigate("/parent")}
          className="mt-auto pt-8 text-center font-body text-sm text-muted-foreground"
        >
          Decide later
        </motion.button>

      </div>
    </div>
  );
};

export default DeviceQuestionScreen;
