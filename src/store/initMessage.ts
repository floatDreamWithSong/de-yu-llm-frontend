import { create } from "zustand";

export type AvaliableModelName = 'deyu-default'|'deyu-bzr'|'deyu-xkjs'|'deyu-qyds'|'deyu-dygb'|'deyu-xy'|'deyu-jylf'

export interface InitMessageState {
  // 初始消息
  initMessage: string | null;
  // 是否已处理初始消息
  hasProcessed: boolean;
  model: AvaliableModelName
  // Actions
  setInitMessage: (message: string) => void;
  clearInitMessage: () => void;
  markAsProcessed: () => void;
  reset: () => void;
  setModel: (modelName: AvaliableModelName) => void
}

export const useInitMessageStore = create<InitMessageState>((set) => ({
  initMessage: null,
  hasProcessed: false,
  model: 'deyu-default',

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
      model: 'deyu-default'
    });
  },

  setModel: (modelName: AvaliableModelName)=> {
    set({
      model: modelName
    })
  }
}));
