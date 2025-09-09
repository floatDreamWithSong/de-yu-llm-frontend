# 德育大模型前端 Demo

这是一个基于设计文档实现的德育大模型前端demo，展示了完整的对话流程和流式消息处理功能。

## 功能特性

- ✅ 完整的对话创建和跳转流程
- ✅ 消息列表管理和显示
- ✅ 完整的SSE流式响应处理
- ✅ 符合设计文档的API结构
- ✅ 实时控制台日志输出
- ✅ 用户界面集成
- ✅ Mock服务器实现

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动Mock服务器

```bash
pnpm run mock
```

Mock服务器将在 `http://localhost:3001` 启动，提供以下接口：
- `POST /v1/conversation/create` - 创建对话
- `POST /v1/completions` - 流式对话接口

### 3. 启动前端应用

```bash
pnpm run dev
```

前端应用将在 `http://localhost:3000` 启动。

## 使用方法

1. 打开浏览器访问 `http://localhost:3000`
2. 在首页输入框中输入消息（支持Ctrl+Enter或点击提交按钮）
3. 系统会自动创建对话并跳转到对话页面
4. 在对话页面可以看到消息列表和流式AI回复
5. 可以继续在对话页面发送新消息
6. 观察控制台输出，查看流式消息处理过程

## API设计

### 请求格式

```json
{
  "messages": [
    {
      "content": "{\"text\": \"用户消息内容\"}",
      "contentType": 0,
      "attaches": [],
      "references": [],
      "role": "user"
    }
  ],
  "completionsOption": {
    "isRegen": false,
    "withSuggest": false,
    "isReplace": false,
    "useDeepThink": false,
    "stream": true
  },
  "model": "deyu-default",
  "conversationId": "conversation_id",
  "botId": "default"
}
```

### SSE响应格式

```
id: 0
type: meta
data: {"messageId": "...", "conversationId": "...", "sectionId": "...", "messageIndex": 0, "conversationType": 0}

id: 1
type: model
data: {"model": "deyu-default", "botId": "default", "botName": "德育班主任"}

id: 2
type: chat
data: {"message": {"content": "{\"text\": \"你好！我是德育大模型...\"}", "contentType": 0}, "messageId": "...", ...}

id: 3
type: end
data: {}
```

## 技术实现

- **前端**: React + TypeScript + Vite
- **路由**: TanStack Router
- **Mock服务器**: Express.js + CORS
- **流式处理**: Server-Sent Events (SSE)
- **状态管理**: React Hooks
- **UI组件**: Radix UI + Tailwind CSS

## 文件结构

```
src/
├── hooks/
│   └── use-stream-completion.ts    # 流式消息处理Hook
├── app/chat/
│   ├── ChatPage.tsx                # 首页聊天页面
│   ├── ConversationPage.tsx        # 对话页面
│   ├── route.ts                    # 路由配置
│   └── components/
│       └── UserPromptTextarea.tsx  # 用户输入组件
├── apis/requests/
│   ├── completion.ts               # API类型定义
│   └── create-conversation.ts      # 创建对话API
└── mock/
    └── compeletion.cjs             # Mock服务器实现
```

## 对话流程

1. **首页输入**: 用户在ChatPage输入消息
2. **创建对话**: 调用API创建新的对话ID
3. **页面跳转**: 跳转到ConversationPage，传递初始消息
4. **消息处理**: 在ConversationPage中处理流式响应
5. **消息列表**: 显示完整的对话历史
6. **继续对话**: 用户可以继续发送新消息

## 控制台输出

当发送消息时，控制台会显示：
- 发送的请求数据
- 接收到的SSE流式数据
- 解析后的消息内容
- 错误信息（如果有）

## 注意事项

1. 确保Mock服务器在端口3001运行
2. 前端应用在端口3000运行
3. 支持跨域请求（CORS已配置）
4. 流式响应会逐步显示AI回复内容
