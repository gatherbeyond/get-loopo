import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Star, PenLine } from "lucide-react";
import { motion } from "framer-motion";

interface AddRewardSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChooseTemplates: () => void;
  onCreateCustom: () => void;
}

const AddRewardSheet: React.FC<AddRewardSheetProps> = ({
  open,
  onOpenChange,
  onChooseTemplates,
  onCreateCustom,
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md">
        <DrawerHeader>
          <DrawerTitle className="font-display text-lg">Add Reward</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onChooseTemplates}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-foreground">Choose from Templates</p>
              <p className="text-sm font-body text-muted-foreground">Pick from pre-made reward ideas</p>
            </div>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onCreateCustom}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <PenLine className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-foreground">Create Custom Reward</p>
              <p className="text-sm font-body text-muted-foreground">Define your own reward</p>
            </div>
          </motion.button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export { AddRewardSheet };
