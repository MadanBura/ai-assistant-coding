import React, { useState, useEffect, useCallback } from 'react';
import {
  getAssignmentByTopic,
  createAssignment,
  getSubmission,
  getSubmissions,
  submitAssignment,
  gradeSubmission,
} from '../../services/assignmentService';

/* ────────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cls =
    status === 'Graded'    ? 'badge-premium-success' :
    status === 'Submitted' ? 'badge-premium-primary'  :
                             'badge-premium-warning';
  return <span className={`badge-premium ${cls}`}>{status}</span>;
}

function FileLink({ url, label }) {
  if (!url) return null;
  const href = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${url}`;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="d-flex align-items-center gap-1 small text-decoration-none">
      <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>open_in_new</span>
      {label}
    </a>
  );
}

/* ────────────────────────────────────────────────
   Skeleton loader
───────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="d-flex flex-column gap-3 py-2" aria-busy="true">
      {[1, 2].map(i => (
        <div key={i} className="skeleton-shimmer rounded-3" style={{ height: '72px' }} />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────
   LEARNER: submission panel
───────────────────────────────────────────────── */
function LearnerPanel({ assignment }) {
  const [submission, setSubmission] = useState(undefined); // undefined=loading
  const [loadErr, setLoadErr]       = useState('');
  const [file, setFile]             = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr]       = useState('');
  const [formOk, setFormOk]         = useState('');

  const load = useCallback(async () => {
    setLoadErr('');
    try {
      const res = await getSubmission(assignment.id);
      setSubmission(res.data || null);
    } catch (err) {
      setLoadErr(err.message);
      setSubmission(null);
    }
  }, [assignment.id]);

  useEffect(() => { load(); }, [load]);

  const pastDeadline = assignment.dueDate && new Date() > new Date(assignment.dueDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr(''); setFormOk('');
    if (!file) { setFormErr('Please choose a file.'); return; }
    const fd = new FormData();
    fd.append('submissionFile', file);
    setSubmitting(true);
    try {
      const res = await submitAssignment(assignment.id, fd);
      if (res.success) {
        setFormOk('Submitted successfully!');
        setFile(null);
        e.target.reset();
        load();
      }
    } catch (err) {
      setFormErr(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submission === undefined) return <Skeleton />;
  if (loadErr) return (
    <div className="alert alert-danger py-2 px-3 small" role="alert">
      {loadErr} <button type="button" className="btn btn-sm btn-link py-0 ms-1" onClick={load}>Retry</button>
    </div>
  );

  return (
    <div>
      <h4 className="h6 fw-bold mb-3">Your Submission</h4>

      {/* Existing submission */}
      {submission && (
        <div className="border rounded-3 p-3 mb-3 bg-white">
          <div className="d-flex align-items-center gap-2 mb-2">
            <StatusBadge status={submission.status} />
            <span className="text-muted-custom" style={{ fontSize: '11px' }}>
              Submitted {new Date(submission.submittedAt).toLocaleString()}
            </span>
          </div>
          <FileLink url={submission.submittedFileUrl} label="View submitted file" />

          {submission.status === 'Graded' && (
            <div className="border-top pt-3 mt-3">
              <p className="small mb-1 text-dark fw-semibold">
                Score: <span style={{ fontSize: '1.1rem', color: 'var(--success)' }}>{submission.grade}</span>
                <span className="text-muted fw-normal"> / {assignment.maxScore}</span>
              </p>
              {submission.feedback && (
                <p className="small text-secondary mb-2 bg-light p-2 rounded">
                  💬 {submission.feedback}
                </p>
              )}
              <FileLink url={submission.feedbackFileUrl} label="Download feedback file" />
            </div>
          )}
        </div>
      )}

      {/* Upload / re-upload form */}
      {pastDeadline && !submission ? (
        <div className="alert alert-danger py-2 px-3 small" role="alert">
          <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '16px' }}>lock_clock</span>
          Submission deadline has passed.
        </div>
      ) : submission?.status !== 'Graded' ? (
        <form onSubmit={handleSubmit} noValidate>
          {formErr && <div className="alert alert-danger py-2 px-3 small mb-2" role="alert">{formErr}</div>}
          {formOk  && <div className="alert alert-success py-2 px-3 small mb-2" role="status">{formOk}</div>}

          <label className="label-premium" htmlFor="learner-file-input">
            {submission ? 'Resubmit file' : 'Upload submission file'}
          </label>
          <input
            id="learner-file-input"
            type="file"
            className="form-control form-control-sm mb-2"
            accept=".pdf,.zip,.doc,.docx"
            onChange={e => setFile(e.target.files?.[0] || null)}
            required
          />
          <p className="text-muted-custom mb-3" style={{ fontSize: '11px' }}>
            Accepted: PDF, ZIP, DOC, DOCX — max 10 MB
          </p>
          <button
            type="submit"
            className="btn-premium-primary py-2 px-4"
            disabled={submitting}
            id="submit-assignment-btn"
          >
            {submitting
              ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Uploading...</>
              : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload_file</span>{submission ? 'Resubmit' : 'Submit Assignment'}</>}
          </button>
        </form>
      ) : null}
    </div>
  );
}

