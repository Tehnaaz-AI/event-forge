import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, Download, TrendingUp, Users, CheckCircle, AlertTriangle, 
  Sparkles, DollarSign, Calendar, MapPin, Award
} from 'lucide-react';
import { api } from '../../services/api';

export default function PostEventReport({ eventId }) {
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['post-event-report', eventId],
    queryFn: () => api.get(`/events/${eventId}/intelligence/post-event-report`)
  });

  if (isLoading) {
    return (
      <div className="p-16 text-center text-stone-500">
        <div className="w-8 h-8 border-4 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Generating Comprehensive AI Post-Event Intelligence Report...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-12 text-center text-rose-700 bg-rose-50 rounded-3xl border border-rose-200">
        Failed to compile post-event report.
      </div>
    );
  }

  const { summaryMetrics, findings, recommendationsForNextEvent, operationalAuditLog } = report;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Report Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EFE8DA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <Award size={16} className="text-[#B45309]" /> Post-Event Intelligence Dossier
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">{report.eventTitle}</h2>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-4">
            <span><strong>Organization:</strong> {report.organizationName}</span>
            <span><strong>Venue:</strong> {report.venue}</span>
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-stone-900 hover:bg-[#B45309] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs shrink-0"
        >
          <Download size={14} /> Export / Print Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Attendance Rate</span>
          <div className="my-2 text-3xl font-black text-stone-900">{summaryMetrics.attendanceRate}</div>
          <p className="text-[11px] text-stone-500">{summaryMetrics.actualCheckedIn} of {summaryMetrics.confirmedAttendees} delegates</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">No-Show Rate</span>
          <div className="my-2 text-3xl font-black text-stone-900">{summaryMetrics.noShowRate}</div>
          <p className="text-[11px] text-stone-500">Unredeemed badges</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Mitigations Approved</span>
          <div className="my-2 text-3xl font-black text-stone-900">{summaryMetrics.actionsApproved}</div>
          <p className="text-[11px] text-stone-500">Human-in-the-loop actions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Gross Badge Sales</span>
          <div className="my-2 text-3xl font-black text-stone-900">${summaryMetrics.totalRevenue?.toLocaleString()}</div>
          <p className="text-[11px] text-stone-500">{summaryMetrics.totalRegistrations} total pass orders</p>
        </div>
      </div>

      {/* Findings and Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Key Findings */}
        <div className="bg-white p-6 rounded-3xl border border-[#EFE8DA] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900">
            <TrendingUp size={18} className="text-[#B45309]" />
            <h3 className="text-base font-extrabold">Executive Operational Findings</h3>
          </div>
          <div className="space-y-3">
            {findings.map((finding, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#B45309]/10 text-[#B45309] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{finding}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations For Next Event */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-900">
            <Sparkles size={18} className="text-[#B45309]" />
            <h3 className="text-base font-extrabold">AI Strategic Recommendations</h3>
          </div>
          <div className="space-y-3">
            {recommendationsForNextEvent.map((rec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white border border-amber-200 text-xs text-stone-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Audit Log Table */}
      {operationalAuditLog?.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-[#EFE8DA] shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-stone-900">Operational Mitigation Audit Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-stone-500 font-bold uppercase text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-4">Action Type</th>
                  <th className="py-2.5 px-4">Authorized By</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {operationalAuditLog.map((log, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-4 font-bold text-stone-900">{log.actionType}</td>
                    <td className="py-2.5 px-4">{log.actor}</td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-stone-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2.5 px-4 text-stone-500 truncate max-w-xs">{JSON.stringify(log.result)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
