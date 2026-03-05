import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileInput } from "@/components/mobile";
import { MobileButton } from "@/components/mobile";
import { AlertCircle, Loader2 } from "lucide-react";
import { uploadAvatar, saveAvatarUrl } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  email: string;
  avatarUrl?: string | null;
  onSave: (name: string, email: string, avatarUrl?: string) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onClose, name, email, avatarUrl, onSave }) => {
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setEditName(name);
      setEditEmail(email);
      setPreviewAvatar(avatarUrl || null);
      setAvatarFile(null);
    }
  }, [open, name, email, avatarUrl]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail);
  const isValid = editName.trim().length > 0 && isEmailValid;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!isValid) return;

    let finalAvatarUrl = avatarUrl || undefined;

    if (avatarFile) {
      setIsUploading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const url = await uploadAvatar(avatarFile, user.id);
        await saveAvatarUrl(user.id, url);
        finalAvatarUrl = url;
      } catch (err) {
        console.error("Avatar upload failed:", err);
        toast({ title: "Photo upload failed", description: "Profile saved without photo.", variant: "destructive" });
      } finally {
        setIsUploading(false);
      }
    }

    onSave(editName.trim(), editEmail.trim(), finalAvatarUrl);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl max-w-[90vw] sm:max-w-md p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-display font-bold text-foreground text-center">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
              {previewAvatar ? (
                <img src={previewAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-display font-bold text-primary-foreground">
                  {editName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </span>
              )}
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="text-sm font-body text-primary font-semibold">
              Change Photo
            </button>
          </div>

          <MobileInput
            label="Full Name *"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Enter your full name"
          />

          <div>
            <MobileInput
              label="Email Address *"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="your@email.com"
              error={editEmail && !isEmailValid ? "Please enter a valid email" : undefined}
            />
            <div className="flex items-center gap-2 mt-2 text-xs font-body text-muted-foreground">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Changing email requires verification</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-border text-base font-body font-semibold text-muted-foreground"
            >
              Cancel
            </button>
            <MobileButton
              variant={isValid && !isUploading ? "primary" : "disabled"}
              className="flex-1"
              onClick={handleSave}
              disabled={!isValid || isUploading}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </span>
              ) : (
                "Save Changes"
              )}
            </MobileButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
