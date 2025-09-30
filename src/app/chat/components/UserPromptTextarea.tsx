import {
  PromptInput,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";
import { useInitMessageStore } from "@/store/initMessage";
import type { ChatStatus } from "ai";
import { Bot, PencilLine } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import type React from "react";
import TemplateBlank from "./TemplateBlank";

export default function UserPromptTextarea({
  className,
  onSubmit,
  onAbort,
  disabled = false,
  templateArr,
  status,
}: Omit<React.ComponentProps<"div">, "onSubmit"> & {
  templateArr?: string[];
  onSubmit: (value: string, onSuccess?: () => void) => void;
  onAbort: () => void;
  disabled?: boolean;
  status: ChatStatus;
}) {
  const [value, setValue] = useState("");
  const spanRef = useRef<HTMLSpanElement>(null);

  // 使用 Zustand store 管理深度思考状态
  // const { isDeepThink, toggleDeepThink } = useChatStore();
  const modelName = useInitMessageStore((s) => s.modelName);

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLSpanElement>) => {
      if (status !== "ready" || disabled) return;
      e.preventDefault();
      const target = e.target as HTMLSpanElement;
      const newValue = target.textContent ?? "";
      console.log(newValue)
      setValue(newValue.trim());
    },
    [status, disabled]
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
      spanRef.current.textContent = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);
  return (
    <PromptInput
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.ctrlKey && status === "ready" && !disabled) {
          e.preventDefault()
          const textContent = value;
          onSubmit?.(textContent, () => {
            setValue("");
            if (spanRef.current) {
              spanRef.current.textContent = "";
            }
          });
        }
      }}
      onSubmit={(e) => {
        e.preventDefault();
        if (status === "ready" && !disabled) {
          console.log('submiot')
          const textContent = value;
          onSubmit?.(textContent, () => {
            setValue("");
            if (spanRef.current) {
              spanRef.current.textContent = "";
            }
          });
        } else {
          onAbort();
        }
      }}
      className={cn(
        "relative flex flex-col divide-none p-2 border-4 mb-4",
        "shadow-none border-primary/30 max-w-[1000px] aspect-[4/1]",
        className
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
          {!!modelName && (
            <span className="text-primary p-1 mr-1">
              <Bot className="size-6 inline stoke-3 stroke-primary -translate-y-1 mr-1" />
              <strong>智能体 | {modelName}</strong>
            </span>
          )}
          <PencilLine className="size-5 inline stoke-3 stroke-primary -translate-y-0.5" />
        </div>

        <span
          ref={spanRef}
          contentEditable={status === "ready" && !disabled}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault();
              // 避免浏览器插入 <br>，改为纯文本换行
              document.execCommand("insertText", false, "\n");
            }
          }}
          className={cn(
            "outline-none border-none hover:cursor-text",
            (status !== "ready" || disabled) && "opacity-50 cursor-not-allowed",
            templateArr && "hidden"
          )}
          suppressContentEditableWarning
        />
        {!value && <span className="text-gray-500">继续提问</span>}

        {templateArr && (
          <TemplateBlank
            contentEditable={status === "ready" && !disabled}
            disabled={status === "ready" && !disabled}
            setValue={setValue}
            className={cn(
              "outline-none hover:cursor-text p-1 px-2 bg-secondary m-1 rounded-md",
              (status !== "ready" || disabled) &&
                "opacity-50 cursor-not-allowed"
            )}
            suppressContentEditableWarning
            templateArr={templateArr}
          />
        )}
      </div>
      <div className="m-2 flex justify-between [&>div]:flex [&>div]:items-center [&>div]:gap-2">
        <div>
          {/* <PromptInputButton
            onClick={toggleDeepThink}
            variant={isDeepThink ? "default" : "outline"}
            className="rounded-full"
          >
            <Atom size={16} />
            <span>深度思考</span>
          </PromptInputButton> */}
          {/* <PromptInputButton variant={"outline"} className="rounded-full">
            <Earth size={16} />
            <span>联网搜索</span>
          </PromptInputButton>
          <PromptInputButton variant={"outline"} className="rounded-full">
            <FolderOpen size={16} />
          </PromptInputButton>
          <PromptInputButton variant={"outline"} className="rounded-full">
            <Paperclip size={16} />
          </PromptInputButton> */}
        </div>
        <div>
          {/* <PromptInputButton
            variant={"outline"}
            className="rounded-full border-0"
          >
            <MicIcon size={16} />
          </PromptInputButton> */}
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
