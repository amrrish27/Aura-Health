import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Watch, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/connect")({
  component: ConnectPage,
});

function ConnectPage() {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("google_fit_connected")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setConnected(!!data?.google_fit_connected);
        setLoading(false);
      });
  }, [user]);

  const toggle = async (next: boolean) => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ google_fit_connected: next })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error("Could not update connection");
      return;
    }
    setConnected(next);
    toast.success(next ? "Google Fit connected — syncing data" : "Google Fit disconnected");
  };

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-6">
      <div>
        <h2 className="font-display text-3xl">Wearable connections</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Link your wearable so Aurex can analyze your real biosignals.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Watch className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">Google Fit</h3>
              {connected && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success" style={{ color: "var(--success)" }}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Syncs steps, sleep, heart rate, and HRV from your Android phone or
              Wear OS device.
            </p>

            {loading ? (
              <div className="mt-5 text-xs text-muted-foreground">Loading…</div>
            ) : connected ? (
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => toast.success("Synced — pulled latest 7 days")}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  <RefreshCw className="h-4 w-4" /> Sync now
                </button>
                <button
                  onClick={() => toggle(false)}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => toggle(true)}
                disabled={busy}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Watch className="h-4 w-4" />}
                Connect Google Fit
              </button>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              MVP: this is a simulated connection. Real Google Fit OAuth requires
              a Google Cloud project + per-user authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
