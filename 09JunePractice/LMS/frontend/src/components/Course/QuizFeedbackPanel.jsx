import React, { useState } from 'react';
import { setupQuizFeedback, submitQuizFeedback } from '../../services/quizFeedbackService';

/* ──────────────────────────────────────────────
   INSTRUCTOR: Question builder
────────────────────────────────────────────── */
const RELEASE_RULES = [
  { value: 'Always',        label: 'Always — show feedback immediately' },
  { value: 'OnPassing',     label: 'On Passing — show only if learner passes' },
  { value: 'AfterDeadline', label: 'After Deadline — release after due date' },
];

const newQ = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctOptionIndex: 0,
  explanation: '',
});

function InstructorSetupView({ topicId }) {
  const [releaseRule, setReleaseRule] = useState('Always');
  const [questions, setQuestions]     = useState([newQ()]);
  const [saving, setSaving]           = useState(false);
  const [saveErr, setSaveErr]         = useState('');
  const [saveOk, setSaveOk]           = useState('');

  const addQ = () => setQuestions(p => [...p, newQ()]);
  const removeQ = (i) => setQuestions(p => p.filter((_, idx) => idx !== i));

  const updateQ = (i, field, val) =>
    setQuestions(p => p.map((q, idx) => idx === i ? { ...q, [field]: val } : q));

  const updateOpt = (qi, oi, val) =>
    setQuestions(p => p.map((q, idx) => {
      if (idx !== qi) return q;
      const opts = [...q.options];
      opts[oi] = val;
      return { ...q, options: opts };
    }));

  const validate = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) return `Question ${i + 1}: question text is required.`;
      const filled = q.options.filter(o => o.trim());
      if (filled.length < 2) return `Question ${i + 1}: at least 2 options required.`;
      if (!q.options[q.correctOptionIndex]?.trim()) return `Question ${i + 1}: correct option must not be empty.`;
    }
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveErr(''); setSaveOk('');
    const err = validate();
    if (err) { setSaveErr(err); return; }

    // Strip empty trailing options
    const sanitised = questions.map(q => ({
      ...q,
      options: q.options.filter(o => o.trim()),
    }));

    setSaving(true);
    try {
      const res = await setupQuizFeedback(topicId, { questions: sanitised, releaseRule });
      if (res.success) setSaveOk('Quiz feedback configuration saved!');
    } catch (err) {
      setSaveErr(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} noValidate aria-label="Quiz feedback setup">
      {saveErr && <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">{saveErr}</div>}
      {saveOk  && <div className="alert alert-success py-2 px-3 small mb-3" role="status">{saveOk}</div>}

      {/* Release rule */}
      <div className="mb-4 p-3 border rounded-3 bg-light">
        <label className="label-premium" htmlFor="release-rule">Feedback Release Rule *</label>
        <select
          id="release-rule"
          className="input-premium"
          value={releaseRule}
          onChange={e => setReleaseRule(e.target.value)}
          style={{ maxWidth: '380px' }}
        >
          {RELEASE_RULES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Questions */}
      <div className="d-flex flex-column gap-4 mb-4">
        {questions.map((q, qi) => (
          <div
            key={qi}
            className="border rounded-3 p-3 bg-white"
            style={{ borderLeft: '4px solid var(--primary)' }}
            role="group"
            aria-label={`Question ${qi + 1}`}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="small fw-bold text-dark mb-0">Question {qi + 1}</h4>
              {questions.length > 1 && (
                <button type="button" className="btn-close" onClick={() => removeQ(qi)}
                  aria-label={`Remove question ${qi + 1}`} />
              )}
            </div>

            <div className="form-group-premium">
              <label className="label-premium" htmlFor={`q-text-${qi}`}>Question Text *</label>
              <textarea
                id={`q-text-${qi}`}
                className="input-premium"
                value={q.questionText}
                onChange={e => updateQ(qi, 'questionText', e.target.value)}
                placeholder="Enter the question..."
                style={{ minHeight: '64px' }}
                required
              />
            </div>

            <div className="mb-3">
              <p className="label-premium mb-2">Options (select the correct one) *</p>
              {q.options.map((opt, oi) => (
                <div key={oi} className="d-flex align-items-center gap-2 mb-2">
                  <input
                    type="radio"
                    id={`q${qi}-opt${oi}-correct`}
                    name={`q${qi}-correct`}
                    checked={q.correctOptionIndex === oi}
                    onChange={() => updateQ(qi, 'correctOptionIndex', oi)}
                    style={{ accentColor: 'var(--success)', flexShrink: 0 }}
                    aria-label={`Mark option ${oi + 1} correct`}
                  />
                  <input
                    type="text"
                    id={`q${qi}-opt${oi}`}
                    className="input-premium"
                    value={opt}
                    onChange={e => updateOpt(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    aria-label={`Option ${oi + 1}`}
                  />
                  {q.correctOptionIndex === oi && (
                    <span className="badge-premium badge-premium-success" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                      ✓ Correct
                    </span>
                  )}
                </div>
              ))}
              <p className="text-muted-custom" style={{ fontSize: '11px' }}>
                Click the radio button to mark the correct answer.
              </p>
            </div>

            <div className="form-group-premium">
              <label className="label-premium" htmlFor={`q-exp-${qi}`}>Explanation (shown after attempt)</label>
              <textarea
                id={`q-exp-${qi}`}
                className="input-premium"
                value={q.explanation}
                onChange={e => updateQ(qi, 'explanation', e.target.value)}
                placeholder="Why is this the correct answer?"
                style={{ minHeight: '56px' }}
                maxLength={1000}
              />
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-premium-secondary py-2 px-4 mb-4" onClick={addQ}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
        Add Question
      </button>

      <div className="border-top pt-4">
        <button type="submit" className="btn-premium-primary py-2 px-5" disabled={saving} id="save-quiz-feedback-btn">
          {saving
            ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Saving...</>
            : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>Save Configuration</>}
        </button>
      </div>
    </form>
  );
}

/* ──────────────────────────────────────────────
   LEARNER: quiz form + results view
────────────────────────────────────────────── */
function LearnerFeedbackView({ topicId, quizQuestions }) {
  // quizQuestions are passed in from CourseViewer's activeTopic.assessment.questions if available
  const [answers, setAnswers]   = useState({});
  const [result, setResult]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr]   = useState('');

  const questions = quizQuestions || [];

  const handleSelect = (qIdx, optIdx) =>
    setAnswers(p => ({ ...p, [qIdx]: optIdx }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitErr('');
    if (Object.keys(answers).length < questions.length) {
      setSubmitErr('Please answer all questions before submitting.');
      return;
    }
    const formatted = questions.map((q, idx) => ({
      questionId: q._id || q.id || String(idx),
      selectedOptionIndex: answers[idx] ?? -1,
    }));

    setSubmitting(true);
    try {
      const res = await submitQuizFeedback(topicId, formatted);
      if (res.success !== false) setResult(res);
      else setSubmitErr(res.message || 'Submission failed.');
    } catch (err) {
      setSubmitErr(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => { setAnswers({}); setResult(null); setSubmitErr(''); };

  /* ── Results view ── */
  if (result) {
    const total = result.questions?.length || 0;
    const pct   = total ? Math.round((result.score / 100)) : result.score;

    return (
      <div className="animate-fade-in">
        {/* Score banner */}
        <div
          className="p-4 rounded-3 mb-4 d-flex align-items-center justify-content-between"
          style={{
            background: result.passed ? 'linear-gradient(135deg,#ecfdf5,#d1fae5)' : 'linear-gradient(135deg,#fef2f2,#fee2e2)',
            border: `1px solid ${result.passed ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          <div>
            <h3 className="h5 fw-bold mb-1" style={{ color: result.passed ? 'var(--success)' : 'var(--error)' }}>
              {result.passed ? '🎉 Passed!' : '❌ Not Passed'}
            </h3>
            <p className="small mb-0" style={{ color: result.passed ? '#065f46' : '#991b1b' }}>
              Score: <strong>{result.score}%</strong>
            </p>
          </div>
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
            style={{
              width: 68, height: 68, fontSize: '1.4rem', background: '#fff',
              border: `3px solid ${result.passed ? 'var(--success)' : 'var(--error)'}`,
              color: result.passed ? 'var(--success)' : 'var(--error)',
            }}
          >
            {result.score}%
          </div>
        </div>

        {/* Per-question breakdown */}
        {result.questions && result.questions.length > 0 && (
          <div className="mb-4">
            <h4 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>analytics</span>
              Question Breakdown
            </h4>
            <div className="d-flex flex-column gap-3">
              {result.questions.map((q, idx) => {
                const isCorrect = q.userAnswerIndex === q.correctOptionIndex;
                return (
                  <div
                    key={idx}
                    className="border rounded-3 p-3"
                    style={{
                      borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}`,
                      background: isCorrect ? 'var(--success-light)' : 'var(--error-light)',
                    }}
                    role="region"
                    aria-label={`Question ${idx + 1} result`}
                  >
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                      <p className="small fw-semibold text-dark mb-0" style={{ lineHeight: 1.5, flex: 1 }}>
                        <span className="text-muted me-1" style={{ fontSize: '11px' }}>Q{idx + 1}.</span>
                        {q.questionText}
                      </p>
                      <span className={`badge-premium ${isCorrect ? 'badge-premium-success' : 'badge-premium-error'} flex-shrink-0`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>

                    <div className="small mb-2">
                      <span className="text-secondary">Your answer: </span>
                      <strong className={isCorrect ? 'text-success' : 'text-danger'}>
                        {q.options?.[q.userAnswerIndex] || '—'}
                      </strong>
                    </div>
                    {!isCorrect && (
                      <div className="small mb-2">
                        <span className="text-secondary">Correct: </span>
                        <strong className="text-success">{q.options?.[q.correctOptionIndex] || '—'}</strong>
                      </div>
                    )}
                    {q.explanation && (
                      <div className="small p-2 rounded-2" style={{ background: 'rgba(255,255,255,0.7)', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <span className="fw-semibold text-secondary me-1">💡</span>
                        <span className="text-secondary">{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button type="button" className="btn-premium-secondary py-2 px-4" onClick={handleRetry}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>replay</span>
          Retry Quiz
        </button>
      </div>
    );
  }

  /* ── Quiz form ── */
  if (questions.length === 0) {
    return (
      <div className="text-center py-4">
        <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}>quiz</span>
        <p className="small text-secondary mb-0">
          No quiz questions available. The instructor has not configured feedback quiz questions for this topic yet.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Quiz feedback form">
      {submitErr && (
        <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">{submitErr}</div>
      )}
      <div className="d-flex flex-column gap-4 mb-4">
        {questions.map((q, qi) => {
          const opts = q.options || [];
          return (
            <fieldset key={qi} className="border-0 p-0 m-0">
              <legend className="small fw-semibold text-dark mb-2" style={{ fontSize: '0.925rem', lineHeight: 1.5 }}>
                <span className="text-muted me-1" style={{ fontSize: '11px' }}>Q{qi + 1}.</span>
                {q.questionText}
              </legend>
              <div className="d-flex flex-column gap-2">
                {opts.map((opt, oi) => {
                  const id = `qfb-q${qi}-o${oi}`;
                  const selected = answers[qi] === oi;
                  return (
                    <label
                      key={oi}
                      htmlFor={id}
                      className="d-flex align-items-center gap-2 p-2 rounded-2"
                      style={{
                        border: `1px solid ${selected ? 'var(--primary)' : 'var(--border-color)'}`,
                        background: selected ? 'var(--primary-light)' : '#fff',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                      }}
                    >
                      <input
                        type="radio"
                        id={id}
                        name={`qfb-q${qi}`}
                        checked={selected}
                        onChange={() => handleSelect(qi, oi)}
                        style={{ accentColor: 'var(--primary)', flexShrink: 0 }}
                      />
                      <span className="small text-dark">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      <button
        type="submit"
        className="btn-premium-primary py-2 px-5"
        disabled={submitting || Object.keys(answers).length < questions.length}
        id="submit-quiz-feedback-btn"
      >
        {submitting
          ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Submitting...</>
          : 'Submit Answers'}
      </button>
      {Object.keys(answers).length < questions.length && (
        <span className="text-muted small ms-3" style={{ fontSize: '12px' }}>
          {questions.length - Object.keys(answers).length} unanswered
        </span>
      )}
    </form>
  );
}

/* ──────────────────────────────────────────────
   MAIN: QuizFeedbackPanel
   Props:
     topicId    — current topic _id string
     user       — { role }
     assessment — activeTopic.assessment object (contains questions from Phase 1 quiz setup)
────────────────────────────────────────────── */
export default function QuizFeedbackPanel({ topicId, user, assessment }) {
  const isInstructor = user?.role === 'Instructor';
  const isLearner    = user?.role === 'Learner';

  // Learner gets questions from the topic assessment (Phase 1 quiz, NOT Phase 2 quiz-feedback)
  // Phase 2 quiz-feedback/submit uses the same questions stored via quiz-feedback/setup
  // We expose the Phase 2 quiz via learner submit — no GET needed for questions
  const assessmentQuestions = assessment?.questions || [];

  if (!topicId) {
    return (
      <div className="text-center py-4 text-secondary small">
        Select a topic to view quiz feedback.
      </div>
    );
  }

  return (
    <div className="card-premium p-4 mt-4 text-start">
      <h3 className="h5 fw-bold text-dark mb-4 d-flex align-items-center gap-2">
        <span className="material-symbols-outlined text-primary">quiz</span>
        Quiz Feedback &amp; Explanations
      </h3>

      {isInstructor && <InstructorSetupView topicId={topicId} />}

      {isLearner && (
        <LearnerFeedbackView
          topicId={topicId}
          quizQuestions={assessmentQuestions}
        />
      )}

      {!isInstructor && !isLearner && (
        <p className="text-secondary small text-center py-3">Not available for your role.</p>
      )}
    </div>
  );
}
