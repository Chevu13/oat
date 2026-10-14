import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer, CartToast } from "@/components/cart/cart-drawer";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { MotionProvider } from "@/components/ui/motion-provider";
import { showDemoNotice } from "@/lib/config";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <MotionProvider>
      <CartProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Preskoči na sadržaj
        </a>
        {showDemoNotice && (
          <p className="bg-ink px-4 py-2 text-center text-[0.72rem] font-semibold tracking-wide text-paper/90">
            DEMO PRODAVNICA · cene su okvirne i služe za testiranje · porudžbine se ne isporučuju
          </p>
        )}
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CartDrawer />
        <CartToast />
      </CartProvider>
    </MotionProvider>
  );
}
