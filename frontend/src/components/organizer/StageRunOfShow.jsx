import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, Play, Pause, RotateCcw, Volume2, VolumeX, 
  Maximize2, Minimize2, Mic, Users, MapPin, Sparkles, 
  ChevronRight, ArrowRight, AlertCircle, CheckCircle2, 
  Timer, Award, Radio, Tv
} from 'lucide-react';
import { api } from '../../services/api';

// Web Audio API Audio Cues for Stage Producer
function playStageChime(type = 'bell') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'warning') {
      // Harmonic 2-tone chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'overtime') {
      // Warning buzzer
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else {
      // Clean Start Bell
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    }
  } catch (e) {
    // Audio context unavailable
  }
}

export default function StageRunOfShow({ eventId }) {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', eventId],
    queryFn: () => api.get(`/events/${eventId}/sessions`)
  });

  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const [cueNotes, setCueNotes] = useState(
    '1. Remind attendees about interactive live Q&A via mobile.\n2. Key sponsor mention: Platinum AI Partner booth in Hall B.\n3. Wrap up precisely on time for the 15-minute networking break.'
  );

  const containerRef = useRef(null);
  const currentSession = sessions[activeSessionIndex] || null;

  // Initialize timer on session selection
  useEffect(() => {
    if (currentSession) {
      const start = new Date(currentSession.startTime).getTime();
      const end = new Date(currentSession.endTime).getTime();
      const durationSec = Math.max(60, Math.round((end - start) / 1000));
      // Default to 15m if invalid, or calculated duration
      setSecondsRemaining(durationSec > 0 && durationSec < 7200 ? durationSec : 15 * 60);
      setTimerRunning(false);
    }
  }, [activeSessionIndex, sessions]);

  // Countdown Loop
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            if (audioEnabled) playStageChime('overtime');
            return 0;
          }
          if (prev === 61 && audioEnabled) {
            playStageChime('warning');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, audioEnabled]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setFullScreen(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const addTime = (mins) => {
    setSecondsRemaining(prev => prev + mins * 60);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setSecondsRemaining(15 * 60);
  };

  const getTimerColor = () => {
    if (secondsRemaining <= 0) return 'text-rose-600 animate-pulse';
    if (secondsRemaining <= 120) return 'text-amber-500';
    return 'text-[#B45309]';
  };

  const getTimerBorder = () => {
    if (secondsRemaining <= 0) return 'border-rose-500 bg-rose-50/50 ring-4 ring-rose-500/20';
    if (secondsRemaining <= 120) return 'border-amber-400 bg-amber-50/40 ring-4 ring-amber-400/20';
    return 'border-[#EFE8DA] bg-white';
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-stone-500">
        <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading live stage run-of-show...
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`space-y-6 animate-in fade-in font-sans text-stone-900 ${
        fullScreen ? 'fixed inset-0 bg-[#0F0E0D] text-white p-8 z-50 overflow-y-auto' : ''
      }`}
    >
      {/* Stage Header Banner */}
      <div className="bg-gradient-to-r from-[#1C1917] to-[#2C251C] text-[#FDFAF5] p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Backstage Control Room
            </span>
            <span className="text-xs text-stone-400">| Stage Run-of-Show &amp; Teleprompter Pacer</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AV Keynote Podium &amp; Stage Clock 🎙️
          </h2>
          <p className="text-xs text-stone-300 max-w-xl">
            Live minute-by-minute session management, digital podium timer with audio chime cues, and teleprompter speaker notes.
          </p>
        </div>

        {/* Global AV Controls */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
              audioEnabled 
                ? 'bg-white/15 text-white border-white/20 hover:bg-white/25' 
                : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}
            title={audioEnabled ? 'Audio Chimes Enabled' : 'Audio Chimes Muted'}
          >
            {audioEnabled ? <Volume2 size={18} className="text-[#C28E27]" /> : <VolumeX size={18} />}
            <span className="hidden sm:inline">{audioEnabled ? 'Chimes Active' : 'Muted'}</span>
          </button>

          <button
            onClick={toggleFullScreen}
            className="p-3 rounded-2xl bg-[#B45309] hover:bg-[#92400E] text-white border border-[#B45309]/50 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#B45309]/30"
          >
            {fullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            <span className="hidden sm:inline">{fullScreen ? 'Exit Fullscreen' : 'Stage Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Digital Podium Timer (Left) + Run-of-Show Schedule (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Big Stage Clock & AV Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Giant Timer Card */}
          <div className={`p-8 sm:p-10 rounded-3xl border transition-all text-center flex flex-col items-center justify-center relative shadow-sm ${getTimerBorder()}`}>
            
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-stone-500 mb-2">
              <Timer size={16} className="text-[#B45309]" />
              <span>Current Stage Clock</span>
            </div>

            {/* Huge Digits */}
            <div className={`font-mono text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter my-2 ${getTimerColor()}`}>
              {formatTime(secondsRemaining)}
            </div>

            {/* Active Session Headline */}
            <div className="mt-2 mb-6 max-w-md">
              <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider block">
                {currentSession?.room ? `Room: ${currentSession.room}` : 'Main Keynote Stage'}
              </span>
              <h3 className="text-lg font-extrabold text-stone-900 truncate">
                {currentSession?.title || 'General Conference Session'}
              </h3>
              {currentSession?.speakers?.length > 0 && (
                <p className="text-xs text-stone-500 mt-0.5">
                  Speaker: {currentSession.speakers.map(s => s.name).join(', ')}
                </p>
              )}
            </div>

            {/* Play / Pause / Reset Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (!timerRunning && audioEnabled) playStageChime('bell');
                  setTimerRunning(!timerRunning);
                }}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2.5 shadow-md ${
                  timerRunning 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {timerRunning ? <Pause size={18} /> : <Play size={18} />}
                <span>{timerRunning ? 'PAUSE CLOCK' : 'START STAGE CLOCK'}</span>
              </button>

              <button
                onClick={resetTimer}
                className="px-4 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                title="Reset to 15:00"
              >
                <RotateCcw size={15} /> Reset
              </button>

              <button
                onClick={() => addTime(1)}
                className="px-3.5 py-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFE8DA] hover:bg-stone-100 text-stone-800 font-bold text-xs transition-colors"
              >
                +1 Min
              </button>

              <button
                onClick={() => addTime(5)}
                className="px-3.5 py-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFE8DA] hover:bg-stone-100 text-stone-800 font-bold text-xs transition-colors"
              >
                +5 Min
              </button>
            </div>
          </div>

          {/* Speaker Teleprompter & Producer Notes */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <Tv size={16} className="text-[#B45309]" /> Stage Teleprompter &amp; AV Cue Card
              </h4>
              <span className="text-[10px] font-bold text-stone-400 uppercase">Live Broadcast Notes</span>
            </div>

            <textarea
              value={cueNotes}
              onChange={e => setCueNotes(e.target.value)}
              rows="3"
              className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl p-3 text-xs text-stone-800 font-mono focus:ring-2 focus:ring-[#B45309]/30 focus:outline-none leading-relaxed"
              placeholder="Enter cue notes, announcements, or teleprompter lines for the podium speaker..."
            />
          </div>

        </div>

        {/* Right Column: Interactive Run-of-Show Schedule (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-xs flex flex-col h-full">
            
            <div className="flex items-center justify-between border-b border-[#EFE8DA] pb-4 mb-4">
              <div>
                <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                  <Radio size={16} className="text-emerald-600 animate-pulse" /> Live Run-of-Show Sequence
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">Click any session to load on-stage</p>
              </div>
              <span className="px-2.5 py-1 bg-stone-100 text-stone-700 text-[10px] font-bold rounded-lg">
                {sessions.length} Sessions
              </span>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-12 text-stone-400 space-y-2">
                <Clock size={32} className="mx-auto text-stone-300" />
                <p className="text-xs font-bold">No sessions scheduled yet.</p>
                <p className="text-[11px]">Add multi-track sessions in the "Sessions" tab.</p>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto max-h-[480px] scrollbar-beige pr-1">
                {sessions.map((session, idx) => {
                  const isActive = idx === activeSessionIndex;
                  return (
                    <div
                      key={session._id}
                      onClick={() => setActiveSessionIndex(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isActive
                          ? 'bg-[#B45309]/10 border-[#B45309] shadow-xs ring-1 ring-[#B45309]'
                          : 'bg-[#FAF8F5] border-[#EFE8DA] hover:border-stone-300'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            isActive ? 'bg-[#B45309] text-white' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {isActive ? 'ON STAGE NOW' : `Session ${idx + 1}`}
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium">
                            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <h5 className="font-extrabold text-xs text-stone-900 truncate">
                          {session.title}
                        </h5>

                        <div className="flex items-center gap-3 text-[10px] text-stone-500 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-[#B45309]" /> {session.room || 'Main Hall'}
                          </span>
                          {session.speakers?.length > 0 && (
                            <span className="flex items-center gap-1 truncate">
                              <Mic size={11} className="text-amber-700" /> {session.speakers[0].name}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight size={16} className={isActive ? 'text-[#B45309]' : 'text-stone-300'} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Next Session Advance Button */}
            {sessions.length > 0 && (
              <button
                onClick={() => {
                  if (activeSessionIndex < sessions.length - 1) {
                    setActiveSessionIndex(prev => prev + 1);
                    if (audioEnabled) playStageChime('bell');
                  }
                }}
                disabled={activeSessionIndex >= sessions.length - 1}
                className="w-full mt-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Advance to Next Session</span>
                <ArrowRight size={14} />
              </button>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
