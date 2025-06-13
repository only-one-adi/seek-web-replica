
import React from 'react';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  };
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex space-x-4 p-6 ${isUser ? 'bg-transparent' : 'bg-gray-50/50'}`}>
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
            : 'bg-gradient-to-r from-blue-600 to-cyan-600'
        }`}>
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            {isUser ? 'You' : 'DeepSeek'}
          </span>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className={`prose prose-sm max-w-none ${isUser ? 'text-gray-900' : 'text-gray-800'}`}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && <span className="animate-pulse">▊</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
