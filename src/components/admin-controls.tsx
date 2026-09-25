"use client";
import { useState } from "react";
import { resetTrivia } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function SyncButton() {
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sync(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "x-sync-secret": secret },
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setError(result.error || "Sync failed. Please try again.");
        return;
      }
      setOpen(false);
      setSecret("");
      alert(`Sync completed: ${result.stored} merged PR(s) imported.`);
    } catch {
      setError("Could not reach the sync service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="outline" className="mt-3" onClick={() => setOpen(true)}>Sync now</Button>
      <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setError(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync GitHub contributions</DialogTitle>
            <DialogDescription>Enter the sync secret to import eligible merged pull requests from watched repositories.</DialogDescription>
          </DialogHeader>
          <form onSubmit={sync} className="grid gap-4">
            <Input autoFocus type="password" autoComplete="current-password" aria-label="Sync secret" placeholder="Sync secret" value={secret} onChange={(event) => setSecret(event.target.value)} required />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? "Syncing…" : "Start sync"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function ResetButton() {
  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (confirm("This removes every trivia round and score. Continue?"))
          resetTrivia();
      }}
    >
      Reset trivia
    </Button>
  );
}
