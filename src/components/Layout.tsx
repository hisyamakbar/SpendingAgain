import React from 'react';
import { LayoutDashboard, History, PlusCircle, Sparkles, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  showChatInput?: boolean;
  onSendMessage?: (message: string) => void;
  chatInputValue?: string;
  onChatInputChange?: (value: string) => void;
}

export function Layout({ 
  children, 
  currentView, 
  onViewChange, 
  showChatInput = false,
  onSendMessage,
  chatInputValue = '',
  onChatInputChange
}: LayoutProps) {
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInputValue.trim() && onSendMessage) {
      onSendMessage(chatInputValue.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface)] border-b border-gray-700 h-16 flex items-center justify-center">
        <a 
          href="https://bolt.new/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105"
        >
          <img 
            src="/poweredby_360w.png" 
            alt="Powered by Bolt" 
            className="h-8"
          />
        </a>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-20 max-w-6xl mx-auto w-full px-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showChatInput ? (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-gray-700 p-4">
          <form onSubmit={handleChatSubmit} className="max-w-6xl mx-auto flex gap-3">
            <input
              type="text"
              value={chatInputValue}
              onChange={(e) => onChatInputChange?.(e.target.value)}
              placeholder="Ask me anything about your finances..."
              className="flex-1 bg-[var(--background)] border border-gray-600 rounded-lg px-4 py-3 input-focus text-[var(--text)]"
            />
            <button
              type="submit"
              disabled={!chatInputValue.trim()}
              className="button-primary px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-gray-700 h-20">
          <div className="max-w-6xl mx-auto h-full flex items-center justify-around px-4">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'transactions', icon: History, label: 'Transactions' },
              { id: 'add', icon: PlusCircle, label: 'Add', isMain: true },
              { id: 'ai', icon: Sparkles, label: 'AI Assistant' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map(({ id, icon: Icon, label, isMain }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`nav-item flex flex-col items-center justify-center p-2 rounded-lg ${
                  currentView === id ? 'active' : ''
                } ${isMain ? 'bg-[var(--primary)] text-[var(--background)] scale-110' : ''}`}
                aria-label={label}
              >
                <Icon size={isMain ? 28 : 24} />
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}