'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Play, Copy, Download, Send, Sparkles } from '@radix-ui/react-icons';
import { useChat } from 'ai/react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');
  const [codeOutput, setCodeOutput] = useState('');
  const editorRef = useRef(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, append } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `🤖 Welcome to Gibean AI!

I can:
- Generate code (React, Python, JS, etc)
- Debug & fix errors  
- Explain code
- Create full apps

Try: "Build a Todo app in React" 👇`
      }
    ]
  });

  const runCode = () => {
    try {
      const func = new Function(codeOutput);
      func();
      console.log('✅ Code executed!');
    } catch (error) {
      console.error('❌ Code error:', error);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeOutput);
    // Toast notification
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 overflow-hidden">
      {/* Top Bar */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                BlackBox AI
              </h1>
              <p className="text-sm text-gray-400">AI Code Generation - Free</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm border border-white/20 transition-all">
              Upgrade
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold shadow-lg transition-all">
              New Chat
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left: Chat */}
        <div className="border-r border-white/10">
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <AnimatePresence>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-2xl p-6 rounded-2xl ${
                      m.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'bg-white/10 backdrop-blur-xl border border-white/20'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-white/80">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-8 border-t border-white/10">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask AI to code anything..."
                  className="flex-1 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-4 ring-blue-500/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all flex items-center justify-center disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Code Editor */}
        <div className="bg-black/20 backdrop-blur-xl">
          <div className="h-full flex flex-col">
            {/* Editor Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                  LIVE EDITOR
                </div>
                <span className="text-white/80 text-sm">JavaScript</span>
              </div>
              <div className="flex gap-2">
                <button onClick={copyCode} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  <Copy className="w-4 h-4 text-white/70" />
                </button>
                <button onClick={runCode} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  <Play className="w-4 h-4 text-white/70" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  <Download className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                defaultValue="// AI Generated Code will appear here...\nconsole.log('Hello BlackBox AI!');"
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on'
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                  // Update code from AI response
                  const updateCode = (code) => {
                    editor.setValue(code);
                    setCodeOutput(code);
                  };
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
