import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/site/logo";
import { adminConfigured } from "@/lib/auth";

export const metadata: Metadata = { title: "Prijava" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <Logo className="mx-auto h-8 w-auto" />
        <h1 className="mt-6 text-center text-2xl font-extrabold [font-stretch:115%]">Admin prijava</h1>
        <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-line">
          {adminConfigured() ? (
            <LoginForm />
          ) : (
            <p className="text-sm text-berry">
              Admin nalog nije podešen. Postavite <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD</code> i <code>SESSION_SECRET</code> u <code>.env.local</code>.
            </p>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-ink-soft">Demo režim · pristupni podaci su u .env.local</p>
      </div>
    </main>
  );
}
