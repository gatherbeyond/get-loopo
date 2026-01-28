import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MobileButton,
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  MobileCardContent,
  BottomTabBar,
  CreditDisplay,
  MobileInput,
  AchievementBadge,
  ProgressBar,
  EmptyState,
  type TabItem,
} from "@/components/mobile";
import loopoLogo from "@/assets/loopo-logo.png";
import loopoMascot from "@/assets/loopo-mascot.png";
import { Home, Star, Gift, User, Search, Trophy, Zap, Target, Sparkles } from "lucide-react";

const tabs: TabItem[] = [
  { id: "home", label: "Home", icon: <Home className="w-full h-full" /> },
  { id: "earn", label: "Earn", icon: <Zap className="w-full h-full" /> },
  { id: "rewards", label: "Rewards", icon: <Gift className="w-full h-full" /> },
  { id: "profile", label: "Profile", icon: <User className="w-full h-full" /> },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showEmptyState, setShowEmptyState] = useState(false);

  return (
    <div className="min-h-screen bg-background-tint">
      {/* Mobile Frame Container - Simulating iPhone dimensions */}
      <div className="mx-auto max-w-md min-h-screen relative overflow-hidden">
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-gradient-primary px-5 pt-8 pb-6 safe-area-top">
          <div className="flex items-center justify-between mb-4">
            <motion.img
              src={loopoLogo}
              alt="Loopo"
              className="h-10 w-auto"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            />
            <motion.img
              src={loopoMascot}
              alt="Loopo mascot"
              className="w-12 h-12 object-contain"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          {/* Credit Display in Header */}
          <MobileCard variant="flat" padding="lg" className="bg-card/95 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-sm font-body text-muted-foreground mb-1">Your Balance</p>
              <CreditDisplay 
                amount={247.50} 
                size="hero" 
                animated 
                label="Keep earning! 🔥"
              />
            </div>
          </MobileCard>
        </header>

        {/* Main Content */}
        <main className="px-5 py-6 pb-24 space-y-6">
          
          {/* Weekly Progress */}
          <section>
            <h2 className="text-kid-subheader font-display text-foreground mb-4">
              Weekly Progress
            </h2>
            <MobileCard variant="elevated" padding="lg">
              <ProgressBar 
                value={75} 
                label="Chores completed" 
                showPercentage 
                size="lg" 
                variant="primary"
              />
              <div className="mt-4 flex items-center gap-2 text-sm font-body text-muted-foreground">
                <Sparkles className="w-4 h-4 text-accent-gold" />
                <span>Complete 3 more for a bonus!</span>
              </div>
            </MobileCard>
          </section>

          {/* Button Showcase */}
          <section>
            <h2 className="text-kid-subheader font-display text-foreground mb-4">
              Buttons
            </h2>
            <div className="space-y-3">
              <MobileButton variant="primary" fullWidth>
                Primary Action
              </MobileButton>
              <MobileButton variant="secondary" fullWidth>
                Secondary Action
              </MobileButton>
              <MobileButton variant="outline" fullWidth>
                Outline Style
              </MobileButton>
              <div className="flex gap-3">
                <MobileButton variant="success" className="flex-1">
                  Approve ✓
                </MobileButton>
                <MobileButton variant="gold" className="flex-1">
                  Claim 🎁
                </MobileButton>
              </div>
              <MobileButton variant="disabled" fullWidth disabled>
                Disabled State
              </MobileButton>
            </div>
          </section>

          {/* Input Showcase */}
          <section>
            <h2 className="text-kid-subheader font-display text-foreground mb-4">
              Inputs
            </h2>
            <div className="space-y-4">
              <MobileInput 
                label="Search chores" 
                placeholder="What do you want to do?"
                icon={<Search className="w-5 h-5" />}
              />
              <MobileInput 
                label="Amount" 
                placeholder="$0.00"
                type="number"
              />
              <MobileInput 
                label="With error" 
                placeholder="Type something..."
                error="Oops! Something went wrong"
              />
            </div>
          </section>

          {/* Achievements */}
          <section>
            <h2 className="text-kid-subheader font-display text-foreground mb-4">
              Achievements
            </h2>
            <MobileCard variant="elevated" padding="lg">
              <div className="flex justify-around">
                <AchievementBadge 
                  icon={<Star className="w-full h-full" />}
                  title="First Save"
                  description="Saved $10"
                  unlocked
                  showPulse
                />
                <AchievementBadge 
                  icon={<Trophy className="w-full h-full" />}
                  title="Super Saver"
                  description="Saved $100"
                  unlocked
                />
                <AchievementBadge 
                  icon={<Target className="w-full h-full" />}
                  title="Goal Getter"
                  description="3 goals done"
                  unlocked={false}
                />
              </div>
            </MobileCard>
          </section>

          {/* Card Variants */}
          <section>
            <h2 className="text-kid-subheader font-display text-foreground mb-4">
              Card Styles
            </h2>
            <div className="space-y-3">
              <MobileCard variant="default" interactive>
                <MobileCardHeader>
                  <MobileCardTitle>Default Card</MobileCardTitle>
                </MobileCardHeader>
                <MobileCardContent>
                  <p className="text-muted-foreground">Tap me! I'm interactive.</p>
                </MobileCardContent>
              </MobileCard>
              
              <MobileCard variant="tinted">
                <MobileCardHeader>
                  <MobileCardTitle>Tinted Card</MobileCardTitle>
                </MobileCardHeader>
                <MobileCardContent>
                  <p className="text-muted-foreground">Subtle purple tint background.</p>
                </MobileCardContent>
              </MobileCard>
              
              <MobileCard variant="primary" padding="lg">
                <div className="text-center">
                  <p className="text-primary-foreground/80 font-body text-sm mb-1">Special Offer</p>
                  <p className="text-2xl font-display font-bold text-primary-foreground">
                    2X Rewards Today!
                  </p>
                </div>
              </MobileCard>
              
              <MobileCard variant="gold" padding="lg">
                <div className="text-center">
                  <p className="text-accent-gold-foreground font-display font-bold text-xl">
                    🎉 You earned $5.00!
                  </p>
                </div>
              </MobileCard>
            </div>
          </section>

          {/* Credit Display Sizes */}
          <section>
            <h2 className="text-kid-subheader font-display text-foreground mb-4">
              Credit Display Sizes
            </h2>
            <MobileCard variant="elevated" padding="lg">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body text-muted-foreground">Small:</span>
                  <CreditDisplay amount={25.00} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body text-muted-foreground">Default:</span>
                  <CreditDisplay amount={99.99} size="default" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body text-muted-foreground">Large:</span>
                  <CreditDisplay amount={500.00} size="lg" />
                </div>
              </div>
            </MobileCard>
          </section>

          {/* Progress Bar Variants */}
          <section>
            <h2 className="text-kid-subheader font-display text-foreground mb-4">
              Progress Bars
            </h2>
            <MobileCard variant="elevated" padding="lg">
              <div className="space-y-6">
                <ProgressBar value={30} variant="primary" label="Primary" showPercentage />
                <ProgressBar value={65} variant="success" label="Success" showPercentage />
                <ProgressBar value={90} variant="gold" label="Gold" showPercentage />
              </div>
            </MobileCard>
          </section>

          {/* Toggle Empty State */}
          <section>
            <h2 className="text-kid-subheader font-display text-foreground mb-4">
              Empty State
            </h2>
            <MobileButton 
              variant="outline" 
              fullWidth 
              onClick={() => setShowEmptyState(!showEmptyState)}
            >
              {showEmptyState ? "Hide" : "Show"} Empty State
            </MobileButton>
            
            {showEmptyState && (
              <MobileCard variant="tinted" className="mt-4">
                <EmptyState
                  title="No tasks yet!"
                  description="Complete your first chore to start earning credits."
                  actionLabel="Find Tasks"
                  onAction={() => setShowEmptyState(false)}
                />
              </MobileCard>
            )}
          </section>

          {/* Tagline */}
          <section className="text-center py-8">
            <p className="text-lg font-display font-bold text-primary">
              "Earn It. Flex It. Loopo."
            </p>
          </section>

        </main>

        {/* Bottom Tab Bar */}
        <BottomTabBar 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>
    </div>
  );
};

export default Index;
