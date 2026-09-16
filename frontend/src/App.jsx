import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Organizer Pages
import OrganizerOverview from './pages/organizer/OrganizerOverview';
import EventsList from './pages/organizer/EventsList';
import EventDashboard from './pages/organizer/EventDashboard';
import SpeakerManager from './pages/organizer/SpeakerManager';
import FeedbackList from './pages/organizer/FeedbackList';
import Settings from './pages/organizer/Settings';
import NewEvent from './pages/organizer/NewEvent';

// Attendee & Staff Pages
import AttendeeDashboard from './pages/attendee/AttendeeDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';

// Master Admin & Profile Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/common/Profile';

// Public Pages
import PublicLayout from './layouts/PublicLayout';
import EventPage from './pages/public/EventPage';
import ExploreEvents from './pages/public/ExploreEvents';
import FeaturesPage from './pages/public/FeaturesPage';
import AboutPage from './pages/public/AboutPage';

import ScrollToTop from './components/common/ScrollToTop';

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
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<ExploreEvents />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/e/:slug" element={<EventPage />} />
        </Route>
        
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        {/* Platform Master Admin Console */}
        <Route element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
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
    </BrowserRouter>
  );
}

export default App;
