import { create } from "zustand";
import type { Request as CompletionRequest } from "@/apis/requests/conversation/completion";

export interface ChatState {

  // 完成配置
  completionConfig: Pick<
    CompletionRequest,
    "model" | "botId" | "completionsOption"
  >;

  // Actions
  toggleDeepThink: () => void;
  toggleWebSearch: () => void;
  setCompletionConfig: (
    config: Partial<
      Pick<CompletionRequest, "model" | "botId" | "completionsOption">
    >
  ) => void;
}

const defaultConfig: Pick<
  CompletionRequest,
  "model" | "botId" | "completionsOption"
> = {
  model: "InnoSpark",
  botId: "default",
  completionsOption: {
    isRegen: false,
    withSuggest: false,
    isReplace: false,
    useDeepThink: false,
    stream: true,
    webSearch: false,
  },
};

export const useChatStore = create<ChatState>((set, get) => ({

  completionConfig: defaultConfig,

  toggleDeepThink: () => {
    const currentState = get();
    const newDeepThinkState = !currentState.completionConfig.completionsOption.useDeepThink;

    set({

      completionConfig: {
        ...currentState.completionConfig,
        model: newDeepThinkState ? "InnoSpark-R" : "InnoSpark",
        completionsOption: {
          ...currentState.completionConfig.completionsOption,
          useDeepThink: newDeepThinkState,
        },
      },
    });
  },

  toggleWebSearch: () => {
    const currentState = get();

    set({
      completionConfig: {
        ...currentState.completionConfig,
        completionsOption: {
          ...currentState.completionConfig.completionsOption,
          webSearch: !currentState.completionConfig.completionsOption.webSearch,
        },
      },
    });
  },



  setCompletionConfig: (config) => {
    set((state) => ({
      completionConfig: {
        ...state.completionConfig,
        ...config,
        completionsOption: {
          ...state.completionConfig.completionsOption,
          ...config.completionsOption,
        },
      },
    }));
  },
}));
