import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, OAuthCallbackHandler } from "@/contexts/AuthContext";
import loopoLogo from "@/assets/loopo-logo.png";

import HomePage from "./pages/HomePage";
import ParentAuthChoice from "./pages/ParentAuthChoice";
import ParentLogin from "./pages/ParentLogin";
import ParentSignup from "./pages/ParentSignup";
import KidLogin from "./pages/KidLogin";
import ParentDashboard from "./pages/ParentDashboard";
import ParentApprovals from "./pages/ParentApprovals";
import ParentRewards from "./pages/ParentRewards";
import ParentAddTask from "./pages/ParentAddTask";
import ParentTasks from "./pages/ParentTasks";
import ParentTaskDetail from "./pages/ParentTaskDetail";
import KidDashboard from "./pages/KidDashboard";
import KidMissions from "./pages/KidMissions";
import KidMissionDetail from "./pages/KidMissionDetail";
import KidMarketplace from "./pages/KidMarketplace";
import KidMyRewards from "./pages/KidMyRewards";
import KidExtraChores from "./pages/KidExtraChores";
import KidWishlist from "./pages/KidWishlist";
import KidOnboarding from "./pages/KidOnboarding";
import KidDeals from "./pages/KidDeals";
import ParentDeals from "./pages/ParentDeals";
import ParentSettings from "./pages/ParentSettings";
import ParentFamilyInfo from "./pages/ParentFamilyInfo";
import ParentCreditSettings from "./pages/ParentCreditSettings";
import ParentFirstMission from "./pages/ParentFirstMission";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Splash screen while auth initializes
const SplashScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
    <img src={loopoLogo} alt="Loopo" className="w-32 h-32 object-contain animate-pulse" />
  </div>
);

// Wraps all routes — shows splash until auth check completes
const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useAuth();
  if (isLoading) return <SplashScreen />;
  return <>{children}</>;
};

// Redirects authenticated users away from Home Page
const AuthAwareHomePage = () => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={user.role === "parent" ? "/parent" : "/kid"} replace />;
  }
  return <HomePage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OAuthCallbackHandler />
          <AuthGate>
            <Routes>
              <Route path="/" element={<AuthAwareHomePage />} />
              <Route path="/home" element={<AuthAwareHomePage />} />
              <Route path="/parent-auth" element={<ParentAuthChoice />} />
              <Route path="/parent-login" element={<ParentLogin />} />
              <Route path="/signup" element={<ParentSignup />} />
              <Route path="/kid-login" element={<KidLogin />} />
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/parent/approvals" element={<ParentApprovals />} />
              <Route path="/parent/rewards" element={<ParentRewards />} />
              <Route path="/parent/add-task" element={<ParentAddTask />} />
              <Route path="/parent/tasks" element={<ParentTasks />} />
              <Route path="/parent/tasks/:id" element={<ParentTaskDetail />} />
              <Route path="/parent/settings" element={<ParentSettings />} />
              <Route path="/parent/settings/family" element={<ParentFamilyInfo />} />
              <Route path="/parent/settings/credits" element={<ParentCreditSettings />} />
              <Route path="/kid" element={<KidDashboard />} />
              <Route path="/kid/missions" element={<KidMissions />} />
              <Route path="/kid/mission/:id" element={<KidMissionDetail />} />
              <Route path="/kid/shop" element={<KidMarketplace />} />
              <Route path="/kid/rewards" element={<KidMyRewards />} />
              <Route path="/kid/deals" element={<KidDeals />} />
              <Route path="/parent/deals" element={<ParentDeals />} />
              <Route path="/kid/extra-chores" element={<KidExtraChores />} />
              <Route path="/kid/wishlist" element={<KidWishlist />} />
              <Route path="/kid/onboarding" element={<KidOnboarding />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthGate>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
