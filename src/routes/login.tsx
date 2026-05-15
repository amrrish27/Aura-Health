import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created — signing you in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen grid lg:grid-cols-2">
      <div className="absolute top-4 right-4 z-30"><ThemeToggle /></div>
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-accent/30 to-coral/15" />
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl float-anim" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-coral/20 blur-3xl float-anim" style={{ animationDelay: "2s" }} />
        <div className="flex items-center gap-2 fade-in">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground glow-anim">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-xl">Aurex</span>
        </div>
        <div className="slide-up">
          <h1 className="font-display text-5xl leading-tight">
            Your body whispers
            <br />
            <em className="not-italic gradient-text">before it shouts.</em>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-md">
            Sign in to see your personal pre-symptomatic risk index, predicted
            health events, and a daily prevention plan.
          </p>
        </div>
        <p className="text-xs text-muted-foreground fade-in">MVP demo — not a medical device.</p>
      </div>

      <div className="flex items-center justify-center p-4 sm:p-6 scale-in">
        <div className="w-full max-w-sm glass rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 lg:hidden mb-4">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground glow-anim">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-xl tracking-wide">AUREX</span>
          </div>
          <h2 className="font-display text-3xl tracking-tight">
            Welcome to <span className="gradient-text">AUREX</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in or create an account to continue.
          </p>

          <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="mt-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4">
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" disabled={busy} className="btn-gradient w-full rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50">
                  {busy ? "Signing in…" : "Sign in"}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
                </div>
                <div>
                  <Label htmlFor="email2">Email</Label>
                  <Input id="email2" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="password2">Password</Label>
                  <Input id="password2" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <button type="submit" disabled={busy} className="btn-gradient w-full rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50">
                  {busy ? "Creating account…" : "Create account"}
                </button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={google}
            disabled={busy}
            className="hover-lift w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.97 6.97 0 0 1 5.47 12c0-.73.13-1.44.36-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
