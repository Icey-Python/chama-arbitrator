import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconScale, 
  IconFileText, 
  IconTable, 
  IconMessage, 
  IconArrowRight, 
  IconUpload, 
  IconCheck, 
  IconMenu2, 
  IconX,
  IconBrandCashapp
} from '@tabler/icons-react';
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

function Logo() {
  return (
    <div className="w-10 h-10 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shrink-0">
      <IconScale size={24} stroke={1.5} />
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState<'setup' | 'chat'>('setup');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bylaws, setBylaws] = useState<File | null>(null);
  const [records, setRecords] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  
  // Drawer states for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (step === 'chat') {
      scrollToBottom();
    }
  }, [messages, step]);

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
          // Auto-open resolution if on larger screen or if it's new
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

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800">
        <header className="h-24 flex items-center px-8 md:px-16 shrink-0">
          <Logo />
          <span className="ml-4 text-xl font-bold tracking-tight text-slate-900">
            Chama Arbitrator
          </span>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-5xl mx-auto w-full">
          <IconScale size={56} className="text-indigo-600 mb-10" stroke={1} />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 text-center max-w-2xl px-4">
            Impartial Financial Resolution
          </h1>
          <p className="text-slate-500 text-lg mb-20 text-center max-w-2xl px-4 leading-relaxed">
            Upload your group's documents to start the mediation process. We analyze bylaws and financial records to provide unbiased, data-backed arbitration.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-20">
            {/* Upload Bylaws */}
            <div className="flex flex-col items-center">
              <input type="file" id="bylaws" className="hidden" onChange={(e) => setBylaws(e.target.files?.[0] || null)} />
              <label htmlFor="bylaws" className={`w-full border-2 border-dashed aspect-square md:aspect-auto md:h-64 rounded-[3rem] flex flex-col items-center justify-center p-8 cursor-pointer transition-colors ${bylaws ? 'bg-indigo-50 text-indigo-900 border-indigo-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-300'}`}>
                {bylaws ? <IconCheck size={40} className="text-indigo-600 mb-6" stroke={1.5} /> : <IconFileText size={40} className="mb-6" stroke={1.5} />}
                <span className="text-sm font-bold tracking-widest uppercase text-center">
                  Upload Constitution & Rules
                </span>
                {bylaws && <span className="text-xs font-medium mt-3 opacity-60 truncate w-full text-center">{bylaws.name}</span>}
              </label>
            </div>

            {/* Upload M-PESA */}
            <div className="flex flex-col items-center">
              <input type="file" id="mpesa" className="hidden" onChange={(e) => setRecords(e.target.files?.[0] || null)} />
              <label htmlFor="mpesa" className={`w-full border-2 border-dashed aspect-square md:aspect-auto md:h-64 rounded-[3rem] flex flex-col items-center justify-center p-8 cursor-pointer transition-colors ${records ? 'bg-indigo-50 text-indigo-900 border-indigo-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-300'}`}>
                {records ? <IconCheck size={40} className="text-indigo-600 mb-6" stroke={1.5} /> : <IconBrandCashapp size={40} className="mb-6" stroke={1.5} />}
                <span className="text-sm font-bold tracking-widest uppercase text-center">
                 Upload M-Pesa Statements
                </span>
                {records && <span className="text-xs font-medium mt-3 opacity-60 truncate w-full text-center">{records.name}</span>}
              </label>
            </div>

            {/* Upload CSV */}
            <div className="flex flex-col items-center">
              <input type="file" id="csv" className="hidden" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
              <label htmlFor="csv" className={`w-full border-2 border-dashed aspect-square md:aspect-auto md:h-64 rounded-[3rem] flex flex-col items-center justify-center p-8 cursor-pointer transition-colors ${csvFile ? 'bg-indigo-50 text-indigo-900 border-indigo-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-300'}`}>
                {csvFile ? <IconCheck size={40} className="text-indigo-600 mb-6" stroke={1.5} /> : <IconTable size={40} className="mb-6" stroke={1.5} />}
                <span className="text-sm font-bold tracking-widest uppercase text-center">
                  Upload Contribution Sheets
                </span>
                {csvFile && <span className="text-xs font-medium mt-3 opacity-60 truncate w-full text-center">{csvFile.name}</span>}
              </label>
            </div>
          </div>

          <button 
            onClick={() => setStep('chat')}
            className="px-12 py-5 bg-slate-900 text-white rounded-full text-sm font-bold tracking-widest uppercase hover:bg-black transition-colors"
          >
            Start Arbitration
          </button>
        </main>
      </div>
    );
  }

  // --- CHAT STEP ---
  return (
    <div className="flex flex-col h-[100dvh] bg-white font-sans text-slate-800 overflow-hidden relative">
      {/* Header */}
      <header className="h-20 shrink-0 flex items-center justify-between px-6 md:px-12 z-20 bg-white/80 backdrop-blur-md">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-3 -ml-3 text-slate-900 hover:bg-slate-50 rounded-2xl md:hidden"
        >
          <IconMenu2 size={24} stroke={1.5} />
        </button>
        
        {/* Only show menu text on desktop */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="hidden md:flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-slate-400 hover:text-slate-900 transition-colors"
        >
          <IconMenu2 size={20} stroke={1.5} />
          Ledger
        </button>

        <div className="flex items-center gap-4">
          <Logo />
          <span className="text-lg font-bold tracking-tight text-slate-900 hidden md:inline-block">
            Chama Arbitrator
          </span>
        </div>

        <button 
          onClick={() => setIsResolutionOpen(true)}
          className="hidden md:flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-slate-400 hover:text-slate-900 transition-colors"
        >
          Resolution
          <IconMenu2 size={20} stroke={1.5} className="scale-x-[-1]" />
        </button>

        <button 
          onClick={() => setIsResolutionOpen(true)}
          className="p-3 -mr-3 text-slate-900 hover:bg-slate-50 rounded-2xl md:hidden"
        >
          <IconMenu2 size={24} stroke={1.5} className="scale-x-[-1]" />
        </button>
      </header>

      <main className="flex-1 overflow-hidden relative flex justify-center">
        {/* LEFT DRAWER - Context */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-30"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-40 w-full max-w-sm bg-white p-8 md:p-12 flex flex-col gap-12 overflow-y-auto"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Context Ledger</h2>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-900">
                    <IconX size={24} stroke={1.5} />
                  </button>
                </div>
                
                <div className="flex flex-col gap-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Bylaws</p>
                    {bylaws ? (
                      <p className="text-base font-medium text-slate-900">{bylaws.name}</p>
                    ) : (
                      <p className="text-base font-medium text-slate-400 italic">None provided</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">M-Pesa Records</p>
                    {records ? (
                      <p className="text-base font-medium text-slate-900">{records.name}</p>
                    ) : (
                      <p className="text-base font-medium text-slate-400 italic">None provided</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Contributions</p>
                    {csvFile ? (
                      <p className="text-base font-medium text-slate-900">{csvFile.name}</p>
                    ) : (
                      <p className="text-base font-medium text-slate-400 italic">None provided</p>
                    )}
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* RIGHT DRAWER - Resolution */}
        <AnimatePresence>
          {isResolutionOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsResolutionOpen(false)}
                className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-30"
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-slate-50 p-8 md:p-12 flex flex-col overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-16">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Resolution Draft</h3>
                  <button onClick={() => setIsResolutionOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-900">
                    <IconX size={24} stroke={1.5} />
                  </button>
                </div>
                
                <div className="flex-1 flex flex-col gap-16">
                  {resolution ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-12"
                    >
                      <div>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Proposed Plan</p>
                        <p className="text-2xl font-bold text-slate-900 leading-tight">{resolution.planName}</p>
                      </div>
                      
                      <div className="flex flex-col gap-8">
                        <div>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Penalty Waived</span>
                           <span className="text-lg font-bold text-slate-900">{resolution.penaltyWaived}</span>
                        </div>
                        <div>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Timeline Extension</span>
                           <span className="text-lg font-bold text-slate-900">{resolution.extension}</span>
                        </div>
                        <div>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Next Share Due</span>
                           <span className="text-lg font-bold text-slate-900">{resolution.nextDue}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Reasoning Summary</p>
                        <p className="text-base text-slate-700 leading-relaxed font-medium">"{resolution.summary}"</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                      <IconScale size={48} className="mb-8" stroke={1} />
                      <p className="text-sm font-bold uppercase tracking-widest">No active resolution</p>
                    </div>
                  )}
                </div>

                <div className="mt-16">
                  <button 
                    onClick={() => setIsConfirmed(true)}
                    disabled={!resolution || isConfirmed}
                    className={`w-full py-5 rounded-[2.5rem] font-bold text-sm uppercase tracking-widest transition-all ${
                      isConfirmed 
                        ? 'bg-emerald-100 text-emerald-800 cursor-default' 
                        : 'bg-slate-900 text-white hover:bg-black disabled:opacity-20 disabled:bg-slate-900'
                    }`}
                  >
                    {isConfirmed ? 'Consensus Reached' : 'Confirm Resolution'}
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* MAIN CHAT */}
        <section className="flex-1 flex flex-col max-w-4xl w-full h-full pb-32">
          <div className="flex-1 p-6 md:p-12 overflow-y-auto flex flex-col gap-12 w-full scroll-smooth">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed mb-12">
                  What issue needs to be addressed in the group today?
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {['Mwanachama hakulipa', 'Check March records', 'Tafsiri Section 5'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-6 py-3 bg-slate-50 text-slate-600 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors"
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
                className="flex flex-col gap-3 items-start"
              >
                <div className={`p-8 md:p-10 rounded-[2.5rem] w-full ${
                  msg.role === 'model'
                    ? 'bg-slate-50 text-slate-900'
                    : 'bg-indigo-50 text-indigo-950'
                }`}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-6 opacity-40">
                    {msg.role === 'model' ? 'Arbitrator Agent' : 'Member / Treasurer'}
                  </p>
                  <div className="text-base leading-relaxed prose prose-slate max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {loading && (
              <div className="flex flex-col gap-3 items-start">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] flex items-center gap-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </section>

        {/* INPUT FLOOR */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-4xl mx-auto flex items-end gap-4 bg-slate-50 rounded-[2.5rem] p-3 pl-8 pb-3 min-h-[4.5rem]">
            <input
              type="text"
              value={input ?? ''}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Detail the dispute..."
              className="bg-transparent flex-1 pt-3 pb-3 text-base outline-none placeholder:text-slate-400 font-medium text-slate-900 h-full"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="h-12 w-12 shrink-0 bg-slate-900 rounded-full flex items-center justify-center text-white hover:bg-black disabled:opacity-20 transition-all active:scale-95"
            >
              <IconArrowRight size={20} stroke={2} />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
