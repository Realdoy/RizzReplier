import React, { useRef, useEffect } from 'react';
import { ChatTurn, Speaker } from '../types';

interface ChatEditorProps {
  turns: ChatTurn[];
  onChange: (turns: ChatTurn[]) => void;
  onAddMessage: () => void;
}

const ChatEditor: React.FC<ChatEditorProps> = ({ turns, onChange }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns.length]);

  const handleTextChange = (id: string, newText: string) => {
    const newTurns = turns.map(t => t.id === id ? { ...t, text: newText } : t);
    onChange(newTurns);
  };

  const toggleSpeaker = (id: string) => {
    const newTurns = turns.map(t => 
      t.id === id ? { ...t, speaker: t.speaker === Speaker.ME ? Speaker.THEM : Speaker.ME } : t
    );
    onChange(newTurns);
  };

  const removeTurn = (id: string) => {
    onChange(turns.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-black/20">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 safe-pb scroll-smooth">
        {turns.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-600 gap-3 opacity-60">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <p className="text-sm font-medium">No messages yet.</p>
            <p className="text-xs">Upload a screenshot or add text below.</p>
          </div>
        )}
        
        {turns.map((turn) => {
          const isMe = turn.speaker === Speaker.ME;
          return (
            <div key={turn.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group relative animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              
              {/* Message Bubble */}
              <div 
                className={`max-w-[85%] rounded-2xl p-3 relative transition-all shadow-sm
                  ${isMe 
                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                    : 'bg-zinc-800 text-zinc-100 rounded-bl-sm border border-zinc-700'}`}
              >
                <textarea
                  value={turn.text}
                  onChange={(e) => handleTextChange(turn.id, e.target.value)}
                  className="w-full bg-transparent resize-none outline-none text-[15px] leading-relaxed overflow-hidden placeholder-zinc-500/50"
                  rows={Math.max(1, Math.ceil(turn.text.length / 35))}
                  style={{ minWidth: '120px' }}
                  placeholder="Type message..."
                />
                
                {/* Speaker Toggle (Hidden interaction, explicit visual) */}
                <button 
                  onClick={() => toggleSpeaker(turn.id)}
                  className="absolute -bottom-5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 opacity-60 hover:opacity-100 px-2 py-1 transition-opacity"
                  style={{ [isMe ? 'right' : 'left']: 0 }}
                >
                  {isMe ? 'You' : 'Them'} (Tap to swap)
                </button>
              </div>

              {/* Delete Action (Hover/Tap) */}
              <button 
                onClick={() => removeTurn(turn.id)}
                className={`absolute top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all
                  ${isMe ? '-left-10' : '-right-10'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          );
        })}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};

export default ChatEditor;