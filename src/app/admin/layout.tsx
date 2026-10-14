import type { Metadata } from "next";
import { Toaster } from "@/components/admin/ui";
import { MotionProvider } from "@/components/ui/motion-provider";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin | OAT BOMB" }, robots: { index: false, follow: false } };

export default function AdminRoot({ children }: LayoutProps<"/admin">) {
  return (
    <MotionProvider>
      <div className="min-h-dvh bg-[#f6f4ef]">{children}</div>
      <Toaster />
    </MotionProvider>
  );
}
