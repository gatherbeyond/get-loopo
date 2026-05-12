import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
// import { getPostAuthRedirect } from "@/lib/onboarding";
import { MobileButton, MobileInput } from "@/components/mobile";

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const ParentLogin = () => {
  const navigate = useNavigate();
  const { loginAsParent } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      const redirect = await getPostAuthRedirect();
      if (redirect === "/parent") {
        loginAsParent("Parent", "My Family");
      }
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://get-loopo.lovable.app'
      }
    });
    if (error) console.error('Google auth error:', error);
  };

  return (
    <div className="min-h-screen bg-muted relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-background-tint to-transparent pointer-events-none" />

      <div className="mx-auto max-w-md min-h-screen flex flex-col relative">
        {/* Header */}
        <div className="pt-6 px-5 flex items-center">
          <button
            onClick={() => navigate("/parent-auth")}
            className="w-11 h-11 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="flex-1 text-center text-[20px] font-display font-bold text-foreground pr-11">
            Welcome Back
          </h1>
        </div>

        {/* Form */}
        <motion.div
          className="flex-1 px-5 mt-8 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MobileInput
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <MobileInput
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
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
            <div className="flex justify-end mt-2">
              <button className="text-sm font-body text-primary font-semibold">
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-body text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            </div>
          )}

          {/* Sign In Button */}
          <MobileButton
            variant={isLoading ? "disabled" : "primary"}
            fullWidth
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </MobileButton>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-body text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full h-[52px] bg-card border border-border rounded-xl flex items-center justify-center gap-3 shadow-soft"
          >
            <GoogleLogo />
            <span className="text-base font-body text-muted-foreground">Sign in with Google</span>
          </button>

          {/* Create account link */}
          <p className="text-center text-sm font-body text-muted-foreground pt-4">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-primary font-semibold"
            >
              Create your family →
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ParentLogin;
