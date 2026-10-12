"use client";

/** The three member login forms. Each calls a server action from src/lib/auth/actions.ts. */
import Link from "next/link";
import { useActionState, useState } from "react";
import { forgotPasswordAction, logInAction, resetPasswordAction, signUpAction, type AuthFormState } from "@/lib/auth/actions";

const START: AuthFormState = {};

function Message({ state, id }: { state: AuthFormState; id: string }) {
  if (state.error) return <p id={id} role="alert" className="mt-4 text-sm text-brand-dark">{state.error}</p>;
  if (state.info) return <p role="status" className="mt-4 rounded-lg bg-blush px-3 py-2 text-sm">{state.info}</p>;
  return null;
}

/** Password input with a show/hide button. */
function PasswordField({ id, name, label, autoComplete, invalid, describedBy }: {
  id: string;
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  invalid: boolean;
  describedBy?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="mt-5">
      <label htmlFor={id} className="field-label">{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="field-input pr-20"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded px-2 py-1 text-sm text-muted hover:text-brand-dark"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export function LoginForm({ notice, next = "/dashboard" }: { notice?: string; next?: string }) {
  const [state, formAction, pending] = useActionState(logInAction, START);
  return (
    <form action={formAction} noValidate className="card mx-auto w-full max-w-[440px] p-7 sm:p-9">
      <input type="hidden" name="next" value={next} />
      {notice && !state.error ? <p role="status" className="mb-4 rounded-lg bg-blush px-3 py-2 text-sm">{notice}</p> : null}
      <label htmlFor="login-email" className="field-label">Email address</label>
      <input
        id="login-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.email}
        aria-invalid={Boolean(state.error)}
        aria-describedby={state.error ? "login-error" : undefined}
        className="field-input"
      />
      <PasswordField id="login-password" name="password" label="Password" autoComplete="current-password" invalid={Boolean(state.error)} describedBy={state.error ? "login-error" : undefined} />
      <p className="mt-2 text-right text-sm">
        <Link href="/forgot-password" className="text-brand-dark underline">Forgot password?</Link>
      </p>
      <Message state={state} id="login-error" />
      <button type="submit" className="btn mt-6 w-full" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, START);
  return (
    <form action={formAction} noValidate className="card mx-auto w-full max-w-[440px] p-7 sm:p-9">
      <p className="text-[15px] text-muted">
        Enter the email you paid with. We&apos;ll send you a link to set a new password. First time here? This is also how you
        create your password.
      </p>
      <label htmlFor="forgot-email" className="field-label mt-5">Email address</label>
      <input
        id="forgot-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.email}
        aria-invalid={Boolean(state.error)}
        aria-describedby={state.error ? "forgot-error" : undefined}
        className="field-input"
      />
      <Message state={state} id="forgot-error" />
      <button type="submit" className="btn mt-6 w-full" disabled={pending}>
        {pending ? "Sending…" : "Email me a link"}
      </button>
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-muted underline hover:text-brand-dark">Back to login</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, START);
  return (
    <form action={formAction} noValidate className="card mx-auto w-full max-w-[440px] p-7 sm:p-9">
      <input type="hidden" name="token" value={token} />
      <p className="text-[15px] text-muted">Choose a password with at least 8 characters.</p>
      <PasswordField id="new-password" name="password" label="New password" autoComplete="new-password" invalid={Boolean(state.error)} describedBy={state.error ? "reset-error" : undefined} />
      <PasswordField id="confirm-password" name="confirm" label="Type it again" autoComplete="new-password" invalid={Boolean(state.error)} describedBy={state.error ? "reset-error" : undefined} />
      <Message state={state} id="reset-error" />
      <button type="submit" className="btn mt-6 w-full" disabled={pending}>
        {pending ? "Saving…" : "Save password and log in"}
      </button>
    </form>
  );
}

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, START);
  const describedBy = state.error ? "signup-error" : undefined;
  return (
    <form action={formAction} noValidate className="card mx-auto w-full max-w-[440px] p-7 sm:p-9">
      <label htmlFor="signup-name" className="field-label">Full name</label>
      <input id="signup-name" name="fullName" autoComplete="name" required aria-describedby={describedBy} className="field-input" />
      <label htmlFor="signup-email" className="field-label mt-5">Email address</label>
      <input id="signup-email" name="email" type="email" autoComplete="email" required defaultValue={state.email} aria-describedby={describedBy} className="field-input" />
      <label htmlFor="signup-phone" className="field-label mt-5">WhatsApp number</label>
      <input id="signup-phone" name="phone" type="tel" autoComplete="tel" required placeholder="+92 300 1234567" aria-describedby={describedBy} className="field-input" />
      <PasswordField id="signup-password" name="password" label="Create a password (8+ characters)" autoComplete="new-password" invalid={Boolean(state.error)} describedBy={describedBy} />
      <Message state={state} id="signup-error" />
      <button type="submit" className="btn mt-6 w-full" disabled={pending}>
        {pending ? "Creating your account…" : "Create my account"}
      </button>
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account? <Link href="/login" className="text-brand-dark underline">Log in</Link>
      </p>
    </form>
  );
}
