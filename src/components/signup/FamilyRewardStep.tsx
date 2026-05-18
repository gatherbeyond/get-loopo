import React, { useState } from "react";
import { motion } from "framer-motion";
import { MobileButton } from "@/components/mobile";

interface FamilyRewardStepProps {
  kidName: string;
  familyId: string;
  onDone: () => void;
}

const SUGGESTIONS = [
  { label: "Extra screen time 🕐", emoji: "🕐" },
  { label: "Movie night 🎬", emoji: "🎬" },
  { label: "Ice cream outing 🍦", emoji: "🍦" },
  { label: "Stay up late ⭐", emoji: "⭐" },
  { label: "Choose dinner 🍕", emoji: "🍕" },
];

const FamilyRewardStep = ({ kidName, familyId, onDone }: FamilyRewardStepProps) => {
  const [selected, setSelected] = useState<string>("");
  const [custom, setCustom] = useState("");
  const [credits, setCredits] = useState(500);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = selected === "__custom__" ? custom : selected;

  const handleAdd = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error: dbError } = await supabase
        .from("family_rewards")
        .insert({ family_id: familyId, title: title.trim(), credits_cost: credits });
      if (dbError) {
        setError(dbError.message);
        return;
      }
      onDone();
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="flex-1 px-5 pt-6 pb-8"
    >
      <h1 className="font-display font-bold text-2xl text-foreground">
        Add a family reward
      </h1>
      <p className="font-body text-sm text-muted-foreground mt-1">
        for {kidName} 🎁
      </p>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2 mt-6">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => {
              setSelected(s.label);
              setCustom("");
            }}
            className={`px-4 py-2 rounded-full border-2 font-display font-bold text-sm transition-all ${
              selected === s.label
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSelected("__custom__")}
          className={`px-4 py-2 rounded-full border-2 font-display font-bold text-sm transition-all ${
            selected === "__custom__"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-foreground"
          }`}
        >
          ✏️ Custom
        </button>
      </div>

      {/* Custom input */}
      {selected === "__custom__" && (
        <input
          type="text"
          placeholder="Type your reward..."
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="mt-4 w-full h-12 rounded-xl border-2 border-primary px-4 font-body text-sm text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      )}

      {/* Credits cost */}
      <div className="mt-6">
        <p className="font-body text-sm text-muted-foreground mb-2">Credits cost</p>
        <div className="flex gap-2">
          {[250, 500, 1000, 2000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setCredits(v)}
              className={`flex-1 h-11 rounded-xl border-2 font-display font-bold text-sm transition-all ${
                credits === v
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground"
              }`}
            >
              {v.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mt-4 font-body text-sm text-error">{error}</p>
      )}

      <div className="mt-8 space-y-3">
        <MobileButton
          variant="primary"
          fullWidth
          disabled={!title.trim() || saving}
          onClick={handleAdd}
        >
          {saving ? "Adding..." : "Add Reward 🎁"}
        </MobileButton>
        <button
          type="button"
          onClick={onDone}
          className="w-full h-12 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </div>
    </motion.div>
  );
};

export default FamilyRewardStep;
