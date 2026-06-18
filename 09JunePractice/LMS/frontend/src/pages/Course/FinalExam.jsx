import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';

export default function FinalExam() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  let progressCtx = null;
  try {
    progressCtx = useProgress();
  } catch (e) {}

  let auth = null;
  try {
    auth = useAuth();
  } catch (e) {}
  const token = auth?.token || localStorage.getItem('token') || '';

  const [questions, setQuestions] = useState([]);
  const [passingThreshold, setPassingThreshold] = useState(85);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [answers, setAnswers] = useState({}); // maps question id -> selectedOptionIndex
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMock, setIsMock] = useState(false);

  // Fallback Mock Questions if backend doesn't have it
  const defaultQuestions = [
    {
      id: 'mock_fe_q0',
      questionText: 'Explain the difference between Fragment and Vertex shaders in the modern rendering pipeline.',
      options: [
        'Vertex shaders calculate pixel colors after rasterization, whereas fragment shaders determine the positions of vertices in 3D space.',
        'Vertex shaders operate on individual vertices to transform 3D coordinates; Fragment shaders operate on pixel-level data to determine final screen color.',
        'Both shaders are identical in function but run at different clock speeds on the CPU rather than the GPU hardware.'
      ]
    },
    {
      id: 'mock_fe_q1',
      questionText: 'Which coordinate system is used as the intermediate target during the projection transformation before NDC?',
      options: [
        'Clip Space',
        'Eye Space',
        'World Space',
        'Screen Space'
      ]
    },
    {
      id: 'mock_fe_q2',
      questionText: 'What is the purpose of a Framebuffer object (FBO) in WebGL?',
      options: [
        'To speed up CPU calculations of geometry positions.',
        'To enable off-screen rendering by targeting textures or renderbuffers instead of the default screen canvas.',
        'To control the aspect ratio of the main drawing context.'
      ]
    }
  ];

  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/courses/${courseId}/final-exam`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.questions && result.data.questions.length > 0) {
            setQuestions(result.data.questions);
            setPassingThreshold(result.data.passingThreshold || 85);
            setIsMock(false);
          } else {
            setQuestions(defaultQuestions);
            setIsMock(true);
          }
        } else {
          const errResult = await response.json().catch(() => ({}));
          if (response.status === 403) {
            setError(errResult.message || 'You are locked out of the exam.');
            return; // Don't load mock questions
          }
          setQuestions(defaultQuestions);
          setIsMock(true);
        }
      } catch (err) {
        console.error('Failed to fetch final exam:', err);
        setError(`Connection Error: ${err.message || 'Unknown network error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [courseId, token]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitExam();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleSelectOption = (qId, optionIdx) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleSubmitExam = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const formattedAnswers = questions.map(q => ({
      questionId: q.id,
      selectedOptionIndex: answers[q.id] !== undefined ? answers[q.id] : -1
    }));

    setIsSubmitting(true);
    try {
      const response = await fetch(`/courses/${courseId}/final-exam/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers: formattedAnswers })
      });

      if (!response.ok) {
        const errResult = await response.json().catch(() => ({}));
        throw new Error(errResult.message || 'Submission failed');
      }
      
      const result = await response.json();

      if (result.success) {
        if (progressCtx) {
          await progressCtx.refreshEnrolledCourses();
        }
        if (result.passed) {
          // Navigate to final exam results page (CourseCompletion.jsx)
          navigate(`/course/${courseId}/completion`, { state: { result } });
        } else {
          alert(`You scored ${result.score}%. Marks are too low. Kindly prepare and re-attempt exam after 24hrs.`);
          navigate(`/course/${courseId}`); // Kick them out to course page
        }
      } else {
        throw new Error(result.message || 'Exam submit failed');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit exam: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: 'var(--bg-neutral)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Exam Questions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: 'var(--bg-neutral)' }}>
        <div className="card-premium p-5 text-center" style={{ maxWidth: '500px' }}>
          <span className="material-symbols-outlined text-danger mb-3" style={{ fontSize: '48px' }}>lock</span>
          <h3 className="h5 fw-bold text-dark mb-3">Exam Locked</h3>
          <p className="text-secondary mb-4">{error}</p>
          <Link to={`/course/${courseId}`} className="btn-premium-primary">Return to Course</Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const totalCount = questions.length;

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between animate-fade-in" style={{ backgroundColor: 'var(--bg-neutral)' }}>
      <style>{`
        .question-btn-premium {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background-color: #ffffff;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-fast);
        }
        .question-btn-premium.completed {
          background-color: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }
        .question-btn-premium.active {
          background-color: var(--primary-light);
          color: var(--primary);
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--primary-glow);
        }
        .option-label-premium {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          cursor: pointer;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          transition: var(--transition-fast);
          background-color: #ffffff;
        }
        .option-label-premium:hover {
          border-color: var(--primary);
          background-color: var(--primary-light);
        }
        .option-label-premium.selected {
          border-color: var(--primary);
          background-color: var(--primary-light);
          box-shadow: 0 0 0 1px var(--primary);
        }
        .option-radio {
          margin-top: 4px;
        }
      `}</style>

      {/* Top Nav Bar */}
      <header className="nav-premium-top justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <Link to="/" className="text-decoration-none fw-extrabold text-primary fs-4" style={{ letterSpacing: '-0.02em' }}>EduFlow</Link>
          <div className="vr text-secondary" style={{ height: '20px' }}></div>
          <div>
            <span className="small text-secondary d-block">Final Certification</span>
            <span className="small text-primary fw-bold uppercase" style={{ fontSize: '10px' }}>Secure Examination Port</span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-4">
          <div className="text-end">
            <div className="d-flex align-items-center gap-2 text-danger fw-bold" style={{ fontSize: '1.05rem' }}>
              <span className="material-symbols-outlined fs-5">timer</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
            <div className="progress" style={{ height: '3px', width: '100px', marginTop: '4px', backgroundColor: 'var(--border-color)' }}>
              <div className="progress-bar bg-danger" style={{ width: `${(timeLeft / 7200) * 100}%` }}></div>
            </div>
          </div>
          <button
            onClick={handleSubmitExam}
            disabled={isSubmitting}
            className="btn-premium-primary"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </header>

      {/* Split Content */}
      <div className="container-fluid px-4 py-4 flex-grow-1">
        <div className="row g-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Question Grid Sidebar */}
          <aside className="col-lg-3">
            <div className="card-premium-static p-4 bg-white">
              <h3 className="h6 fw-bold mb-3 d-flex justify-content-between align-items-center text-dark">
                <span>QUESTIONS</span>
                <span className="text-primary small fw-normal">{Object.keys(answers).length} / {totalCount} completed</span>
              </h3>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {questions.map((q, idx) => {
                  const isCompleted = answers[q.id] !== undefined;
                  const isActive = idx === currentIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`question-btn-premium ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="border-top pt-3 text-secondary small d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="d-inline-block rounded bg-primary" style={{ width: '12px', height: '12px' }}></span>
                  <span>Answered</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="d-inline-block rounded bg-white border" style={{ width: '12px', height: '12px', borderColor: 'var(--border-color)' }}></span>
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Question card */}
          <section className="col-lg-9">
            {currentQuestion ? (
              <div className="card-premium d-flex flex-column justify-content-between p-4 p-md-5" style={{ minHeight: '500px', backgroundColor: '#ffffff' }}>
                <div>
                  <div className="d-flex justify-content-between mb-4">
                    <span className="badge-premium badge-premium-primary">
                      Question {currentIdx + 1} of {totalCount}
                    </span>
                  </div>
                  <h2 className="h4 fw-bold text-dark mb-4" style={{ lineHeight: '1.5' }}>{currentQuestion.questionText}</h2>

                  {/* Options List */}
                  <div className="d-flex flex-column gap-3 mb-4">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = answers[currentQuestion.id] === idx;
                      return (
                        <label
                          key={idx}
                          className={`option-label-premium ${isSelected ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            className="option-radio form-check-input"
                            name={`q-${currentQuestion.id}`}
                            checked={isSelected}
                            onChange={() => handleSelectOption(currentQuestion.id, idx)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span className="text-dark fw-medium">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="d-flex justify-content-between border-top pt-4 mt-4">
                  <button
                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentIdx === 0}
                    className="btn-premium-secondary"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      if (currentIdx < totalCount - 1) {
                        setCurrentIdx(prev => prev + 1);
                      } else {
                        handleSubmitExam();
                      }
                    }}
                    className="btn-premium-primary"
                  >
                    {currentIdx === totalCount - 1 ? 'Finish Exam' : 'Save & Next'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-5">
                <p className="text-secondary">No questions loaded.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-top py-4 px-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-secondary">
        <p className="mb-0">© 2026 EduFlow LMS. All rights reserved.</p>
        <div className="d-flex gap-3">
          <a className="text-secondary text-decoration-none hover-text-primary" href="#">Privacy Policy</a>
          <a className="text-secondary text-decoration-none hover-text-primary" href="#">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
