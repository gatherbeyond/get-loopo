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
import { Home, Star, Gift, User, Search, Trophy, Zap, Target, Sparkles, Coins } from "lucide-react";

const tabs: TabItem[] = [
  { id: "home", label: "Home", icon: <Home className="w-full h-full" /> },
  { id: "earn", label: "Earn", icon: <Zap className="w-full h-full" /> },
  { id: "rewards", label: "Rewards", icon: <Gift className="w-full h-full" /> },
  { id: "profile", label: "Profile", icon: <User className="w-full h-full" /> },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-background-tint">
      {/* Mobile Frame Container - Simulating iPhone dimensions */}
      <div className="mx-auto max-w-md min-h-screen relative overflow-hidden">
        
        {/* Header - Clean & Minimal with Centered Logo */}
        <header className="sticky top-0 z-40 bg-gradient-primary px-5 pt-8 pb-6 safe-area-top">
          {/* Centered Logo */}
          <div className="flex items-center justify-center mb-4">
            <motion.img
              src={loopoLogo}
              alt="Loopo"
              className="h-12 w-[110px] object-contain"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Credits Display Card */}
          <MobileCard variant="flat" padding="lg" className="bg-card/95 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-sm font-body text-muted-foreground mb-1">Your Credits</p>
              <CreditDisplay 
                amount={2475} 
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
                  description="Saved 100 credits"
                  unlocked
                  showPulse
                />
                <AchievementBadge 
                  icon={<Trophy className="w-full h-full" />}
                  title="Super Saver"
                  description="Saved 1,000 credits"
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
                <div className="flex items-center justify-center gap-2">
                  <Coins className="w-6 h-6 text-accent-gold-foreground" />
                  <p className="text-accent-gold-foreground font-display font-bold text-xl">
                    🎉 You earned 50 credits!
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
                  <CreditDisplay amount={250} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body text-muted-foreground">Default:</span>
                  <CreditDisplay amount={999} size="default" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body text-muted-foreground">Large:</span>
                  <CreditDisplay amount={5000} size="lg" />
                </div>
              </div>
            </MobileCard>
          </section>

          {/* Mascot Usage Examples */}
          <section>
            <h2 className="text-kid-subheader font-display text-foreground mb-4">
              Mascot Usage Guidelines
            </h2>
            <div className="space-y-4">
              {/* Welcome Screen Example */}
              <MobileCard variant="tinted" padding="lg">
                <div className="text-center">
                  <p className="text-xs font-body text-muted-foreground mb-2 uppercase tracking-wide">Welcome Screen (200px)</p>
                  <motion.img
                    src={loopoMascot}
                    alt="Loopo mascot - Welcome"
                    className="w-[200px] h-[200px] object-contain mx-auto mb-4"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <p className="text-kid-header font-display text-foreground">Welcome to Loopo!</p>
                  <p className="text-muted-foreground font-body">Start earning credits today</p>
                </div>
              </MobileCard>

              {/* Celebration Example */}
              <MobileCard variant="gold" padding="lg">
                <div className="text-center">
                  <p className="text-xs font-body text-accent-gold-foreground/70 mb-2 uppercase tracking-wide">Celebration Screen (200px)</p>
                  <motion.img
                    src={loopoMascot}
                    alt="Loopo mascot - Celebration"
                    className="w-[200px] h-[200px] object-contain mx-auto mb-4"
                    animate={{ 
                      scale: [1, 1.1, 1], 
                      rotate: [0, 5, -5, 0] 
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <p className="text-2xl font-display font-bold text-accent-gold-foreground">🎉 500 credits earned!</p>
                </div>
              </MobileCard>

              {/* Empty State Example */}
              <MobileCard variant="elevated" padding="lg">
                <p className="text-xs font-body text-muted-foreground mb-2 uppercase tracking-wide text-center">Empty State (120-160px)</p>
                <EmptyState
                  title="No tasks yet!"
                  description="Complete your first chore to start earning credits."
                  actionLabel="Find Tasks"
                  onAction={() => {}}
                />
              </MobileCard>

              {/* Tutorial Tooltip Example */}
              <MobileCard variant="tinted" padding="lg">
                <p className="text-xs font-body text-muted-foreground mb-3 uppercase tracking-wide text-center">Tutorial Tooltip (40-60px)</p>
                <div className="flex items-start gap-3 bg-card rounded-xl p-4 shadow-soft">
                  <motion.img
                    src={loopoMascot}
                    alt="Loopo mascot - Tutorial"
                    className="w-[50px] h-[50px] object-contain flex-shrink-0"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div>
                    <p className="font-display font-bold text-foreground text-sm">Tip!</p>
                    <p className="text-muted-foreground font-body text-sm">Complete chores to earn credits. Tap any task to get started!</p>
                  </div>
                </div>
              </MobileCard>
            </div>
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
