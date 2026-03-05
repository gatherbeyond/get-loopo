import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { ParentBottomNav } from "@/components/parent";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const currencies = [
  { code: "PHP", name: "Philippines", flag: "🇵🇭", symbol: "₱" },
  { code: "IDR", name: "Indonesia", flag: "🇮🇩", symbol: "Rp" },
  { code: "SGD", name: "Singapore", flag: "🇸🇬", symbol: "S$" },
  { code: "MYR", name: "Malaysia", flag: "🇲🇾", symbol: "RM" },
  { code: "THB", name: "Thailand", flag: "🇹🇭", symbol: "฿" },
  { code: "VND", name: "Vietnam", flag: "🇻🇳", symbol: "₫" },
  { code: "USD", name: "United States", flag: "🇺🇸", symbol: "$" },
];

const quickSetOptions = [25, 50, 100, 200];

const ParentCreditSettings = () => {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState("PHP");
  const [creditsPerUnit, setCreditsPerUnit] = useState(50);
  const [chips, setChips] = useState([100, 300, 500]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: family } = await supabase
          .from("families")
          .select("id")
          .eq("parent_id", user.id)
          .single();
        if (!family) return;
        setFamilyId(family.id);

        const { data: settings } = await supabase
          .from("credit_settings")
          .select("*")
          .eq("family_id", family.id)
          .maybeSingle();

        if (settings) {
          setCurrency(settings.currency);
          setCreditsPerUnit(settings.credits_per_unit);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const cur = currencies.find((c) => c.code === currency) || currencies[0];

  const handleChipChange = (index: number, value: string) => {
    const num = parseInt(value) || 0;
    setChips((prev) => prev.map((v, i) => (i === index ? num : v)));
  };

  const handleSave = async () => {
    if (!familyId) return;
    try {
      // Upsert credit settings
      const { error } = await supabase
        .from("credit_settings")
        .upsert(
          { family_id: familyId, currency, credits_per_unit: creditsPerUnit },
          { onConflict: "family_id" }
        );
      if (error) throw error;
      setShowConfirm(false);
      toast({ title: "Credit settings saved! ✓" });
      navigate("/parent/settings", { replace: true });
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background-tint">
      {/* Header */}
      <div className="bg-card border-b border-border safe-area-top">
        <div className="flex items-center justify-between px-5 h-[60px]">
          <button onClick={() => navigate("/parent/settings")} className="w-11 h-11 flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-xl font-display font-bold text-foreground">Credit Settings</h1>
          <div className="w-11" />
        </div>
      </div>

      <div className="overflow-y-auto pb-24 px-5">
        {/* Info Card */}
        <div className="mt-5 bg-primary/5 rounded-2xl p-5">
          <p className="font-display font-bold text-base text-primary mb-2">💡 Credits help kids understand money!</p>
          <p className="font-body text-sm text-muted-foreground">
            Example:{"\n"}1 {cur.code} = {creditsPerUnit} credits{"\n"}Clean room = {creditsPerUnit * 10} credits = 10 {cur.code}
          </p>
        </div>

        <div className="h-px bg-border my-4" />

        {/* Section 1: Currency */}
        <div className="bg-card rounded-2xl p-5 shadow-soft">
          <p className="font-display font-bold text-base text-foreground mb-4">💱 Currency</p>
          <p className="font-body text-sm text-muted-foreground mb-2">Select your currency</p>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="h-[52px] rounded-xl border-border font-body text-base bg-card">
              <SelectValue>
                {cur.flag} {cur.code} - {cur.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card z-[100]">
              {currencies.map((c) => (
                <SelectItem key={c.code} value={c.code} className="font-body text-base py-3">
                  {c.flag} {c.code} - {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-px bg-border my-4" />

        {/* Section 2: Conversion Rate */}
        <div className="bg-card rounded-2xl p-5 shadow-soft">
          <p className="font-display font-bold text-base text-foreground mb-4">🔢 Conversion Rate</p>
          <p className="font-body text-sm text-muted-foreground mb-4">How many credits = 1 {cur.code}?</p>

          <div className="flex items-center gap-3 mb-4">
            <span className="font-display font-bold text-lg text-foreground whitespace-nowrap">1 {cur.code}</span>
            <span className="font-body text-muted-foreground">=</span>
            <input
              type="number"
              inputMode="numeric"
              value={creditsPerUnit || ""}
              onChange={(e) => setCreditsPerUnit(parseInt(e.target.value) || 0)}
              className="w-[100px] h-[52px] border-2 border-primary rounded-xl text-center font-display font-bold text-2xl text-primary bg-card focus:outline-none focus:ring-4 focus:ring-primary/20"
            />
            <span className="font-body text-sm text-muted-foreground">💰 credits</span>
          </div>

          <p className="font-body text-xs text-muted-foreground mb-2">Quick Set:</p>
          <div className="flex gap-2 flex-wrap">
            {quickSetOptions.map((val) => (
              <button
                key={val}
                onClick={() => setCreditsPerUnit(val)}
                className={`h-9 px-4 rounded-full border font-body text-sm transition-colors ${
                  creditsPerUnit === val
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <div className="mt-3 bg-primary/5 rounded-lg px-3 py-2">
            <p className="font-body text-[13px] text-primary">Currently: 1 {cur.code} = {creditsPerUnit} credits</p>
          </div>
        </div>

        <div className="h-px bg-border my-4" />

        {/* Section 3: Quick-Select Chips */}
        <div className="bg-card rounded-2xl p-5 shadow-soft">
          <p className="font-display font-bold text-base text-foreground mb-4">⚡ Task Quick-Select Chips</p>
          <p className="font-body text-sm text-muted-foreground mb-4">These appear as shortcuts when creating tasks</p>

          <div className="space-y-3 mb-4">
            {chips.map((val, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-body text-sm text-muted-foreground w-14">Chip {i + 1}:</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={val || ""}
                  onChange={(e) => handleChipChange(i, e.target.value)}
                  className="w-[120px] h-11 border border-border rounded-xl text-center font-display font-bold text-lg text-primary bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
                />
              </div>
            ))}
          </div>

          <p className="font-body text-xs text-muted-foreground mb-2">Preview:</p>
          <div className="bg-primary/5 rounded-xl p-3 flex gap-2 flex-wrap">
            {chips.map((val, i) => (
              <span
                key={i}
                className="h-9 px-4 rounded-full bg-primary/10 border border-primary/30 text-primary font-body text-sm flex items-center"
              >
                {val} credits
              </span>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full h-[52px] mt-6 mb-8 bg-gradient-primary rounded-2xl font-display font-bold text-base text-primary-foreground shadow-colored active:scale-[0.98] transition-transform"
        >
          Save Changes
        </button>
      </div>

      <ParentBottomNav activeTab="settings" />

      {/* Confirmation Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="rounded-t-3xl rounded-b-none sm:rounded-2xl max-w-sm mx-auto p-6">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl text-foreground text-center">Save Changes?</DialogTitle>
          </DialogHeader>

          <p className="font-body text-sm text-muted-foreground text-center mb-3">Your new credit settings:</p>

          <div className="bg-primary/5 rounded-xl p-4 space-y-2 mb-3">
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Currency:</span>
              <span className="text-foreground font-semibold">{cur.flag} {cur.code}</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Rate:</span>
              <span className="text-foreground font-semibold">1 {cur.code} = {creditsPerUnit} 💰</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Task chips:</span>
              <span className="text-foreground font-semibold">[{chips.join("][")}]</span>
            </div>
          </div>

          <p className="font-body text-[13px] text-warning text-center mb-4">
            ⚠️ This will update for all future tasks and rewards. Existing tasks won't change.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 h-[52px] rounded-xl border border-border font-body text-base text-muted-foreground active:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 h-[52px] rounded-xl bg-success font-display font-bold text-base text-primary-foreground active:opacity-90 transition-opacity"
            >
              Save ✓
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentCreditSettings;
