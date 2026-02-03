import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, ChevronDown, ChevronUp, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoinIcon, EmptyState } from "@/components/mobile";
import { KidBottomNav, KidNavTab } from "@/components/kid";
import { useToast } from "@/hooks/use-toast";
import loopoMascot from "@/assets/loopo-mascot.png";

type RewardStatus = "ready" | "pending" | "used";

interface Reward {
  id: string;
  name: string;
  image: string;
  creditCost: number;
  status: RewardStatus;
  code?: string;
  approvedAt?: string;
  usedAt?: string;
  expiresIn?: number; // days
  instructions?: string[];
}

// Mock rewards data
const mockRewards: Reward[] = [
  {
    id: "1",
    name: "Roblox 400 Robux",
    image: "https://images.unsplash.com/photo-1616499370260-485b3e5ed653?w=300&h=300&fit=crop",
    creditCost: 2000,
    status: "ready",
    code: "RBLX-XXXX-YYYY-ZZZZ",
    approvedAt: "2 hours ago",
    expiresIn: 30,
    instructions: [
      "Open Roblox app or roblox.com",
      "Go to Settings > Gift Cards",
      "Enter the code above",
      "Robux will be added to your account!"
    ]
  },
  {
    id: "2",
    name: "Netflix Gift Card $10",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=300&fit=crop",
    creditCost: 1500,
    status: "pending",
  },
  {
    id: "3",
    name: "Amazon Gift Card $5",
    image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=300&h=300&fit=crop",
    creditCost: 800,
    status: "used",
    code: "AMZN-1234-5678-ABCD",
    usedAt: "3 days ago",
  },
];

