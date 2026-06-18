import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import Sidebar from '../../components/common/Sidebar';
import CourseAnnouncements from '../../components/Course/CourseAnnouncements';
import CourseAssignments from '../../components/Course/CourseAssignments';

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  let auth = null;
  let progress = null;
  try {
    auth = useAuth();
    progress = useProgress();
  } catch (e) {
    // safe fallback
  }

  const { user, isAuthenticated, token } = auth || {};
  const { enrollInCourse, enrolledCourses } = progress || {};

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState(0); // first item open by default
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [selectedTopicIdForAssignment, setSelectedTopicIdForAssignment] = useState(null);

  // Fallback / Mock Data matching Stitch "Mastering WebGL"
  const defaultCourseDetails = {
    id: 'c1',
    title: 'Mastering WebGL & GPU Shaders',
    category: 'Graphics Development',
    description: 'Dive deep into the world of hardware-accelerated 3D graphics. Learn to build performant, immersive web experiences from scratch with the power of the GPU.',
    longDescription: 'WebGL (Web Graphics Library) is a JavaScript API for rendering high-performance interactive 3D and 2D graphics within any compatible web browser without the use of plug-ins. This course is meticulously designed to bridge the gap between creative coding and technical engineering. Throughout this journey, we will explore the low-level architecture of shaders, the mathematics of transformations, and the secrets of high-fidelity lighting and material systems. By the end of this course, you won\'t just be using libraries; you\'ll understand the engine underneath them.',
    instructor: 'Dr. Marcus Thorne',
    rating: 4.9,
    price: 129.00,
    duration: '18.5 Hours',
    lessonsCount: 32,
    modules: [
      {
        id: 'm1',
        title: 'Foundations of Rasterization',
        lessonsCount: 3,
        duration: '2h 15m',
        topics: [
          { id: 't1', title: 'Understanding the Graphics Pipeline', duration: '15:00', type: 'video' },
          { id: 't2', title: 'Setting up your first Canvas context', duration: '28:00', type: 'video' },
          { id: 't3', title: 'Quiz: Context and Buffers', duration: '10:00', type: 'quiz' }
        ]
      },
      {
        id: 'm2',
        title: 'The Language of Shaders: GLSL',
        lessonsCount: 2,
        duration: '3h 45m',
        topics: [
          { id: 't4', title: 'Vertex Shaders and Data Flow', duration: '45:00', type: 'video' },
          { id: 't5', title: 'Fragment Shaders: Painting with Math', duration: '52:00', type: 'video' }
        ]
      }
    ]
  };

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/courses/${courseId}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Merge backend data with default styling structure
            const mergedCourse = {
              ...defaultCourseDetails,
              ...result.data,
              modules: result.data.modules && result.data.modules.length > 0 ? result.data.modules : defaultCourseDetails.modules,
              description: result.data.description || defaultCourseDetails.description,
              title: result.data.title || defaultCourseDetails.title
            };
            setCourse(mergedCourse);

            const firstModule = mergedCourse.modules?.[0];
            const firstTopic = firstModule?.topics?.[0];
            if (firstTopic) {
              setSelectedTopicIdForAssignment(firstTopic.id || firstTopic._id);
            }
          } else {
            setCourse(defaultCourseDetails);
          }
        } else {
          setCourse(defaultCourseDetails);
        }
      } catch (err) {
        console.error('Failed to fetch course details from backend:', err);
        setCourse(defaultCourseDetails);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, token]);

  const enrollment = enrolledCourses?.find(
    (c) =>
      c.course?.id === courseId ||
      c.course?._id === courseId ||
      c.id === courseId ||
      c.courseId === courseId
  );
  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.progressPercent === 100;
  const isExamPassed = enrollment?.finalExamPassed === true;

  const handleEnrollNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsEnrolling(true);
    try {
      if (enrollInCourse) {
        await enrollInCourse(courseId);
      } else {
        const response = await fetch(`/courses/${courseId}/enroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Enrollment failed');
      }
      navigate(`/course/${courseId}/enrollment-success`);
    } catch (err) {
      console.error(err);
      alert('Enrollment failed. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: 'var(--bg-neutral)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Course Details...</span>
        </div>
      </div>
    );
  }

  const currentCourse = course || defaultCourseDetails;

  return (
    <div className="details-shell min-vh-100 d-flex text-start animate-fade-in" style={{ backgroundColor: 'var(--bg-neutral)' }}>
      <style>{`
        .details-shell {
          background-color: var(--bg-neutral);
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
        }
        .details-main {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .hero-banner {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          position: relative;
          color: #ffffff;
          overflow: hidden;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }
        .accordion-header-btn {
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .stat-card {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          background-color: #ffffff;
        }
        .sidebar-sticky {
          position: sticky;
          top: 24px;
        }
      `}</style>

      <Sidebar />

      <main className="details-main">
          {/* Hero Banner Section */}
          <section className="hero-banner py-5">
            <div className="hero-overlay"></div>
            <div className="container px-4">
              <div className="row align-items-center py-4">
                <div className="col-lg-8">
                  <span className="badge-premium badge-premium-primary mb-3">{currentCourse.category || 'Graphics'}</span>
                  <h1 className="display-5 text-white fw-bold mb-3">{currentCourse.title}</h1>
                  <p className="lead text-white text-opacity-80 mb-4" style={{ maxWidth: '700px', fontSize: '1.05rem', lineHeight: '1.6' }}>
                    {currentCourse.description}
                  </p>
                  
                  <div className="d-flex flex-wrap align-items-center gap-4 pt-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center text-white font-bold" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>
                        {currentCourse.instructor?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <small className="d-block text-white text-opacity-60">Instructor</small>
                        <span className="fw-semibold text-white">{currentCourse.instructor || 'Dr. Marcus Thorne'}</span>
                      </div>
                    </div>
                    
                    <div className="vr bg-white bg-opacity-30" style={{ height: '32px' }}></div>
                    
                    <div>
                      {isEnrolled ? (
                        isExamPassed ? (
                          <Link
                            to={`/course/${courseId}/certificate`}
                            className="btn-premium-success px-4 py-2.5 text-decoration-none"
                          >
                            Completed ✓
                          </Link>
                        ) : isCompleted ? (
                          <Link
                            to={`/course/${courseId}/exam/ready`}
                            className="btn-premium-primary px-4 py-2.5 text-decoration-none"
                          >
                            Take Final Exam
                          </Link>
                        ) : (
                          <Link
                            to={`/course/${courseId}`}
                            className="btn-premium-primary px-4 py-2.5 text-decoration-none"
                          >
                            Resume Course
                          </Link>
                        )
                      ) : (
                        <button
                          onClick={handleEnrollNow}
                          disabled={isEnrolling}
                          className="btn-premium-primary px-4 py-2.5"
                        >
                          {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Details & Syllabus Section */}
          <div className="container px-4 py-5">
            <div className="row g-4">
              {/* Syllabus Breakdown */}
              <div className="col-lg-8">
                <h2 className="h4 fw-bold mb-3">Course Overview</h2>
                <p className="text-secondary mb-4" style={{ fontSize: '1rem', lineHeight: '1.7' }}>
                  {currentCourse.longDescription || currentCourse.description}
                </p>

                {/* Benefits */}
                <div className="p-4 rounded-3 bg-white border mb-5">
                  <h3 className="h6 fw-bold mb-3 uppercase tracking-wider text-secondary">Key Course Skills</h3>
                  <div className="row g-3">
                    <div className="col-md-6 d-flex gap-2 align-items-center small">
                      <span className="material-symbols-outlined text-primary fs-5">check_circle</span>
                      <span>Low-level Graphics Architecture & pipelines</span>
                    </div>
                    <div className="col-md-6 d-flex gap-2 align-items-center small">
                      <span className="material-symbols-outlined text-primary fs-5">check_circle</span>
                      <span>Vertex and Fragment shader logic</span>
                    </div>
                    <div className="col-md-6 d-flex gap-2 align-items-center small">
                      <span className="material-symbols-outlined text-primary fs-5">check_circle</span>
                      <span>Transformations & matrices math</span>
                    </div>
                    <div className="col-md-6 d-flex gap-2 align-items-center small">
                      <span className="material-symbols-outlined text-primary fs-5">check_circle</span>
                      <span>Sequential course evaluation checks</span>
                    </div>
                  </div>
                </div>

                {(isEnrolled || user?.role === 'Instructor') && (
                  <CourseAnnouncements courseId={courseId} user={user} token={token} />
                )}

                {(isEnrolled || user?.role === 'Instructor') && selectedTopicIdForAssignment && (
                  <div className="mb-4">
                    <p className="text-secondary small mb-1">Showing assignment for selected topic. Click any topic in the syllabus to change.</p>
                    <CourseAssignments topicId={selectedTopicIdForAssignment} user={user} />
                  </div>
                )}

                {/* Modules syllabus list */}
                <h3 className="h5 fw-bold mb-3">Curriculum Syllabus</h3>
                <div className="d-flex flex-column gap-3 mb-5">
                  {currentCourse.modules && currentCourse.modules.map((mod, idx) => (
                    <div
                      key={mod.id || idx}
                      className="border rounded-3 bg-white overflow-hidden"
                    >
                      <button
                        className="accordion-header-btn p-4 d-flex justify-content-between align-items-center w-100"
                        onClick={() => setActiveAccordion(activeAccordion === idx ? -1 : idx)}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className="rounded-circle bg-light text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <h4 className="h6 fw-bold mb-0 text-dark">{mod.title}</h4>
                            <span className="text-secondary small">{mod.topics?.length || mod.lessonsCount || 0} Topics • {mod.duration || '2 Hours'}</span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-secondary" style={{ transform: activeAccordion === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                          expand_more
                        </span>
                      </button>
                      
                      {activeAccordion === idx && (
                        <div className="border-top p-4 bg-light bg-opacity-50">
                          <div className="d-flex flex-column gap-2">
                            {mod.topics && mod.topics.map((topic, tIdx) => {
                              const tId = topic.id || topic._id;
                              const isSelected = selectedTopicIdForAssignment === tId;
                              return (
                                <div 
                                  key={tId || tIdx} 
                                  className={`d-flex justify-content-between align-items-center p-3 rounded-2 border ${
                                    isSelected ? 'border-primary bg-primary-subtle bg-opacity-10' : 'bg-white'
                                  }`}
                                  onClick={() => {
                                    if (isEnrolled || user?.role === 'Instructor') {
                                      setSelectedTopicIdForAssignment(tId);
                                    }
                                  }}
                                  style={{ cursor: (isEnrolled || user?.role === 'Instructor') ? 'pointer' : 'default' }}
                                >
                                  <div className="d-flex align-items-center gap-2 small">
                                    <span className={`material-symbols-outlined fs-5 ${isSelected ? 'text-primary' : 'text-secondary'}`}>
                                      {topic.type === 'quiz' ? 'quiz' : 'description'}
                                    </span>
                                    <span className={`fw-medium ${isSelected ? 'text-primary fw-bold' : 'text-dark'}`}>{topic.title}</span>
                                  </div>
                                  <span className="text-secondary small" style={{ fontSize: '11px' }}>{topic.type === 'quiz' ? 'Required Assessment' : 'Notes Resource'}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Info Card */}
              <div className="col-lg-4">
                <div className="sidebar-sticky stat-card p-4">
                  <h4 className="h6 fw-bold text-dark mb-4">Course Statistics</h4>
                  <div className="d-flex flex-column gap-3 mb-4">
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                      <div className="d-flex align-items-center gap-2 text-secondary small">
                        <span className="material-symbols-outlined fs-5">menu_book</span>
                        <span>Total Topics</span>
                      </div>
                      <span className="fw-semibold text-dark small">{currentCourse.lessonsCount || 32}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                      <div className="d-flex align-items-center gap-2 text-secondary small">
                        <span className="material-symbols-outlined fs-5">schedule</span>
                        <span>Estimated Effort</span>
                      </div>
                      <span className="fw-semibold text-dark small">{currentCourse.duration || '18.5 Hours'}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                      <div className="d-flex align-items-center gap-2 text-secondary small">
                        <span className="material-symbols-outlined fs-5">infinite</span>
                        <span>Access</span>
                      </div>
                      <span className="fw-semibold text-dark small">Lifetime Access</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2 text-secondary small">
                        <span className="material-symbols-outlined fs-5">workspace_premium</span>
                        <span>Credential</span>
                      </div>
                      <span className="fw-semibold text-dark small">PDF Certificate</span>
                    </div>
                  </div>

                  <div className="border-top pt-3">
                    {isEnrolled ? (
                      isExamPassed ? (
                        <Link
                          to={`/course/${courseId}/certificate`}
                          className="btn-premium-success w-100 py-2.5 text-center text-decoration-none d-block"
                        >
                          Completed ✓
                        </Link>
                      ) : isCompleted ? (
                        <Link
                          to={`/course/${courseId}/exam/ready`}
                          className="btn-premium-primary w-100 py-2.5 text-center text-decoration-none d-block"
                        >
                          Take Final Exam
                        </Link>
                      ) : (
                        <Link
                          to={`/course/${courseId}`}
                          className="btn-premium-primary w-100 py-2.5 text-center text-decoration-none d-block"
                        >
                          Resume Learning
                        </Link>
                      )
                    ) : (
                      <button
                        onClick={handleEnrollNow}
                        disabled={isEnrolling}
                        className="btn-premium-primary w-100 py-2.5"
                      >
                        {isEnrolling ? 'Enrolling...' : 'Enroll in Course'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Footer */}
        <footer className="bg-white border-top py-4 px-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-secondary mt-auto">
          <p className="mb-0">&copy; 2026 EduFlow Learning System. All rights reserved.</p>
          <div className="d-flex gap-3">
            <Link to="/courses" className="text-secondary text-decoration-none hover-text-primary">Catalog</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
