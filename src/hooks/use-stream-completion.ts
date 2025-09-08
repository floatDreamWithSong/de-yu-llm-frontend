import { useState, useCallback } from 'react';

export interface StreamMessage {
  id: number;
  type: 'meta' | 'model' | 'chat' | 'end';
  data: Record<string, unknown>;
}

export interface CompletionRequest {
  messages: Array<{
    content: string;
    contentType: number;
    attaches: string[];
    references: string[];
    role: string;
  }>;
  completionsOption: {
    isRegen: boolean;
    selectedRegenId?: string;
    withSuggest: boolean;
    isReplace: boolean;
    useDeepThink: boolean;
    stream: boolean;
  };
  model: string;
  conversationId: string;
  replyId?: string;
  botId: string;
}

export function useStreamCompletion() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversationId, setConversationId] = useState('');

  const createConversation = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('http://localhost:3001/v1/conversation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      return data.conversationId;
    } catch (error) {
      console.error('创建对话失败:', error);
      return '';
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (isStreaming) return;

    setIsStreaming(true);
    setCurrentMessage('');

    try {
      // 如果没有对话ID，先创建一个
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation();
        setConversationId(convId);
      }

      const requestData: CompletionRequest = {
        messages: [{
          content: JSON.stringify({ text: message }),
          contentType: 0,
          attaches: [],
          references: [],
          role: 'user'
        }],
        completionsOption: {
          isRegen: false,
          withSuggest: false,
          isReplace: false,
          useDeepThink: false,
          stream: true
        },
        model: 'deyu-default',
        conversationId: convId,
        botId: 'default'
      };

      console.log('发送请求:', requestData);

      const response = await fetch('http://localhost:3001/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentId = 0;
        let currentType: StreamMessage['type'] = 'meta';
        
        for (const line of lines) {
          if (line.startsWith('id: ')) {
            currentId = Number.parseInt(line.substring(4), 10);
            continue;
          }
          if (line.startsWith('type: ')) {
            currentType = line.substring(6) as StreamMessage['type'];
            continue;
          }
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (dataStr.trim() === '{}') continue;
            
            try {
              const data = JSON.parse(dataStr);
              console.log('收到流式数据:', { id: currentId, type: currentType, data });
              
              if (currentType === 'chat' && data.message) {
                const content = JSON.parse(data.message.content);
                if (content.text) {
                  setCurrentMessage(content.text);
                }
              }
            } catch (e) {
              console.error('解析数据失败:', e, dataStr);
            }
          }
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, conversationId, createConversation]);

  return {
    isStreaming,
    currentMessage,
    sendMessage,
    conversationId
  };
}
