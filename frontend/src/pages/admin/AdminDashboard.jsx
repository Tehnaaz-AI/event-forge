import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  ShieldCheck, Users, Calendar, DollarSign, Building, Trash2, 
  UserPlus, Search, Filter, ShieldAlert, CheckCircle2, AlertCircle, 
  ExternalLink, Sparkles, RefreshCw, X, Edit3, UserCheck, Eye, 
  Tag, MapPin, Key, Plus, ArrowRight, Layers, Mail, MessageSquare, Check
} from 'lucide-react';
import AppNavbar from '../../components/common/AppNavbar';
import AppFooter from '../../components/common/AppFooter';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentUser = JSON.parse(localStorage.getItem('eventforge_user') || 'null');

  const getInitialTab = () => {
    if (location.pathname.includes('/inquiries') || searchParams.get('tab') === 'inquiries') return 'inquiries';
    if (searchParams.get('tab') === 'events') return 'events';
    return 'users';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab); // 'users' | 'events' | 'inquiries'

  useEffect(() => {
    if (location.pathname.includes('/inquiries') || searchParams.get('tab') === 'inquiries') {
      setActiveTab('inquiries');
    } else if (searchParams.get('tab') === 'events') {
      setActiveTab('events');
    } else {
      setActiveTab('users');
    }
  }, [location.pathname, searchParams]);

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState('');
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState('ALL'); // 'ALL' | 'NEW' | 'IN_REVIEW' | 'RESOLVED'
  const [replyModalInquiry, setReplyModalInquiry] = useState(null);
  const [replyTemplate, setReplyTemplate] = useState('general');
  const [customReplyMessage, setCustomReplyMessage] = useState('');

  // Modals & Feedback
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null); // { type: 'user' | 'event', id, title }
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Add User Form State
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: 'InitialPass123!',
    role: 'ATTENDEE',
    organization: '',
    phone: '',
    bio: ''
  });

  // Edit User Form State
  const [editUserData, setEditUserData] = useState({
    name: '',
    role: 'ATTENDEE',
    status: 'ACTIVE',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, eventsData, inquiriesData] = await Promise.all([
        api.get('/admin/stats').catch(() => null),
        api.get('/admin/users').catch(() => []),
        api.get('/admin/events').catch(() => []),
        api.get('/admin/inquiries').catch(() => [])
      ]);
      if (statsData) setStats(statsData);
      if (usersData) setUsers(usersData);
      if (eventsData) setEvents(eventsData);
      if (inquiriesData) setInquiries(inquiriesData);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to load platform data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInquiryStatus = async (id, status) => {
    try {
      await api.patch(`/admin/inquiries/${id}`, { status });
      setInquiries(prev => prev.map(inq => inq._id === id ? { ...inq, status } : inq));
      showToast('success', `Inquiry status marked as ${status}`);
    } catch (err) {
      showToast('error', err.message || 'Failed to update inquiry status');
    }
  };

  const showToast = (type, text) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 4500);
  };

  // Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const created = await api.post('/admin/users', newUserData);
      setUsers([created, ...users]);
      setShowAddUserModal(false);
      setNewUserData({ name: '', email: '', password: 'InitialPass123!', role: 'ATTENDEE', organization: '', phone: '', bio: '' });
      showToast('success', `User account for "${created.name}" created successfully.`);
      // Refresh stats
      const updatedStats = await api.get('/admin/stats').catch(() => null);
      if (updatedStats) setStats(updatedStats);
    } catch (err) {
      showToast('error', err.message || 'Failed to create user account.');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit User Handler
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const updated = await api.patch(`/admin/users/${selectedUser._id}`, editUserData);
      setUsers(users.map(u => u._id === selectedUser._id ? updated : u));
      setShowEditUserModal(false);
      setSelectedUser(null);
      showToast('success', `Account for "${updated.name}" updated successfully.`);
    } catch (err) {
      showToast('error', err.message || 'Failed to update user account.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Action Handler (for both Users and Events)
  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    setActionLoading(true);
    const { type, id, title } = deleteConfirmTarget;

    try {
      if (type === 'user') {
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        showToast('success', `User "${title}" deleted from platform.`);
      } else if (type === 'event') {
        await api.delete(`/admin/events/${id}`);
        setEvents(events.filter(e => e._id !== id));
        showToast('success', `Conference "${title}" and all related data purged platform-wide.`);
      }
      setDeleteConfirmTarget(null);
      // Refresh stats
      const updatedStats = await api.get('/admin/stats').catch(() => null);
      if (updatedStats) setStats(updatedStats);
    } catch (err) {
      showToast('error', err.message || `Failed to delete ${type}.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Lists
  const filteredUsers = users.filter(u => {
    const matchesSearch = !userSearch || 
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = !userRoleFilter || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredEvents = events.filter(e => {
    const matchesSearch = !eventSearch || 
      e.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.venue?.name?.toLowerCase().includes(eventSearch.toLowerCase());
    const matchesStatus = !eventStatusFilter || e.status === eventStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInquiries = inquiries.filter(i => {
    const matchesSearch = !inquirySearch || 
      i.name?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      i.email?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      i.subject?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      i.message?.toLowerCase().includes(inquirySearch.toLowerCase());
    
    if (!matchesSearch) return false;
    if (inquiryFilter === 'NEW') return i.status === 'NEW';
    if (inquiryFilter === 'IN_REVIEW') return i.status === 'IN_REVIEW';
    if (inquiryFilter === 'RESOLVED') return i.status === 'RESOLVED';
    return true;
  });

  const REPLY_TEMPLATES = {
    general: (name, subject) => `Hi ${name},\n\nThank you for reaching out to EventForge operations regarding "${subject}".\n\nWe have received your message and our team is actively reviewing your request. We will follow up with any required details shortly.\n\nBest regards,\nEventForge Operations & Executive Support`,
    technical: (name, subject) => `Hi ${name},\n\nThank you for contacting EventForge technical support regarding "${subject}".\n\nOur engineering team has logged this item in our telemetry monitoring system. We are verifying system connectivity and will notify you as soon as this is resolved.\n\nBest regards,\nEventForge Platform Engineering`,
    vip: (name, subject) => `Hi ${name},\n\nThank you for your interest in EventForge Executive Summit VIP access and Enterprise Partnerships.\n\nOur partnerships desk is reviewing your submission and will provide attendee pass options and multi-track access details promptly.\n\nWarm regards,\nEventForge Executive Partnerships Desk`,
    registration: (name, subject) => `Hi ${name},\n\nThank you for contacting us regarding your conference pass and registration for "${subject}".\n\nYour pass verification and check-in QR credentials have been reviewed. If you need pass re-issuance or badge modification, please reply directly to this thread.\n\nBest regards,\nEventForge Delegate Services`
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'PLATFORM_ADMIN':
        return { label: 'Platform Admin', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'ORGANIZER':
        return { label: 'Organizer', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'STAFF':
        return { label: 'Staff / Gatekeeper', bg: 'bg-orange-50 text-orange-800 border-orange-200' };
      case 'SPEAKER':
        return { label: 'Speaker', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      default:
        return { label: 'Attendee', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
      case 'REGISTRATION_OPEN':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'LIVE':
        return 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse';
      case 'COMPLETED':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      default:
        return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans selection:bg-[#B45309] selection:text-white flex flex-col">
      {/* Floating Curved Navbar */}
      <AppNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Top Header & Platform Authority Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE8DA] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
              <ShieldAlert size={14} className="text-rose-600" />
              Platform Super-Administrator Authority
            </div>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Enterprise Master Console</h1>
            <p className="text-xs text-stone-500">Global oversight: User accounts, cross-tenant conferences, platform telemetry, and tenant security.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllAdminData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 bg-white border border-[#EFE8DA] hover:bg-stone-50 text-stone-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-xs"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Data
            </button>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-[#B45309]/20 transition-all"
            >
              <UserPlus size={14} /> Add Platform User
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedbackMsg.text && (
          <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            feedbackMsg.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span className="font-semibold">{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg({ type: '', text: '' })} className="hover:opacity-75">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Platform Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-[#EFE8DA] rounded-2xl p-5 shadow-xs hover-lift">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Total Users</span>
              <Users size={16} className="text-[#B45309]" />
            </div>
            <div className="text-2xl font-black text-stone-900">{stats?.totalUsers ?? users.length}</div>
            <div className="text-[10px] text-stone-500 mt-1">Platform-wide registered identities</div>
          </div>

          <div className="bg-white border border-[#EFE8DA] rounded-2xl p-5 shadow-xs hover-lift">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Conferences</span>
              <Calendar size={16} className="text-[#B45309]" />
            </div>
            <div className="text-2xl font-black text-stone-900">{stats?.totalEvents ?? events.length}</div>
            <div className="text-[10px] text-emerald-700 font-bold mt-1">{stats?.publishedEvents ?? events.length} Active / Published</div>
          </div>

          <div className="bg-white border border-[#EFE8DA] rounded-2xl p-5 shadow-xs hover-lift">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Registrations</span>
              <Layers size={16} className="text-[#B45309]" />
            </div>
            <div className="text-2xl font-black text-stone-900">{stats?.totalRegistrations ?? 0}</div>
            <div className="text-[10px] text-stone-500 mt-1">Issued passes & QR credentials</div>
          </div>

          <div className="bg-white border border-[#EFE8DA] rounded-2xl p-5 shadow-xs hover-lift">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Platform Volume</span>
              <DollarSign size={16} className="text-[#B45309]" />
            </div>
            <div className="text-2xl font-black text-stone-900">${(stats?.totalRevenue ?? 0).toLocaleString()}</div>
            <div className="text-[10px] text-stone-500 mt-1">Gross conference ticket GMV</div>
          </div>

          <div className="bg-white border border-[#EFE8DA] rounded-2xl p-5 shadow-xs hover-lift">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Organizations</span>
              <Building size={16} className="text-[#B45309]" />
            </div>
            <div className="text-2xl font-black text-stone-900">{stats?.totalOrganizations ?? 0}</div>
            <div className="text-[10px] text-stone-500 mt-1">Verified enterprise tenants</div>
          </div>
        </div>

        {/* Master Navigation Tabs */}
        <div className="flex border-b border-[#EFE8DA] gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 flex items-center gap-2 transition-all relative ${
              activeTab === 'users' ? 'text-[#B45309] border-b-2 border-[#B45309]' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Users size={16} /> User Account Directory ({users.length})
          </button>
          
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 flex items-center gap-2 transition-all relative ${
              activeTab === 'events' ? 'text-[#B45309] border-b-2 border-[#B45309]' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Calendar size={16} /> Global Conferences Roster ({events.length})
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`pb-3 flex items-center gap-2 transition-all relative ${
              activeTab === 'inquiries' ? 'text-[#B45309] border-b-2 border-[#B45309]' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Mail size={16} /> Inquiries &amp; Messages ({inquiries.length})
            {inquiries.filter(i => i.status === 'NEW').length > 0 && (
              <span className="px-2 py-0.5 bg-[#B45309] text-white rounded-full text-[10px] font-extrabold shadow-xs">
                {inquiries.filter(i => i.status === 'NEW').length} New
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: USER DIRECTORY & MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EFE8DA] shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={14} className="text-stone-400" />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl text-stone-700 focus:outline-none focus:border-[#B45309]"
                >
                  <option value="">All Platform Roles</option>
                  <option value="PLATFORM_ADMIN">Platform Admins</option>
                  <option value="ORGANIZER">Event Organizers</option>
                  <option value="STAFF">Event Staff / Door</option>
                  <option value="SPEAKER">Keynote Speakers</option>
                  <option value="ATTENDEE">Attendees</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-[#EFE8DA] rounded-3xl overflow-hidden shadow-md">
              <div className="overflow-x-auto max-h-[520px] overflow-y-auto scrollbar-beige">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#EFE8DA] text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-4 px-6">User / Identity</th>
                      <th className="py-4 px-6">Role Authority</th>
                      <th className="py-4 px-6">Organization</th>
                      <th className="py-4 px-6">Direct Contact</th>
                      <th className="py-4 px-6 text-right">Master Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE8DA]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-stone-400">
                          No users matched your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const role = getRoleBadge(u.role);
                        const isCurrent = u._id === currentUser?._id;
                        return (
                          <tr key={u._id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                                  alt={u.name}
                                  className="w-9 h-9 rounded-full object-cover border border-[#EFE8DA]" 
                                />
                                <div>
                                  <div className="font-extrabold text-stone-900 flex items-center gap-1.5">
                                    {u.name}
                                    {isCurrent && (
                                      <span className="text-[9px] bg-stone-900 text-white px-1.5 py-0.5 rounded-md font-normal">You</span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-stone-500">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${role.bg}`}>
                                {role.label}
                              </span>
                            </td>

                            <td className="py-4 px-6 text-stone-700 font-medium">
                              {u.organization?.name ? (
                                <span className="flex items-center gap-1">
                                  <Building size={12} className="text-[#B45309]" />
                                  {u.organization.name}
                                </span>
                              ) : (
                                <span className="text-stone-400">—</span>
                              )}
                            </td>

                            <td className="py-4 px-6 text-stone-500 font-mono text-[11px]">
                              {u.phone || '—'}
                            </td>

                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setEditUserData({
                                      name: u.name || '',
                                      role: u.role || 'ATTENDEE',
                                      status: u.status || 'ACTIVE',
                                      phone: u.phone || '',
                                      bio: u.bio || ''
                                    });
                                    setShowEditUserModal(true);
                                  }}
                                  className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                                  title="Edit user details"
                                >
                                  <Edit3 size={15} />
                                </button>

                                <button
                                  disabled={isCurrent}
                                  onClick={() => setDeleteConfirmTarget({ type: 'user', id: u._id, title: u.name })}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isCurrent ? 'text-stone-300 cursor-not-allowed' : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
                                  }`}
                                  title={isCurrent ? 'Cannot delete self' : 'Delete user from platform'}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: GLOBAL CONFERENCES ROSTER */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EFE8DA] shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text"
                  placeholder="Search conference title or venue..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={eventStatusFilter}
                  onChange={(e) => setEventStatusFilter(e.target.value)}
                  className="text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl text-stone-700 focus:outline-none focus:border-[#B45309]"
                >
                  <option value="">All Statuses</option>
                  <option value="PUBLISHED">Published / Open</option>
                  <option value="LIVE">Live Happening Now</option>
                  <option value="DRAFT">Draft Mode</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <Link
                  to="/dashboard/organizer/events/new"
                  className="inline-flex items-center gap-1.5 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shrink-0"
                >
                  <Plus size={13} /> Create Event
                </Link>
              </div>
            </div>

            {/* Conferences Table */}
            <div className="bg-white border border-[#EFE8DA] rounded-3xl overflow-hidden shadow-md">
              <div className="overflow-x-auto max-h-[520px] overflow-y-auto scrollbar-beige">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#EFE8DA] text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-4 px-6">Conference Title & Dates</th>
                      <th className="py-4 px-6">Host Organization</th>
                      <th className="py-4 px-6">Registrations / Cap</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Master Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE8DA]">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-stone-400">
                          No conferences found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((ev) => {
                        const statusClass = getStatusBadge(ev.status);
                        const regCount = ev.registrationCount ?? 15;
                        const capacity = ev.capacity || 200;
                        const pct = Math.min(100, Math.round((regCount / capacity) * 100));

                        return (
                          <tr key={ev._id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <Link 
                                  to={`/e/${ev.slug}`} 
                                  target="_blank"
                                  className="font-extrabold text-stone-900 hover:text-[#B45309] flex items-center gap-1.5"
                                >
                                  {ev.title} <ExternalLink size={11} className="text-stone-400" />
                                </Link>
                                <div className="text-[11px] text-stone-500 flex items-center gap-2">
                                  <span>{new Date(ev.startDate).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin size={10} className="text-[#B45309]" /> {ev.venue?.name || 'Main Hall'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6 font-medium text-stone-800">
                              <div className="flex items-center gap-1.5">
                                <Building size={13} className="text-[#B45309]" />
                                {ev.organization?.name || 'Global Enterprise Corp'}
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="space-y-1 w-32">
                                <div className="flex justify-between text-[11px] font-bold text-stone-700">
                                  <span>{regCount} passes</span>
                                  <span className="text-stone-400">{pct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#B45309] rounded-full" style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusClass}`}>
                                {ev.status}
                              </span>
                            </td>

                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  to={`/dashboard/organizer/events/${ev._id}`}
                                  className="p-1.5 text-stone-600 hover:text-[#B45309] hover:bg-stone-100 rounded-lg transition-colors"
                                  title="Open organizer workspace"
                                >
                                  <Eye size={15} />
                                </Link>

                                <button
                                  onClick={() => setDeleteConfirmTarget({ type: 'event', id: ev._id, title: ev.title })}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete conference platform-wide"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: INBOUND INQUIRIES & HELPDESK CRM SUITE */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            
            {/* Triage Telemetry Overview Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Inquiries</p>
                  <p className="text-2xl font-black text-stone-900">{inquiries.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold">
                  <Mail size={18} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Needs Triage</p>
                  <p className="text-2xl font-black text-[#B45309]">
                    {inquiries.filter(i => i.status === 'NEW').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#B45309] flex items-center justify-center font-bold">
                  <AlertCircle size={18} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Under Review</p>
                  <p className="text-2xl font-black text-blue-600">
                    {inquiries.filter(i => i.status === 'IN_REVIEW').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Search size={18} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFE8DA] shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Resolved</p>
                  <p className="text-2xl font-black text-emerald-600">
                    {inquiries.filter(i => i.status === 'RESOLVED').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 size={18} />
                </div>
              </div>
            </div>

            {/* Inquiries CRM Toolbar & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EFE8DA] shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text"
                  placeholder="Search sender, email, subject, or keywords..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-[#EFE8DA] text-xs font-bold">
                  <button
                    onClick={() => setInquiryFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      inquiryFilter === 'ALL' ? 'bg-white text-[#B45309] shadow-xs font-black' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    All ({inquiries.length})
                  </button>
                  <button
                    onClick={() => setInquiryFilter('NEW')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      inquiryFilter === 'NEW' ? 'bg-white text-[#B45309] shadow-xs font-black' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    ⚡ New ({inquiries.filter(i => i.status === 'NEW').length})
                  </button>
                  <button
                    onClick={() => setInquiryFilter('IN_REVIEW')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      inquiryFilter === 'IN_REVIEW' ? 'bg-white text-[#B45309] shadow-xs font-black' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    In Review ({inquiries.filter(i => i.status === 'IN_REVIEW').length})
                  </button>
                  <button
                    onClick={() => setInquiryFilter('RESOLVED')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      inquiryFilter === 'RESOLVED' ? 'bg-white text-[#B45309] shadow-xs font-black' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Resolved ({inquiries.filter(i => i.status === 'RESOLVED').length})
                  </button>
                </div>

                <button
                  onClick={loadAllAdminData}
                  className="p-2 text-stone-600 hover:text-[#B45309] rounded-xl hover:bg-stone-50 border border-[#EFE8DA] transition-colors shrink-0"
                  title="Refresh Inquiries"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Inquiries Message Feed */}
            <div className="space-y-4 max-h-[580px] overflow-y-auto scrollbar-beige pr-1">
              {filteredInquiries.length === 0 ? (
                <div className="bg-white p-14 text-center rounded-3xl border border-[#EFE8DA] text-stone-400 space-y-2">
                  <Mail size={32} className="mx-auto text-stone-300" />
                  <p className="font-bold text-stone-700 text-sm">No Inbound Inquiries Found</p>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    {inquirySearch ? 'No messages matched your search query.' : 'Public helpdesk messages submitted via the Contact page will arrive here in real-time.'}
                  </p>
                </div>
              ) : (
                filteredInquiries.map((inq) => {
                  const isNew = inq.status === 'NEW';
                  const isInReview = inq.status === 'IN_REVIEW';

                  return (
                    <div 
                      key={inq._id} 
                      className={`bg-white rounded-3xl p-6 border shadow-xs transition-all space-y-4 ${
                        isNew ? 'border-[#B45309]/50 ring-1 ring-[#B45309]/20' : 'border-[#EFE8DA]'
                      }`}
                    >
                      {/* Sender Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center font-black text-base uppercase shrink-0 shadow-xs">
                            {inq.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-stone-900 text-sm">{inq.name}</h4>
                              <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                                {inq.email}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                              <span>📅 {new Date(inq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              <span>•</span>
                              <span className="font-mono text-[10px]">ID: {inq._id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            isNew 
                              ? 'bg-amber-100 text-amber-800 border-amber-300' 
                              : isInReview
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}>
                            {inq.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Subject & Message Content */}
                      <div className="space-y-2">
                        <div className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                          <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">Subject:</span>
                          <span>{inq.subject}</span>
                        </div>
                        <div className="text-xs text-stone-700 bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-[#EFE8DA] leading-relaxed whitespace-pre-wrap font-sans">
                          {inq.message}
                        </div>
                      </div>

                      {/* Action Command Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
                        <div className="flex items-center gap-2 text-stone-500 text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>SLA Target: 2-Hour Turnaround</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Quick Reply Trigger Modal */}
                          <button
                            onClick={() => {
                              setReplyModalInquiry(inq);
                              setReplyTemplate('general');
                              setCustomReplyMessage(REPLY_TEMPLATES.general(inq.name, inq.subject));
                            }}
                            className="bg-[#B45309] hover:bg-[#92400E] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <Mail size={13} /> Quick Reply &amp; Templates
                          </button>

                          {/* Triage Status Toggles */}
                          {inq.status !== 'IN_REVIEW' && inq.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq._id, 'IN_REVIEW')}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                            >
                              Mark In Review
                            </button>
                          )}

                          {inq.status !== 'RESOLVED' ? (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq._id, 'RESOLVED')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Check size={13} /> Resolve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq._id, 'NEW')}
                              className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                            >
                              Reopen Inquiry
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </main>

      {/* 🌟 MODAL: QUICK INQUIRY RESPONDER & TEMPLATES 🌟 */}
      {replyModalInquiry && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFE8DA] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#EFE8DA] pb-4">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#B45309] uppercase tracking-wider">
                  <Mail size={14} /> Helpdesk Quick Response Composer
                </div>
                <h3 className="text-base font-black text-stone-900">
                  Replying to {replyModalInquiry.name} ({replyModalInquiry.email})
                </h3>
              </div>
              <button 
                onClick={() => setReplyModalInquiry(null)} 
                className="text-stone-400 hover:text-stone-900 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Template Selector Pills */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Select Response Template Preset:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'general', label: 'General Ack' },
                  { id: 'technical', label: 'Tech Support' },
                  { id: 'vip', label: 'VIP / Sponsor' },
                  { id: 'registration', label: 'Pass Help' }
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setReplyTemplate(tpl.id);
                      setCustomReplyMessage(REPLY_TEMPLATES[tpl.id](replyModalInquiry.name, replyModalInquiry.subject));
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all text-center ${
                      replyTemplate === tpl.id 
                        ? 'bg-[#B45309] text-white border-[#B45309]' 
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Response Body */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Response Message Preview:
              </label>
              <textarea
                rows={7}
                value={customReplyMessage}
                onChange={(e) => setCustomReplyMessage(e.target.value)}
                className="w-full text-xs p-3.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-2xl text-stone-900 focus:outline-none focus:border-[#B45309] font-sans leading-relaxed"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#EFE8DA]">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(customReplyMessage);
                  showToast('success', 'Response copied to clipboard!');
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors"
              >
                Copy Message Text
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setReplyModalInquiry(null)}
                  className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                
                <a
                  href={`mailto:${replyModalInquiry.email}?subject=Re: ${encodeURIComponent(replyModalInquiry.subject)}&body=${encodeURIComponent(customReplyMessage)}`}
                  onClick={() => {
                    handleUpdateInquiryStatus(replyModalInquiry._id, 'RESOLVED');
                    setReplyModalInquiry(null);
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Mail size={13} />
                  <span>Send &amp; Mark Resolved</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFE8DA] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#EFE8DA] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900">Add Platform User</h3>
                <p className="text-xs text-stone-500">Create a new identity directly in the database.</p>
              </div>
              <button onClick={() => setShowAddUserModal(false)} className="text-stone-400 hover:text-stone-900">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Full Name *</label>
                <input 
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="e.g. Dr. Jane Mitchell"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Email Address *</label>
                  <input 
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="user@enterprise.com"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Temporary Password</label>
                  <input 
                    type="text"
                    required
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Role Authority *</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                  >
                    <option value="ATTENDEE">Attendee</option>
                    <option value="ORGANIZER">Event Organizer</option>
                    <option value="STAFF">Event Staff / Door</option>
                    <option value="SPEAKER">Keynote Speaker</option>
                    <option value="PLATFORM_ADMIN">Platform Administrator</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Organization Name</label>
                  <input 
                    type="text"
                    value={newUserData.organization}
                    onChange={(e) => setNewUserData({ ...newUserData, organization: e.target.value })}
                    placeholder="Apex Global Innovations"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Direct Phone / Mobile</label>
                <input 
                  type="tel"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  placeholder="+1 (555) 019-2831"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EFE8DA]">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  {actionLoading ? 'Creating User...' : 'Confirm & Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFE8DA] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#EFE8DA] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900">Edit User Authority</h3>
                <p className="text-xs text-stone-500">Modify role, name, and details for {selectedUser.email}</p>
              </div>
              <button onClick={() => setShowEditUserModal(false)} className="text-stone-400 hover:text-stone-900">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Full Name</label>
                <input 
                  type="text"
                  required
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Role Authority</label>
                  <select
                    value={editUserData.role}
                    onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                  >
                    <option value="ATTENDEE">Attendee</option>
                    <option value="ORGANIZER">Event Organizer</option>
                    <option value="STAFF">Event Staff / Door</option>
                    <option value="SPEAKER">Keynote Speaker</option>
                    <option value="PLATFORM_ADMIN">Platform Administrator</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Account Status</label>
                  <select
                    value={editUserData.status}
                    onChange={(e) => setEditUserData({ ...editUserData, status: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                  >
                    <option value="ACTIVE">Active / Verified</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Direct Phone</label>
                <input 
                  type="tel"
                  value={editUserData.phone}
                  onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFE8DA] rounded-xl focus:outline-none focus:border-[#B45309]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EFE8DA]">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  {actionLoading ? 'Saving...' : 'Save User Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-stone-900">
                Confirm Platform Purge
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-stone-900 font-extrabold">"{deleteConfirmTarget.title}"</strong>?
                {deleteConfirmTarget.type === 'event' && (
                  <span className="block mt-1 text-rose-600 font-semibold">
                    This will delete all sessions, attendee registrations, tickets, announcements, and sponsor data.
                  </span>
                )}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-5 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-rose-600/20 transition-all"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Enterprise Luxury Footer */}
      <AppFooter />
    </div>
  );
}