const KidMyRewards: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<KidNavTab>("rewards");
  const [rewards] = React.useState<Reward[]>(mockRewards);
  const [expandedInstructions, setExpandedInstructions] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [confirmUsedId, setConfirmUsedId] = React.useState<string | null>(null);

  const readyRewards = rewards.filter(r => r.status === "ready");
  const pendingRewards = rewards.filter(r => r.status === "pending");
  const usedRewards = rewards.filter(r => r.status === "used");

  const handleCopyCode = async (rewardId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(rewardId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: "Couldn't copy",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsUsed = (rewardId: string) => {
    setConfirmUsedId(rewardId);
  };

  const confirmMarkAsUsed = () => {
    // In real app, would call API
    toast({
      title: "Marked as used! ✓",
      description: "This reward has been archived",
    });
    setConfirmUsedId(null);
  };

  const handleTabChange = (tab: KidNavTab) => {
    setActiveTab(tab);
    if (tab === "home") navigate("/kid");
    if (tab === "missions") navigate("/kid");
    if (tab === "shop") navigate("/kid/shop");
    if (tab === "rewards") navigate("/kid/rewards");
  };

  const renderRewardCard = (reward: Reward) => {
    const isExpanded = expandedInstructions === reward.id;
    const isCopied = copiedId === reward.id;

    return (
      <motion.div
        key={reward.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-card rounded-2xl border border-border p-4 shadow-sm",
          reward.status === "used" && "opacity-70"
        )}
      >
        {/* Top Section */}
        <div className="flex gap-3">
          <img
            src={reward.image}
            alt={reward.name}
            className="w-[60px] h-[60px] rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-bold text-base text-foreground line-clamp-2">
                {reward.name}
              </h3>
              {/* Status Badge */}
              <div
                className={cn(
                  "flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold",
                  reward.status === "ready" && "bg-success/10 text-success",
                  reward.status === "pending" && "bg-warning/10 text-warning",
                  reward.status === "used" && "bg-muted text-muted-foreground"
                )}
              >
                {reward.status === "ready" && "✅ Ready"}
                {reward.status === "pending" && "⏳ Pending"}
                {reward.status === "used" && "✓ Used"}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <CoinIcon size={14} />
              <span className="font-body text-xs text-muted-foreground">
                {reward.creditCost.toLocaleString()} credits
              </span>
            </div>
            <p className="font-body text-xs text-muted-foreground mt-1">
              {reward.status === "ready" && `Approved ${reward.approvedAt}`}
              {reward.status === "pending" && "Waiting for parent approval"}
              {reward.status === "used" && `Used ${reward.usedAt}`}
            </p>
          </div>
        </div>

        {/* Code Section (Ready status only) */}
        {reward.status === "ready" && reward.code && (
          <div className="mt-4">
            <div className="bg-background-tint border border-dashed border-primary rounded-xl p-4">
              <p className="font-body text-xs text-muted-foreground mb-2">
                Your Code:
              </p>
              <p className="font-display font-bold text-lg text-primary tracking-wider text-center mb-3">
                {reward.code}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCopyCode(reward.id, reward.code!)}
                className={cn(
                  "w-full h-10 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2",
                  isCopied
                    ? "bg-success text-success-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied! ✓
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code 📋
                  </>
                )}
              </motion.button>
            </div>

            {/* Expiration Warning */}
            {reward.expiresIn && reward.expiresIn <= 7 && (
              <p className="font-body text-xs text-warning mt-2">
                ⚠️ Expires in {reward.expiresIn} days
              </p>
            )}

            {/* Instructions Accordion */}
            {reward.instructions && (
              <div className="mt-3">
                <button
                  onClick={() => setExpandedInstructions(isExpanded ? null : reward.id)}
                  className="flex items-center gap-1 text-sm font-body text-primary"
                >
                  How to Redeem
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 pt-3 border-t border-border space-y-2">
                        {reward.instructions.map((step, i) => (
                          <p key={i} className="font-body text-[13px] text-muted-foreground">
                            {i + 1}. {step}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mark as Used Button */}
            <button
              onClick={() => handleMarkAsUsed(reward.id)}
              className="w-full h-10 mt-3 rounded-xl border border-border bg-card text-muted-foreground font-body text-sm"
            >
              I've used this code
            </button>
          </div>
        )}

        {/* Pending Message */}
        {reward.status === "pending" && (
          <div className="mt-4 bg-warning/10 rounded-xl p-3 text-center">
            <p className="font-body text-sm text-warning">
              ⏳ Waiting for parent approval
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1">
              We'll notify you when approved!
            </p>
          </div>
        )}

        {/* Used - Show code for reference */}
        {reward.status === "used" && reward.code && (
          <div className="mt-3 bg-muted/50 rounded-lg p-3">
            <p className="font-body text-xs text-muted-foreground mb-1">
              Code (for reference):
            </p>
            <p className="font-mono text-sm text-muted-foreground tracking-wider">
              {reward.code}
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  const hasRewards = rewards.length > 0;

  return (
    <div className="min-h-screen bg-card pb-24">
      {/* Top Bar */}
      <header
        className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 12px)",
          height: "calc(60px + max(env(safe-area-inset-top), 12px))",
        }}
      >
        <div className="flex items-center justify-between px-5 h-[60px]">
          <button
            onClick={() => navigate("/kid")}
            className="w-11 h-11 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="font-display font-bold text-2xl text-foreground">
            My Rewards 🎁
          </h1>
          <div className="w-11 h-11" /> {/* Spacer */}
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div
        style={{
          height: "calc(60px + max(env(safe-area-inset-top), 12px))",
        }}
      />

      {/* Content */}
      <div className="px-4 pt-4 pb-8">
        {!hasRewards ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <motion.img
              src={loopoMascot}
              alt="Loopo mascot"
              className="w-[140px] h-[140px] object-contain mb-6"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              No rewards yet!
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Redeem credits in the Marketplace
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/kid/shop")}
              className="h-[52px] px-8 rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold text-base shadow-lg shadow-primary/30"
            >
              Go to Marketplace
            </motion.button>
          </div>
        ) : (
          /* Rewards List */
          <div className="space-y-6">
            {/* Ready Section */}
            {readyRewards.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-success" />
                  Ready to Use ✅
                </h2>
                <div className="space-y-3">
                  {readyRewards.map(renderRewardCard)}
                </div>
              </section>
            )}

            {/* Pending Section */}
            {pendingRewards.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-lg text-foreground mb-3">
                  Pending Approval ⏳
                </h2>
                <div className="space-y-3">
                  {pendingRewards.map(renderRewardCard)}
                </div>
              </section>
            )}

            {/* Used Section */}
            {usedRewards.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-lg text-foreground mb-3">
                  Used ✓
                </h2>
                <div className="space-y-3">
                  {usedRewards.map(renderRewardCard)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Mark as Used */}
      <AnimatePresence>
        {confirmUsedId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmUsedId(null)}
              className="fixed inset-0 bg-foreground/60 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card rounded-2xl p-6 w-[calc(100%-48px)] max-w-sm shadow-xl"
            >
              <h3 className="font-display font-bold text-xl text-foreground text-center mb-2">
                Mark as Used?
              </h3>
              <p className="font-body text-sm text-muted-foreground text-center mb-6">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmUsedId(null)}
                  className="flex-1 h-11 rounded-xl border border-border bg-card text-muted-foreground font-body text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMarkAsUsed}
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm"
                >
                  Yes, I used it
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <KidBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default KidMyRewards;
