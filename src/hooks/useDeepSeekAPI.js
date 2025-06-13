
import { useState } from 'react';
import { toast } from 'sonner';

export const useDeepSeekAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const processFiles = async (files) => {
    const fileContents = [];

    for (const uploadedFile of files) {
      const { file } = uploadedFile;
      
      try {
        if (file.type.startsWith('image/')) {
          // For images, we'll describe them in the prompt
          fileContents.push(`[Image: ${file.name} (${file.type})]`);
        } else if (file.type === 'application/pdf') {
          fileContents.push(`[PDF Document: ${file.name} - Content analysis requested]`);
        } else if (file.type.startsWith('text/') || 
                   file.type === 'application/json' || 
                   file.type === 'text/csv' ||
                   file.name.endsWith('.txt') ||
                   file.name.endsWith('.json') ||
                   file.name.endsWith('.csv') ||
                   file.name.endsWith('.xml')) {
          // Read text-based files
          const content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result);
            reader.onerror = reject;
            reader.readAsText(file);
          });
          fileContents.push(`[File: ${file.name}]\n${content}\n[End of ${file.name}]`);
        } else {
          fileContents.push(`[File: ${file.name} (${file.type}) - Binary file, content cannot be displayed]`);
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        fileContents.push(`[Error reading file: ${file.name}]`);
      }
    }

    return fileContents.join('\n\n');
  };

  const sendMessage = async (
    message,
    apiKey,
    files = [],
    onStreamingUpdate
  ) => {
    // Use the environment variable if no API key is provided
    const effectiveApiKey = apiKey || import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    if (!effectiveApiKey) {
      toast.error('Please set your DeepSeek API key in settings');
      return null;
    }

    setIsLoading(true);
    
    try {
      // Process files if any
      let fullMessage = message;
      if (files.length > 0) {
        const fileContent = await processFiles(files);
        fullMessage = `${message}\n\n--- Attached Files ---\n${fileContent}`;
      }

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
              content: fullMessage,
            },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const responseMessage = {
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
