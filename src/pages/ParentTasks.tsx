import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Filter, Plus, ChevronDown, ChevronUp, MoreVertical, Pencil, Copy, CheckCircle, Trash2, Coins } from "lucide-react";
import { ParentBottomNav, type TabId } from "@/components/parent";
import loopoMascot from "@/assets/loopo-mascot.png";

type TaskStatus = "not_started" | "in_progress" | "pending" | "completed";
type FilterType = "all" | "active" | "completed" | "pending";

interface Task {
  id: string;
  title: string;
  description: string;
  credits: number;
  status: TaskStatus;
  kidId: string;
  createdAt: string;
  deadline?: string;
  photoRequired: boolean;
}

interface Kid {
  id: string;
  name: string;
  avatar: string;
}

const mockKids: Kid[] = [
  { id: "1", name: "Miguel", avatar: "🧒" },
  { id: "2", name: "Sofia", avatar: "👧" },
];

const mockTasks: Task[] = [
  { id: "1", title: "Clean your room", description: "Make your bed, organize toys, and dust the shelves", credits: 500, status: "pending", kidId: "1", createdAt: "Today, 9:00 AM", deadline: "Today, 6:00 PM", photoRequired: true },
  { id: "2", title: "Do homework", description: "Complete math worksheet pages 10-15", credits: 300, status: "in_progress", kidId: "1", createdAt: "Today, 8:00 AM", photoRequired: false },
  { id: "3", title: "Walk the dog", description: "Take Max for a 15-minute walk around the block", credits: 400, status: "completed", kidId: "1", createdAt: "Yesterday", photoRequired: true },
  { id: "4", title: "Practice piano", description: "Practice scales and assigned song for 20 minutes", credits: 350, status: "not_started", kidId: "1", createdAt: "Today, 7:00 AM", photoRequired: false },
  { id: "5", title: "Set the table", description: "Put out plates, cups, and utensils for dinner", credits: 200, status: "completed", kidId: "2", createdAt: "Today, 5:00 PM", photoRequired: false },
  { id: "6", title: "Read a book", description: "Read for 15 minutes before bedtime", credits: 250, status: "in_progress", kidId: "2", createdAt: "Today, 4:00 PM", photoRequired: false },
  { id: "7", title: "Water the plants", description: "Water all indoor plants in the living room", credits: 150, status: "not_started", kidId: "2", createdAt: "Today, 3:00 PM", photoRequired: true },
];

