import React, { useState, useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatSidebar from '@/components/ChatSidebar';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import SettingsModal from '@/components/SettingsModal';
import { useDeepSeekAPI } from '@/hooks/useDeepSeekAPI';
import { toast } from 'sonner';

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  files?: UploadedFile[];
}

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isLoading } = useDeepSeekAPI();

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date(),
      messages: [],
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (content: string, files: UploadedFile[] = []) => {
    if (!currentChatId) {
      createNewChat();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      files: files.length > 0 ? files : undefined,
    };

    // Add user message
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, userMessage],
            title: chat.messages.length === 0 ? (content || 'File upload').slice(0, 50) + '...' : chat.title
          }
        : chat
    ));

    // Initialize streaming message
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
    };
    setStreamingMessage(assistantMessage);

    // Send to API with files
    const response = await sendMessage(content, apiKey, files, (streamingContent) => {
      setStreamingMessage(prev => prev ? { ...prev, content: streamingContent } : null);
    });

    if (response) {
      // Add completed message
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, response] }
          : chat
      ));
    }

    setStreamingMessage(null);
  };

  const handleStopGeneration = () => {
    setStreamingMessage(null);
    toast.info('Generation stopped');
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    setSidebarOpen(false);
  };

  // Create initial chat if none exists
  useEffect(() => {
    if (chats.length === 0) {
      createNewChat();
    }
  }, []);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={createNewChat}
        onSettingsOpen={() => setSettingsOpen(true)}
        chatHistory={chats}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">DeepSeek Chat</h1>
              <p className="text-sm text-gray-500">AI-powered conversation</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !streamingMessage && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="max-w-md space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl text-white font-bold">DS</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Welcome to DeepSeek</h2>
                <p className="text-gray-600">
                  Start a conversation with AI. Ask me anything - from coding help to creative writing, 
                  analysis, or general questions.
                </p>
                <div className="text-sm text-gray-500">
                  <p>💡 Pro tip: Set your API key in settings to enable real AI responses</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {streamingMessage && (
            <ChatMessage message={streamingMessage} isStreaming={true} />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStopGeneration={handleStopGeneration}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />
    </div>
  );
};

export default Index;
