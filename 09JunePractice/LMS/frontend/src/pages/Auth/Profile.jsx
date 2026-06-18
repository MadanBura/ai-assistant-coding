import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import logo from '../../assets/logo.svg';
import BadgeGallery from '../../components/Course/BadgeGallery';

export default function Profile({ currentUser = null }) {
  let authUser = null;
  let setUser = () => {};
  try {
    const auth = useAuth();
    authUser = auth.user;
    setUser = auth.setUser;
  } catch (e) {
    // Auth context missing in tests
  }
  
  // Resolve active user context
  const activeUser = currentUser || authUser || {};

  // Form states
  const [name, setName] = useState(activeUser.name || '');
  const [email, setEmail] = useState(activeUser.email || '');
  const [role, setRole] = useState(activeUser.role || 'Learner');

  // Active Tab: 'settings' or 'certificates'
  const [activeTab, setActiveTab] = useState('settings');

  // Enrolled courses state (for completed course listings)
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Status flags
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Sync state if props or auth user updates
  useEffect(() => {
    if (activeUser) {
      setName((prev) => prev || activeUser.name || '');
      setEmail((prev) => prev || activeUser.email || '');
      setRole((prev) => prev || activeUser.role || 'Learner');
    }
  }, [activeUser]);

  // Fetch enrolled courses to filter completed ones
  useEffect(() => {
    if (activeUser && activeUser.role === 'Learner') {
      const fetchCourses = async () => {
        setLoadingCourses(true);
        try {
          const response = await fetch('/courses/enrolled', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            },
          });
          if (response.ok) {
            const result = await response.json();
            console.log('[DEBUG-FRONTEND] Profile enrolled courses result:', result);
            if (result.success && result.data) {
              // Filter completed courses (progress is 100% and finalExamPassed)
              const completed = result.data.filter(
                (item) => item.progressPercent === 100 && item.finalExamPassed
              );
              console.log('[DEBUG-FRONTEND] Profile completed courses:', completed);
              setCompletedCourses(completed);
            }
          }
        } catch (err) {
          console.error('Failed to load completed courses:', err);
        } finally {
          setLoadingCourses(false);
        }
      };
      fetchCourses();
    }
  }, [activeUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMsg(null);
    setValidationError('');

    // Client-side validations
    if (!name.trim()) {
      setValidationError('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ name, email }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSuccessMsg('Profile updated successfully!');
        if (result.data) {
          setUser(result.data);
          setName(result.data.name || '');
          setEmail(result.data.email || '');
          setRole(result.data.role || 'Learner');
        }
      } else {
        throw new Error(result.message || 'Profile save failed');
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        setSubmitError('Network error. Please try again.');
      } else {
        setSubmitError(err.message || 'Profile save failed');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Download PDF certificate callback
  const handleDownloadCertificate = async (courseId, courseTitle) => {
    setDownloadingId(courseId);
    try {
      const response = await fetch(`/courses/${courseId}/certificate`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate or retrieve certificate PDF.');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Could not download certificate.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-vh-100 d-flex text-start animate-fade-in" style={{ backgroundColor: 'var(--bg-neutral)', width: '100%' }}>
      <style>{`
        .main-canvas-premium {
          flex: 1;
          margin-left: 260px; /* Offset for fixed sidebar */
          padding: 40px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          min-height: 100vh;
        }
        .profile-container {
          width: 100%;
          max-width: 600px;
          margin-top: 20px;
        }
        .profile-nav-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }
        .profile-tab-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.95rem;
          padding: 8px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .profile-tab-btn:hover {
          color: var(--text-primary);
          background-color: var(--border-light);
        }
        .profile-tab-btn.active {
          color: var(--primary);
          background-color: var(--primary-light);
        }
        .cert-card {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--surface-card);
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cert-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
      `}</style>

      {!currentUser && <Sidebar />}

      <div className={currentUser ? 'container-fluid flex-grow-1 d-flex align-items-start justify-content-center px-3 py-5' : 'main-canvas-premium'}>
        <div className="profile-container">
          <div className="text-center mb-4">
            <img alt="EduFlow Logo" className="object-fit-contain mb-3" src={logo} style={{ width: '40px', height: '40px' }} />
            <h1 className="h3 text-dark fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>
              My Profile
            </h1>
            <p className="text-secondary small mb-0">Manage settings and download certifications</p>
          </div>

          {/* Tab Selection */}
          {activeUser.role === 'Learner' && (
            <div className="profile-nav-tabs">
              <button
                className={`profile-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                Account Settings
              </button>
              <button
                className={`profile-tab-btn ${activeTab === 'certificates' ? 'active' : ''}`}
                onClick={() => setActiveTab('certificates')}
              >
                Certificates ({completedCourses.length})
              </button>
              <button
                className={`profile-tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
                onClick={() => setActiveTab('badges')}
              >
                Achievements
              </button>
            </div>
          )}

          {/* Account Settings Tab */}
          {activeTab === 'settings' && (
            <div className="card-premium text-start w-100">
              <h2 className="h5 fw-bold mb-4 text-dark">Account Settings</h2>
              
              {validationError && (
                <div className="alert alert-danger d-flex align-items-center mb-4 text-start" role="alert" style={{ borderRadius: 'var(--radius-md)' }}>
                  <span className="me-2">⚠️</span>
                  <div className="small">{validationError}</div>
                </div>
              )}

              {submitError && (
                <div className="alert alert-danger d-flex align-items-center mb-4 text-start" role="alert" style={{ borderRadius: 'var(--radius-md)' }}>
                  <span className="me-2">⚠️</span>
                  <div className="small">{submitError}</div>
                </div>
              )}

              {successMsg && (
                <div className="alert alert-success d-flex align-items-center mb-4 text-start" role="alert" style={{ borderRadius: 'var(--radius-md)' }}>
                  <span className="me-2">✓</span>
                  <div className="small">{successMsg}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                {/* Full Name field */}
                <div className="form-group-premium">
                  <label htmlFor="fullNameInput" className="label-premium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="input-premium"
                    id="fullNameInput"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <span className="text-muted-custom" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                    💡 Important: Your name on completion certificates will update to match this.
                  </span>
                </div>

                {/* Email Address field */}
                <div className="form-group-premium">
                  <label htmlFor="emailAddressInput" className="label-premium">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="input-premium"
                    id="emailAddressInput"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Role badge field (disabled to prevent updates) */}
                <div className="form-group-premium">
                  <label htmlFor="roleBadgeInput" className="label-premium">
                    Role
                  </label>
                  <input
                    type="text"
                    className="input-premium bg-light text-muted"
                    id="roleBadgeInput"
                    value={role}
                    disabled
                    style={{ cursor: 'not-allowed' }}
                  />
                  <span className="text-muted-custom" style={{ fontSize: '10px', display: 'block', marginTop: '4px' }}>
                    Role parameters are locked. Contact support to change your account access.
                  </span>
                </div>

                {/* Save Profile Button */}
                <button
                  type="submit"
                  className="btn-premium-primary w-100 py-2.5 mt-3 transition-all"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === 'certificates' && (
            <div className="card-premium text-start w-100">
              <h2 className="h5 fw-bold mb-4 text-dark">Verified Course Certifications</h2>
              
              {loadingCourses ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-secondary small mt-2">Loading your certifications...</p>
                </div>
              ) : completedCourses.length === 0 ? (
                <div className="text-center py-5">
                  <div className="fs-1 mb-2">📜</div>
                  <h3 className="h6 fw-bold text-dark mb-1">No certificates earned yet</h3>
                  <p className="text-secondary small mb-0">Complete all topics and pass the final exam of a course to earn a certificate.</p>
                </div>
              ) : (
                <div>
                  <p className="text-secondary small mb-4">
                    Congratulations! You have successfully completed the following courses and earned verified certifications:
                  </p>
                  {completedCourses.map((enrollment) => {
                    const c = enrollment.course || {};
                    const cid = c.id || c._id;
                    return (
                      <div key={cid} className="cert-card">
                        <div className="pe-3">
                          <span className="badge-premium badge-premium-primary mb-2" style={{ fontSize: '10px' }}>
                            {c.category || 'Software Engineering'}
                          </span>
                          <h3 className="h6 fw-bold text-dark mb-1">{c.title}</h3>
                          <p className="text-secondary mb-0" style={{ fontSize: '11px' }}>
                            100% Complete &bull; Verified Grade
                          </p>
                        </div>
                        <button
                          onClick={() => handleDownloadCertificate(cid, c.title)}
                          disabled={downloadingId === cid}
                          className="btn-premium-primary d-flex align-items-center gap-2 py-2 px-3"
                          style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            download
                          </span>
                          {downloadingId === cid ? 'Generating...' : 'PDF'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="w-100">
              <BadgeGallery />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
