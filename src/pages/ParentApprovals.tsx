import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ArrowLeft, Filter, ZoomIn, X, Check, Send } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { resolveAvatar } from "@/lib/avatars";
import { formatDistanceToNow } from "date-fns";

type ApprovalItem = TaskApprovalItem | RedemptionApprovalItem;
type FilterType = "all" | "tasks" | "redemptions";

const filterLabels: Record<FilterType, string> = {
  all: "All Items",
  tasks: "Tasks Only",
  redemptions: "Redemptions Only",
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

      setItems([...taskItems, ...redemptionItems]);
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
        // Update task status to completed
        const { error: taskError } = await supabase
          .from("tasks")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            parent_note: approveMessage.trim() || null,
          })
          .eq("id", selectedItem.id);

        if (taskError) throw taskError;

        // Add credits to kid's balance
        // First get the task to find kid_id and credits
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
          title: `Task approved! ${selectedItem.kidName} earned ${selectedItem.credits} credits 🎉`,
          className: "bg-success text-success-foreground font-display",
        });
      } else if (selectedItem.type === "redemption") {
        const redemption = selectedItem as RedemptionApprovalItem;

        // Fetch redemption_code from the products table
        const { data: productData } = await supabase
          .from("products")
          .select("redemption_code")
          .eq("id", redemption.productId)
          .single();

        // Update redemption status to approved with the product's code
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

        // Deduct credits from kid's balance
        const { data: redemptionData } = await supabase
          .from("redemptions")
          .select("kid_id, cost_credits")
          .eq("id", selectedItem.id)
          .single();

        if (redemptionData) {
          const { data: kid } = await supabase
            .from("kids")
            .select("credits_balance")
            .eq("id", redemptionData.kid_id)
            .single();

          if (kid) {
            await supabase
              .from("kids")
              .update({
                credits_balance: (kid.credits_balance || 0) - redemptionData.cost_credits,
              })
              .eq("id", redemptionData.kid_id);
          }
        }

        toast({
          title: `${redemption.productName} approved for ${selectedItem.kidName}! 🎉`,
          className: "bg-success text-success-foreground font-display",
        });
      }

      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setApproveSheetOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Approve error:", err);
      toast({ title: "Failed to approve. Please try again.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeny = async () => {
    if (!selectedItem || actionLoading) return;
    if (selectedItem.type === "task" && denyMessage.trim().length === 0) return;
    setActionLoading(true);

    try {
      if (selectedItem.type === "task") {
        const { error } = await supabase
          .from("tasks")
          .update({
            status: "denied",
            parent_note: denyMessage.trim() || null,
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
      }

      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setDenySheetOpen(false);

      toast({
        title:
          selectedItem.type === "task"
            ? `Feedback sent to ${selectedItem.kidName}`
            : `Redemption denied`,
        className: "bg-muted text-foreground font-display",
      });
      setSelectedItem(null);
      setDenyMessage("");
    } catch (err) {
      console.error("Deny error:", err);
      toast({ title: "Failed to deny. Please try again.", variant: "destructive" });
    } finally {
      setActionLoading(false);
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
  const selectedRedemption = isRedemption ? (selectedItem as RedemptionApprovalItem) : null;
  const selectedTask = !isRedemption ? (selectedItem as TaskApprovalItem) : null;

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
                      ) : (
                        <RedemptionApprovalCard
                          item={item}
                          swipingId={swipingId}
                          swipeDirection={swipeDirection}
                          onSwipeUpdate={handleSwipeUpdate}
                          onSwipeEnd={handleSwipeEnd}
                          onApprove={() => handleApproveClick(item)}
                          onDeny={() => handleDenyClick(item)}
                        />
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
                {isRedemption ? "Approve Redemption?" : "Approve Task?"}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4">
              {selectedItem && (
                <div className="bg-background-tint rounded-2xl p-4">
                  {isRedemption && selectedRedemption ? (
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

              <MobileInput
                placeholder={isRedemption ? "Add message (optional)" : "Add encouraging message (optional)"}
                value={approveMessage}
                onChange={(e) => setApproveMessage(e.target.value)}
              />

              <MobileButton variant="success" fullWidth onClick={confirmApprove} disabled={actionLoading} className="mt-4">
                <Check className="w-5 h-5 mr-2" />
                {actionLoading ? "Processing..." : isRedemption ? "Approve & Send Code" : "Approve Task"}
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
                {isRedemption ? "Deny Redemption?" : "Deny Task?"}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4">
              {selectedItem && (
                <div>
                  {isRedemption && selectedRedemption ? (
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
                      Tell {selectedItem.kidName} what needs improvement
                    </label>
                  )}
                  <textarea
                    placeholder={
                      isRedemption
                        ? "Maybe save for something else"
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
                disabled={(!isRedemption && denyMessage.trim().length === 0) || actionLoading}
                className="mt-2 !bg-error hover:!bg-error/90"
              >
                <Send className="w-5 h-5 mr-2" />
                {actionLoading ? "Processing..." : isRedemption ? "Deny Request" : "Send Feedback"}
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
