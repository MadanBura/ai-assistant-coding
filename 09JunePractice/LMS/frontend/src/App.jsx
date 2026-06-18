import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { ProgressProvider } from "./context/ProgressContext";

// Import Pages - Learner Flow
import PublicLandingPage from "./pages/Course/PublicLandingPage";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import LearnerDashboard from "./pages/Dashboard/LearnerDashboard";
import CourseCatalog from "./pages/Course/CourseCatalog";
import CourseDetails from "./pages/Course/CourseDetails";
import EnrollmentSuccessful from "./pages/Course/EnrollmentSuccessful";
import CourseViewer from "./pages/Course/CourseViewer";
import QuizInterface from "./pages/Course/QuizInterface";
import AssessmentResults from "./pages/Course/AssessmentResults";
import TopicCompletion from "./pages/Course/TopicCompletion";
import FinalExamReady from "./pages/Course/FinalExamReady";
import FinalExam from "./pages/Course/FinalExam";
import CourseCompletion from "./pages/Course/CourseCompletion";
import CourseCertificate from "./pages/Course/CourseCertificate";
import Profile from "./pages/Auth/Profile";

// Import Pages - Instructor Flow
import InstructorDashboard from "./pages/Dashboard/InstructorDashboard";
import CourseManagement from "./pages/Course/CourseManagement";
import CourseCreator from "./pages/Course/CourseCreator";
import CourseBuilder from "./pages/Course/CourseBuilder";
import CreateModuleTopic from "./pages/Course/CreateModuleTopic";
import ResourceManagement from "./pages/Course/ResourceManagement";
import AssessmentBuilder from "./pages/Course/AssessmentBuilder";
import CurriculumReorder from "./pages/Course/CurriculumReorder";
import ModuleManagement from "./pages/Course/ModuleManagement";
import GlobalModuleManagement from "./pages/Course/GlobalModuleManagement";
import CourseAnalytics from "./pages/Course/CourseAnalytics";
import InstructorSettings from "./pages/Auth/InstructorSettings";
import InstructorBadgeManagement from "./pages/Course/InstructorBadgeManagement";
import InstructorAnnouncements from "./pages/Course/InstructorAnnouncements";

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
    return (
      <Navigate
        to={user.role === "Instructor" ? "/instructor" : "/dashboard"}
        replace
      />
    );
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
    return (
      <Navigate
        to={user.role === "Instructor" ? "/instructor" : "/dashboard"}
        replace
      />
    );
  }

  return children;
}

function MainRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public / Catalog Paths */}
      <Route
        path="/"
        element={<PublicLandingPage isAuthenticated={isAuthenticated} />}
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

      {/* Instructor Guest Authentication Path */}
      <Route
        path="/instructor/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      {/* Learner Protected Paths */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="Learner">
            <LearnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRole="Learner">
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course/:courseId/details"
        element={
          <ProtectedRoute allowedRole="Learner">
            <CourseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course/:courseId/enrollment-success"
        element={
          <ProtectedRoute allowedRole="Learner">
            <EnrollmentSuccessful />
          </ProtectedRoute>
        }
      />
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
        path="/course/:courseId/topic/:topicId/quiz/results"
        element={
          <ProtectedRoute allowedRole="Learner">
            <AssessmentResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course/:courseId/topic/:topicId/completed"
        element={
          <ProtectedRoute allowedRole="Learner">
            <TopicCompletion />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course/:courseId/exam/ready"
        element={
          <ProtectedRoute allowedRole="Learner">
            <FinalExamReady />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course/:courseId/exam"
        element={
          <ProtectedRoute allowedRole="Learner">
            <FinalExam />
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
      <Route
        path="/course/:courseId/certificate"
        element={
          <ProtectedRoute allowedRole="Learner">
            <CourseCertificate />
          </ProtectedRoute>
        }
      />

      {/* Instructor Protected Paths */}
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
            <CourseManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course/create"
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
      <Route
        path="/instructor/courses/:courseId/curriculum/add"
        element={
          <ProtectedRoute allowedRole="Instructor">
            <CreateModuleTopic />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/announcements"
        element={
          <ProtectedRoute allowedRole="Instructor">
            <InstructorAnnouncements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/curriculum/reorder"
        element={
          <ProtectedRoute allowedRole="Instructor">
            <CurriculumReorder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/modules/manage"
        element={
          <ProtectedRoute allowedRole="Instructor">
            <ModuleManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/modules/global"
        element={
          <ProtectedRoute allowedRole="Instructor">
            <GlobalModuleManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/topics/:topicId/resources"
        element={
          <ProtectedRoute allowedRole="Instructor">
            <ResourceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/assessment"
        element={
          <ProtectedRoute allowedRole="Instructor">
            <AssessmentBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/analytics"
        element={
          <ProtectedRoute allowedRole="Instructor">
            <CourseAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/settings"
        element={
          <ProtectedRoute allowedRole="Instructor">
            <InstructorSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/gamification/badges"
        element={
          <ProtectedRoute allowedRole="Instructor">
            <InstructorBadgeManagement />
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
