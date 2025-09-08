// Mock completion API 实现 SSE 流式响应
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 模拟的回复内容，用于流式输出
const mockResponse = "你好！我是德育大模型，很高兴为您服务。我可以帮助您解答各种问题，包括学习、生活、德育教育等方面。请告诉我您需要什么帮助？";

// 模拟的智能体信息
const mockBotInfo = {
  model: "deyu-default",
  botId: "default",
  botName: "德育班主任"
};

// 生成随机ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// 模拟流式响应
app.post('/v1/completions', (req, res) => {
  console.log('收到completion请求:', JSON.stringify(req.body, null, 2));
  
  // 设置SSE响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const conversationId = req.body.conversation_id || generateId();
  const messageId = generateId();
  const sectionId = generateId();
  const replyId = generateId();
  let id = 0;

  // 发送meta信息
  const metaData = {
    messageId: messageId,
    conversationId: conversationId,
    sectionId: sectionId,
    messageIndex: 0,
    conversationType: 0
  };
  
  res.write(`id: ${id++}\n`);
  res.write(`type: meta\n`);
  res.write(`data: ${JSON.stringify(metaData)}\n\n`);

  // 发送model信息
  res.write(`id: ${id++}\n`);
  res.write(`type: model\n`);
  res.write(`data: ${JSON.stringify(mockBotInfo)}\n\n`);

  // 模拟流式输出文本内容
  let currentText = "";
  const words = mockResponse.split('');
  let wordIndex = 0;

  const sendChunk = () => {
    if (wordIndex < words.length) {
      currentText += words[wordIndex];
      
      const chatData = {
        message: {
          content: JSON.stringify({
            text: currentText,
            think: "",
            suggest: ""
          }),
          contentType: 0
        },
        messageId: messageId,
        conversationId: conversationId,
        sectionId: sectionId,
        replyId: replyId,
        isDelta: true,
        status: 0,
        inputContentType: 0,
        messageIndex: 0,
        botId: mockBotInfo.botId
      };

      res.write(`id: ${id++}\n`);
      res.write(`type: chat\n`);
      res.write(`data: ${JSON.stringify(chatData)}\n\n`);
      
      wordIndex++;
      // 随机延迟，模拟真实的流式输出
      setTimeout(sendChunk, Math.random() * 100 + 50);
    } else {
      // 发送结束信号
      res.write(`id: ${id++}\n`);
      res.write(`type: end\n`);
      res.write(`data: {}\n\n`);
      res.end();
    }
  };

  // 开始发送流式数据
  setTimeout(sendChunk, 100);
});

// 创建对话接口
app.post('/v1/conversation/create', (req, res) => {
  const conversationId = generateId();
  console.log('创建新对话:', conversationId);
  
  res.json({
    conversationId: conversationId,
    success: true
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /v1/completions - 流式对话接口');
  console.log('  POST /v1/conversation/create - 创建对话接口');
});
