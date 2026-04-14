import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Coins } from "lucide-react";
import { MobileButton } from "@/components/mobile/MobileButton";
import { Loader2 } from "lucide-react";

interface Template {
  id: string;
  title: string;
  tier: string;
  default_credits: number;
  category: string | null;
}

interface TemplateLibraryProps {
  onBack: () => void;
  onSelectTemplate: (template: Template) => void;
}

const TIER_ORDER = ["Easy", "Medium", "Hard"];

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onBack, onSelectTemplate }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("family_reward_templates")
        .select("*")
        .order("tier")
        .order("default_credits");
      setTemplates(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const grouped = TIER_ORDER.map((tier) => ({
    tier,
    items: templates.filter((t) => t.tier.toLowerCase() === tier.toLowerCase()),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="font-display font-bold text-lg text-foreground">Choose a Template</h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {grouped.map(({ tier, items }) => (
            <div key={tier} className="mt-5">
              <p className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {tier}
              </p>
              <div className="space-y-2">
                {items.map((t) => (
                  <motion.div
                    key={t.id}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-display font-bold text-foreground truncate">{t.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Coins className="w-4 h-4 text-accent-gold" />
                        <span className="text-sm font-body font-semibold text-muted-foreground">
                          {t.default_credits}
                        </span>
                      </div>
                    </div>
                    <MobileButton size="sm" onClick={() => onSelectTemplate(t)}>
                      Add
                    </MobileButton>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { TemplateLibrary };
export type { Template };
