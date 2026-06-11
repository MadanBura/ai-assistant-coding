import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';

// Import Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import LearnerDashboard from './pages/Dashboard/LearnerDashboard';
import InstructorDashboard from './pages/Dashboard/InstructorDashboard';
import CourseCatalog from './pages/Course/CourseCatalog';
import CourseViewer from './pages/Course/CourseViewer';
import CourseCreator from './pages/Course/CourseCreator';
import CourseBuilder from './pages/Course/CourseBuilder';
import QuizInterface from './pages/Course/QuizInterface';
import CourseCompletion from './pages/Course/CourseCompletion';

// Route Guard requiring authentication
function ProtectedRoute({ children, allowedRole = null }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'Instructor' ? '/instructor' : '/dashboard'} replace />;
  }

  return children;
}

// Redirects logged-in users away from Auth pages (Login/Register)
function GuestRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading session...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user.role === 'Instructor' ? '/instructor' : '/dashboard'} replace />;
  }

  return children;
}

function MainRoutes() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Public / Catalog Paths */}
      <Route 
        path="/" 
        element={<CourseCatalog isAuthenticated={isAuthenticated} />} 
      />
      <Route 
        path="/courses" 
        element={<CourseCatalog isAuthenticated={isAuthenticated} />} 
      />

      {/* Guest Authentication Paths */}
      <Route 
        path="/login" 
        element={
          <GuestRoute>
            <Login initialUser={user} />
          </GuestRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        } 
      />

      {/* Learner Dashboard Paths */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRole="Learner">
            <LearnerDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Learner Course Viewer Paths */}
      <Route 
        path="/course/:courseId" 
        element={
          <ProtectedRoute allowedRole="Learner">
            <CourseViewer />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/course/:courseId/topic/:topicId/quiz" 
        element={
          <ProtectedRoute allowedRole="Learner">
            <QuizInterface />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/course/:courseId/completion" 
        element={
          <ProtectedRoute allowedRole="Learner">
            <CourseCompletion />
          </ProtectedRoute>
        } 
      />

      {/* Instructor Dashboard & Creator Paths */}
      <Route 
        path="/instructor" 
        element={
          <ProtectedRoute allowedRole="Instructor">
            <InstructorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/instructor/courses" 
        element={
          <ProtectedRoute allowedRole="Instructor">
            <CourseCreator />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/instructor/courses/:courseId/curriculum" 
        element={
          <ProtectedRoute allowedRole="Instructor">
            <CourseBuilder />
          </ProtectedRoute>
        } 
      />

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <MainRoutes />
      </ProgressProvider>
    </AuthProvider>
  );
}
