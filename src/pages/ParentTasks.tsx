import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Plus, ChevronDown, ChevronUp, MoreVertical, Pencil, Copy, CheckCircle, Trash2, Coins, Loader2 } from "lucide-react";
import { ParentBottomNav, type TabId } from "@/components/parent";
import { supabase } from "@/integrations/supabase/client";
import { resolveAvatar } from "@/lib/avatars";
import { toast } from "@/hooks/use-toast";
import loopoMascot from "@/assets/loopo-mascot.png";

type TaskStatus = "not_started" | "in_progress" | "pending" | "completed";
type FilterType = "all" | "active" | "completed" | "pending";

interface Task {
  id: string;
  title: string;
  description: string | null;
  credits_reward: number;
  status: string;
  kid_id: string;
  created_at: string | null;
  deadline: string | null;
  photo_required: boolean | null;
}

interface Kid {
  id: string;
  name: string;
  avatar: string;
}

const statusConfig: Record<string, { label: string; bgClass: string; textClass: string }> = {
  not_started: { label: "Not Started", bgClass: "bg-muted", textClass: "text-muted-foreground" },
  in_progress: { label: "In Progress", bgClass: "bg-primary/10", textClass: "text-primary" },
  pending: { label: "Pending", bgClass: "bg-warning/10", textClass: "text-warning" },
  pending_approval: { label: "Pending", bgClass: "bg-warning/10", textClass: "text-warning" },
  completed: { label: "Completed", bgClass: "bg-success/10", textClass: "text-success" },
};

const filterOptions: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
];

