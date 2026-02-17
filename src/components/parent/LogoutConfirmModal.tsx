import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MobileButton } from "@/components/mobile";

interface LogoutConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="rounded-2xl max-w-[85vw] sm:max-w-sm p-6 gap-0">
      <DialogHeader className="space-y-2 mb-6">
        <DialogTitle className="text-xl font-display font-bold text-foreground text-center">
          Log Out?
        </DialogTitle>
        <DialogDescription className="text-sm font-body text-muted-foreground text-center">
          You'll need to log in again to access your account.
        </DialogDescription>
      </DialogHeader>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 h-12 rounded-xl border border-border text-base font-body font-semibold text-muted-foreground"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 h-12 rounded-xl bg-error text-error-foreground text-base font-display font-bold"
        >
          Log Out
        </button>
      </div>
    </DialogContent>
  </Dialog>
);

export default LogoutConfirmModal;
