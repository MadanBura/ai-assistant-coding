import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { createBadge } from '../../services/gamificationService';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TRIGGER_TYPES = [
  { value: 'CourseCompletion', label: '🎓 Course Completion — when learner completes 100% of the course' },
  { value: 'PerfectQuizzes',   label: '💯 Perfect Quiz — when learner scores 100% on a quiz' },
  { value: 'FastTrack',        label: '⚡ Fast Track — when learner completes all modules within 7 days' },
];

const GRADIENTS = [
  'linear-gradient(135deg,#FFD700,#FFA500)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fd7043,#ff8a65)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
];

/* ────────────────────────
   Badge display card
──────────────────────── */
function BadgeCard({ badge }) {
  const g = GRADIENTS[(badge.title?.charCodeAt(0) || 0) % GRADIENTS.length];
  return (
    <div className="card-premium p-3 text-center" role="article" aria-label={badge.title}>
      {badge.iconUrl ? (
        <img src={badge.iconUrl} alt={badge.title} className="rounded-circle mx-auto d-block mb-3"
          style={{ width: 64, height: 64, objectFit: 'cover', border: '3px solid var(--border-color)' }}
          onError={e => { e.target.src = ''; e.target.style.display = 'none'; }} />
      ) : (
        <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: 64, height: 64, background: g, boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }}>
          <span className="material-symbols-outlined text-white" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>
            military_tech
          </span>
        </div>
      )}
      <h4 className="small fw-bold text-dark mb-1">{badge.title}</h4>
      <p className="text-muted-custom mb-2" style={{ fontSize: '11px', lineHeight: 1.4, minHeight: '30px' }}>
        {badge.description || '—'}
      </p>
      <span className="badge-premium badge-premium-primary" style={{ fontSize: '10px' }}>
        {TRIGGER_TYPES.find(t => t.value === badge.triggerType)?.label.split('—')[0].trim() || badge.triggerType}
      </span>
    </div>
  );
}

