import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import RoleSelection from "./pages/RoleSelection";
import ParentSignup from "./pages/ParentSignup";
import KidLogin from "./pages/KidLogin";
import ParentDashboard from "./pages/ParentDashboard";
import ParentApprovals from "./pages/ParentApprovals";
import ParentAddTask from "./pages/ParentAddTask";
import ParentTasks from "./pages/ParentTasks";
import ParentTaskDetail from "./pages/ParentTaskDetail";
import KidDashboard from "./pages/KidDashboard";
import KidMissionDetail from "./pages/KidMissionDetail";
import KidMarketplace from "./pages/KidMarketplace";
import KidMyRewards from "./pages/KidMyRewards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Redirects authenticated users away from Role Selection
const AuthAwareRoleSelection = () => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={user.role === "parent" ? "/parent" : "/kid"} replace />;
  }
  return <RoleSelection />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthAwareRoleSelection />} />
            <Route path="/signup" element={<ParentSignup />} />
            <Route path="/kid-login" element={<KidLogin />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/parent/approvals" element={<ParentApprovals />} />
            <Route path="/parent/add-task" element={<ParentAddTask />} />
            <Route path="/parent/tasks" element={<ParentTasks />} />
            <Route path="/parent/tasks/:id" element={<ParentTaskDetail />} />
            <Route path="/kid" element={<KidDashboard />} />
            <Route path="/kid/mission/:id" element={<KidMissionDetail />} />
            <Route path="/kid/shop" element={<KidMarketplace />} />
            <Route path="/kid/rewards" element={<KidMyRewards />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
