import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      {/* Streamed not-found pages can't change the 200 status, so keep them out of search indexes explicitly. */}
      <meta name="robots" content="noindex" />
      <div>
        <p className="display text-[30vw] leading-none md:text-[14rem]">404</p>
        <p className="hand -mt-2 text-4xl">Ova kaša je pojedena.</p>
        <p className="mt-3 text-ink-soft">Stranica koju tražiš ne postoji ili je premeštena.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn btn-ink">
            Početna
          </Link>
          <Link href="/prodavnica" className="btn btn-line">
            Prodavnica
          </Link>
        </div>
      </div>
    </main>
  );
}
