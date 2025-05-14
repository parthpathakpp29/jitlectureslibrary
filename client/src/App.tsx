import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import BranchView from "@/pages/BranchView";
import Login from "@/pages/login";
import { useAuth } from "@/hooks/useAuth";

// Protected route component
function ProtectedRoute({ component: Component, isProfessorOnly = false }) {
  const [, setLocation] = useLocation();
  const { user, isLoading, isProfessor } = useAuth();
  
  // If still loading auth state, show nothing yet
  if (isLoading) return null;
  
  // If not authenticated, redirect to login
  if (!user) {
    setLocation("/login");
    return null;
  }
  
  // If professor-only route but user is not a professor
  if (isProfessorOnly && !isProfessor) {
    setLocation("/");
    return null;
  }
  
  // User is authenticated and has appropriate role
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/branch/:branchCode" component={BranchView} />
      <Route path="/branch/:branchCode/semester/:semesterNumber" component={BranchView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
