// Soft page-enter transition in pure CSS: runs before hydration, never blocks navigation or LCP.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="anim-page">{children}</div>;
}
