import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, HelpCircle, Calendar, FileText, Volume2, Mic, MicOff, Loader2, BookOpen, Clock, Lightbulb } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIAssistantProps {
  academicLevel: 'School' | 'College' | 'University' | 'Teacher' | 'All';
  isStudentVerified: boolean;
  onSpeak: (text: string) => void;
}

export default function AIAssistant({ academicLevel, isStudentVerified, onSpeak }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### 🎓 Welcome to EduVerse AI Suite!
Your persistent academic study assistant is fully active. Here are the core functions I can help you with:

* 💬 **Ask Academic Questions & Explain Concepts** (e.g. Newton's Laws)
* 📚 **Recommend Books** (e.g. for competitive exam JEE preparation)
* 📅 **Suggest Study Plans & Timetables**
* ✏️ **Solve Basic Problems & Mathematics**
* 📝 **Generate Notes & Summarize Chapters**

Choose from the quick mode filters on the left or click any of the **Example Queries** below to begin instantly!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [activeType, setActiveType] = useState<'general' | 'doubt' | 'planner' | 'notes'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Subject and Target hours for Study planner extra widgets
  const [subject, setSubject] = useState('');
  const [studyHours, setStudyHours] = useState('3');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice recognition logic
  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not natively supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() && activeType !== 'planner') return;

    let finalPrompt = textToSend;
    if (activeType === 'planner') {
      const selectedSubject = subject.trim() || 'General Science & Mathematics';
      finalPrompt = `Generate a rigorous ${studyHours}-hour per day study schedule for ${selectedSubject}. Focus on ${academicLevel} level concepts. Base criteria: ${textToSend || 'General exam readiness'}`;
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend || `Study plan for "${subject || 'General science'}" (${studyHours} hrs/day)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: activeType
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          type: activeType,
          context: {
            academicLevel,
            hoursPerDay: studyHours,
            subject: subject || 'Science'
          }
        })
      });

      if (!response.ok) throw new Error('Network error');
      const data = await response.json();

      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error(err);
      // Hard fallback if backend goes raw
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: `### ❌ Connection Interrupted\n\nI was unable to synchronize with the main university computational clusters. However, here is a helpful study tip: spacing reviews across 4 days creates robust cognitive synapses for the standard *${academicLevel}* syllabus. Check the catalog for relevant materials.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPresetQuery = (type: 'doubt' | 'planner' | 'notes', text: string) => {
    setActiveType(type);
    if (type === 'planner') {
      setSubject(text);
      setStudyHours('4');
    } else {
      setInputText(text);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 grid grid-cols-1 lg:grid-cols-4 min-h-[650px] transition-all" id="ai-assistant-suite">
      
      {/* Sidebar Tool selection */}
      <div className="p-6 bg-slate-50 dark:bg-slate-950/70 border-r border-slate-200/60 dark:border-slate-800/60 space-y-5 lg:col-span-1 rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-2 text-base">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span>EduVerse Helper Suite</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Toggle high-fidelity modes optimizing for your level: <strong className="text-blue-500">{academicLevel}</strong>
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setActiveType('general')}
            id="ai-tool-general"
            className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeType === 'general'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-700/50'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <p className="font-bold">24/7 Academic Chat</p>
              <p className="text-[10px] opacity-80 font-normal">General consultations</p>
            </div>
          </button>

          <button
            onClick={() => setActiveType('doubt')}
            id="ai-tool-doubt"
            className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeType === 'doubt'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-700/50'
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <p className="font-bold">Doubt Solving Engine</p>
              <p className="text-[10px] opacity-80 font-normal">Step-by-step calculus & STEM</p>
            </div>
          </button>

          <button
            onClick={() => setActiveType('planner')}
            id="ai-tool-planner"
            className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeType === 'planner'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-700/50'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <p className="font-bold">Study Planner Program</p>
              <p className="text-[10px] opacity-80 font-normal">Weekly schedules & timesheets</p>
            </div>
          </button>

          <button
            onClick={() => setActiveType('notes')}
            id="ai-tool-notes"
            className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeType === 'notes'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-700/50'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <p className="font-bold">Interactive Revision Notes</p>
              <p className="text-[10px] opacity-80 font-normal">Summarize books with cues</p>
            </div>
          </button>
        </div>

        {/* Dynamic Context Widgets */}
        {activeType === 'planner' && (
          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-3 animate-fadeIn">
            <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300">Planner Context Settings</h4>
            
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Subject name</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Advanced Calculus"
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Hours Per Day available</label>
              <select
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900 focus:outline-none"
              >
                <option value="2">2 Hours - Light revision</option>
                <option value="3">3 Hours - Balanced</option>
                <option value="5">5 Hours - Critical Exam prep</option>
                <option value="8">8 Hours - Research Marathon</option>
              </select>
            </div>
          </div>
        )}

        {/* Recommended Prompts */}
        <div className="pt-2">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Example Queries</p>
          <div className="space-y-1.5">
            <button
              onClick={() => loadPresetQuery('doubt', "Explain Newton's Laws.")}
              className="w-full text-[11px] text-left p-2 rounded bg-white dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/30 truncate"
              title="Explain Newton's Laws."
            >
              💡 Explain Newton's Laws.
            </button>
            <button
              onClick={() => loadPresetQuery('general', "Recommend books for JEE preparation.")}
              className="w-full text-[11px] text-left p-2 rounded bg-white dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/30 truncate"
              title="Recommend books for JEE preparation."
            >
              📚 Recommend books for JEE preparation.
            </button>
            <button
              onClick={() => loadPresetQuery('planner', "Create a study timetable.")}
              className="w-full text-[11px] text-left p-2 rounded bg-white dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/30 truncate"
              title="Create a study timetable."
            >
              📅 Create a study timetable.
            </button>
            <button
              onClick={() => loadPresetQuery('doubt', "Solve mathematical problems.")}
              className="w-full text-[11px] text-left p-2 rounded bg-white dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/30 truncate"
              title="Solve mathematical problems."
            >
              ✏️ Solve mathematical problems.
            </button>
          </div>
        </div>

      </div>

      {/* Main chat window */}
      <div className="lg:col-span-3 flex flex-col bg-slate-50/20 dark:bg-slate-900/20">
        
        {/* Chat Status Header */}
        <div className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl text-white ${
              activeType === 'doubt' ? 'bg-indigo-600' :
              activeType === 'planner' ? 'bg-purple-600' :
              activeType === 'notes' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-950 dark:text-white text-sm">
                  {activeType === 'doubt' ? 'Doubt-Solver Mode' :
                   activeType === 'planner' ? 'High-Performance Planner' :
                   activeType === 'notes' ? 'Interactive Note Generator' : 'Standard Academic AI'}
                </span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <p className="text-[11px] text-slate-400">Powered by server-side Gemini 3.5 AI</p>
            </div>
          </div>
          
          <div className="text-xs text-indigo-600 bg-indigo-50 dark:bg-slate-800 dark:text-indigo-400 px-3 py-1 rounded-full font-bold">
            {isStudentVerified ? 'Scholar Pack Enabled' : 'Standard Student Account'}
          </div>
        </div>

        {/* Message timeline container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[460px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              id={`chat-msg-${msg.id}`}
            >
              {/* Profile initial */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-2 shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white ring-blue-100 dark:ring-blue-900/50' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-indigo-100 dark:ring-indigo-900/50'
              }`}>
                {msg.sender === 'user' ? 'ME' : 'AI'}
              </div>

              {/* Message balloon */}
              <div className="max-w-[85%] group">
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-700/80 rounded-tl-none'
                }`}>
                  {/* Handle formatted Markdown header replacements beautifully */}
                  <div className="prose dark:prose-invert max-w-none text-left break-words space-y-2">
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (line.startsWith('###')) {
                        return <h4 key={lIdx} className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 pr-2 pt-2">{line.replace('###', '').trim()}</h4>;
                      }
                      if (line.startsWith('####')) {
                        return <h5 key={lIdx} className="font-bold text-xs text-sky-600 dark:text-sky-400 pl-1 pt-1.5">{line.replace('####', '').trim()}</h5>;
                      }
                      if (line.startsWith('* **') || line.startsWith('- **') || line.startsWith('**')) {
                        return (
                          <div key={lIdx} className="mt-1 pl-1">
                            <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2" />
                            <strong>{line.replace(/^[*-\s]+|\*+/g, '').split('::')[0]}</strong>
                            {line.includes('::') ? ' ' + line.split('::')[1] : ''}
                          </div>
                        );
                      }
                      if (line.startsWith('*') || line.startsWith('-')) {
                        return <p key={lIdx} className="pl-4 text-xs text-slate-600 dark:text-slate-300 list-disc">• {line.slice(1).trim()}</p>;
                      }
                      if (line.startsWith('|')) {
                        // Render standard clean grid helper representation as text
                        return <p key={lIdx} className="font-semibold text-xs py-1 px-2.5 bg-slate-50 dark:bg-slate-900 border-l-2 border-indigo-500 font-mono scroll-x-auto text-emerald-600 dark:text-emerald-400">{line}</p>;
                      }
                      if (line.includes('`')) {
                        const chunks = line.split('`');
                        return (
                          <p key={lIdx} className="text-xs">
                            {chunks.map((ch, cIndex) => 
                              cIndex % 2 === 1 
                                ? <code key={cIndex} className="bg-slate-100 dark:bg-slate-900 dark:text-pink-400 text-pink-600 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">{ch}</code> 
                                : ch
                            )}
                          </p>
                        );
                      }
                      return line.trim() ? <p key={lIdx} className="text-xs leading-relaxed">{line}</p> : <div key={lIdx} className="h-2" />;
                    })}
                  </div>
                </div>

                {/* Micro Actions, Timestamp + Text-To-Speech Button */}
                <div className={`flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => onSpeak(msg.text)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition"
                      title="Listen with Text-to-Speech"
                      id={`tts-${msg.id}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-100 animate-pulse">
                AI
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-[70%]">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-300">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Solving academic queries...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            {/* Speech Recognition Mic trigger */}
            <button
              type="button"
              onClick={handleVoiceInput}
              id="voice-input-btn-assistant"
              className={`p-3 rounded-xl transition ${
                isListening
                  ? 'bg-red-500 text-white animate-ping'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Voice Input Helper"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeType === 'doubt' ? "Ask any double integrals, mechanics equations or code questions..." :
                activeType === 'planner' ? "Focus area (e.g. Molecular Biology exam preparations)" :
                activeType === 'notes' ? "Enter content or book topic to turn into high-yield revision flashcards..." :
                "Ask EduVerse AI anything..."
              }
              className="flex-1 bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-left"
              id="assistant-chat-text-input"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && activeType !== 'planner')}
              id="ai-send-btn"
              className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-md shadow-blue-500/10"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Guidelines info */}
          <div className="flex justify-between items-center mt-2.5 text-[10px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>Standard 3-4 day fast delivery option applied on store orders.</span>
            </span>
            <span>Character Limit: 500</span>
          </div>
        </div>

      </div>
    </div>
  );
}
