import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Rocket, ChevronRight, Loader2 } from "lucide-react";
import { MobileButton, CoinIcon } from "@/components/mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import loopoMascot from "@/assets/loopo-mascot.png";

const ParentFirstMission: React.FC = () => {
  const navigate = useNavigate();
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [firstKid, setFirstKid] = useState<{ id: string; name: string } | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: family } = await supabase
          .from("families")
          .select("id")
          .eq("parent_id", user.id)
          .single();
        if (!family) return;

        setFamilyId(family.id);

        const { data: kids } = await supabase
          .from("kids")
          .select("id, name")
          .eq("family_id", family.id)
          .order("created_at", { ascending: true })
          .limit(1);

        if (kids && kids.length > 0) {
          setFirstKid({ id: kids[0].id, name: kids[0].name });
        }
      } finally {
        setIsFetching(false);
      }
    };
    fetchFamily();
  }, []);

  const handleCreateMission = async () => {
    if (!familyId || !firstKid) {
      navigate("/parent/add-task");
      return;
    }
    setIsCreating(true);
    try {
      const { error } = await supabase.from("tasks").insert({
        family_id: familyId,
        kid_id: firstKid.id,
        title: "Clean your room",
        description: "Make your bed, tidy up, and organize your things. Take a photo when done!",
        credits_reward: 500,
        photo_required: true,
        status: "not_started",
      });
      if (error) throw error;
      navigate("/parent");
    } catch (err: any) {
      toast("Couldn't create mission — try again from the dashboard");
    } finally {
      setIsCreating(false);
    }
  };

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
            {isFetching
              ? "Loading your family..."
              : firstKid
              ? `This will be assigned to ${firstKid.name}`
              : "This will be your first mission"}
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
            variant={isFetching || isCreating ? "disabled" : "gold"}
            fullWidth
            disabled={isFetching || isCreating}
            onClick={handleCreateMission}
          >
            {isCreating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Create My First Mission →"
            )}
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
