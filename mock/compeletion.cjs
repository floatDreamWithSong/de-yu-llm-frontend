// Mock completion API 实现 SSE 流式响应
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 模拟响应文件列表
const mockFiles = [
  'mock1.txt',
  'mock2.txt', 
  'mock3.txt'
];

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

// 随机选择模拟文件
function getRandomMockFile() {
  const randomIndex = Math.floor(Math.random() * mockFiles.length);
  return mockFiles[randomIndex];
}

// 读取并解析模拟文件
function readMockFile(filename) {
  try {
    const filePath = path.join(__dirname, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n');
  } catch (error) {
    console.error('读取模拟文件失败:', error);
    return [];
  }
}

// 模拟流式响应
app.post('/v1/completions', (req, res) => {
  console.log('收到completion请求:', JSON.stringify(req.body, null, 2));
  
  // 随机选择模拟文件
  const selectedFile = getRandomMockFile();
  console.log('选择模拟文件:', selectedFile);
  
  // 读取模拟文件内容
  const mockLines = readMockFile(selectedFile);
  if (mockLines.length === 0) {
    res.status(500).json({ error: '无法读取模拟文件' });
    return;
  }
  
  // 设置SSE响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const conversationId = req.body.conversationId || generateId();
  let lineIndex = 0;

  const sendNextLine = () => {
    if (lineIndex < mockLines.length) {
      const line = mockLines[lineIndex].trim();
      
      if (line) {
        // 直接发送原始行数据
        res.write(line + '\n');
        console.log('发送行:', line);
      }
      
      lineIndex++;
      
      // 随机延迟，模拟真实的流式输出
      setTimeout(sendNextLine, Math.random() * 50 + 20);
    } else {
      // 发送结束信号
      res.write(`id: ${Date.now()}\n`);
      res.write(`type: end\n`);
      res.write(`data: {}\n\n`);
      res.end();
      console.log('模拟响应完成');
    }
  };

  // 开始发送流式数据
  setTimeout(sendNextLine, 100);
});

// 创建对话接口
app.post('/v1/conversation/create', (req, res) => {
  const conversationId = generateId();
  console.log('创建新对话:', conversationId);
  
  res.json({
    code: 200,
    msg: "success",
    data: {
      conversationId: conversationId,
      success: true
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /v1/completions - 流式对话接口');
  console.log('  POST /v1/conversation/create - 创建对话接口');
});