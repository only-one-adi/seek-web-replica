
import { useState } from 'react';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const useDeepSeekAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (
    message: string,
    apiKey: string,
    onStreamingUpdate?: (content: string) => void
  ): Promise<Message | null> => {
    // Use the environment variable if no API key is provided
    const effectiveApiKey = apiKey || import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    if (!effectiveApiKey) {
      toast.error('Please set your DeepSeek API key in settings');
      return null;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveApiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: message,
            },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const responseMessage: Message = {
        id: Date.now().toString(),
        content: '',
        role: 'assistant',
        timestamp: new Date(),
      };

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  responseMessage.content += content;
                  if (onStreamingUpdate) {
                    onStreamingUpdate(responseMessage.content);
                  }
                }
              } catch (e) {
                // Skip malformed JSON
                continue;
              }
            }
          }
        }
      }

      return responseMessage;
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      toast.error('Failed to get response from DeepSeek API');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
  };
};
