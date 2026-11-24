"use client";

/**
 * Top of a client's Login tab in admin: says in plain words whether she can log in,
 * with a one-click "Unlock now" when 5 wrong passwords locked her account.
 */
import { useState } from "react";
import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useClientValue } from "@/components/ui/hooks";
import { unlockMember } from "./memberActions";

export function LoginStatus() {
  const { id } = useDocumentInfo();
  const lockedUntil = useFormFields(([fields]) => fields.lockedUntil?.value as string | null | undefined);
  const failed = useFormFields(([fields]) => Number(fields.failedLogins?.value ?? 0));
  const passwordSetAt = useFormFields(([fields]) => fields.passwordSetAt?.value as string | null | undefined);
  const nowMinute = useClientValue(() => Math.floor(Date.now() / 60_000), 0); // current minute (stable while rendering)
  const [state, setState] = useState<{ busy?: boolean; error?: string; done?: boolean }>({});

  if (!id) return null;
  // Read once per render; a lock in the past no longer blocks her.
  const lockedTill = lockedUntil ? new Date(lockedUntil) : null;
  const locked = !state.done && lockedTill !== null && lockedTill.getTime() > nowMinute * 60_000;

  const unlock = async () => {
    setState({ busy: true });
    const result = await unlockMember(Number(id));
    if (result.ok) {
      setState({ done: true });
      // Reload so the form shows the cleared lock (and a later Save can't put the old lock back)
      window.location.reload();
    } else setState({ error: result.error });
  };

  return (
    <div className="ftf-client-actions" style={{ marginBottom: 16 }}>
      {locked ? (
        <>
          <span className="ftf-replace__error">
            Locked after 5 wrong passwords, until {lockedTill.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
          </span>
          <button type="button" className="ftf-btn ftf-btn--whatsapp" onClick={unlock} disabled={state.busy}>
            {state.busy ? "Unlocking..." : "Unlock now"}
          </button>
        </>
      ) : (
        <span className="ftf-muted">
          {state.done ? "Unlocked. She can log in now." : passwordSetAt ? "She can log in." : 'No password yet: ask her to tap "Forgot password" on the login page to create one.'}
          {!state.done && failed > 0 && passwordSetAt ? ` (${failed} wrong password${failed === 1 ? "" : "s"} in a row)` : ""}
        </span>
      )}
      {state.error ? <span className="ftf-replace__error">{state.error}</span> : null}
    </div>
  );
}
