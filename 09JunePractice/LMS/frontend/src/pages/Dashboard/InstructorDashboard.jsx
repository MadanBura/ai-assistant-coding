import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * InstructorDashboard Component
 * Renders the instructor portal dashboard displaying owned courses lists
 * and their respective statistics & analytics.
 *
 * @param {Object} props
 * @param {Array} props.initialCourses - List of courses owned by the instructor
 */
export default function InstructorDashboard({ initialCourses = [] }) {
  const [courses] = useState(initialCourses);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async (courseId) => {
    setIsLoading(true);
    setError(null);
    setAnalyticsData(null);
    try {
      // API call to the course analytics endpoint
      const response = await fetch(`/courses/${courseId}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Analytics load failed');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setAnalyticsData(result.data);
      } else {
        throw new Error(result.message || 'Analytics load failed');
      }
    } catch (err) {
      setError(err.message || 'Analytics load failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAnalytics = (courseId) => {
    setActiveCourseId(courseId);
    fetchAnalytics(courseId);
  };

  const handleCloseAnalytics = () => {
    setActiveCourseId(null);
    setAnalyticsData(null);
    setError(null);
  };

  const handleRefreshAnalytics = () => {
    if (activeCourseId) {
      fetchAnalytics(activeCourseId);
    }
  };

  const activeCourse = courses.find((c) => c.id === activeCourseId);

  return (
    <div data-testid="instructor-dashboard-wrapper" className="container py-4">
      <header className="mb-4">
        <h1 className="h2 text-primary fw-bold">Instructor Dashboard</h1>
      </header>

      {courses.length === 0 ? (
        <div className="card text-center p-5 shadow-sm bg-light border-0">
          <div className="card-body">
            <h3 className="card-title text-secondary h5 mb-3">No Courses Found</h3>
            <p className="card-text text-muted mb-4">
              You have not created any courses yet. Start your instructor journey by creating your first course.
            </p>
            <Link to="/course/create" className="btn btn-primary px-4 py-2">
              Create a Course
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4 mb-5">
          {courses.map((course) => (
            <div className="col-12 col-md-6 col-lg-4" key={course.id}>
              <div className="card h-100 shadow-sm border-0 bg-white">
                <div className="card-body d-flex flex-column justify-content-between p-4">
                  <div>
                    <span className="badge bg-secondary-subtle text-secondary mb-2">
                      {course.category || 'Course'}
                    </span>
                    <h2 className="h5 card-title text-dark fw-semibold mb-3">
                      {course.title}
                    </h2>
                  </div>
                  <div className="mt-3">
                    <button
                      className={`btn w-100 ${
                        activeCourseId === course.id ? 'btn-secondary' : 'btn-outline-primary'
                      }`}
                      onClick={() => handleViewAnalytics(course.id)}
                    >
                      View Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Panel */}
      {activeCourseId && (
        <div className="card shadow border-0 bg-white p-4 mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
              <div>
                <h2 className="h4 text-dark fw-bold mb-1">
                  Course Analytics: {activeCourse?.title}
                </h2>
                <p className="text-muted small mb-0">Performance and enrollment insights</p>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleRefreshAnalytics}
                  disabled={isLoading}
                >
                  Refresh
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleCloseAnalytics}
                >
                  Close
                </button>
              </div>
            </div>

            {isLoading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading analytics...</p>
              </div>
            )}

            {error && (
              <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                <span className="me-2">⚠️</span>
                <div>{error}</div>
              </div>
            )}

            {analyticsData && !isLoading && !error && (
              <div>
                {/* Stats Grid */}
                <div className="row g-4 mb-4">
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="card border-0 bg-primary-subtle text-primary-emphasis p-4 h-100">
                      <p className="small text-uppercase tracking-wider mb-2 fw-medium">Total Enrolled</p>
                      <h3 className="h5 fw-bold mb-0">Total Enrolled: {analyticsData.totalEnrolled}</h3>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="card border-0 bg-success-subtle text-success-emphasis p-4 h-100">
                      <p className="small text-uppercase tracking-wider mb-2 fw-medium">Completion Rate</p>
                      <h3 className="h5 fw-bold mb-0">Completion Rate: {analyticsData.completionRate}%</h3>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="card border-0 bg-warning-subtle text-warning-emphasis p-4 h-100">
                      <p className="small text-uppercase tracking-wider mb-2 fw-medium">Avg Quiz Score</p>
                      <h3 className="h5 fw-bold mb-0">Average Quiz Score: {analyticsData.averageQuizScore}%</h3>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="card border-0 bg-info-subtle text-info-emphasis p-4 h-100">
                      <p className="small text-uppercase tracking-wider mb-2 fw-medium">Avg Final Exam</p>
                      <h3 className="h5 fw-bold mb-0">Average Final Exam Score: {analyticsData.averageFinalExamScore}%</h3>
                    </div>
                  </div>
                </div>

                {/* Enrolled Learners Table */}
                <div className="border rounded bg-light p-3">
                  <h3 className="h5 text-dark mb-3">Enrolled Student Details</h3>
                  {analyticsData.learners && analyticsData.learners.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover table-striped mb-0 bg-white align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th className="text-center">Progress</th>
                            <th>Completion Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.learners.map((learner) => (
                            <tr key={learner.id}>
                              <td className="fw-semibold">{learner.name}</td>
                              <td>{learner.email}</td>
                              <td className="text-center">
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                  <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '100px' }}>
                                    <div
                                      className="progress-bar bg-success"
                                      role="progressbar"
                                      style={{ width: `${learner.progressPercent}%` }}
                                      aria-valuenow={learner.progressPercent}
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                    ></div>
                                  </div>
                                  <span className="small">{learner.progressPercent}%</span>
                                </div>
                              </td>
                              <td className="text-muted small">
                                {learner.completedAt
                                  ? new Date(learner.completedAt).toLocaleDateString()
                                  : 'In Progress'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted mb-0 py-3 text-center">No students currently enrolled in this course.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
