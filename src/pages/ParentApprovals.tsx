import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ArrowLeft, Filter, ZoomIn, X, Check, Send, Coins, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoinIcon } from "@/components/mobile";
import { MobileButton } from "@/components/mobile/MobileButton";
import { MobileInput } from "@/components/mobile/MobileInput";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import loopoMascot from "@/assets/loopo-mascot.png";
import TaskApprovalCard, { type TaskApprovalItem } from "@/components/parent/TaskApprovalCard";
import RedemptionApprovalCard, { type RedemptionApprovalItem } from "@/components/parent/RedemptionApprovalCard";
import FamilyRewardApprovalCard, { type FamilyRewardApprovalItem } from "@/components/parent/FamilyRewardApprovalCard";
import { supabase } from "@/integrations/supabase/client";
import { resolveAvatar } from "@/lib/avatars";
import { formatDistanceToNow } from "date-fns";
import VoiceRecorder from "@/components/media/VoiceRecorder";

interface ExtraChoreApprovalItem {
  id: string;
  type: "extra_chore";
  kidName: string;
  kidAvatar: string;
  title: string;
  credits: number;
  category: string;
  estimated_time?: string;
  kid_note?: string;
  timeAgo: string;
  kidId: string;
}

interface DealRequestItem {
  id: string;
  type: "deal_request";
  kidName: string;
  kidAvatar: string;
  itemName: string;
  kidNote?: string;
  timeAgo: string;
  kidId: string;
}

type ApprovalItem =
  | TaskApprovalItem
  | RedemptionApprovalItem
  | FamilyRewardApprovalItem
  | ExtraChoreApprovalItem
  | DealRequestItem;
type FilterType = "all" | "tasks" | "redemptions" | "family_rewards" | "extra_chores" | "deal_requests";

const filterLabels: Record<FilterType, string> = {
  all: "All Items",
  tasks: "Tasks Only",
  redemptions: "Redemptions Only",
  family_rewards: "Family Rewards Only",
  extra_chores: "Extra Chores Only",
  deal_requests: "Deal Requests Only",
};

