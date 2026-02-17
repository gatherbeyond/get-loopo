import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileInput } from "@/components/mobile";
import { MobileButton } from "@/components/mobile";
import { AlertCircle } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  email: string;
  onSave: (name: string, email: string) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onClose, name, email, onSave }) => {
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);

  useEffect(() => {
    if (open) {
      setEditName(name);
      setEditEmail(email);
    }
  }, [open, name, email]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail);
  const isValid = editName.trim().length > 0 && isEmailValid;

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
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-primary-foreground">
                {editName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            </div>
            <button className="text-sm font-body text-primary font-semibold">Change Photo</button>
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
              variant={isValid ? "primary" : "disabled"}
              className="flex-1"
              onClick={() => isValid && onSave(editName.trim(), editEmail.trim())}
              disabled={!isValid}
            >
              Save Changes
            </MobileButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
