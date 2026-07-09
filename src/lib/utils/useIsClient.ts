import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** True only after hydration — lets client-only values (like "today") render safely. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
