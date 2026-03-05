import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Copy, Share2, Plus, RotateCcw, Pencil, Loader2 } from "lucide-react";
import { ParentBottomNav } from "@/components/parent";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MobileButton, MobileInput } from "@/components/mobile";
import AvatarPicker, { avatars } from "@/components/signup/AvatarPicker";
import { supabase } from "@/integrations/supabase/client";

interface Kid {
  id: string;
  name: string;
  age: number;
  avatar: string;
  pin: string; // We won't have real PINs (hashed), so display "••••"
}

interface CreditSettings {
  currency: string;
  credits_per_unit: number;
}

const ParentFamilyInfo = () => {
  const navigate = useNavigate();
  const [familyCode, setFamilyCode] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [kids, setKids] = useState<Kid[]>([]);
  const [creditSettings, setCreditSettings] = useState<CreditSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});
  const [showAddKid, setShowAddKid] = useState(false);
  const [showResetPin, setShowResetPin] = useState<Kid | null>(null);
  const [newPin, setNewPin] = useState("");

  // Add kid form
  const [addName, setAddName] = useState("");
  const [addAge, setAddAge] = useState<number | null>(null);
  const [addAvatar, setAddAvatar] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [showKidCreated, setShowKidCreated] = useState<Kid | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: family } = await supabase
          .from("families")
          .select("*")
          .eq("parent_id", user.id)
          .single();

        if (!family) return;
        setFamilyCode(family.family_code);
        setFamilyName(family.family_name);
        setFamilyId(family.id);

        const [kidsResult, creditsResult] = await Promise.all([
          supabase.from("kids").select("id, name, age, avatar").eq("family_id", family.id),
          supabase.from("credit_settings").select("currency, credits_per_unit").eq("family_id", family.id).maybeSingle(),
        ]);

        if (kidsResult.data) {
          setKids(kidsResult.data.map(k => ({ ...k, pin: "••••" })));
        }
        if (creditsResult.data) {
          setCreditSettings(creditsResult.data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const togglePin = (kidId: string) => {
    setVisiblePins((prev) => ({ ...prev, [kidId]: !prev[kidId] }));
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} copied! ✓` });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    const text = `Join our Loopo family!\nFamily Code: ${familyCode}\nDownload Loopo: https://loopo.app`;
    if (navigator.share) {
      try { await navigator.share({ title: "Loopo Family Code", text }); } catch {}
    } else {
      copyToClipboard(familyCode, "Family code");
    }
  };

  const handleAddKid = async () => {
    if (!addName.trim() || !addAge || !addAvatar || !familyId) return;
    // Use the add-kid edge function
    try {
      const pin = String(Math.floor(1000 + Math.random() * 9000));
      const { data, error } = await supabase.functions.invoke("add-kid", {
        body: { familyId, name: addName.trim(), age: addAge, avatar: addAvatar, pin },
      });
      if (error) throw error;
      const newKid: Kid = {
        id: data?.kidId || `kid_${Date.now()}`,
        name: addName.trim(),
        age: addAge,
        avatar: addAvatar,
        pin,
      };
      setKids((prev) => [...prev, newKid]);
      setShowAddKid(false);
      setShowKidCreated(newKid);
      setAddName("");
      setAddAge(null);
      setAddAvatar(null);
    } catch (err: any) {
      toast({ title: "Failed to add kid", description: err.message, variant: "destructive" });
    }
  };

  const handleResetPin = (kid: Kid) => {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    setNewPin(pin);
    setShowResetPin(kid);
  };

  const confirmResetPin = async () => {
    if (!showResetPin) return;
    // Note: PIN reset would need an edge function to hash the new PIN
    // For now we update local state; a proper implementation needs a reset-pin edge function
    setKids((prev) =>
      prev.map((k) => (k.id === showResetPin.id ? { ...k, pin: newPin } : k))
    );
    toast({ title: `${showResetPin.name}'s PIN has been reset! ✓` });
    setShowResetPin(null);
  };

  const getAvatarEmoji = (id: string) => avatars.find((a) => a.id === id)?.emoji || "👤";
  const ageOptions = [8, 9, 10, 11, 12, 13, 14];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-tint flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-tint">
      {/* Header */}
      <div className="bg-card border-b border-border safe-area-top">
        <div className="flex items-center justify-between px-5 h-[60px]">
          <button onClick={() => navigate("/parent/settings")} className="w-11 h-11 flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-xl font-display font-bold text-foreground">Family Info</h1>
          <div className="w-11" />
        </div>
      </div>

      <div className="overflow-y-auto pb-24 px-5">
        {/* Family Code Card */}
        <SectionHeader emoji="📱" label="FAMILY CODE" />
        <div className="bg-card rounded-[20px] p-6 shadow-soft">
          <p className="text-xl font-display font-bold text-primary text-center">{familyName}</p>
          <p className="text-sm font-body text-muted-foreground text-center mt-2">Your Family Code:</p>
          <div className="flex justify-center gap-2 mt-3">
            {FAMILY_CODE.split("").map((char, i) => (
              <div
                key={i}
                className="w-12 h-14 bg-muted border-2 border-primary rounded-xl flex items-center justify-center"
              >
                <span className="text-2xl font-display font-bold text-primary">{char}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => copyToClipboard(FAMILY_CODE, "Family code")}
              className="flex-1 h-11 rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center gap-1.5"
            >
              <Copy className="w-4 h-4" /> Copy Code
            </button>
            <button
              onClick={handleShare}
              className="flex-1 h-11 rounded-xl border-2 border-primary text-primary font-display font-bold text-sm flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
          <div className="mt-4 bg-muted rounded-lg p-3">
            <p className="text-xs font-body text-muted-foreground text-center">
              💡 All kids use this code to log in
            </p>
          </div>
        </div>

        {/* Kids Section */}
        <SectionHeader emoji="👥" label="KIDS" />
        <div className="space-y-3">
          {kids.map((kid) => (
            <KidCard
              key={kid.id}
              kid={kid}
              pinVisible={!!visiblePins[kid.id]}
              onTogglePin={() => togglePin(kid.id)}
              onCopyPin={() => copyToClipboard(kid.pin, `${kid.name}'s PIN`)}
              onResetPin={() => handleResetPin(kid)}
              getEmoji={getAvatarEmoji}
            />
          ))}

          {/* Add Kid Button */}
          <button
            onClick={() => setShowAddKid(true)}
            className="w-full h-[60px] bg-card border-2 border-dashed border-primary rounded-2xl flex items-center justify-center gap-2 active:bg-muted transition-colors"
          >
            <Plus className="w-5 h-5 text-primary" />
            <span className="text-base font-display font-bold text-primary">Add Another Kid</span>
          </button>
        </div>

        {/* Credit Conversion */}
        <SectionHeader emoji="💰" label="CREDIT CONVERSION" />
        <div className="bg-card rounded-[20px] p-5 shadow-soft">
          <p className="text-lg font-display font-bold text-foreground text-center">1 PHP = 50 credits</p>
          <p className="text-xs font-body text-muted-foreground text-center mt-1">Set during family setup</p>
        </div>
      </div>

      <ParentBottomNav activeTab="settings" />

      {/* Add Kid Modal */}
      <Dialog open={showAddKid} onOpenChange={(o) => !o && setShowAddKid(false)}>
        <DialogContent className="rounded-2xl max-w-[90vw] sm:max-w-md p-0 gap-0 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-display font-bold text-foreground text-center">Add a Kid</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setShowAvatarPicker(true)}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
                  addAvatar
                    ? `${avatars.find(a => a.id === addAvatar)?.bg || "bg-muted"} ring-[3px] ring-primary`
                    : "bg-muted border-2 border-dashed border-border"
                }`}
              >
                {addAvatar ? getAvatarEmoji(addAvatar) : "👤"}
              </button>
              <p className="text-xs font-body text-muted-foreground">Tap to choose avatar</p>
            </div>

            <MobileInput
              label="Kid's Name"
              placeholder="Enter kid's name"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
            />

            {/* Age */}
            <div>
              <label className="block text-sm font-body text-muted-foreground mb-2">Age</label>
              <button
                onClick={() => setShowAgePicker(!showAgePicker)}
                className="w-full h-[52px] px-4 border-2 border-border rounded-2xl flex items-center justify-between bg-card"
              >
                <span className={`text-base font-body ${addAge ? "text-primary font-bold" : "text-muted-foreground"}`}>
                  {addAge ? `${addAge} years old` : "Select age (8-14)"}
                </span>
              </button>
              {showAgePicker && (
                <div className="mt-2 bg-card rounded-2xl shadow-elevated overflow-hidden border border-border">
                  {ageOptions.map((age) => (
                    <button
                      key={age}
                      onClick={() => { setAddAge(age); setShowAgePicker(false); }}
                      className={`w-full px-4 py-3 text-left font-body ${addAge === age ? "bg-primary/10 text-primary font-bold" : "text-foreground"}`}
                    >
                      {age} years old
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAddKid(false)} className="flex-1 h-12 rounded-xl border border-border text-base font-body font-semibold text-muted-foreground">
                Cancel
              </button>
              <MobileButton
                variant={addName.trim() && addAge && addAvatar ? "primary" : "disabled"}
                className="flex-1"
                onClick={handleAddKid}
                disabled={!addName.trim() || !addAge || !addAvatar}
              >
                Add Kid
              </MobileButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Picker for Add Kid */}
      <AvatarPicker
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        onSelect={(avatar) => setAddAvatar(avatar)}
        selectedAvatar={addAvatar}
      />

      {/* Kid Created Modal */}
      <Dialog open={!!showKidCreated} onOpenChange={(o) => !o && setShowKidCreated(null)}>
        <DialogContent className="rounded-2xl max-w-[85vw] sm:max-w-sm p-6 gap-0">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-success flex items-center justify-center mx-auto">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">
              {showKidCreated?.name} Added!
            </h2>
            <div className="bg-muted rounded-xl p-4 text-left space-y-2">
              <p className="text-sm font-body text-muted-foreground">Family Code: <span className="font-bold text-primary">{FAMILY_CODE}</span></p>
              <p className="text-sm font-body text-muted-foreground">{showKidCreated?.name}'s PIN: <span className="font-bold text-primary">{showKidCreated?.pin}</span></p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (showKidCreated) {
                    copyToClipboard(
                      `Family Code: ${FAMILY_CODE}\n${showKidCreated.name}'s PIN: ${showKidCreated.pin}`,
                      "Login info"
                    );
                  }
                }}
                className="flex-1 h-11 rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold text-sm"
              >
                📋 Copy Info
              </button>
              <button
                onClick={() => setShowKidCreated(null)}
                className="flex-1 h-11 rounded-xl border border-border font-display font-bold text-sm text-foreground"
              >
                Done
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset PIN Modal */}
      <Dialog open={!!showResetPin} onOpenChange={(o) => !o && setShowResetPin(null)}>
        <DialogContent className="rounded-2xl max-w-[85vw] sm:max-w-sm p-6 gap-0">
          <DialogHeader className="space-y-2 mb-4">
            <DialogTitle className="text-xl font-display font-bold text-foreground text-center">
              Reset {showResetPin?.name}'s PIN?
            </DialogTitle>
            <DialogDescription className="text-sm font-body text-muted-foreground text-center">
              This will generate a new 4-digit PIN. {showResetPin?.name} will need the new PIN to log in.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-xl p-4 mb-4">
            <p className="text-sm font-body text-muted-foreground text-center">
              New PIN: <span className="text-xl font-display font-bold text-primary">{newPin}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(newPin, "New PIN")}
              className="h-11 px-4 rounded-xl border border-border text-sm font-display font-bold text-foreground"
            >
              📋 Copy
            </button>
            <button onClick={() => setShowResetPin(null)} className="flex-1 h-11 rounded-xl border border-border text-sm font-body font-semibold text-muted-foreground">
              Cancel
            </button>
            <button onClick={confirmResetPin} className="flex-1 h-11 rounded-xl bg-error text-error-foreground text-sm font-display font-bold">
              Reset
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SectionHeader = ({ emoji, label }: { emoji: string; label: string }) => (
  <p className="text-sm font-display font-bold text-muted-foreground uppercase tracking-wide mt-6 mb-3">
    {emoji} {label}
  </p>
);

