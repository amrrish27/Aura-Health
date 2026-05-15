import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Brain,
  Sparkles,
  Bell,
  Watch,
  CreditCard,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useMemo } from "react";
import { generateWeek, computeRisk } from "@/lib/health-data";
import { deriveAlerts } from "@/lib/alerts";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Predictions", url: "/predictions", icon: Brain },
  { title: "Prevention", url: "/prevention", icon: Sparkles },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Google Fit", url: "/connect", icon: Watch },
  { title: "Subscription", url: "/subscription", icon: CreditCard },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();

  const alertCount = useMemo(() => deriveAlerts(computeRisk(generateWeek(1))).length, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-lg">Aurex</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Health Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={path === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.title === "Alerts" && alertCount > 0 && (
                        <span className="ml-auto rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          {alertCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-2">
          <p className="text-xs text-muted-foreground truncate" title={user?.email ?? ""}>
            {user?.email}
          </p>
          <button
            onClick={() => signOut()}
            className="mt-2 inline-flex w-full items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-xs hover:bg-muted"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
