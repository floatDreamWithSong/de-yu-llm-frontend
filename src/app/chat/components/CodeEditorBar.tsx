import type { SseEditorCode } from "@/apis/requests/conversation/schema";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { useRef, useEffect, useState } from "react";

import { loader } from "@monaco-editor/react";

loader.config({
  paths: {
    vs: "https://registry.npmmirror.com/monaco-editor/0.52.2/files/min/vs",
  },
});

type Props = Omit<React.ComponentProps<"div">, "dir"> & {
  onClose: () => unknown;
};

const useSystemTheme = () => {
  // const [theme, setTheme] = useState<'light' | 'vs-dark'>(
  //   window.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'light'
  // );
  // useEffect(() => {
  //   const m = window.matchMedia('(prefers-color-scheme: dark)');
  //   const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? 'vs-dark' : 'light');
  //   m.addEventListener('change', handler);
  //   return () => m.removeEventListener('change', handler);
  // }, []);
  // return theme;
  return "light";
};

const CodeEditorBar = ({
  onClose,
  code = "",
  codeType = "html",
  ...rest
}: Props & Partial<SseEditorCode>) => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const editorRef = useRef<any>(null);
  const theme = useSystemTheme();
  const [localCode, setLocalCode] = useState(code);

  /* ---------- 自动滚动到底 ---------- */
  useEffect(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    model.setValue(localCode);

    // 滚动到最后一行
    const lastLine = model.getLineCount();
    editor.revealLine(lastLine);
  }, [localCode]);
  useEffect(() => {
    setLocalCode(code);
  }, [code]);
  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setLocalCode(value);
  };
  return (
    <Tabs
      {...rest}
      defaultValue="code"
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
        {localCode ? (
          <iframe
            srcDoc={localCode}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            title="preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            暂无代码
          </div>
        )}
      </TabsContent>

      {/* 代码区 */}
      <TabsContent value="code" className="overflow-hidden">
        <Editor
          language={codeType}
          value={localCode}
          theme={theme}
          // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
          onMount={(editor) => (editorRef.current = editor)}
          onChange={handleEditorChange}
          options={{
            readOnly: false, // ✅ 可编辑
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true, // 父级尺寸变化时自动重算
            fontSize: 14,
            wordWrap: "on",
          }}
        />
      </TabsContent>
    </Tabs>
  );
};

export default CodeEditorBar;
