import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MobileButton, MobileInput } from "@/components/mobile";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Supabase processes the recovery link via the hash and fires PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setHasSession(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      toast({ title: "Password updated! ✓" });
      setTimeout(() => navigate("/parent-login"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-tint relative overflow-hidden">
      <div className="mx-auto max-w-md min-h-screen flex flex-col relative px-5 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          {success ? (
            <div className="text-center mt-16">
              <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                Password updated!
              </h1>
              <p className="text-sm font-body text-muted-foreground">
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                Set a new password
              </h1>
              <p className="text-sm font-body text-muted-foreground mb-8">
                Enter a new password for your account.
              </p>

              <div className="space-y-5">
                <MobileInput
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-primary" />
                      ) : (
                        <Eye className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  }
                />

                <MobileInput
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-body text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </p>
                  </div>
                )}

                {!hasSession && (
                  <div className="p-3 rounded-xl bg-muted border border-border">
                    <p className="text-xs font-body text-muted-foreground">
                      Waiting for recovery link... If you didn't arrive here from a password reset email, please request a new link.
                    </p>
                  </div>
                )}

                <MobileButton
                  variant={isSaving || !hasSession ? "disabled" : "primary"}
                  fullWidth
                  onClick={handleSubmit}
                  disabled={isSaving || !hasSession}
                >
                  {isSaving ? "Updating..." : "Update Password"}
                </MobileButton>

                <button
                  onClick={() => navigate("/parent-login")}
                  className="w-full h-10 text-sm font-body text-muted-foreground"
                >
                  Back to sign in
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
