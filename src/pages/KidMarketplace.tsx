import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CoinIcon } from "@/components/mobile";
import { MarketplaceRewardCard } from "@/components/kid/MarketplaceRewardCard";
import { RedemptionModal } from "@/components/kid/RedemptionModal";
import { KidBottomNav, KidNavTab } from "@/components/kid";
import { EmptyState } from "@/components/mobile";
import { useToast } from "@/hooks/use-toast";

// Mock rewards data
const mockRewards = [
  {
    id: "1",
    name: "Roblox 400 Robux",
    image:
      "https://images.unsplash.com/photo-1616499370260-485b3e5ed653?w=300&h=300&fit=crop",
    creditCost: 2000,
    category: "Gaming",
    isNew: true,
  },
  {
    id: "2",
    name: "Minecraft Java Edition",
    image:
      "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=300&h=300&fit=crop",
    creditCost: 3500,
    category: "Gaming",
  },
  {
    id: "3",
    name: "Netflix Gift Card $10",
    image:
      "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=300&fit=crop",
    creditCost: 1500,
    category: "Entertainment",
    limitedTime: "2 days left",
  },
  {
    id: "4",
    name: "Amazon Gift Card $5",
    image:
      "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=300&h=300&fit=crop",
    creditCost: 800,
    category: "Shopping",
  },
  {
    id: "5",
    name: "Spotify Premium 1 Month",
    image:
      "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=300&h=300&fit=crop",
    creditCost: 1200,
    category: "Entertainment",
    isNew: true,
  },
  {
    id: "6",
    name: "Fortnite 1000 V-Bucks",
    image:
      "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=300&h=300&fit=crop",
    creditCost: 2500,
    category: "Gaming",
    isSoldOut: true,
  },
  {
    id: "7",
    name: "Steam Gift Card $10",
    image:
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=300&h=300&fit=crop",
    creditCost: 1800,
    category: "Gaming",
  },
  {
    id: "8",
    name: "Target Gift Card $10",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop",
    creditCost: 1500,
    category: "Shopping",
  },
];

const categories = ["All", "Gaming", "Shopping", "Entertainment"];
const sortOptions = [
  { label: "Most Popular", value: "popular" },
  { label: "Credits: Low to High", value: "low" },
  { label: "Credits: High to Low", value: "high" },
];

const KidMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<KidNavTab>("shop");
  const [credits] = React.useState(2450);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [sortBy, setSortBy] = React.useState("popular");
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [pendingRewards, setPendingRewards] = React.useState<string[]>([]);
  const [cartCount] = React.useState(0);

  // Redemption modal state
  const [selectedReward, setSelectedReward] = React.useState<
    (typeof mockRewards)[0] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Filter and sort rewards
  const filteredRewards = React.useMemo(() => {
    let filtered = mockRewards.filter((reward) => {
      const matchesSearch = reward.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || reward.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort
    switch (sortBy) {
      case "low":
        filtered.sort((a, b) => a.creditCost - b.creditCost);
        break;
      case "high":
        filtered.sort((a, b) => b.creditCost - a.creditCost);
        break;
      default:
        // Popular - keep original order
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  // Featured reward (first gaming item that user can afford)
  const featuredReward =
    selectedCategory === "Gaming" || selectedCategory === "All"
      ? mockRewards.find(
          (r) =>
            r.category === "Gaming" &&
            credits >= r.creditCost &&
            !r.isSoldOut &&
            !pendingRewards.includes(r.id)
        )
      : null;

  const handleRedeem = (rewardId: string) => {
    const reward = mockRewards.find((r) => r.id === rewardId);
    if (reward) {
      setSelectedReward(reward);
      setIsModalOpen(true);
    }
  };

  const handleConfirmRedemption = async () => {
    if (!selectedReward) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setPendingRewards((prev) => [...prev, selectedReward.id]);
    setIsSubmitting(false);
    setIsModalOpen(false);

    toast({
      title: "Request sent to parent! 🎉",
      description: "They'll review it soon!",
    });
  };

  const handleTabChange = (tab: KidNavTab) => {
    setActiveTab(tab);
    if (tab === "home") navigate("/kid");
    if (tab === "missions") navigate("/kid");
    if (tab === "wishlist") navigate("/kid");
  };

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
            Marketplace 🛍️
          </h1>
          <button className="relative w-11 h-11 flex items-center justify-center -mr-2">
            <ShoppingCart className="w-6 h-6 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div
        style={{
          height: "calc(60px + max(env(safe-area-inset-top), 12px))",
        }}
      />

      {/* Credit Balance Banner */}
      <div className="px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-primary rounded-2xl p-4 flex items-center justify-between"
        >
          <div>
            <p className="font-body text-sm text-primary-foreground/80">
              Your Credits
            </p>
            <p className="font-display font-bold text-[28px] text-primary-foreground">
              {credits.toLocaleString()}
            </p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <CoinIcon size={40} />
          </motion.div>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <div className="px-4 pt-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
          <input
            type="text"
            placeholder="Search rewards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-border bg-card font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "flex-shrink-0 h-9 px-5 rounded-full font-body text-sm transition-all",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground font-display font-bold"
                  : "bg-card border border-border text-muted-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Section */}
      <AnimatePresence>
        {featuredReward && selectedCategory !== "Entertainment" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-6"
          >
            <h2 className="font-display font-bold text-xl text-foreground mb-3">
              Featured for You 🔥
            </h2>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRedeem(featuredReward.id)}
              className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              }}
            >
              <div className="flex items-center p-4 gap-4">
                <img
                  src={featuredReward.image}
                  alt={featuredReward.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-display font-bold text-xl text-white mb-1">
                    {featuredReward.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mb-3">
                    <CoinIcon size={20} />
                    <span className="font-display font-bold text-lg text-accent-gold">
                      {featuredReward.creditCost.toLocaleString()}
                    </span>
                  </div>
                  <button className="h-8 px-4 rounded-lg bg-secondary text-secondary-foreground font-display font-bold text-sm flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Redeem Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rewards Grid */}
      <div className="px-4 pt-6 pb-8">
        {/* Sort Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-foreground">
            All Rewards
          </h2>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 text-sm font-body text-muted-foreground"
            >
              Sort by
              <span className="text-primary font-bold">
                {sortOptions.find((o) => o.value === sortBy)?.label}
              </span>
              <ChevronDown className="w-4 h-4 text-primary" />
            </button>

            {/* Sort Dropdown */}
            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left font-body text-sm transition-colors",
                        sortBy === option.value
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Grid */}
        {filteredRewards.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredRewards.map((reward) => (
              <MarketplaceRewardCard
                key={reward.id}
                {...reward}
                userCredits={credits}
                isPending={pendingRewards.includes(reward.id)}
                onRedeem={handleRedeem}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Coming Soon!"
            description="More rewards will be added here"
            className="py-12"
          />
        )}
      </div>

      {/* Redemption Modal */}
      <RedemptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRedemption}
        reward={selectedReward}
        userCredits={credits}
        isLoading={isSubmitting}
      />

      {/* Click outside to close sort menu */}
      {showSortMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSortMenu(false)}
        />
      )}

      {/* Bottom Navigation */}
      <KidBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default KidMarketplace;
