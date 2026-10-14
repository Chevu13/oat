import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { FitTitle } from "@/components/site/fit-title";

export const metadata: Metadata = { title: "Plaćanje", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-10 pt-6 md:px-8 md:pt-10">
      <FitTitle text="Plaćanje" max="6rem" maxWidth={1240} />
      <p className="mb-10 mt-3 text-ink-soft">Još samo par podataka i tvoja kaša je na putu.</p>
      <CheckoutForm />
    </div>
  );
}
