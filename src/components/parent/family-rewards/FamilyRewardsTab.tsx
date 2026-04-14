import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Pencil, Trash2, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/mobile";
import { FloatingActionButton } from "@/components/parent/FloatingActionButton";
import { AddRewardSheet } from "./AddRewardSheet";
import { RewardFormSheet } from "./RewardFormSheet";
import { TemplateLibrary, type Template } from "./TemplateLibrary";
import { PendingFulfillmentSection } from "./PendingFulfillmentSection";

interface FamilyReward {
  id: string;
  title: string;
  credits_cost: number;
  tier: string | null;
  is_active: boolean | null;
}

const FamilyRewardsTab: React.FC = () => {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [rewards, setRewards] = useState<FamilyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sheet states
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [customFormOpen, setCustomFormOpen] = useState(false);
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Edit / template context
  const [editingReward, setEditingReward] = useState<FamilyReward | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: family } = await supabase
      .from("families")
      .select("id")
      .eq("parent_id", user.id)
      .maybeSingle();

    if (!family) { setLoading(false); return; }
    setFamilyId(family.id);

    const { data } = await supabase
      .from("family_rewards")
      .select("id, title, credits_cost, tier, is_active")
      .eq("family_id", family.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    setRewards(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Handlers
  const handleDeactivate = async (rewardId: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== rewardId));
    await supabase.from("family_rewards").update({ is_active: false }).eq("id", rewardId);
    toast.success("Reward deactivated");
  };

  const handleSaveCustom = async (title: string, creditsCost: number) => {
    if (!familyId) return;
    setSaving(true);
    await supabase.from("family_rewards").insert({
      family_id: familyId,
      title,
      credits_cost: creditsCost,
      is_active: true,
    });
    setSaving(false);
    setCustomFormOpen(false);
    toast.success("Reward added");
    fetchData();
  };

  const handleSaveFromTemplate = async (title: string, creditsCost: number) => {
    if (!familyId || !selectedTemplate) return;
    setSaving(true);
    await supabase.from("family_rewards").insert({
      family_id: familyId,
      title,
      credits_cost: creditsCost,
      tier: selectedTemplate.tier,
      is_active: true,
      created_from_template_id: selectedTemplate.id,
    });
    setSaving(false);
    setTemplateFormOpen(false);
    setShowTemplates(false);
    setSelectedTemplate(null);
    toast.success("Reward added");
    fetchData();
  };

  const handleSaveEdit = async (title: string, creditsCost: number) => {
    if (!editingReward) return;
    setSaving(true);
    await supabase
      .from("family_rewards")
      .update({ title, credits_cost: creditsCost })
      .eq("id", editingReward.id);
    setSaving(false);
    setEditFormOpen(false);
    setEditingReward(null);
    toast.success("Reward updated");
    fetchData();
  };

  const openEdit = (reward: FamilyReward) => {
    setEditingReward(reward);
    setEditFormOpen(true);
  };

  const openAddSheet = () => setAddSheetOpen(true);

  const handleChooseTemplates = () => {
    setAddSheetOpen(false);
    setShowTemplates(true);
  };

  const handleCreateCustom = () => {
    setAddSheetOpen(false);
    setCustomFormOpen(true);
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setTemplateFormOpen(true);
  };

  // Template library view
  if (showTemplates) {
    return (
      <>
        <TemplateLibrary
          onBack={() => setShowTemplates(false)}
          onSelectTemplate={handleSelectTemplate}
        />
        <RewardFormSheet
          open={templateFormOpen}
          onOpenChange={setTemplateFormOpen}
          onSave={handleSaveFromTemplate}
          initialTitle={selectedTemplate?.title ?? ""}
          initialCredits={selectedTemplate?.default_credits}
          saving={saving}
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state
  if (rewards.length === 0) {
    return (
      <>
        <EmptyState
          title="No Family Rewards Yet"
          description="Set up rewards your kids can earn at home"
          actionLabel="Set Up Family Rewards"
          onAction={openAddSheet}
        />
        <AddRewardSheet
          open={addSheetOpen}
          onOpenChange={setAddSheetOpen}
          onChooseTemplates={handleChooseTemplates}
          onCreateCustom={handleCreateCustom}
        />
        <RewardFormSheet
          open={customFormOpen}
          onOpenChange={setCustomFormOpen}
          onSave={handleSaveCustom}
          saving={saving}
        />
      </>
    );
  }

  // Active rewards list
  return (
    <>
      <div className="px-4 pt-4 pb-32 space-y-3">
        <AnimatePresence mode="popLayout">
          {rewards.map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -60 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-foreground truncate">{r.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Coins className="w-4 h-4 text-accent-gold" />
                  <span className="text-sm font-body font-semibold text-muted-foreground">
                    {r.credits_cost}
                  </span>
                </div>
              </div>
              <button
                onClick={() => openEdit(r)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Edit reward"
              >
                <Pencil className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => handleDeactivate(r.id)}
                className="p-2 rounded-full hover:bg-error/10 transition-colors"
                aria-label="Deactivate reward"
              >
                <Trash2 className="w-5 h-5 text-error" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <PendingFulfillmentSection familyId={familyId} />
      </div>

      <FloatingActionButton onClick={openAddSheet} />

      <AddRewardSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        onChooseTemplates={handleChooseTemplates}
        onCreateCustom={handleCreateCustom}
      />
      <RewardFormSheet
        open={customFormOpen}
        onOpenChange={setCustomFormOpen}
        onSave={handleSaveCustom}
        saving={saving}
      />
      <RewardFormSheet
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        onSave={handleSaveEdit}
        initialTitle={editingReward?.title ?? ""}
        initialCredits={editingReward?.credits_cost}
        isEdit
        saving={saving}
      />
    </>
  );
};

export { FamilyRewardsTab };
