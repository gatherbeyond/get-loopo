import * as React from "react";
import { motion } from "framer-motion";
import { Coins, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface KidCreditHeroProps {
  credits: number;
  className?: string;
}

const FloatingParticle: React.FC<{ delay: number; x: number }> = ({ delay, x }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full bg-accent-gold opacity-60"
    initial={{ y: 100, x, opacity: 0 }}
    animate={{
      y: -20,
      opacity: [0, 0.8, 0],
      scale: [0.5, 1, 0.5],
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
  />
);

const KidCreditHero: React.FC<KidCreditHeroProps> = ({ credits, className }) => {
  return (
    <div
      className={cn(
        "relative mx-5 rounded-3xl bg-gradient-primary overflow-hidden",
        className
      )}
      style={{ boxShadow: "0px 4px 16px rgba(98, 0, 230, 0.2)" }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingParticle delay={0} x={30} />
        <FloatingParticle delay={0.5} x={80} />
        <FloatingParticle delay={1} x={150} />
        <FloatingParticle delay={1.5} x={220} />
        <FloatingParticle delay={2} x={280} />
        <FloatingParticle delay={0.3} x={120} />
        <FloatingParticle delay={1.2} x={200} />
      </div>

      {/* Sparkle decorations */}
      <motion.div
        className="absolute top-4 right-8"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="w-5 h-5 text-accent-gold" />
      </motion.div>
      <motion.div
        className="absolute bottom-6 left-8"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      >
        <Sparkles className="w-4 h-4 text-white/60" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 px-6 py-8 flex flex-col items-center">
        <span className="font-body text-sm text-white/80 mb-2">Your Credits</span>
        
        <div className="flex items-center gap-4">
          {/* Animated Coin */}
          <motion.div
            className="relative"
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
          >
            <div
              className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold"
            >
              <Coins className="w-7 h-7 text-foreground" />
            </div>
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-gold opacity-30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Credit Amount */}
          <div className="flex flex-col">
            <motion.span
              className="font-display font-bold text-5xl text-white"
              key={credits}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {credits.toLocaleString("en-US")}
            </motion.span>
            <span className="font-display font-bold text-xl text-white/90">credits</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { KidCreditHero };
