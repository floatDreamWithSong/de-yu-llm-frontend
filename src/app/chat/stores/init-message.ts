import type { CoteaConfigType } from "@/apis/requests/conversation/schema/cotea";
import { create } from "zustand";

export interface InitMessageState {
  // 初始消息
  initMessage: string | null;
  attachesUrl: string[];
  // 是否已处理初始消息
  hasProcessed: boolean;
  initCoteaConfig?: CoteaConfigType;
  // Actions
  setInitMessage: (message: string, attachesUrl: string[]) => void;
  clearInitMessage: () => void;
  markAsProcessed: () => void;
  reset: () => void;
  setInitCoteaConfig: (coteaConfig?: CoteaConfigType) => void;
}

export const useInitMessageStore = create<InitMessageState>((set) => ({
  initMessage: null,
  hasProcessed: false,
  attachesUrl: [],
  initCoteaConfig: void 0,

  setInitMessage: (message: string, attachesUrl: string[] = []) => {
    set({
      initMessage: message,
      hasProcessed: false,
      attachesUrl
    });
  },

  clearInitMessage: () => {
    set({
      initMessage: null,
      attachesUrl: [],
    });
  },

  markAsProcessed: () => {
    set({
      hasProcessed: true,
    });
  },

  setInitCoteaConfig: (coteaConfig?: CoteaConfigType) => {
    set({
      initCoteaConfig: coteaConfig,
    });
  },

  reset: () => {
    set({
      initMessage: null,
      hasProcessed: false,
      attachesUrl: [],
    });
  },
}));
