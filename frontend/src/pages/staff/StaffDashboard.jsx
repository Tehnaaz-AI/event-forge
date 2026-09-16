import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import jsQR from 'jsqr';
import { 
  QrCode, CheckCircle, AlertCircle, RefreshCw, UserCheck, Shield, 
  Camera, CameraOff, Sparkles, Volume2, History, ArrowRight, SwitchCamera,
  ScanLine
} from 'lucide-react';
import { api } from '../../services/api';

// Web Audio API for tactile feedback sounds
function playAudioFeedback(type = 'success') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

export default function StaffDashboard() {
  const user = JSON.parse(localStorage.getItem('eventforge_user') || '{}');
  const [ticketNumber, setTicketNumber] = useState('');
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [recentScans, setRecentScans] = useState([]);
  const [scanStatus, setScanStatus] = useState('Standby');
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasRef = useRef(null);
  const lastScannedRef = useRef({ code: '', time: 0 });

  const checkInMutation = useMutation({
    mutationFn: (code) => api.post('/events/staff/check-in', { ticketNumber: code }),
    onSuccess: (data) => {
      playAudioFeedback('success');
      setLastCheckIn(data);
      setRecentScans(prev => [data, ...prev.slice(0, 4)]);
      setTicketNumber('');
      setErrorMsg('');
      setScanStatus('Check-in verified!');
    },
    onError: (err) => {
      playAudioFeedback('error');
      setErrorMsg(err.message || 'Invalid or expired ticket code');
      setLastCheckIn(null);
      setScanStatus('Invalid or duplicate badge');
    }
  });

  const handleCheckIn = (e) => {
    if (e) e.preventDefault();
    if (!ticketNumber.trim()) return;
    checkInMutation.mutate(ticketNumber.trim());
  };

  // Optical frame scanning function
  const scanVideoFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      });

      if (code && code.data) {
        let extractedCode = code.data.trim();
        try {
          const parsed = JSON.parse(code.data);
          if (parsed && parsed.ticketNumber) {
            extractedCode = parsed.ticketNumber;
          }
        } catch (e) {
          // Plain text code
        }

        const now = Date.now();
        const isNewCode = extractedCode !== lastScannedRef.current.code || (now - lastScannedRef.current.time > 4000);

        if (isNewCode && !checkInMutation.isPending) {
          lastScannedRef.current = { code: extractedCode, time: now };
          setTicketNumber(extractedCode);
          setScanStatus(`Scanned: ${extractedCode}`);
          checkInMutation.mutate(extractedCode);
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  }, [checkInMutation]);

  // Start Camera Stream
  const startCamera = async (mode = facingMode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', true);
        videoRef.current.play();
      }

      setIsCameraActive(true);
      setErrorMsg('');
      setScanStatus('Scanning actively for attendee QR badges...');

      // Start the scan loop
      animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
    } catch (err) {
      console.error('Camera error:', err);
      setErrorMsg('Camera access denied or device not found. You can enter the ticket code manually below.');
      setIsCameraActive(false);
      setScanStatus('Camera unavailable');
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsCameraActive(false);
    setScanStatus('Standby');
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera(facingMode);
    }
  };

  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Simulator helper for fast evaluator demo
  const handleSimulateScan = () => {
    const sampleCodes = ['EF-2026-VIP-9941', 'EF-2026-CONF-1001', 'EF-2026-CONF-1002'];
    const randomCode = sampleCodes[Math.floor(Math.random() * sampleCodes.length)];
    setTicketNumber(randomCode);
    checkInMutation.mutate(randomCode);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 font-sans text-stone-900">
      
      {/* Welcome Header in Luxury Espresso / Beige */}
      <div className="bg-[#1C1917] text-[#FDFAF5] p-8 rounded-3xl shadow-xl flex items-center justify-between border border-white/10">
        <div className="space-y-2 max-w-xl">
          <span className="px-3 py-1 bg-white/10 text-[#C28E27] rounded-full text-xs font-bold uppercase tracking-wider inline-block backdrop-blur-md border border-white/10">
            Event Staff Operations
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Door Check-In &amp; QR Validation</h1>
          <p className="text-stone-300 text-xs md:text-sm leading-relaxed">
            Validate attendee passes, verify VIP status, and monitor real-time door arrival volumes.
          </p>
        </div>
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#C28E27] backdrop-blur-md shrink-0 border border-white/10">
          <Shield size={30} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Check-In Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Camera Scanner View */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm space-y-4">
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-[#B45309]" />
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">Live Optical QR Scanner</h3>
                  <p className="text-[10px] text-stone-400 font-mono">{scanStatus}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isCameraActive && (
                  <button
                    type="button"
                    onClick={flipCamera}
                    title="Flip camera"
                    className="p-1.5 rounded-xl border border-[#EFE8DA] text-stone-600 hover:bg-[#FAF8F5] transition-colors"
                  >
                    <SwitchCamera size={16} />
                  </button>
                )}
                <button
                  onClick={toggleCamera}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isCameraActive 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100' 
                      : 'bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/20 hover:bg-[#B45309]/20'
                  }`}
                >
                  {isCameraActive ? <><CameraOff size={14} /> Stop Camera</> : <><Camera size={14} /> Activate Camera</>}
                </button>
              </div>
            </div>

            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-stone-950 aspect-video flex items-center justify-center border-2 border-[#B45309]/50 shadow-inner">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-52 h-52 border-2 border-[#B45309] rounded-2xl relative">
                    <div className="absolute inset-x-0 h-0.5 bg-[#B45309] scanner-laser shadow-[0_0_12px_#B45309]"></div>
                  </div>
                </div>
                <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-mono rounded-full flex items-center justify-center gap-1.5 w-max mx-auto border border-white/10">
                    <ScanLine size={13} className="text-[#C28E27] animate-pulse" /> Hold attendee QR badge inside frame
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-[#FAF8F5] border border-dashed border-[#EFE8DA] rounded-2xl text-center space-y-2">
                <QrCode size={36} className="mx-auto text-stone-300" />
                <p className="text-xs font-bold text-stone-700">Camera Scanner in Standby</p>
                <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                  Click "Activate Camera" to enable continuous optical badge scanning.
                </p>
              </div>
            )}
          </div>

          {/* Manual Code Input Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EFE8DA] pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="text-[#B45309]" size={18} />
                <h3 className="font-extrabold text-stone-900 text-sm">Manual Pass Identifier Validation</h3>
              </div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Production Scanner
              </span>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-3 animate-in fade-in">
                <AlertCircle size={18} className="shrink-0 text-rose-600" /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleCheckIn} className="space-y-3">
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Enter Pass Code Identifier
              </label>
              <div className="flex gap-2.5">
                <input 
                  required
                  type="text" 
                  placeholder="e.g. EF-2026-VIP-9941" 
                  value={ticketNumber}
                  onChange={e => setTicketNumber(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
                <button 
                  type="submit"
                  disabled={!ticketNumber || checkInMutation.isPending}
                  className="bg-[#B45309] hover:bg-[#92400E] text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {checkInMutation.isPending ? <RefreshCw size={15} className="animate-spin" /> : <UserCheck size={15} />}
                  Check In
                </button>
              </div>
            </form>
          </div>

          {/* Check-In Approval Card */}
          {lastCheckIn && (
            <div className="bg-emerald-50 border-2 border-emerald-500 p-6 rounded-3xl shadow-lg text-center space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle size={32} />
              </div>

              <div>
                <span className="px-3 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-1 inline-block">
                  ✓ ENTRY APPROVED
                </span>
                <h3 className="text-2xl font-extrabold text-stone-900">
                  {lastCheckIn.registration?.attendee?.name || 'Attendee'}
                </h3>
                <p className="text-xs text-stone-600 font-mono">
                  {lastCheckIn.ticketNumber || lastCheckIn._id}
                </p>
              </div>

              <div className="pt-3 border-t border-emerald-200 grid grid-cols-2 gap-3 text-xs font-semibold text-stone-800">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-stone-400 block text-[9px] uppercase tracking-wider">CONFERENCE</span>
                  <span className="truncate block font-bold">{lastCheckIn.registration?.event?.title || 'TechConf 2026'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-stone-400 block text-[9px] uppercase tracking-wider">ADMISSION TIER</span>
                  <span className="truncate block font-bold">{lastCheckIn.registration?.ticketCategory?.name || 'Executive VIP'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Check-In Stream & Audio Notice */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EFE8DA] pb-3">
              <div className="flex items-center gap-2">
                <History size={16} className="text-[#B45309]" />
                <h3 className="font-extrabold text-stone-900 text-xs">Recent Arrivals Feed</h3>
              </div>
              <span className="text-[10px] font-bold text-stone-500 bg-[#FAF8F5] border border-[#EFE8DA] px-2 py-0.5 rounded-full">
                Live Log
              </span>
            </div>

            {recentScans.length > 0 ? (
              <div className="space-y-2.5">
                {recentScans.map((scan, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EFE8DA] text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-stone-900">{scan.registration?.attendee?.name || 'Attendee'}</p>
                      <p className="text-stone-400 text-[10px]">{scan.registration?.ticketCategory?.name || 'Verified Pass'}</p>
                    </div>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 text-center py-6">
                No door scans recorded this session. Validated passes will stream here.
              </p>
            )}
          </div>

          <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Volume2 size={16} className="text-[#B45309]" /> Audio Feedback Active
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Synthesized audio chimes sound automatically for door staff on every approved pass.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
