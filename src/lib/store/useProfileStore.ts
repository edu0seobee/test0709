import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { guardedLocalStorage } from "@/lib/utils/storage-guard";
import type { EngineerRecord, ProjectRecord } from "@/lib/types/profile";

interface ProfileStoreState {
  projectRecords: ProjectRecord[];
  engineers: EngineerRecord[];
  setProjectRecords: (records: ProjectRecord[]) => void;
  setEngineers: (engineers: EngineerRecord[]) => void;
}

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set) => ({
      projectRecords: [],
      engineers: [],
      setProjectRecords: (records) => set({ projectRecords: records }),
      setEngineers: (engineers) => set({ engineers }),
    }),
    {
      name: "bid-analyzer/company-profile",
      version: 1,
      storage: createJSONStorage(() => guardedLocalStorage),
      migrate: (persistedState) => persistedState as ProfileStoreState,
    },
  ),
);
