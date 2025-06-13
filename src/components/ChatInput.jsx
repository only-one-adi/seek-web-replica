
import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from './FileUpload';

const ChatInput = ({ onSendMessage, isLoading, onStopGeneration }) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((message.trim() || files.length > 0) && !isLoading) {
      onSendMessage(message.trim(), files);
      setMessage('');
      setFiles([]);
      setShowFileUpload(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="space-y-3">
          {/* File Upload Section */}
          {showFileUpload && (
            <div className="border border-gray-200 rounded-lg p-3">
              <FileUpload
                files={files}
                onFilesChange={setFiles}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Input Section */}
          <div className="relative flex items-end space-x-3">
            <div className="flex-shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowFileUpload(!showFileUpload)}
                disabled={isLoading}
                className={`${showFileUpload ? 'bg-purple-100 text-purple-600' : ''}`}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={files.length > 0 ? "Ask about your files..." : "Ask DeepSeek anything..."}
                className="min-h-[60px] max-h-32 resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-12"
                disabled={isLoading}
              />
            </div>
            <div className="flex-shrink-0">
              {isLoading ? (
                <Button
                  type="button"
                  onClick={onStopGeneration}
                  variant="outline"
                  size="sm"
                  className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                >
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!message.trim() && files.length === 0}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift + Enter for new line
          {files.length > 0 && <span className="mx-2">•</span>}
          {files.length > 0 && `${files.length} file${files.length > 1 ? 's' : ''} attached`}
        </p>
      </form>
    </div>
  );
};

export default ChatInput;
