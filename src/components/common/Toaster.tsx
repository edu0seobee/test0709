"use client";

import { useEffect, useState } from "react";
import { subscribeToast } from "@/lib/utils/toast";

interface ToastItem {
  id: number;
  message: string;
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    let counter = 0;
    return subscribeToast((message) => {
      const id = ++counter;
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="rounded-md bg-ink px-4 py-2 text-sm text-on-primary shadow-[0px_1px_1px_#00000005,0px_8px_16px_-4px_#0000000a,0px_24px_32px_-8px_#0000000f]"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
