import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat";
import type { ChatStatus } from "ai";
import {
  Atom,
  Earth,
  FolderOpen,
  MicIcon,
  Paperclip,
  PencilLine,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import type React from "react";

export default function UserPromptTextarea({
  className,
  onSubmit,
  onAbort,
  disabled = false,
  status,
}: Omit<React.ComponentProps<"div">, "onSubmit"> & {
  onSubmit: (value: string, onSuccess?: () => void) => void;
  onAbort: () => void;
  disabled?: boolean;
  status: ChatStatus;
}) {
  const [value, setValue] = useState("");
  const spanRef = useRef<HTMLSpanElement>(null);

  // 使用 Zustand store 管理深度思考状态
  const { isDeepThink, toggleDeepThink, toggleWebSearch, isWebSearch } =
    useChatStore();

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLSpanElement>) => {
      if (status !== "ready" || disabled) return;
      e.preventDefault();
      const target = e.target as HTMLSpanElement;
      const newValue = target.innerHTML;
      setValue(newValue);
    },
    [status, disabled],
  );
  const handlePaste = (e: React.ClipboardEvent<HTMLSpanElement>) => {
    if (status !== "ready" || disabled) return;
    e.preventDefault(); // 1. 阻止默认粘贴
    const text = e.clipboardData.getData("text/plain"); // 2. 只拿纯文本
    document.execCommand("insertText", false, text); // 3. 当成文本插入
  };
  // 只在初始渲染时设置内容，之后让用户直接编辑
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (spanRef.current && !isInitialized) {
      spanRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);
  return (
    <PromptInput
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.ctrlKey && status === "ready" && !disabled) {
          const textContent = spanRef.current?.textContent || "";
          onSubmit?.(textContent, () => {
            setValue("");
            if (spanRef.current) {
              spanRef.current.innerHTML = "";
            }
          });
        }
      }}
      onSubmit={(e) => {
        e.preventDefault();
        if (status === "ready" && !disabled) {
          const textContent = spanRef.current?.textContent || "";
          onSubmit?.(textContent, () => {
            setValue("");
            if (spanRef.current) {
              spanRef.current.innerHTML = "";
            }
          });
        } else {
          onAbort();
        }
      }}
      className={cn(
        "relative flex flex-col divide-none p-2 border-4 mb-4",
        "shadow-none border-primary/30 style__shallow-shadow max-w-[1000px] aspect-[4/1]",
        className,
      )}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        className="h-full overflow-y-auto p-2"
        style={{
          scrollbarColor: "transparent transparent",
        }}
        onClick={() => {
          spanRef.current?.focus();
        }}
      >
        <div className="inline m-2 mt-0 ">
          <PencilLine className="size-4 inline stoke-3 stroke-primary -translate-y-0.5" />
        </div>
        <span
          ref={spanRef}
          contentEditable={status === "ready" && !disabled}
          onInput={handleInput}
          onPaste={handlePaste}
          className={cn(
            "outline-none border-none",
            (status !== "ready" || disabled) && "opacity-50 cursor-not-allowed",
          )}
          suppressContentEditableWarning
        />
        {!value && <span className="text-gray-500">继续提问</span>}
      </div>
      <div className="m-2 flex justify-between [&>div]:flex [&>div]:items-center [&>div]:gap-2">
        <div>
          <PromptInputButton
            onClick={toggleDeepThink}
            variant={isDeepThink ? "default" : "outline"}
            className="rounded-full"
          >
            <Atom size={16} />
            <span>深度思考</span>
          </PromptInputButton>
          <PromptInputButton
            onClick={toggleWebSearch}
            variant={isWebSearch ? "default" : "outline"}
            className="rounded-full"
          >
            <Earth size={16} />
            <span>联网搜索</span>
          </PromptInputButton>
          <PromptInputButton variant={"outline"} className="rounded-full">
            <FolderOpen size={16} />
          </PromptInputButton>
          <PromptInputButton variant={"outline"} className="rounded-full">
            <Paperclip size={16} />
          </PromptInputButton>
        </div>
        <div>
          <PromptInputButton
            variant={"outline"}
            className="rounded-full border-0"
          >
            <MicIcon size={16} />
          </PromptInputButton>
          <PromptInputSubmit
            className="rounded-full"
            status={status}
            disabled={disabled}
          />
        </div>
      </div>
    </PromptInput>
  );
}
