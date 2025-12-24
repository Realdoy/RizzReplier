import React, { useState, useEffect } from 'react';
import { geminiService } from './services/geminiService';
import { storageService } from './services/storageService';
import { NormalizedChat, Thread, Speaker, Suggestion, ChatTurn } from './types';
import ChatEditor from './components/ChatEditor';
import SettingsPanel from './components/SettingsPanel';
import ThreadList from './components/ThreadList';
import Button from './components/ui/Button';
import { Logo } from './components/ui/Logo';

const App: React.FC = () => {
  // Views: 'home' (list), 'thread' (details/chat)
  const [currentView, setCurrentView] = useState<'home' | 'thread'>('home');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  
  // UI State for Thread View
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false); // Bottom sheet toggle
  const [generatedSuggestions, setGeneratedSuggestions] = useState<Suggestion[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Load API Key Check
  useEffect(() => {
    if (!process.env.API_KEY) {
      setError("Missing API_KEY. Please configure it.");
    }
  }, []);

  // Load Threads on mount
  useEffect(() => {
    setThreads(storageService.getThreads());
  }, []);

  const handleCreateNewThread = () => {
    const name = prompt("Contact Name (e.g. Jeremy):") || "New Chat";
    const newThread = storageService.createThread(name);
    setActiveThread(newThread);
    setThreads(storageService.getThreads()); // Update list implicitly via storage
    setGeneratedSuggestions(null);
    setCurrentView('thread');
  };

  const handleSelectThread = (thread: Thread) => {
    setActiveThread(thread);
    setGeneratedSuggestions(null);
    setCurrentView('thread');
  };

  const handleBackToHome = () => {
    setGeneratedSuggestions(null);
    setShowSettings(false);
    setThreads(storageService.getThreads()); // Refresh list
    setCurrentView('home');
    setTimeout(() => setActiveThread(null), 300); // Delay clear for transition
  };

  const handleRenameThread = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering other clicks if nested
    if (!activeThread) return;
    const newName = prompt("Rename Contact:", activeThread.contactName);
    if (newName && newName.trim() !== "") {
      saveActiveThread({ contactName: newName.trim() });
    }
  };

  // --- Thread Actions ---

  const saveActiveThread = (updates: Partial<Thread>) => {
    if (!activeThread) return;
    const updated = { ...activeThread, ...updates };
    storageService.saveThread(updated);
    setActiveThread(updated);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeThread) return;

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          // Extract text
          const extracted = await geminiService.extractChatFromImage(base64);
          
          // Append new turns to existing chat
          const updatedTurns = [...activeThread.extractedChat.turns, ...extracted.turns];
          
          saveActiveThread({
            extractedChat: { turns: updatedTurns },
            updatedAt: Date.now()
          });
          
        } catch (err: any) {
          setError(err.message || "Failed to process image");
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (err) {
      setError("Error reading file");
      setIsProcessing(false);
    }
  };

  const handleAddManualMessage = () => {
    if (!activeThread) return;
    const newTurn: ChatTurn = {
      id: crypto.randomUUID(),
      speaker: Speaker.THEM,
      text: ''
    };
    saveActiveThread({
      extractedChat: { turns: [...activeThread.extractedChat.turns, newTurn] }
    });
  };

  const handleUpdateTurns = (turns: ChatTurn[]) => {
    saveActiveThread({ extractedChat: { turns } });
  };

  const handleGenerate = async () => {
    if (!activeThread) return;
    setIsProcessing(true);
    setGeneratedSuggestions(null);
    setShowSettings(false); // Close sheet to show results

    try {
      const result = await geminiService.generateReplies(activeThread.extractedChat, activeThread.settings);
      setGeneratedSuggestions(result.suggestions);
      
      // Auto-disable spicy mode if safety flag triggered closure
      if (result.mode === 'closure' && activeThread.settings.spicyMode) {
        saveActiveThread({ settings: { ...activeThread.settings, spicyMode: false } });
        alert("Spicy mode disabled for safety (disinterest detected).");
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // --- RENDER ---

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden font-sans">
      
      {/* HOME VIEW */}
      {currentView === 'home' && (
        <div className="absolute inset-0 z-10 animate-in fade-in duration-300">
           <div className="flex flex-col h-full bg-zinc-950">
            <div className="p-4 pt-12 safe-pt sticky top-0 bg-zinc-950/80 backdrop-blur-md z-10 border-b border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Logo className="w-10 h-10" />
                  <h1 className="text-2xl font-bold text-white tracking-tight">RizzReplier</h1>
                </div>
                <button 
                  onClick={handleCreateNewThread}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/30"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
              </div>
              
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input 
                  type="text" 
                  placeholder="Search contacts" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-20">
              <ThreadList threads={threads} onSelect={handleSelectThread} onNew={handleCreateNewThread} />
            </div>
          </div>
        </div>
      )}

      {/* THREAD VIEW */}
      {currentView === 'thread' && (
        <div className="absolute inset-0 z-20 flex flex-col h-full bg-zinc-950 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <header className="flex items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 safe-pt backdrop-blur-md z-30">
            <button onClick={handleBackToHome} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            
            <div className="flex flex-col items-center flex-1 mx-4">
              <div 
                className="flex items-center gap-2 cursor-pointer group px-3 py-1 rounded-lg hover:bg-zinc-800/50 transition-colors" 
                onClick={handleRenameThread}
                title="Rename chat"
              >
                <h2 className="font-semibold text-lg truncate max-w-[150px]">{activeThread?.contactName}</h2>
                <svg className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </div>
              <span className={`text-[10px] uppercase tracking-wide font-medium transition-colors ${activeThread?.settings.spicyMode ? 'text-orange-400' : 'text-zinc-500'}`}>
                {activeThread?.settings.spicyMode ? '🌶️ Spicy Mode On' : 'Standard Mode'}
              </span>
            </div>
            
            <button onClick={() => setShowSettings(true)} className={`p-2 -mr-2 transition-colors ${activeThread?.settings.spicyMode ? 'text-orange-400' : 'text-zinc-400 hover:text-white'}`}>
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </button>
          </header>

          {/* Main Chat Area */}
          <main className="flex-1 relative overflow-hidden bg-zinc-950">
            {activeThread && (
              <ChatEditor 
                turns={activeThread.extractedChat.turns} 
                onChange={handleUpdateTurns}
                onAddMessage={handleAddManualMessage}
              />
            )}
            
            {/* Error Toast */}
            {error && (
              <div className="absolute top-4 left-4 right-4 bg-red-900/90 text-red-100 p-3 rounded-xl text-sm border border-red-700 backdrop-blur-sm z-30 animate-in slide-in-from-top-4">
                {error}
                <button onClick={() => setError(null)} className="absolute top-2 right-2 opacity-50">✕</button>
              </div>
            )}

            {/* Suggestions Overlay (Bottom Sheet style) */}
            {generatedSuggestions && (
              <div className="absolute inset-x-0 bottom-0 bg-zinc-900 rounded-t-3xl shadow-2xl border-t border-zinc-800 p-6 z-30 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                       {activeThread?.settings.spicyMode ? '🌶️ Spicy Suggestions' : 'Suggestions'}
                    </h3>
                    <button onClick={() => setGeneratedSuggestions(null)} className="p-1 bg-zinc-800 rounded-full hover:bg-zinc-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                 </div>
                 <div className="space-y-3">
                   {generatedSuggestions.map((sugg, idx) => (
                     <div 
                        key={idx} 
                        onClick={() => copyToClipboard(sugg.text, idx)} 
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative group active:scale-[0.98]
                          ${activeThread?.settings.spicyMode 
                            ? 'bg-gradient-to-br from-orange-950/40 to-red-950/40 border-orange-500/20 hover:border-orange-500/40' 
                            : 'bg-zinc-800 border-zinc-700 hover:border-indigo-500/50'}`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className={`text-[10px] font-bold uppercase ${activeThread?.settings.spicyMode ? 'text-orange-400' : 'text-indigo-400'}`}>
                            {sugg.label}
                          </span>
                          {copiedIndex === idx && <span className="text-xs text-green-400 font-bold animate-pulse">Copied!</span>}
                        </div>
                        <p className="text-zinc-100 leading-relaxed font-medium">{sugg.text}</p>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </main>

          {/* Bottom Action Bar (Sticky) */}
          <div className="bg-zinc-900 border-t border-zinc-800 p-3 pb-8 safe-pb flex gap-3 z-20 items-center">
            
            {/* Upload Image Button */}
            <label className="flex flex-col items-center justify-center w-12 h-12 bg-zinc-800 rounded-full text-zinc-400 cursor-pointer hover:bg-zinc-700 active:scale-95 transition-all flex-shrink-0">
              <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isProcessing} className="hidden" />
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </label>
            
            {/* Add Text Manual Button (Persistent) */}
            <button 
              onClick={handleAddManualMessage}
              disabled={isProcessing}
              className="flex flex-col items-center justify-center w-12 h-12 bg-zinc-800 rounded-full text-zinc-400 cursor-pointer hover:bg-zinc-700 active:scale-95 transition-all flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate} 
              isLoading={isProcessing} 
              className={`flex-1 rounded-full text-base h-12 shadow-lg transition-all
                ${activeThread?.settings.spicyMode 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 shadow-orange-500/20' 
                  : 'shadow-indigo-500/20'}`}
            >
              {activeThread?.settings.spicyMode ? 'Generate Spicy 🔥' : 'Generate Rizz ✨'}
            </Button>
          </div>

          {/* Settings Bottom Sheet */}
          {showSettings && activeThread && (
            <div className="fixed inset-0 z-50 flex items-end justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowSettings(false)}></div>
              <div className="bg-zinc-900 w-full max-w-md rounded-t-3xl p-6 relative animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
                <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-6"></div>
                <SettingsPanel 
                  settings={activeThread.settings} 
                  onChange={(s) => saveActiveThread({ settings: s })} 
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;