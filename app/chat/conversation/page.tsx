"use client";
import { Actions } from "@/components/ai-elements/actions";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Action } from "@/components/ai-elements/actions";
import {
  Copy,
  PencilLine,
  RefreshCcw,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import UserPromptTextarea from "../components/user-prompt-textarea";
import { createPortal } from "react-dom";
import { useEffect, useState, Suspense } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
gsap.registerPlugin(SplitText);

const assiatantMessage = `
# 标题
## 标题
### 标题
#### 标题
##### 标题
###### 标题

这是一个示例文本。
这是一个示例文本。

nihao \`123\`

\`\`\`js
  console.log('hello');
\`\`\`
`;

function ConversationContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id') || '1';
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(conversationId);
  }, [conversationId]);
  
  useGSAP(() => {
    const modelTitle = new SplitText("#sidebar-header h1", {
      type: "chars",
    });
    gsap.from(modelTitle.chars, {
      duration: 1,
      opacity: 0,
      y: 10,
      stagger: 0.02,
      ease: "elastic.out(1,0.6)",
      delay: 0.2
    });
  }, [title]);
  
  return (
    <>
      <div className="overflow-auto h-full">
        {!!title && createPortal(
          <h1>Conversation {conversationId}</h1>,
          document.getElementById("sidebar-header")!
        )}
        <div className="max-w-[1000px] mx-auto">
          <Message from="user">
            <div className="flex flex-col items-end">
              <MessageContent>
                <p>Hello, how are you?</p>
              </MessageContent>
              <Actions className="mt-2">
                <Action label="Copy">
                  <Copy className="size-4" />
                </Action>
                <Action label="Regenerate">
                  <PencilLine className="size-4" />
                </Action>
              </Actions>
            </div>
          </Message>
          <Message from="assistant" className="flex items-start">
            <MessageAvatar
              src="/logo.png"
              className="order-1"
              name="John Doe"
            />
            <div className="flex flex-col">
              <MessageContent>
                <Response>{assiatantMessage}</Response>
                <Actions className="mt-2">
                  <Action label="Copy">
                    <Copy className="size-4" />
                  </Action>
                  <Action label="Regenerate">
                    <RefreshCcw className="size-4" />
                  </Action>
                  <Action label="Like">
                    <ThumbsUpIcon className="size-4" />
                  </Action>
                  <Action label="Dislike">
                    <ThumbsDownIcon className="size-4" />
                  </Action>
                </Actions>
              </MessageContent>
            </div>
          </Message>
          <Message from="user">
            <div className="flex flex-col items-end">
              <MessageContent>
                <p>Hello, how are you?</p>
              </MessageContent>
              <Actions className="mt-2">
                <Action label="Copy">
                  <Copy className="size-4" />
                </Action>
                <Action label="Regenerate">
                  <PencilLine className="size-4" />
                </Action>
              </Actions>
            </div>
          </Message>
          <Message from="assistant" className="flex items-start">
            <MessageAvatar
              src="/logo.png"
              className="order-1"
              name="John Doe"
            />
            <div className="flex flex-col">
              <MessageContent>
                <Response>{assiatantMessage}</Response>
                <Actions className="mt-2">
                  <Action label="Copy">
                    <Copy className="size-4" />
                  </Action>
                  <Action label="Regenerate">
                    <RefreshCcw className="size-4" />
                  </Action>
                  <Action label="Like">
                    <ThumbsUpIcon className="size-4" />
                  </Action>
                  <Action label="Dislike">
                    <ThumbsDownIcon className="size-4" />
                  </Action>
                </Actions>
              </MessageContent>
            </div>
          </Message>
        </div>
      </div>
      <UserPromptTextarea className="mx-auto sticky bottom-4" />
    </>
  );
}

export default function ConversationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConversationContent />
    </Suspense>
  );
}