interface KidCardProps {
  kid: Kid;
  pinVisible: boolean;
  onTogglePin: () => void;
  onCopyPin: () => void;
  onResetPin: () => void;
  getEmoji: (id: string) => string;
}

const KidCard: React.FC<KidCardProps> = ({ kid, pinVisible, onTogglePin, onCopyPin, onResetPin, getEmoji }) => (
  <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
    <div className="flex items-center gap-3">
      <span className="text-3xl">{getEmoji(kid.avatar)}</span>
      <div>
        <p className="text-lg font-display font-bold text-foreground">{kid.name}</p>
        <p className="text-sm font-body text-muted-foreground">Age {kid.age}</p>
      </div>
    </div>

    {/* PIN Section */}
    <div className="mt-3 bg-muted rounded-xl p-3 flex items-center justify-between">
      <div>
        <p className="text-xs font-body text-muted-foreground">PIN:</p>
        <p className="text-xl font-display font-bold text-primary tracking-wider">
          {pinVisible ? kid.pin : "••••"}
        </p>
      </div>
      <div className="flex gap-1">
        <button onClick={onTogglePin} className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center">
          {pinVisible ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
        </button>
        <button onClick={onCopyPin} className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center">
          <Copy className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-2 mt-3">
      <button className="flex-1 h-9 rounded-lg border border-primary text-primary text-sm font-body font-semibold flex items-center justify-center gap-1">
        <Pencil className="w-3.5 h-3.5" /> Edit Kid
      </button>
      <button
        onClick={onResetPin}
        className="flex-1 h-9 rounded-lg border border-error text-error text-sm font-body font-semibold flex items-center justify-center gap-1"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Reset PIN
      </button>
    </div>
  </div>
);

export default ParentFamilyInfo;
