
import React from 'react';
import { User, Bot, File, Image, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatMessage = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.includes('text') || file.type.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = (file) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        
        {/* Files Section */}
        {message.files && message.files.length > 0 && (
          <div className="space-y-2 mb-3">
            {message.files.map((uploadedFile) => {
              const FileIcon = getFileIcon(uploadedFile.file);
              return (
                <div
                  key={uploadedFile.id}
                  className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt="Uploaded"
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ) : (
                    <FileIcon className="w-10 h-10 text-gray-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(uploadedFile.file)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Message Content */}
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
