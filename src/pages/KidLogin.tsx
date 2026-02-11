import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Delete } from "lucide-react";
import loopoMascot from "@/assets/loopo-mascot.png";
import { avatars } from "@/components/signup/AvatarPicker";
import { useAuth } from "@/contexts/AuthContext";

// Mock data for demo
const MOCK_FAMILY_CODE = "X7K9M2";
const MOCK_FAMILY = {
  name: "The Santos Family",
  kids: [
    { id: "1", name: "Miguel", age: 9, avatar: "lion", pin: "1234" },
    { id: "2", name: "Sofia", age: 11, avatar: "unicorn", pin: "5678" },
  ],
};

type Step = "code" | "profile" | "pin";

const KidLogin = () => {
  const navigate = useNavigate();
  const { loginAsKid } = useAuth();
  const [step, setStep] = useState<Step>("code");
  const [familyCode, setFamilyCode] = useState<string[]>(Array(6).fill(""));
  const [codeError, setCodeError] = useState("");
  const [selectedKid, setSelectedKid] = useState<(typeof MOCK_FAMILY.kids)[0] | null>(null);
  const [pin, setPin] = useState<string[]>([]);
  const [pinError, setPinError] = useState("");
  const [pinAttempts, setPinAttempts] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input
  useEffect(() => {
    if (step === "code") {
      codeInputRefs.current[0]?.focus();
    }
  }, [step]);

  const isCodeComplete = familyCode.every((c) => c !== "");

  const handleCodeInput = (index: number, value: string) => {
    if (!/^[a-zA-Z0-9]?$/.test(value)) return;
    const newCode = [...familyCode];
    newCode[index] = value.toUpperCase();
    setFamilyCode(newCode);
    setCodeError("");
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !familyCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    const newCode = Array(6).fill("");
    pasted.split("").forEach((c, i) => (newCode[i] = c));
    setFamilyCode(newCode);
    if (pasted.length === 6) {
      codeInputRefs.current[5]?.focus();
    }
  };

  const validateCode = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      if (familyCode.join("") === MOCK_FAMILY_CODE) {
        setStep("profile");
      } else {
        setCodeError("Family code not found");
      }
    }, 800);
  };

  const handlePinDigit = useCallback(
    (digit: string) => {
      if (pin.length >= 4) return;
      const newPin = [...pin, digit];
      setPin(newPin);
      setPinError("");

      if (newPin.length === 4) {
        setIsValidating(true);
        setTimeout(() => {
          setIsValidating(false);
          if (newPin.join("") === selectedKid?.pin) {
            setShowSuccess(true);
            loginAsKid(selectedKid.name, selectedKid.id, selectedKid.avatar);
            setTimeout(() => navigate("/kid"), 1500);
          } else {
            const attempts = pinAttempts + 1;
            setPinAttempts(attempts);
            setPinError(attempts >= 3 ? "Need help? Ask your parent!" : "Wrong PIN. Try again!");
            setPin([]);
          }
        }, 600);
      }
    },
    [pin, selectedKid, pinAttempts, navigate]
  );

  const handlePinDelete = () => {
    setPin((p) => p.slice(0, -1));
    setPinError("");
  };

  const handleBack = () => {
    if (step === "code") navigate("/");
    else if (step === "profile") {
      setStep("code");
      setFamilyCode(Array(6).fill(""));
    } else {
      setStep("profile");
      setPin([]);
      setPinError("");
      setPinAttempts(0);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-background-tint to-transparent pointer-events-none" />
      <div className="mx-auto max-w-md min-h-screen flex flex-col relative">
        {/* Top Bar */}
        <div className="flex items-center px-5 pt-6 safe-area-top">
          <button onClick={handleBack} className="w-11 h-11 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h2 className="flex-1 text-center text-xl font-display font-bold text-foreground pr-11">Kid Login</h2>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Family Code */}
          {step === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col px-5"
            >
              <div className="flex justify-center mt-8">
                <motion.img
                  src={loopoMascot}
                  alt="Loopo"
                  className="h-[120px] w-auto object-contain"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1, y: [0, -5, 0] }}
                  transition={{ y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
                />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground text-center mt-6">
                Hi! What's your family code?
              </h1>
              <p className="text-sm font-body text-muted-foreground text-center mt-3">
                Ask your parent if you forgot!
              </p>

              {/* Code Input */}
              <div className="flex justify-center gap-2 mt-8" onPaste={handleCodePaste}>
                {familyCode.map((char, i) => (
                  <input
                    key={i}
                    ref={(el) => (codeInputRefs.current[i] = el)}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={char}
                    onChange={(e) => handleCodeInput(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-[32px] font-display font-bold text-primary uppercase rounded-xl border-2 bg-card focus:outline-none transition-all ${
                      codeError ? "border-error" : char ? "border-primary" : "border-border"
                    } focus:border-primary focus:ring-4 focus:ring-primary/20`}
                  />
                ))}
              </div>

              {/* Example */}
              <div className="flex justify-center mt-5">
                <span className="px-3 py-1.5 bg-background-tint rounded-xl text-xs font-body text-text-muted">
                  Example: X7K9M2
                </span>
              </div>

              {/* Error */}
              {codeError && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-4">
                  <p className="text-sm font-body text-error">❌ {codeError}</p>
                  <p className="text-xs font-body text-muted-foreground mt-1">Check with your parent and try again</p>
                </motion.div>
              )}

              {/* Next Button */}
              <div className="mt-auto pb-8 safe-area-bottom">
                <button
                  onClick={validateCode}
                  disabled={!isCodeComplete || isValidating}
                  className={`w-full h-14 rounded-3xl font-display font-bold text-lg shadow-button transition-all ${
                    isCodeComplete && !isValidating
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {isValidating ? "Checking..." : "Next →"}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Profile Selection */}
          {step === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col px-5"
            >
              <h1 className="text-[26px] font-display font-bold text-primary text-center mt-10">
                Welcome {MOCK_FAMILY.name}! 👋
              </h1>
              <p className="text-[22px] font-display font-bold text-foreground text-center mt-5">Who are you?</p>

              <div className="grid grid-cols-2 gap-4 mt-10 justify-items-center">
                {MOCK_FAMILY.kids.map((kid) => {
                  const avatarData = avatars.find((a) => a.id === kid.avatar);
                  return (
                    <motion.button
                      key={kid.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedKid(kid);
                        setStep("pin");
                      }}
                      className="w-[140px] h-[180px] bg-card border-2 border-border rounded-[20px] p-5 flex flex-col items-center justify-center gap-2 shadow-soft hover:border-primary transition-colors"
                    >
                      <div
                        className={`w-20 h-20 rounded-full ${avatarData?.bg || "bg-muted"} flex items-center justify-center text-4xl`}
                      >
                        {avatarData?.emoji || "👤"}
                      </div>
                      <span className="text-lg font-display font-bold text-foreground">{kid.name}</span>
                      <span className="text-xs font-body text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Age {kid.age}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex justify-center mt-8">
                <span className="px-4 py-2 bg-background-tint rounded-xl text-sm font-body text-muted-foreground">
                  Tap your picture!
                </span>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PIN Entry */}
          {step === "pin" && selectedKid && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col items-center px-5"
            >
              {showSuccess ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center"
                >
                  <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center mb-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                      <span className="text-4xl">✅</span>
                    </motion.div>
                  </div>
                  <p className="text-xl font-display font-bold text-success">Welcome back, {selectedKid.name}! 🎉</p>
                </motion.div>
              ) : (
                <>
                  {/* Avatar */}
                  <div className="mt-10">
                    {(() => {
                      const avatarData = avatars.find((a) => a.id === selectedKid.avatar);
                      return (
                        <div
                          className={`w-[100px] h-[100px] rounded-full ${avatarData?.bg || "bg-muted"} border-[3px] border-primary flex items-center justify-center text-5xl`}
                        >
                          {avatarData?.emoji || "👤"}
                        </div>
                      );
                    })()}
                  </div>

                  <h1 className="text-[26px] font-display font-bold text-foreground mt-6">
                    Hi {selectedKid.name}! {avatars.find((a) => a.id === selectedKid.avatar)?.emoji || "👋"}
                  </h1>
                  <p className="text-xl font-display font-bold text-muted-foreground mt-4">Enter your PIN:</p>

                  {/* PIN Dots */}
                  <div className="flex gap-3 mt-8">
                    {Array(4)
                      .fill(null)
                      .map((_, i) => (
                        <motion.div
                          key={i}
                          animate={pinError && pin.length === 0 ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                          transition={{ duration: 0.4 }}
                          className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                            pin[i] ? "border-primary bg-primary" : "border-border bg-card"
                          }`}
                        >
                          {pin[i] && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-[32px] text-primary-foreground"
                            >
                              •
                            </motion.span>
                          )}
                        </motion.div>
                      ))}
                  </div>

                  {/* Error */}
                  {pinError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-body text-error mt-4"
                    >
                      ❌ {pinError}
                    </motion.p>
                  )}

                  {/* Numeric Keypad */}
                  <div className="grid grid-cols-3 gap-3 mt-8 w-full max-w-[264px]">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key) => {
                      if (key === "") return <div key="empty" />;
                      if (key === "del") {
                        return (
                          <motion.button
                            key="del"
                            whileTap={{ scale: 0.9 }}
                            onClick={handlePinDelete}
                            className="w-[72px] h-[72px] rounded-2xl border border-border bg-card flex items-center justify-center mx-auto"
                          >
                            <Delete className="w-6 h-6 text-error" />
                          </motion.button>
                        );
                      }
                      return (
                        <motion.button
                          key={key}
                          whileTap={{ scale: 0.9, backgroundColor: "hsl(var(--primary))" }}
                          onClick={() => handlePinDigit(key)}
                          disabled={isValidating}
                          className="w-[72px] h-[72px] rounded-2xl border border-border bg-card text-[32px] font-display font-bold text-foreground flex items-center justify-center mx-auto active:text-primary-foreground transition-colors"
                        >
                          {key}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Helper */}
                  <div className="mt-auto pb-8 safe-area-bottom text-center">
                    <p className="text-[13px] font-body text-primary">Forgot your PIN?</p>
                    <p className="text-[11px] font-body text-text-muted mt-1">Ask your parent for help!</p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default KidLogin;
