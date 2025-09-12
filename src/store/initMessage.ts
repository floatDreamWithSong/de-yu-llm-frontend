import { create } from "zustand";

export interface InitMessageState {
  // 初始消息
  initMessage: string | null;
  // 是否已处理初始消息
  hasProcessed: boolean;

  // Actions
  setInitMessage: (message: string) => void;
  clearInitMessage: () => void;
  markAsProcessed: () => void;
  reset: () => void;
}

export const useInitMessageStore = create<InitMessageState>((set) => ({
  initMessage: null,
  hasProcessed: false,

  setInitMessage: (message: string) => {
    set({
      initMessage: message,
      hasProcessed: false,
    });
  },

  clearInitMessage: () => {
    set({
      initMessage: null,
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
    });
  },
}));
