import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check, Calendar, Clock, Coins } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface Kid {
  id: string;
  name: string;
  avatar: string;
  age: number;
}

const mockKids: Kid[] = [
  { id: "1", name: "Miguel", avatar: "🧒", age: 8 },
  { id: "2", name: "Sofia", avatar: "👧", age: 6 },
];

const creditSuggestions = [100, 300, 500, 1000];

const ParentAddTask: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState("");
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [allKids, setAllKids] = useState(false);
  
  // Toggle states
  const [photoRequired, setPhotoRequired] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<string>("daily");
  
  // UI state
  const [showKidSheet, setShowKidSheet] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = title.trim().length > 0 && 
                  (selectedKid !== null || allKids) && 
                  parseInt(credits) > 0;

  const handleClose = () => {
    if (title || description || credits || selectedKid) {
      // Could show confirmation dialog here
      navigate("/parent");
    } else {
      navigate("/parent");
    }
  };

  const handleCreditChipSelect = (amount: number) => {
    setCredits(amount.toString());
  };

  const handleKidSelect = (kid: Kid | null) => {
    if (kid === null) {
      setAllKids(true);
      setSelectedKid(null);
    } else {
      setAllKids(false);
      setSelectedKid(kid);
    }
    setShowKidSheet(false);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = "Mission title is required";
    }
    if (!credits || parseInt(credits) <= 0) {
      newErrors.credits = "Credit amount must be greater than 0";
    }
    if (!selectedKid && !allKids) {
      newErrors.kid = "Please select a kid";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast({
      title: "Mission created! 🎉",
      description: `${allKids ? "All kids" : selectedKid?.name} will receive this mission.`,
      className: "bg-success text-success-foreground border-none",
    });
    
    navigate("/parent");
  };

  return (
    <div className="min-h-screen bg-card flex flex-col">
      {/* Top Bar */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="h-[60px] flex items-center justify-between px-5 pt-safe">
          <button
            onClick={handleClose}
            className="w-11 h-11 flex items-center justify-center -ml-2"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="font-display font-bold text-xl text-foreground">
            Create Mission
          </h1>
          <div className="w-11" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-5 py-6 space-y-6">
          {/* Section 1: Task Details */}
          <div className="space-y-5">
            {/* Mission Title */}
            <div className="space-y-2">
              <label className="font-display font-bold text-base text-foreground">
                Mission Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) {
                      setTitle(e.target.value);
                      setErrors({ ...errors, title: "" });
                    }
                  }}
                  placeholder="e.g., Clean your room"
                  className={`w-full h-[52px] px-4 rounded-xl border font-body text-sm
                    placeholder:text-muted-foreground bg-card
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                    transition-all duration-200
                    ${errors.title ? "border-error" : "border-border"}`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-body text-xs text-muted-foreground">
                  {title.length}/50
                </span>
              </div>
              {errors.title && (
                <p className="font-body text-xs text-error">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="font-display font-bold text-base text-foreground">
                Description (Optional)
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      setDescription(e.target.value);
                    }
                  }}
                  placeholder="What needs to be done? e.g., Make bed, organize toys, dust shelves"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border font-body text-sm
                    placeholder:text-muted-foreground bg-card resize-none
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                    transition-all duration-200"
                />
                <span className="absolute right-4 bottom-3 font-body text-xs text-muted-foreground">
                  {description.length}/200
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Rewards */}
          <div className="space-y-4">
            <label className="font-display font-bold text-base text-foreground">
              Credit Reward
            </label>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Coins className="w-6 h-6 text-accent-gold" />
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  value={credits}
                  onChange={(e) => {
                    setCredits(e.target.value);
                    setErrors({ ...errors, credits: "" });
                  }}
                  placeholder="500"
                  className={`w-[140px] h-[52px] pl-12 pr-4 rounded-xl border font-body text-sm
                    placeholder:text-muted-foreground bg-card
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                    transition-all duration-200
                    ${errors.credits ? "border-error" : "border-border"}`}
                />
              </div>
              <span className="font-body text-sm text-muted-foreground">credits</span>
            </div>
            
            {errors.credits && (
              <p className="font-body text-xs text-error">{errors.credits}</p>
            )}
            
            <p className="font-body text-xs text-muted-foreground">
              Suggested: 100-1000 credits
            </p>

            {/* Quick Select Chips */}
            <div className="flex gap-2 flex-wrap">
              {creditSuggestions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleCreditChipSelect(amount)}
                  className={`px-4 py-2 rounded-full font-body text-sm transition-all duration-200
                    ${credits === amount.toString()
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-card border border-border text-muted-foreground hover:border-primary"
                    }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Assignment */}
          <div className="space-y-2">
            <label className="font-display font-bold text-base text-foreground">
              Assign To
            </label>
            
            <button
              onClick={() => setShowKidSheet(true)}
              className={`w-full h-[52px] px-4 rounded-xl border font-body text-sm
                flex items-center justify-between bg-card
                transition-all duration-200
                ${errors.kid ? "border-error" : "border-border"}`}
            >
              {selectedKid ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedKid.avatar}</span>
                  <span className="text-foreground">{selectedKid.name}</span>
                </div>
              ) : allKids ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👨‍👩‍👧‍👦</span>
                  <span className="text-foreground">All kids</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Select a kid</span>
              )}
              <ChevronDown className="w-5 h-5 text-primary" />
            </button>
            
            {errors.kid && (
              <p className="font-body text-xs text-error">{errors.kid}</p>
            )}
          </div>

          {/* Section 4: Requirements */}
          <div className="space-y-4">
            {/* Photo Proof Toggle */}
            <div
              className="flex items-center justify-between py-3 cursor-pointer"
              onClick={() => setPhotoRequired(!photoRequired)}
            >
              <div className="space-y-1">
                <p className="font-body text-base text-foreground">
                  Require photo proof
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Kid must upload photo to submit
                </p>
              </div>
              <Switch
                checked={photoRequired}
                onCheckedChange={setPhotoRequired}
              />
            </div>

            {/* Deadline Toggle */}
            <div className="space-y-3">
              <div
                className="flex items-center justify-between py-3 cursor-pointer"
                onClick={() => setHasDeadline(!hasDeadline)}
              >
                <div className="space-y-1">
                  <p className="font-body text-base text-foreground">
                    Set a deadline
                  </p>
                </div>
                <Switch
                  checked={hasDeadline}
                  onCheckedChange={setHasDeadline}
                />
              </div>
              
              <AnimatePresence>
                {hasDeadline && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 overflow-hidden"
                  >
                    <button className="flex-1 h-[52px] px-4 rounded-xl border border-border
                      flex items-center gap-2 font-body text-sm text-muted-foreground bg-card">
                      <Calendar className="w-5 h-5" />
                      Select date
                    </button>
                    <button className="flex-1 h-[52px] px-4 rounded-xl border border-border
                      flex items-center gap-2 font-body text-sm text-muted-foreground bg-card">
                      <Clock className="w-5 h-5" />
                      Select time
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recurring Toggle */}
            <div className="space-y-3">
              <div
                className="flex items-center justify-between py-3 cursor-pointer"
                onClick={() => setIsRecurring(!isRecurring)}
              >
                <div className="space-y-1">
                  <p className="font-body text-base text-foreground">
                    Make this recurring
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    Task will auto-create on schedule
                  </p>
                </div>
                <Switch
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>
              
              <AnimatePresence>
                {isRecurring && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {["daily", "weekly", "bi-weekly", "monthly"].map((freq) => (
                      <label
                        key={freq}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                            transition-colors duration-200
                            ${recurringFrequency === freq
                              ? "border-primary bg-primary"
                              : "border-border"
                            }`}
                        >
                          {recurringFrequency === freq && (
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                        <span className="font-body text-sm text-foreground capitalize">
                          {freq.replace("-", "-")}
                        </span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="max-w-md mx-auto px-5 py-4 pb-safe flex gap-2">
          <button
            onClick={handleClose}
            className="w-[30%] h-[52px] rounded-xl border border-border
              font-body text-base text-muted-foreground bg-card
              transition-all duration-200 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={`flex-1 h-[52px] rounded-xl font-display font-bold text-base
              transition-all duration-200 active:scale-95
              ${isValid && !isSubmitting
                ? "bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-muted text-muted-foreground"
              }`}
          >
            {isSubmitting ? "Creating..." : "Create Mission"}
          </button>
        </div>
      </div>

      {/* Kid Selection Bottom Sheet */}
      <AnimatePresence>
        {showKidSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowKidSheet(false)}
            />
            
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50"
            >
              <div className="max-w-md mx-auto p-6 pb-safe">
                <h3 className="font-display font-bold text-xl text-foreground mb-4">
                  Assign to which kid?
                </h3>
                
                {/* All Kids Option */}
                <button
                  onClick={() => handleKidSelect(null)}
                  className="w-full h-[60px] flex items-center justify-between px-4 rounded-xl
                    hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">👨‍👩‍👧‍👦</span>
                    <div className="text-left">
                      <p className="font-body text-base text-foreground">All kids</p>
                      <p className="font-body text-xs text-muted-foreground">
                        Assign to everyone
                      </p>
                    </div>
                  </div>
                  {allKids && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
                
                {/* Individual Kids */}
                {mockKids.map((kid) => (
                  <button
                    key={kid.id}
                    onClick={() => handleKidSelect(kid)}
                    className="w-full h-[60px] flex items-center justify-between px-4 rounded-xl
                      hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{kid.avatar}</span>
                      <div className="text-left">
                        <p className="font-body text-base text-foreground">{kid.name}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {kid.age} years old
                        </p>
                      </div>
                    </div>
                    {selectedKid?.id === kid.id && !allKids && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentAddTask;
