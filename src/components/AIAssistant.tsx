import React, { useState, useRef, useEffect } from 'react';
import { Send, ImagePlus, Bot, User } from 'lucide-react';
import { ChatMessage, Transaction, Settings } from '../types';
import { sendMessageToAI } from '../utils/ai';

interface AIAssistantProps {
  transactions: Transaction[];
  settings: Settings | null;
  onAddTransaction: (transaction: Transaction) => void;
}

export function AIAssistant({ transactions, settings, onAddTransaction }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: 'Hello! I\'m your financial assistant. I can help you add transactions, analyze your spending, and provide financial advice. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (!settings?.aiApiKey) {
        const errorMessage: ChatMessage = {
          id: `msg_${Date.now()}_error`,
          type: 'ai',
          content: 'Please configure your AI settings in the Settings page to use the AI assistant.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      const { response, action } = await sendMessageToAI(
        messageContent,
        messages,
        settings,
        transactions
      );

      // Handle AI actions
      if (action && action.action === 'add_transaction') {
        const transaction: Transaction = {
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: action.payload.type,
          amount: action.payload.amount,
          description: action.payload.description,
          category: action.payload.category,
          currency: action.payload.currency || 'USD',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        onAddTransaction(transaction);
      }

      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        type: 'ai',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        type: 'ai',
        content: 'Sorry, I encountered an error processing your request. Please check your AI configuration in Settings.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full py-6">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 mb-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user' 
                ? 'bg-[var(--primary)]' 
                : 'bg-[var(--surface)] border border-gray-600'
            }`}>
              {message.type === 'user' ? (
                <User size={16} className="text-white" />
              ) : (
                <Bot size={16} className="text-[var(--text)]" />
              )}
            </div>
            
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.type === 'user' 
                ? 'chat-bubble-user text-white' 
                : 'chat-bubble-ai'
            }`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--surface)] border border-gray-600 flex items-center justify-center">
              <Bot size={16} className="text-[var(--text)]" />
            </div>
            <div className="chat-bubble-ai p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">Quick actions:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'Add expense $50 for lunch',
            'What was my biggest expense this month?',
            'Show my spending by category',
            'Give me some saving tips'
          ].map(suggestion => (
            <button
              key={suggestion}
              onClick={() => handleSendMessage(suggestion)}
              className="text-xs bg-[var(--surface)] border border-gray-600 rounded-full px-3 py-1 hover:bg-gray-700 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}