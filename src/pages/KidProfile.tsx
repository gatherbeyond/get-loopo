import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Star, Zap, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { avatars } from "@/components/signup/AvatarPicker";

interface ProfileData {
  name: string;
  age: number | null;
  avatar: string | null;
  credits_balance: number;
  missionsCompleted: number;
}

const KidProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.kidId) {
        setLoading(false);
        return;
      }
      try {
        const [kidRes, missionsRes] = await Promise.all([
          supabase
            .from("kids")
            .select("name, age, avatar, credits_balance")
            .eq("id", user.kidId)
            .maybeSingle(),
          supabase
            .from("tasks")
            .select("id", { count: "exact", head: true })
            .eq("kid_id", user.kidId)
            .eq("status", "completed"),
        ]);

        setProfile({
          name: kidRes.data?.name || user.name || "Kid",
          age: kidRes.data?.age ?? null,
          avatar: kidRes.data?.avatar ?? null,
          credits_balance: kidRes.data?.credits_balance ?? 0,
          missionsCompleted: missionsRes.count ?? 0,
        });
      } catch (e) {
        console.error("Failed to fetch profile:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.kidId]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const avatarData = avatars.find((a) => a.id === profile?.avatar);

  return (
    <div className="min-h-screen bg-background pb-12">
      <header
        className="sticky top-0 z-40 bg-background flex items-center gap-2 px-5 py-3"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 flex items-center justify-center -ml-2"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="font-display font-bold text-xl text-foreground">My Profile</h1>
      </header>

      <div className="px-5 pt-4">
        {loading ? (
          <div className="space-y-4">
            <div className="h-32 rounded-2xl bg-muted animate-pulse" />
            <div className="h-24 rounded-2xl bg-muted animate-pulse" />
            <div className="h-24 rounded-2xl bg-muted animate-pulse" />
          </div>
        ) : profile ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-5xl mb-3 border-4 border-primary/20">
                {avatarData?.emoji || "🦊"}
              </div>
              <h2 className="font-display font-bold text-2xl text-foreground">
                {profile.name}
              </h2>
              {profile.age && (
                <p className="font-body text-sm text-muted-foreground">
                  Age {profile.age}
                </p>
              )}
            </motion.div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-warning" />
                  <span className="font-body text-xs text-muted-foreground">Credits</span>
                </div>
                <p className="font-display font-bold text-2xl text-foreground">
                  {profile.credits_balance.toLocaleString()}
                </p>
                <p className="font-body text-xs text-muted-foreground">current balance</p>
              </div>

              <div className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-body text-xs text-muted-foreground">Missions</span>
                </div>
                <p className="font-display font-bold text-2xl text-foreground">
                  {profile.missionsCompleted}
                </p>
                <p className="font-body text-xs text-muted-foreground">completed</p>
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-warning" />
                <h3 className="font-display font-bold text-base text-foreground">
                  Achievements
                </h3>
              </div>
              <p className="font-body text-sm text-muted-foreground">
                Badges and achievements coming soon! 🏅
              </p>
            </div>

            <button
              onClick={() => setConfirmLogout(true)}
              className="w-full h-14 rounded-2xl border-2 border-error/30 bg-error/5 font-display font-bold text-base text-error flex items-center justify-center gap-2 transition-colors hover:bg-error/10"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </>
        ) : (
          <p className="font-body text-sm text-muted-foreground text-center py-12">
            Couldn't load profile. Try again!
          </p>
        )}
      </div>

      {confirmLogout && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[70]"
            onClick={() => setConfirmLogout(false)}
          />
          <div className="fixed inset-0 z-[80] flex items-center justify-center px-8">
            <div className="bg-card rounded-3xl p-6 w-full max-w-xs shadow-xl">
              <h2 className="font-display font-bold text-xl text-foreground text-center mb-2">
                Log Out?
              </h2>
              <p className="font-body text-sm text-muted-foreground text-center mb-6">
                You'll need to log in again to play
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="flex-1 h-12 rounded-xl border border-border font-display font-bold text-base text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 h-12 rounded-xl bg-error font-display font-bold text-base text-error-foreground hover:bg-error/90 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default KidProfile;
