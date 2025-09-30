"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { visit } from "unist-util-visit";
import type { SseSearchCite } from "@/apis/requests/conversation/schema";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CodeXml } from "lucide-react";
import { ShineBorder } from "../ui/shine-border";

type ResponseProps = ComponentProps<typeof Streamdown>;

/* 1. remark 插件：把 [cite:0] 换成 <a class="cite-ref" data-cite-id="0">1</a> */
function remarkCitePlugin() {
  return (tree: any) => {
    visit(tree, "text", (node, idx, parent) => {
      if (idx == null || !parent) return;

      const text = node.value as string;
      const citeRegex = /\[(?:cite|索引):(\d+)]/g;
      if (!citeRegex.test(text)) return;

      const newChildren: any[] = [];
      let lastIndex = 0;

      text.replace(citeRegex, (match, idStr, offset) => {
        if (offset > lastIndex) {
          newChildren.push({
            type: "text",
            value: text.slice(lastIndex, offset),
          });
        }
        /* 标准 link 节点，仅做占位 */
        newChildren.push({
          type: "link",
          url: "#", // 占位 href，不会真的跳转
          data: {
            hProperties: {
              className: "cite-ref",
              "data-cite-id": idStr,
            },
          },
        });
        lastIndex = offset + match.length;
        return match;
      });

      if (lastIndex < text.length) {
        newChildren.push({ type: "text", value: text.slice(lastIndex) });
      }
      parent.children.splice(idx, 1, ...newChildren);
      return idx + newChildren.length;
    });
  };
}

/* 2. remark 插件：把 [code:0] 换成 <button class="code-ref" data-code-id="0">Code 1</button> */
function remarkCodeRefPlugin() {
  return (tree: any) => {
    visit(tree, "text", (node, idx, parent) => {
      if (idx == null || !parent) return;

      const text = node.value as string;
      const codeRegex = /\[code:(\d+)]/g;
      if (!codeRegex.test(text)) return;

      const newChildren: any[] = [];
      let lastIndex = 0;

      text.replace(codeRegex, (match, idStr, offset) => {
        if (offset > lastIndex) {
          newChildren.push({
            type: "text",
            value: text.slice(lastIndex, offset),
          });
        }
        const num = Number(idStr) + 1;
        // 使用标准 link 节点占位，并通过 class 和 data 标识
        newChildren.push({
          type: "link",
          url: "#",
          data: {
            hProperties: {
              className: "code-ref",
              "data-code-id": idStr,
            },
          },
          children: [{ type: "text", value: `Code ${num}` }],
        });
        lastIndex = offset + match.length;
        return match;
      });

      if (lastIndex < text.length) {
        newChildren.push({ type: "text", value: text.slice(lastIndex) });
      }
      parent.children.splice(idx, 1, ...newChildren);
      return idx + newChildren.length;
    });
  };
}
/* 3. Streamdown 包装 */
export const Response = memo(
  ({
    className,
    cites,
    onToggleCodeEditor,
    ...props
  }: ResponseProps & { cites?: SseSearchCite[], onToggleCodeEditor?: ()=>unknown }) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
      defaultOrigin="http://localhost:3000"
      allowedLinkPrefixes={["#"]}
      remarkPlugins={[remarkCitePlugin, remarkCodeRefPlugin]}
      components={{
        a: ({ node, className, children, ...rest }) =>
          className?.includes("cite-ref") ? (
            (() => {
              // @ts-expect-error no-check
              const idx = Number(rest["data-cite-id"]);
              const cite = cites?.[idx]; // 按索引取数据
              if (!cite) return <span>{children}</span>; // 兜底

              return (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Badge
                      className={cn("ml-1 rounded-full", className)}
                      variant="secondary"
                      {...props}
                    >
                      {cite.url.length ? (
                        <>{new URL(cite.url).hostname} </>
                      ) : (
                        "unknown"
                      )}
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div
                      onMouseUp={() => window.open(cite.url)}
                      key={cite.index}
                      className="hover:bg-secondary rounded-xl text-[0.85rem] cursor-pointer transition-colors duration-300"
                    >
                      <div className="flex items-center">
                        <div className="p-1">
                          <img
                            className="size-5"
                            src={cite.siteIcon}
                            alt={cite.siteName}
                          />
                        </div>
                        <div>{cite.siteName}</div>
                        <div className="pl-1 text-black/70">
                          {new Date(cite.datePublished).toLocaleDateString()}
                        </div>
                      </div>
                      <h4 className="text-[0.9rem]">{cite.name}</h4>
                      <p className="line-clamp-2 overflow-hidden text-gray-800 w-full">
                        {cite.snippet}
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })()
          ) : className?.includes("code-ref") ? (
            <Button onClick={onToggleCodeEditor} variant={"outline"} className="relative h-16 rounded-md px-12 has-[>svg]:px-8" size={"lg"}>
              <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
              <CodeXml className="stroke-primary" size={14} />
              代码预览
            </Button>
          ) : null,
      }}
      {...props}
    />
  ),
  (prev, next) => prev.children === next.children,
);
Response.displayName = "Response";
