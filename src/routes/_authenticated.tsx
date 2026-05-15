import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [checkingOnboard, setCheckingOnboard] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", user.id)
        .maybeSingle();
      if (cancel) return;
      if (!data?.onboarded && path !== "/onboarding") {
        navigate({ to: "/onboarding" });
      }
      setCheckingOnboard(false);
    })();
    return () => {
      cancel = true;
    };
  }, [user, path, navigate]);

  if (loading || !user || checkingOnboard) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const titleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/predictions": "Predicted health events",
    "/prevention": "Prevention plan",
    "/alerts": "Health alerts",
    "/connect": "Wearable connections",
    "/subscription": "Subscription",
    "/onboarding": "Welcome",
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-20 h-14 flex items-center gap-3 border-b border-border/60 glass px-4">
            <SidebarTrigger />
            <h1 className="font-display text-lg truncate">{titleMap[path] ?? "Aurex"}</h1>
            <div className="ml-auto"><ThemeToggle /></div>
          </header>
          <main className="flex-1 overflow-auto fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
