import type { SseEditorCode } from "@/apis/requests/conversation/schema";
import {
  CodeBlock,
  CodeBlockCopyButton,
} from "@/components/ai-elements/code-block";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";

type Props = Omit<React.ComponentProps<"div">, "dir"> & {
  onClose: () => unknown;
};

const CodeEditorBar = ({
  onClose,
  code,
  codeType,
  ...rest
}: Props & Partial<SseEditorCode>) => {

  /* ---------- 2. 渲染 ---------- */
  return (
    <Tabs
      {...rest}
      defaultValue={"code"}
      className={`flex flex-col h-full ${rest.className ?? ""}`}
    >
      {/* 顶部栏 */}
      <div className="flex justify-between">
        <TabsList className="bg-transparent">
          <TabsTrigger value="preview">预览</TabsTrigger>
          <TabsTrigger value="code">代码</TabsTrigger>
        </TabsList>
        <Button onClick={onClose} variant="ghost" size="icon">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 预览区 */}
      <TabsContent value="preview" className="flex-1 overflow-hidden bg-white">
        {code ? (
          <iframe
            srcDoc={code}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            title="preview"
          />
        ) : (
          // 无数据时给点占位
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            暂无代码
          </div>
        )}
      </TabsContent>
      <TabsContent value="code" className="overflow-auto">
        {/* <div className="whitespace-pre style__scoller-none">{code?.code}</div> */}
        {code && (
          <CodeBlock
            code={code}
            language={codeType ?? "html"}
            showLineNumbers={true}
          >
            <CodeBlockCopyButton />
          </CodeBlock>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default CodeEditorBar;