const ParentApprovals: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [approveSheetOpen, setApproveSheetOpen] = useState(false);
  const [denySheetOpen, setDenySheetOpen] = useState(false);
  const [fullPhotoOpen, setFullPhotoOpen] = useState(false);
  const [fullPhotoUrl, setFullPhotoUrl] = useState("");
  const [approveMessage, setApproveMessage] = useState("");
  const [denyMessage, setDenyMessage] = useState("");
  const [parentVoicePath, setParentVoicePath] = useState<string | null>(null);
  const [parentVoiceRecorded, setParentVoiceRecorded] = useState(false);
  const [isUploadingParentVoice, setIsUploadingParentVoice] = useState(false);
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [pendingFilter, setPendingFilter] = useState<FilterType>("all");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingItems = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: family } = await supabase
        .from("families")
        .select("id")
        .eq("parent_id", session.user.id)
        .maybeSingle();

      if (!family) return;

      const { data: pendingTasks, error } = await supabase
        .from("tasks")
        .select("*, kids(*)")
        .eq("family_id", family.id)
        .eq("status", "pending")
        .order("submitted_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending tasks:", error);
        return;
      }

      const taskItems: TaskApprovalItem[] = await Promise.all(
        (pendingTasks || []).map(async (task: any) => {
          let signedPhotoUrl: string | undefined;
          if (task.photo_url) {
            const { data: signedData } = await supabase.storage
              .from("task-photos")
              .createSignedUrl(task.photo_url, 3600);
            signedPhotoUrl = signedData?.signedUrl || undefined;
          }
          let signedVideoUrl: string | undefined;
          if (task.video_url) {
            const { data: signedVideoData } = await supabase.storage
              .from("task-videos")
              .createSignedUrl(task.video_url, 3600);
            signedVideoUrl = signedVideoData?.signedUrl || undefined;
          }
          return {
            id: task.id,
            type: "task" as const,
            kidName: task.kids?.name || "Unknown",
            kidAvatar: resolveAvatar(task.kids?.avatar || ""),
            taskTitle: task.title,
            credits: task.credits_reward,
            timeAgo: task.submitted_at
              ? formatDistanceToNow(new Date(task.submitted_at), { addSuffix: true })
              : "just now",
            photoUrl: signedPhotoUrl,
            videoUrl: signedVideoUrl,
          };
        })
      );

      // Fetch pending redemptions
      const { data: pendingRedemptions, error: redemptionError } = await supabase
        .from("redemptions")
        .select("*, kids(*)")
        .eq("family_id", family.id)
        .eq("status", "pending")
        .order("requested_at", { ascending: false });

      if (redemptionError) {
        console.error("Error fetching pending redemptions:", redemptionError);
      }

      const redemptionItems: RedemptionApprovalItem[] = (pendingRedemptions || []).map((r: any) => ({
        id: r.id,
        type: "redemption" as const,
        kidName: r.kids?.name || "Unknown",
        kidAvatar: resolveAvatar(r.kids?.avatar || ""),
        productId: r.product_id,
        productName: r.product_name,
        productImage: r.product_image || "/placeholder.svg",
        costCredits: r.cost_credits,
        balanceBefore: r.kids?.credits_balance || 0,
        balanceAfter: (r.kids?.credits_balance || 0) - r.cost_credits,
        timeAgo: r.requested_at
          ? formatDistanceToNow(new Date(r.requested_at), { addSuffix: true })
          : "just now",
      }));

      // Fetch pending family reward requests
      const { data: kids } = await supabase
        .from("kids")
        .select("id, name, avatar")
        .eq("family_id", family.id);

      let familyRewardItems: FamilyRewardApprovalItem[] = [];
      if (kids && kids.length > 0) {
        const kidIds = kids.map((k) => k.id);
        const kidsMap = new Map(kids.map((k) => [k.id, k]));

        const { data: frRequests } = await supabase
          .from("family_reward_requests")
          .select("id, kid_id, family_reward_id, requested_at, status")
          .in("kid_id", kidIds)
          .eq("status", "requested")
          .order("requested_at", { ascending: false });

        if (frRequests && frRequests.length > 0) {
          const rewardIds = [...new Set(frRequests.map((r) => r.family_reward_id))];
          const { data: rewards } = await supabase
            .from("family_rewards")
            .select("id, title, credits_cost")
            .in("id", rewardIds);

          const rewardsMap = new Map((rewards || []).map((r) => [r.id, r]));

          familyRewardItems = frRequests.map((req) => {
            const kid = kidsMap.get(req.kid_id);
            const reward = rewardsMap.get(req.family_reward_id);
            return {
              id: req.id,
              type: "family_reward" as const,
              kidName: kid?.name || "Unknown",
              kidAvatar: resolveAvatar(kid?.avatar || ""),
              rewardTitle: reward?.title || "Reward",
              creditsCost: reward?.credits_cost || 0,
              timeAgo: req.requested_at
                ? formatDistanceToNow(new Date(req.requested_at), { addSuffix: true })
                : "just now",
              kidId: req.kid_id,
            };
          });
        }
      }

      // Fetch pending extra chore requests
      let extraChoreItems: ExtraChoreApprovalItem[] = [];
      const { data: ecRequests, error: ecError } = await supabase
        .from("extra_chore_requests")
        .select("*, kids(id, name, avatar)")
        .eq("family_id", family.id)
        .eq("status", "requested")
        .order("last_requested_at", { ascending: false });

      if (ecError) {
        console.error("Error fetching pending extra chore requests:", ecError);
      }

      extraChoreItems = (ecRequests || []).map((r: any) => ({
        id: r.id,
        type: "extra_chore" as const,
        kidName: r.kids?.name || "Unknown",
        kidAvatar: resolveAvatar(r.kids?.avatar || ""),
        title: r.title,
        credits: r.credits,
        category: r.category,
        estimated_time: r.estimated_time || undefined,
        kid_note: r.kid_note || undefined,
        timeAgo: r.last_requested_at
          ? formatDistanceToNow(new Date(r.last_requested_at), { addSuffix: true })
          : "just now",
        kidId: r.kid_id,
      }));

      // Fetch pending deal requests
      const { data: dealRequests } = await supabase
        .from("parent_deals")
        .select("id, kid_id, item_name, kid_note, created_at")
        .eq("family_id", family.id)
        .eq("status", "requested")
        .order("created_at", { ascending: false });

      const dealKidsMap = new Map((kids || []).map((k) => [k.id, k]));
      const dealItems: DealRequestItem[] = (dealRequests || []).map((d: any) => {
        const kid = dealKidsMap.get(d.kid_id);
        return {
          id: d.id,
          type: "deal_request" as const,
          kidName: kid?.name || "Unknown",
          kidAvatar: resolveAvatar(kid?.avatar || ""),
          itemName: d.item_name,
          kidNote: d.kid_note || undefined,
          timeAgo: d.created_at
            ? formatDistanceToNow(new Date(d.created_at), { addSuffix: true })
            : "just now",
          kidId: d.kid_id,
        };
      });

      setItems([...taskItems, ...redemptionItems, ...familyRewardItems, ...extraChoreItems, ...dealItems]);
    } catch (err) {
      console.error("Error loading approvals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingItems();
  }, [fetchPendingItems]);

  const handleBack = () => navigate(-1);
  const handleFilter = () => {
    setPendingFilter(activeFilter);
    setFilterSheetOpen(true);
  };

  const applyFilter = () => {
    setActiveFilter(pendingFilter);
    setFilterSheetOpen(false);
  };

  const filteredItems = items.filter((item) => {
    if (activeFilter === "tasks") return item.type === "task";
    if (activeFilter === "redemptions") return item.type === "redemption";
    if (activeFilter === "family_rewards") return item.type === "family_reward";
    if (activeFilter === "extra_chores") return item.type === "extra_chore";
    if (activeFilter === "deal_requests") return item.type === "deal_request";
    return true;
  });

  const isFilterActive = activeFilter !== "all";

  const handlePhotoTap = (url: string) => {
    setFullPhotoUrl(url);
    setFullPhotoOpen(true);
  };

  const handleApproveClick = (item: ApprovalItem) => {
    setSelectedItem(item);
    setApproveMessage("");
    setApproveSheetOpen(true);
  };

  const handleDenyClick = (item: ApprovalItem) => {
    setSelectedItem(item);
    setDenyMessage("");
    setDenySheetOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedItem || actionLoading) return;
    setActionLoading(true);

    try {
      if (selectedItem.type === "task") {
        const { error: taskError } = await supabase
          .from("tasks")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            parent_note: approveMessage.trim() || null,
            parent_voice_url: parentVoicePath || null,
          })
          .eq("id", selectedItem.id);

        if (taskError) throw taskError;

        const { data: taskData } = await supabase
          .from("tasks")
          .select("kid_id, credits_reward")
          .eq("id", selectedItem.id)
          .single();

        if (taskData) {
          await supabase.rpc('increment_kid_credits', {
            kid_id: taskData.kid_id,
            amount: taskData.credits_reward,
          });
        }

        toast({
          title: `Task approved! ${selectedItem.kidName} earned ${(selectedItem as TaskApprovalItem).credits} credits 🎉`,
          className: "bg-success text-success-foreground font-display",
        });
      } else if (selectedItem.type === "redemption") {
        const redemption = selectedItem as RedemptionApprovalItem;

        const { data: productData } = await supabase
          .from("products")
          .select("redemption_code")
          .eq("id", redemption.productId)
          .single();

        const { error: redemptionError } = await supabase
          .from("redemptions")
          .update({
            status: "approved",
            approved_at: new Date().toISOString(),
            parent_note: approveMessage.trim() || null,
            redemption_code: productData?.redemption_code || null,
          })
          .eq("id", selectedItem.id);

        if (redemptionError) throw redemptionError;

        const { data: redemptionData } = await supabase
          .from("redemptions")
          .select("kid_id, cost_credits")
          .eq("id", selectedItem.id)
          .single();

        if (redemptionData) {
          const { data: kidData } = await supabase
            .from("kids")
            .select("credits_balance")
            .eq("id", redemptionData.kid_id)
            .single();
          if (!kidData || kidData.credits_balance < redemptionData.cost_credits) {
            toast({ title: "Not enough credits!", description: "This kid doesn't have enough credits for this redemption.", variant: "destructive" });
            setActionLoading(false);
            return;
          }
          await supabase.rpc('increment_kid_credits', {
            kid_id: redemptionData.kid_id,
            amount: -redemptionData.cost_credits,
          });
        }

        toast({
          title: `${redemption.productName} approved for ${selectedItem.kidName}! 🎉`,
          className: "bg-success text-success-foreground font-display",
        });
      } else if (selectedItem.type === "family_reward") {
        const frItem = selectedItem as FamilyRewardApprovalItem;

        const { error: frError } = await supabase
          .from("family_reward_requests")
          .update({
            status: "approved",
            approved_at: new Date().toISOString(),
          })
          .eq("id", selectedItem.id);

        if (frError) throw frError;

        // Deduct credits
        await supabase.rpc('increment_kid_credits', {
          kid_id: frItem.kidId,
          amount: -frItem.creditsCost,
        });

        toast({
          title: `${frItem.rewardTitle} approved for ${frItem.kidName}! 🎉`,
          className: "bg-success text-success-foreground font-display",
        });
      } else if (selectedItem.type === "extra_chore") {
        const ecItem = selectedItem as ExtraChoreApprovalItem;

        const { error: ecError } = await supabase
          .from("extra_chore_requests")
          .update({
            status: "approved",
            approved_at: new Date().toISOString(),
            parent_note: approveMessage.trim() || null,
          })
          .eq("id", selectedItem.id);

        if (ecError) throw ecError;

        toast({
          title: `${ecItem.title} approved for ${ecItem.kidName}!`,
          className: "bg-success text-success-foreground font-display",
        });
      }

      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setApproveSheetOpen(false);
      setSelectedItem(null);
      setParentVoicePath(null);
      setParentVoiceRecorded(false);
    } catch (err) {
      console.error("Approve error:", err);
      toast({ title: "Failed to approve. Please try again.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeny = async () => {
    if (!selectedItem || actionLoading) return;
    
    setActionLoading(true);

    try {
      if (selectedItem.type === "task") {
        const { error } = await supabase
          .from("tasks")
          .update({
            status: "denied",
            parent_note: denyMessage.trim() || null,
            parent_voice_url: parentVoicePath || null,
          })
          .eq("id", selectedItem.id);

        if (error) throw error;
      } else if (selectedItem.type === "redemption") {
        const { error } = await supabase
          .from("redemptions")
          .update({
            status: "denied",
            denied_at: new Date().toISOString(),
            parent_note: denyMessage.trim() || null,
          })
          .eq("id", selectedItem.id);

        if (error) throw error;
      } else if (selectedItem.type === "family_reward") {
        const { error } = await supabase
          .from("family_reward_requests")
          .update({
            status: "denied",
            parent_note: denyMessage.trim() || null,
          })
          .eq("id", selectedItem.id);

        if (error) throw error;
      } else if (selectedItem.type === "extra_chore") {
        const { error } = await supabase
          .from("extra_chore_requests")
          .update({
            status: "denied",
            parent_note: denyMessage.trim() || null,
          })
          .eq("id", selectedItem.id);

        if (error) throw error;
      }

      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setDenySheetOpen(false);

      toast({
        title:
          selectedItem.type === "task"
            ? `${selectedItem.kidName} will try again!`
            : selectedItem.type === "family_reward"
            ? `Reward request denied`
            : selectedItem.type === "extra_chore"
            ? `Extra chore request denied`
            : `Redemption denied`,
        className: "bg-muted text-foreground font-display",
      });
      setSelectedItem(null);
      setDenyMessage("");
      setParentVoicePath(null);
      setParentVoiceRecorded(false);
    } catch (err) {
      console.error("Deny error:", err);
      toast({ title: "Failed to deny. Please try again.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleParentVoiceComplete = async (blob: Blob, extension: string) => {
    if (!selectedItem) return;
    setIsUploadingParentVoice(true);
    const filePath = `parent_voice/${selectedItem.id}_${Date.now()}.${extension}`;
    try {
      const { error } = await supabase.storage
        .from("task-voice")
        .upload(filePath, blob, { upsert: true, contentType: blob.type });
      if (error) {
        toast({ title: "Voice upload failed", description: error.message, variant: "destructive" });
      } else {
        setParentVoicePath(filePath);
        setParentVoiceRecorded(true);
        toast({ title: "Voice note saved ✓" });
      }
    } catch (err: any) {
      toast({ title: "Voice upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsUploadingParentVoice(false);
    }
  };

  const handleSwipeEnd = (id: string, info: PanInfo) => {
    const threshold = 100;
    const item = items.find((i) => i.id === id);
    if (item) {
      if (info.offset.x > threshold) handleApproveClick(item);
      else if (info.offset.x < -threshold) handleDenyClick(item);
    }
    setSwipingId(null);
    setSwipeDirection(null);
  };

  const handleSwipeUpdate = (id: string, info: PanInfo) => {
    setSwipingId(id);
    if (info.offset.x > 50) setSwipeDirection("right");
    else if (info.offset.x < -50) setSwipeDirection("left");
    else setSwipeDirection(null);
  };

  const isRedemption = selectedItem?.type === "redemption";
  const isFamilyReward = selectedItem?.type === "family_reward";
  const selectedRedemption = isRedemption ? (selectedItem as RedemptionApprovalItem) : null;
  const selectedTask = selectedItem?.type === "task" ? (selectedItem as TaskApprovalItem) : null;
  const selectedFamilyReward = isFamilyReward ? (selectedItem as FamilyRewardApprovalItem) : null;

  const itemCount = filteredItems.length;
  const itemLabel = itemCount === 1 ? "item" : "items";

  return (
    <div className="min-h-screen bg-background-tint">
      <div className="mx-auto max-w-md min-h-screen relative">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-50 bg-card flex items-center justify-between px-4"
          style={{
            paddingTop: "max(env(safe-area-inset-top), 12px)",
            height: "calc(60px + max(env(safe-area-inset-top), 12px))",
          }}
        >
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleBack} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="font-display font-bold text-xl text-foreground">Pending Approvals</h1>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleFilter} className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <Filter className="w-6 h-6 text-foreground" />
            {isFilterActive && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full" />
            )}
          </motion.button>
        </header>

        {/* Main Content */}
        <main className="pb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredItems.length > 0 ? (
            <>
              <div className="mx-5 mt-5">
                <div className="bg-background-tint rounded-2xl p-4 flex gap-3 overflow-hidden">
                  <div className="w-1 bg-primary rounded-full flex-shrink-0" />
                  <div>
                    <p className="font-display font-bold text-base text-foreground">
                      {itemCount} {itemLabel} waiting for your review
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Swipe or tap to review
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3 px-3">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -300, transition: { duration: 0.3 } }}
                    >
                      {item.type === "task" ? (
                        <TaskApprovalCard
                          item={item}
                          swipingId={swipingId}
                          swipeDirection={swipeDirection}
                          onSwipeUpdate={handleSwipeUpdate}
                          onSwipeEnd={handleSwipeEnd}
                          onPhotoTap={handlePhotoTap}
                          onApprove={() => handleApproveClick(item)}
                          onDeny={() => handleDenyClick(item)}
                        />
                      ) : item.type === "redemption" ? (
                        <RedemptionApprovalCard
                          item={item as RedemptionApprovalItem}
                          swipingId={swipingId}
                          swipeDirection={swipeDirection}
                          onSwipeUpdate={handleSwipeUpdate}
                          onSwipeEnd={handleSwipeEnd}
                          onApprove={() => handleApproveClick(item)}
                          onDeny={() => handleDenyClick(item)}
                        />
                      ) : item.type === "family_reward" ? (
                        <FamilyRewardApprovalCard
                          item={item as FamilyRewardApprovalItem}
                          onApprove={() => handleApproveClick(item)}
                          onDeny={() => handleDenyClick(item)}
                        />
                      ) : item.type === "deal_request" ? (
                        (() => {
                          const dr = item as DealRequestItem;
                          return (
                            <div className="bg-card rounded-2xl p-4 shadow-card space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                                  {dr.kidAvatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-display font-bold text-base text-foreground truncate">
                                    {dr.kidName}
                                  </p>
                                  <p className="font-body text-xs text-muted-foreground">
                                    Deal request · {dr.timeAgo}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="font-display font-bold text-foreground">
                                  {dr.itemName}
                                </p>
                                {dr.kidNote && (
                                  <p className="font-body text-sm italic text-muted-foreground mt-2">
                                    "{dr.kidNote}"
                                  </p>
                                )}
                              </div>
                              <MobileButton
                                variant="primary"
                                size="sm"
                                fullWidth
                                onClick={() => navigate("/parent/deals")}
                              >
                                Set Terms
                              </MobileButton>
                            </div>
                          );
                        })()
                      ) : (
                        (() => {
                          const ec = item as ExtraChoreApprovalItem;
                          return (
                            <div className="bg-card rounded-2xl p-4 shadow-card space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                                  {ec.kidAvatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-display font-bold text-base text-foreground truncate">
                                    {ec.kidName}
                                  </p>
                                  <p className="font-body text-xs text-muted-foreground">
                                    Extra chore · {ec.timeAgo}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="font-display font-bold text-foreground">
                                  {ec.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                  <div className="flex items-center gap-1 text-accent-gold">
                                    <Coins className="w-4 h-4" />
                                    <span className="font-display font-bold text-sm">
                                      {ec.credits}
                                    </span>
                                  </div>
                                  {ec.estimated_time && (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Clock className="w-4 h-4" />
                                      <span className="font-body text-xs">
                                        {ec.estimated_time}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {ec.kid_note && (
                                  <p className="font-body text-sm italic text-muted-foreground mt-2">
                                    "{ec.kid_note}"
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 pt-1">
                                <MobileButton
                                  variant="outline"
                                  size="sm"
                                  fullWidth
                                  onClick={() => handleDenyClick(item)}
                                >
                                  Deny
                                </MobileButton>
                                <MobileButton
                                  variant="primary"
                                  size="sm"
                                  fullWidth
                                  onClick={() => handleApproveClick(item)}
                                >
                                  Approve
                                </MobileButton>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-8">
              <motion.img
                src={loopoMascot}
                alt="Loopo mascot"
                className="w-40 h-40 object-contain mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                All caught up! 🎉
              </h2>
              <p className="font-body text-sm text-muted-foreground text-center">
                No approvals waiting
              </p>
            </div>
          )}
        </main>

        {/* Approve Bottom Sheet */}
        <Sheet open={approveSheetOpen} onOpenChange={setApproveSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-[32px] px-6 pt-6 pb-8">
            <SheetHeader className="mb-6">
              <SheetTitle className="font-display font-bold text-2xl text-foreground text-center">
                {isFamilyReward ? "Approve Reward?" : isRedemption ? "Approve Redemption?" : "Approve Task?"}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4">
              {selectedItem && (
                <div className="bg-background-tint rounded-2xl p-4">
                  {isFamilyReward && selectedFamilyReward ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                          {selectedFamilyReward.kidAvatar}
                        </div>
                        <div>
                          <p className="font-display font-bold text-base text-foreground">
                            {selectedFamilyReward.rewardTitle}
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            {selectedFamilyReward.kidName} will receive this reward
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-body text-sm text-muted-foreground">Cost:</span>
                        <CoinIcon size={16} />
                        <span className="font-display font-bold text-sm text-accent-gold">
                          {selectedFamilyReward.creditsCost.toLocaleString()} credits
                        </span>
                      </div>
                    </div>
                  ) : isRedemption && selectedRedemption ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                          {selectedRedemption.kidAvatar}
                        </div>
                        <div>
                          <p className="font-display font-bold text-base text-foreground">
                            {selectedRedemption.productName}
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            {selectedRedemption.kidName} will receive the code
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-body text-sm text-muted-foreground">Cost:</span>
                        <CoinIcon size={16} />
                        <span className="font-display font-bold text-sm text-accent-gold">
                          {selectedRedemption.costCredits.toLocaleString()} credits
                        </span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground">
                        {selectedRedemption.kidName}'s balance after: {selectedRedemption.balanceAfter.toLocaleString()} credits
                      </p>
                    </div>
                  ) : selectedTask ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                        {selectedTask.kidAvatar}
                      </div>
                      <div>
                        <p className="font-display font-bold text-base text-foreground">
                          {selectedTask.taskTitle}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <CoinIcon size={16} />
                          <span className="font-body text-sm text-accent-gold font-semibold">
                            +{selectedTask.credits} credits
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {selectedItem?.type === "task" && (
                <div className="mb-2">
                  <p className="font-body text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                    Voice cheer (optional)
                  </p>
                  {isUploadingParentVoice ? (
                    <div className="w-full h-[56px] rounded-[20px] bg-background-tint border-2 border-dashed border-primary/30 flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="font-body text-sm text-muted-foreground">Saving voice note...</span>
                    </div>
                  ) : parentVoiceRecorded ? (
                    <div className="w-full h-[56px] rounded-[20px] bg-success/10 border-2 border-success/30 flex items-center justify-center gap-2 px-4">
                      <span className="text-xl">🎤</span>
                      <span className="font-body text-sm text-foreground">Voice cheer added ✓</span>
                      <button
                        onClick={() => { setParentVoicePath(null); setParentVoiceRecorded(false); }}
                        className="ml-2 text-xs text-muted-foreground underline font-body"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <VoiceRecorder onRecordingComplete={handleParentVoiceComplete} label="Record a voice cheer 🎤" />
                  )}
                </div>
              )}

              <MobileInput
                placeholder={isRedemption ? "Add message (optional)" : "Add encouraging message (optional)"}
                value={approveMessage}
                onChange={(e) => setApproveMessage(e.target.value)}
              />

              <MobileButton variant="success" fullWidth onClick={confirmApprove} disabled={actionLoading} className="mt-4">
                <Check className="w-5 h-5 mr-2" />
                {actionLoading ? "Processing..." : isFamilyReward ? "Approve Reward" : isRedemption ? "Approve & Send Code" : "Approve Task"}
              </MobileButton>

              <button
                onClick={() => setApproveSheetOpen(false)}
                className="w-full py-3 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Deny Bottom Sheet */}
        <Sheet open={denySheetOpen} onOpenChange={setDenySheetOpen}>
          <SheetContent side="bottom" className="rounded-t-[32px] px-6 pt-6 pb-8">
            <SheetHeader className="mb-6">
              <SheetTitle className="font-display font-bold text-2xl text-foreground text-center">
                {isFamilyReward ? "Deny Reward?" : isRedemption ? "Deny Redemption?" : selectedItem?.type === "task" ? "Send feedback" : "Deny Task?"}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4">
              {selectedItem && (
                <div>
                  {isFamilyReward && selectedFamilyReward ? (
                    <>
                      <p className="font-body text-sm text-accent-gold mb-3">
                        {selectedFamilyReward.kidName} won't get this reward
                      </p>
                      <label className="font-body text-sm text-muted-foreground mb-2 block">
                        Tell {selectedFamilyReward.kidName} why (optional)
                      </label>
                    </>
                  ) : isRedemption && selectedRedemption ? (
                    <>
                      <p className="font-body text-sm text-accent-gold mb-3">
                        {selectedRedemption.kidName} won't get this reward
                      </p>
                      <label className="font-body text-sm text-muted-foreground mb-2 block">
                        Tell {selectedRedemption.kidName} why (optional)
                      </label>
                    </>
                  ) : (
                    <label className="font-body text-sm text-muted-foreground mb-2 block">
                      Or write your own tip for {selectedItem.kidName}
                    </label>
                  )}
                  {selectedItem?.type === "task" && (
                    <div className="mb-3">
                      <p className="font-body text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                        Quick replies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "The floor still has toys",
                          "Please also make the bed",
                          "Photo is a bit unclear",
                          "Almost there, try again!",
                          "Needs a little more effort",
                        ].map((template) => (
                          <button
                            key={template}
                            onClick={() => setDenyMessage(template)}
                            className={cn(
                              "px-3 py-1.5 rounded-full border font-body text-xs transition-colors",
                              denyMessage === template
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
                            )}
                          >
                            {template}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedItem?.type === "task" && (
                    <div className="mb-3">
                      <p className="font-body text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                        Voice tip (optional)
                      </p>
                      {isUploadingParentVoice ? (
                        <div className="w-full h-[56px] rounded-[20px] bg-background-tint border-2 border-dashed border-primary/30 flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="font-body text-sm text-muted-foreground">Saving voice note...</span>
                        </div>
                      ) : parentVoiceRecorded ? (
                        <div className="w-full h-[56px] rounded-[20px] bg-success/10 border-2 border-success/30 flex items-center justify-center gap-2 px-4">
                          <span className="text-xl">🎤</span>
                          <span className="font-body text-sm text-foreground">Voice tip added ✓</span>
                          <button
                            onClick={() => { setParentVoicePath(null); setParentVoiceRecorded(false); }}
                            className="ml-2 text-xs text-muted-foreground underline font-body"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <VoiceRecorder onRecordingComplete={handleParentVoiceComplete} label="Record a voice tip 🎤" />
                      )}
                    </div>
                  )}
                  <textarea
                    placeholder={
                      isFamilyReward || isRedemption
                        ? "Maybe save for something else"
                        : selectedItem?.type === "task"
                        ? "e.g. The floor still has toys on it"
                        : "Example: Please also organize the bookshelf"
                    }
                    value={denyMessage}
                    onChange={(e) => setDenyMessage(e.target.value.slice(0, 200))}
                    className={cn(
                      "w-full h-24 rounded-2xl border-2 border-input bg-card px-4 py-3",
                      "font-body text-base text-foreground resize-none",
                      "placeholder:text-muted-foreground",
                      "transition-all duration-200",
                      "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
                    )}
                  />
                  <p className="text-right font-body text-xs text-muted-foreground mt-1">
                    {denyMessage.length}/200
                  </p>
                </div>
              )}

              <MobileButton
                variant="primary"
                fullWidth
                onClick={confirmDeny}
                disabled={actionLoading}
                className="mt-2 !bg-error hover:!bg-error/90"
              >
                <Send className="w-5 h-5 mr-2" />
                {actionLoading ? "Processing..." : isFamilyReward ? "Deny Request" : isRedemption ? "Deny Request" : selectedItem?.type === "task" ? "Send tip and try again" : "Send Feedback"}
              </MobileButton>

              <button
                onClick={() => setDenySheetOpen(false)}
                className="w-full py-3 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Full Photo Modal */}
        <AnimatePresence>
          {fullPhotoOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
              onClick={() => setFullPhotoOpen(false)}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setFullPhotoOpen(false)}
                className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-card/20 backdrop-blur-sm z-10"
                style={{ marginTop: "env(safe-area-inset-top)" }}
              >
                <X className="w-6 h-6 text-card" />
              </motion.button>

              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                src={fullPhotoUrl}
                alt="Full size photo"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              <div
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
                style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
              >
                <div className="flex gap-3 max-w-md mx-auto">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullPhotoOpen(false);
                      const task = items.find(
                        (i) => i.type === "task" && (i as TaskApprovalItem).photoUrl === fullPhotoUrl
                      );
                      if (task) handleDenyClick(task);
                    }}
                    className="flex-1 h-12 rounded-xl border-2 border-error bg-error/20 font-display font-bold text-sm text-card transition-colors"
                  >
                    Deny
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullPhotoOpen(false);
                      const task = items.find(
                        (i) => i.type === "task" && (i as TaskApprovalItem).photoUrl === fullPhotoUrl
                      );
                      if (task) handleApproveClick(task);
                    }}
                    className="flex-1 h-12 rounded-xl bg-success font-display font-bold text-sm text-success-foreground transition-colors"
                  >
                    Approve ✓
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Bottom Sheet */}
        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-[32px] px-6 pt-6 pb-8">
            <SheetHeader className="mb-6">
              <SheetTitle className="font-display font-bold text-2xl text-foreground text-center">
                Filter Approvals
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-2">
              {(Object.entries(filterLabels) as [FilterType, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setPendingFilter(key)}
                  className={cn(
                    "w-full h-14 flex items-center gap-4 px-4 rounded-xl transition-colors",
                    pendingFilter === key ? "bg-primary/10" : "hover:bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      pendingFilter === key ? "border-primary" : "border-muted-foreground/40"
                    )}
                  >
                    {pendingFilter === key && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className={cn(
                    "font-body text-base",
                    pendingFilter === key ? "text-foreground font-semibold" : "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                </button>
              ))}
            </div>

            <MobileButton variant="primary" fullWidth onClick={applyFilter} className="mt-6">
              Apply Filter
            </MobileButton>

            <button
              onClick={() => setFilterSheetOpen(false)}
              className="w-full py-3 mt-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ParentApprovals;
