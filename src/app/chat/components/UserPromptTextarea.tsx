import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBotInfo, useBotBasicInfo } from "@/app/chat/hooks/use-bot";
import { isBuiltInAgent } from "@/utils/constants/agent";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import type { ChatStatus } from "ai";
import {
  Atom,
  CodeXml,
  Earth,
  MicIcon,
  Paperclip,
  X,
  ImagePlus,
  Loader2,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect, memo } from "react";
import type React from "react";
import { useAsrRecognition } from "@/app/chat/hooks/use-asr-recognition";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { env } from "@/env";
import { uploadCosFile } from "@/apis/requests/cos";
import { toast } from "sonner";
import type { Attach } from "../types/attach";
import PreviewImage from "./PreviewImage";
import { PhotoProvider } from "react-photo-view";

export default function UserPromptTextarea({
  className,
  onSubmit,
  onAbort,
  disabled = false,
  status,
  botId,
  think,
  webSearch,
}: Omit<React.ComponentProps<"div">, "onSubmit"> & {
  onSubmit: (args: {
    value: string;
    onSuccess?: () => void;
    attachesUrl: string[];
  }) => void;
  onAbort: () => void;
  initialBotId?: string;
  disabled?: boolean;
  status: ChatStatus;
  botId?: string;
  think?: boolean;
  webSearch?: boolean;
}) {
  const [value, setValue] = useState("");
  const [attaches, setAttaches] = useState<Attach[]>([]);
  const spanRef = useRef<HTMLSpanElement>(null);
  const navigate = useNavigate();
  const { isMobile } = useSidebar();

  // 语音识别功能
  const {
    status: asrStatus,
    startRecognition,
    stopRecognition,
  } = useAsrRecognition({
    onMessage: (message) => {
      if (typeof message !== "string") return;
      setValue(() => {
        if (spanRef.current) {
          spanRef.current.innerHTML = message;
        }
        return message;
      });
    },
  });

  const handleInput = useCallback((e: React.FormEvent<HTMLSpanElement>) => {
    // if (status !== "ready" || disabled) return;
    e.preventDefault();
    const target = e.target as HTMLSpanElement;
    const newValue = target.innerHTML;
    setValue(newValue);
  }, []);
  const addAttach = (attach: Attach) => {
    setAttaches((prev) => {
      if (prev.length === 10) {
        toast.info("最多上传10个附件");
        return prev;
      }
      uploadCosFile({
        prefix: "chat",
        suffix: attach.localData.type.split("/")[1],
        file: attach.localData,
        onProgress: (progress) => {
          setAttaches((prev) =>
            prev.map((a) =>
              a.localId === attach.localId ? { ...a, progress } : a,
            ),
          );
        },
      }).then((res) => {
        setAttaches((prev) =>
          prev.map((a) =>
            a.localId === attach.localId
              ? { ...a, uploadUrl: res.url, isUploading: false }
              : a,
          ),
        );
      });
      return [...prev, attach];
    });
  };
  const handlePaste = async (e: React.ClipboardEvent<HTMLSpanElement>) => {
    if (status !== "ready" || disabled) return;
    e.preventDefault(); // 1. 阻止默认粘贴
    const text = await navigator.clipboard.readText().then((i) => i.trim());
    if (text) {
      console.log(text);
      document.execCommand("insertText", false, text);
      return;
    }
    const clipboardItems = await navigator.clipboard.read();

    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        const blob = await clipboardItem.getType(type);
        // we can now use blob here
        const attach: Attach = {
          localId: crypto.randomUUID(),
          localData: blob,
          uploadUrl: "",
          progress: 0,
          isUploading: true,
        };
        addAttach(attach);
      }
    }
  };
  // 只在初始渲染时设置内容，之后让用户直接编辑
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (spanRef.current && !isInitializedRef.current) {
      spanRef.current.innerHTML = value;
      isInitializedRef.current = true;
    }
  }, [value]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "ready" && !disabled) {
      const prompt = value
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/&nbsp;/gi, " ")
        .trim();
      onSubmit?.({
        value: prompt,
        attachesUrl: attaches.map((a) => a.uploadUrl),
        onSuccess: () => {
          setValue("");
          if (spanRef.current) {
            spanRef.current.innerHTML = "";
          }
          if (attaches.length > 0) {
            setAttaches([]);
          }
        },
      });
    } else {
      onAbort();
    }
  };
  const showBot = !isBuiltInAgent(botId);
  const botInfo = useBotInfo({ botId: botId });
  const botBasicInfo = useBotBasicInfo(botId);
  const thinkAble =
    isBuiltInAgent(botId) || botInfo.data?.modelInfo.modelId !== "80000";

  // 处理麦克风按钮点击
  const handleMicClick = () => {
    if (status !== "ready" || disabled) return;

    if (asrStatus === "recognizing") {
      stopRecognition();
    }
    if (asrStatus === "idle") {
      startRecognition();
    }
  };

  // 处理输入框聚焦，在移动端时将输入框滚动到安全位置
  const handleFocus = useCallback(() => {
    if (!isMobile) return;

    // 延迟执行，确保键盘已经弹出
    setTimeout(() => {
      const inputElement = spanRef.current;
      if (inputElement) {
        // 找到输入框容器（PromptInput form 元素）
        const container = inputElement.closest("form");
        if (container) {
          // 滚动整个输入框容器到安全位置
          // block: 'end' 确保输入框在视口底部可见
          // behavior: 'smooth' 提供平滑滚动体验
          container.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
        } else {
          // 如果找不到容器，则滚动输入元素本身
          inputElement.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
        }
      }
    }, 300); // 300ms 延迟，等待键盘弹出动画完成
  }, [isMobile]);
  const disabledSubmit =
    disabled ||
    (status === "ready" && !value.trim()) ||
    attaches.some((a) => a.isUploading);

  const handleUploadImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const attach: Attach = {
          localId: crypto.randomUUID(),
          localData: file,
          uploadUrl: "",
          progress: 0,
          isUploading: true,
        };
        addAttach(attach);
      }
    };
    input.click();
  };
  const ThinkButton = thinkAble ? (
    <PromptInputButton
      onClick={() => {
        navigate({
          to: ".",
          search: {
            botId,
            webSearch,
            think: think ? void 0 : true,
          },
        });
      }}
      variant={think ? "default" : "outline"}
      className="rounded-full"
    >
      <Atom size={16} />
      深度思考
    </PromptInputButton>
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>
        <PromptInputButton variant={"outline"} className="rounded-full">
          <Atom size={16} />
          深度思考
        </PromptInputButton>
      </TooltipTrigger>
      <TooltipContent>
        <p>该智能体模型不可深度思考</p>
      </TooltipContent>
    </Tooltip>
  );
  const WebSearchButton = (
    <PromptInputButton
      onClick={() => {
        navigate({
          to: ".",
          search: {
            botId,
            think,
            webSearch: webSearch ? void 0 : true,
          },
        });
      }}
      variant={webSearch ? "default" : "outline"}
      className="rounded-full"
    >
      <Earth size={16} />
      联网搜索
    </PromptInputButton>
  );
  const CodeGenButton = isBuiltInAgent(botId) && (
    <PromptInputButton
      onClick={() =>
        navigate({
          to: ".",
          search: {
            think,
            webSearch,
            botId: botId === "code-gen" ? void 0 : "code-gen",
          },
        })
      }
      variant={botId === "code-gen" ? "default" : "outline"}
      className="rounded-full"
    >
      <CodeXml size={16} />
      代码生成
    </PromptInputButton>
  );
  const AttachButton = (
    <DropdownMenu dir="ltr">
      <DropdownMenuTrigger asChild>
        <PromptInputButton variant={"outline"} className="rounded-full">
          <Paperclip size={16} />
        </PromptInputButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleUploadImage}>
          <ImagePlus size={16} />
          上传图片
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MicIcon size={16} />
          上传音频
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  const AsrButton = (
    <Tooltip>
      <TooltipTrigger asChild>
        <PromptInputButton
          onClick={handleMicClick}
          variant={asrStatus === "recognizing" ? "default" : "outline"}
          className={cn(
            "rounded-full border-0 transition-all duration-200",
            asrStatus === "recognizing" && "animate-pulse",
          )}
          disabled={status !== "ready" || asrStatus === "pending" || disabled}
        >
          <MicIcon size={16} />
        </PromptInputButton>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {asrStatus === "recognizing" ? "点击停止录音" : "点击开始语音输入"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
  const SubmitButton = (
    <PromptInputSubmit
      className="rounded-full"
      status={status}
      disabled={disabledSubmit}
    />
  );
  return (
    <>
      <PromptInput
        onKeyDown={(e) => {
          if (status !== "ready" || disabled) return;
          if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            document.execCommand("insertText", false, "\n");
            return;
          }
          if (e.key === "Enter") {
            handleSubmit(e);
          }
        }}
        onSubmit={handleSubmit}
        className={cn(
          "relative flex flex-col divide-none p-2 border-4 mb-4",
          "shadow-none border-primary/30 style__shallow-shadow max-w-[658px] h-fit",
          isMobile && "rounded-3xl",
          className,
        )}
        style={{
          viewTransitionName: !isMobile ? "user-prompt-input" : undefined,
        }}
      >
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        {attaches.length > 0 && (
          <PhotoProvider>
            <div className="space-x-2 overflow-x-scroll w-full h-fit flex flex-nowrap bg-white p-2">
              {attaches.map((attach) => (
                <AttachItem
                  key={attach.localId}
                  attach={attach}
                  onRemove={() => {
                    setAttaches((prev) =>
                      prev.filter((i) => i.localId !== attach.localId),
                    );
                  }}
                />
              ))}
            </div>
          </PhotoProvider>
        )}
        <div className={cn([isMobile && "flex flex-row"])}>
          <div
            className="px-2 cursor-text overflow-y-auto w-full py-2"
            style={{
              boxSizing: "content-box",
              minHeight: "20px",
              maxHeight: "88px",
              scrollbarWidth: isMobile ? "none" : "thin",
              scrollbarColor: "var(--color-secondary) white",
            }}
            onClick={() => {
              spanRef.current?.focus();
            }}
          >
            <div className="inline mx-2 mt-0 float-left">
              {showBot
                ? !botInfo.isFetching &&
                  !botInfo.isError && (
                    <>
                      <span className="text-primary align-bottom font-semibold">
                        {botBasicInfo.name}
                      </span>
                    </>
                  )
                : null}
            </div>
            <span
              ref={spanRef}
              contentEditable={status === "ready" && !disabled}
              onInput={handleInput}
              onPaste={handlePaste}
              onFocus={handleFocus}
              className={cn(
                "outline-none border-none",
                (status !== "ready" || disabled) &&
                  "opacity-50 cursor-not-allowed",
              )}
              suppressContentEditableWarning
            />
            {!value && (
              <span className="text-gray-500 align-bottom">继续提问</span>
            )}
          </div>
          <div
            className={cn([
              "flex justify-between [&>div]:flex [&>div]:items-center [&>div]:gap-2 self-end",
              !isMobile && "mt-6 m-2",
            ])}
          >
            {!env.VITE_SAFE_MODE && !isMobile ? (
              <div>
                {ThinkButton}
                {WebSearchButton}
                {CodeGenButton}
                {AttachButton}
              </div>
            ) : (
              <div />
            )}
            <div className="ml-1">
              {AsrButton}
              {SubmitButton}
            </div>
          </div>
        </div>
      </PromptInput>
      {isMobile && (
        <div className="py-4 space-x-2 -mt-4 overflow-x-auto flex flex-nowrap">
          {ThinkButton}
          {WebSearchButton}
          {CodeGenButton}
          {AttachButton}
        </div>
      )}
    </>
  );
}

const AttachItem = memo(
  ({ attach, onRemove }: { attach: Attach; onRemove: () => void }) => {
    return (
      attach.localData.type.startsWith("image/") && (
        <PreviewImage url={URL.createObjectURL(attach.localData)}>
          {attach.isUploading ? (
            <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex flex-col items-center justify-center rounded-md">
              <Loader2 className="size-4 animate-spin stroke-white" />
              <div className="text-white">{attach.progress}%</div>
            </div>
          ) : (
            <X
              className="size-4 cursor-pointer absolute top-0 right-0 bg-background rounded-md stroke-text border-2 translate-x-1/2 -translate-y-1/2"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            />
          )}
        </PreviewImage>
      )
    );
  },
);
