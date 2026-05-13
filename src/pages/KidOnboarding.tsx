import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Camera, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MobileButton, CoinIcon } from "@/components/mobile";
import { avatars } from "@/components/signup/AvatarPicker";
import loopoMascot from "@/assets/loopo-mascot.png";

interface KidData {
  name: string;
  avatar: string;
  interests: string[] | null;
  onboarding_completed_at: string | null;
}

const VoiceBubble: React.FC<{
  main: string;
  sub?: string;
  children?: React.ReactNode;
  className?: string;
}> = ({ main, sub, children, className = "" }) => (
  <div className={`bg-card rounded-3xl shadow-xl p-5 ${className}`}>
    <p className="font-display text-xs text-primary tracking-wider mb-2">LOOPO SAYS</p>
    <p className="font-display text-xl text-foreground">{main}</p>
    {sub && <p className="font-body text-base text-muted-foreground mt-2">{sub}</p>}
    {children}
  </div>
);

const KidOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [kid, setKid] = useState<KidData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const completeOnboarding = useCallback(async () => {
    if (!user?.kidId) return;
    try {
      const { error: rpcErr } = await supabase.rpc("increment_kid_credits", {
        kid_id: user.kidId,
        amount: 500,
      });
      if (rpcErr) console.error("increment_kid_credits failed", rpcErr);
      const { error: updErr } = await supabase
        .from("kids")
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq("id", user.kidId);
      if (updErr) console.error("onboarding_completed_at update failed", updErr);
    } catch (e) {
      console.error("completeOnboarding error", e);
    }
  }, [user?.kidId]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // No-auth guard
  useEffect(() => {
    if (!user?.kidId) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Fetch kid data
  useEffect(() => {
    if (!user?.kidId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from("kids")
          .select("name, avatar, interests, onboarding_completed_at")
          .eq("id", user.kidId)
          .maybeSingle();
        if (cancelled) return;
        if (fetchErr || !data) {
          setError(true);
          setLoading(false);
          return;
        }
        if (data.onboarding_completed_at) {
          navigate("/kid", { replace: true });
          return;
        }
        setKid(data as KidData);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, navigate]);

  // Step 5: complete onboarding + auto-advance to celebration
  useEffect(() => {
    if (currentStep !== 5) return;
    completeOnboarding();
    const t = setTimeout(() => setCurrentStep(6), 1500);
    return () => clearTimeout(t);
  }, [currentStep, completeOnboarding]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-primary flex flex-col items-center justify-center px-6 text-center">
        <div className="bg-card rounded-3xl shadow-xl p-6 max-w-sm w-full">
          <p className="font-display text-xl text-foreground mb-2">Something went wrong</p>
          <p className="font-body text-base text-muted-foreground mb-6">
            We couldn't load your profile. Please try again.
          </p>
          <MobileButton
            variant="primary"
            fullWidth
            onClick={() => navigate("/kid-login")}
          >
            Back to login
          </MobileButton>
        </div>
      </div>
    );
  }

  if (loading || !kid) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <img src={loopoMascot} alt="Loopo" className="w-24 h-24 object-contain animate-pulse" />
      </div>
    );
  }

  const avatarData = avatars.find((a) => a.id === kid.avatar);
  const interestPills = (kid.interests ?? []).slice(0, 3);

  const stepTransition = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.3, ease: "easeOut" as const },
  };

  return (
    <div className="min-h-screen bg-gradient-primary safe-area-top safe-area-bottom flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              {...stepTransition}
              className="flex-1 flex flex-col items-center justify-between px-5 py-8"
            >
              <div className="flex-1 flex flex-col items-center justify-center w-full gap-6">
                <motion.img
                  src={loopoMascot}
                  alt="Loopo"
                  className="h-[140px] w-auto object-contain"
                  animate={{ rotate: [-10, 10, -10] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <VoiceBubble
                  main={`Hi, ${kid.name}!`}
                  sub="I'm Loopo. I'm so excited to meet you!"
                  className="w-full"
                />
                <div
                  className={`w-[120px] h-[120px] rounded-full ${avatarData?.bg || "bg-card"} ring-4 ring-primary-foreground/40 shadow-2xl flex items-center justify-center text-6xl`}
                  style={{ boxShadow: "0 0 40px hsl(var(--primary) / 0.5)" }}
                >
                  {avatarData?.emoji || "👤"}
                </div>
              </div>
              <MobileButton
                variant="primary"
                fullWidth
                onClick={() => setCurrentStep(2)}
                className="bg-card text-primary"
              >
                That's me!
              </MobileButton>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              {...stepTransition}
              className="flex-1 flex flex-col items-center justify-between px-5 py-8"
            >
              <div className="flex-1 flex flex-col items-center justify-center w-full gap-6">
                <motion.img
                  src={loopoMascot}
                  alt="Loopo"
                  className="h-[140px] w-auto object-contain"
                  animate={{ rotate: [-3, 3, -3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <VoiceBubble main="I heard you love..." className="w-full">
                  {interestPills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {interestPills.map((interest) => (
                        <span
                          key={interest}
                          className="bg-primary/10 text-primary font-display rounded-full px-4 py-2 text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="font-body text-base text-muted-foreground mt-4">
                    That's awesome. I have missions you're going to love!
                  </p>
                </VoiceBubble>
              </div>
              <MobileButton
                variant="primary"
                fullWidth
                onClick={() => setCurrentStep(3)}
                className="bg-card text-primary"
              >
                Cool!
              </MobileButton>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              {...stepTransition}
              className="flex-1 flex flex-col px-5 py-6"
            >
              <div className="flex items-start gap-3">
                <motion.img
                  src={loopoMascot}
                  alt="Loopo"
                  className="h-[80px] w-auto object-contain shrink-0"
                  animate={{ rotate: [0, 15, 0], x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="bg-card rounded-3xl shadow-xl px-4 py-3 flex-1">
                  <p className="font-display text-base text-foreground">
                    Wanna see how to win?
                  </p>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  className="relative w-full"
                  animate={{ opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="bg-card rounded-[24px] shadow-2xl border-2 border-accent-gold p-8 flex flex-col items-center text-center gap-4">
                    <Sparkles size={48} className="text-accent-gold" strokeWidth={2.5} />
                    <h2 className="font-display font-bold text-2xl text-foreground leading-tight">
                      Your First Mission!
                    </h2>
                    <span className="font-display bg-accent-gold/20 text-accent-gold rounded-full px-4 py-1">
                      +500 credits
                    </span>
                  </div>
                </motion.div>
              </div>

              <motion.button
                onClick={() => setCurrentStep(4)}
                className="w-[90%] h-16 mx-auto rounded-3xl bg-gradient-primary text-primary-foreground font-display font-bold text-xl active:scale-95 transition-transform"
                animate={{
                  boxShadow: [
                    "0 0 0 0 hsl(var(--primary) / 0.6)",
                    "0 0 0 16px hsl(var(--primary) / 0)",
                    "0 0 0 0 hsl(var(--primary) / 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              >
                TAP ME!
              </motion.button>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              {...stepTransition}
              className="flex-1 flex flex-col items-center justify-between px-5 py-8"
            >
              <div className="flex flex-col items-center gap-4 w-full">
                <motion.img
                  src={loopoMascot}
                  alt="Loopo"
                  className="h-[100px] w-auto object-contain"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                />
                <VoiceBubble
                  main="Take a photo of you doing something COOL!"
                  className="w-full"
                />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center w-full gap-4 py-4">
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="Your proof"
                      className="rounded-[24px] object-cover w-full max-h-[280px] shadow-2xl"
                    />
                    <button
                      onClick={() => {
                        setPhotoPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="font-body text-base text-primary-foreground/80 underline underline-offset-4"
                    >
                      Retake
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative w-[160px] h-[160px] flex items-center justify-center">
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-primary-foreground/40"
                        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-[160px] h-[160px] rounded-full bg-card border-4 border-primary flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Camera className="w-16 h-16 text-primary" strokeWidth={2.5} />
                      </button>
                    </div>
                    <p className="font-body text-base text-primary-foreground/80">
                      Tap to snap!
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      capture={true}
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handlePhotoCapture}
                    />
                  </>
                )}
              </div>

              {photoPreview && (
                <MobileButton
                  variant="primary"
                  fullWidth
                  onClick={() => setCurrentStep(5)}
                  className="bg-card text-primary"
                >
                  That's my proof!
                </MobileButton>
              )}
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step5"
              {...stepTransition}
              className="flex-1 flex flex-col items-center justify-center px-5 py-8 gap-6 text-center"
            >
              <motion.img
                src={loopoMascot}
                alt="Loopo"
                className="h-[120px] w-auto object-contain"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: 0, ease: "easeInOut" }}
              />
              <div>
                <p className="font-display text-xl text-primary-foreground">
                  Sending to the stars...
                </p>
                <p className="font-body text-base text-primary-foreground/70 mt-2">
                  Get ready...
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-3 h-3 rounded-full bg-primary-foreground"
                    animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div
              key="step6"
              {...stepTransition}
              className="relative flex-1 flex flex-col items-center justify-between px-5 py-8 overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => {
                  const colors = [
                    "hsl(var(--primary))",
                    "hsl(var(--accent-gold))",
                    "hsl(var(--success))",
                    "hsl(var(--secondary))",
                  ];
                  const color = colors[i % colors.length];
                  const left = `${(i * 17) % 100}%`;
                  const isCircle = i % 2 === 0;
                  return (
                    <motion.span
                      key={i}
                      className={isCircle ? "absolute rounded-full" : "absolute rounded-sm"}
                      style={{
                        left,
                        top: -20,
                        width: 10,
                        height: 10,
                        backgroundColor: color,
                      }}
                      initial={{ y: -20, opacity: 1, rotate: 0 }}
                      animate={{ y: 600, opacity: 0, rotate: 360 }}
                      transition={{
                        duration: 2 + (i % 10) * 0.1,
                        delay: i * 0.1,
                        ease: "easeIn",
                      }}
                    />
                  );
                })}
              </div>

              <div className="relative flex-1 flex flex-col items-center justify-center w-full gap-6">
                <motion.img
                  src={loopoMascot}
                  alt="Loopo"
                  className="h-[160px] w-auto object-contain"
                  initial={{ scale: 0.8, rotate: 0 }}
                  animate={{ scale: [0.8, 1.1, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.6, type: "spring" }}
                />

                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-3">
                    <CoinIcon className="w-12 h-12" />
                    <span
                      className="font-display font-bold text-accent-gold leading-none"
                      style={{ fontSize: "72px" }}
                    >
                      +500
                    </span>
                  </div>
                  <p className="font-display text-2xl text-primary-foreground mt-2">
                    credits earned!
                  </p>
                </div>

                <div className="bg-card rounded-3xl p-5 mx-4 text-center shadow-xl">
                  <p className="font-display font-bold text-xl text-foreground">
                    You're a Loopo Legend!
                  </p>
                  <p className="font-body text-sm text-muted-foreground mt-2">
                    You just completed your first mission. Real rewards are waiting for you.
                  </p>
                </div>
              </div>

              <MobileButton
                variant="primary"
                fullWidth
                onClick={() => navigate("/kid", { replace: true })}
                className="bg-card text-primary relative"
              >
                Let's go!
              </MobileButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default KidOnboarding;