const statusConfig: Record<TaskStatus, { label: string; bgClass: string; textClass: string }> = {
  not_started: { label: "Not Started", bgClass: "bg-muted", textClass: "text-muted-foreground" },
  in_progress: { label: "In Progress", bgClass: "bg-primary/10", textClass: "text-primary" },
  pending: { label: "Pending", bgClass: "bg-warning/10", textClass: "text-warning" },
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
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0],
    ["rgba(255, 61, 0, 0.1)", "rgba(255, 255, 255, 1)"]
  );

  const status = statusConfig[task.status];

  return (
    <div className="relative mx-5 mb-3 overflow-hidden rounded-xl">
      {/* Swipe Background */}
      <div className="absolute inset-0 flex items-center justify-end pr-4 bg-error/10 rounded-xl">
        <div className="flex gap-2">
          <div className="flex items-center justify-center w-16 h-full">
            <Pencil className="w-5 h-5 text-info" />
          </div>
          <div className="flex items-center justify-center w-16 h-full">
            <Trash2 className="w-5 h-5 text-error" />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <motion.div
        style={{ x, background }}
        drag="x"
        dragConstraints={{ left: -160, right: 0 }}
        dragElastic={0.1}
        className="relative bg-card border border-border rounded-xl p-4 shadow-sm"
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display font-bold text-base text-foreground flex-1 pr-2">
            {task.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-body ${status.bgClass} ${status.textClass}`}>
              {status.label}
            </span>
            <button
              onClick={() => onMenuClick(task)}
              className="w-8 h-8 flex items-center justify-center -mr-2"
            >
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-accent-gold" />
            <span className="font-display font-bold text-sm text-accent-gold">
              {task.credits} credits
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
            <span>{task.createdAt}</span>
            {task.deadline && (
              <>
                <span>•</span>
                <span>Due: {task.deadline}</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ParentTasks: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab] = useState<TabId>("tasks");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [expandedKids, setExpandedKids] = useState<Record<string, boolean>>({ "1": true, "2": true });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showFab, setShowFab] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Filter tasks
  const filteredTasks = mockTasks.filter((task) => {
    switch (activeFilter) {
      case "active":
        return task.status === "not_started" || task.status === "in_progress";
      case "completed":
        return task.status === "completed";
      case "pending":
        return task.status === "pending";
      default:
        return true;
    }
  });

  // Group tasks by kid
  const tasksByKid = mockKids.map((kid) => ({
    ...kid,
    tasks: filteredTasks.filter((task) => task.kidId === kid.id),
  }));

  const getFilterCount = (filter: FilterType): number => {
    switch (filter) {
      case "active":
        return mockTasks.filter((t) => t.status === "not_started" || t.status === "in_progress").length;
      case "completed":
        return mockTasks.filter((t) => t.status === "completed").length;
      case "pending":
        return mockTasks.filter((t) => t.status === "pending").length;
      default:
        return mockTasks.length;
    }
  };

  const toggleKidExpanded = (kidId: string) => {
    setExpandedKids((prev) => ({ ...prev, [kidId]: !prev[kidId] }));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setShowFab(false);
    } else {
      setShowFab(true);
    }
    setLastScrollY(currentScrollY);
  };

  const handleMenuAction = (action: string) => {
    console.log(`${action} task:`, selectedTask?.title);
    setShowMenu(false);
    setSelectedTask(null);
  };

  const hasNoTasks = filteredTasks.length === 0;

  return (
    <div className="min-h-screen bg-card flex flex-col">
      {/* Top Bar */}
      <div className="bg-card sticky top-0 z-20">
        <div className="h-[60px] flex items-center justify-between px-5 pt-safe">
          <div className="w-11" />
          <h1 className="font-display font-bold text-2xl text-foreground">Tasks</h1>
          <button className="w-11 h-11 flex items-center justify-center">
            <Filter className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="px-5 py-3 border-b border-border overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex-shrink-0 h-9 px-4 rounded-full font-body text-sm transition-all duration-200
                  ${activeFilter === filter.id
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-card border border-border text-muted-foreground"
                  }`}
              >
                {filter.label} ({getFilterCount(filter.id)})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div
        className="flex-1 overflow-y-auto pb-32"
        onScroll={handleScroll}
      >
        {hasNoTasks ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
            <motion.img
              src={loopoMascot}
              alt="Loopo mascot"
              className="w-[120px] h-[120px] object-contain mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
            />
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              No tasks here!
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center mb-6">
              {activeFilter === "all"
                ? "Create your first task to get started"
                : `No ${activeFilter} tasks found`}
            </p>
            <button
              onClick={() => navigate("/parent/add-task")}
              className="h-12 px-8 rounded-full bg-gradient-primary text-primary-foreground
                font-display font-bold text-base shadow-lg shadow-primary/30
                transition-all duration-200 active:scale-95"
            >
              Create Task
            </button>
          </div>
        ) : (
          /* Task List by Kid */
          <div className="py-4">
            {tasksByKid.map((kid) => (
              <div key={kid.id} className="mb-4">
                {/* Kid Section Header */}
                <button
                  onClick={() => toggleKidExpanded(kid.id)}
                  className="w-full sticky top-0 z-10 bg-background-tint px-5 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{kid.avatar}</span>
                    <span className="font-display font-bold text-base text-foreground">
                      {kid.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-card border border-border font-body text-xs text-muted-foreground">
                      {kid.tasks.length} task{kid.tasks.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {expandedKids[kid.id] ? (
                    <ChevronUp className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-primary" />
                  )}
                </button>

                {/* Tasks */}
                <AnimatePresence>
                  {expandedKids[kid.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {kid.tasks.length === 0 ? (
                        <p className="px-5 py-4 font-body text-sm text-muted-foreground">
                          No tasks for {kid.name}
                        </p>
                      ) : (
                        <div className="pt-2">
                          {kid.tasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onMenuClick={(t) => {
                                setSelectedTask(t);
                                setShowMenu(true);
                              }}
                            />
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

      {/* Floating Action Button */}
      <AnimatePresence>
        {showFab && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={() => navigate("/parent/add-task")}
            className="fixed bottom-24 right-5 w-[60px] h-[60px] rounded-full
              bg-gradient-primary shadow-lg shadow-primary/30
              flex items-center justify-center z-30
              active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6 text-primary-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <ParentBottomNav activeTab={activeTab} />

      {/* Task Menu Bottom Sheet */}
      <AnimatePresence>
        {showMenu && selectedTask && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50"
            >
              <div className="max-w-md mx-auto p-6 pb-safe">
                <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
                
                <h3 className="font-display font-bold text-lg text-foreground mb-4 text-center">
                  {selectedTask.title}
                </h3>

                <div className="space-y-2">
                  <button
                    onClick={() => handleMenuAction("edit")}
                    className="w-full h-14 flex items-center gap-4 px-4 rounded-xl
                      hover:bg-muted/50 transition-colors"
                  >
                    <Pencil className="w-5 h-5 text-foreground" />
                    <span className="font-body text-base text-foreground">Edit Task</span>
                  </button>

                  <button
                    onClick={() => handleMenuAction("duplicate")}
                    className="w-full h-14 flex items-center gap-4 px-4 rounded-xl
                      hover:bg-muted/50 transition-colors"
                  >
                    <Copy className="w-5 h-5 text-foreground" />
                    <span className="font-body text-base text-foreground">Duplicate Task</span>
                  </button>

                  <button
                    onClick={() => handleMenuAction("complete")}
                    className="w-full h-14 flex items-center gap-4 px-4 rounded-xl
                      hover:bg-muted/50 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="font-body text-base text-foreground">Mark as Complete</span>
                  </button>

                  <button
                    onClick={() => handleMenuAction("delete")}
                    className="w-full h-14 flex items-center gap-4 px-4 rounded-xl
                      hover:bg-error/10 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-error" />
                    <span className="font-body text-base text-error">Delete Task</span>
                  </button>

                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full h-14 flex items-center justify-center rounded-xl
                      border border-border mt-2"
                  >
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
