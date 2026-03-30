import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Pencil, Coins, Calendar, Clock, Camera,
  CheckCircle, Trash2, Repeat, X, ZoomIn, History, Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/mobile/EmptyState";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type TaskStatus = "not_started" | "in_progress" | "pending" | "completed";

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  credits_reward: number;
  status: string;
  kid_id: string;
  family_id: string;
  created_at: string | null;
  deadline: string | null;
  photo_required: boolean | null;
  photo_url: string | null;
  kid_note: string | null;
  parent_note: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  updated_at: string | null;
}

interface KidData {
  name: string;
  avatar: string;
}

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string }> = {
  not_started: { label: "Not Started", bg: "bg-muted", text: "text-muted-foreground" },
  in_progress: { label: "In Progress", bg: "bg-primary/10", text: "text-primary" },
  pending: { label: "Pending Approval", bg: "bg-accent-gold/15", text: "text-accent-gold" },
  completed: { label: "Completed", bg: "bg-success/10", text: "text-success" },
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return null;
  try {
    return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return dateStr;
  }
};

const ParentTaskDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [task, setTask] = useState<TaskData | null>(null);
  const [kid, setKid] = useState<KidData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [signedPhotoUrl, setSignedPhotoUrl] = useState<string | null>(null);

  const [showApproveSheet, setShowApproveSheet] = useState(false);
  const [showDenySheet, setShowDenySheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [approveMessage, setApproveMessage] = useState("");
  const [denyFeedback, setDenyFeedback] = useState("");
  const [denyError, setDenyError] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCredits, setEditCredits] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) { setNotFound(true); setIsLoading(false); return; }

      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (taskError || !taskData) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setTask(taskData as TaskData);

      // Generate signed URL for photo if stored as a path
      if (taskData.photo_url) {
        const { data: signedData } = await supabase.storage
          .from("task-photos")
          .createSignedUrl(taskData.photo_url, 3600);
        if (signedData?.signedUrl) {
          setSignedPhotoUrl(signedData.signedUrl);
        }
      }

      const { data: kidData } = await supabase
        .from("kids")
        .select("name, avatar")
        .eq("id", taskData.kid_id)
        .maybeSingle();

      setKid(kidData || { name: "Unknown", avatar: "👤" });
      setIsLoading(false);
    };

    fetchTask();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (notFound || !task || !kid) {
    return (
      <div className="min-h-screen bg-muted flex flex-col">
        <div className="bg-card sticky top-0 z-20" style={{ paddingTop: "env(safe-area-inset-top)" }}>
          <div className="h-[60px] flex items-center px-5">
            <button onClick={() => navigate(-1)} className="w-11 h-11 flex items-center justify-center">
              <ArrowLeft className="w-6 h-6 text-primary" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            title="Task not found"
            description="This task may have been deleted or doesn't exist."
            actionLabel="Go Back"
            onAction={() => navigate(-1)}
          />
        </div>
      </div>
    );
  }

  const taskStatus = (task.status as TaskStatus) || "not_started";
  const status = statusConfig[taskStatus] || statusConfig.not_started;
  const canEdit = taskStatus !== "completed" && taskStatus !== "pending";

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      // Update task status
      const { error: taskError } = await supabase
        .from("tasks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          parent_note: approveMessage || null,
        })
        .eq("id", task.id);

      if (taskError) throw taskError;

      // Fetch current balance and increment
      const { data: kidData, error: kidFetchError } = await supabase
        .from("kids")
        .select("credits_balance")
        .eq("id", task.kid_id)
        .maybeSingle();

      if (kidFetchError) throw kidFetchError;

      const currentBalance = kidData?.credits_balance || 0;
      const { error: creditError } = await supabase
        .from("kids")
        .update({ credits_balance: currentBalance + task.credits_reward })
        .eq("id", task.kid_id);

      if (creditError) throw creditError;

      setShowApproveSheet(false);
      toast({ title: `Task approved! ${kid.name} earned ${task.credits_reward} credits 🎉` });
      setTimeout(() => navigate(-1), 800);
    } catch (err) {
      console.error("Approve error:", err);
      toast({ title: "Failed to approve task. Please try again.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!denyFeedback.trim()) { setDenyError(true); return; }
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "not_started",
          parent_note: denyFeedback,
        })
        .eq("id", task.id);

      if (error) throw error;

      setShowDenySheet(false);
      toast({ title: `Feedback sent to ${kid.name}` });
      setTimeout(() => navigate(-1), 800);
    } catch (err) {
      console.error("Deny error:", err);
      toast({ title: "Failed to send feedback. Please try again.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", task.id);

      if (error) throw error;

      setShowDeleteDialog(false);
      toast({ title: "Task deleted" });
      setTimeout(() => navigate(-1), 500);
    } catch (err) {
      console.error("Delete error:", err);
      toast({ title: "Failed to delete task. Please try again.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
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
            <span className="text-2xl">{kid.avatar}</span>
            <div>
              <p className="font-body text-xs text-muted-foreground">Assigned to:</p>
              <p className="font-display font-bold text-base text-primary">{kid.name}</p>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="mx-5 mt-5 bg-card rounded-2xl p-5 shadow-sm space-y-4">
          {/* Description */}
          {task.description && (
            <div>
              <p className="font-display font-bold text-base text-foreground mb-1">What to do:</p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Reward */}
          <div className="flex items-center gap-2">
            <p className="font-display font-bold text-base text-foreground">Reward:</p>
            <Coins className="w-6 h-6 text-accent-gold" />
            <span className="font-display font-bold text-lg text-accent-gold">{task.credits_reward} credits</span>
          </div>

          {/* Created */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-body text-sm text-muted-foreground">Created:</span>
            <span className="font-body text-sm text-foreground">{formatDate(task.created_at) || "Unknown"}</span>
          </div>

          {/* Deadline */}
          {task.deadline && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-accent-gold" />
              <span className="font-body text-sm text-muted-foreground">Due:</span>
              <span className="font-body text-sm text-accent-gold">{formatDate(task.deadline)}</span>
            </div>
          )}

          {/* Photo requirement */}
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="font-body text-sm text-muted-foreground">
              Photo proof: {task.photo_required ? "Required" : "Not required"}
            </span>
            {task.photo_required && <Camera className="w-5 h-5 text-primary" />}
          </div>
        </div>

        {/* Photo Section */}
        {signedPhotoUrl && (
          <div className="mx-5 mt-5 bg-card rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-bold text-lg text-foreground">📸 Photo Submitted</p>
              {task.submitted_at && (
                <span className="font-body text-xs text-muted-foreground">{formatDate(task.submitted_at)}</span>
              )}
            </div>
            <button onClick={() => setShowPhotoModal(true)} className="relative w-full rounded-xl overflow-hidden">
              <img src={signedPhotoUrl} alt="Submitted proof" className="w-full h-[200px] object-cover rounded-xl" />
              <div className="absolute top-3 right-3 w-8 h-8 bg-card/80 rounded-full flex items-center justify-center">
                <ZoomIn className="w-4 h-4 text-foreground" />
              </div>
            </button>

            {task.kid_note && (
              <div className="mt-3 bg-background-tint rounded-xl p-4">
                <p className="font-display font-bold text-sm text-primary mb-1">Note from {kid.name}:</p>
                <p className="font-body text-sm text-muted-foreground">{task.kid_note}</p>
              </div>
            )}
          </div>
        )}

        {/* Kid note without photo */}
        {!signedPhotoUrl && task.kid_note && (
          <div className="mx-5 mt-5 bg-card rounded-2xl p-5 shadow-sm">
            <div className="bg-background-tint rounded-xl p-4">
              <p className="font-display font-bold text-sm text-primary mb-1">Note from {kid.name}:</p>
              <p className="font-body text-sm text-muted-foreground">{task.kid_note}</p>
            </div>
          </div>
        )}

        {/* Completed info */}
        {taskStatus === "completed" && (
          <div className="mx-5 mt-5 bg-success/10 rounded-2xl p-5">
            <p className="font-display font-bold text-base text-success mb-2">✅ Task Completed</p>
            {task.completed_at && <p className="font-body text-sm text-muted-foreground">Completed: {formatDate(task.completed_at)}</p>}
            <p className="font-body text-sm text-muted-foreground">Credits awarded: {task.credits_reward}</p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="px-5 py-4">
          {taskStatus === "pending" && (
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

          {(taskStatus === "not_started" || taskStatus === "in_progress") && (
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

          {taskStatus === "completed" && (
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
                  <span className="font-body text-sm text-accent-gold">{kid.name} will earn {task.credits_reward} credits</span>
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
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex-1 h-[52px] rounded-2xl bg-success font-display font-bold text-base text-success-foreground disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Approve Task
                  </button>
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
                <p className="font-body text-xs text-accent-gold text-center mb-5">{kid.name} won't earn credits for this task</p>

                <label className="font-body text-sm text-muted-foreground mb-1 block">
                  Tell {kid.name} what needs improvement <span className="text-error">*</span>
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
                    disabled={!denyFeedback.trim() || actionLoading}
                    className="flex-1 h-[52px] rounded-2xl bg-error font-display font-bold text-base text-error-foreground disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
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
                <p className="font-body text-xs text-accent-gold text-center mb-5">{kid.name} will be notified</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteDialog(false)} className="flex-1 h-[48px] rounded-2xl border border-border font-body text-sm text-muted-foreground">Cancel</button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex-1 h-[48px] rounded-2xl bg-error font-display font-bold text-sm text-error-foreground disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full Photo Modal */}
      <AnimatePresence>
        {showPhotoModal && signedPhotoUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-50 flex flex-col">
            <button onClick={() => setShowPhotoModal(false)} className="absolute top-4 right-4 z-10 w-11 h-11 bg-card/20 rounded-full flex items-center justify-center" style={{ marginTop: "env(safe-area-inset-top)" }}>
              <X className="w-6 h-6 text-card" />
            </button>
            <div className="flex-1 flex items-center justify-center p-4">
              <img src={signedPhotoUrl} alt="Full photo" className="max-w-full max-h-full object-contain rounded-xl" />
            </div>
            {taskStatus === "pending" && (
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
