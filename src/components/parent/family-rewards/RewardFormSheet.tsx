import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { MobileInput } from "@/components/mobile/MobileInput";
import { MobileButton } from "@/components/mobile/MobileButton";
import { Coins } from "lucide-react";

interface RewardFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string, creditsCost: number) => void;
  initialTitle?: string;
  initialCredits?: number;
  isEdit?: boolean;
  saving?: boolean;
}

const RewardFormSheet: React.FC<RewardFormSheetProps> = ({
  open,
  onOpenChange,
  onSave,
  initialTitle = "",
  initialCredits,
  isEdit = false,
  saving = false,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [credits, setCredits] = useState(initialCredits?.toString() ?? "");

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setCredits(initialCredits?.toString() ?? "");
    }
  }, [open, initialTitle, initialCredits]);

  const canSave = title.trim().length > 0 && Number(credits) > 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md">
        <DrawerHeader>
          <DrawerTitle className="font-display text-lg">
            {isEdit ? "Edit Reward" : "Create Custom Reward"}
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 space-y-4">
          <MobileInput
            label="Title"
            placeholder="e.g. Extra Screen Time"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <MobileInput
            label="Credits Cost"
            type="number"
            placeholder="500"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            icon={<Coins className="w-5 h-5 text-accent-gold" />}
          />
        </div>
        <DrawerFooter>
          <MobileButton
            fullWidth
            disabled={!canSave || saving}
            onClick={() => onSave(title.trim(), Number(credits))}
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Save Reward"}
          </MobileButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export { RewardFormSheet };
