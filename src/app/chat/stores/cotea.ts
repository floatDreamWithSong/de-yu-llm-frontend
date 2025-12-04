import type { CoteaConfigType } from "@/apis/requests/conversation/schema/cotea";
import { create } from "zustand";

interface CoteaStore {
  cotea?: CoteaConfigType;
  setCotea: (cotea?: CoteaConfigType) => void;
}

export const useCoteaStore = create<CoteaStore>((set)=>{
  return {
    cotea: undefined,
    setCotea: (cotea?: CoteaConfigType) => {
      set({ cotea });
    },
  };
})