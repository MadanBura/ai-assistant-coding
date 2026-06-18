import React, { useState, useEffect, useCallback } from 'react';
import { createAnnouncement, getAnnouncements } from '../../services/announcementService';

const PRIORITY_STYLES = {
  Urgent:  { badge: 'bg-danger text-white',       icon: 'priority_high',   border: '#ef4444' },
  Warning: { badge: 'bg-warning text-dark',        icon: 'warning',         border: '#f59e0b' },
  Info:    { badge: 'bg-info bg-opacity-25 text-info', icon: 'info',        border: '#3b82f6' },
};

function AnnouncementCard({ ann, onDismiss }) {
  const style = PRIORITY_STYLES[ann.priority] || PRIORITY_STYLES.Info;
  return (
    <div
      className="p-3 rounded-3 bg-white position-relative"
      style={{ borderLeft: `4px solid ${style.border}`, border: '1px solid var(--border-color)' }}
      role="article"
      aria-label={`${ann.priority} announcement: ${ann.title}`}
    >
      <div className="d-flex align-items-start gap-2 mb-2">
        <span
          className={`badge rounded-pill small ${style.badge} d-flex align-items-center gap-1`}
          style={{ fontSize: '11px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{style.icon}</span>
          {ann.priority}
        </span>
        <span className="text-muted-custom ms-auto me-4" style={{ fontSize: '11px' }}>
          {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        {onDismiss && (
          <button
            type="button"
            className="btn-close position-absolute"
            style={{ top: '12px', right: '12px', fontSize: '0.7rem' }}
            onClick={() => onDismiss(ann.id)}
            aria-label="Dismiss announcement"
          />
        )}
      </div>
      <h4 className="h6 fw-bold text-dark mb-1">{ann.title}</h4>
      <p className="small text-secondary mb-0" style={{ lineHeight: 1.6 }}>{ann.content}</p>
    </div>
  );
}

export default function CourseAnnouncements({ courseId, user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [fetchError, setFetchError]       = useState('');

  // Instructor create form
  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('Info');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError]   = useState('');
  const [postSuccess, setPostSuccess] = useState('');

  // Dismiss (session-level)
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(`ann_dismissed_${courseId}`) || '[]'); }
    catch { return []; }
  });

  const isInstructor = user?.role === 'Instructor';

  const load = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setFetchError('');
    try {
      const res = await getAnnouncements(courseId);
      if (res.success) setAnnouncements(res.data || []);
    } catch (err) {
      setFetchError(err.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const handleDismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    try { sessionStorage.setItem(`ann_dismissed_${courseId}`, JSON.stringify(next)); } catch {}
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setPostError('');
    setPostSuccess('');

    if (title.trim().length < 3)   { setPostError('Title must be at least 3 characters.'); return; }
    if (content.trim().length < 10) { setPostError('Content must be at least 10 characters.'); return; }

    setPosting(true);
    try {
      const res = await createAnnouncement(courseId, { title: title.trim(), content: content.trim(), priority });
      if (res.success) {
        setPostSuccess('Announcement posted successfully.');
        setTitle(''); setContent(''); setPriority('Info');
        load();
      }
    } catch (err) {
      setPostError(err.message || 'Failed to post announcement.');
    } finally {
      setPosting(false);
    }
  };

  const visible = announcements.filter(a => !dismissed.includes(a.id));

  return (
    <div className="card-premium p-4 mt-4 text-start">
      <h3 className="h5 fw-bold text-dark mb-4 d-flex align-items-center gap-2">
        <span className="material-symbols-outlined text-primary">campaign</span>
        Course Announcements
      </h3>

      {/* Instructor: create form */}
      {isInstructor && (
        <form onSubmit={handlePost} className="mb-4 pb-4 border-bottom" noValidate>
          <h4 className="h6 fw-bold text-secondary mb-3">Post New Announcement</h4>

          {postError   && <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">{postError}</div>}
          {postSuccess  && <div className="alert alert-success py-2 px-3 small mb-3" role="status">{postSuccess}</div>}

          <div className="form-group-premium">
            <label className="label-premium" htmlFor="ann-title-input">Title *</label>
            <input
              id="ann-title-input"
              type="text"
              className="input-premium"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Exam schedule update"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group-premium">
            <label className="label-premium" htmlFor="ann-content-input">Content *</label>
            <textarea
              id="ann-content-input"
              className="input-premium"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write the full announcement text..."
              style={{ minHeight: '80px' }}
              maxLength={1000}
              required
            />
            <span className="text-muted-custom" style={{ fontSize: '11px' }}>{content.length}/1000</span>
          </div>

          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="label-premium" htmlFor="ann-priority-select">Priority Level</label>
              <select
                id="ann-priority-select"
                className="input-premium"
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="col-md-6">
              <button
                type="submit"
                className="btn-premium-primary w-100 py-2"
                disabled={posting}
                id="post-announcement-btn"
              >
                {posting
                  ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Posting...</>
                  : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>Post Announcement</>}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Loading */}
      {loading && (
        <div className="py-3 text-center">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary small mt-2 mb-0">Loading announcements...</p>
        </div>
      )}

      {/* Fetch error */}
      {!loading && fetchError && (
        <div className="alert alert-danger py-2 px-3 small" role="alert">
          {fetchError}
          <button type="button" className="btn btn-sm btn-link py-0 ms-2" onClick={load}>Retry</button>
        </div>
      )}

      {/* Announcements list */}
      {!loading && !fetchError && (
        <>
          {visible.length === 0 ? (
            <div className="text-center py-4" role="status">
              <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>campaign</span>
              <p className="small text-secondary mb-0">No active announcements for this course.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3" role="feed" aria-label="Course announcements">
              {visible.map(ann => (
                <AnnouncementCard
                  key={ann.id}
                  ann={ann}
                  onDismiss={!isInstructor ? handleDismiss : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
