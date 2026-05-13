import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Sparkles, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileButton } from "@/components/mobile";
import { EmptyState } from "@/components/mobile";
import { CoinIcon } from "@/components/mobile/CreditDisplay";
import loopoMascot from "@/assets/loopo-mascot.png";
import loopoGoodJob from "@/assets/loopo-good-job.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type TaskStatus = "not_started" | "in_progress" | "pending" | "completed" | "denied";

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  credits_reward: number;
  status: TaskStatus;
  photo_required: boolean;
  photo_url: string | null;
  family_id: string;
  kid_id: string;
  parent_note: string | null;
}

const KidMissionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [task, setTask] = React.useState<TaskData | null>(null);
  const [isLoadingTask, setIsLoadingTask] = React.useState(true);
  const [uploadedPhoto, setUploadedPhoto] = React.useState<string | null>(null);
  const [photoUploaded, setPhotoUploaded] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = React.useState(false);
  const [uploadedFilePath, setUploadedFilePath] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch task from Supabase
  React.useEffect(() => {
    if (!id) return;
    const fetchTask = async () => {
      setIsLoadingTask(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Failed to load task:", error);
        setTask(null);
      } else {
        setTask({
          id: data.id,
          title: data.title,
          description: data.description,
          credits_reward: data.credits_reward,
          status: data.status as TaskStatus,
          photo_required: data.photo_required ?? false,
          photo_url: data.photo_url,
          family_id: data.family_id,
          kid_id: data.kid_id,
          parent_note: data.parent_note ?? null,
        });
      }
      setIsLoadingTask(false);
    };
    void fetchTask();
  }, [id]);

  const handleBack = () => {
    if (uploadedPhoto && task?.status === "in_progress") {
      if (window.confirm("Are you sure? Your photo will be lost.")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const handleStartMission = async () => {
    if (!task) return;
    const { error } = await supabase
      .from("tasks")
      .update({ status: "in_progress" })
      .eq("id", task.id);

    if (error) {
      toast({ title: "Failed to start mission", variant: "destructive" });
      return;
    }
    setTask((prev) => prev ? { ...prev, status: "in_progress" } : prev);
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !task || !user?.kidId) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage immediately
    setIsUploading(true);
    setPhotoUploaded(false);

    const filePath = `${task.family_id}/${user.kidId}/${task.id}.jpg`;
    try {
      const { error } = await supabase.storage
        .from("task-photos")
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error("Photo upload failed:", JSON.stringify(error, null, 2));
        toast({ title: "Photo upload failed", description: error.message, variant: "destructive" });
        setPhotoUploaded(false);
      } else {
        setPhotoUploaded(true);
        setUploadedFilePath(filePath);
      }
    } catch (err: any) {
      console.error("Photo upload exception:", err);
      toast({ title: "Photo upload failed", description: "Please try again.", variant: "destructive" });
      setPhotoUploaded(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);
    if (!task) return;

    try {
      const updateData: Record<string, any> = {
        status: "pending",
        submitted_at: new Date().toISOString(),
      };

      if (uploadedFilePath) {
        updateData.photo_url = uploadedFilePath;
      }

      const { error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", task.id);

      if (error) {
        console.error("Task submission failed:", error);
        toast({ title: "Submission failed", description: error.message, variant: "destructive" });
        return;
      }

      setShowSuccessOverlay(true);
      setTask((prev) => prev ? { ...prev, status: "pending" } : prev);

      setTimeout(() => {
        navigate("/kid");
      }, 2000);
    } catch (err) {
      console.error("Task submission exception:", err);
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "not_started": return "Not Started";
      case "in_progress": return "In Progress";
      case "pending": return "Pending Approval";
      case "completed": return "Completed";
      case "denied": return "Try Again";
    }
  };

  const handleRetry = async () => {
    if (!task) return;
    const { error } = await supabase
      .from("tasks")
      .update({ status: "in_progress", parent_note: null })
      .eq("id", task.id);

    if (error) {
      toast({ title: "Something went wrong", variant: "destructive" });
      return;
    }
    setTask((prev) => prev ? { ...prev, status: "in_progress", parent_note: null } : prev);
  };

  const renderActionButton = () => {
    if (!task) return null;

    if (task.status === "not_started") {
      return (
        <MobileButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleStartMission}
          className="h-14 rounded-3xl shadow-lg"
        >
          Start Mission
        </MobileButton>
      );
    }

    if (task.status === "in_progress") {
      if (!task.photo_required) {
        // No photo needed — submit directly
        return (
          <MobileButton
            variant="success"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            className="h-14 rounded-3xl shadow-lg"
          >
            Mark Complete
          </MobileButton>
        );
      }

      if (!uploadedPhoto) {
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

      // Photo selected — submit only if upload succeeded
      return (
        <MobileButton
          variant="success"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          disabled={!photoUploaded || isUploading}
          className="h-14 rounded-3xl shadow-lg"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Uploading…
            </span>
          ) : !photoUploaded ? (
            "Upload failed — tap photo to retry"
          ) : (
            "Submit for Approval"
          )}
        </MobileButton>
      );
    }

    if (task.status === "pending") {
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

    if (task.status === "completed") {
      return (
        <MobileButton
          variant="disabled"
          size="lg"
          fullWidth
          disabled
          className="h-14 rounded-3xl"
        >
          <Check className="w-5 h-5 mr-2" /> Completed
        </MobileButton>
      );
    }

    return null;
  };

  // Loading state
  if (isLoadingTask) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Task not found
  if (!task) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <EmptyState
          title="Mission not found"
          description="This mission may have been removed."
        />
        <MobileButton variant="primary" onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </MobileButton>
      </div>
    );
  }

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
              {task.title}
            </h2>
            <span className="px-4 py-2 rounded-full bg-white/20 text-white text-xs font-body font-semibold">
              {getStatusLabel(task.status)}
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
            <div className="absolute top-2 right-2">
              <Sparkles className="w-5 h-5 text-black/30" />
            </div>
            <div className="absolute bottom-2 left-2">
              <Sparkles className="w-4 h-4 text-black/20" />
            </div>

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
                    {task.credits_reward.toLocaleString()}
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
              {task.description || "Complete this mission!"}
            </p>
          </div>
        </motion.div>

        {/* Parent Denial Feedback */}
        {task.status === "not_started" && task.parent_note && (
          <motion.div
            className="mx-5 mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-2xl p-4">
              <p className="font-display font-bold text-sm text-accent-gold mb-1">💬 Feedback from your parent:</p>
              <p className="font-body text-sm text-foreground leading-relaxed">{task.parent_note}</p>
            </div>
          </motion.div>
        )}

        {/* Requirements Section */}
        {task.photo_required && (
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
        {task.status === "in_progress" && task.photo_required && (
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
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 animate-spin text-white" />
                    </div>
                  )}
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
                {task.title}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2 mt-3">
              <CoinIcon size={24} />
              <span className="font-display font-bold text-lg text-accent-gold">
                +{task.credits_reward} credits
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
