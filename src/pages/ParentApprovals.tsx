import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ArrowLeft, Filter, ZoomIn, X, Check, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoinIcon } from "@/components/mobile";
import { MobileButton } from "@/components/mobile/MobileButton";
import { MobileInput } from "@/components/mobile/MobileInput";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import loopoMascot from "@/assets/loopo-mascot.png";

interface PendingTask {
  id: string;
  kidName: string;
  kidAvatar: string;
  taskTitle: string;
  credits: number;
  timeAgo: string;
  photoUrl?: string;
}

// Mock data
const mockPendingTasks: PendingTask[] = [
  {
    id: "1",
    kidName: "Miguel",
    kidAvatar: "🧒",
    taskTitle: "Clean your room",
    credits: 500,
    timeAgo: "2 min ago",
    photoUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    kidName: "Sofia",
    kidAvatar: "👧",
    taskTitle: "Do homework",
    credits: 300,
    timeAgo: "15 min ago",
    photoUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    kidName: "Miguel",
    kidAvatar: "🧒",
    taskTitle: "Walk the dog",
    credits: 400,
    timeAgo: "1 hour ago",
    photoUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
  },
];

const ParentApprovals: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<PendingTask[]>(mockPendingTasks);
  const [selectedTask, setSelectedTask] = useState<PendingTask | null>(null);
  const [approveSheetOpen, setApproveSheetOpen] = useState(false);
  const [denySheetOpen, setDenySheetOpen] = useState(false);
  const [fullPhotoOpen, setFullPhotoOpen] = useState(false);
  const [fullPhotoUrl, setFullPhotoUrl] = useState("");
  const [approveMessage, setApproveMessage] = useState("");
  const [denyMessage, setDenyMessage] = useState("");
  const [swipingTaskId, setSwipingTaskId] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const handleBack = () => {
    navigate(-1);
  };

  const handleFilter = () => {
    console.log("Filter clicked");
  };

  const handlePhotoTap = (photoUrl: string) => {
    setFullPhotoUrl(photoUrl);
    setFullPhotoOpen(true);
  };

  const handleApproveClick = (task: PendingTask) => {
    setSelectedTask(task);
    setApproveMessage("");
    setApproveSheetOpen(true);
  };

  const handleDenyClick = (task: PendingTask) => {
    setSelectedTask(task);
    setDenyMessage("");
    setDenySheetOpen(true);
  };

  const confirmApprove = () => {
    if (!selectedTask) return;
    
    // Remove task with animation
    setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
    setApproveSheetOpen(false);
    
    // Show success toast
    toast({
      title: `Task approved! ${selectedTask.kidName} earned ${selectedTask.credits} credits 🎉`,
      className: "bg-success text-success-foreground font-display",
    });
    
    setSelectedTask(null);
  };

  const confirmDeny = () => {
    if (!selectedTask || denyMessage.trim().length === 0) return;
    
    // Remove task
    setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
    setDenySheetOpen(false);
    
    toast({
      title: `Feedback sent to ${selectedTask.kidName}`,
      className: "bg-muted text-foreground font-display",
    });
    
    setSelectedTask(null);
    setDenyMessage("");
  };

  const handleSwipe = (task: PendingTask, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swipe right - approve
      handleApproveClick(task);
    } else if (info.offset.x < -threshold) {
      // Swipe left - deny
      handleDenyClick(task);
    }
    
    setSwipingTaskId(null);
    setSwipeDirection(null);
  };

  const handleSwipeUpdate = (taskId: string, info: PanInfo) => {
    setSwipingTaskId(taskId);
    if (info.offset.x > 50) {
      setSwipeDirection("right");
    } else if (info.offset.x < -50) {
      setSwipeDirection("left");
    } else {
      setSwipeDirection(null);
    }
  };

  return (
    <div className="min-h-screen bg-background-tint">
      <div className="mx-auto max-w-md min-h-screen relative">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-50 bg-card flex items-center justify-between px-4"
          style={{
            paddingTop: "max(env(safe-area-inset-top), 12px)",
            height: "calc(60px + max(env(safe-area-inset-top), 12px))",
          }}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>

          <h1 className="font-display font-bold text-xl text-foreground">
            Pending Approvals
          </h1>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFilter}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <Filter className="w-6 h-6 text-foreground" />
          </motion.button>
        </header>

        {/* Main Content */}
        <main className="pb-8">
          {tasks.length > 0 ? (
            <>
              {/* Summary Card */}
              <div className="mx-5 mt-5">
                <div className="bg-background-tint rounded-2xl p-4 flex gap-3 overflow-hidden">
                  {/* Purple accent bar */}
                  <div className="w-1 bg-primary rounded-full flex-shrink-0" />
                  <div>
                    <p className="font-display font-bold text-base text-foreground">
                      {tasks.length} task{tasks.length !== 1 ? "s" : ""} waiting for your review
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Tap any task to review
                    </p>
                  </div>
                </div>
              </div>

              {/* Task Cards List */}
              <div className="mt-6 space-y-3 px-3">
                <AnimatePresence mode="popLayout">
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -300, transition: { duration: 0.3 } }}
                      className="relative"
                    >
                      {/* Swipe Background Indicators */}
                      <div className="absolute inset-0 rounded-[20px] overflow-hidden">
                        <div
                          className={cn(
                            "absolute inset-0 bg-success transition-opacity duration-200",
                            swipingTaskId === task.id && swipeDirection === "right"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div
                          className={cn(
                            "absolute inset-0 bg-error transition-opacity duration-200",
                            swipingTaskId === task.id && swipeDirection === "left"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </div>

                      {/* Task Card */}
                      <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDrag={(_, info) => handleSwipeUpdate(task.id, info)}
                        onDragEnd={(_, info) => handleSwipe(task, info)}
                        className="bg-card rounded-[20px] border border-border p-5 shadow-soft relative"
                      >
                        {/* Top Section - Avatar & Time */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                              {task.kidAvatar}
                            </div>
                            <span className="font-display font-bold text-base text-foreground">
                              {task.kidName}
                            </span>
                          </div>
                          <span className="font-body text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {task.timeAgo}
                          </span>
                        </div>

                        {/* Middle Section - Task & Credits */}
                        <div className="mb-4">
                          <h3 className="font-display font-bold text-lg text-foreground mb-1">
                            {task.taskTitle}
                          </h3>
                          <div className="flex items-center gap-2">
                            <CoinIcon size={20} />
                            <span className="font-body text-sm text-accent-gold font-semibold">
                              {task.credits} credits
                            </span>
                          </div>
                        </div>

                        {/* Photo Preview */}
                        {task.photoUrl && (
                          <motion.div
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePhotoTap(task.photoUrl!)}
                            className="relative mb-4 cursor-pointer"
                          >
                            <img
                              src={task.photoUrl}
                              alt="Task proof"
                              className="w-full h-40 object-cover rounded-2xl"
                            />
                            <div className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <ZoomIn className="w-4 h-4 text-foreground" />
                            </div>
                          </motion.div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDenyClick(task)}
                            className="flex-1 h-11 rounded-xl border-2 border-error bg-transparent font-display font-bold text-sm text-error transition-colors hover:bg-error/10"
                          >
                            Deny
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApproveClick(task)}
                            className="flex-1 h-11 rounded-xl bg-success font-display font-bold text-sm text-success-foreground transition-colors hover:bg-success/90"
                          >
                            Approve ✓
                          </motion.button>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-8">
              <motion.img
                src={loopoMascot}
                alt="Loopo mascot"
                className="w-40 h-40 object-contain mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                All caught up! 🎉
              </h2>
              <p className="font-body text-sm text-muted-foreground text-center">
                No tasks waiting for approval
              </p>
            </div>
          )}
        </main>

        {/* Approve Bottom Sheet */}
        <Sheet open={approveSheetOpen} onOpenChange={setApproveSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-[32px] px-6 pt-6 pb-8">
            <SheetHeader className="mb-6">
              <SheetTitle className="font-display font-bold text-2xl text-foreground text-center">
                Approve Task?
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4">
              {selectedTask && (
                <div className="bg-background-tint rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                    {selectedTask.kidAvatar}
                  </div>
                  <div>
                    <p className="font-display font-bold text-base text-foreground">
                      {selectedTask.taskTitle}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <CoinIcon size={16} />
                      <span className="font-body text-sm text-accent-gold font-semibold">
                        +{selectedTask.credits} credits
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <MobileInput
                placeholder="Add encouraging message (optional)"
                value={approveMessage}
                onChange={(e) => setApproveMessage(e.target.value)}
              />

              <MobileButton
                variant="success"
                fullWidth
                onClick={confirmApprove}
                className="mt-4"
              >
                <Check className="w-5 h-5 mr-2" />
                Approve Task
              </MobileButton>

              <button
                onClick={() => setApproveSheetOpen(false)}
                className="w-full py-3 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Deny Bottom Sheet */}
        <Sheet open={denySheetOpen} onOpenChange={setDenySheetOpen}>
          <SheetContent side="bottom" className="rounded-t-[32px] px-6 pt-6 pb-8">
            <SheetHeader className="mb-6">
              <SheetTitle className="font-display font-bold text-2xl text-foreground text-center">
                Deny Task?
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4">
              {selectedTask && (
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-2 block">
                    Tell {selectedTask.kidName} what needs improvement
                  </label>
                  <textarea
                    placeholder="Example: Please also organize the bookshelf"
                    value={denyMessage}
                    onChange={(e) => setDenyMessage(e.target.value.slice(0, 200))}
                    className={cn(
                      "w-full h-24 rounded-2xl border-2 border-input bg-card px-4 py-3",
                      "font-body text-base text-foreground resize-none",
                      "placeholder:text-muted-foreground",
                      "transition-all duration-200",
                      "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
                    )}
                  />
                  <p className="text-right font-body text-xs text-muted-foreground mt-1">
                    {denyMessage.length}/200
                  </p>
                </div>
              )}

              <MobileButton
                variant="primary"
                fullWidth
                onClick={confirmDeny}
                disabled={denyMessage.trim().length === 0}
                className="mt-2 !bg-error hover:!bg-error/90"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Feedback
              </MobileButton>

              <button
                onClick={() => setDenySheetOpen(false)}
                className="w-full py-3 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Full Photo Modal */}
        <AnimatePresence>
          {fullPhotoOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
              onClick={() => setFullPhotoOpen(false)}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setFullPhotoOpen(false)}
                className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-card/20 backdrop-blur-sm z-10"
                style={{ marginTop: "env(safe-area-inset-top)" }}
              >
                <X className="w-6 h-6 text-card" />
              </motion.button>

              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                src={fullPhotoUrl}
                alt="Full size photo"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Bottom Actions in Photo View */}
              <div
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
                style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
              >
                <div className="flex gap-3 max-w-md mx-auto">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullPhotoOpen(false);
                      const task = tasks.find(t => t.photoUrl === fullPhotoUrl);
                      if (task) handleDenyClick(task);
                    }}
                    className="flex-1 h-12 rounded-xl border-2 border-error bg-error/20 font-display font-bold text-sm text-card transition-colors"
                  >
                    Deny
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullPhotoOpen(false);
                      const task = tasks.find(t => t.photoUrl === fullPhotoUrl);
                      if (task) handleApproveClick(task);
                    }}
                    className="flex-1 h-12 rounded-xl bg-success font-display font-bold text-sm text-success-foreground transition-colors"
                  >
                    Approve ✓
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ParentApprovals;
