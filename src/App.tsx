import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, FileText, Table, MessageSquare, Send, Upload, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface Resolution {
  planName: string;
  penaltyWaived: string;
  extension: string;
  nextDue: string;
  summary: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bylaws, setBylaws] = useState<File | null>(null);
  const [records, setRecords] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isResolutionOpen, setIsResolutionOpen] = useState(true);
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', input);
      formData.append('chatHistory', JSON.stringify(messages));
      if (bylaws) formData.append('bylaws', bylaws);
      if (records) formData.append('records', records);
      if (csvFile) formData.append('csv', csvFile);

      const response = await fetch('/api/arbitrate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const aiText = data.text;
      
      // Parse resolution if present
      const resolutionMatch = aiText.match(/\[RESOLUTION_DRAFT\]\s*([\s\S]*?)\s*\[\/RESOLUTION_DRAFT\]/);
      if (resolutionMatch) {
        try {
          const parsed = JSON.parse(resolutionMatch[1]);
          setResolution(parsed);
          setIsResolutionOpen(true);
        } catch (e) {
          console.error("Failed to parse resolution JSON", e);
        }
      }

      const cleanText = aiText.replace(/\[RESOLUTION_DRAFT\][\s\S]*?\[\/RESOLUTION_DRAFT\]/, '').trim();
      setMessages(prev => [...prev, { role: 'model', text: cleanText }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Samahani, kuna tatizo. Labda jaribu tena baadaye." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F4F5F7] font-sans text-slate-800 overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            CHAMA ARBITRATOR <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded ml-2 uppercase">Pro</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${isSidebarOpen ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Shield size={20} />
          </button>
          <div className="h-8 w-px bg-slate-200 md:block hidden"></div>
          <div className="hidden md:flex gap-2">
            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${records ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
              M-PESA: {records ? 'LINKED' : 'MISSING'}
            </span>
            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${csvFile ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
              CSV: {csvFile ? 'LINKED' : 'MISSING'}
            </span>
            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${bylaws ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
              BYLAWS: {bylaws ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <button 
            onClick={() => setIsResolutionOpen(!isResolutionOpen)}
            className={`p-2 rounded-lg transition-colors ${isResolutionOpen ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <AlertCircle size={20} />
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Context Panel */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Mobile Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
              />
              <motion.aside
                initial={{ x: -288, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -288, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-40 w-72 bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-8 overflow-y-auto md:relative md:z-10 md:w-72"
              >
                <section>
                  <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Context Ledger</h2>
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:border-indigo-200 group">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-3 flex items-center justify-between tracking-widest">
                        Bylaws
                        {bylaws && <CheckCircle2 size={12} className="text-emerald-500" />}
                      </p>
                      {bylaws ? (
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-indigo-600" />
                          <span className="text-sm font-medium truncate text-slate-700">{bylaws.name}</span>
                        </div>
                      ) : (
                        <label className="block text-center p-6 border border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                          <Upload size={20} className="mx-auto mb-2 text-slate-300" />
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Upload Bylaws</span>
                          <input type="file" className="hidden" onChange={(e) => setBylaws(e.target.files?.[0] || null)} />
                        </label>
                      )}
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:border-indigo-200 group">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-3 flex items-center justify-between tracking-widest">
                        M-Pesa Records
                        {records && <CheckCircle2 size={12} className="text-emerald-500" />}
                      </p>
                      {records ? (
                        <div className="flex items-center gap-3">
                          <Table size={16} className="text-indigo-600" />
                          <span className="text-sm font-medium truncate text-slate-700">{records.name}</span>
                        </div>
                      ) : (
                        <label className="block text-center p-6 border border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                          <Upload size={20} className="mx-auto mb-2 text-slate-300" />
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Upload Records</span>
                          <input type="file" className="hidden" onChange={(e) => setRecords(e.target.files?.[0] || null)} />
                        </label>
                      )}
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:border-indigo-200 group">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-3 flex items-center justify-between tracking-widest">
                        Spreadsheet CSV
                        {csvFile && <CheckCircle2 size={12} className="text-emerald-500" />}
                      </p>
                      {csvFile ? (
                        <div className="flex items-center gap-3">
                          <Table size={16} className="text-indigo-600" />
                          <span className="text-sm font-medium truncate text-slate-700">{csvFile.name}</span>
                        </div>
                      ) : (
                        <label className="block text-center p-6 border border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                          <Upload size={20} className="mx-auto mb-2 text-slate-300" />
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Upload CSV</span>
                          <input type="file" className="hidden" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
                        </label>
                      )}
                    </div>
                  </div>
                </section>

                <section className="mt-auto">
                  <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Shield size={64} />
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-400">Mediation Engine</h4>
                    <p className="text-sm font-medium leading-relaxed">
                      Analyzing bylaws and transaction trails with impartial neutrality.
                    </p>
                  </div>
                </section>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col gap-6 md:gap-8 max-w-4xl mx-auto w-full scroll-smooth">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-12">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
                  <Shield size={32} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Impartial Mediation</h2>
                <p className="text-slate-500 max-w-sm mb-8 text-sm">
                  Upload your Chama's documents to start. I'll analyze records and bylaws to provide fair arbitration.
                </p>
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                  {['Mwanachama hakulipa faini', 'Tafsiri Section 5', 'Check M-Pesa March records'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                key={i}
                className={`flex gap-3 md:gap-4 items-start ${msg.role === 'model' ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm ${
                  msg.role === 'model' 
                    ? 'bg-indigo-600 text-white italic' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {msg.role === 'model' ? 'AI' : 'M'}
                </div>
                <div className={`p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] max-w-[90%] md:max-w-[85%] border shadow-sm ${
                  msg.role === 'model'
                    ? 'bg-indigo-50 border-indigo-100 text-indigo-950 rounded-tl-none'
                    : 'bg-slate-100 border-slate-200 rounded-tr-none'
                }`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-40">
                    {msg.role === 'model' ? 'Arbitrator Agent' : 'Member / Treasurer'}
                  </p>
                  <div className="text-sm leading-relaxed prose prose-slate prose-sm max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {loading && (
              <div className="flex gap-4 items-start flex-row">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold animate-pulse italic">AI</div>
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl rounded-tl-none flex gap-2">
                  <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50 flex items-center gap-3 md:gap-4">
            <div className="flex-1 h-12 bg-white border border-slate-200 rounded-full flex items-center px-4 md:px-6 gap-2 md:gap-3 shadow-inner focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <MessageSquare size={18} className="text-indigo-400 hidden md:block" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Type your message..."
                className="bg-transparent flex-1 text-sm outline-none placeholder:text-slate-300 font-medium"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 flex-shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
        </section>

        {/* Right Sidebar - Draft Resolution */}
        <AnimatePresence>
          {isResolutionOpen && (
            <>
              {/* Mobile Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsResolutionOpen(false)}
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
              />
              <motion.aside
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 z-40 w-80 bg-white border-l border-slate-200 flex flex-col overflow-hidden md:relative md:z-10 md:w-80"
              >
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Resolution Draft</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                      {isConfirmed ? 'Consensus Reached' : 'Awaiting Audit'}
                    </p>
                  </div>
                  <button onClick={() => setIsResolutionOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
                    <CheckCircle2 size={18} />
                  </button>
                </div>
                
                <div className="flex-1 p-8 space-y-10 overflow-y-auto">
                  {resolution ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="border-l-4 border-indigo-500 pl-6 py-1 mb-8">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-2">Proposed Action</p>
                        <p className="text-lg font-bold text-slate-900 leading-tight">{resolution.planName}</p>
                      </div>
                      
                      <div className="space-y-6">
                        {[
                          { label: "Penalty Waived", val: resolution.penaltyWaived, color: resolution.penaltyWaived === 'YES' ? 'text-emerald-600' : 'text-red-500' },
                          { label: "Timeline Extension", val: resolution.extension, color: 'text-indigo-600' },
                          { label: "Next Share Due", val: resolution.nextDue, color: 'text-slate-800' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex flex-col gap-1 py-1 border-b border-slate-50">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                            <span className={`text-sm font-black ${item.color}`}>{item.val}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Logic Summary</p>
                        <p className="text-xs text-slate-600 leading-relaxed italic">"{resolution.summary}"</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 opacity-40">
                      <div className="w-16 h-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mb-6">
                        <Shield size={32} className="text-slate-300" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest">No active resolution</p>
                    </div>
                  )}
                </div>

                <div className="p-8 mt-auto border-t border-slate-50 bg-white">
                  <button 
                    onClick={() => setIsConfirmed(true)}
                    disabled={!resolution || isConfirmed}
                    className={`w-full py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                      isConfirmed 
                        ? 'bg-emerald-50 text-emerald-600 cursor-default' 
                        : 'bg-slate-900 text-white hover:bg-black disabled:opacity-30 disabled:shadow-none'
                    }`}
                  >
                    {isConfirmed ? (
                      <><CheckCircle2 size={16} /> Meditated</>
                    ) : (
                      'Confirm'
                    )}
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

