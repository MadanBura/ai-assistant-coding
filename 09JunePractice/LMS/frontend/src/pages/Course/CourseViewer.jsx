import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import CourseAnnouncements from '../../components/Course/CourseAnnouncements';
import CourseAssignments from '../../components/Course/CourseAssignments';
import CourseDoubts from '../../components/Course/CourseDoubts';
import QuizFeedbackPanel from '../../components/Course/QuizFeedbackPanel';

/**
 * Helper Sub-component: QuizBoard
 */
function QuizBoard({ assessment, onResult, topicId, isCompleted }) {
  let progressCtx = null;
  try {
    progressCtx = useProgress();
  } catch (e) {
    // Context missing in tests
  }
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState('idle'); // idle, submitting, passed, failed
  const [errorMessage, setErrorMessage] = useState('');
  const [showForm, setShowForm] = useState(!isCompleted);

  useEffect(() => {
    setShowForm(!isCompleted);
    setStatus('idle');
    setAnswers({});
  }, [isCompleted, topicId]);

  const handleSelectOption = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    // Convert answers object into array of { questionId, selectedOptionIndex }
    const formattedAnswers = Object.entries(answers).map(([qId, val]) => {
      const question = assessment.questions.find((q) => q.id === qId || q._id === qId);
      const selectedOptionIndex = question ? question.options.indexOf(val) : -1;
      return {
        questionId: qId,
        selectedOptionIndex,
      };
    });

    try {
      const response = await fetch(`/topics/${topicId}/assessment/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (!response.ok) {
        throw new Error('Quiz submission failed');
      }

      const result = await response.json();
      if (result.success) {
        if (result.passed) {
          setStatus('passed');
          onResult(true, result.progressPercent, assessment.id || assessment._id);
          if (progressCtx) {
            progressCtx.refreshEnrolledCourses();
          }
        } else {
          setStatus('failed');
          onResult(false);
        }
      } else {
        throw new Error(result.message || 'Quiz evaluation failed');
      }
    } catch (err) {
      setStatus('failed');
      setErrorMessage(err.message || 'Quiz submission failed');
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setStatus('idle');
    setErrorMessage('');
  };

  if (!showForm) {
    return (
      <div className="alert alert-success text-center p-4 my-4 border-0 shadow-sm text-start" role="alert" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="fs-1 mb-2">🎉</div>
        <h4 className="alert-heading fw-bold text-success">Assessment Completed</h4>
        <p className="mb-3 small">You have already completed and passed this topic's assessment quiz.</p>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn-premium-secondary py-2 px-4"
            onClick={() => setShowForm(true)}
          >
            Review Questions
          </button>
          <button
            type="button"
            className="btn-premium-primary py-2 px-4"
            onClick={() => onResult('continue')}
          >
            Next Topic
          </button>
        </div>
      </div>
    );
  }

  if (status === 'passed') {
    return (
      <div className="alert alert-success text-center p-4 my-4 border-0 shadow-sm text-start" role="alert" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="fs-1 mb-2">🎉</div>
        <h4 className="alert-heading fw-bold text-success">Passed!</h4>
        <p className="mb-3 small">Congratulations! You have successfully passed the quiz assessment for this topic.</p>
        <button
          type="button"
          className="btn-premium-primary py-2 px-4"
          onClick={() => onResult('continue')}
        >
          Continue to Next Topic
        </button>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="alert alert-danger text-center p-4 my-4 border-0 shadow-sm text-start" role="alert" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="fs-1 mb-2">❌</div>
        <h4 className="alert-heading fw-bold text-danger">Failed</h4>
        <p className="mb-3 small">{errorMessage || 'You did not pass the assessment. Review the material and try again.'}</p>
        <button type="button" className="btn-premium-secondary py-2 px-4" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-premium p-4 mb-4 text-start">
      <h3 className="h6 fw-bold mb-4 d-flex align-items-center text-dark">
        <span className="material-symbols-outlined text-primary me-2">quiz</span>
        Topic Assessment
      </h3>
      {assessment.questions.map((q) => {
        const questionId = q.id || q._id;
        return (
          <div key={questionId} className="mb-4">
            <p className="fw-semibold text-dark mb-3 small">{q.questionText}</p>
            {q.options.map((option, idx) => {
              const optionId = `q-${questionId}-opt-${idx}`;
              const isSelected = answers[questionId] === option;
              return (
                <div
                  key={idx}
                  className={`form-check p-3 mb-2 rounded-3 border transition-all cursor-pointer ${
                    isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle bg-light hover-bg'
                  }`}
                  onClick={() => handleSelectOption(questionId, option)}
                  style={{ position: 'relative', paddingLeft: '2.5rem' }}
                >
                  <input
                    type="radio"
                    className="form-check-input"
                    name={`q-${questionId}`}
                    id={optionId}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleSelectOption(questionId, option)}
                    required
                    style={{ position: 'absolute', left: '1.25rem', top: '1.25rem', cursor: 'pointer' }}
                  />
                  <label
                    className="form-check-label text-dark fw-medium w-100 cursor-pointer small"
                    htmlFor={optionId}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {option}
                  </label>
                </div>
              );
            })}
          </div>
        );
      })}
      <button
        type="submit"
        className="btn-premium-primary w-100 mt-2"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </form>
  );
}

/**
 * CourseViewer Main Component
 */
export default function CourseViewer({
  course: propCourse = null,
  progress: propProgress = null,
  activeTopicId: propActiveTopicId,
  activeView: propActiveView = '',
}) {
  const { courseId } = useParams();

  let progressCtx = null;
  try {
    progressCtx = useProgress();
  } catch (e) {
    // Context missing in tests
  }

  let authUser = null;
  try {
    const auth = useAuth();
    authUser = auth.user;
  } catch (e) {
    // Context missing in tests
  }
  const username = authUser?.name || 'U';
  
  // State variables
  const [course, setCourse] = useState(propCourse);
  const [localProgress, setLocalProgress] = useState({
    progressPercent: 0,
    completedTopics: [],
    completedQuizzes: [],
    finalExamPassed: false,
    ...propProgress,
  });

  const [currentActiveTopicId, setCurrentActiveTopicId] = useState(propActiveTopicId);
  const [currentView, setCurrentView] = useState(propActiveView);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');
  const [submittingExam, setSubmittingExam] = useState(false);
  const [examStatus, setExamStatus] = useState('');
  const [examAnswers, setExamAnswers] = useState({});
  const [activeTab, setActiveTab] = useState('notes'); // notes, documents, references
  const [personalNotes, setPersonalNotes] = useState('');
  const [notesList, setNotesList] = useState([]);

  // Fetch course details and user progress if not supplied as props
  useEffect(() => {
    if (propCourse) {
      setCourse(propCourse);
    } else if (courseId) {
      const fetchCourseData = async () => {
        try {
          const headers = {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          };
          const res = await fetch(`/courses/${courseId}`, { headers });
          if (res.ok) {
            const result = await res.json();
            if (result.success && result.data) {
              setCourse(result.data);
            }
          }
        } catch (err) {
          console.error('Failed to fetch course details:', err);
        }
      };
      fetchCourseData();
    }
  }, [propCourse, courseId]);

  useEffect(() => {
    if (propProgress) {
      setLocalProgress({
        progressPercent: 0,
        completedTopics: [],
        completedQuizzes: [],
        finalExamPassed: false,
        ...propProgress,
      });
    } else if (courseId) {
      const fetchProgressData = async () => {
        try {
          const headers = {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          };
          const res = await fetch(`/courses/${courseId}/progress`, { headers });
          if (res.ok) {
            const result = await res.json();
            if (result.success && result.data) {
              setLocalProgress((prev) => ({
                ...prev,
                ...result.data,
              }));
            }
          }
        } catch (err) {
          console.error('Failed to fetch course progress:', err);
        }
      };
      fetchProgressData();
    }
  }, [propProgress, courseId]);

  useEffect(() => {
    if (propActiveTopicId) {
      setCurrentActiveTopicId(propActiveTopicId);
      setCurrentView('');
    }
  }, [propActiveTopicId]);

  useEffect(() => {
    if (propActiveView) {
      setCurrentView(propActiveView);
    }
  }, [propActiveView]);

  if (!course) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: 'var(--bg-neutral)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading course player...</span>
        </div>
      </div>
    );
  }

  // Flatten topics sequentially across all modules
  const allTopics =
    course.modules
      ?.slice()
      ?.sort((a, b) => (a.sequenceIndex ?? 0) - (b.sequenceIndex ?? 0))
      ?.flatMap(
        (m) =>
          m.topics
            ?.slice()
            ?.sort((a, b) => (a.sequenceIndex ?? 0) - (b.sequenceIndex ?? 0)) || []
      ) || [];

  // Determine active topic
  const activeTopic =
    allTopics.find((t) => t.id === currentActiveTopicId || t._id === currentActiveTopicId) || allTopics[0];

  const activeTopicIndex = allTopics.findIndex((t) => (t.id || t._id) === (activeTopic?.id || activeTopic?._id));

  // Sequential lock logic
  const isTopicLocked = (topicId) => {
    const idx = allTopics.findIndex((t) => (t.id || t._id) === topicId);
    if (idx <= 0) return false; // First topic is always unlocked
    // Unlocked if previous topic is completed
    const prevTopic = allTopics[idx - 1];
    return !(localProgress.completedTopics || []).includes(prevTopic.id || prevTopic._id);
  };

  const handleTopicClick = (topicId) => {
    if (!isTopicLocked(topicId)) {
      setCurrentActiveTopicId(topicId);
      setCurrentView('');
      setExamStatus('');
    }
  };

  const handleMarkComplete = async () => {
    if (!activeTopic) return;
    const activeId = activeTopic.id || activeTopic._id;
    try {
      const response = await fetch(`/topics/${activeId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Mark complete failed');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setLocalProgress((prev) => {
          const currentList = prev.completedTopics || [];
          const updatedList = currentList.includes(activeId)
            ? currentList
            : [...currentList, activeId];
          return {
            ...prev,
            progressPercent: result.data.progressPercent ?? prev.progressPercent,
            completedTopics: result.data.completedTopics || updatedList,
          };
        });
        if (progressCtx) {
          progressCtx.refreshEnrolledCourses();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuizResult = (passed, progressPercent, quizId) => {
    if (passed === 'continue') {
      if (activeTopicIndex < allTopics.length - 1) {
        const nextTopic = allTopics[activeTopicIndex + 1];
        handleTopicClick(nextTopic.id || nextTopic._id);
      } else {
        setCurrentView('final-exam');
      }
    } else if (passed) {
      setLocalProgress((prev) => {
        const updatedQuizzes = prev.completedQuizzes.includes(quizId)
          ? prev.completedQuizzes
          : [...prev.completedQuizzes, quizId];
        return {
          ...prev,
          progressPercent: progressPercent ?? prev.progressPercent,
          completedQuizzes: updatedQuizzes,
        };
      });
    }
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    setSubmittingExam(true);
    setExamStatus('');

    // Format final exam answers as array of { questionId, selectedOptionIndex }
    const formattedAnswers = Object.entries(examAnswers).map(([qId, val]) => {
      const question = course.finalExam.questions.find((q) => q.id === qId || q._id === qId);
      const selectedOptionIndex = question ? question.options.indexOf(val) : -1;
      return {
        questionId: qId,
        selectedOptionIndex,
      };
    });

    try {
      const response = await fetch(`/courses/${course.id || course._id}/final-exam/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (!response.ok) {
        const errResult = await response.json().catch(() => ({}));
        throw new Error(errResult.message || 'Exam submission failed');
      }

      const result = await response.json();
      if (result.success) {
        if (result.passed) {
          setLocalProgress((prev) => ({
            ...prev,
            finalExamPassed: true,
            progressPercent: result.progressPercent ?? prev.progressPercent,
          }));
          setExamStatus('passed');
          if (progressCtx) {
            progressCtx.refreshEnrolledCourses();
          }
        } else {
          setExamStatus('failed');
        }
      } else {
        throw new Error(result.message || 'Exam assessment failed');
      }
    } catch (err) {
      setExamStatus('failed');
    } finally {
      setSubmittingExam(false);
    }
  };

  const handleDownloadCertificate = async () => {
    setIsDownloading(true);
    setDownloadMsg('Generating...');
    try {
      const response = await fetch(`/courses/${course.id || course._id}/certificate`, {
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
      a.download = `${course.title || 'course'}-certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
      setDownloadMsg('');
    }
  };

  const handleAddPersonalNote = () => {
    if (!personalNotes.trim()) return;
    setNotesList((prev) => [...prev, { text: personalNotes, timestamp: new Date().toLocaleTimeString() }]);
    setPersonalNotes('');
  };

  const isCurrentTopicLocked = activeTopic && isTopicLocked(activeTopic.id || activeTopic._id);

  // Sorting modules by sequenceIndex
  const sortedModules = course.modules
    ? course.modules.slice().sort((a, b) => (a.sequenceIndex ?? 0) - (b.sequenceIndex ?? 0))
    : [];

  return (
    <div className="viewer-shell min-vh-100 d-flex flex-column h-screen overflow-hidden text-start">
      <style>{`
        .viewer-shell {
          background-color: var(--bg-neutral);
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
        }
        .viewer-header {
          height: 64px;
          background-color: #ffffff;
          border-bottom: 1px solid var(--border-color);
          z-index: 50;
        }
        .viewer-layout {
          height: calc(100vh - 64px);
        }
        .sidebar-dark {
          width: 300px;
          background-color: #0f172a;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        .sidebar-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .sidebar-nav {
          flex: 1;
          padding: 16px 0;
        }
        .module-title {
          padding: 12px 24px 6px;
          font-size: 0.725rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }
        .topic-row {
          display: flex;
          align-items: center;
          padding: 12px 24px;
          color: #cbd5e1;
          text-decoration: none;
          transition: var(--transition-fast);
          border-left: 4px solid transparent;
          cursor: pointer;
        }
        .topic-row:hover {
          background-color: rgba(255, 255, 255, 0.04);
          color: #ffffff;
        }
        .topic-row.active {
          background-color: rgba(37, 99, 235, 0.12);
          color: #3b82f6;
          border-left-color: var(--primary);
          font-weight: 600;
        }
        .topic-row.locked {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .topic-row.locked:hover {
          background-color: transparent;
          color: #cbd5e1;
        }
        .main-canvas {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto;
          background-color: var(--bg-neutral);
        }
        .video-box {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 */
          background-color: #000000;
        }
        .video-box iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        .tab-btn {
          background: none;
          border: none;
          padding: 12px 0;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          transition: var(--transition-fast);
        }
        .tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .notes-content {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--text-secondary);
        }
        .notes-content h1, .notes-content h2, .notes-content h3 {
          color: var(--text-primary);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 700;
        }
        .notes-content p {
          margin-bottom: 1.25rem;
        }
        .viewer-footer {
          height: 72px;
          background-color: #ffffff;
          border-top: 1px solid var(--border-color);
          z-index: 40;
        }
        .progress-bar-thin {
          height: 6px;
          background-color: var(--border-light);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background-color: var(--primary);
          transition: width 0.3s ease;
          border-radius: var(--radius-full);
        }
        .lock-card {
          max-width: 480px;
          margin: 80px auto;
          text-align: center;
        }
        .hover-bg:hover {
          background-color: rgba(37, 99, 235, 0.04) !important;
          border-color: rgba(37, 99, 235, 0.15) !important;
        }
      `}</style>

      {/* Top Navbar */}
      <header className="viewer-header px-4 d-flex align-items-center justify-content-between flex-shrink-0">
        <div className="d-flex align-items-center gap-3">
          <Link to="/dashboard" className="text-decoration-none d-flex align-items-center text-dark gap-2">
            <span className="material-symbols-outlined fs-5 text-primary">arrow_back</span>
            <span className="fw-bold h5 mb-0 text-primary" style={{ fontSize: '1rem' }}>EduFlow player</span>
          </Link>
        </div>
        <div className="d-flex align-items-center gap-4">
          <div className="d-none d-md-flex align-items-center gap-4">
            <Link to="/courses" className="text-secondary text-decoration-none text-sm fw-medium hover-text-primary">Catalog</Link>
            <Link to="/dashboard" className="text-primary text-decoration-none text-sm fw-semibold">My Learning</Link>
          </div>
          <div className="rounded-circle overflow-hidden border" style={{ width: '32px', height: '32px' }}>
            <div className="bg-primary text-white w-100 h-100 d-flex align-items-center justify-content-center fw-bold small">
              {username?.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Content Layout */}
      <div className="viewer-layout d-flex flex-row flex-grow-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="sidebar-dark flex-shrink-0">
          <div className="sidebar-header">
            <h3 className="h6 fw-bold text-white mb-2 text-truncate" title={course.title}>
              {course.title}
            </h3>
            <p className="text-secondary small mb-0 font-label-sm" style={{ color: '#94a3b8', fontSize: '11px' }}>
              {localProgress.progressPercent}% Complete
            </p>
          </div>

          <nav className="sidebar-nav">
            {sortedModules.map((m) => {
              const sortedTopics = m.topics
                ? m.topics.slice().sort((a, b) => (a.sequenceIndex ?? 0) - (b.sequenceIndex ?? 0))
                : [];
              return (
                <div key={m.id || m._id} className="mb-4">
                  <div className="module-title text-slate-400" title={m.title}>
                    {m.title}
                  </div>
                  <ul className="list-unstyled p-0 m-0">
                    {sortedTopics.map((t) => {
                      const tId = t.id || t._id;
                      const locked = isTopicLocked(tId);
                      const active = currentActiveTopicId === tId && !currentView;
                      const completed = (localProgress.completedTopics || []).includes(tId);

                      return (
                        <li
                          key={tId}
                          data-testid={`sidebar-item-${tId}`}
                          className={`topic-row ${active ? 'active' : ''} ${locked ? 'locked' : ''}`}
                          onClick={() => handleTopicClick(tId)}
                        >
                          {locked ? (
                            <span data-testid={`lock-icon-${tId}`} className="material-symbols-outlined me-3 fs-5">
                              lock
                            </span>
                          ) : completed ? (
                            <span className="material-symbols-outlined text-success me-3 fs-5" style={{ fontVariationSettings: "'FILL' 1" }}>
                              check_circle
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-secondary me-3 fs-5">
                              play_circle
                            </span>
                          )}
                          <div className="flex-grow-1 min-w-0">
                            <p className="mb-0 text-sm text-truncate text-white" style={{ fontSize: '13px' }}>{t.title}</p>
                            <span className="text-secondary" style={{ fontSize: '11px', color: '#64748b' }}>
                              {t.assessment ? 'Quiz Assessment' : 'Lesson Notes'}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {course.finalExam && (
              <div className="mt-4 border-top border-secondary border-opacity-20 pt-3">
                <div
                  data-testid="sidebar-item-final-exam"
                  className={`topic-row ${currentView === 'final-exam' ? 'active' : ''}`}
                  onClick={() => setCurrentView('final-exam')}
                >
                  <span className="material-symbols-outlined text-primary me-3 fs-5">
                    assignment
                  </span>
                  <div>
                    <p className="mb-0 text-sm text-white font-bold" style={{ fontSize: '13px' }}>Final Exam</p>
                    <span className="text-secondary" style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Certification Gate
                    </span>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Workspace */}
        <main className="main-canvas flex-grow-1 overflow-auto">
          {currentView === 'final-exam' ? (
            /* ================= FINAL EXAM CANVAS ================= */
            <div className="p-4 p-md-5">
              {localProgress.progressPercent < 100 ? (
                <div className="lock-card bg-white p-5 rounded-4 shadow-sm border text-center">
                  <span className="material-symbols-outlined text-danger display-4 mb-3">lock</span>
                  <h4 className="fw-bold text-dark mb-2">Final Exam is Locked</h4>
                  <p className="text-secondary mb-0">
                    You must complete all topics in the curriculum to unlock the final exam.
                  </p>
                </div>
              ) : localProgress.finalExamPassed ? (
                <div className="card-premium text-center p-5 mx-auto" style={{ maxWidth: '600px' }}>
                  <div className="display-4 text-success mb-3">🏆</div>
                  <h3 className="fw-bold text-dark mb-2">Congratulations!</h3>
                  <p className="text-secondary mb-4">
                    You have passed the final exam and successfully completed the course.
                  </p>
                  <div className="d-flex justify-content-center">
                    <button
                      className="btn-premium-primary d-flex align-items-center gap-2"
                      onClick={handleDownloadCertificate}
                      disabled={isDownloading}
                    >
                      <span className="material-symbols-outlined fs-5">download</span>
                      {isDownloading ? (downloadMsg || 'Generating...') : 'Download Certificate'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card-premium p-4 p-md-5 mx-auto" style={{ maxWidth: '800px' }}>
                  <h3 className="h5 fw-bold text-dark mb-4 d-flex align-items-center">
                    <span className="material-symbols-outlined text-primary me-2">assignment</span>
                    Course Final Exam
                  </h3>

                  {examStatus === 'failed' && (
                    <div className="alert alert-danger rounded-3 p-3 mb-4 border-0 text-center">
                      <p className="fw-semibold text-danger-emphasis mb-0">
                        You did not pass the exam. Please review the material and try again.
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleExamSubmit}>
                    {course.finalExam?.questions?.map((q) => {
                      const qId = q.id || q._id;
                      return (
                        <div key={qId} className="mb-4 pb-4 border-bottom">
                          <p className="fw-semibold text-dark mb-3 small">{q.questionText}</p>
                          {q.options.map((option, idx) => {
                            const optionId = `exam-q-${qId}-opt-${idx}`;
                            const isSelected = examAnswers[qId] === option;
                            return (
                              <div
                                key={idx}
                                className={`form-check p-3 mb-2 rounded-3 border transition-all cursor-pointer ${
                                  isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle bg-light hover-bg'
                                }`}
                                onClick={() => setExamAnswers((prev) => ({ ...prev, [qId]: option }))}
                                style={{ position: 'relative', paddingLeft: '2.5rem' }}
                              >
                                <input
                                  type="radio"
                                  className="form-check-input"
                                  name={`exam-q-${qId}`}
                                  id={optionId}
                                  value={option}
                                  checked={isSelected}
                                  onChange={() => setExamAnswers((prev) => ({ ...prev, [qId]: option }))}
                                  required
                                  style={{ position: 'absolute', left: '1.25rem', top: '1.25rem', cursor: 'pointer' }}
                                />
                                <label
                                  className="form-check-label text-dark fw-medium w-100 cursor-pointer small"
                                  htmlFor={optionId}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {option}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                    <button
                      type="submit"
                      className="btn-premium-primary w-100 mt-3"
                      disabled={submittingExam}
                    >
                      {submittingExam ? 'Submitting Exam...' : 'Submit Exam'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : isCurrentTopicLocked ? (
            /* ================= LOCKED TOPIC CANVAS ================= */
            <div className="lock-card bg-white p-5 rounded-4 shadow-sm border text-center">
              <span className="material-symbols-outlined text-secondary display-4 mb-3">lock</span>
              <h4 className="fw-bold text-dark mb-2">This topic is locked</h4>
              <p className="text-secondary mb-0">
                Please complete the previous topics in this course to unlock this lesson.
              </p>
            </div>
          ) : activeTopic ? (
            /* ================= TOPIC CANVAS ================= */
            <div className="flex-grow-1 d-flex flex-column h-100">
              {/* Video Player Box (if video exists) */}
              {activeTopic.resources?.some(r => r.type === 'Video') && (
                <div className="video-box">
                  {activeTopic.resources.filter(r => r.type === 'Video').map((resource, index) => (
                    <iframe
                      key={index}
                      title="video player"
                      src={resource.url}
                      allowFullScreen
                    ></iframe>
                  ))}
                </div>
              )}

              {/* Text / Notes Canvas */}
              <div className="p-4 p-md-5 container-fluid max-w-4xl">
                <div className="card-premium mb-4">
                  <span className="badge-premium badge-premium-primary mb-3">
                    Active Lesson
                  </span>
                  <h1 className="h4 fw-bold text-dark mb-4">{activeTopic.title}</h1>

                  {/* Tabs */}
                  <div className="d-flex border-bottom gap-4 mb-4 overflow-x-auto flex-nowrap" style={{ borderBottomColor: 'var(--border-color) !important', whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                      onClick={() => setActiveTab('notes')}
                    >
                      Notes
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                      onClick={() => setActiveTab('documents')}
                    >
                      Documents
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${activeTab === 'references' ? 'active' : ''}`}
                      onClick={() => setActiveTab('references')}
                    >
                      References
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
                      onClick={() => setActiveTab('announcements')}
                    >
                      Announcements
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
                      onClick={() => setActiveTab('assignments')}
                    >
                      Assignments
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${activeTab === 'doubts' ? 'active' : ''}`}
                      onClick={() => setActiveTab('doubts')}
                    >
                      Doubts & Q&A
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${activeTab === 'quiz-feedback' ? 'active' : ''}`}
                      onClick={() => setActiveTab('quiz-feedback')}
                    >
                      Quiz Feedback
                    </button>
                  </div>

                  {activeTab === 'announcements' && (
                    <CourseAnnouncements courseId={courseId} user={authUser} />
                  )}

                  {activeTab === 'assignments' && (
                    <CourseAssignments
                      topicId={activeTopic?.id || activeTopic?._id}
                      user={authUser}
                    />
                  )}

                  {activeTab === 'doubts' && (
                    <CourseDoubts
                      topicId={activeTopic?.id || activeTopic?._id}
                      user={authUser}
                    />
                  )}

                  {activeTab === 'quiz-feedback' && (
                    <QuizFeedbackPanel
                      topicId={activeTopic?.id || activeTopic?._id}
                      user={authUser}
                      assessment={activeTopic?.assessment}
                    />
                  )}

                  {activeTab === 'notes' && (
                    <div className="notes-content">
                      {activeTopic.resources?.filter(r => r.type === 'Notes').map((resource, idx) => (
                        <div key={idx} className="markdown-notes">
                          <ReactMarkdown>{resource.content}</ReactMarkdown>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="py-3">
                      <p className="text-secondary small">Related PDF handouts, slides, or documents are listed below.</p>
                      <div className="p-3 border rounded-3 bg-light d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2 small">
                          <span className="material-symbols-outlined text-danger">picture_as_pdf</span>
                          <span className="fw-semibold">Topic_Handout_Notes.pdf</span>
                        </div>
                        <button type="button" className="btn-premium-secondary py-1 px-3" style={{ fontSize: '0.8rem' }}>Download</button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'references' && (
                    <div className="py-3">
                      <p className="text-secondary small">External links and research resources for advanced study.</p>
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item bg-transparent px-0 py-2 d-flex gap-2 align-items-center small">
                          <span className="material-symbols-outlined text-primary fs-5">link</span>
                          <a href="https://react.dev" target="_blank" rel="noreferrer" className="text-decoration-none">React Documentation</a>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Assessments Panel */}
                {activeTopic.assessment && (
                  <QuizBoard
                    topicId={activeTopic.id || activeTopic._id}
                    assessment={activeTopic.assessment}
                    onResult={handleQuizResult}
                    isCompleted={(localProgress.completedTopics || []).includes(activeTopic.id || activeTopic._id)}
                  />
                )}

                {/* Personal Notes Box */}
                {activeTab === 'notes' && (
                  <div className="card-premium mb-4">
                    <h4 className="h6 fw-bold text-dark mb-3">Your Personal Notes</h4>
                    <div className="mb-3 position-relative">
                      <textarea
                        className="input-premium"
                        style={{ minHeight: '100px', paddingBottom: '48px' }}
                        placeholder="Click to add a personal timestamped note..."
                        value={personalNotes}
                        onChange={(e) => setPersonalNotes(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-premium-primary py-1 px-3 position-absolute"
                        style={{ right: '12px', bottom: '12px', fontSize: '0.8rem' }}
                        onClick={handleAddPersonalNote}
                      >
                        Add Note
                      </button>
                    </div>
                    {notesList.length > 0 && (
                      <ul className="list-group list-group-flush">
                        {notesList.map((note, index) => (
                          <li key={index} className="list-group-item bg-transparent px-0 py-2 d-flex justify-content-between align-items-start small">
                            <span className="text-dark">{note.text}</span>
                            <span className="text-secondary text-xs">{note.timestamp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-secondary">No topics available in this course.</p>
            </div>
          )}
        </main>
      </div>

      {/* Footer Controls */}
      <footer className="viewer-footer px-4 d-flex align-items-center justify-content-between flex-shrink-0">
        <div className="d-flex flex-column gap-1 flex-grow-1 me-4" style={{ maxWidth: '280px' }}>
          <div className="d-flex justify-content-between align-items-center small text-secondary">
            <span>Course Progress</span>
            <span className="fw-bold">{localProgress.progressPercent}% Complete</span>
          </div>
          <div className="progress-bar-thin">
            <div className="progress-bar-fill" style={{ width: `${localProgress.progressPercent}%` }}></div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn-premium-secondary py-1.5 px-3"
            style={{ fontSize: '0.85rem' }}
            disabled={activeTopicIndex <= 0}
            onClick={() => {
              if (activeTopicIndex > 0) {
                const prevTopic = allTopics[activeTopicIndex - 1];
                handleTopicClick(prevTopic.id || prevTopic._id);
              }
            }}
          >
            <span className="material-symbols-outlined fs-6">arrow_back</span>
            <span>Previous</span>
          </button>
          
          <button
            type="button"
            className="btn-premium-secondary py-1.5 px-3"
            style={{ fontSize: '0.85rem' }}
            disabled={activeTopicIndex === -1 || activeTopicIndex >= allTopics.length - 1}
            onClick={() => {
              if (activeTopicIndex < allTopics.length - 1) {
                const nextTopic = allTopics[activeTopicIndex + 1];
                handleTopicClick(nextTopic.id || nextTopic._id);
              }
            }}
          >
            <span>Next</span>
            <span className="material-symbols-outlined fs-6">arrow_forward</span>
          </button>

          {activeTopic && (!activeTopic.assessment || localProgress.completedQuizzes.includes(activeTopic.assessment.id || activeTopic.assessment._id)) && (
            <div>
              {!localProgress.completedTopics.includes(activeTopic.id || activeTopic._id) ? (
                <button
                  type="button"
                  className="btn-premium-primary py-1.5 px-3"
                  style={{ fontSize: '0.85rem' }}
                  onClick={handleMarkComplete}
                >
                  <span>Mark as Completed</span>
                  <span className="material-symbols-outlined fs-6">done</span>
                </button>
              ) : (
                <div className="d-flex align-items-center text-success gap-1.5 fw-semibold px-3 py-1.5 bg-success bg-opacity-10 rounded-pill small">
                  <span className="material-symbols-outlined fs-6" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span>Completed</span>
                </div>
              )}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
