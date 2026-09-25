import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, Play, Pause, RotateCcw, Volume2, VolumeX, 
  Maximize2, Minimize2, Mic, Users, MapPin, Sparkles, 
  ChevronRight, ArrowRight, AlertCircle, CheckCircle2, 
  Timer, Award, Radio, Tv
} from 'lucide-react';
import { api } from '../../services/api';

// Web Audio API Audio Cues for Stage Producer with safe lifecycle cleanup
let activeAudioCtx = null;

function getAudioContext() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!activeAudioCtx || activeAudioCtx.state === 'closed') {
      activeAudioCtx = new AudioContext();
    }
    if (activeAudioCtx.state === 'suspended') {
      activeAudioCtx.resume().catch(() => {});
    }
    return activeAudioCtx;
  } catch (e) {
    return null;
  }
}

function stopAllStageAudio() {
  try {
    if (activeAudioCtx && activeAudioCtx.state !== 'closed') {
      activeAudioCtx.close().catch(() => {});
    }
  } catch (e) {}
  activeAudioCtx = null;
}

function playStageChime(type = 'bell') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    if (!activeAudioCtx || activeAudioCtx.state === 'closed') {
      activeAudioCtx = new AudioContext();
    }
    
    const play = () => {
      try {
        const ctx = activeAudioCtx;
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'warning') {
          // Harmonic 2-tone chime
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
        } else if (type === 'overtime') {
          // Short Warning buzzer
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.setValueAtTime(164.81, now + 0.15);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
          osc.start(now);
          osc.stop(now + 0.45);
        } else {
          // Crisp Crystal Start Bell (880Hz A5 + High Harmonic)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.setValueAtTime(1046.5, now + 0.08); // C6 shimmer
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
        }
      } catch (err) {
        console.warn('Audio playback error:', err);
      }
    };

    if (activeAudioCtx.state === 'suspended') {
      activeAudioCtx.resume().then(play).catch(play);
    } else {
      play();
    }
  } catch (e) {
    console.warn('Audio chime playback notice:', e);
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

  // Unlock audio on initial mount / user interaction
  const handleToggleAudio = () => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    if (nextState) {
      playStageChime('bell');
    } else {
      stopAllStageAudio();
    }
  };

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

  // Countdown Loop - stops cleanly at 0 without infinite audio loops
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            if (audioEnabled) playStageChime('overtime');
            setTimerRunning(false);
            return 0;
          }
          if (prev === 61 && audioEnabled) {
            playStageChime('warning');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, audioEnabled]);

  // Clean up audio on unmount or mute
  useEffect(() => {
    if (!audioEnabled) {
      stopAllStageAudio();
    }
    return () => {
      stopAllStageAudio();
    };
  }, [audioEnabled]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setFullScreen(false);
    }
  };

  // Sync fullscreen change with ESC key
  useEffect(() => {
    const handleFsChange = () => {
      setFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

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
    if (secondsRemaining <= 0) return 'text-rose-600 dark:text-rose-400 animate-pulse';
    if (secondsRemaining <= 120) return 'text-amber-500 dark:text-amber-400';
    return 'text-[#B45309] dark:text-[#F59E0B]';
  };

  const getTimerBorder = () => {
    if (secondsRemaining <= 0) return 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-4 ring-rose-500/20';
    if (secondsRemaining <= 120) return 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 ring-4 ring-amber-400/20';
    return 'border-[#EFE8DA] dark:border-stone-800 bg-white dark:bg-[#141210]';
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-stone-500 dark:text-stone-400">
        <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading live stage run-of-show...
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`transition-colors duration-200 ${
        fullScreen 
          ? 'fixed inset-0 bg-[#FAF8F5] dark:bg-[#09090B] text-stone-900 dark:text-stone-100 p-6 sm:p-10 lg:p-12 z-50 overflow-y-auto scrollbar-sleek' 
          : 'space-y-8 animate-in fade-in font-sans text-stone-900 dark:text-stone-100'
      }`}
    >
      <div className={fullScreen ? 'max-w-7xl mx-auto space-y-8' : 'space-y-8'}>
        {/* Stage Header Banner */}
        <div className="bg-gradient-to-r from-[#1C1917] via-[#282119] to-[#1C1917] text-[#FDFAF5] p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
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
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 relative z-10">
            <button
              onClick={() => playStageChime('bell')}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-amber-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Test Audio Chime Sound"
            >
              <span>🔔</span>
              <span>Test Chime</span>
            </button>

            <button
              onClick={handleToggleAudio}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                audioEnabled 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' 
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }`}
              title={audioEnabled ? 'Audio Chimes Enabled' : 'Audio Chimes Muted'}
            >
              {audioEnabled ? <Volume2 size={16} className="text-amber-400" /> : <VolumeX size={16} />}
              <span>{audioEnabled ? 'Chimes Active' : 'Muted'}</span>
            </button>

            <button
              onClick={toggleFullScreen}
              className="px-4 py-2.5 rounded-2xl bg-[#B45309] hover:bg-[#92400E] text-white border border-[#B45309]/50 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#B45309]/30"
            >
              {fullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span>{fullScreen ? 'Exit Fullscreen' : 'Stage Fullscreen'}</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Digital Podium Timer (Left) + Run-of-Show Schedule (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Big Stage Clock & AV Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Main Giant Timer Card */}
            <div className={`p-8 sm:p-12 rounded-3xl border transition-all text-center flex flex-col items-center justify-center relative shadow-sm ${getTimerBorder()}`}>
              
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">
                <Timer size={16} className="text-[#B45309]" />
                <span>Current Stage Clock</span>
              </div>

              {/* Huge Digits */}
              <div className={`font-mono text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter my-4 ${getTimerColor()}`}>
                {formatTime(secondsRemaining)}
              </div>

              {/* Active Session Headline */}
              <div className="mt-2 mb-8 max-w-md">
                <span className="text-[11px] font-bold text-[#B45309] dark:text-amber-400 uppercase tracking-wider block">
                  {currentSession?.room ? `Room: ${currentSession.room}` : 'Main Keynote Stage'}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 truncate mt-1">
                  {currentSession?.title || 'General Conference Session'}
                </h3>
                {currentSession?.speakers?.length > 0 && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
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
                  className={`px-8 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2.5 shadow-md active:scale-95 ${
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
                  className="px-4 py-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs transition-colors flex items-center gap-1.5"
                  title="Reset to 15:00"
                >
                  <RotateCcw size={15} /> Reset
                </button>

                <button
                  onClick={() => addTime(1)}
                  className="px-3.5 py-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-stone-800/80 border border-[#EFE8DA] dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition-colors"
                >
                  +1 Min
                </button>

                <button
                  onClick={() => addTime(5)}
                  className="px-3.5 py-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-stone-800/80 border border-[#EFE8DA] dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition-colors"
                >
                  +5 Min
                </button>
              </div>
            </div>

            {/* Speaker Teleprompter & Producer Notes */}
            <div className="bg-white dark:bg-[#141210] p-6 sm:p-7 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Tv size={16} className="text-[#B45309] dark:text-amber-400" /> Stage Teleprompter &amp; AV Cue Card
                </h4>
                <span className="text-[10px] font-bold text-stone-400 uppercase">Live Broadcast Notes</span>
              </div>

              <textarea
                value={cueNotes}
                onChange={e => setCueNotes(e.target.value)}
                rows="3"
                className="w-full bg-[#FAF8F5] dark:bg-[#1C1917] border border-[#EFE8DA] dark:border-stone-700 rounded-2xl p-3 text-xs text-stone-800 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 font-mono focus:ring-2 focus:ring-[#B45309]/30 focus:outline-none leading-relaxed"
                placeholder="Enter cue notes, announcements, or teleprompter lines for the podium speaker..."
              />
            </div>

          </div>

          {/* Right Column: Interactive Run-of-Show Schedule (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#141210] p-6 sm:p-7 rounded-3xl border border-[#EFE8DA] dark:border-stone-800 shadow-xs flex flex-col h-full">
              
              <div className="flex items-center justify-between border-b border-[#EFE8DA] dark:border-stone-800 pb-4 mb-4">
                <div>
                  <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Radio size={16} className="text-emerald-600 animate-pulse" /> Live Run-of-Show Sequence
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Click any session to load on-stage</p>
                </div>
                <span className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-bold rounded-lg">
                  {sessions.length} Sessions
                </span>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-12 text-stone-400 space-y-2">
                  <Clock size={32} className="mx-auto text-stone-300 dark:text-stone-600" />
                  <p className="text-xs font-bold">No sessions scheduled yet.</p>
                  <p className="text-[11px]">Add multi-track sessions in the "Sessions" tab.</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[500px] scrollbar-sleek pr-1">
                  {sessions.map((session, idx) => {
                    const isActive = idx === activeSessionIndex;
                    return (
                      <div
                        key={session._id}
                        onClick={() => setActiveSessionIndex(idx)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isActive
                            ? 'bg-[#B45309]/10 dark:bg-[#B45309]/20 border-[#B45309] shadow-xs ring-1 ring-[#B45309]'
                            : 'bg-[#FAF8F5] dark:bg-[#1C1917] border-[#EFE8DA] dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                              isActive ? 'bg-[#B45309] text-white' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                            }`}>
                              {isActive ? 'ON STAGE NOW' : `Session ${idx + 1}`}
                            </span>
                            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                              {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <h5 className="font-extrabold text-xs text-stone-900 dark:text-stone-100 truncate">
                            {session.title}
                          </h5>

                          <div className="flex items-center gap-3 text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-[#B45309]" /> {session.room || 'Main Hall'}
                            </span>
                            {session.speakers?.length > 0 && (
                              <span className="flex items-center gap-1 truncate">
                                <Mic size={11} className="text-amber-700 dark:text-amber-400" /> {session.speakers[0].name}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight size={16} className={isActive ? 'text-[#B45309]' : 'text-stone-300 dark:text-stone-600'} />
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
                  className="w-full mt-4 bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                >
                  <span>Advance to Next Session</span>
                  <ArrowRight size={14} />
                </button>
              )}

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
