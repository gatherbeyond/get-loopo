import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import ParentSignup from "./pages/ParentSignup";
import ParentDashboard from "./pages/ParentDashboard";
import ParentApprovals from "./pages/ParentApprovals";
import ParentAddTask from "./pages/ParentAddTask";
import ParentTasks from "./pages/ParentTasks";
import KidDashboard from "./pages/KidDashboard";
import KidMissionDetail from "./pages/KidMissionDetail";
import KidMarketplace from "./pages/KidMarketplace";
import KidMyRewards from "./pages/KidMyRewards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/signup" element={<ParentSignup />} />
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/parent/approvals" element={<ParentApprovals />} />
          <Route path="/parent/add-task" element={<ParentAddTask />} />
          <Route path="/parent/tasks" element={<ParentTasks />} />
          <Route path="/kid" element={<KidDashboard />} />
          <Route path="/kid/mission/:id" element={<KidMissionDetail />} />
          <Route path="/kid/shop" element={<KidMarketplace />} />
          <Route path="/kid/rewards" element={<KidMyRewards />} />
          <Route path="/home" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
