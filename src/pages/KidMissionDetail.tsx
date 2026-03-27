import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Sparkles, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileButton } from "@/components/mobile";
import { CoinIcon } from "@/components/mobile/CreditDisplay";
import loopoMascot from "@/assets/loopo-mascot.png";
import { uploadTaskPhoto, saveTaskPhotoUrl } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type MissionStatus = "not_started" | "in_progress" | "pending_approval" | "completed";

interface MissionData {
  id: string;
  title: string;
  description: string;
  creditReward: number;
  status: MissionStatus;
  requiresPhoto: boolean;
}

// Mock mission data
const mockMission: MissionData = {
  id: "1",
  title: "Clean your room",
  description: "Organize your toys neatly in the toy box, make your bed with fresh sheets, dust the shelves, and vacuum the floor. Make sure everything looks tidy!",
  creditReward: 500,
  status: "not_started",
  requiresPhoto: true,
};

const KidMissionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [mission, setMission] = React.useState<MissionData>(mockMission);
  const [uploadedPhoto, setUploadedPhoto] = React.useState<string | null>(null);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleBack = () => {
    if (uploadedPhoto && mission.status === "in_progress") {
      // Could show confirmation dialog here
      if (window.confirm("Are you sure? Your photo will be lost.")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const handleStartMission = () => {
    setMission((prev) => ({ ...prev, status: "in_progress" }));
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);

    // Upload photo to Supabase Storage if available
    if (photoFile && mission.requiresPhoto) {
      setIsUploading(true);
      try {
        // TODO: Replace with real familyId/kidId from auth context
        const familyId = "mock-family-id";
        const kidId = "mock-kid-id";
        const photoUrl = await uploadTaskPhoto(photoFile, familyId, kidId, mission.id);
        await saveTaskPhotoUrl(mission.id, photoUrl);
      } catch (err: any) {
        console.error("Photo upload failed — full error:", JSON.stringify(err, null, 2));
        console.error("Error message:", err?.message);
        console.error("Error statusCode:", err?.statusCode);
        console.error("Upload path used:", `${familyId}/${kidId}/${mission.id}.jpg`);
        toast({ title: "Photo upload failed", description: "Your mission was submitted but the photo couldn't be saved.", variant: "destructive" });
      } finally {
        setIsUploading(false);
      }
    }

    setShowSuccessOverlay(true);
    setMission((prev) => ({ ...prev, status: "pending_approval" }));
    
    // Auto-return to home after 2 seconds
    setTimeout(() => {
      navigate("/kid");
    }, 2000);
  };

  const getStatusLabel = (status: MissionStatus) => {
    switch (status) {
      case "not_started": return "Not Started";
      case "in_progress": return "In Progress";
      case "pending_approval": return "⏳ Pending Approval";
      case "completed": return "✓ Completed";
    }
  };

  const renderActionButton = () => {
    if (mission.status === "not_started") {
      return (
        <MobileButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleStartMission}
          className="h-14 rounded-3xl shadow-lg"
        >
          Start Mission 🚀
        </MobileButton>
      );
    }

    if (mission.status === "in_progress") {
      if (mission.requiresPhoto && !uploadedPhoto) {
        return (
          <MobileButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handlePhotoUpload}
            className="h-14 rounded-3xl shadow-lg"
          >
            Upload Photo 📸
          </MobileButton>
        );
      }

      return (
        <MobileButton
          variant="success"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          className="h-14 rounded-3xl shadow-lg"
        >
          Submit for Approval ✓
        </MobileButton>
      );
    }

    if (mission.status === "pending_approval") {
      return (
        <MobileButton
          variant="disabled"
          size="lg"
          fullWidth
          disabled
          className="h-14 rounded-3xl"
        >
          ⏳ Waiting for Review
        </MobileButton>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="pt-safe-top" />
        <div className="h-[60px] flex items-center justify-center px-4 relative">
          <button
            onClick={handleBack}
            className="absolute left-4 w-11 h-11 flex items-center justify-center text-primary"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display font-bold text-xl text-foreground">
            Mission Details
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-[calc(60px+env(safe-area-inset-top))] pb-[calc(96px+env(safe-area-inset-bottom))]">
        {/* Hero Section */}
        <div className="bg-gradient-primary rounded-b-3xl px-6 py-8 relative overflow-hidden">
          {/* Background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 3) * 20}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex justify-between items-start">
            <h2 className="font-display font-bold text-[28px] text-white max-w-[70%] leading-tight">
              {mission.title}
            </h2>
            <span className="px-4 py-2 rounded-full bg-white/20 text-white text-xs font-body font-semibold">
              {getStatusLabel(mission.status)}
            </span>
          </div>
        </div>

        {/* Credit Reward Card */}
        <motion.div
          className="mx-5 -mt-4 relative z-20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-gradient-gold rounded-[20px] p-6 shadow-gold relative overflow-hidden">
            {/* Sparkle effects */}
            <div className="absolute top-2 right-2">
              <Sparkles className="w-5 h-5 text-black/30" />
            </div>
            <div className="absolute bottom-2 left-2">
              <Sparkles className="w-4 h-4 text-black/20" />
            </div>
            
            {/* Confetti particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 4) * 15}%`,
                  backgroundColor: i % 2 === 0 ? "#6200E6" : "#03DAC6",
                }}
                animate={{
                  y: [0, -5, 0],
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 1.5 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="font-body text-base text-black/70 mb-1">You'll earn</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-bold text-5xl text-black">
                    {mission.creditReward.toLocaleString()}
                  </span>
                  <span className="font-display font-bold text-xl text-black">credits</span>
                </div>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CoinIcon size={60} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Task Description Card */}
        <motion.div
          className="mx-5 mt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-card rounded-[20px] p-5 border border-border">
            <h3 className="font-display font-bold text-lg text-foreground mb-3">
              What to do:
            </h3>
            <p className="font-body text-base text-foreground leading-relaxed">
              {mission.description}
            </p>
          </div>
        </motion.div>

        {/* Requirements Section */}
        {mission.requiresPhoto && (
          <motion.div
            className="mx-5 mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-background-tint rounded-2xl p-4 flex items-center gap-3">
              <Camera className="w-6 h-6 text-primary" />
              <span className="font-body text-base text-primary">
                📸 Photo proof required
              </span>
            </div>
          </motion.div>
        )}

        {/* Photo Upload Section */}
        {mission.status === "in_progress" && mission.requiresPhoto && (
          <motion.div
            className="mx-5 mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {!uploadedPhoto ? (
              <button
                onClick={handlePhotoUpload}
                className="w-full h-[200px] border-2 border-dashed border-primary rounded-[20px] bg-background-tint flex flex-col items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                <Camera className="w-12 h-12 text-primary" />
                <span className="font-body text-base text-primary">
                  Tap to take photo
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-[20px] overflow-hidden">
                  <img
                    src={uploadedPhoto}
                    alt="Uploaded proof"
                    className="w-full h-[200px] object-cover"
                  />
                </div>
                <button
                  onClick={handlePhotoUpload}
                  className="w-full text-center font-body text-sm text-primary py-2"
                >
                  Change Photo
                </button>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Fixed Action Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-5 py-5">
        {renderActionButton()}
        <div className="pb-safe-bottom" />
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[375px] rounded-t-[32px] p-6 bottom-0 top-auto translate-y-0 data-[state=open]:slide-in-from-bottom">
          <div className="flex flex-col items-center text-center">
            <motion.img
              src={loopoMascot}
              alt="Loopo mascot"
              className="w-20 h-20 object-contain mb-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-xl text-foreground">
                Submit to parent?
              </DialogTitle>
              <DialogDescription className="font-body text-sm text-muted-foreground mt-2">
                {mission.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex items-center gap-2 mt-3">
              <CoinIcon size={24} />
              <span className="font-display font-bold text-lg text-accent-gold">
                +{mission.creditReward} credits
              </span>
            </div>

            <div className="flex gap-3 w-full mt-6">
              <MobileButton
                variant="outline"
                size="default"
                fullWidth
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </MobileButton>
              <MobileButton
                variant="primary"
                size="default"
                fullWidth
                onClick={handleConfirmSubmit}
              >
                Yes, Submit!
              </MobileButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div
            className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Confetti animation */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ["#6200E6", "#FFD600", "#03DAC6", "#00C853", "#FF3D00"][i % 5],
                }}
                initial={{ top: "-10%", opacity: 1, rotate: 0 }}
                animate={{
                  top: "110%",
                  opacity: [1, 1, 0],
                  rotate: 360 * (i % 2 === 0 ? 1 : -1),
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.05,
                  ease: "easeOut",
                }}
              />
            ))}

            <motion.img
              src={loopoMascot}
              alt="Loopo celebrating"
              className="w-32 h-32 object-contain mb-6"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
            />
            
            <motion.h2
              className="font-display font-bold text-[32px] text-success mb-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              Great job! 🎉
            </motion.h2>
            
            <motion.p
              className="font-body text-base text-muted-foreground text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Your parent will review soon
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KidMissionDetail;
