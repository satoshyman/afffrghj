import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Referrals from "@/pages/Referrals";
import Wallet from "@/pages/Wallet";
import Tasks from "@/pages/Tasks";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/not-found";
import { BottomNav } from "@/components/BottomNav";
import { AdminPanel } from "@/pages/Admin";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

function MainLayout() {
  const { data: user, isLoading, isError } = useUser();
  const [location, setLocation] = useLocation();
  const [showAdmin, setShowAdmin] = useState(false);
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  useEffect(() => {
    if (!isLoading && !user && location !== "/onboarding") {
      setLocation("/onboarding");
    }
  }, [user, isLoading, location, setLocation]);

  const handleSecretTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapTime > 2000) {
      setSecretTapCount(1);
    } else {
      setSecretTapCount(prev => prev + 1);
    }
    setLastTapTime(now);

    if (secretTapCount >= 8) {
      setShowAdmin(true);
      setSecretTapCount(0);
    }
  }, [secretTapCount, lastTapTime]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (location === "/onboarding") {
    return <Onboarding />;
  }

  return (
    <>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      <div 
        className="fixed top-0 left-0 w-12 h-12 z-[99] opacity-0"
        onClick={handleSecretTap}
      />
      <main className="pb-20">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/referrals" component={Referrals} />
          <Route path="/wallet" component={Wallet} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <MainLayout />
    </QueryClientProvider>
  );
}

export default App;
