import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import loopoMascot from "@/assets/loopo-mascot.png";

const DeviceQuestionScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col px-6 pt-12 pb-8 max-w-md mx-auto w-full"
      >
        <div className="flex justify-center mb-6">
          <img src={loopoMascot} alt="Loopo" className="w-24 h-24 object-contain" />
        </div>

        <h1 className="font-display font-bold text-2xl text-foreground text-center mb-3">
          One last thing…
        </h1>

        <p className="font-body text-base text-muted-foreground text-center mb-8">
          Will your kid use this same device, or do they have their own?
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/parent/hand-off")}
            className="w-full bg-card border-2 border-primary rounded-2xl p-5 flex items-center gap-4 text-left active:scale-[0.98] transition-transform shadow-soft"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
              📱
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-base text-foreground mb-1">
                Yes, we share a device
              </div>
              <div className="font-body text-sm text-muted-foreground">
                I'll hand my phone to my kid right now so they can log in
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/parent")}
            className="w-full bg-card border-2 border-border rounded-2xl p-5 flex items-center gap-4 text-left active:scale-[0.98] transition-transform shadow-soft"
          >
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
              💻
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-base text-foreground mb-1">
                My kid has their own device
              </div>
              <div className="font-body text-sm text-muted-foreground">
                They'll log in on their phone using the family code and PIN
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={() => navigate("/parent")}
          className="mt-auto pt-8 text-center font-body text-sm text-muted-foreground"
        >
          Decide later
        </button>
      </motion.div>
    </div>
  );
};

export default DeviceQuestionScreen;