interface TaskCardProps {
  task: Task;
  onMenuClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onMenuClick }) => {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const background = useTransform(x, [-100, 0], ["rgba(255, 61, 0, 0.1)", "rgba(255, 255, 255, 1)"]);
  const status = statusConfig[task.status] || statusConfig.not_started;

  const formattedDate = task.created_at
    ? new Date(task.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  return (
    <div className="relative mx-5 mb-3 overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex items-center justify-end pr-4 bg-error/10 rounded-xl">
        <div className="flex gap-2">
          <div className="flex items-center justify-center w-16 h-full"><Pencil className="w-5 h-5 text-info" /></div>
          <div className="flex items-center justify-center w-16 h-full"><Trash2 className="w-5 h-5 text-error" /></div>
        </div>
      </div>
      <motion.div
        style={{ x, background }}
        drag="x"
        dragConstraints={{ left: -160, right: 0 }}
        dragElastic={0.1}
        onClick={() => navigate(`/parent/tasks/${task.id}`)}
        className="relative bg-card border border-border rounded-xl p-4 shadow-sm cursor-pointer"
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display font-bold text-base text-foreground flex-1 pr-2">{task.title}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-body ${status.bgClass} ${status.textClass}`}>{status.label}</span>
            <button onClick={(e) => { e.stopPropagation(); onMenuClick(task); }} className="w-8 h-8 flex items-center justify-center -mr-2">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        {task.description && (
          <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-accent-gold" />
            <span className="font-display font-bold text-sm text-accent-gold">{task.credits_reward} credits</span>
          </div>
          <span className="text-xs font-body text-muted-foreground">{formattedDate}</span>
        </div>
      </motion.div>
    </div>
  );
};

const ParentTasks: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab] = useState<TabId>("tasks");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [expandedKids, setExpandedKids] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showFab, setShowFab] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: family } = await supabase
        .from("families").select("id").eq("parent_id", user.id).maybeSingle();
      if (!family) return;
      setFamilyId(family.id);

      const [kidsRes, tasksRes] = await Promise.all([
        supabase.from("kids").select("id, name, avatar").eq("family_id", family.id),
        supabase.from("tasks").select("id, title, description, credits_reward, status, kid_id, created_at, deadline, photo_required")
          .eq("family_id", family.id).order("created_at", { ascending: false }),
      ]);

      const kidsData = kidsRes.data || [];
      setKids(kidsData);
      setTasks(tasksRes.data || []);

      // Auto-expand all kids
      const expanded: Record<string, boolean> = {};
      kidsData.forEach((k) => { expanded[k.id] = true; });
      setExpandedKids(expanded);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    switch (activeFilter) {
      case "active": return task.status === "not_started" || task.status === "in_progress";
      case "completed": return task.status === "completed";
      case "pending": return task.status === "pending" || task.status === "pending_approval";
      default: return true;
    }
  });

  const tasksByKid = kids.map((kid) => ({
    ...kid,
    tasks: filteredTasks.filter((task) => task.kid_id === kid.id),
  }));

  const getFilterCount = (filter: FilterType): number => {
    switch (filter) {
      case "active": return tasks.filter((t) => t.status === "not_started" || t.status === "in_progress").length;
      case "completed": return tasks.filter((t) => t.status === "completed").length;
      case "pending": return tasks.filter((t) => t.status === "pending" || t.status === "pending_approval").length;
      default: return tasks.length;
    }
  };

  const toggleKidExpanded = (kidId: string) => {
    setExpandedKids((prev) => ({ ...prev, [kidId]: !prev[kidId] }));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    setShowFab(!(currentScrollY > lastScrollY && currentScrollY > 100));
    setLastScrollY(currentScrollY);
  };

  const handleMenuAction = async (action: string) => {
    if (!selectedTask) return;

    if (action === "delete") {
      const { error } = await supabase.from("tasks").delete().eq("id", selectedTask.id);
      if (!error) {
        toast({ title: "Task deleted", className: "bg-success text-success-foreground border-none" });
        fetchData();
      }
    } else if (action === "complete") {
      const { error } = await supabase.from("tasks").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", selectedTask.id);
      if (!error) {
        toast({ title: "Task marked complete ✓", className: "bg-success text-success-foreground border-none" });
        fetchData();
      }
    } else if (action === "duplicate" && familyId) {
      const { error } = await supabase.from("tasks").insert({
        family_id: familyId,
        kid_id: selectedTask.kid_id,
        title: selectedTask.title,
        description: selectedTask.description,
        credits_reward: selectedTask.credits_reward,
        status: "not_started",
        photo_required: selectedTask.photo_required,
        deadline: selectedTask.deadline,
      });
      if (!error) {
        toast({ title: "Task duplicated", className: "bg-success text-success-foreground border-none" });
        fetchData();
      }
    }

    setShowMenu(false);
    setSelectedTask(null);
  };

  const pendingCount = tasks.filter((t) => t.status === "pending" || t.status === "pending_approval").length;
  const hasNoTasks = filteredTasks.length === 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card flex flex-col">
      {/* Top Bar */}
      <div className="bg-card sticky top-0 z-20">
        <div className="h-[60px] flex items-center justify-center px-5 pt-safe">
          <h1 className="font-display font-bold text-2xl text-foreground">Tasks</h1>
        </div>
        <div className="px-5 py-3 border-b border-border overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex-shrink-0 h-9 px-4 rounded-full font-body text-sm transition-all duration-200
                  ${activeFilter === filter.id ? "bg-primary text-primary-foreground font-bold" : "bg-card border border-border text-muted-foreground"}`}
              >
                {filter.label} ({getFilterCount(filter.id)})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pb-32" onScroll={handleScroll}>
        {hasNoTasks ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
            <motion.img src={loopoMascot} alt="Loopo mascot" className="w-[120px] h-[120px] object-contain mb-6"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 15 }} />
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">No tasks here!</h2>
            <p className="font-body text-sm text-muted-foreground text-center mb-6">
              {activeFilter === "all" ? "Create your first task to get started" : `No ${activeFilter} tasks found`}
            </p>
            <button onClick={() => navigate("/parent/add-task")}
              className="h-12 px-8 rounded-full bg-gradient-primary text-primary-foreground font-display font-bold text-base shadow-lg shadow-primary/30 transition-all duration-200 active:scale-95">
              Create Task
            </button>
          </div>
        ) : (
          <div className="py-4">
            {tasksByKid.map((kid) => (
              <div key={kid.id} className="mb-4">
                <button onClick={() => toggleKidExpanded(kid.id)}
                  className="w-full sticky top-0 z-10 bg-background-tint px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{kid.avatar}</span>
                    <span className="font-display font-bold text-base text-foreground">{kid.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-card border border-border font-body text-xs text-muted-foreground">
                      {kid.tasks.length} task{kid.tasks.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {expandedKids[kid.id] ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-primary" />}
                </button>
                <AnimatePresence>
                  {expandedKids[kid.id] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      {kid.tasks.length === 0 ? (
                        <p className="px-5 py-4 font-body text-sm text-muted-foreground">No tasks for {kid.name}</p>
                      ) : (
                        <div className="pt-2">
                          {kid.tasks.map((task) => (
                            <TaskCard key={task.id} task={task} onMenuClick={(t) => { setSelectedTask(t); setShowMenu(true); }} />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <AnimatePresence>
        {showFab && (
          <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }} onClick={() => navigate("/parent/add-task")}
            className="fixed bottom-24 right-5 w-[60px] h-[60px] rounded-full bg-gradient-primary shadow-lg shadow-primary/30 flex items-center justify-center z-30 active:scale-95 transition-transform">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      <ParentBottomNav activeTab={activeTab} pendingCount={pendingCount} />

      {/* Task Menu Bottom Sheet */}
      <AnimatePresence>
        {showMenu && selectedTask && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowMenu(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50">
              <div className="max-w-md mx-auto p-6 pb-safe">
                <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg text-foreground mb-4 text-center">{selectedTask.title}</h3>
                <div className="space-y-2">
                  <button onClick={() => handleMenuAction("edit")} className="w-full h-14 flex items-center gap-4 px-4 rounded-xl hover:bg-muted/50 transition-colors">
                    <Pencil className="w-5 h-5 text-foreground" /><span className="font-body text-base text-foreground">Edit Task</span>
                  </button>
                  <button onClick={() => handleMenuAction("duplicate")} className="w-full h-14 flex items-center gap-4 px-4 rounded-xl hover:bg-muted/50 transition-colors">
                    <Copy className="w-5 h-5 text-foreground" /><span className="font-body text-base text-foreground">Duplicate Task</span>
                  </button>
                  <button onClick={() => handleMenuAction("complete")} className="w-full h-14 flex items-center gap-4 px-4 rounded-xl hover:bg-muted/50 transition-colors">
                    <CheckCircle className="w-5 h-5 text-success" /><span className="font-body text-base text-foreground">Mark as Complete</span>
                  </button>
                  <button onClick={() => handleMenuAction("delete")} className="w-full h-14 flex items-center gap-4 px-4 rounded-xl hover:bg-error/10 transition-colors">
                    <Trash2 className="w-5 h-5 text-error" /><span className="font-body text-base text-error">Delete Task</span>
                  </button>
                  <button onClick={() => setShowMenu(false)} className="w-full h-14 flex items-center justify-center rounded-xl border border-border mt-2">
                    <span className="font-body text-base text-muted-foreground">Cancel</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentTasks;
