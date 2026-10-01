import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';

// Lazy-loaded Page Routes for optimized bundle chunking
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/common/Profile'));

// Organizer Pages
const OrganizerOverview = lazy(() => import('./pages/organizer/OrganizerOverview'));
const EventsList = lazy(() => import('./pages/organizer/EventsList'));
const EventDashboard = lazy(() => import('./pages/organizer/EventDashboard'));
const SpeakerManager = lazy(() => import('./pages/organizer/SpeakerManager'));
const FeedbackList = lazy(() => import('./pages/organizer/FeedbackList'));
const Settings = lazy(() => import('./pages/organizer/Settings'));
const NewEvent = lazy(() => import('./pages/organizer/NewEvent'));

// Attendee & Staff Pages
const AttendeeDashboard = lazy(() => import('./pages/attendee/AttendeeDashboard'));
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));

// Master Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Public Pages
const EventPage = lazy(() => import('./pages/public/EventPage'));
const ExploreEvents = lazy(() => import('./pages/public/ExploreEvents'));
const FeaturesPage = lazy(() => import('./pages/public/FeaturesPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const WaitlistPage = lazy(() => import('./pages/public/WaitlistPage'));
const ThankYouPage = lazy(() => import('./pages/public/ThankYouPage'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));

// Elegant Minimalist Route Loader
function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#EFE8DA] border-t-[#B45309] animate-spin" />
        <span className="text-xs font-mono font-medium text-stone-400">Loading EventForge...</span>
      </div>
    </div>
  );
}

// Helper component for root /dashboard redirect based on logged in user's role
function DashboardRedirect() {
  const user = JSON.parse(localStorage.getItem('eventforge_user') || 'null');
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'PLATFORM_ADMIN') return <Navigate to="/dashboard/admin" replace />;
  if (user.role === 'ATTENDEE') return <Navigate to="/dashboard/attendee" replace />;
  if (user.role === 'STAFF') return <Navigate to="/dashboard/staff" replace />;
  return <Navigate to="/dashboard/organizer" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ExploreEvents />} />
            <Route path="/conferences" element={<ExploreEvents />} />
            <Route path="/events" element={<ExploreEvents />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/e/:slug" element={<EventPage />} />
            <Route path="/conferences/:slug" element={<EventPage />} />
            <Route path="/events/:slug" element={<EventPage />} />
          </Route>
          
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />

          {/* 404 Route */}
          <Route element={<PublicLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Platform Master Admin Console & Inquiries */}
          <Route element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN']} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/admin/inquiries" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardRedirect />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Attendee Portal */}
            <Route element={<ProtectedRoute allowedRoles={['ATTENDEE', 'ORGANIZER', 'PLATFORM_ADMIN']} />}>
              <Route path="attendee" element={<AttendeeDashboard />} />
            </Route>

            {/* Staff Check-In Portal */}
            <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ORGANIZER', 'PLATFORM_ADMIN']} />}>
              <Route path="staff" element={<StaffDashboard />} />
            </Route>

            {/* Organizer & Admin Portal */}
            <Route element={<ProtectedRoute allowedRoles={['ORGANIZER', 'PLATFORM_ADMIN']} />}>
              <Route path="organizer" element={<OrganizerOverview />} />
              <Route path="organizer/events" element={<EventsList />} />
              <Route path="organizer/events/new" element={<NewEvent />} />
              <Route path="organizer/events/:id" element={<EventDashboard />} />
              <Route path="organizer/speakers" element={<SpeakerManager />} />
              <Route path="organizer/feedback" element={<FeedbackList />} />
              <Route path="organizer/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

