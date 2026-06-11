import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

// Default mock quiz for standalone preview and testing
const DEFAULT_MOCK_QUIZ = {
  id: 'mock-quiz-1',
  title: 'Advanced Microeconomics Quiz',
  durationMinutes: 15,
  questions: [
    {
      id: 'q1',
      type: 'MULTIPLE CHOICE',
      questionText: 'In a perfectly competitive market, which of the following best describes the condition for long-run equilibrium for a firm?',
      options: [
        'Marginal Revenue equals Marginal Cost, and Price is greater than Average Total Cost.',
        'Price equals Marginal Cost, which equals Minimum Average Total Cost.',
        'Price is equal to Average Variable Cost but less than Average Total Cost.',
        'Marginal Revenue is less than Price, and Average Total Cost is minimized.'
      ],
      correctAnswerIndex: 1
    },
    {
      id: 'q2',
      type: 'MULTIPLE CHOICE',
      questionText: 'Which of the following is a key characteristic of a pure monopoly market structure?',
      options: [
        'A single seller with no close substitutes and high barriers to entry.',
        'Many sellers producing slightly differentiated products with free entry.',
        'A few large sellers dominating the market with mutual interdependence.',
        'A single buyer facing multiple competing sellers in a transparent marketplace.'
      ],
      correctAnswerIndex: 0
    },
    {
      id: 'q3',
      type: 'MULTIPLE CHOICE',
      questionText: 'What does the price elasticity of demand measure in economic theory?',
      options: [
        'The responsiveness of consumer income to changes in market price levels.',
        'The rate of supply adjustment when input costs increase.',
        'The percentage change in quantity demanded in response to a percentage change in price.',
        'The speed of market clearance when government price floors are removed.'
      ],
      correctAnswerIndex: 2
    },
    {
      id: 'q4',
      type: 'MULTIPLE CHOICE',
      questionText: 'Under monopolistic competition, how do firms maximize profits in the short run?',
      options: [
        'By setting price equal to marginal cost directly.',
        'By producing the quantity where marginal revenue equals marginal cost.',
        'By minimizing total variable costs regardless of demand.',
        'By cooperating with competitors to restrict output and inflate pricing.'
      ],
      correctAnswerIndex: 1
    }
  ]
};

