import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Target, Gift } from "lucide-react";
import { MobileButton, CoinIcon } from "@/components/mobile";
import loopoMascot from "@/assets/loopo-mascot.png";

const valueCards = [
  {
    icon: <Target className="w-[22px] h-[22px] text-primary" />,
    iconBg: "bg-primary/10",
    title: "Set missions",
    desc: "From templates or your own ideas",
  },
  {
    icon: <CoinIcon size={22} />,
    iconBg: "bg-accent-gold/15",
    title: "Kids earn credits",
    desc: "Photo, video, or voice proof",
  },
  {
    icon: <Gift className="w-[22px] h-[22px] text-primary" />,
    iconBg: "bg-primary/10",
    title: "Redeem real rewards",
    desc: "Mobile Legends · Roblox · Shopee",
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-background-tint to-transparent pointer-events-none" />

      <div className="mx-auto max-w-md min-h-screen relative flex flex-col px-5">
        {/* Hero mascot */}
        <header className="pt-12 flex flex-col items-center safe-area-top">
          <motion.div className="relative">
            <div className="absolute inset-0 bg-background-tint rounded-full scale-110" />
            <motion.img
              src={loopoMascot}
              alt="Loopo mascot waving"
              className="h-[160px] w-auto object-contain relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.5, delay: 0.1 },
                scale: { duration: 0.5, delay: 0.1 },
                y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
              }}
            />
          </motion.div>
        </header>

        {/* Title */}
        <motion.h1
          className="text-[28px] font-display font-bold text-foreground text-center mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Welcome to <span className="text-primary">Loopo</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-[14px] font-body text-muted-foreground text-center leading-relaxed mt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Turn chores into missions. Reward effort.
          <br />
          Watch your kid actually change.
        </motion.p>

        {/* Value cards */}
        <motion.div
          className="mt-6 mb-6 flex flex-col gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
          }}
        >
          {valueCards.map((card) => (
            <motion.div
              key={card.title}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              className="bg-card rounded-2xl p-4 shadow-soft flex flex-row items-center gap-3"
            >
              <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                {card.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-[15px] text-foreground">
                  {card.title}
                </span>
                <span className="font-body text-[12px] text-muted-foreground">
                  {card.desc}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <MobileButton
            variant="gold"
            fullWidth
            onClick={() => navigate("/signup")}
            className="h-14 rounded-2xl"
          >
            Get Started →
          </MobileButton>
        </motion.div>

        {/* Login link */}
        <motion.p
          className="text-center text-[13px] font-body text-muted-foreground mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          Already have an account?{" "}
          <button
            onClick={() => navigate("/parent-login")}
            className="text-primary font-bold"
          >
            Log in
          </button>
        </motion.p>

        {/* Footer */}
        <motion.footer
          className="mt-auto pt-6 pb-6 safe-area-bottom text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <p className="text-[12px] font-body text-text-muted">
            Kid logging in?{" "}
            <button
              onClick={() => navigate("/kid-login")}
              className="text-primary font-bold"
            >
              Tap here
            </button>
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default HomePage;
