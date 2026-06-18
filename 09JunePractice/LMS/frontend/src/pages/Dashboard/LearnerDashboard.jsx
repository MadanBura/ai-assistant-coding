import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import Sidebar from '../../components/common/Sidebar';

export default function LearnerDashboard({ initialData = [], isLoading: propIsLoading = false, error: propError = null }) {
  let progressCtx = null;
  try {
    progressCtx = useProgress();
  } catch (e) {
    // Context missing in tests, safe catch
  }

  const enrolledCourses = (initialData && initialData.length > 0)
    ? initialData
    : (progressCtx?.enrolledCourses || []);
  const isLoading = propIsLoading || (progressCtx ? progressCtx.isLoading : false);
  const error = propError || (progressCtx ? progressCtx.error : null);

  const [downloadingCertId, setDownloadingCertId] = useState(null);

  const getInitials = (title) => {
    if (!title) return '';
    const words = title.split(' ').filter(w => w.trim().length > 0);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  let auth = null;
  try {
    auth = useAuth();
  } catch (e) {
    // Context missing in tests, safe catch
  }

  const user = auth?.user || null;
  const username = user?.name || 'Alex Morgan';

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

  const lastActive = enrolledCourses.find(item => item.progressPercent < 100) || enrolledCourses[0] || null;

  return (
    <div className="dashboard-shell min-vh-100 d-flex text-start animate-fade-in" style={{ backgroundColor: 'var(--bg-neutral)' }}>
      <style>{`
        .dashboard-shell {
          background-color: var(--bg-neutral);
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          width: 100%;
        }
        .main-content {
          flex: 1;
          margin-left: 260px; /* Offset for fixed sidebar */
          padding: 40px;
          min-height: 100vh;
        }
        .weekly-bar {
          width: 100%;
          background-color: rgba(37, 99, 235, 0.15);
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
        }
        .weekly-bar.active {
          background-color: var(--primary);
        }
      `}</style>

      <Sidebar />

      <main className="main-content">
        {/* Dashboard Header */}
        <header className="mb-5 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="h3 fw-bold mb-1">Welcome back, {username}</h1>
            <p className="text-secondary small mb-0">Track your progress and continue your learning paths.</p>
          </div>
          <Link to="/courses" className="btn-premium-secondary py-2 px-3 small" style={{ fontSize: '0.85rem' }}>
            <span className="material-symbols-outlined fs-6 me-1">add_circle</span>
            Enroll in New Course
          </Link>
        </header>

        {/* Dashboard Content */}
        {isLoading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5" data-testid="loading-spinner">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-secondary small">Retrieving your learning progress...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger d-flex align-items-center" role="alert" style={{ borderRadius: 'var(--radius-md)' }}>
            <span className="me-2">⚠️</span>
            <div>{error}</div>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="card-premium-static text-center py-5">
            <span className="material-symbols-outlined text-secondary fs-1 mb-2">menu_book</span>
            <h3 className="h5 fw-bold text-secondary mb-3">No Enrolled Courses</h3>
            <p className="text-secondary small mb-4">
              You are not enrolled in any courses yet. Start your journey by exploring our course catalog.
            </p>
            <Link to="/courses" className="btn-premium-primary px-4 py-2 text-decoration-none">
              Browse Courses
            </Link>
          </div>
        ) : (
            <div className="d-flex flex-column gap-4">
              {/* Hero Grid: Continue Learning + Progress Widget */}
              <div className="row g-4">
                {/* Continue Learning Card */}
                {lastActive && (
                  <div className="col-12 col-xl-8">
                    <div className="card-premium d-flex flex-column flex-md-row gap-4 h-100 align-items-center">
                      <div className="rounded-3 overflow-hidden flex-shrink-0 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center border" style={{ width: '100%', maxWidth: '200px', aspectRatio: '16/9' }}>
                        <span className="text-primary fw-bold" style={{ fontSize: '48px', letterSpacing: '2px' }}>{getInitials(lastActive.course.title)}</span>
                      </div>
                      <div className="flex-grow-1 d-flex flex-column gap-3 text-start w-100">
                        <div>
                          <p className="text-primary fw-bold small uppercase tracking-wider mb-1" style={{ fontSize: '11px' }}>{lastActive.progressPercent === 100 ? 'Completed Course' : 'Current Course'}</p>
                          <h3 className="h5 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                            {lastActive.course.title}
                            {lastActive.finalExamPassed && (
                              <span className="badge bg-success text-white px-2 py-1" style={{ fontSize: '10px' }}>
                                <span className="material-symbols-outlined align-middle" style={{ fontSize: '14px' }}>check_circle</span>
                                COMPLETED
                              </span>
                            )}
                          </h3>
                          <p className="text-secondary small mb-0">{lastActive.finalExamPassed ? 'Congratulations! You have earned your certificate for this course.' : (lastActive.progressPercent === 100 ? 'Take the final exam to earn your certificate.' : 'Complete your sequential modules and quizzes to unlock the final exam.')}</p>
                        </div>
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small text-secondary">Course Progress</span>
                            <span className="small text-primary fw-bold">{lastActive.progressPercent}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-full)' }}>
                            <div className="progress-bar bg-primary" style={{ width: `${lastActive.progressPercent}%`, borderRadius: 'var(--radius-full)' }}></div>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <Link to={`/course/${lastActive.course.id || lastActive.course._id}`} className="btn-premium-primary py-2 px-4 d-flex align-items-center gap-1 text-decoration-none" data-testid={`resume-link-${lastActive.course.id || lastActive.course._id}`}>
                            <span className="material-symbols-outlined fs-5">{lastActive.progressPercent === 100 ? 'menu_book' : 'play_arrow'}</span>
                            <span>{lastActive.progressPercent === 100 ? 'Review Course' : 'Resume'}</span>
                          </Link>
                          {lastActive.progressPercent === 100 && !lastActive.finalExamPassed && (
                            <Link to={`/course/${lastActive.course.id || lastActive.course._id}/exam/ready`} className="btn-premium-primary py-2 px-4 d-flex align-items-center gap-1 text-decoration-none" style={{ backgroundColor: 'var(--primary)' }}>
                              <span className="material-symbols-outlined fs-5">assignment</span>
                              <span>Take Final Exam</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Analytics Widget */}
                <div className="col-12 col-xl-4">
                  <div className="card-premium h-100 d-flex flex-column justify-content-between">
                    <h4 className="small fw-bold text-secondary uppercase tracking-wider mb-3 d-flex justify-content-between align-items-center" style={{ fontSize: '11px' }}>
                      Learning Status
                      <span className="material-symbols-outlined text-primary">analytics</span>
                    </h4>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <div className="bg-light p-3 rounded-3 text-center border">
                          <p className="h3 fw-bold text-primary mb-0">{enrolledCourses.filter(c => c.progressPercent === 100).length}</p>
                          <p className="text-secondary small mb-0" style={{ fontSize: '11px' }}>Completed</p>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="bg-light p-3 rounded-3 text-center border">
                          <p className="h3 fw-bold text-primary mb-0">{enrolledCourses.filter(c => c.progressPercent < 100).length}</p>
                          <p className="text-secondary small mb-0" style={{ fontSize: '11px' }}>In Progress</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="small fw-semibold mb-0" style={{ fontSize: '12px' }}>Weekly Engagement</h5>
                        <span className="small text-primary fw-bold">Active</span>
                      </div>
                      <div className="d-flex align-items-end justify-content-between gap-1" style={{ height: '60px' }}>
                        <div className="weekly-bar" style={{ height: '40%' }}></div>
                        <div className="weekly-bar" style={{ height: '60%' }}></div>
                        <div className="weekly-bar" style={{ height: '30%' }}></div>
                        <div className="weekly-bar active" style={{ height: '90%' }}></div>
                        <div className="weekly-bar active" style={{ height: '75%' }}></div>
                        <div className="weekly-bar active" style={{ height: '85%' }}></div>
                        <div className="weekly-bar" style={{ height: '20%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Courses Grid */}
              <div className="row mt-2 g-4">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h5 fw-bold text-dark mb-0">My Courses</h2>
                    <Link to="/courses" className="text-primary text-decoration-none small fw-semibold">Discover More</Link>
                  </div>

                  <div className="row g-4">
                    {enrolledCourses.map((item) => {
                      const { course, progressPercent, finalExamPassed } = item;
                      const cid = course.id || course._id;
                      return (
                        <div className="col-12 col-md-6 col-lg-4" key={cid}>
                          <div className="card-premium h-100 d-flex flex-column justify-content-between p-3">
                            <div>
                              <div className="rounded-3 overflow-hidden mb-3 bg-light d-flex align-items-center justify-content-center border shadow-sm" style={{ aspectRatio: '16/9' }}>
                                <span className="text-secondary fw-bold" style={{ fontSize: '32px', letterSpacing: '1px' }}>{getInitials(course.title)}</span>
                              </div>
                              <h4 className="h6 fw-bold text-dark mb-2 leading-tight d-flex justify-content-between align-items-start gap-2">
                                <span>{course.title}</span>
                                {finalExamPassed && (
                                  <span className="badge bg-success text-white px-2 py-1 flex-shrink-0" style={{ fontSize: '10px' }}>
                                    <span className="material-symbols-outlined align-middle" style={{ fontSize: '14px' }}>check_circle</span>
                                    COMPLETED
                                  </span>
                                )}
                              </h4>
                              <p className="text-secondary small mb-3">{finalExamPassed ? '100% Complete & Certified' : `${progressPercent}% Complete`}</p>
                              <div className="progress mb-3" style={{ height: '6px', borderRadius: 'var(--radius-full)' }}>
                                <div className="progress-bar bg-primary" style={{ width: `${progressPercent}%`, borderRadius: 'var(--radius-full)' }}></div>
                              </div>
                            </div>
                            <div className="d-flex flex-column gap-2 mt-2">
                              <Link
                                to={`/course/${cid}`}
                                className="btn-premium-secondary py-2 text-decoration-none text-center d-flex align-items-center justify-content-center gap-1"
                                data-testid={`resume-link-${cid}`}
                              >
                                <span className="material-symbols-outlined fs-5">play_arrow</span>
                                <span>{progressPercent === 100 ? 'Review Course' : 'Resume Course'}</span>
                              </Link>

                              {progressPercent === 100 && !finalExamPassed && (
                                <Link
                                  to={`/course/${cid}/exam/ready`}
                                  className="btn-premium-primary py-2 text-decoration-none text-center d-flex align-items-center justify-content-center gap-1"
                                >
                                  <span className="material-symbols-outlined fs-5">assignment</span>
                                  <span>Take Final Exam</span>
                                </Link>
                              )}
                              
                              {finalExamPassed && (
                                <button
                                  type="button"
                                  className="btn-premium-primary py-2 d-flex align-items-center justify-content-center gap-1"
                                  data-testid={`download-cert-btn-${cid}`}
                                  disabled={downloadingCertId === cid}
                                  onClick={() => handleDownloadCertificate(cid, course.title)}
                                >
                                  <span className="material-symbols-outlined fs-5">download</span>
                                  <span>{downloadingCertId === cid ? 'Downloading...' : 'Download Certificate'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Footer */}
        <footer className="border-top bg-white d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-secondary mt-auto py-4 px-4">
          <p className="mb-0">© 2026 EduFlow Learning System. All rights reserved.</p>
          <div className="d-flex gap-3">
            <Link to="/courses" className="text-secondary text-decoration-none hover-text-primary">Catalog</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
