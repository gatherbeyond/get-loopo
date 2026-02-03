import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AvatarPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatar: string) => void;
  selectedAvatar: string | null;
}

// Kid-friendly avatar options with emojis and colors
const avatars = [
  { id: "lion", emoji: "🦁", bg: "bg-amber-100" },
  { id: "panda", emoji: "🐼", bg: "bg-gray-100" },
  { id: "unicorn", emoji: "🦄", bg: "bg-pink-100" },
  { id: "dragon", emoji: "🐲", bg: "bg-green-100" },
  { id: "fox", emoji: "🦊", bg: "bg-orange-100" },
  { id: "owl", emoji: "🦉", bg: "bg-amber-100" },
  { id: "penguin", emoji: "🐧", bg: "bg-blue-100" },
  { id: "koala", emoji: "🐨", bg: "bg-gray-100" },
  { id: "bunny", emoji: "🐰", bg: "bg-pink-100" },
  { id: "cat", emoji: "🐱", bg: "bg-orange-100" },
  { id: "dog", emoji: "🐶", bg: "bg-amber-100" },
  { id: "bear", emoji: "🐻", bg: "bg-amber-200" },
  { id: "monkey", emoji: "🐵", bg: "bg-amber-100" },
  { id: "tiger", emoji: "🐯", bg: "bg-orange-100" },
  { id: "elephant", emoji: "🐘", bg: "bg-gray-200" },
  { id: "giraffe", emoji: "🦒", bg: "bg-yellow-100" },
  { id: "dolphin", emoji: "🐬", bg: "bg-blue-100" },
  { id: "butterfly", emoji: "🦋", bg: "bg-purple-100" },
  { id: "star", emoji: "⭐", bg: "bg-yellow-100" },
  { id: "rocket", emoji: "🚀", bg: "bg-blue-100" },
];

const AvatarPicker = ({
  isOpen,
  onClose,
  onSelect,
  selectedAvatar,
}: AvatarPickerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[32px] z-50 max-h-[70vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <h2 className="text-xl font-display font-bold text-foreground">
                Choose Avatar
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-muted"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {/* Avatar Grid */}
            <div className="px-5 pb-8 overflow-y-auto max-h-[50vh]">
              <div className="grid grid-cols-4 gap-3">
                {avatars.map((avatar) => (
                  <motion.button
                    key={avatar.id}
                    onClick={() => {
                      onSelect(avatar.id);
                      onClose();
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-[60px] h-[60px] rounded-full ${avatar.bg} flex items-center justify-center text-3xl mx-auto ${
                      selectedAvatar === avatar.id
                        ? "ring-[3px] ring-primary shadow-lg"
                        : "border-2 border-border"
                    }`}
                  >
                    {avatar.emoji}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { avatars };
export default AvatarPicker;
