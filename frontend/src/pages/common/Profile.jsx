import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  User, Mail, Phone, Building, Shield, KeyRound, 
  CheckCircle2, AlertCircle, Camera, Sparkles, ArrowLeft,
  Save, Eye, EyeOff, Award, Briefcase, RefreshCw, Lock,
  Upload, Image, Check
} from 'lucide-react';
import AppNavbar from '../../components/common/AppNavbar';
import AmbientLiveBackground from '../../components/common/AmbientLiveBackground';

const AVATAR_PRESETS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', label: 'Executive Ivory' },
  { id: '2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', label: 'Director Sand' },
  { id: '3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200', label: 'Leader Gold' },
  { id: '4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', label: 'Strategist Bronze' },
  { id: '5', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200', label: 'Ambassador Warm' },
  { id: '6', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', label: 'Architect Stone' },
];

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cachedUser = JSON.parse(localStorage.getItem('eventforge_user') || 'null');

  const [user, setUser] = useState(cachedUser);
  const [name, setName] = useState(cachedUser?.name || '');
  const [email] = useState(cachedUser?.email || '');
  const [phone, setPhone] = useState(cachedUser?.phone || '');
  const [bio, setBio] = useState(cachedUser?.bio || '');
  const [avatar, setAvatar] = useState(cachedUser?.avatar || AVATAR_PRESETS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState('');
  const [pwdErrorMsg, setPwdErrorMsg] = useState('');

  // Handle local device image file upload
  const handleDeviceFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('Image size must be under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result;
      if (base64Data) {
        setAvatar(base64Data);
        setCustomAvatarUrl('');
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.get('/auth/me');
      if (data) {
        setUser(data);
        setName(data.name || '');
        setPhone(data.phone || '');
        setBio(data.bio || '');
        if (data.avatar) setAvatar(data.avatar);
        localStorage.setItem('eventforge_user', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Could not refresh profile from server, using cached state', err.message);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const selectedAvatar = customAvatarUrl.trim() || avatar;
      const updated = await api.patch('/auth/profile', {
        name,
        phone,
        bio,
        avatar: selectedAvatar
      });

      setUser(updated);
      setAvatar(updated.avatar);
      localStorage.setItem('eventforge_user', JSON.stringify(updated));
      setSuccessMsg('Profile details successfully updated and synchronized.');
      
      // Dispatch storage event so navbar updates immediately
      window.dispatchEvent(new Event('storage'));
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdSuccessMsg('');
    setPwdErrorMsg('');

    if (newPassword.length < 6) {
      setPwdErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdErrorMsg('New passwords do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      await api.patch('/auth/password', {
        currentPassword,
        newPassword
      });
      setPwdSuccessMsg('Password successfully changed. Use your new password on next login.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccessMsg(''), 4000);
    } catch (err) {
      setPwdErrorMsg(err.message || 'Failed to change password. Check your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'PLATFORM_ADMIN':
        return { label: 'Platform Administrator', bg: 'bg-rose-50 text-rose-800 border-rose-200', icon: Shield };
      case 'ORGANIZER':
        return { label: 'Event Organizer', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: Briefcase };
      case 'STAFF':
        return { label: 'Gatekeeper / Staff', bg: 'bg-orange-50 text-orange-800 border-orange-200', icon: Award };
      default:
        return { label: 'Verified Attendee', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: User };
    }
  };

  const roleInfo = getRoleBadge(user?.role);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#121110] text-stone-900 dark:text-stone-100 font-sans selection:bg-[#B45309] selection:text-white flex flex-col relative transition-colors duration-300">
      
      {/* Live Moving Ambient Dynamic Background */}
      <AmbientLiveBackground />

      {/* Floating Curved Navbar */}
      <AppNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
        
        {/* Breadcrumb Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="w-9 h-9 rounded-full bg-white dark:bg-[#1C1917] border border-[#EFE8DA] dark:border-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
              title="Go back"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider block">Identity & Preferences</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-[#F5F2EB] tracking-tight">Executive Profile Studio</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'PLATFORM_ADMIN' && (
              <Link 
                to="/dashboard/admin"
                className="bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors"
              >
                Platform Admin Console
              </Link>
            )}
            {user?.role === 'ORGANIZER' && (
              <Link 
                to="/dashboard/organizer"
                className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors"
              >
                Organizer Console
              </Link>
            )}
            {user?.role === 'ATTENDEE' && (
              <Link 
                to="/dashboard/attendee"
                className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors"
              >
                My Passes
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Summary Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#171614] border border-[#EFE8DA] dark:border-stone-800 rounded-3xl p-6 shadow-md text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#B45309]/10 to-transparent pointer-events-none"></div>
              
              <div className="relative inline-block pt-2">
                <img 
                  src={avatar || AVATAR_PRESETS[0].url} 
                  alt={user?.name || 'User Avatar'} 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-stone-700 shadow-lg mx-auto"
                />
                <span className="absolute bottom-1 right-1 w-7 h-7 bg-[#B45309] text-white rounded-full flex items-center justify-center border-2 border-white dark:border-stone-800 shadow-xs">
                  <Sparkles size={13} />
                </span>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-stone-900 dark:text-[#F5F2EB]">{name || 'EventForge Member'}</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">{email}</p>
                {user?.organization?.name && (
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300 mt-1 flex items-center justify-center gap-1">
                    <Building size={12} className="text-[#B45309]" /> {user.organization.name}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleInfo.bg}`}>
                  <RoleIcon size={13} />
                  {roleInfo.label}
                </span>
              </div>

              {/* Bio snippet */}
              {bio && (
                <p className="text-xs text-stone-600 dark:text-stone-300 bg-[#FAF8F5] dark:bg-[#1C1917] p-3 rounded-2xl border border-[#EFE8DA] dark:border-stone-800 italic text-left">
                  "{bio}"
                </p>
              )}
            </div>

            {/* Avatar Preset Selector */}
            <div className="bg-white dark:bg-[#171614] border border-[#EFE8DA] dark:border-stone-800 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <Camera size={14} className="text-[#B45309]" /> Choose Signature Portrait
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = avatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setAvatar(preset.url);
                        setCustomAvatarUrl('');
                      }}
                      className={`relative rounded-2xl overflow-hidden border-2 transition-all p-0.5 ${
                        isSelected 
                          ? 'border-[#B45309] ring-2 ring-[#B45309]/30 scale-105' 
                          : 'border-[#EFE8DA] hover:border-stone-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-16 object-cover rounded-xl" />
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-[#B45309] text-white rounded-full flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Local Device Photo Uploader */}
              <div className="pt-2 border-t border-[#EFE8DA] space-y-2">
                <input 
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleDeviceFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-2.5 px-3 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    uploadSuccess 
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800' 
                      : 'bg-[#FAF8F5] border-[#EFE8DA] hover:border-[#B45309] text-stone-700 hover:text-[#B45309]'
                  }`}
                >
                  {uploadSuccess ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span>Photo Loaded from Device!</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} className="text-[#B45309]" />
                      <span>Upload Photo from Device</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-stone-400 text-center">Supports JPG, PNG, WEBP up to 4MB</p>
              </div>

              <div className="pt-1 space-y-1">
                <label className="text-[11px] font-bold text-stone-600">Or Custom Image URL</label>
                <input 
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customAvatarUrl}
                  onChange={(e) => {
                    setCustomAvatarUrl(e.target.value);
                    if (e.target.value.trim()) setAvatar(e.target.value.trim());
                  }}
                  className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Edit Details & Password */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* General Profile Settings */}
            <div className="bg-white dark:bg-[#171614] border border-[#EFE8DA] dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 dark:text-[#F5F2EB] tracking-tight">Personal & Professional Details</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">Update how other organizers, attendees, and staff see your profile.</p>
              </div>

              {successMsg && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <User size={13} className="text-[#B45309]" /> Full Name
                    </label>
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full text-xs font-medium px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#24211D] border border-[#EFE8DA] dark:border-stone-700 rounded-xl focus:outline-none focus:border-[#B45309] text-stone-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Mail size={13} className="text-stone-400" /> Primary Email (Locked)
                    </label>
                    <input 
                      type="email"
                      disabled
                      value={email}
                      className="w-full text-xs font-medium px-4 py-2.5 bg-stone-100 dark:bg-stone-800 border border-[#EFE8DA] dark:border-stone-700 rounded-xl text-stone-500 dark:text-stone-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Phone size={13} className="text-[#B45309]" /> Direct Contact / Phone
                    </label>
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full text-xs font-medium px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#24211D] border border-[#EFE8DA] dark:border-stone-700 rounded-xl focus:outline-none focus:border-[#B45309] text-stone-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Shield size={13} className="text-[#B45309]" /> Platform Authority
                    </label>
                    <input 
                      type="text"
                      disabled
                      value={roleInfo.label}
                      className="w-full text-xs font-medium px-4 py-2.5 bg-stone-100 dark:bg-stone-800 border border-[#EFE8DA] dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Executive Bio & Expertise</label>
                  <textarea 
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short summary of your background, corporate credentials, or keynote topics..."
                    className="w-full text-xs font-medium px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#24211D] border border-[#EFE8DA] dark:border-stone-700 rounded-xl focus:outline-none focus:border-[#B45309] text-stone-900 dark:text-white resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-[#B45309]/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    {loading ? 'Saving Profile...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security & Password Studio */}
            <div className="bg-white dark:bg-[#171614] border border-[#EFE8DA] dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 dark:text-[#F5F2EB] tracking-tight flex items-center gap-2">
                  <KeyRound size={18} className="text-[#B45309]" /> Security & Password
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">Update your account login password.</p>
              </div>

              {pwdSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{pwdSuccessMsg}</span>
                </div>
              )}

              {pwdErrorMsg && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{pwdErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                    <span>Current Password</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 font-normal cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </label>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full text-xs font-medium px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#24211D] border border-[#EFE8DA] dark:border-stone-700 rounded-xl focus:outline-none focus:border-[#B45309] text-stone-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">New Password</label>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full text-xs font-medium px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#24211D] border border-[#EFE8DA] dark:border-stone-700 rounded-xl focus:outline-none focus:border-[#B45309] text-stone-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Confirm New Password</label>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full text-xs font-medium px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#24211D] border border-[#EFE8DA] dark:border-stone-700 rounded-xl focus:outline-none focus:border-[#B45309] text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={pwdLoading || !currentPassword || !newPassword}
                    className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {pwdLoading ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                    {pwdLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
