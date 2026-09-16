import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  X, CheckCircle, AlertCircle, Sparkles, Ticket as TicketIcon, 
  Tag, ShieldCheck, ArrowRight, UserCheck, Lock, QrCode,
  User, Mail, Key, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

export default function TicketCheckout({ event, initialCategoryId = null, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const categoriesList = (event.ticketCategories && event.ticketCategories.length > 0)
    ? event.ticketCategories
    : [{ _id: 'default', name: 'General Admission Pass', price: 299, capacity: 500, availableQuantity: 495, description: 'Full conference access, keynotes, and digital badge.' }];

  const [selectedCategory, setSelectedCategory] = useState(
    initialCategoryId || event.ticketCategories?.[0]?._id || categoriesList[0]?._id
  );
  const [couponCode, setCouponCode] = useState('SAVE20');
  const [appliedCoupon, setAppliedCoupon] = useState('SAVE20');
  const [couponDiscount, setCouponDiscount] = useState(0.2); // 20%
  const [successData, setSuccessData] = useState(null);
  
  // Real Auth Form State for Unauthenticated Visitors
  const [authMode, setAuthMode] = useState('REGISTER'); // 'REGISTER' | 'LOGIN'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => 
    JSON.parse(localStorage.getItem('eventforge_user') || 'null')
  );

  // Coupon application handler
  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'SAVE20') {
      setAppliedCoupon('SAVE20');
      setCouponDiscount(0.2);
    } else if (code === 'EARLYBIRD') {
      setAppliedCoupon('EARLYBIRD');
      setCouponDiscount(0.15);
    } else if (code === 'WELCOME10') {
      setAppliedCoupon('WELCOME10');
      setCouponDiscount(0.1);
    } else if (code === 'VIP50') {
      setAppliedCoupon('VIP50');
      setCouponDiscount('FIXED_50');
    } else {
      setAppliedCoupon('');
      setCouponDiscount(0);
      alert('Invalid coupon code. Try SAVE20 or EARLYBIRD');
    }
  };

  const registerMutation = useMutation({
    mutationFn: (data) => {
      const catId = (data.categoryId && data.categoryId !== 'default') 
        ? data.categoryId 
        : (event.ticketCategories?.[0]?._id || undefined);
      return api.post(`/events/${event._id}/register`, {
        ticketCategory: catId,
        couponCode: data.coupon
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      setSuccessData(data);
    },
    onError: (err) => {
      setAuthError(err.message || 'Registration failed.');
    }
  });

  // Handle authentic inline registration or login
  const handleAuthAndCheckout = async (e) => {
    e?.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      let activeUser = currentUser;

      if (!activeUser) {
        if (!authEmail.trim() || !authPassword.trim()) {
          setAuthError('Please enter your email and password.');
          setAuthLoading(false);
          return;
        }

        if (authMode === 'REGISTER') {
          if (!authName.trim()) {
            setAuthError('Please enter your full name for badge printing.');
            setAuthLoading(false);
            return;
          }
          if (authPassword.length < 6) {
            setAuthError('Password must be at least 6 characters.');
            setAuthLoading(false);
            return;
          }

          const res = await api.post('/auth/register', {
            name: authName.trim(),
            email: authEmail.trim(),
            password: authPassword
          });
          localStorage.setItem('eventforge_token', res.token);
          localStorage.setItem('eventforge_user', JSON.stringify(res.user));
          activeUser = res.user;
          setCurrentUser(res.user);
          window.dispatchEvent(new Event('storage'));
        } else {
          const res = await api.post('/auth/login', {
            email: authEmail.trim(),
            password: authPassword
          });
          localStorage.setItem('eventforge_token', res.token);
          localStorage.setItem('eventforge_user', JSON.stringify(res.user));
          activeUser = res.user;
          setCurrentUser(res.user);
          window.dispatchEvent(new Event('storage'));
        }
      }

      if (!selectedCategory) {
        setAuthError('Please select a ticket category.');
        setAuthLoading(false);
        return;
      }

      // Proceed with ticket booking
      registerMutation.mutate({
        categoryId: selectedCategory,
        coupon: appliedCoupon
      });
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const currentCat = categoriesList.find(c => String(c._id) === String(selectedCategory)) || categoriesList[0];
  const basePrice = currentCat?.price ?? 299;
  let finalPrice = basePrice;
  if (typeof couponDiscount === 'number') {
    finalPrice = Math.round(basePrice * (1 - couponDiscount));
  } else if (couponDiscount === 'FIXED_50') {
    finalPrice = Math.max(0, basePrice - 50);
  }

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#EFE8DA] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden text-stone-900 animate-in zoom-in-95 duration-200 relative">
        
        {/* Fixed Header */}
        <div className="bg-white border-b border-[#EFE8DA] px-6 py-4 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center font-bold">
              <TicketIcon size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900">Conference Pass Checkout</h2>
              <p className="text-[11px] text-stone-500 truncate max-w-xs">{event.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Close pass checkout"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-beige">

          {/* Success State Screen */}
          {successData ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle size={36} />
              </div>

              <div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 inline-block">
                  Registration Confirmed
                </span>
                <h3 className="text-2xl font-extrabold text-stone-900">You're Attending {event.title}!</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  Your registration is verified. Your digital QR entrance ticket is ready below and synced to your profile.
                </p>
              </div>

              {successData.ticket && (
                <div className="bg-white p-6 rounded-2xl border border-[#EFE8DA] shadow-md max-w-sm mx-auto space-y-3">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 inline-block">
                    {successData.ticket.qrCode ? (
                      <img src={successData.ticket.qrCode} alt="QR Entrance Ticket" className="w-40 h-40 mx-auto" />
                    ) : (
                      <QrCode size={120} className="mx-auto text-stone-400" />
                    )}
                  </div>
                  <p className="font-mono text-sm font-bold text-[#B45309] bg-[#B45309]/10 py-1.5 px-3 rounded-lg">
                    {successData.ticket.ticketNumber}
                  </p>
                  <p className="text-[11px] text-stone-500">Present this QR code at the door for optical scanner check-in</p>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <button
                  onClick={() => navigate('/thank-you', { state: { orderData: successData, event } })}
                  className="bg-[#B45309] hover:bg-[#92400E] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Order Receipt &amp; Pass</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  onClick={() => navigate('/dashboard/attendee')}
                  className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
                >
                  My Passes Portal
                </button>
                <button
                  onClick={onClose}
                  className="bg-white border border-[#EFE8DA] hover:bg-stone-50 text-stone-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Select Ticket Category */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                  1. Select Pass Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoriesList.map((cat) => {
                    const isSelected = String(selectedCategory) === String(cat._id);
                    return (
                      <div
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat._id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                          isSelected 
                            ? 'bg-white border-[#B45309] shadow-md ring-2 ring-[#B45309]/20' 
                            : 'bg-white border-[#EFE8DA] hover:border-stone-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-extrabold text-sm text-stone-900">{cat.name}</h4>
                          <span className="text-base font-black text-[#B45309]">${cat.price}</span>
                        </div>
                        <p className="text-xs text-stone-500 leading-relaxed">{cat.description || 'Full conference access and networking pass'}</p>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 font-medium">
                          <span>{cat.availableQuantity ?? cat.capacity} seats remaining</span>
                          {isSelected && <span className="text-[#B45309] font-bold">Selected ✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Coupon Code Section */}
              <div className="bg-white p-4 rounded-2xl border border-[#EFE8DA] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={14} className="text-[#B45309]" /> 2. Promo / Discount Code
                  </span>
                  <span className="text-[11px] text-stone-400">Use <strong className="text-[#B45309]">SAVE20</strong> for 20% off</span>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SAVE20"
                    className="flex-1 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-[#B45309]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-[#B45309] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#92400E] transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle size={13} /> Code <strong>{appliedCoupon}</strong> active ({typeof couponDiscount === 'number' ? `${couponDiscount * 100}% discount applied` : '$50 off'})
                  </div>
                )}
              </div>

              {/* Step 3: Identity & Account Binding */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                  3. Attendee Identity & Pass Ownership
                </label>

                {currentUser ? (
                  <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                        {currentUser.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-emerald-950">Logged in as {currentUser.name}</p>
                        <p className="text-[11px] text-emerald-700">{currentUser.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                      Verified Identity
                    </span>
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-sm space-y-4">
                    {/* Toggle between Register and Sign In */}
                    <div className="flex items-center justify-between border-b border-[#EFE8DA] pb-3">
                      <span className="text-xs font-bold text-stone-800">
                        {authMode === 'REGISTER' ? 'Create Attendee Account' : 'Sign In with Existing Account'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => { setAuthMode('REGISTER'); setAuthError(''); }}
                          className={`text-xs px-3 py-1 rounded-lg font-bold transition-all ${
                            authMode === 'REGISTER' ? 'bg-[#B45309] text-white shadow-xs' : 'text-stone-500 hover:text-stone-900 bg-stone-100'
                          }`}
                        >
                          New Attendee
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAuthMode('LOGIN'); setAuthError(''); }}
                          className={`text-xs px-3 py-1 rounded-lg font-bold transition-all ${
                            authMode === 'LOGIN' ? 'bg-[#B45309] text-white shadow-xs' : 'text-stone-500 hover:text-stone-900 bg-stone-100'
                          }`}
                        >
                          Sign In
                        </button>
                      </div>
                    </div>

                    {authError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0 text-rose-600" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      {authMode === 'REGISTER' && (
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                            <User size={12} className="text-[#B45309]" /> Full Name (Printed on Badge) *
                          </label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Alex Morgan"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                          />
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                          <Mail size={12} className="text-[#B45309]" /> Email Address (For Ticket QR Delivery) *
                        </label>
                        <input 
                          type="email"
                          required
                          placeholder="your.email@company.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                          <span className="flex items-center gap-1"><Key size={12} className="text-[#B45309]" /> Password *</span>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[10px] text-stone-400 hover:text-stone-700 flex items-center gap-0.5"
                          >
                            {showPassword ? <EyeOff size={11} /> : <Eye size={11} />} {showPassword ? 'Hide' : 'Show'}
                          </button>
                        </label>
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder={authMode === 'REGISTER' ? 'Minimum 6 characters' : 'Enter account password'}
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                        />
                      </div>
                    </div>

                    <div className="pt-2 text-center">
                      <Link
                        to={`/login?from=/e/${event.slug}?checkout=true`}
                        className="text-[11px] font-bold text-[#B45309] hover:underline"
                      >
                        Prefer full login page? Sign In / Register &amp; Continue &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Fixed Footer with Price & Action Button (Only in Form State) */}
        {!successData && (
          <div className="bg-white border-t border-[#EFE8DA] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 z-10">
            <div>
              <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider">Total Payable Amount</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">${finalPrice}</span>
                {finalPrice < basePrice && (
                  <span className="text-xs sm:text-sm line-through text-stone-400 font-medium">${basePrice}</span>
                )}
              </div>
            </div>

            <button 
              onClick={handleAuthAndCheckout}
              disabled={registerMutation.isPending || authLoading}
              className="w-full sm:w-auto bg-[#B45309] hover:bg-[#92400E] text-white px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all transform hover:-translate-y-0.5 shadow-xl shadow-[#B45309]/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {(registerMutation.isPending || authLoading) ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Processing Pass...</span>
                </>
              ) : (
                <>
                  <span>{currentUser ? 'Confirm & Secure Pass' : (authMode === 'REGISTER' ? 'Create Account & Secure Pass' : 'Sign In & Secure Pass')}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