/* ────────────────────────
   Create form
──────────────────────── */
function CreateBadgeForm({ enrolledCourses, onCreated }) {
  const [courseId, setCourseId]       = useState('');
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl]         = useState('');
  const [triggerType, setTriggerType] = useState('CourseCompletion');
  const [saving, setSaving]           = useState(false);
  const [saveErr, setSaveErr]         = useState('');
  const [saveOk, setSaveOk]           = useState('');

  const validate = () => {
    if (!courseId)                    return 'Please select a course.';
    if (title.trim().length < 3)      return 'Title must be at least 3 characters.';
    if (title.trim().length > 50)     return 'Title must be at most 50 characters.';
    if (!iconUrl.trim())              return 'Icon URL is required (enter a valid https:// image URL).';
    if (!/^https?:\/\/.+/.test(iconUrl.trim())) return 'Icon URL must start with http:// or https://';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveErr(''); setSaveOk('');
    const err = validate();
    if (err) { setSaveErr(err); return; }

    setSaving(true);
    try {
      const res = await createBadge({
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        iconUrl: iconUrl.trim(),
        triggerType,
      });
      if (res.success) {
        setSaveOk(`Badge "${title}" created!`);
        setTitle(''); setDescription(''); setIconUrl(''); setCourseId(''); setTriggerType('CourseCompletion');
        if (onCreated) onCreated(res.data);
      }
    } catch (err) {
      setSaveErr(err.message || 'Failed to create badge.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="card-premium p-4" aria-label="Create badge form">
      <h3 className="h6 fw-bold text-dark mb-4 d-flex align-items-center gap-2">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>add_circle</span>
        Create New Badge
      </h3>

      {saveErr && <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">{saveErr}</div>}
      {saveOk  && <div className="alert alert-success py-2 px-3 small mb-3" role="status">{saveOk}</div>}

      <div className="form-group-premium">
        <label className="label-premium" htmlFor="badge-course-select">Course *</label>
        <select id="badge-course-select" className="input-premium" value={courseId} onChange={e => setCourseId(e.target.value)} required>
          <option value="">— Select a course you own —</option>
          {enrolledCourses.map(c => (
            <option key={c.id || c._id} value={c.id || c._id}>{c.title}</option>
          ))}
        </select>
      </div>

      <div className="form-group-premium">
        <label className="label-premium" htmlFor="badge-title-input">Badge Title * (3–50 chars)</label>
        <input id="badge-title-input" type="text" className="input-premium" value={title}
          onChange={e => setTitle(e.target.value)} placeholder="e.g. Speed Demon, Quiz Genius" maxLength={50} required />
      </div>

      <div className="form-group-premium">
        <label className="label-premium" htmlFor="badge-desc-input">Description (10–250 chars)</label>
        <textarea id="badge-desc-input" className="input-premium" value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe what earns this badge..." style={{ minHeight: '72px' }} maxLength={250} />
      </div>

      <div className="form-group-premium">
        <label className="label-premium" htmlFor="badge-icon-url">Icon URL * (valid https:// image)</label>
        <input id="badge-icon-url" type="url" className="input-premium" value={iconUrl}
          onChange={e => setIconUrl(e.target.value)} placeholder="https://example.com/badge.png" />
        {iconUrl && /^https?:\/\/.+/.test(iconUrl) && (
          <img src={iconUrl} alt="preview" className="mt-2 rounded" style={{ height: 48, objectFit: 'contain' }}
            onError={e => e.target.style.display = 'none'} />
        )}
      </div>

      <div className="form-group-premium">
        <label className="label-premium" htmlFor="badge-trigger-select">Trigger Type *</label>
        <select id="badge-trigger-select" className="input-premium" value={triggerType}
          onChange={e => setTriggerType(e.target.value)}>
          {TRIGGER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <button type="submit" className="btn-premium-primary py-2 px-5 mt-2" disabled={saving} id="create-badge-btn">
        {saving
          ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Creating...</>
          : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>Create Badge</>}
      </button>
    </form>
  );
}

/* ────────────────────────
   Main page
──────────────────────── */
export default function InstructorBadgeManagement() {
  const [activeView, setActiveView]       = useState('list');
  const [ownedCourses, setOwnedCourses]   = useState([]);
  
  const auth = useAuth();
  const authUser = auth?.user || null;

  const [badges, setBadges]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [fetchErr, setFetchErr]           = useState('');

  const load = async () => {
    setLoading(true); setFetchErr('');
    try {
      // Fetch all courses and filter for instructor
      const coursesRes = await apiRequest('/courses').catch(() => ({ data: [] }));
      let courses = coursesRes.data || [];
      if (authUser?.id) {
        courses = courses.filter(c => c.instructorId === authUser.id);
      }
      setOwnedCourses(courses);

      // Collect all badges from each course
      const badgesRes = await apiRequest('/gamification/instructor/badges').catch(() => ({ data: [] }));
      setBadges(badgesRes.data || []);
    } catch (err) {
      setFetchErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreated = (badge) => {
    setBadges(p => [badge, ...p]);
    setActiveView('list');
  };

  return (
    <div className="min-vh-100 d-flex text-start" style={{ backgroundColor: 'var(--bg-neutral)' }}>
      <style>{`
        .badge-canvas { flex: 1; margin-left: 260px; padding: 40px; min-height: 100vh; }
        @media (max-width: 768px) { .badge-canvas { margin-left: 0; padding: 20px; } }
      `}</style>

      <Sidebar />

      <div className="badge-canvas">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-5">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40, background: 'var(--primary-light)' }}>
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>
                  military_tech
                </span>
              </span>
              <h1 className="h4 fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
                Gamification &amp; Badges
              </h1>
            </div>
            <p className="text-secondary small mb-0">
              Create achievement badges tied to your courses. They are auto-awarded when learners meet the trigger criteria.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className={activeView === 'list' ? 'btn-premium-primary py-2 px-4' : 'btn-premium-secondary py-2 px-4'}
              onClick={() => setActiveView('list')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>list</span>
              My Badges
            </button>
            <button
              type="button"
              className={activeView === 'create' ? 'btn-premium-primary py-2 px-4' : 'btn-premium-secondary py-2 px-4'}
              onClick={() => setActiveView('create')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              New Badge
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-5">
          {[
            { label: 'Badges Created',      value: badges.length,    icon: 'military_tech',  color: 'var(--primary)' },
            { label: 'Courses Owned',       value: ownedCourses.length, icon: 'menu_book',   color: 'var(--success)' },
            { label: 'Trigger Types Active', value: new Set(badges.map(b => b.triggerType)).size, icon: 'auto_awesome', color: 'var(--warning)' },
          ].map(s => (
            <div key={s.label} className="col-sm-4">
              <div className="card-premium-static d-flex align-items-center gap-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 44, height: 44, background: `${s.color}15` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: s.color, fontVariationSettings: "'FILL' 1" }}>
                    {s.icon}
                  </span>
                </div>
                <div>
                  <div className="h5 fw-bold text-dark mb-0">{s.value}</div>
                  <div className="text-muted-custom">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        {activeView === 'create' ? (
          <div style={{ maxWidth: '640px' }}>
            {loading ? (
              <div className="py-3 text-center">
                <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
              </div>
            ) : (
              <CreateBadgeForm enrolledCourses={ownedCourses} onCreated={handleCreated} />
            )}
          </div>
        ) : (
          <>
            {fetchErr && (
              <div className="alert alert-danger py-2 px-3 small mb-4" role="alert">
                {fetchErr}
                <button type="button" className="btn btn-sm btn-link py-0 ms-2" onClick={load}>Retry</button>
              </div>
            )}
            {badges.length === 0 ? (
              <div className="card-premium text-center py-5">
                <span className="material-symbols-outlined d-block mb-3" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>
                  military_tech
                </span>
                <h3 className="h6 fw-bold text-dark mb-2">No Badges Created Yet</h3>
                <p className="text-secondary small mb-4" style={{ maxWidth: '360px', margin: '0 auto 1.5rem' }}>
                  Create your first badge to reward learners for completing milestones.
                </p>
                <button type="button" className="btn-premium-primary py-2 px-4" onClick={() => setActiveView('create')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                  Create First Badge
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {badges.map((badge, idx) => (
                  <div key={badge.id || idx} className="col-sm-6 col-md-4 col-lg-3">
                    <BadgeCard badge={badge} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
