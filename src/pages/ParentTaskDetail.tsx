import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Pencil, Coins, Calendar, Clock, Camera,
  CheckCircle, Trash2, Repeat, X, ZoomIn, History
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type TaskStatus = "not_started" | "in_progress" | "pending" | "completed";

interface Task {
  id: string;
  title: string;
  description: string;
  credits: number;
  status: TaskStatus;
  kidId: string;
  kidName: string;
  kidAvatar: string;
  kidEmoji: string;
  createdAt: string;
  deadline?: string;
  photoRequired: boolean;
  recurring?: string;
  submittedPhoto?: string;
  submittedNote?: string;
  submittedAt?: string;
  completedAt?: string;
  approvedAt?: string;
}

const mockTasks: Record<string, Task> = {
  "1": {
    id: "1", title: "Clean your room",
    description: "Organize toys neatly in the toy box, make bed with fresh sheets, dust the shelves, and vacuum the floor.",
    credits: 500, status: "pending", kidId: "1", kidName: "Miguel", kidAvatar: "🧒", kidEmoji: "🎮",
    createdAt: "Today, 9:00 AM", deadline: "Today, 6:00 PM", photoRequired: true,
    submittedPhoto: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop",
    submittedNote: "All done! I even organized my books!", submittedAt: "10 minutes ago",
  },
  "2": {
    id: "2", title: "Do homework",
    description: "Complete math worksheet pages 10-15.",
    credits: 300, status: "in_progress", kidId: "1", kidName: "Miguel", kidAvatar: "🧒", kidEmoji: "🎮",
    createdAt: "Today, 8:00 AM", photoRequired: false,
  },
  "3": {
    id: "3", title: "Walk the dog",
    description: "Take Max for a 15-minute walk around the block.",
    credits: 400, status: "completed", kidId: "1", kidName: "Miguel", kidAvatar: "🧒", kidEmoji: "🎮",
    createdAt: "Yesterday", photoRequired: true, completedAt: "Yesterday, 5:30 PM", approvedAt: "Yesterday, 6:00 PM",
  },
  "4": {
    id: "4", title: "Practice piano",
    description: "Practice scales and assigned song for 20 minutes.",
    credits: 350, status: "not_started", kidId: "1", kidName: "Miguel", kidAvatar: "🧒", kidEmoji: "🎮",
    createdAt: "Today, 7:00 AM", photoRequired: false, recurring: "Weekly",
  },
  "5": {
    id: "5", title: "Set the table",
    description: "Put out plates, cups, and utensils for dinner.",
    credits: 200, status: "completed", kidId: "2", kidName: "Sofia", kidAvatar: "👧", kidEmoji: "🎨",
    createdAt: "Today, 5:00 PM", photoRequired: false, completedAt: "Today, 5:45 PM", approvedAt: "Today, 6:00 PM",
  },
  "6": {
    id: "6", title: "Read a book",
    description: "Read for 15 minutes before bedtime.",
    credits: 250, status: "in_progress", kidId: "2", kidName: "Sofia", kidAvatar: "👧", kidEmoji: "🎨",
    createdAt: "Today, 4:00 PM", photoRequired: false, deadline: "Today, 9:00 PM",
  },
  "7": {
    id: "7", title: "Water the plants",
    description: "Water all indoor plants in the living room.",
    credits: 150, status: "not_started", kidId: "2", kidName: "Sofia", kidAvatar: "👧", kidEmoji: "🎨",
    createdAt: "Today, 3:00 PM", photoRequired: true,
  },
};

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string }> = {
  not_started: { label: "Not Started", bg: "bg-muted", text: "text-muted-foreground" },
  in_progress: { label: "In Progress", bg: "bg-primary/10", text: "text-primary" },
  pending: { label: "Pending Approval", bg: "bg-accent-gold/15", text: "text-accent-gold" },
  completed: { label: "Completed", bg: "bg-success/10", text: "text-success" },
};

const ParentTaskDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const task = mockTasks[id || "1"];

  const [showApproveSheet, setShowApproveSheet] = useState(false);
  const [showDenySheet, setShowDenySheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [approveMessage, setApproveMessage] = useState("");
  const [denyFeedback, setDenyFeedback] = useState("");
  const [denyError, setDenyError] = useState(false);

  if (!task) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <p className="font-body text-muted-foreground">Task not found</p>
      </div>
    );
  }

  const status = statusConfig[task.status];
  const canEdit = task.status !== "completed" && task.status !== "pending";

  const handleApprove = () => {
    setShowApproveSheet(false);
    toast({ title: `Task approved! ${task.kidName} earned ${task.credits} credits 🎉` });
    setTimeout(() => navigate(-1), 800);
  };

  const handleDeny = () => {
    if (!denyFeedback.trim()) { setDenyError(true); return; }
    setShowDenySheet(false);
    toast({ title: `Feedback sent to ${task.kidName}` });
    setTimeout(() => navigate(-1), 800);
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    toast({ title: "Task deleted" });
    setTimeout(() => navigate(-1), 500);
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Top Bar */}
      <div className="bg-card sticky top-0 z-20" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="h-[60px] flex items-center justify-between px-5">
          <button onClick={() => navigate(-1)} className="w-11 h-11 flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="font-display font-bold text-xl text-foreground">Task Details</h1>
          {canEdit ? (
            <button className="w-11 h-11 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-primary" />
            </button>
          ) : <div className="w-11" />}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-36">
        {/* Task Header Card */}
        <div className="mx-5 mt-5 bg-card rounded-[20px] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <h2 className="font-display font-bold text-2xl text-foreground flex-1 pr-3">{task.title}</h2>
            <span className={`px-3 py-1.5 rounded-full text-xs font-body font-bold whitespace-nowrap ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Assigned Kid */}
        <div className="mx-5 mt-4 bg-background-tint rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{task.kidAvatar}</span>
            <div>
              <p className="font-body text-xs text-muted-foreground">Assigned to:</p>
              <p className="font-display font-bold text-base text-primary">{task.kidName}</p>
            </div>
          </div>
          <span className="text-2xl">{task.kidEmoji}</span>
        </div>

        {/* Details Card */}
        <div className="mx-5 mt-5 bg-card rounded-2xl p-5 shadow-sm space-y-4">
          {/* Description */}
          <div>
            <p className="font-display font-bold text-base text-foreground mb-1">What to do:</p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{task.description}</p>
          </div>

          {/* Reward */}
          <div className="flex items-center gap-2">
            <p className="font-display font-bold text-base text-foreground">Reward:</p>
            <Coins className="w-6 h-6 text-accent-gold" />
            <span className="font-display font-bold text-lg text-accent-gold">{task.credits} credits</span>
          </div>

          {/* Created */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-body text-sm text-muted-foreground">Created:</span>
            <span className="font-body text-sm text-foreground">{task.createdAt}</span>
          </div>

          {/* Deadline */}
          {task.deadline && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-accent-gold" />
              <span className="font-body text-sm text-muted-foreground">Due:</span>
              <span className="font-body text-sm text-accent-gold">{task.deadline}</span>
            </div>
          )}

          {/* Photo requirement */}
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="font-body text-sm text-muted-foreground">
              Photo proof: {task.photoRequired ? "Required" : "Not required"}
            </span>
            {task.photoRequired && <Camera className="w-5 h-5 text-primary" />}
          </div>

          {/* Recurring */}
          {task.recurring && (
            <div className="flex items-center gap-3">
              <Repeat className="w-5 h-5 text-primary" />
              <span className="font-body text-sm text-primary">Repeats: {task.recurring}</span>
            </div>
          )}
        </div>

        {/* Photo Section */}
        {task.submittedPhoto && (
          <div className="mx-5 mt-5 bg-card rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-bold text-lg text-foreground">📸 Photo Submitted</p>
              {task.submittedAt && (
                <span className="font-body text-xs text-muted-foreground">Submitted {task.submittedAt}</span>
              )}
            </div>
            <button onClick={() => setShowPhotoModal(true)} className="relative w-full rounded-xl overflow-hidden">
              <img src={task.submittedPhoto} alt="Submitted proof" className="w-full h-[200px] object-cover rounded-xl" />
              <div className="absolute top-3 right-3 w-8 h-8 bg-card/80 rounded-full flex items-center justify-center">
                <ZoomIn className="w-4 h-4 text-foreground" />
              </div>
            </button>

            {task.submittedNote && (
              <div className="mt-3 bg-background-tint rounded-xl p-4">
                <p className="font-display font-bold text-sm text-primary mb-1">Note from {task.kidName}:</p>
                <p className="font-body text-sm text-muted-foreground">{task.submittedNote}</p>
              </div>
            )}
          </div>
        )}

        {/* Completed info */}
        {task.status === "completed" && (
          <div className="mx-5 mt-5 bg-success/10 rounded-2xl p-5">
            <p className="font-display font-bold text-base text-success mb-2">✅ Task Completed</p>
            {task.completedAt && <p className="font-body text-sm text-muted-foreground">Completed: {task.completedAt}</p>}
            {task.approvedAt && <p className="font-body text-sm text-muted-foreground">Approved: {task.approvedAt}</p>}
            <p className="font-body text-sm text-muted-foreground">Credits awarded: {task.credits}</p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="px-5 py-4">
          {task.status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowDenySheet(true)}
                className="flex-1 h-[52px] rounded-2xl border-2 border-error font-display font-bold text-base text-error active:scale-95 transition-transform"
              >
                Deny
              </button>
              <button
                onClick={() => setShowApproveSheet(true)}
                className="flex-1 h-[52px] rounded-2xl bg-success font-display font-bold text-base text-success-foreground shadow-lg active:scale-95 transition-transform"
              >
                Approve ✓
              </button>
            </div>
          )}

          {(task.status === "not_started" || task.status === "in_progress") && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex-1 h-12 rounded-2xl border-2 border-error font-display font-bold text-sm text-error active:scale-95 transition-transform"
              >
                Delete
              </button>
              <button className="flex-1 h-12 rounded-2xl bg-gradient-primary font-display font-bold text-sm text-primary-foreground shadow-button active:scale-95 transition-transform">
                Edit Task
              </button>
            </div>
          )}

          {task.status === "completed" && (
            <button className="w-full h-11 rounded-xl border border-border font-body text-sm text-muted-foreground">
              <History className="w-4 h-4 inline mr-2" />View Task History
            </button>
          )}
        </div>
      </div>

      {/* ---- MODALS / SHEETS ---- */}

      {/* Approve Sheet */}
      <AnimatePresence>
        {showApproveSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowApproveSheet(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50">
              <div className="p-6" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}>
                <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
                <h3 className="font-display font-bold text-2xl text-foreground text-center mb-2">Approve Task?</h3>
                <p className="font-body text-sm text-muted-foreground text-center mb-1">{task.title}</p>
                <div className="flex items-center justify-center gap-2 mb-5">
                  <Coins className="w-5 h-5 text-accent-gold" />
                  <span className="font-body text-sm text-accent-gold">{task.kidName} will earn {task.credits} credits</span>
                </div>

                <label className="font-body text-xs text-muted-foreground mb-1 block">Add encouraging message (optional)</label>
                <input
                  value={approveMessage}
                  onChange={(e) => setApproveMessage(e.target.value)}
                  placeholder="Great job! Keep it up 🌟"
                  className="w-full h-[52px] px-4 rounded-xl border border-border bg-card font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary mb-5"
                />

                <div className="flex gap-2">
                  <button onClick={() => setShowApproveSheet(false)} className="flex-1 h-[52px] rounded-2xl border border-border font-body text-sm text-muted-foreground">Cancel</button>
                  <button onClick={handleApprove} className="flex-1 h-[52px] rounded-2xl bg-success font-display font-bold text-base text-success-foreground">Approve Task</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deny Sheet */}
      <AnimatePresence>
        {showDenySheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDenySheet(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50">
              <div className="p-6" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}>
                <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
                <h3 className="font-display font-bold text-2xl text-foreground text-center mb-2">Deny Task?</h3>
                <p className="font-body text-xs text-accent-gold text-center mb-5">{task.kidName} won't earn credits for this task</p>

                <label className="font-body text-sm text-muted-foreground mb-1 block">
                  Tell {task.kidName} what needs improvement <span className="text-error">*</span>
                </label>
                <textarea
                  value={denyFeedback}
                  onChange={(e) => { setDenyFeedback(e.target.value); setDenyError(false); }}
                  maxLength={200}
                  placeholder="Please organize the bookshelf too and make sure your bed is made properly"
                  className={`w-full h-[100px] px-4 py-3 rounded-xl border bg-card font-body text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary ${denyError ? "border-error" : "border-border"}`}
                />
                <div className="flex justify-between mt-1 mb-4">
                  {denyError && <span className="font-body text-xs text-error">Feedback required</span>}
                  <span className="font-body text-xs text-muted-foreground ml-auto">{denyFeedback.length}/200</span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setShowDenySheet(false)} className="flex-1 h-[52px] rounded-2xl border border-border font-body text-sm text-muted-foreground">Cancel</button>
                  <button
                    onClick={handleDeny}
                    disabled={!denyFeedback.trim()}
                    className="flex-1 h-[52px] rounded-2xl bg-error font-display font-bold text-base text-error-foreground disabled:opacity-50"
                  >
                    Send Feedback
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteDialog(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-8">
              <div className="bg-card rounded-3xl p-6 w-full max-w-sm shadow-lg">
                <h3 className="font-display font-bold text-xl text-foreground text-center mb-2">Delete Task?</h3>
                <p className="font-body text-sm text-muted-foreground text-center mb-1">This will permanently delete '{task.title}'</p>
                <p className="font-body text-xs text-accent-gold text-center mb-5">{task.kidName} will be notified</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteDialog(false)} className="flex-1 h-[48px] rounded-2xl border border-border font-body text-sm text-muted-foreground">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 h-[48px] rounded-2xl bg-error font-display font-bold text-sm text-error-foreground">Delete</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full Photo Modal */}
      <AnimatePresence>
        {showPhotoModal && task.submittedPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-50 flex flex-col">
            <button onClick={() => setShowPhotoModal(false)} className="absolute top-4 right-4 z-10 w-11 h-11 bg-card/20 rounded-full flex items-center justify-center" style={{ marginTop: "env(safe-area-inset-top)" }}>
              <X className="w-6 h-6 text-card" />
            </button>
            <div className="flex-1 flex items-center justify-center p-4">
              <img src={task.submittedPhoto} alt="Full photo" className="max-w-full max-h-full object-contain rounded-xl" />
            </div>
            {task.status === "pending" && (
              <div className="px-5 pb-5 flex gap-2" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}>
                <button onClick={() => { setShowPhotoModal(false); setShowDenySheet(true); }} className="flex-1 h-[52px] rounded-2xl border-2 border-error font-display font-bold text-base text-error">Deny</button>
                <button onClick={() => { setShowPhotoModal(false); setShowApproveSheet(true); }} className="flex-1 h-[52px] rounded-2xl bg-success font-display font-bold text-base text-success-foreground">Approve ✓</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentTaskDetail;
