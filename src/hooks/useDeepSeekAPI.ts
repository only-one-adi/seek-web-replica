
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
    if (!apiKey) {
      toast.error('Please set your DeepSeek API key in settings');
      return null;
    }

    setIsLoading(true);
    
    try {
      // For now, we'll simulate the API call since the real integration needs environment setup
      // This is where you would integrate with the actual DeepSeek API
      
      // Simulate streaming response
      const responseMessage: Message = {
        id: Date.now().toString(),
        content: '',
        role: 'assistant',
        timestamp: new Date(),
      };

      const mockResponse = `Thank you for your message: "${message}". I'm a DeepSeek AI assistant ready to help you with various tasks including coding, analysis, creative writing, and answering questions. 

Once you've configured your actual DeepSeek API key in the environment variables, I'll be able to provide real AI-powered responses. For now, this is a simulated response to demonstrate the interface.

How can I assist you today?`;

      // Simulate streaming
      for (let i = 0; i < mockResponse.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20));
        responseMessage.content = mockResponse.slice(0, i + 1);
        if (onStreamingUpdate) {
          onStreamingUpdate(responseMessage.content);
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
