import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { 
  CheckCircle, Ticket, Calendar, MapPin, Download, 
  Share2, ArrowRight, UserCheck, ShieldCheck, Sparkles, Home 
} from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import useDocumentTitle from '../../components/common/useDocumentTitle';

export default function ThankYouPage() {
  useDocumentTitle('Order Confirmed - Thank You', 'Your conference passes and digital QR entrance badges are ready.');
  const location = useLocation();
  const orderData = location.state?.orderData;
  const event = location.state?.event;

  // Fallback demo order if visited directly
  const displayData = orderData || {
    ticket: {
      ticketNumber: 'EF-CONFIRMED-2026',
      status: 'ACTIVE'
    },
    registration: {
      amount: 299,
      registrationStatus: 'CONFIRMED'
    }
  };

  const handleDownloadCalendar = () => {
    const title = event?.title || 'EventForge Global Executive Summit';
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EventForge//EN
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:Your confirmed conference pass: ${displayData.ticket?.ticketNumber || 'Confirmed'}
LOCATION:${event?.venue?.name || 'Convention Center'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'conference-pass.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: 'Ticket Checkout', path: '/explore' }, { label: 'Order Confirmation' }]} />

      <div className="bg-white rounded-3xl border border-[#EFE8DA] p-8 sm:p-12 shadow-xl text-center space-y-8 mt-4 animate-in fade-in">
        {/* Animated Celebration Icon */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle size={42} />
        </div>

        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1 rounded-full">
            Pass Confirmed &amp; Secured
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-stone-900 tracking-tight">
            You're In! We Can't Wait to See You.
          </h1>
          <p className="text-sm md:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
            Your registration has been recorded. Your digital QR code entrance badge is active and stored in your Attendee Portal for rapid door check-in.
          </p>
        </div>

        {/* Digital Ticket Pass Summary Card */}
        <div className="bg-gradient-to-br from-[#FDFAF5] via-[#FAF8F5] to-[#F5F2EB] border border-[#EFE8DA] rounded-3xl p-6 sm:p-8 max-w-lg mx-auto text-left space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#B45309] text-white text-[10px] font-extrabold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
            Active Pass
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Conference</p>
            <h3 className="text-lg font-bold text-stone-900 leading-snug">
              {event?.title || 'FutureTech Global Executive Summit 2026'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-200/60 text-xs">
            <div>
              <p className="text-stone-400 font-semibold text-[10px] uppercase">Ticket Code</p>
              <p className="font-mono font-bold text-stone-900">{displayData.ticket?.ticketNumber || 'EF-2026-PASS'}</p>
            </div>
            <div>
              <p className="text-stone-400 font-semibold text-[10px] uppercase">Status</p>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <ShieldCheck size={12} /> Confirmed
              </span>
            </div>
          </div>

          {event?.venue?.name && (
            <div className="pt-2 text-xs text-stone-600 flex items-center gap-1.5">
              <MapPin size={13} className="text-[#B45309] shrink-0" />
              <span>{event.venue.name}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/dashboard/attendee"
            className="w-full sm:w-auto bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-[#B45309]/20 transition-all flex items-center justify-center gap-2"
          >
            <Ticket size={16} />
            <span>View Digital Badge in Portal</span>
          </Link>

          <button
            onClick={handleDownloadCalendar}
            className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold py-3.5 px-6 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Calendar size={16} />
            <span>Add to Calendar (.ics)</span>
          </button>
        </div>

        <div className="pt-6 border-t border-[#EFE8DA] flex items-center justify-center gap-4 text-xs text-stone-500">
          <Link to="/" className="text-stone-600 hover:text-[#B45309] font-bold flex items-center gap-1">
            <Home size={13} /> Back to Home
          </Link>
          <span>•</span>
          <Link to="/explore" className="text-stone-600 hover:text-[#B45309] font-bold">
            Explore More Summits
          </Link>
        </div>
      </div>
    </div>
  );
}
