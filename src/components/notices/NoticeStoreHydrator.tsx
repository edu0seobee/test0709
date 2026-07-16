"use client";

import { useState } from "react";
import { useNoticeStore } from "@/lib/store/useNoticeStore";
import type { NoticeCard } from "@/lib/types/notice";

interface NoticeStoreHydratorProps {
  initialNotices: NoticeCard[];
}

export function NoticeStoreHydrator({ initialNotices }: NoticeStoreHydratorProps) {
  useState(() => {
    useNoticeStore.getState().hydrate(initialNotices);
  });
  return null;
}
