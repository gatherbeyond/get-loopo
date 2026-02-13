import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Sparkles } from "lucide-react";

const ParentAuthChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-background-tint to-transparent pointer-events-none" />

      <div className="mx-auto max-w-md min-h-screen flex flex-col relative">
        {/* Header */}
        <div className="pt-6 px-5 flex items-center">
          <button
            onClick={() => navigate("/")}
            className="w-11 h-11 flex items-center justify-center -ml-2">

            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="flex-1 text-center text-parent-header font-display font-bold text-foreground pr-11">
            Welcome!
          </h1>
        </div>

        {/* Emoji */}
        <motion.div
          className="flex justify-center mt-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}>

          
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="px-5 mt-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>

          {/* Sign In */}
          <button
            onClick={() => navigate("/parent-login")}
            className="w-full h-[100px] bg-card border-2 border-primary rounded-2xl flex flex-col items-center justify-center gap-1 shadow-soft">

            <KeyRound className="w-8 h-8 text-primary" />
            <span className="text-[22px] font-display font-bold text-primary">Sign In</span>
            <span className="text-sm font-body text-muted-foreground">I have an account</span>
          </button>

          {/* Create Family */}
          <button
            onClick={() => navigate("/signup")}
            className="w-full h-[100px] bg-gradient-primary rounded-2xl flex flex-col items-center justify-center gap-1 shadow-button">

            <Sparkles className="w-8 h-8 text-primary-foreground" />
            <span className="text-[22px] font-display font-bold text-primary-foreground">Create Family</span>
            <span className="text-sm font-body text-primary-foreground/80">First time setup</span>
          </button>
        </motion.div>

        {/* Bottom text */}
        <motion.p
          className="mt-auto pb-8 text-center text-xs font-body text-muted-foreground safe-area-bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}>

          Kids use the Kid button on the previous screen
        </motion.p>
      </div>
    </div>);

};

export default ParentAuthChoice;