import Image from "next/image";

/** The real OAT BOMB brush wordmark (from their Instagram), one line. 954×218 source. */
export function Logo({ className = "h-7 w-auto", invert = false, priority = false }: { className?: string; invert?: boolean; priority?: boolean }) {
  return (
    <Image
      src="/brand/logo-line.png"
      alt="OAT BOMB"
      width={954}
      height={218}
      priority={priority}
      className={`${className} ${invert ? "invert" : ""}`}
    />
  );
}
