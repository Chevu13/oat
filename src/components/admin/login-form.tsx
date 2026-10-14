"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">E-mail</span>
        <input name="email" type="email" autoComplete="username" required className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Lozinka</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </label>
      {state.error && (
        <p role="alert" className="text-sm font-semibold text-berry">
          {state.error}
        </p>
      )}
      <button disabled={pending} className="btn btn-ink w-full">
        {pending ? "Prijavljivanje…" : "Prijavi se"}
      </button>
    </form>
  );
}
