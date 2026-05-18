import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveAvatar } from "@/lib/avatars";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Kid {
  id: string;
  name: string;
  avatar: string;
}

const HandOffScreen: React.FC = () => {
  const navigate = useNavigate();
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [loading, setLoading] = useState(true);
  const { loginAsKid } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleHandOff = async () => {
    if (!selectedKid || loggingIn) return;
    setLoggingIn(true);
    try {
      const { data, error } = await supabase.functions.invoke("kid-login", {
        body: { action: "tap_login", kidId: selectedKid.id },
      });
      if (error || data?.error) {
        toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
        return;
      }
      const { data: { session: parentSession } } = await supabase.auth.getSession();
      if (parentSession) {
        localStorage.setItem("loopo_parent_session", JSON.stringify({
          access_token: parentSession.access_token,
          refresh_token: parentSession.refresh_token,
        }));
      }
      if (data.hashed_token) {
        try {
          await supabase.auth.verifyOtp({ token_hash: data.hashed_token, type: "email" });
        } catch (e) {
          console.error("Failed to establish kid session:", e);
        }
      }
      loginAsKid(data.kid.name, data.kid.id, data.kid.avatar, data.kid.anonymous_uid);
      let nextRoute = "/kid";
      try {
        const { data: kidRow } = await supabase
          .from("kids")
          .select("onboarding_completed_at")
          .eq("id", data.kid.id)
          .maybeSingle();
        if (kidRow && !kidRow.onboarding_completed_at) {
          nextRoute = "/kid/onboarding";
        }
      } catch (e) {
        console.error("Failed to check onboarding status:", e);
      }
      navigate(nextRoute);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoggingIn(false);
    }
  };

  useEffect(() => {
    const fetchKids = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: family } = await supabase
          .from("families")
          .select("id")
          .eq("parent_id", user.id)
          .maybeSingle();
        if (!family) return;
        const { data: kidsData } = await supabase
          .from("kids")
          .select("id, name, avatar")
          .eq("family_id", family.id)
          .order("created_at", { ascending: true });
        const list = kidsData || [];
        setKids(list);
        if (list.length === 1) setSelectedKid(list[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchKids();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-primary">

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-primary-foreground/10"
          animate={{ scale: [1, 1.15, 1], rotate: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-primary-foreground/10"
          animate={{ scale: [1, 1.1, 1], rotate: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="mx-auto max-w-md w-full min-h-screen flex flex-col px-5 pt-14 pb-10 relative z-10">

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center"
            >
              <span className="inline-flex items-center gap-2 bg-primary-foreground/15 text-primary-foreground border border-primary-foreground/25 rounded-full px-4 py-1.5 font-body text-sm font-bold tracking-wide">
                🤝 Hand-Off Time
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mt-8 text-center font-display font-bold text-[32px] text-primary-foreground leading-tight"
            >
              {selectedKid ? `Your turn, ${selectedKid.name}! 🙌` : "Who's getting the phone?"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="mt-3 text-center font-body text-sm text-primary-foreground/80 leading-relaxed px-4"
            >
              {selectedKid
                ? "A mission is waiting for you. Let's go!"
                : "Pick who's logging in so we can set the screen up for them."}
            </motion.p>

            {kids.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="mt-8 space-y-3"
              >
                {kids.map((kid) => {
                  const isSelected = selectedKid?.id === kid.id;
                  return (
                    <button
                      key={kid.id}
                      onClick={() => setSelectedKid(kid)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                        isSelected
                          ? "border-primary-foreground bg-primary-foreground/20"
                          : "border-primary-foreground/25 bg-primary-foreground/10"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center text-2xl shrink-0">
                        {resolveAvatar(kid.avatar)}
                      </div>
                      <span className="flex-1 text-left font-display font-bold text-lg text-primary-foreground">
                        {kid.name}
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 border-primary-foreground flex items-center justify-center ${
                        isSelected ? "bg-primary-foreground" : "bg-transparent"
                      }`}>
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {kids.length === 1 && selectedKid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.5, type: "spring" }}
                className="mt-8 flex flex-col items-center"
              >
                <motion.div
                  className="w-28 h-28 rounded-full bg-primary-foreground/20 border-4 border-primary-foreground/40 flex items-center justify-center text-5xl shadow-xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {resolveAvatar(selectedKid.avatar)}
                </motion.div>
                <p className="mt-4 font-display font-bold text-2xl text-primary-foreground">
                  {selectedKid.name}
                </p>
              </motion.div>
            )}

            <AnimatePresence>
              {selectedKid && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="mt-8 bg-primary-foreground/10 border border-primary-foreground/20 rounded-2xl p-4"
                >
                  <p className="font-body text-sm text-primary-foreground/90 text-center leading-relaxed">
                    Hand the phone to <span className="font-bold">{selectedKid.name}</span> and tap below — they'll land straight on the login screen 👇
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-auto pt-8 space-y-3"
            >
              <button
                onClick={() => navigate("/kid-login")}
                disabled={!selectedKid}
                className="w-full h-[56px] rounded-2xl bg-primary-foreground text-primary font-display font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg"
              >
                {selectedKid ? `Hand off to ${selectedKid.name} 🚀` : "Select a kid first"}
              </button>
              <button
                onClick={() => navigate("/parent")}
                className="w-full text-center font-body text-sm text-primary-foreground/60 py-2"
              >
                Back to dashboard
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default HandOffScreen;
