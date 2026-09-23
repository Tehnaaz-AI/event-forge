import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Sparkles, Copy, MessageSquare, Check, RefreshCcw, 
  Key, ShieldCheck, Cpu, Settings, CheckCircle2, 
  AlertCircle, ArrowRight, Layers, Lightbulb, Send 
} from 'lucide-react';
import { api } from '../../services/api';

export default function AIAssistant({ eventId }) {
  const [activeTab, setActiveTab] = useState('marketing'); // 'marketing' | 'sessions' | 'speaker' | 'coach'
  const [targetAudience, setTargetAudience] = useState('Enterprise CTOs, Senior Software Architects, and AI Engineers');
  const [sessionTopic, setSessionTopic] = useState('Distributed AI Agents, Autonomous Workflows & Zero-Trust Cloud Architecture');
  const [speakerTopic, setSpeakerTopic] = useState('Dr. Sarah Chen, VP of AI Systems at OpenAI');
  const [coachTitle, setCoachTitle] = useState('Architecting Zero-Collision AI Systems for 10M+ Users');
  const [coachBio, setCoachBio] = useState('VP of Distributed Computing, 15+ years enterprise keynote speaker');
  const [coachDuration, setCoachDuration] = useState(15);
  
  // Real AI Key & Model Configuration
  const [showConfig, setShowConfig] = useState(false);
  const [aiApiKey, setAiApiKey] = useState(() => localStorage.getItem('eventforge_ai_key') || '');
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem('eventforge_ai_provider') || 'auto');
  const [testResult, setTestResult] = useState({ loading: false, success: false, message: '' });

  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (aiApiKey) {
      localStorage.setItem('eventforge_ai_key', aiApiKey);
    }
  }, [aiApiKey]);

  useEffect(() => {
    if (aiProvider) {
      localStorage.setItem('eventforge_ai_provider', aiProvider);
    }
  }, [aiProvider]);

  const generateCopy = useMutation({
    mutationFn: (audience) => api.post(`/events/${eventId}/ai/generate-copy`, { 
      targetAudience: audience,
      apiKey: aiApiKey || undefined
    }),
    onSuccess: (data) => setResult(data.content)
  });

  const generateSessions = useMutation({
    mutationFn: (topic) => api.post(`/events/${eventId}/ai/recommend-sessions`, { 
      topic,
      apiKey: aiApiKey || undefined
    }),
    onSuccess: (data) => setResult(data.content)
  });

  const generateSpeechCoach = useMutation({
    mutationFn: (coachData) => api.post(`/events/${eventId}/ai/speech-coach`, {
      speechTitle: coachData.title,
      speakerBio: coachData.bio,
      durationMinutes: Number(coachData.duration),
      apiKey: aiApiKey || undefined
    }),
    onSuccess: (data) => setResult(data.content)
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    setResult('');
    if (activeTab === 'marketing') {
      generateCopy.mutate(targetAudience);
    } else if (activeTab === 'sessions') {
      generateSessions.mutate(sessionTopic);
    } else if (activeTab === 'speaker') {
      generateSessions.mutate(`Keynote Speaker Bio & Abstract for: ${speakerTopic}`);
    } else {
      generateSpeechCoach.mutate({ title: coachTitle, bio: coachBio, duration: coachDuration });
    }
  };

  const handleTestKey = async () => {
    if (!aiApiKey) {
      setTestResult({ loading: false, success: false, message: 'Please enter an API Key first' });
      return;
    }
    setTestResult({ loading: true, success: false, message: '' });
    try {
      const res = await api.post(`/events/${eventId}/ai/test-key`, {
        apiKey: aiApiKey,
        provider: aiProvider
      });
      setTestResult({ loading: false, success: true, message: res.message || 'API Connection Verified Successfully!' });
    } catch (err) {
      setTestResult({ 
        loading: false, 
        success: false, 
        message: err.response?.data?.message || err.message || 'Failed to connect to AI provider. Verify your API key.' 
      });
    }
  };

  const isPending = generateCopy.isPending || generateSessions.isPending || generateSpeechCoach.isPending;
  const isError = generateCopy.isError || generateSessions.isError || generateSpeechCoach.isError;
  const errorMsg = generateCopy.error?.message || generateSessions.error?.message || generateSpeechCoach.error?.message;

  return (
    <div className="bg-white rounded-3xl border border-[#EFE8DA] shadow-sm overflow-hidden font-sans">
      
      {/* Header Banner */}
      <div className="border-b border-[#EFE8DA] bg-gradient-to-r from-[#FDFAF5] via-[#FAF8F5] to-[#F5F2EB] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center font-bold shadow-xs">
              <Sparkles size={24} className="animate-spin text-[#B45309]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">EventForge AI Studio</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {aiApiKey ? 'Live Real-API Connected' : 'Auto AI Synthesis Active'}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Autonomous conference copywriting, agenda synthesis &amp; keynote speech coaching.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-xs ${
              showConfig 
                ? 'bg-[#1C1917] text-[#FDFAF5] border-[#1C1917]' 
                : 'bg-white text-stone-700 border-[#EFE8DA] hover:border-[#B45309]'
            }`}
          >
            <Key size={14} className={aiApiKey ? 'text-[#C28E27]' : 'text-stone-400'} />
            <span>{aiApiKey ? 'Custom API Key Configured' : 'Configure Custom AI Key'}</span>
          </button>
        </div>

        {/* AI Key & Provider Configuration Panel */}
        {showConfig && (
          <div className="mb-6 p-5 bg-white border border-[#EFE8DA] rounded-2xl space-y-4 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-[#B45309]" />
                <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">AI API Key &amp; Provider Settings</h3>
              </div>
              <span className="text-[10px] text-stone-400">Supports Google Gemini, OpenAI, Groq &amp; OpenRouter</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  AI Provider Engine
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl text-stone-800 focus:outline-none focus:border-[#B45309]"
                >
                  <option value="auto">Auto-Detect from API Key</option>
                  <option value="gemini">Google Gemini (Recommended / gemini-1.5-flash)</option>
                  <option value="openai">OpenAI (GPT-4o-mini / GPT-4o)</option>
                  <option value="groq">Groq Cloud (Llama 3.3 70B)</option>
                  <option value="openrouter">OpenRouter (Multi-Model)</option>
                  <option value="bios">BIOS AI Cloud</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Live API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter your API Key (e.g. AIzaSy... or sk-... or gsk_...)"
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl font-mono text-stone-900 focus:outline-none focus:border-[#B45309]"
                  />
                  <button
                    type="button"
                    onClick={handleTestKey}
                    disabled={testResult.loading || !aiApiKey}
                    className="px-4 py-2 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {testResult.loading ? <RefreshCcw size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                    {testResult.loading ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </div>
            </div>

            {testResult.message && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {testResult.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        )}

        {/* Synthesis Mode Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#EFE8DA] pb-px">
          <button 
            onClick={() => { setActiveTab('marketing'); setResult(''); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'marketing' 
                ? 'bg-[#B45309] text-white shadow-xs' 
                : 'text-stone-600 hover:bg-stone-200/50'
            }`}
          >
            <Send size={14} /> Marketing Copywriter
          </button>
          
          <button 
            onClick={() => { setActiveTab('sessions'); setResult(''); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'sessions' 
                ? 'bg-[#B45309] text-white shadow-xs' 
                : 'text-stone-600 hover:bg-stone-200/50'
            }`}
          >
            <Lightbulb size={14} /> Multi-Track Ideation
          </button>

          <button 
            onClick={() => { setActiveTab('speaker'); setResult(''); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'speaker' 
                ? 'bg-[#B45309] text-white shadow-xs' 
                : 'text-stone-600 hover:bg-stone-200/50'
            }`}
          >
            <Layers size={14} /> Speaker Abstracts
          </button>

          <button 
            onClick={() => { setActiveTab('coach'); setResult(''); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'coach' 
                ? 'bg-[#B45309] text-white shadow-xs' 
                : 'text-stone-600 hover:bg-stone-200/50'
            }`}
          >
            <Sparkles size={14} /> Keynote Speech &amp; Q&amp;A Coach
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Prompt Configuration */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-b border-[#EFE8DA] pb-3">
            <MessageSquare size={16} className="text-[#B45309]" />
            <h3 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">
              {activeTab === 'marketing' ? 'Marketing Target' : activeTab === 'sessions' ? 'Track Theme' : activeTab === 'speaker' ? 'Speaker Profile' : 'Keynote Speech Brief'}
            </h3>
          </div>
          
          {activeTab === 'marketing' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">Target Attendee Persona</label>
              <textarea 
                rows="5" 
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl p-3.5 text-xs text-stone-900 focus:ring-1 focus:ring-[#B45309] focus:outline-none"
                placeholder="e.g. C-level executives, Cloud Architects, and Founders in FinTech"
              />
              <p className="text-[10px] text-stone-500">Tailors tone across Social Media, LinkedIn, and Email.</p>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">Desired Conference Theme / Topic</label>
              <textarea 
                rows="5" 
                value={sessionTopic}
                onChange={(e) => setSessionTopic(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl p-3.5 text-xs text-stone-900 focus:ring-1 focus:ring-[#B45309] focus:outline-none"
                placeholder="e.g. Next-Generation Cloud Security & Autonomous AI Workflows"
              />
              <p className="text-[10px] text-stone-500">Synthesizes 3 compelling keynote and breakout sessions with target speaker profiles.</p>
            </div>
          )}

          {activeTab === 'speaker' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">Speaker Name &amp; Expertise</label>
              <textarea 
                rows="5" 
                value={speakerTopic}
                onChange={(e) => setSpeakerTopic(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl p-3.5 text-xs text-stone-900 focus:ring-1 focus:ring-[#B45309] focus:outline-none"
                placeholder="e.g. Dr. Alex Vance, Head of Quantum Computing Research at MIT"
              />
              <p className="text-[10px] text-stone-500">Generates keynote title, executive bio, and abstract outline.</p>
            </div>
          )}

          {activeTab === 'coach' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">Keynote Topic / Speech Title</label>
                <input 
                  type="text"
                  value={coachTitle}
                  onChange={(e) => setCoachTitle(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl p-3 text-xs text-stone-900 focus:ring-1 focus:ring-[#B45309] focus:outline-none"
                  placeholder="e.g. Scaling Autonomous Agents"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">Speaker Background</label>
                <input 
                  type="text"
                  value={coachBio}
                  onChange={(e) => setCoachBio(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl p-3 text-xs text-stone-900 focus:ring-1 focus:ring-[#B45309] focus:outline-none"
                  placeholder="e.g. VP of Engineering, AI Pioneer"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">Allotted Stage Duration</label>
                <select
                  value={coachDuration}
                  onChange={(e) => setCoachDuration(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl p-3 text-xs text-stone-900 focus:ring-1 focus:ring-[#B45309] focus:outline-none"
                >
                  <option value="10">10 Minutes (Lightning Keynote)</option>
                  <option value="15">15 Minutes (Standard TED-Style)</option>
                  <option value="30">30 Minutes (Deep-Dive Keynote)</option>
                  <option value="45">45 Minutes (Masterclass &amp; Q&amp;A)</option>
                </select>
              </div>
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={isPending}
            className="w-full bg-[#B45309] hover:bg-[#92400E] text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-md shadow-[#B45309]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wider"
          >
            {isPending ? <RefreshCcw size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {isPending ? 'Synthesizing with AI...' : 'Generate with AI'}
          </button>

          {isError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle size={15} /> {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Generated Output */}
        <div className="md:col-span-2 flex flex-col h-[520px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#B45309]" /> Synthesized Output
            </h3>
            {result && (
              <button 
                onClick={handleCopy} 
                className="text-xs font-bold text-stone-600 hover:text-[#B45309] flex items-center gap-1.5 transition-colors bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#EFE8DA]"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Text'}
              </button>
            )}
          </div>
          
          <div className="flex-1 bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl p-6 overflow-y-auto font-sans text-xs text-stone-800 leading-relaxed whitespace-pre-wrap shadow-inner">
            {isPending ? (
              <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-4">
                <Sparkles size={36} className="animate-spin text-[#B45309]" />
                <p className="font-bold text-xs text-stone-600">Consulting AI model &amp; synthesizing high-impact content...</p>
              </div>
            ) : result ? (
              result
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-2">
                <Sparkles size={32} className="text-stone-300" />
                <p className="text-xs font-bold text-stone-600">No output generated yet</p>
                <p className="text-[11px] text-stone-400 text-center max-w-xs">
                  Configure your prompt on the left and click "Generate with AI" to create marketing copy, agendas, or keynote coaching briefs.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
