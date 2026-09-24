import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Activity, ShieldAlert, CheckCircle2, AlertTriangle, Play, RotateCcw, 
  Send, Bot, Sparkles, RefreshCw, Users, MapPin, Radio, Zap, 
  ArrowRight, Check, X, Shield, Clock, Eye, AlertOctagon, FileText
} from 'lucide-react';
import { api } from '../../services/api';

export default function EventPulse({ eventId }) {
  const queryClient = useQueryClient();
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotHistory, setCopilotHistory] = useState([]);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('command'); // 'command', 'copilot', 'recovery', 'simulation'
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // SSE Real-time Subscription
  useEffect(() => {
    if (!eventId) return;
    const token = localStorage.getItem('eventforge_token') || localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3100/api';
    const streamUrl = `${apiUrl}/events/${eventId}/intelligence/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    let eventSource = null;
    try {
      eventSource = new EventSource(streamUrl);

      eventSource.onopen = () => {
        setRealtimeConnected(true);
      };

      const handleUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ['event-pulse', eventId] });
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      };

      eventSource.addEventListener('ATTENDEE_CHECKED_IN', handleUpdate);
      eventSource.addEventListener('ROOM_OCCUPANCY_CHANGED', handleUpdate);
      eventSource.addEventListener('ACTION_EXECUTED', handleUpdate);
      eventSource.addEventListener('PULSE_UPDATED', handleUpdate);
      eventSource.addEventListener('ANNOUNCEMENT_CREATED', handleUpdate);

      eventSource.onerror = () => {
        setRealtimeConnected(false);
      };
    } catch (err) {
      console.warn('Real-time SSE subscription notice:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [eventId, queryClient]);

  // 1. Live Polling Event Pulse
  const { data: pulse, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['event-pulse', eventId],
    queryFn: () => api.get(`/events/${eventId}/intelligence/pulse`),
    refetchInterval: 12000, // Backup poll if SSE disconnected
    refetchOnWindowFocus: true
  });

  // 2. Recovery Scenarios Query
  const { data: recoveryScenarios } = useQuery({
    queryKey: ['recovery-scenarios', eventId],
    queryFn: () => api.get(`/events/${eventId}/intelligence/recovery-scenarios`),
    enabled: activeTab === 'recovery'
  });

  // 3. Execute Action Mutation
  const executeActionMutation = useMutation({
    mutationFn: (actionData) => api.post(`/events/${eventId}/intelligence/actions/execute`, actionData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-pulse', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      alert(`Action Executed Successfully: ${data?.message || 'State updated on live platform'}`);
    },
    onError: (err) => {
      alert(`Action execution failed: ${err.message || 'Unknown error'}`);
    }
  });

  // 4. Simulation Mutations
  const advanceSimMutation = useMutation({
    mutationFn: (config) => api.post(`/events/${eventId}/intelligence/simulation/step`, config),
    onSuccess: () => {
      setSimulationRunning(true);
      queryClient.invalidateQueries({ queryKey: ['event-pulse', eventId] });
    }
  });

  const resetSimMutation = useMutation({
    mutationFn: () => api.post(`/events/${eventId}/intelligence/simulation/reset`, {}),
    onSuccess: () => {
      setSimulationRunning(false);
      queryClient.invalidateQueries({ queryKey: ['event-pulse', eventId] });
    }
  });

  // Ask Copilot Handler
  const handleAskCopilot = async (customPrompt = null) => {
    const q = customPrompt || copilotQuery;
    if (!q || !q.trim()) return;

    setIsCopilotLoading(true);
    const userMsg = { role: 'user', text: q, time: new Date().toLocaleTimeString() };
    setCopilotHistory(prev => [...prev, userMsg]);
    setCopilotQuery('');

    try {
      const res = await api.post(`/events/${eventId}/intelligence/copilot`, { question: q });
      const botMsg = {
        role: 'assistant',
        text: res.answer,
        evidence: res.evidence || [],
        recommendations: res.recommendations || [],
        confidence: res.confidence || 'heuristic',
        time: new Date().toLocaleTimeString()
      };
      setCopilotHistory(prev => [...prev, botMsg]);
    } catch (err) {
      setCopilotHistory(prev => [
        ...prev, 
        { role: 'assistant', text: `Failed to query intelligence copilot: ${err.message}`, time: new Date().toLocaleTimeString() }
      ]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  if (isLoading && !pulse) {
    return (
      <div className="p-16 text-center text-stone-500">
        <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Synthesizing Live Event Pulse & Room Telemetry...
      </div>
    );
  }

  const healthScore = pulse?.eventHealth || 85;
  const healthBadgeColor = healthScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 
                          healthScore >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200' : 
                          'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Simulation Alert Banner if active */}
      {simulationRunning && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-800">Live Simulation Mode Active</p>
              <p className="text-xs text-amber-700">Telemetry is reacting dynamically to injected attendee traffic bursts.</p>
            </div>
          </div>
          <button 
            onClick={() => resetSimMutation.mutate()}
            className="px-3 py-1.5 bg-amber-700 text-white rounded-xl text-xs font-bold hover:bg-amber-800 transition-all flex items-center gap-1.5"
          >
            <RotateCcw size={13} /> Reset to Real Data
          </button>
        </div>
      )}

      {/* Hero Header & Live Heartbeat Indicator */}
      <div className="bg-[#1C1917] text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-stone-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B45309]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                realtimeConnected 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                <Radio size={12} className={realtimeConnected ? "animate-pulse text-emerald-400" : "text-amber-400"} /> 
                {realtimeConnected ? 'SSE REALTIME STREAM' : 'LIVE POLLING'}
              </span>
              <span className="text-xs text-stone-400">
                Updated {pulse?.lastUpdated ? new Date(pulse.lastUpdated).toLocaleTimeString() : 'just now'}
              </span>
              {isFetching && <RefreshCw size={12} className="animate-spin text-amber-400" />}
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Event Pulse Command Center</h2>
            <p className="text-xs text-stone-400 mt-1 max-w-xl">
              Continuous live monitoring, deterministic anomaly detection, and human-in-the-loop operational mitigations.
            </p>
          </div>

          {/* Quick Sub-Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 bg-stone-900/80 p-1.5 rounded-2xl border border-stone-800">
            <button
              onClick={() => setActiveTab('command')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'command' ? 'bg-[#B45309] text-white shadow-sm' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Activity size={14} /> Command Grid
            </button>
            <button
              onClick={() => setActiveTab('copilot')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'copilot' ? 'bg-[#B45309] text-white shadow-sm' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Bot size={14} /> AI Copilot
            </button>
            <button
              onClick={() => setActiveTab('recovery')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'recovery' ? 'bg-[#B45309] text-white shadow-sm' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Shield size={14} /> Recovery Mode
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'simulation' ? 'bg-[#B45309] text-white shadow-sm' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Zap size={14} /> Simulator
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: COMMAND GRID */}
      {activeTab === 'command' && (
        <div className="space-y-6">
          {/* Key Metric Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Health Score Card */}
            <div className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Health Indicator</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${healthBadgeColor}`}>
                  {healthScore >= 80 ? 'OPTIMAL' : healthScore >= 60 ? 'CAUTION' : 'AT RISK'}
                </span>
              </div>
              <div className="my-3 flex items-baseline gap-2">
                <span className="text-4xl font-black text-stone-900">{healthScore}</span>
                <span className="text-xs text-stone-400 font-bold">/ 100</span>
              </div>
              <div className="space-y-1 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                <div className="flex justify-between"><span>Attendance (25%)</span><span className="font-bold">{pulse?.healthBreakdown?.attendanceHealth || 100}%</span></div>
                <div className="flex justify-between"><span>Capacity (25%)</span><span className="font-bold">{pulse?.healthBreakdown?.capacityHealth || 100}%</span></div>
                <div className="flex justify-between"><span>Schedule (20%)</span><span className="font-bold">{pulse?.healthBreakdown?.scheduleHealth || 100}%</span></div>
              </div>
            </div>

            {/* Attendance Flow */}
            <div className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Badge Check-Ins</span>
                <Users size={16} className="text-[#B45309]" />
              </div>
              <div className="my-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-stone-900">{pulse?.attendance?.checkedIn || 0}</span>
                <span className="text-xs text-stone-400 font-bold">/ {pulse?.attendance?.registered || 0} registered</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#B45309] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${pulse?.attendance?.attendanceRate || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-stone-500 pt-2">
                <span>Check-in rate: <strong>{pulse?.attendance?.attendanceRate || 0}%</strong></span>
                <span>Waitlist: <strong>{pulse?.attendance?.waitlisted || 0}</strong></span>
              </div>
            </div>

            {/* Expected Arrival Curve */}
            <div className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Expected By Now</span>
                <Clock size={16} className="text-blue-600" />
              </div>
              <div className="my-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-stone-900">{pulse?.attendance?.expectedByNow || 0}</span>
                <span className="text-xs text-stone-400 font-bold">target</span>
              </div>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500">Arrival Lag:</span>
                <span className={`font-black ${pulse?.attendance?.gap > 20 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {pulse?.attendance?.gap > 0 ? `-${pulse?.attendance?.gap} delegates` : 'On Schedule'}
                </span>
              </div>
            </div>

            {/* Active Alert Summary */}
            <div className="bg-white p-5 rounded-3xl border border-[#EFE8DA] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Operational Alerts</span>
                <AlertTriangle size={16} className="text-amber-600" />
              </div>
              <div className="my-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-stone-900">{pulse?.alerts?.length || 0}</span>
                <span className="text-xs text-stone-400 font-bold">active anomalies</span>
              </div>
              <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Engine scanning every 8s</span>
              </div>
            </div>

          </div>

          {/* Active AI Recommendations & Human-in-the-Loop Actions */}
          {pulse?.recommendations?.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-900">
                <Sparkles size={18} className="text-[#B45309]" />
                <h3 className="text-sm font-black uppercase tracking-wider">Evidence-Backed AI Action Proposals</h3>
                <span className="text-xs bg-amber-200/60 px-2 py-0.5 rounded-full font-bold text-amber-800">Human Approval Required</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pulse.recommendations.map((rec) => (
                  <div key={rec.id} className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-amber-800 uppercase tracking-wider">{rec.proposedAction?.actionType?.replace('_', ' ')}</span>
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-bold">Confidence: {rec.confidence}</span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 mb-1">{rec.title}</h4>
                      <p className="text-xs text-stone-600 mb-3">{rec.recommendation}</p>
                      
                      {/* Evidence List */}
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 mb-4 space-y-1">
                        <p className="text-[10px] font-black uppercase text-stone-500 tracking-wider mb-1">Evidence & Telemetry:</p>
                        {rec.evidence.map((ev, idx) => (
                          <p key={idx} className="text-xs text-stone-700 font-mono flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">✓</span> {ev}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                      <button
                        onClick={() => executeActionMutation.mutate({
                          actionType: rec.proposedAction.actionType,
                          payload: rec.proposedAction.payload,
                          recommendationId: rec.id
                        })}
                        disabled={executeActionMutation.isPending}
                        className="flex-1 py-2 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Check size={14} /> Approve & Execute
                      </button>
                      <button 
                        onClick={() => alert('Recommendation dismissed')}
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rooms Grid & Multi-Track Diagnostics */}
          <div className="bg-white rounded-3xl p-6 border border-[#EFE8DA] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-stone-900">Room Occupancy & Safety Thresholds</h3>
                <p className="text-xs text-stone-500">Real-time room capacity vs current estimated delegate density.</p>
              </div>
              <button 
                onClick={() => refetch()}
                className="p-2 text-stone-500 hover:text-[#B45309] rounded-xl hover:bg-stone-50 transition-colors"
                title="Refresh Room Telemetry"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pulse?.rooms?.map((room) => {
                const isRisk = room.status === 'CAPACITY_RISK' || room.status === 'OVERFLOW';
                const statusColor = room.status === 'OVERFLOW' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                    room.status === 'CAPACITY_RISK' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                    room.status === 'NEAR_CAPACITY' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                                    'bg-emerald-50 text-emerald-800 border-emerald-200';

                return (
                  <div key={room.name} className={`p-4 rounded-2xl border transition-all ${isRisk ? 'border-amber-300 bg-amber-50/30' : 'border-stone-200 bg-stone-50/50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-stone-800">{room.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${statusColor}`}>
                        {room.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-2xl font-black text-stone-900">{room.estimatedOccupancy}</span>
                      <span className="text-xs text-stone-500 font-bold">/ {room.capacity} cap ({room.occupancyRate}%)</span>
                    </div>

                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden mb-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          room.occupancyRate >= 90 ? 'bg-rose-500' : room.occupancyRate >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${Math.min(100, room.occupancyRate)}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                      <span>Headroom: <strong>{room.remainingCapacity} seats</strong></span>
                      {room.activeSessions?.length > 0 && (
                        <span className="text-[#B45309] font-bold truncate max-w-[120px]">{room.activeSessions[0].title}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Alerts Table */}
          {pulse?.alerts?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-[#EFE8DA] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-stone-900">
                <AlertOctagon size={18} className="text-amber-600" />
                <h3 className="text-base font-extrabold">Active Operational Anomalies</h3>
              </div>

              <div className="space-y-3">
                {pulse.alerts.map((alt, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-stone-200 text-stone-800">
                          {alt.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          alt.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {alt.severity} SEVERITY
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-stone-900">{alt.title}</h4>
                      <p className="text-xs text-stone-600 mt-0.5">{alt.recommendedAction}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <button
                        onClick={() => handleAskCopilot(`How should I resolve this alert: "${alt.title}"?`)}
                        className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Bot size={13} /> Ask Copilot &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: AI EVENT COPILOT */}
      {activeTab === 'copilot' && (
        <div className="bg-white rounded-3xl p-6 border border-[#EFE8DA] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <Bot size={18} className="text-[#B45309]" /> EventForge Operational Copilot
              </h3>
              <p className="text-xs text-stone-500">Autonomous queries grounded in live MongoDB registrations, room occupancy, and arrivals.</p>
            </div>
          </div>

          {/* Prompt Chips */}
          <div className="flex flex-wrap gap-2">
            {[
              "What needs my attention right now?",
              "Why is Hall A at risk?",
              "Which session has the highest demand?",
              "How many people have not checked in?",
              "Give me a 30-minute event status report."
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleAskCopilot(chip)}
                className="px-3 py-1.5 bg-stone-50 hover:bg-[#B45309]/10 hover:border-[#B45309]/30 border border-stone-200 text-stone-700 hover:text-[#B45309] rounded-xl text-xs font-bold transition-all text-left"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Conversation History Terminal */}
          <div className="bg-stone-950 text-stone-100 rounded-2xl p-4 md:p-6 min-h-[360px] max-h-[500px] overflow-y-auto space-y-4 font-mono text-xs scrollbar-beige">
            {copilotHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 py-16">
                <Bot size={32} className="text-stone-600 mb-2" />
                <p className="text-sm font-bold text-stone-400">Event Copilot Terminal Ready</p>
                <p className="text-xs text-stone-600 max-w-sm mt-1">Ask questions about live crowd flow, room bottlenecks, attendance curve, or operational actions.</p>
              </div>
            ) : (
              copilotHistory.map((msg, idx) => (
                <div key={idx} className={`p-4 rounded-xl space-y-2 ${msg.role === 'user' ? 'bg-stone-900 border border-stone-800' : 'bg-stone-900/60 border border-amber-500/20'}`}>
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="font-bold text-amber-400">{msg.role === 'user' ? 'OPERATOR' : 'AI COPILOT'}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div className="whitespace-pre-line text-stone-200 leading-relaxed font-sans">{msg.text}</div>
                  
                  {msg.dataSources?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-stone-800 text-[10px] text-stone-500 font-mono flex flex-wrap gap-1.5 items-center">
                      <span className="text-stone-400 font-bold">VERIFIED SOURCES:</span>
                      {msg.dataSources.map((ds, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">{ds}</span>
                      ))}
                    </div>
                  )}

                  {msg.evidence?.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-stone-800 font-mono text-[11px] text-stone-400 space-y-1">
                      <div className="flex items-center justify-between text-amber-500 font-bold">
                        <span>LIVE TELEMETRY EVIDENCE:</span>
                        <span className="text-[10px] text-stone-400 font-normal">Source: {msg.engine || 'Event Intelligence'}</span>
                      </div>
                      {msg.evidence.map((ev, i) => (
                        <p key={i}>• {ev}</p>
                      ))}
                    </div>
                  )}

                  {msg.recommendations?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-stone-800 font-sans text-xs text-amber-300">
                      <p className="font-bold mb-1">PROPOSED ACTIONS:</p>
                      {msg.recommendations.map((rec, i) => (
                        <p key={i}>&rarr; {rec}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {isCopilotLoading && (
              <div className="flex items-center gap-2 text-amber-400 p-3 bg-stone-900 rounded-xl">
                <RefreshCw size={14} className="animate-spin" /> Querying live database and synthesizing operational recommendations...
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={copilotQuery}
              onChange={(e) => setCopilotQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskCopilot()}
              placeholder="Ask Copilot about room capacity, attendee arrivals, or risk mitigations..."
              className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:border-[#B45309] font-medium"
            />
            <button
              onClick={() => handleAskCopilot()}
              disabled={isCopilotLoading || !copilotQuery.trim()}
              className="px-5 py-3 bg-[#B45309] hover:bg-[#92400E] disabled:opacity-50 text-white rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Send size={14} /> Send
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: RECOVERY MODE */}
      {activeTab === 'recovery' && (
        <div className="bg-white rounded-3xl p-6 border border-[#EFE8DA] shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Shield size={18} className="text-rose-600" /> Operational Recovery Mode
            </h3>
            <p className="text-xs text-stone-500">One-click failover simulations and emergency action dispatchers for live conference disruptions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recoveryScenarios?.map((scenario) => (
              <div key={scenario.id} className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-stone-200 text-stone-800">{scenario.category}</span>
                    <span className="text-xs text-rose-700 font-bold">Hazard Mitigation</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-stone-900 mb-1">{scenario.title}</h4>
                  <p className="text-xs text-stone-600 mb-3"><strong>Potential Impact:</strong> {scenario.impact}</p>

                  <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1.5">
                    <p className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Mitigation Plan:</p>
                    {scenario.proposals.map((prop, i) => (
                      <p key={i} className="flex items-start gap-1.5 text-stone-600">
                        <span className="text-[#B45309] font-bold">&rarr;</span> {prop}
                      </p>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => executeActionMutation.mutate(scenario.actionPayload)}
                  disabled={executeActionMutation.isPending}
                  className="w-full py-2.5 bg-stone-900 hover:bg-[#B45309] text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Zap size={14} /> Dispatch Mitigation Action
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE SIMULATOR */}
      {activeTab === 'simulation' && (
        <div className="bg-white rounded-3xl p-6 border border-[#EFE8DA] shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Zap size={18} className="text-amber-600" /> Hackathon Demo Event Simulator
            </h3>
            <p className="text-xs text-stone-500">Inject real telemetry bursts into the database to demonstrate Event Pulse anomaly detection and AI recommendation approval.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider mb-1">Scenario A: Normal Arrivals</h4>
                <p className="text-xs text-stone-600 mb-3">Inject 20 check-ins with 65% occupancy in Hall A.</p>
              </div>
              <button
                onClick={() => advanceSimMutation.mutate({ targetOccupancy: 65, roomName: 'Hall A', checkInBurst: 20 })}
                disabled={advanceSimMutation.isPending}
                className="py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-all"
              >
                Inject 65% Flow
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-amber-300 bg-amber-50/50 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider mb-1">Scenario B: Capacity Risk (94%)</h4>
                <p className="text-xs text-amber-800 mb-3">Triggers Hall A capacity risk alert and AI overflow recommendation.</p>
              </div>
              <button
                onClick={() => advanceSimMutation.mutate({ targetOccupancy: 94, roomName: 'Hall A', checkInBurst: 40 })}
                disabled={advanceSimMutation.isPending}
                className="py-2 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Trigger 94% Risk Surge
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-rose-300 bg-rose-50/50 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider mb-1">Reset Simulation Telemetry</h4>
                <p className="text-xs text-rose-800 mb-3">Clears simulated telemetry and restores real live database state.</p>
              </div>
              <button
                onClick={() => resetSimMutation.mutate()}
                disabled={resetSimMutation.isPending}
                className="py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Reset Telemetry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
