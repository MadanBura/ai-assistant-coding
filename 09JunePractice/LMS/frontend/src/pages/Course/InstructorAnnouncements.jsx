import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import CourseAnnouncements from '../../components/Course/CourseAnnouncements';
import { useAuth } from '../../context/AuthContext';

export default function InstructorAnnouncements() {
  const { courseId } = useParams();
  
  let authUser = null;
  try {
    const auth = useAuth();
    authUser = auth.user;
  } catch (e) {
    // missing in tests
  }

  return (
    <div className="min-vh-100 d-flex animate-fade-in text-start" style={{ backgroundColor: 'var(--bg-neutral)', width: '100%' }}>
      <style>{`
        .main-canvas-premium {
          flex: 1;
          margin-left: 260px; /* Offset for fixed sidebar */
          padding: 40px;
          overflow-y: auto;
          height: 100vh;
        }
      `}</style>

      <Sidebar />

      <main className="main-canvas-premium">
        <div className="container-fluid px-0" style={{ maxWidth: '960px' }}>
          {/* Header */}
          <div className="mb-4">
            <nav className="d-flex align-items-center gap-1 text-secondary small mb-2">
              <Link to="/instructor/courses" className="text-secondary text-decoration-none hover-text-primary">Courses</Link>
              <span className="material-symbols-outlined fs-6">chevron_right</span>
              <span className="text-primary fw-semibold">Announcements</span>
            </nav>
            <h2 className="h4 fw-bold mb-1">Course Announcements</h2>
            <p className="text-secondary mb-0">Post updates, schedules, or news to all learners enrolled in this course.</p>
          </div>

          <CourseAnnouncements courseId={courseId} user={authUser} />
        </div>
      </main>
    </div>
  );
}
