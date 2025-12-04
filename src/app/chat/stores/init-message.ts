import { create } from "zustand";

export interface InitMessageState {
  // 初始消息
  initMessage: string | null;
  attachesUrl: string[];
  // 是否已处理初始消息
  hasProcessed: boolean;
  // Actions
  setInitMessage: (message: string, attachesUrl: string[]) => void;
  clearInitMessage: () => void;
  markAsProcessed: () => void;
  reset: () => void;
}

export const useInitMessageStore = create<InitMessageState>((set) => ({
  initMessage: null,
  hasProcessed: false,
  attachesUrl: [],

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

  reset: () => {
    set({
      initMessage: null,
      hasProcessed: false,
      attachesUrl: [],
    });
  },
}));
