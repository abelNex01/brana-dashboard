import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { lazy, Suspense, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/layouts/Navbar";
import { Sidebar } from "@/layouts/Sidebar";
import { Footer } from "@/layouts/Footer";
import { DashboardProvider, useDashboard } from "@/hooks/use-dashboard";
import { NotificationPanel } from "@/components/NotificationPanel";
import { AnimatePresence } from "framer-motion";
import { SmallScreenOverlay } from "@/components/SmallScreenOverlay";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { TeamProvider } from "@/contexts/TeamContext";
import { GearProvider } from "@/contexts/GearContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Lazy-loaded pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const GearEquipmentPage = lazy(() => import("@/pages/GearEquipmentPage"));
const TeamPage = lazy(() => import("@/pages/TeamPage"));
const SchedulePage = lazy(() => import("@/pages/SchedulePage"));
const WalletPage = lazy(() => import("@/pages/WalletPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

/** Shared layout shell used by all routes */
function AppShellContent({ children }: { children: React.ReactNode }) {
  const { isNotificationOpen } = useDashboard();
  return (
    <div
      className="min-h-dvh min-h-screen text-foreground flex items-center justify-center p-3 relative overflow-hidden"
      style={{ backgroundColor: "var(--canvas)" }}
    >
      <SmallScreenOverlay />
      <div
        className="w-full max-w-[1850px] rounded-3xl border border-primary/20 shadow-[0_0_30px_rgba(0,255,127,0.05)] overflow-hidden flex flex-row relative z-10 bg-card"
        style={{ height: "calc(100vh - 24px)" }}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Navbar />
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
          <Footer />
        </div>
        <AnimatePresence>
          {isNotificationOpen && <NotificationPanel />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <AppShellContent>{children}</AppShellContent>
    </DashboardProvider>
  );
}

/** Guard: redirects unauthenticated users to /auth */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/auth" />;
  return <>{children}</>;
}

/** Guard: redirects authenticated users away from /auth */
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Redirect to="/" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Suspense fallback={<PageTransitionLoader />}>
      <Switch>
        <Route path="/auth">
          <GuestOnly>
            <AuthPage />
          </GuestOnly>
        </Route>
        <Route path="/">
          <RequireAuth>
            <AppShell>
              <Dashboard />
            </AppShell>
          </RequireAuth>
        </Route>
        <Route path="/dashboard/gears">
          <RequireAuth>
            <AppShell>
              <GearEquipmentPage />
            </AppShell>
          </RequireAuth>
        </Route>
        <Route path="/dashboard/team">
          <RequireAuth>
            <AppShell>
              <TeamPage />
            </AppShell>
          </RequireAuth>
        </Route>
        <Route path="/dashboard/schedule">
          <RequireAuth>
            <AppShell>
              <SchedulePage />
            </AppShell>
          </RequireAuth>
        </Route>
        <Route path="/dashboard/wallet">
          <RequireAuth>
            <AppShell>
              <WalletPage />
            </AppShell>
          </RequireAuth>
        </Route>
        <Route path="/dashboard/messages">
          <RequireAuth>
            <AppShell>
              <ChatPage />
            </AppShell>
          </RequireAuth>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="brana-theme-preference"
      disableTransitionOnChange
      enableSystem={false}
    >
      <TooltipProvider>
        <AuthProvider>
          <FinanceProvider>
            <TeamProvider>
              <GearProvider>
                <ChatProvider>{children}</ChatProvider>
              </GearProvider>
            </TeamProvider>
          </FinanceProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

function App() {
  const [isBootComplete, setIsBootComplete] = useState(false);

  return (
    <ErrorBoundary>
      <AppProviders>
        {!isBootComplete && (
          <LoadingScreen onComplete={() => setIsBootComplete(true)} />
        )}
        <div
          aria-hidden={!isBootComplete}
          className={!isBootComplete ? "pointer-events-none" : undefined}
        >
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </div>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