export default function QuizInterface({
  quiz = null,
  onSubmit = null,
  onClose = null,
  courseId = null,
  topicId = null
}) {
  const navigate = useNavigate();
  const params = useParams();

  // Resolve the actual quiz data
  const activeQuiz = useMemo(() => {
    return quiz || DEFAULT_MOCK_QUIZ;
  }, [quiz]);

  const questions = useMemo(() => {
    return activeQuiz.questions || [];
  }, [activeQuiz]);

  // States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // maps question index -> selected option index
  const [timeLeft, setTimeLeft] = useState((activeQuiz.durationMinutes || 15) * 60);
  const [status, setStatus] = useState('taking'); // taking, submitting, completed, timeup
  const [errorMessage, setErrorMessage] = useState('');
  const [resultSummary, setResultSummary] = useState(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleSubmitQuizRef = useRef(null);
  useEffect(() => {
    handleSubmitQuizRef.current = handleSubmitQuiz;
  });

  // Countdown timer effect
  useEffect(() => {
    if (status !== 'taking') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('timeup');
          if (handleSubmitQuizRef.current) {
            handleSubmitQuizRef.current(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // SVG dashOffset for circular timer progress
  const timerPercentage = (timeLeft / ((activeQuiz.durationMinutes || 15) * 60)) * 100;
  const dashOffset = 100 - timerPercentage;

  // Option selection
  const handleSelectOption = (optionIndex) => {
    if (status !== 'taking') return;
    
    // Micro-interaction: trigger light vibration if supported by device
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  // Navigations
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmitQuiz();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Auto-submit on time-up
  const handleAutoSubmit = () => {
    handleSubmitQuiz(true);
  };

  // Submit Logic
  const handleSubmitQuiz = async (isTimeUp = false) => {
    setStatus('submitting');
    setErrorMessage('');

    // Prepare payload format
    const submissionAnswers = {};
    questions.forEach((q, idx) => {
      const selectedIdx = answers[idx];
      submissionAnswers[q.id] = selectedIdx !== undefined ? q.options[selectedIdx] : '';
    });

    try {
      if (onSubmit) {
        // Parent component handles the actual submission
        await onSubmit(submissionAnswers);
        setStatus('completed');
      } else {
        // Standalone demonstration flow
        let correctCount = 0;
        questions.forEach((q, idx) => {
          if (answers[idx] === q.correctAnswerIndex) {
            correctCount++;
          }
        });
        const scorePercent = Math.round((correctCount / totalQuestions) * 100);
        const passed = scorePercent >= 70; // 70% passing threshold

        // Local simulation delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        setResultSummary({
          totalQuestions,
          correctCount,
          scorePercent,
          passed,
          timeSpent: ((activeQuiz.durationMinutes || 15) * 60) - timeLeft
        });
        setStatus('completed');
      }
    } catch (err) {
      setStatus('taking');
      setErrorMessage(err.message || 'Quiz submission failed. Please try again.');
    }
  };

  // Exit Quiz Handler
  const handleExit = () => {
    if (onClose) {
      onClose();
    } else if (courseId) {
      navigate(`/course/${courseId}`);
    } else {
      navigate(-1);
    }
  };

  // Answered questions list mapping helper
  const isQuestionAnswered = (index) => {
    return answers[index] !== undefined;
  };

  // Completed / Results Screen View
  if (status === 'completed') {
    const summary = resultSummary || {
      totalQuestions: totalQuestions,
      correctCount: Object.keys(answers).length, // fallback
      scorePercent: 100,
      passed: true,
      timeSpent: 60
    };

    return (
      <div className="container py-5 mt-5 d-flex justify-content-center align-items-center min-vh-75 animate-fade-in">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
          }
          .custom-circle-progress {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            position: relative;
            background: conic-gradient(
              \${summary.passed ? '#198754' : '#dc3545'} \${summary.scorePercent * 3.6}deg,
              #f8f9fa 0deg
            );
          }
          .custom-circle-progress::after {
            content: "";
            position: absolute;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background-color: white;
          }
          .custom-circle-text {
            position: relative;
            z-index: 2;
            font-size: 1.5rem;
            font-weight: 700;
            color: #212529;
          }
        `}} />
        <div className="card shadow-lg border-0 rounded-4 text-center p-5 bg-white" style={{ maxWidth: '560px', width: '100%' }}>
          <div className="card-body">
            {summary.passed ? (
              <div className="mb-4">
                <span className="fs-1">🎉</span>
                <h2 className="h3 fw-bold text-success mt-2">Quiz Completed!</h2>
                <p className="text-muted">Congratulations! You have successfully passed this assessment.</p>
              </div>
            ) : (
              <div className="mb-4">
                <span className="fs-1">❌</span>
                <h2 className="h3 fw-bold text-danger mt-2">Assessment Failed</h2>
                <p className="text-muted">You did not meet the 70% passing threshold for this quiz.</p>
              </div>
            )}

            {/* Circular score badge */}
            <div className="custom-circle-progress">
              <span className="custom-circle-text">{summary.scorePercent}%</span>
            </div>

            <div className="row g-3 py-3 border-top border-bottom mb-4 text-start">
              <div className="col-6">
                <span className="small text-muted d-block">CORRECT ANSWERS</span>
                <span className="fw-bold text-dark">{summary.correctCount} of {summary.totalQuestions}</span>
              </div>
              <div className="col-6">
                <span className="small text-muted d-block">TIME SPENT</span>
                <span className="fw-bold text-dark">{formatTime(summary.timeSpent)}</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-2">
              <button 
                onClick={handleExit} 
                className={`btn \${summary.passed ? 'btn-success' : 'btn-primary'} py-2.5 fw-semibold rounded-3 shadow-sm`}
              >
                {summary.passed ? 'Continue Learning' : 'Try Again'}
              </button>
              <button 
                onClick={handleExit} 
                className="btn btn-outline-secondary py-2.5 fw-semibold rounded-3"
              >
                Back to Curriculum
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading/submitting view
  if (status === 'submitting') {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-white">
        <div className="spinner-border text-primary" role="status" style={{ width: '3.5rem', height: '3.5rem' }}>
          <span className="visually-hidden">Evaluating...</span>
        </div>
        <h3 className="h5 fw-bold text-dark mt-4">Evaluating Answers</h3>
        <p className="text-muted small">Please wait while we evaluate your results...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 d-flex flex-column min-vh-100 bg-light">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-header {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          background-color: rgba(255, 255, 255, 0.9);
        }
        .option-card-hover:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transform: translateY(-1px);
        }
        .custom-timer-circle {
          transform: rotate(-90deg);
          transform-origin: center;
        }
        .transition-ease {
          transition: all 0.2s ease-in-out;
        }
      `}} />

      {/* Top Bar Navigation */}
      <header className="position-fixed top-0 start-0 w-100 z-3 glass-header border-bottom shadow-sm" style={{ height: '64px' }}>
        <div className="container-xl h-100 px-4 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <span className="fs-5 fw-bold text-primary tracking-tight">EduFlow</span>
            <div className="vr d-none d-sm-block" style={{ height: '24px' }}></div>
            <h1 className="h6 text-dark fw-semibold mb-0 d-none d-sm-block">{activeQuiz.title}</h1>
          </div>

          <div className="d-flex align-items-center gap-4">
            {/* Progress Bar (visible on larger screens) */}
            <div className="d-none d-md-flex flex-column align-items-end" style={{ width: '180px' }}>
              <span className="small text-secondary mb-1">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <div className="progress w-100" style={{ height: '6px' }}>
                <div 
                  className="progress-bar bg-primary transition-ease" 
                  role="progressbar" 
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  aria-valuenow={currentQuestionIndex + 1} 
                  aria-valuemin="1" 
                  aria-valuemax={totalQuestions}
                ></div>
              </div>
            </div>

            {/* Circular Count Down Timer */}
            <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
              <svg className="w-100 h-100 custom-timer-circle" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e9edff" strokeWidth="3" />
                <circle 
                  className="transition-ease"
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  stroke={timeLeft < 60 ? '#dc3545' : 'var(--bs-primary)'} 
                  strokeWidth="3" 
                  strokeDasharray="100" 
                  strokeDashoffset={dashOffset} 
                />
              </svg>
              <span 
                className={`position-absolute fw-bold ${timeLeft < 60 ? 'text-danger' : 'text-primary'}`} 
                style={{ fontSize: '11px' }}
              >
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Exit Close Icon */}
            <button 
              type="button" 
              onClick={handleExit}
              className="btn btn-link p-0 d-flex align-items-center justify-content-center rounded-circle text-secondary text-decoration-none"
              style={{ width: '38px', height: '38px', backgroundColor: 'transparent' }}
              aria-label="Exit quiz"
            >
              <span className="material-symbols-outlined text-dark">close</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow-1 w-100 d-flex flex-column align-items-center px-4" style={{ paddingTop: '100px', paddingBottom: '90px' }}>
        <div className="w-100" style={{ maxWidth: '720px' }}>
          {errorMessage && (
            <div className="alert alert-danger shadow-sm mb-4" role="alert">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Question Presentation Container */}
          <div className="mb-4">
            <div className="d-inline-flex align-items-center px-2.5 py-1 bg-primary-subtle text-primary rounded mb-3">
              <span className="fw-bold" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                {currentQuestion.type || 'MULTIPLE CHOICE'}
              </span>
            </div>
            <h2 className="h3 fw-bold text-dark lh-sm mb-0">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* Bento-style Option Buttons */}
          <div className="d-flex flex-column gap-3 mb-4">
            {currentQuestion.options.map((option, idx) => {
              const optionLetter = String.fromCharCode(65 + idx);
              const isSelected = answers[currentQuestionIndex] === idx;

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`option-card-hover w-100 text-start border rounded-3 p-3 transition-ease d-flex align-items-center justify-content-between ${
                    isSelected 
                      ? 'border-primary bg-primary-subtle bg-opacity-10' 
                      : 'border-light-subtle bg-white'
                  }`}
                  style={{ minHeight: '68px', cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center flex-grow-1">
                    <div 
                      className={`d-flex align-items-center justify-content-center rounded-circle fw-bold me-3 flex-shrink-0 transition-ease`}
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        border: isSelected ? '2px solid var(--bs-primary)' : '2px solid #ced4da',
                        backgroundColor: isSelected ? 'var(--bs-primary)' : 'transparent',
                        color: isSelected ? '#ffffff' : '#6c757d'
                      }}
                    >
                      {optionLetter}
                    </div>
                    <span className="text-dark fs-6 font-body-lg" style={{ lineHeight: '1.4' }}>
                      {option}
                    </span>
                  </div>

                  <div className="flex-shrink-0 ms-2" style={{ opacity: isSelected ? 1 : 0, transition: 'opacity 0.2s' }}>
                    <span className="material-symbols-outlined text-primary fs-4" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Floating Bottom Navigation */}
      <footer className="position-fixed bottom-0 start-0 w-100 bg-white border-top py-3 px-4 z-3 shadow-lg">
        <div className="container-xl d-flex align-items-center justify-content-between" style={{ maxWidth: '720px' }}>
          {/* Back button */}
          <button 
            type="button"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="btn btn-outline-secondary d-flex align-items-center gap-1.5 fw-semibold border-0 text-secondary"
            style={{ padding: '8px 16px' }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Previous
          </button>

          {/* Stepper Dots (Visible on tablets and larger screen sizes) */}
          <div className="d-none d-sm-flex align-items-center gap-2">
            {questions.map((_, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const isAnswered = isQuestionAnswered(idx);
              return (
                <div 
                  key={idx}
                  className="rounded-circle"
                  style={{
                    width: isCurrent ? '10px' : '8px',
                    height: isCurrent ? '10px' : '8px',
                    backgroundColor: isCurrent 
                      ? 'var(--bs-primary)' 
                      : isAnswered 
                        ? '#b4c5ff' 
                        : '#ced4da',
                    transform: isCurrent ? 'scale(1.2)' : 'none',
                    transition: 'all 0.25s ease'
                  }}
                />
              );
            })}
          </div>

          {/* Forward button */}
          <button 
            type="button"
            onClick={handleNext}
            disabled={answers[currentQuestionIndex] === undefined}
            className="btn btn-primary d-flex align-items-center gap-1.5 fw-semibold px-4 py-2"
          >
            {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
