import "server-only";
import { demoStore } from "./demo-store";
import type { Store } from "./store";

// Swap point: when the client approves, add supabase-store.ts implementing Store
// (schema ready in supabase/migrations) and export it here when env vars are set.
export const store: Store = demoStore;
