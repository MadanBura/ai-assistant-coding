import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

/**
 * Helper Sub-component: QuizBoard
 */
function QuizBoard({ assessment, onResult, topicId }) {
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState('idle'); // idle, submitting, passed, failed
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectOption = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');
    try {
      const response = await fetch(`/topics/${topicId}/assessment/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Quiz submission failed');
      }

      const result = await response.json();
      if (result.success) {
        if (result.passed) {
          setStatus('passed');
          onResult(true, result.progressPercent, assessment.id);
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

  if (status === 'passed') {
    return (
      <div className="alert alert-success text-center p-4 my-4" role="alert">
        <h4 className="alert-heading fw-bold">🎉 Passed!</h4>
        <p>Congratulations! You have successfully passed the quiz assessment for this topic.</p>
        <button
          className="btn btn-success mt-2"
          onClick={() => onResult('continue')}
        >
          Continue to Next Topic
        </button>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="alert alert-danger text-center p-4 my-4" role="alert">
        <h4 className="alert-heading fw-bold">❌ Failed</h4>
        <p>{errorMessage || 'You did not pass the assessment. Review the material and try again.'}</p>
        <button className="btn btn-outline-danger mt-2" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-light p-4 rounded border mb-4">
      <h3 className="h5 fw-bold mb-3">Topic Assessment</h3>
      {assessment.questions.map((q) => (
        <div key={q.id} className="mb-4">
          <p className="fw-semibold mb-2">{q.questionText}</p>
          {q.options.map((option, idx) => {
            const optionId = `q-${q.id}-opt-${idx}`;
            return (
              <div key={idx} className="form-check mb-2">
                <input
                  type="radio"
                  className="form-check-input"
                  name={`q-${q.id}`}
                  id={optionId}
                  value={option}
                  checked={answers[q.id] === option}
                  onChange={() => handleSelectOption(q.id, option)}
                  required
                />
                <label className="form-check-label" htmlFor={optionId}>
                  {option}
                </label>
              </div>
            );
          })}
        </div>
      ))}
      <button
        type="submit"
        className="btn btn-primary"
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
  course = {},
  progress = {},
  activeTopicId: propActiveTopicId,
  activeView: propActiveView = '',
}) {
  // Localized state for tracking progress updates
  const [localProgress, setLocalProgress] = useState({
    progressPercent: 0,
    completedTopics: [],
    completedQuizzes: [],
    finalExamPassed: false,
    ...progress,
  });

  const [currentActiveTopicId, setCurrentActiveTopicId] = useState(propActiveTopicId);
  const [currentView, setCurrentView] = useState(propActiveView);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');
  const [submittingExam, setSubmittingExam] = useState(false);
  const [examStatus, setExamStatus] = useState('');
  const [examAnswers, setExamAnswers] = useState({});

  // Reset active state when props change
  useEffect(() => {
    setLocalProgress({
      progressPercent: 0,
      completedTopics: [],
      completedQuizzes: [],
      finalExamPassed: false,
      ...progress,
    });
  }, [progress]);

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
    allTopics.find((t) => t.id === currentActiveTopicId) || allTopics[0];

  const activeTopicIndex = allTopics.findIndex((t) => t.id === activeTopic?.id);

  // Sequential lock logic
  const isTopicLocked = (topicId) => {
    const idx = allTopics.findIndex((t) => t.id === topicId);
    if (idx <= 0) return false; // First topic is always unlocked
    // Unlocked if previous topic is completed
    const prevTopic = allTopics[idx - 1];
    return !localProgress.completedTopics.includes(prevTopic.id);
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
    try {
      const response = await fetch(`/topics/${activeTopic.id}/complete`, {
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
        setLocalProgress((prev) => ({
          ...prev,
          progressPercent: result.data.progressPercent,
          completedTopics: result.data.completedTopics,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuizResult = (passed, progressPercent, quizId) => {
    if (passed === 'continue') {
      // Navigate to next topic or final exam
      if (activeTopicIndex < allTopics.length - 1) {
        const nextTopic = allTopics[activeTopicIndex + 1];
        handleTopicClick(nextTopic.id);
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
    try {
      const response = await fetch(`/courses/${course.id}/final-exam/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ answers: examAnswers }),
      });

      if (!response.ok) {
        throw new Error('Exam submission failed');
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
      const response = await fetch(`/courses/${course.id}/certificate`, {
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

  const isCurrentTopicLocked = activeTopic && isTopicLocked(activeTopic.id);

  return (
    <div className="container-fluid p-0 d-flex flex-column min-h-screen bg-light">
      {/* Top Header */}
      <header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
        <h1 className="h4 text-primary fw-bold mb-0">{course.title || 'Learning Portal'}</h1>
        <Link to="/courses" className="btn btn-outline-secondary btn-sm">
          Back to Courses
        </Link>
      </header>

      {/* Main Grid Split */}
      <div className="d-flex flex-column flex-md-row flex-grow-1 overflow-hidden" style={{ minHeight: 'calc(100vh - 136px)' }}>
        
        {/* Curriculum Navigation Sidebar */}
        <aside className="bg-white border-end p-3 flex-shrink-0" style={{ width: '300px' }}>
          <div className="mb-4">
            <h5 className="fw-bold text-dark mb-1">Course Progress</h5>
            <div className="progress mb-2" style={{ height: '8px' }}>
              <div
                className="progress-bar bg-primary"
                role="progressbar"
                style={{ width: `${localProgress.progressPercent}%` }}
                aria-valuenow={localProgress.progressPercent}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <span className="small text-muted fw-semibold">
              Progress: {localProgress.progressPercent}% Complete
            </span>
          </div>

          <nav className="list-group list-group-flush">
            {course.modules?.map((mod) => (
              <div key={mod.id} className="mb-3">
                <div className="fw-bold text-secondary text-uppercase small mb-2">{mod.title}</div>
                {mod.topics?.map((topic) => {
                  const locked = isTopicLocked(topic.id);
                  const completed = localProgress.completedTopics.includes(topic.id);
                  const active = currentView === '' && activeTopic?.id === topic.id;

                  return (
                    <button
                      key={topic.id}
                      data-testid={`sidebar-item-${topic.id}`}
                      className={`list-group-item list-group-item-action border-0 d-flex align-items-center justify-content-between rounded mb-1 ${
                        locked ? 'locked disabled bg-light text-muted' : ''
                      } ${active ? 'active bg-primary-subtle text-primary fw-semibold' : ''}`}
                      onClick={() => handleTopicClick(topic.id)}
                      disabled={locked}
                    >
                      <div className="d-flex align-items-center gap-2">
                        {completed ? (
                          <span className="text-success small">✔</span>
                        ) : locked ? (
                          <span data-testid={`lock-icon-${topic.id}`} className="text-muted small">
                            🔒
                          </span>
                        ) : (
                          <span className="text-muted small">📄</span>
                        )}
                        <span className="small text-truncate" style={{ maxWidth: '200px' }}>
                          {topic.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {course.finalExam && (
              <div className="mt-4 pt-3 border-top">
                <button
                  className={`list-group-item list-group-item-action border-0 rounded d-flex align-items-center gap-2 ${
                    currentView === 'final-exam' ? 'active bg-primary-subtle text-primary fw-semibold' : ''
                  }`}
                  onClick={() => {
                    setCurrentView('final-exam');
                    setCurrentActiveTopicId(null);
                  }}
                >
                  🎓 Final Exam
                </button>
              </div>
            )}
          </nav>
        </aside>

        {/* Content Viewer Section */}
        <main className="flex-grow-1 p-4 bg-white overflow-y-auto">
          {currentView === 'final-exam' ? (
            /* Final Exam View */
            <div className="max-w-3xl mx-auto">
              <h2 className="h4 fw-bold text-dark mb-4">Final Exam Assessment</h2>
              {localProgress.progressPercent < 100 ? (
                <div className="alert alert-warning text-center p-4" role="alert">
                  <h4 className="fw-bold">🔒 Final Exam is Locked</h4>
                  <p className="mb-0">
                    You must complete 100% of all curriculum topics before attempting the final exam.
                  </p>
                </div>
              ) : localProgress.finalExamPassed ? (
                <div className="card border-0 bg-success-subtle text-success-emphasis p-4 text-center">
                  <h3 className="h4 fw-bold mb-2">🎉 Congratulations!</h3>
                  <p className="mb-4">You have successfully passed the final exam and completed the course.</p>
                  <div>
                    <button
                      className="btn btn-success px-4 py-2"
                      onClick={handleDownloadCertificate}
                      disabled={isDownloading}
                    >
                      {isDownloading ? downloadMsg : 'Download Certificate'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleExamSubmit} className="bg-light p-4 rounded border">
                  {course.finalExam?.questions.map((q) => (
                    <div key={q.id} className="mb-4">
                      <p className="fw-semibold mb-2">{q.questionText}</p>
                      {q.options.map((option, idx) => {
                        const optId = `fe-${q.id}-opt-${idx}`;
                        return (
                          <div key={idx} className="form-check mb-2">
                            <input
                              type="radio"
                              className="form-check-input"
                              name={`fe-${q.id}`}
                              id={optId}
                              value={option}
                              checked={examAnswers[q.id] === option}
                              onChange={() =>
                                setExamAnswers((prev) => ({ ...prev, [q.id]: option }))
                              }
                              required
                            />
                            <label className="form-check-label" htmlFor={optId}>
                              {option}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  {examStatus === 'failed' && (
                    <div className="alert alert-danger" role="alert">
                      ❌ You did not pass the final exam. Please review course materials and try again.
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={submittingExam}>
                    {submittingExam ? 'Evaluating...' : 'Submit Exam'}
                  </button>
                </form>
              )}
            </div>
          ) : isCurrentTopicLocked ? (
            /* Topic Locked Screen */
            <div className="alert alert-warning text-center p-4 my-5" role="alert">
              <h4 className="fw-bold">🔒 This Topic is Locked</h4>
              <p className="mb-0">Please complete the preceding topics sequentially in the curriculum sidebar.</p>
            </div>
          ) : activeTopic ? (
            /* Normal Unlocked Topic Content */
            <div className="max-w-4xl mx-auto">
              <h2 className="h3 fw-bold text-dark mb-4">{activeTopic.title}</h2>

              {activeTopic.assessment ? (
                /* Topic Assessment Quiz */
                <QuizBoard
                  assessment={activeTopic.assessment}
                  topicId={activeTopic.id}
                  onResult={handleQuizResult}
                />
              ) : (
                /* Standard Resources Content */
                <div className="space-y-4">
                  {activeTopic.resources?.map((res, idx) => (
                    <div key={idx} className="mb-4">
                      {res.type === 'Video' ? (
                        <div className="ratio ratio-16x9 bg-dark rounded overflow-hidden shadow mb-3">
                          <iframe
                            src={res.url}
                            title="video player"
                            allowFullScreen
                          ></iframe>
                        </div>
                      ) : (
                        <div className="prose bg-light p-4 rounded border border-light-subtle shadow-sm">
                          <ReactMarkdown>{res.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Mark Completed Button */}
                  {!localProgress.completedTopics.includes(activeTopic.id) && (
                    <div className="mt-4 pt-3 border-top">
                      <button className="btn btn-success px-4 py-2" onClick={handleMarkComplete}>
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              Select a topic from the curriculum sidebar to start learning.
            </div>
          )}
        </main>
      </div>

      {/* Sticky Bottom Navigation Footer */}
      <footer className="bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center mt-auto">
        <button
          className="btn btn-outline-secondary"
          disabled={activeTopicIndex <= 0}
          onClick={() => {
            if (activeTopicIndex > 0) {
              handleTopicClick(allTopics[activeTopicIndex - 1].id);
            }
          }}
        >
          ⬅ Previous Topic
        </button>

        {activeTopicIndex < allTopics.length - 1 ? (
          <button
            className="btn btn-primary"
            disabled={isTopicLocked(allTopics[activeTopicIndex + 1].id)}
            onClick={() => handleTopicClick(allTopics[activeTopicIndex + 1].id)}
          >
            Next Topic ➡
          </button>
        ) : course.finalExam ? (
          <button
            className={`btn ${localProgress.progressPercent < 100 ? 'btn-outline-secondary' : 'btn-primary'}`}
            onClick={() => {
              setCurrentView('final-exam');
              setCurrentActiveTopicId(null);
            }}
          >
            Go to Final Exam 🏆
          </button>
        ) : null}
      </footer>
    </div>
  );
}
