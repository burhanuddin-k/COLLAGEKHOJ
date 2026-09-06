import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import CollegeSearch from './pages/CollegeSearch.jsx';
import CollegeDetails from './pages/CollegeDetails.jsx';
import CourseExplorer from './pages/CourseExplorer.jsx';
import CourseDetails from './pages/CourseDetails.jsx';
import Compare from './pages/Compare.jsx';
import FindMyCollege from './pages/FindMyCollege.jsx';
import CollegeMap from './pages/CollegeMap.jsx';
import Admissions from './pages/Admissions.jsx';
import WriteReview from './pages/WriteReview.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import SavedColleges from './pages/SavedColleges.jsx';
import ApplicationChecklist from './pages/ApplicationChecklist.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
import NotFound from './pages/NotFound.jsx';

import CollegePortalDashboard from './pages/college-portal/CollegePortalDashboard.jsx';
import ClaimCollege from './pages/college-portal/ClaimCollege.jsx';
import SubmitUpdate from './pages/college-portal/SubmitUpdate.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminColleges from './pages/admin/AdminColleges.jsx';
import AdminReviews from './pages/admin/AdminReviews.jsx';
import AdminUpdateRequests from './pages/admin/AdminUpdateRequests.jsx';
import AdminAuditLogs from './pages/admin/AdminAuditLogs.jsx';

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          {/* Student website */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<CollegeSearch />} />
          <Route path="/colleges/:slug" element={<CollegeDetails />} />
          <Route path="/courses" element={<CourseExplorer />} />
          <Route path="/courses/:slug" element={<CourseDetails />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/find-my-college" element={<FindMyCollege />} />
          <Route path="/map" element={<CollegeMap />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/reviews/new" element={
            <ProtectedRoute roles={['student']}><WriteReview /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/saved-colleges" element={
            <ProtectedRoute roles={['student']}><SavedColleges /></ProtectedRoute>
          } />
          <Route path="/checklist" element={
            <ProtectedRoute roles={['student']}><ApplicationChecklist /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>
          } />

          {/* College portal */}
          <Route path="/college-portal/dashboard" element={
            <ProtectedRoute roles={['college']}><CollegePortalDashboard /></ProtectedRoute>
          } />
          <Route path="/college-portal/claim" element={
            <ProtectedRoute roles={['college']}><ClaimCollege /></ProtectedRoute>
          } />
          <Route path="/college-portal/submit-update" element={
            <ProtectedRoute roles={['college']}><SubmitUpdate /></ProtectedRoute>
          } />

          {/* Admin panel */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/colleges" element={
            <ProtectedRoute roles={['admin']}><AdminColleges /></ProtectedRoute>
          } />
          <Route path="/admin/reviews" element={
            <ProtectedRoute roles={['admin']}><AdminReviews /></ProtectedRoute>
          } />
          <Route path="/admin/update-requests" element={
            <ProtectedRoute roles={['admin']}><AdminUpdateRequests /></ProtectedRoute>
          } />
          <Route path="/admin/audit-logs" element={
            <ProtectedRoute roles={['admin']}><AdminAuditLogs /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