/* ────────────────────────────────────────────────
   INSTRUCTOR: submissions list + grading panel
───────────────────────────────────────────────── */
function InstructorPanel({ assignment }) {
  const [submissions, setSubmissions] = useState(undefined);
  const [loadErr, setLoadErr]         = useState('');
  const [grading, setGrading]         = useState(null); // active submission
  const [gradeScore, setGradeScore]   = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [feedbackFile, setFeedbackFile]   = useState(null);
  const [saving, setSaving]           = useState(false);
  const [saveErr, setSaveErr]         = useState('');
  const [saveOk, setSaveOk]           = useState('');

  const load = useCallback(async () => {
    setLoadErr('');
    try {
      const res = await getSubmissions(assignment.id);
      setSubmissions(res.data || []);
    } catch (err) {
      setLoadErr(err.message);
      setSubmissions([]);
    }
  }, [assignment.id]);

  useEffect(() => { load(); }, [load]);

  const openGrade = (sub) => {
    setGrading(sub);
    setGradeScore(sub.grade !== undefined && sub.grade !== null ? String(sub.grade) : '');
    setGradeFeedback(sub.feedback || '');
    setFeedbackFile(null);
    setSaveErr(''); setSaveOk('');
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    setSaveErr(''); setSaveOk('');
    const g = Number(gradeScore);
    if (isNaN(g) || g < 0 || g > assignment.maxScore) {
      setSaveErr(`Grade must be 0–${assignment.maxScore}.`); return;
    }
    if (!gradeFeedback.trim()) { setSaveErr('Feedback is required.'); return; }

    const fd = new FormData();
    fd.append('grade', g);
    fd.append('feedback', gradeFeedback.trim());
    if (feedbackFile) fd.append('feedbackFile', feedbackFile);

    setSaving(true);
    try {
      const res = await gradeSubmission(grading.id, fd);
      if (res.success) {
        setSaveOk('Grade saved!');
        setGrading(null);
        load();
      }
    } catch (err) {
      setSaveErr(err.message || 'Failed to grade.');
    } finally {
      setSaving(false);
    }
  };

  if (submissions === undefined) return <Skeleton />;
  if (loadErr) return (
    <div className="alert alert-danger py-2 px-3 small" role="alert">
      {loadErr} <button type="button" className="btn btn-sm btn-link py-0 ms-1" onClick={load}>Retry</button>
    </div>
  );

  return (
    <div>
      <h4 className="h6 fw-bold mb-3 text-secondary">
        Student Submissions ({submissions.length})
      </h4>

      {submissions.length === 0 ? (
        <div className="text-center py-3 text-secondary small border rounded-3 bg-white">
          No submissions received yet.
        </div>
      ) : (
        <div className="table-responsive bg-white border rounded-3 overflow-hidden mb-4">
          <table className="table table-hover align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th>Student</th>
                <th>Submitted</th>
                <th>File</th>
                <th>Status</th>
                <th>Grade</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id}>
                  <td>
                    <div className="fw-semibold">{sub.studentId?.name || 'Unknown'}</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>{sub.studentId?.email}</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                  <td><FileLink url={sub.submittedFileUrl} label="View" /></td>
                  <td><StatusBadge status={sub.status} /></td>
                  <td className="fw-bold">
                    {sub.grade !== undefined && sub.grade !== null
                      ? `${sub.grade}/${assignment.maxScore}` : '—'}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary py-0 px-2"
                      onClick={() => openGrade(sub)}
                    >
                      {sub.status === 'Graded' ? 'Re-grade' : 'Grade'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grading drawer */}
      {grading && (
        <div className="border rounded-3 p-3 bg-white" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
            <h5 className="small fw-bold mb-0">Grade: {grading.studentId?.name}</h5>
            <button type="button" className="btn-close" onClick={() => setGrading(null)} />
          </div>
          {saveErr && <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">{saveErr}</div>}
          {saveOk  && <div className="alert alert-success py-2 px-3 small mb-3" role="status">{saveOk}</div>}
          <form onSubmit={handleGrade} noValidate>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="label-premium" htmlFor="grade-score-input">Score (0–{assignment.maxScore}) *</label>
                <input
                  id="grade-score-input"
                  type="number"
                  className="input-premium"
                  value={gradeScore}
                  onChange={e => setGradeScore(e.target.value)}
                  min="0"
                  max={assignment.maxScore}
                  required
                />
              </div>
              <div className="col-md-8">
                <label className="label-premium" htmlFor="grade-feedback-input">Feedback *</label>
                <input
                  id="grade-feedback-input"
                  type="text"
                  className="input-premium"
                  value={gradeFeedback}
                  onChange={e => setGradeFeedback(e.target.value)}
                  placeholder="e.g. Excellent work on the API design"
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="label-premium" htmlFor="grade-feedback-file">Feedback file (optional)</label>
              <input
                id="grade-feedback-file"
                type="file"
                className="form-control form-control-sm"
                accept=".pdf,.zip,.doc,.docx"
                onChange={e => setFeedbackFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn-premium-primary py-2 px-4" disabled={saving} id="save-grade-btn">
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Saving...</>
                  : 'Save Grade'}
              </button>
              <button type="button" className="btn-premium-secondary py-2 px-4" onClick={() => setGrading(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────
   INSTRUCTOR: create assignment form
───────────────────────────────────────────────── */
function CreateAssignmentForm({ topicId, onCreated }) {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [maxScore, setMaxScore]     = useState(100);
  const [dueDate, setDueDate]       = useState('');
  const [referenceFileUrl, setRefUrl] = useState('');
  const [creating, setCreating]     = useState(false);
  const [createErr, setCreateErr]   = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateErr('');
    if (title.trim().length < 3) { setCreateErr('Title must be at least 3 characters.'); return; }
    setCreating(true);
    try {
      const res = await createAssignment({
        topicId,
        title: title.trim(),
        description: description.trim() || undefined,
        maxScore: Number(maxScore),
        dueDate: dueDate || undefined,
        referenceFileUrl: referenceFileUrl.trim() || undefined,
      });
      if (res.success) onCreated(res.data);
    } catch (err) {
      setCreateErr(err.message || 'Failed to create assignment.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="border rounded-3 p-3 bg-light" noValidate>
      <h4 className="h6 fw-bold mb-3 text-secondary">Configure Assignment</h4>
      {createErr && <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">{createErr}</div>}

      <div className="form-group-premium">
        <label className="label-premium" htmlFor="assign-title">Title *</label>
        <input id="assign-title" type="text" className="input-premium" value={title}
          onChange={e => setTitle(e.target.value)} placeholder="e.g. Build REST API" maxLength={100} required />
      </div>

      <div className="form-group-premium">
        <label className="label-premium" htmlFor="assign-desc">Description</label>
        <textarea id="assign-desc" className="input-premium" value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Grading rubric and requirements..." style={{ minHeight: '80px' }} maxLength={1000} />
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <label className="label-premium" htmlFor="assign-score">Max Score</label>
          <input id="assign-score" type="number" className="input-premium" value={maxScore}
            onChange={e => setMaxScore(e.target.value)} min="1" max="1000" required />
        </div>
        <div className="col-md-8">
          <label className="label-premium" htmlFor="assign-due">Due Date (optional)</label>
          <input id="assign-due" type="datetime-local" className="input-premium" value={dueDate}
            onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>

      <div className="form-group-premium mt-3">
        <label className="label-premium" htmlFor="assign-ref">Reference File URL (optional)</label>
        <input id="assign-ref" type="url" className="input-premium" value={referenceFileUrl}
          onChange={e => setRefUrl(e.target.value)} placeholder="https://..." />
      </div>

      <button type="submit" className="btn-premium-primary py-2 px-5 mt-2" disabled={creating} id="create-assignment-btn">
        {creating
          ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Creating...</>
          : 'Create Assignment'}
      </button>
    </form>
  );
}

/* ────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────── */
export default function CourseAssignments({ topicId, user }) {
  const [assignment, setAssignment] = useState(undefined); // undefined=loading
  const [fetchErr, setFetchErr]     = useState('');

  const isInstructor = user?.role === 'Instructor';

  const load = useCallback(async () => {
    if (!topicId) return;
    setFetchErr('');
    setAssignment(undefined);
    try {
      const res = await getAssignmentByTopic(topicId);
      setAssignment(res.data || null);
    } catch (err) {
      setFetchErr(err.message);
      setAssignment(null);
    }
  }, [topicId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="card-premium p-4 mt-4 text-start">
      <h3 className="h5 fw-bold text-dark mb-4 d-flex align-items-center gap-2">
        <span className="material-symbols-outlined text-primary">assignment</span>
        Topic Assignment
      </h3>

      {assignment === undefined && <Skeleton />}

      {fetchErr && (
        <div className="alert alert-danger py-2 px-3 small" role="alert">
          {fetchErr} <button type="button" className="btn btn-sm btn-link py-0 ms-1" onClick={load}>Retry</button>
        </div>
      )}

      {assignment === undefined ? null : assignment === null ? (
        /* No assignment configured */
        isInstructor ? (
          <CreateAssignmentForm topicId={topicId} onCreated={a => setAssignment(a)} />
        ) : (
          <div className="text-center py-4 text-secondary small">
            <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>info</span>
            No assignment configured for this topic yet.
          </div>
        )
      ) : (
        /* Assignment exists */
        <div>
          {/* Assignment info header */}
          <div className="border rounded-3 p-3 mb-4 bg-light">
            <h4 className="h6 fw-bold text-dark mb-1">{assignment.title}</h4>
            {assignment.description && (
              <p className="small text-secondary mb-2" style={{ whiteSpace: 'pre-line' }}>{assignment.description}</p>
            )}
            <div className="d-flex flex-wrap gap-3 small text-secondary">
              <span>
                <span className="material-symbols-outlined align-middle me-1 text-primary" style={{ fontSize: '16px' }}>stars</span>
                Max Score: <strong>{assignment.maxScore}</strong>
              </span>
              {assignment.dueDate && (
                <span>
                  <span className="material-symbols-outlined align-middle me-1 text-primary" style={{ fontSize: '16px' }}>calendar_today</span>
                  Due: <strong>{new Date(assignment.dueDate).toLocaleString()}</strong>
                </span>
              )}
            </div>
            {assignment.referenceFileUrl && (
              <div className="mt-2">
                <FileLink url={assignment.referenceFileUrl} label="View reference / rubric" />
              </div>
            )}
          </div>

          {isInstructor ? (
            <InstructorPanel assignment={assignment} />
          ) : (
            <LearnerPanel assignment={assignment} />
          )}
        </div>
      )}
    </div>
  );
}
