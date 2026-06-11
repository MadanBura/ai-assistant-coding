import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * LearnerDashboard Component
 * Renders the student portal dashboard showing enrolled courses,
 * progression statistics, and certificate download options.
 *
 * @param {Object} props
 * @param {Array} props.initialData - List of enrolled courses for the learner
 * @param {Boolean} props.isLoading - Loading state flag
 * @param {String} props.error - Error message if API request fails
 */
export default function LearnerDashboard({ initialData = [], isLoading = false, error = null }) {
  const [enrolledCourses, setEnrolledCourses] = useState(initialData);
  const [downloadingCertId, setDownloadingCertId] = useState(null);

  // Keep state synced with props changes
  useEffect(() => {
    if (initialData) {
      setEnrolledCourses(initialData);
    }
  }, [initialData]);

  const handleDownloadCertificate = async (courseId, courseTitle) => {
    setDownloadingCertId(courseId);
    try {
      const response = await fetch(`/courses/${courseId}/certificate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Certificate download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${courseTitle || 'course'}-certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingCertId(null);
    }
  };

  // 1. Loading State Screen
  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-5 min-vh-50" data-testid="loading-spinner">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Retrieving your learning progress...</p>
      </div>
    );
  }

  // 2. Error State Screen
  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <span className="me-2">⚠️</span>
          <div>
            <span className="fw-bold">Error:</span> {error}
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty Enrollment State
  if (enrolledCourses.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="card text-center p-5 shadow-sm bg-light border-0">
          <div className="card-body">
            <h3 className="card-title text-secondary h5 mb-3">No Enrolled Courses</h3>
            <p className="card-text text-muted mb-4">
              You are not enrolled in any courses yet. Start your journey by exploring our course catalog.
            </p>
            <Link to="/courses" className="btn btn-primary px-4 py-2">
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="learner-dashboard-wrapper" className="container py-4">
      {/* Dashboard Section Title */}
      <header className="mb-4">
        <h2 className="h3 text-dark fw-bold mb-1">My Courses</h2>
        <p className="text-muted small">Track your learning goals and progression</p>
      </header>

      {/* Course Cards Grid */}
      <div className="row g-4">
        {enrolledCourses.map((item) => {
          const { course, progressPercent, finalExamPassed } = item;
          const isDownloading = downloadingCertId === course.id;

          return (
            <div className="col-12 col-md-6 col-lg-4" key={course.id}>
              <div className="card h-100 shadow-sm border-0 bg-white card-hover-elevation">
                <div className="card-body d-flex flex-column justify-content-between p-4">
                  <div>
                    <span className="badge bg-primary-subtle text-primary mb-2">
                      {course.category || 'Curriculum'}
                    </span>
                    <h3 className="h5 card-title text-dark fw-bold mb-3">
                      {course.title}
                    </h3>
                  </div>

                  <div className="mt-3">
                    {/* Progress Percentage & Bar */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted fw-semibold">Progress</span>
                      <span className="small text-primary fw-bold">{progressPercent}% Complete</span>
                    </div>
                    <div className="progress mb-4" style={{ height: '6px' }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${progressPercent}%` }}
                        aria-valuenow={progressPercent}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>

                    {/* Action Links & Buttons */}
                    <div className="d-flex flex-column gap-2 mt-2">
                      <Link
                        to={`/course/${course.id}`}
                        data-testid={`resume-link-${course.id}`}
                        className="btn btn-outline-primary w-100 fw-semibold"
                      >
                        Resume Learning
                      </Link>

                      {finalExamPassed && (
                        <button
                          data-testid={`download-cert-btn-${course.id}`}
                          className="btn btn-success w-100 fw-semibold"
                          onClick={() => handleDownloadCertificate(course.id, course.title)}
                          disabled={isDownloading}
                        >
                          {isDownloading ? 'Downloading...' : 'Download Certificate'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
