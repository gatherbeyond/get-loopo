import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Smartphone, Coins, LogOut } from "lucide-react";
import { ParentBottomNav } from "@/components/parent";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import EditProfileModal from "@/components/parent/EditProfileModal";
import LogoutConfirmModal from "@/components/parent/LogoutConfirmModal";

interface MenuItem {
  icon: React.ReactNode;
  emoji: string;
  label: string;
  onClick: () => void;
}

const ParentSettings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "Maria Santos");
  const [profileEmail, setProfileEmail] = useState("maria@email.com");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);

  const familyItems: MenuItem[] = [
    { icon: <Smartphone className="w-6 h-6" />, emoji: "📱", label: "Family Info", onClick: () => navigate("/parent/settings/family") },
    { icon: <Coins className="w-6 h-6" />, emoji: "💰", label: "Credit Settings", onClick: () => navigate("/parent/settings/credits") },
  ];


  const handleLogout = () => {
    logout();
    toast({ title: "Logged out successfully", description: "See you next time! 👋" });
    navigate("/home", { replace: true });
  };

  const handleSaveProfile = (name: string, email: string, avatarUrl?: string) => {
    setProfileName(name);
    setProfileEmail(email);
    if (avatarUrl) setProfileAvatarUrl(avatarUrl);
    setShowEditProfile(false);
    toast({ title: "Profile updated! ✓" });
  };

  const initials = profileName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background-tint">
      {/* Header */}
      <div className="bg-card border-b border-border safe-area-top">
        <div className="flex items-center justify-between px-5 h-[60px]">
          <button onClick={() => navigate("/parent")} className="w-11 h-11 flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-xl font-display font-bold text-foreground">Settings</h1>
          <div className="w-11" />
        </div>
      </div>

      <div className="overflow-y-auto pb-24">
        {/* Profile Card */}
        <div className="mx-5 mt-5">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-soft flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profileAvatarUrl ? (
                <img src={profileAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-display font-bold text-primary-foreground">{initials}</span>
              )}
            </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-display font-bold text-foreground truncate">{profileName}</p>
              <p className="text-sm font-body text-muted-foreground truncate">{profileEmail}</p>
            </div>
            <button onClick={() => setShowEditProfile(true)} className="text-sm font-body text-primary font-semibold whitespace-nowrap flex items-center gap-1">
              Edit Profile <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Family Section */}
        <SectionHeader emoji="👨‍👩‍👧‍👦" label="FAMILY" />
        <div className="mx-5 space-y-2">
          {familyItems.map((item) => (
            <MenuRow key={item.label} item={item} />
          ))}
        </div>


        {/* Account Section */}
        <SectionHeader emoji="🚪" label="ACCOUNT" />
        <div className="mx-5">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full h-14 bg-card border-2 border-error rounded-xl flex items-center justify-center gap-2 active:bg-error/5 transition-colors"
          >
            <span className="text-base font-display font-bold text-error">🚪 Log Out</span>
          </button>
        </div>

        <p className="text-center text-xs font-body text-muted-foreground mt-8 mb-4">Loopo v1.0.0</p>
      </div>

      <ParentBottomNav activeTab="settings" />

      <EditProfileModal
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        name={profileName}
        email={profileEmail}
        onSave={handleSaveProfile}
      />

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

const SectionHeader = ({ emoji, label }: { emoji: string; label: string }) => (
  <p className="text-sm font-display font-bold text-muted-foreground uppercase tracking-wide mx-5 mt-6 mb-3">
    {emoji} {label}
  </p>
);

const MenuRow = ({ item }: { item: MenuItem }) => (
  <button
    onClick={item.onClick}
    className="w-full h-14 bg-card border border-border rounded-xl px-4 flex items-center gap-3 active:bg-muted transition-colors"
  >
    <span className="text-lg">{item.emoji}</span>
    <span className="flex-1 text-left text-base font-body text-foreground">{item.label}</span>
    <ChevronRight className="w-5 h-5 text-muted-foreground" />
  </button>
);

export default ParentSettings;
