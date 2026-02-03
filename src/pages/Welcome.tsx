import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MobileButton } from "@/components/mobile";
import loopoLogo from "@/assets/loopo-logo.png";
import loopoMascot from "@/assets/loopo-mascot.png";
import { Rocket, Coins, Gift, Sparkles, Star } from "lucide-react";

const valueProps = [
  {
    icon: Rocket,
    text: "Complete missions",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Coins,
    text: "Earn credits",
    color: "text-accent-gold",
    bgColor: "bg-accent-gold/10",
  },
  {
    icon: Gift,
    text: "Get real rewards",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
];

// Decorative floating elements
const FloatingElement = ({ 
  children, 
  className, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className: string; 
  delay?: number;
}) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.4, 0.8, 0.4], 
      scale: [0.8, 1, 0.8],
      y: [0, -10, 0],
    }}
    transition={{ 
      duration: 3, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.div>
);

const Welcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background-tint relative overflow-hidden">
      {/* Mobile Frame Container */}
      <div className="mx-auto max-w-md min-h-screen relative flex flex-col">
        
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/5 to-transparent" />
          
          {/* Floating decorative elements */}
          <FloatingElement className="top-20 left-8" delay={0}>
            <Star className="w-5 h-5 text-accent-gold fill-accent-gold" />
          </FloatingElement>
          <FloatingElement className="top-32 right-10" delay={0.5}>
            <Coins className="w-4 h-4 text-accent-gold" />
          </FloatingElement>
          <FloatingElement className="top-48 left-16" delay={1}>
            <Sparkles className="w-4 h-4 text-primary" />
          </FloatingElement>
          <FloatingElement className="top-64 right-6" delay={1.5}>
            <Star className="w-3 h-3 text-primary fill-primary" />
          </FloatingElement>
          <FloatingElement className="bottom-48 left-6" delay={0.8}>
            <Coins className="w-5 h-5 text-accent-gold" />
          </FloatingElement>
          <FloatingElement className="bottom-56 right-12" delay={1.2}>
            <Sparkles className="w-5 h-5 text-secondary" />
          </FloatingElement>
        </div>

        {/* TOP SECTION - Logo & Mascot */}
        <header className="pt-16 px-5 flex flex-col items-center safe-area-top">
          {/* Logo */}
          <motion.img
            src={loopoLogo}
            alt="Loopo"
            className="h-[100px] w-auto object-contain"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Mascot with bounce animation */}
          <motion.img
            src={loopoMascot}
            alt="Loopo mascot"
            className="h-[140px] w-auto object-contain mt-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -8, 0],
            }}
            transition={{ 
              opacity: { duration: 0.5, delay: 0.2 },
              scale: { duration: 0.5, delay: 0.2 },
              y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }
            }}
          />
        </header>

        {/* MIDDLE SECTION - Tagline & Value Props */}
        <main className="flex-1 px-5 flex flex-col items-center">
          {/* Tagline */}
          <motion.h1
            className="text-[26px] font-display font-bold text-foreground text-center mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Earn It. Flex It. Loopo.
          </motion.h1>

          {/* Value Props */}
          <motion.div
            className="mt-8 w-full space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {valueProps.map((prop, index) => (
              <motion.div
                key={prop.text}
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.15 }}
              >
                <div className={`w-10 h-10 rounded-xl ${prop.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <prop.icon className={`w-5 h-5 ${prop.color}`} />
                </div>
                <span className="text-lg font-body text-muted-foreground">
                  {prop.text}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </main>

        {/* BOTTOM SECTION - Get Started Button */}
        <footer className="px-5 pb-8 safe-area-bottom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <MobileButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleGetStarted}
              className="shadow-button"
            >
              Get Started
            </MobileButton>
          </motion.div>
          
          {/* Optional: Skip or login link */}
          <motion.p
            className="text-center mt-4 text-sm font-body text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/")}
              className="text-primary font-semibold hover:underline"
            >
              Log in
            </button>
          </motion.p>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;
