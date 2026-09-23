import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, CheckCircle2, AlertCircle, Clock, ShieldCheck, Send } from 'lucide-react';
import { api } from '../../services/api';

export default function EventReviewsSection({ event }) {
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem('eventforge_user') || 'null');
  
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [session, setSession] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const eventEndDate = new Date(event?.endDate || event?.startDate);
  const now = new Date();
  const isConcluded = now >= eventEndDate || event?.status === 'COMPLETED';

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['event-reviews', event?._id],
    queryFn: () => api.get(`/events/${event._id}/feedback`),
    enabled: !!event?._id
  });

  const submitMutation = useMutation({
    mutationFn: (data) => api.post(`/events/${event._id}/feedback`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-reviews', event._id]);
      setComments('');
      setStatusMsg({ type: 'success', text: 'Thank you! Your official verified review has been published.' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 6000);
    },
    onError: (err) => {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to submit review.' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      setStatusMsg({ type: 'error', text: 'Please sign in to submit a verified attendee review.' });
      return;
    }
    submitMutation.mutate({
      rating: Number(rating),
      comments: comments.trim(),
      session: session || undefined
    });
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section className="max-w-5xl mx-auto px-6 mt-16 space-y-8">
      <div className="border-b border-[#EFE8DA] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Attendee Reviews &amp; <span className="cursive-accent font-normal text-[#B45309] text-3xl sm:text-4xl align-middle px-1">Executive Feedback</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Verified ratings and comments from conference delegates</p>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[#EFE8DA] shadow-xs">
          <div className="flex items-center gap-1 text-amber-500 font-extrabold text-sm">
            <Star size={16} className="fill-amber-400" />
            <span>{avgRating} / 5.0</span>
          </div>
          <span className="text-xs text-stone-400">({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})</span>
        </div>
      </div>

      {/* Review Submission Gate Notice */}
      {!isConcluded ? (
        <div className="bg-[#FAF8F5] border border-[#EFE8DA] rounded-3xl p-6 flex items-start gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-100/80 text-[#B45309] flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-stone-900">Official Reviews Open Post-Conference</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              To maintain genuine integrity, official feedback and session ratings unlock immediately after the conference concludes on{' '}
              <span className="font-bold text-stone-900">{eventEndDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>.
            </p>
          </div>
        </div>
      ) : (
        /* Review Form for Concluded Events */
        <div className="bg-white border border-[#EFE8DA] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
              <ShieldCheck size={16} className="text-[#B45309]" />
              <span>Submit Verified Post-Conference Review</span>
            </div>
            {user && (
              <span className="text-[11px] text-stone-500">
                Reviewing as <strong className="text-stone-800">{user.name}</strong>
              </span>
            )}
          </div>

          {statusMsg.text && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
              statusMsg.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {statusMsg.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Rating</label>
                <div className="flex items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFE8DA]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star size={20} className={s <= rating ? 'text-amber-500 fill-amber-400' : 'text-stone-300'} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-700 ml-2">{rating} of 5 Stars</span>
                </div>
              </div>

              {event.sessions?.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Specific Session (Optional)</label>
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                  >
                    <option value="">Overall Conference Experience</option>
                    {event.sessions.map((s) => (
                      <option key={s._id} value={s._id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Your Feedback &amp; Takeaways</label>
              <textarea
                rows="3"
                required
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your experience regarding speakers, organization, key takeaways, and networking..."
                className="w-full bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl p-3.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#B45309]"
              />
            </div>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="bg-[#B45309] hover:bg-[#92400E] text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send size={13} />
              <span>{submitMutation.isPending ? 'Submitting...' : 'Post Verified Review'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Published Reviews List with Scrollbar */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-stone-900 text-sm">Published Delegate Feedback ({reviews.length})</h3>
        
        {reviews.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-[#EFE8DA] text-center text-stone-400 text-xs">
            No delegate feedback submitted yet.
          </div>
        ) : (
          <div className="space-y-3 max-h-[440px] overflow-y-auto scrollbar-beige pr-1">
            {reviews.map((rev) => (
              <div key={rev._id} className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#B45309]/10 text-[#B45309] flex items-center justify-center font-bold text-xs">
                      {rev.attendee?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">{rev.attendee?.name || 'Verified Delegate'}</p>
                      {rev.session?.title && (
                        <p className="text-[10px] text-stone-500">Session: {rev.session.title}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className={i < (rev.rating || 5) ? 'fill-amber-400 text-amber-500' : 'text-stone-200'} />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-light pl-9.5">
                  {rev.comments || 'No comment provided.'}
                </p>
                <p className="text-[10px] text-stone-400 pl-9.5">
                  {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
