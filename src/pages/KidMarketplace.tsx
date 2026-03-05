import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  ChevronDown,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CoinIcon } from "@/components/mobile";
import { MarketplaceRewardCard } from "@/components/kid/MarketplaceRewardCard";
import { RedemptionModal } from "@/components/kid/RedemptionModal";
import { KidBottomNav, KidNavTab } from "@/components/kid";
import { EmptyState } from "@/components/mobile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  cost_credits: number;
  category: string;
  description: string | null;
  featured: boolean | null;
  available: boolean | null;
}

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Credits: Low to High", value: "low" },
  { label: "Credits: High to Low", value: "high" },
];

const KidMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<KidNavTab>("shop");
  const [credits, setCredits] = React.useState(0);
  const [familyId, setFamilyId] = React.useState<string | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [pendingRewardIds, setPendingRewardIds] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [sortBy, setSortBy] = React.useState("featured");
  const [showSortMenu, setShowSortMenu] = React.useState(false);

  // Redemption modal state
  const [selectedReward, setSelectedReward] = React.useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const kidId = user?.kidId;

  // Fetch kid info, products, and pending redemptions
  React.useEffect(() => {
    if (!kidId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch kid record for credits and family_id
        const { data: kid } = await supabase
          .from("kids")
          .select("credits_balance, family_id")
          .eq("id", kidId)
          .maybeSingle();

        if (kid) {
          setCredits(kid.credits_balance ?? 0);
          setFamilyId(kid.family_id);
        }

        // Fetch available products
        const { data: prods } = await supabase
          .from("products")
          .select("*")
          .eq("available", true)
          .order("featured", { ascending: false });

        if (prods) setProducts(prods);

        // Fetch pending redemptions for this kid
        if (kid?.family_id) {
          const { data: redemptions } = await supabase
            .from("redemptions")
            .select("product_id")
            .eq("kid_id", kidId)
            .eq("status", "pending");

          if (redemptions) {
            setPendingRewardIds(redemptions.map((r) => r.product_id));
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [kidId]);

  // Derive categories from products
  const categories = React.useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return ["All", ...cats];
  }, [products]);

  // Filter and sort
  const filteredRewards = React.useMemo(() => {
    let filtered = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case "low":
        filtered = [...filtered].sort((a, b) => a.cost_credits - b.cost_credits);
        break;
      case "high":
        filtered = [...filtered].sort((a, b) => b.cost_credits - a.cost_credits);
        break;
      default:
        // featured first (already ordered from query)
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  // Featured product
  const featuredReward = React.useMemo(
    () =>
      products.find(
        (p) =>
          p.featured &&
          credits >= p.cost_credits &&
          !pendingRewardIds.includes(p.id)
      ) ?? null,
    [products, credits, pendingRewardIds]
  );

  const handleRedeem = (rewardId: string) => {
    const reward = products.find((r) => r.id === rewardId);
    if (reward) {
      setSelectedReward(reward);
      setIsModalOpen(true);
    }
  };

  const handleConfirmRedemption = async () => {
    if (!selectedReward || !kidId || !familyId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("redemptions").insert({
        kid_id: kidId,
        family_id: familyId,
        product_id: selectedReward.id,
        product_name: selectedReward.name,
        product_image: selectedReward.image_url,
        cost_credits: selectedReward.cost_credits,
        status: "pending",
      });

      if (error) throw error;

      setPendingRewardIds((prev) => [...prev, selectedReward.id]);
      setIsModalOpen(false);

      toast({
        title: "Request sent to parent! 🎉",
        description: "They'll review it soon!",
      });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (tab: KidNavTab) => {
    setActiveTab(tab);
    if (tab === "home") navigate("/kid");
    if (tab === "missions") navigate("/kid");
    if (tab === "rewards") navigate("/kid/rewards");
  };

  const placeholderImage = "/placeholder.svg";

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
          <div className="w-11 h-11" />
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: "calc(60px + max(env(safe-area-inset-top), 12px))" }} />

      {/* Credit Balance Banner */}
      <div className="px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-primary rounded-2xl p-4 flex items-center justify-between"
        >
          <div>
            <p className="font-body text-sm text-primary-foreground/80">Your Credits</p>
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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Featured Section */}
          <AnimatePresence>
            {featuredReward && (
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
                      src={featuredReward.image_url || placeholderImage}
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
                          {featuredReward.cost_credits.toLocaleString()}
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

            {filteredRewards.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredRewards.map((product) => (
                  <MarketplaceRewardCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.image_url || placeholderImage}
                    creditCost={product.cost_credits}
                    category={product.category}
                    userCredits={credits}
                    isPending={pendingRewardIds.includes(product.id)}
                    isSoldOut={false}
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
        </>
      )}

      {/* Redemption Modal */}
      <RedemptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRedemption}
        reward={
          selectedReward
            ? {
                id: selectedReward.id,
                name: selectedReward.name,
                image: selectedReward.image_url || placeholderImage,
                creditCost: selectedReward.cost_credits,
              }
            : null
        }
        userCredits={credits}
        isLoading={isSubmitting}
      />

      {showSortMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
      )}

      <KidBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default KidMarketplace;
