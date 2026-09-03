import { useEffect, useState } from "react";

// True only once hydrated on the client — used to defer client-only rendering
// (e.g. current theme, current time) until after the SSR markup is hydrated,
// avoiding a server/client content mismatch.
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: this is the standard hydration-safe "mounted" flag, not a data sync
  useEffect(() => setMounted(true), []);
  return mounted;
}
