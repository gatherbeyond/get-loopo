import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Share2, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveAvatar } from "@/lib/avatars";
import { toast } from "@/hooks/use-toast";

interface Kid {
  id: string;
  name: string;
  avatar: string;
}

const ShareCredentialsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedKidId = searchParams.get("kidId");

  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [familyCode, setFamilyCode] = useState("");
  const [pin, setPin] = useState<string | null>(null);
  const [loadingKids, setLoadingKids] = useState(true);
  const [generatingPin, setGeneratingPin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: family } = await supabase
          .from("families")
          .select("id, family_code")
          .eq("parent_id", user.id)
          .maybeSingle();
        if (!family) return;

        setFamilyCode(family.family_code);

        const { data: kidsData } = await supabase
          .from("kids")
          .select("id, name, avatar")
          .eq("family_id", family.id)
          .order("created_at", { ascending: true });

        const list = kidsData || [];
        setKids(list);

        if (preselectedKidId) {
          const found = list.find((k) => k.id === preselectedKidId);
          if (found) setSelectedKid(found);
        } else if (list.length === 1) {
          setSelectedKid(list[0]);
        }
      } finally {
        setLoadingKids(false);
      }
    };
    fetchData();
  }, [preselectedKidId]);

  const handleGeneratePin = async (kid: Kid) => {
    setGeneratingPin(true);
    setPin(null);
    const newPin = String(Math.floor(1000 + Math.random() * 9000));
    try {
      const { error } = await supabase.functions.invoke("reset-kid-pin", {
        body: { kidId: kid.id, pin: newPin },
      });
      if (error) throw error;
      setPin(newPin);
    } catch (err: any) {
      toast({ title: "Could not generate PIN", description: err.message, variant: "destructive" });
    } finally {
      setGeneratingPin(false);
    }
  };

  useEffect(() => {
    if (selectedKid) {
      handleGeneratePin(selectedKid);
    }
  }, [selectedKid]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} copied! ✓` });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (!selectedKid || !pin) return;
    const text = `Here's ${selectedKid.name}'s Loopo login info:\nFamily Code: ${familyCode}\nPIN: ${pin}\nDownload Loopo: https://loopo.app`;
    if (navigator.share) {
      try { await navigator.share({ title: "Loopo Login Info", text }); } catch {}
    } else {
      copyToClipboard(text, "Login info");
    }
  };

  if (loadingKids) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="mx-auto max-w-md w-full min-h-screen flex flex-col px-5 pt-12 pb-10">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 font-body text-sm font-bold">
            📲 Different Device
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-center font-display font-bold text-[26px] text-foreground"
        >
          Share login info with your kid
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-center font-body text-sm text-muted-foreground leading-relaxed"
        >
          Your kid will use these to log in on their own device.
        </motion.p>

        {/* Kid picker — only if multiple kids and none preselected */}
        {kids.length > 1 && !selectedKid && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-3"
          >
            <p className="font-display font-bold text-base text-foreground text-center">Which kid?</p>
            {kids.map((kid) => (
              <button
                key={kid.id}
                onClick={() => setSelectedKid(kid)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border bg-card active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                  {resolveAvatar(kid.avatar)}
                </div>
                <span className="font-display font-bold text-lg text-foreground">{kid.name}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Credentials */}
        {selectedKid && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-4"
          >
            {/* Kid header */}
            <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                {resolveAvatar(selectedKid.avatar)}
              </div>
              <div>
                <p className="font-display font-bold text-base text-foreground">{selectedKid.name}</p>
                <p className="font-body text-xs text-muted-foreground">Login credentials below</p>
              </div>
              {kids.length > 1 && (
                <button
                  onClick={() => { setSelectedKid(null); setPin(null); }}
                  className="ml-auto text-xs font-body text-primary underline"
                >
                  Change
                </button>
              )}
            </div>

            {/* Family Code */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-2">Family Code</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {familyCode.split("").map((char, i) => (
                    <div key={i} className="w-9 h-10 bg-muted border border-primary/30 rounded-lg flex items-center justify-center">
                      <span className="font-display font-bold text-base text-primary">{char}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => copyToClipboard(familyCode, "Family code")}
                  className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* PIN */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-2">{selectedKid.name}'s PIN</p>
              {generatingPin ? (
                <div className="flex items-center gap-2 h-10">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="font-body text-sm text-muted-foreground">Generating PIN...</span>
                </div>
              ) : pin ? (
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {pin.split("").map((digit, i) => (
                      <div key={i} className="w-9 h-10 bg-muted border border-primary/30 rounded-lg flex items-center justify-center">
                        <span className="font-display font-bold text-xl text-primary">{digit}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGeneratePin(selectedKid)}
                      className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"
                    >
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(pin, "PIN")}
                      className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"
                    >
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ) : null}
              <p className="font-body text-xs text-muted-foreground mt-2">
                A new PIN was generated. Share it with {selectedKid.name}.
              </p>
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              disabled={!pin}
              className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-display font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Share2 className="w-5 h-5" />
              Share with {selectedKid.name}
            </button>

            <button
              onClick={() => navigate("/parent")}
              className="w-full text-center font-body text-sm text-muted-foreground py-2"
            >
              Done, go to dashboard
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ShareCredentialsScreen;
