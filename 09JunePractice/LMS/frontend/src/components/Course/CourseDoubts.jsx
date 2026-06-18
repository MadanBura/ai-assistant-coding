import React, { useState, useEffect, useCallback } from 'react';
import { getDoubts, createDoubt, postAnswer } from '../../services/doubtService';
import DOMPurify from 'dompurify';

/* ──────────────────────────────────────────
   Single doubt thread card
────────────────────────────────────────── */
function DoubtThread({ doubt, user, onUpdated }) {
  const [expanded, setExpanded]       = useState(false);
  const [replyText, setReplyText]     = useState('');
  const [isOfficial, setIsOfficial]   = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [replyErr, setReplyErr]       = useState('');

  const isInstructor = user?.role === 'Instructor';

  const handleReply = async (e) => {
    e.preventDefault();
    setReplyErr('');
    if (replyText.trim().length < 5) { setReplyErr('Reply must be at least 5 characters.'); return; }
    setSubmitting(true);
    try {
      const res = await postAnswer(doubt.id, { content: replyText.trim(), isOfficial });
      if (res.success) {
        setReplyText('');
        setIsOfficial(false);
        onUpdated();
      }
    } catch (err) {
      setReplyErr(err.message || 'Failed to post reply.');
    } finally {
      setSubmitting(false);
    }
  };

  const officialAnswers = (doubt.answers || []).filter(a => a.isOfficial);
  const regularAnswers  = (doubt.answers || []).filter(a => !a.isOfficial);
  const sortedAnswers   = [...officialAnswers, ...regularAnswers];

  return (
    <div
      className="border rounded-3 p-3 bg-white"
      style={{ borderLeft: `4px solid ${doubt.isResolved ? 'var(--success)' : 'var(--border-color)'}` }}
      role="article"
    >
      {/* Header */}
      <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
        <span className={`badge-premium ${doubt.isResolved ? 'badge-premium-success' : 'badge-premium-warning'}`}>
          {doubt.isResolved ? '✓ Resolved' : 'Open'}
        </span>
        <span className="text-muted-custom" style={{ fontSize: '11px' }}>
          {new Date(doubt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
        <button
          type="button"
          className="btn btn-sm btn-link py-0 px-1 ms-auto text-decoration-none small"
          onClick={() => setExpanded(p => !p)}
          aria-expanded={expanded}
        >
          {expanded ? 'Hide' : `Replies (${doubt.answers?.length || 0})`}
        </button>
      </div>

      <div 
        className="small fw-semibold text-dark mb-0" 
        style={{ lineHeight: 1.5 }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(doubt.question) }}
      />

      {expanded && (
        <div className="mt-3 border-top pt-3">
          {/* Answers list */}
          {sortedAnswers.length === 0 ? (
            <p className="text-muted small mb-3">No replies yet.</p>
          ) : (
            <div className="d-flex flex-column gap-2 mb-3">
              {sortedAnswers.map((ans, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-3 small"
                  style={{
                    background: ans.isOfficial ? 'var(--success-light)' : '#f8fafc',
                    borderLeft: ans.isOfficial ? '3px solid var(--success)' : '3px solid var(--border-color)',
                  }}
                  role="listitem"
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="fw-semibold" style={{ fontSize: '12px', color: ans.isOfficial ? 'var(--success)' : 'var(--text-secondary)' }}>
                      {ans.isOfficial ? '★ Official Answer' : 'Peer Reply'}
                    </span>
                    <span className="text-muted-custom" style={{ fontSize: '10px' }}>
                      {new Date(ans.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div 
                    className="text-secondary mb-0" 
                    style={{ lineHeight: 1.5 }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ans.content) }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          <form onSubmit={handleReply} className="border-top pt-3" noValidate>
            {replyErr && <div className="alert alert-danger py-1 px-2 small mb-2" role="alert">{replyErr}</div>}
            <div className="mb-2">
              <input
                type="text"
                className="input-premium"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply... (min 5 chars)"
                maxLength={1000}
                aria-label="Reply text"
              />
            </div>
            {isInstructor && (
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`official-chk-${doubt.id}`}
                  checked={isOfficial}
                  onChange={e => setIsOfficial(e.target.checked)}
                />
                <label className="form-check-label small fw-semibold text-success" htmlFor={`official-chk-${doubt.id}`}>
                  Mark as official answer (resolves the doubt)
                </label>
              </div>
            )}
            <button
              type="submit"
              className="btn-premium-secondary py-1 px-3"
              style={{ fontSize: '0.825rem' }}
              disabled={submitting}
            >
              {submitting
                ? <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Posting...</>
                : 'Post Reply'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────── */
export default function CourseDoubts({ topicId, user }) {
  const [doubts, setDoubts]       = useState(undefined); // undefined=loading
  const [fetchErr, setFetchErr]   = useState('');
  const [question, setQuestion]   = useState('');
  const [posting, setPosting]     = useState(false);
  const [postErr, setPostErr]     = useState('');
  const [postOk, setPostOk]       = useState('');

  const isLearner    = user?.role === 'Learner';
  const isInstructor = user?.role === 'Instructor';

  const load = useCallback(async () => {
    if (!topicId) return;
    setFetchErr('');
    setDoubts(undefined);
    try {
      const res = await getDoubts(topicId);
      setDoubts(res.data || []);
    } catch (err) {
      setFetchErr(err.message);
      setDoubts([]);
    }
  }, [topicId]);

  useEffect(() => { load(); }, [load]);

  const handleAsk = async (e) => {
    e.preventDefault();
    setPostErr(''); setPostOk('');
    if (question.trim().length < 5) { setPostErr('Question must be at least 5 characters.'); return; }
    setPosting(true);
    try {
      const res = await createDoubt(topicId, question.trim());
      if (res.success) {
        setPostOk('Your question was posted!');
        setQuestion('');
        load();
      }
    } catch (err) {
      setPostErr(err.message || 'Failed to post question.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="card-premium p-4 mt-4 text-start">
      <h3 className="h5 fw-bold text-dark mb-4 d-flex align-items-center gap-2">
        <span className="material-symbols-outlined text-primary">live_help</span>
        Topic Q&amp;A &amp; Doubts
      </h3>

      {/* Learner: ask a question */}
      {isLearner && (
        <form onSubmit={handleAsk} className="mb-4 pb-4 border-bottom" noValidate>
          <h4 className="h6 fw-bold mb-3 text-secondary">Ask a Question</h4>
          {postErr && <div className="alert alert-danger py-2 px-3 small mb-2" role="alert">{postErr}</div>}
          {postOk  && <div className="alert alert-success py-2 px-3 small mb-2" role="status">{postOk}</div>}
          <div className="mb-3">
            <label className="label-premium" htmlFor="doubt-question-input">Your question *</label>
            <textarea
              id="doubt-question-input"
              className="input-premium"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Describe your doubt in detail... (5–500 chars)"
              style={{ minHeight: '80px' }}
              maxLength={500}
              required
            />
            <span className="text-muted-custom" style={{ fontSize: '11px' }}>{question.length}/500</span>
          </div>
          <button type="submit" className="btn-premium-primary py-2 px-4" disabled={posting} id="post-doubt-btn">
            {posting
              ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Posting...</>
              : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>Post Question</>}
          </button>
        </form>
      )}

      {/* Doubts list */}
      {doubts === undefined ? (
        <div className="py-3 text-center">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="small text-secondary mt-2 mb-0">Loading questions...</p>
        </div>
      ) : fetchErr ? (
        <div className="alert alert-danger py-2 px-3 small" role="alert">
          {fetchErr} <button type="button" className="btn btn-sm btn-link py-0 ms-1" onClick={load}>Retry</button>
        </div>
      ) : doubts.length === 0 ? (
        <div className="text-center py-4">
          <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>forum</span>
          <p className="small text-secondary mb-0">No questions posted for this topic yet.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3" role="feed" aria-label="Topic Q&A">
          {doubts.map(d => (
            <DoubtThread key={d.id} doubt={d} user={user} onUpdated={load} />
          ))}
        </div>
      )}
    </div>
  );
}
