"use client";
import {
  PromptInput,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";
import { PencilLine } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import React from "react";

export default function UserPromptTextarea({ className, ...props }: React.ComponentProps<"div">) {
  const [value, setValue] = useState("");
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleInput = useCallback((e: React.FormEvent<HTMLSpanElement>) => {
    const target = e.target as HTMLSpanElement;
    const newValue = target.innerHTML;
    setValue(newValue);
  }, []);

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
      className={cn("max-w-[800px] relative divide-none p-2 border-3 mb-4 border-[#d4d5ff] shadow-lg shadow-secondary", className)}
    >
      <div
        className="h-[120px] overflow-y-auto p-2"
        style={{
          scrollbarColor: "transparent transparent",
        }}
        onClick={() => {
          spanRef.current?.focus();
        }}
      >
        <div className="inline m-2 mt-0">
          <PencilLine className="size-4 inline stoke-3" />
        </div>
        <span
          ref={spanRef}
          contentEditable
          onInput={handleInput}
          className="outline-none border-none"
          suppressContentEditableWarning
        />
        {!value && <span className="text-gray-500">继续提问</span>}
      </div>
      <div className="m-2 flex justify-between">
        <div />
        <div>
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
