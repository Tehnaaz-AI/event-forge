import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('eventforge_user') || 'null');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to default dashboard based on their actual role
    if (user.role === 'ATTENDEE') {
      return <Navigate to="/dashboard/attendee" replace />;
    } else if (user.role === 'STAFF') {
      return <Navigate to="/dashboard/staff" replace />;
    } else {
      return <Navigate to="/dashboard/organizer" replace />;
    }
  }

  return <Outlet />;
}
