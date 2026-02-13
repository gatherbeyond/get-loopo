import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import loopoLogo from "@/assets/loopo-logo.png";
import loopoMascot from "@/assets/loopo-mascot.png";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-background-tint to-transparent pointer-events-none" />

      <div className="mx-auto max-w-md min-h-screen relative flex flex-col">
        {/* Logo */}
        <header className="pt-16 flex flex-col items-center safe-area-top">
          <motion.div className="relative">
            {/* Purple glow behind logo */}
            <div className="absolute inset-0 blur-3xl bg-primary/10 scale-150 rounded-full" />
            <motion.img
              src={loopoLogo}
              alt="Loopo"
              className="h-[100px] w-auto object-contain relative z-10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>

          {/* Mascot */}
          <motion.div className="mt-8 relative">
            <div className="absolute inset-0 bg-background-tint rounded-full scale-110" />
            <motion.img
              src={loopoMascot}
              alt="Loopo mascot"
              className="h-[160px] w-auto object-contain relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.5, delay: 0.2 },
                scale: { duration: 0.5, delay: 0.2 },
                y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.7 },
              }}
            />
          </motion.div>
        </header>

        {/* Tagline */}
        <motion.p
          className="text-[22px] font-display font-bold text-primary text-center mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Earn It. Flex It. Loopo.
        </motion.p>

        {/* Question */}
        <motion.h1
          className="text-[26px] font-display font-bold text-foreground text-center mt-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Who's using Loopo today?
        </motion.h1>

        {/* Role Buttons */}
        <motion.div
          className="flex gap-2 px-5 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Parent Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/parent-auth")}
            className="flex-1 h-[160px] bg-card border-2 border-primary rounded-[20px] p-5 flex flex-col items-center justify-center gap-2 shadow-soft"
          >
            <span className="text-[48px]">👔</span>
            <span className="text-[22px] font-display font-bold text-primary">Parent</span>
            <span className="text-[13px] font-body text-muted-foreground">I'm setting up tasks</span>
          </motion.button>

          {/* Kid Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/kid-login")}
            className="flex-1 h-[160px] bg-card border-2 border-secondary rounded-[20px] p-5 flex flex-col items-center justify-center gap-2 shadow-soft"
          >
            <span className="text-[48px]">🎮</span>
            <span className="text-[22px] font-display font-bold text-secondary">Kid</span>
            <span className="text-[13px] font-body text-muted-foreground">I'm earning credits!</span>
          </motion.button>
        </motion.div>

        {/* Bottom Section */}
        <footer className="mt-auto px-5 pb-8 safe-area-bottom">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-[11px] font-body text-text-muted">
              Kids: Ask your parent for your family code and PIN
            </p>
          </motion.div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
