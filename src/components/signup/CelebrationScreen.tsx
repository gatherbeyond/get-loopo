import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { MobileButton } from "@/components/mobile";
import loopoMascot from "@/assets/loopo-mascot.png";

interface CelebrationScreenProps {
  onContinue: () => void;
}

// Confetti particle component
const Confetti = ({ delay, color }: { delay: number; color: string }) => {
  const randomX = Math.random() * 100;
  const randomDuration = 2 + Math.random() * 2;
  const randomSize = 6 + Math.random() * 10;
  
  return (
    <motion.div
      className="absolute rounded-sm"
      style={{
        width: randomSize,
        height: randomSize,
        backgroundColor: color,
        left: `${randomX}%`,
        top: -20,
      }}
      initial={{ y: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: 900,
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: randomDuration,
        delay: delay,
        ease: "easeIn",
      }}
    />
  );
};

const confettiColors = [
  "#6200e6", // Purple
  "#03DAC6", // Teal
  "#FFD600", // Gold
  "#00C853", // Green
  "#7c4dff", // Light purple
];

const CelebrationScreen = ({ onContinue }: CelebrationScreenProps) => {
  const [confettiParticles, setConfettiParticles] = useState<{ id: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    // Generate confetti particles
    const particles = Array.from({ length: 50 }).map((_, index) => ({
      id: index,
      color: confettiColors[index % confettiColors.length],
      delay: Math.random() * 1.5,
    }));
    setConfettiParticles(particles);

    // Auto-navigate after 4 seconds
    const timer = setTimeout(() => {
      onContinue();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-gradient-primary flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiParticles.map((particle) => (
          <Confetti
            key={particle.id}
            delay={particle.delay}
            color={particle.color}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-5 text-center">
        {/* Mascot */}
        <motion.img
          src={loopoMascot}
          alt="Loopo celebrating"
          className="w-[200px] h-[200px] object-contain"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ 
            scale: 1, 
            rotate: [0, 5, -5, 0],
            y: [0, -15, 0],
          }}
          transition={{
            scale: { duration: 0.5, type: "spring" },
            rotate: { duration: 1, repeat: Infinity, repeatDelay: 1 },
            y: { duration: 1, repeat: Infinity, ease: "easeInOut" },
          }}
        />

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h1 className="text-4xl font-display font-bold text-primary-foreground flex items-center justify-center gap-3">
            <Sparkles className="w-9 h-9 text-accent-gold" />
            You're All Set!
          </h1>
          <p className="text-lg font-body text-primary-foreground/80 mt-2">
            Let's create your first mission!
          </p>
        </motion.div>
      </div>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-8 left-5 right-5 safe-area-bottom"
      >
        <MobileButton
          onClick={onContinue}
          className="w-full h-14 bg-card text-primary font-display font-bold text-lg rounded-3xl shadow-elevated"
        >
          Get Started
        </MobileButton>
      </motion.div>
    </motion.div>
  );
};

export default CelebrationScreen;
