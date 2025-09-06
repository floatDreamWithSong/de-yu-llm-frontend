"use client";
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";
import { Atom, GlobeIcon, MicIcon, Paperclip, PencilLine } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import type React from "react";

export default function UserPromptTextarea({
  className,
}: React.ComponentProps<"div">) {
  const [value, setValue] = useState("");
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleInput = useCallback((e: React.FormEvent<HTMLSpanElement>) => {
    e.preventDefault();
    const target = e.target as HTMLSpanElement;
    const newValue = target.innerHTML;
    console.log(newValue);
    setValue(newValue);
  }, []);
  const handlePaste = (e: React.ClipboardEvent<HTMLSpanElement>) => {
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
        if (e.key === "Enter" && e.ctrlKey) {
          console.log(value);
        }
      }}
      onSubmit={(e) => {
        e.preventDefault();
        console.log(value);
      }}
      className={cn(
        "relative flex flex-col divide-none p-2 border-3 mb-4 border-none shadow-lg shadow-primary",
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
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          className="outline-none border-none"
          suppressContentEditableWarning
        />
        {!value && <span className="text-gray-500">继续提问</span>}
      </div>
      <div className="m-2 flex justify-between [&>div]:flex [&>div]:items-center [&>div]:gap-2">
        <div>
          <PromptInputButton variant={"outline"} className="rounded-full">
            <Atom size={16} />
            <span>深度思考</span>
          </PromptInputButton>
          <PromptInputButton variant={"outline"} className="rounded-full">
            <GlobeIcon size={16} />
            <span>联网搜索</span>
          </PromptInputButton>
          <PromptInputButton variant={"outline"} className="rounded-full">
            <Paperclip size={16} />
          </PromptInputButton>
        </div>
        <div>
          <PromptInputButton variant={"outline"} className="rounded-full border-0">
            <MicIcon size={16} />
          </PromptInputButton>
          <PromptInputSubmit
            className="rounded-full"
            disabled={false}
            status={"ready"}
          />
        </div>
      </div>
    </PromptInput>
  );
}
