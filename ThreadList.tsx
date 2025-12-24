import React from 'react';
import { Thread } from '../types';

interface ThreadListProps {
  threads: Thread[];
  onSelect: (thread: Thread) => void;
  onNew: () => void;
}

const ThreadList: React.FC<ThreadListProps> = ({ threads, onSelect, onNew }) => {
  return (
    <div className="flex-1">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center mt-12 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 text-zinc-700">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <h3 className="text-zinc-400 font-medium">No saved chats</h3>
            <p className="text-zinc-600 text-sm mt-1">Start a new thread to get rizz.</p>
            <button onClick={onNew} className="mt-4 px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-600/30 transition-colors">
               Create first chat
            </button>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {threads.map((thread, i) => (
              <button
                key={thread.id}
                onClick={() => onSelect(thread)}
                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-900/50 active:bg-zinc-900 transition-colors text-left group animate-in slide-in-from-bottom-2 fill-mode-backwards"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-300 font-bold text-lg border border-indigo-500/10 group-hover:border-indigo-500/30 shadow-sm relative overflow-hidden">
                   <span className="relative z-10">{thread.contactName.charAt(0).toUpperCase()}</span>
                   {thread.settings.spicyMode && <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold text-zinc-200 truncate">{thread.contactName}</h3>
                    <span className="text-xs text-zinc-600 whitespace-nowrap ml-2">
                      {new Date(thread.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 truncate group-hover:text-zinc-400">
                    {thread.settings.spicyMode ? '🔥 ' : ''}{thread.previewText || "No messages yet"}
                  </p>
                </div>
                <div className="text-zinc-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </button>
            ))}
          </div>
        )}
    </div>
  );
};

export default ThreadList;