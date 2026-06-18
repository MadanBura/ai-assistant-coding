import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import CourseAssignments from '../../components/Course/CourseAssignments';
import CourseDoubts from '../../components/Course/CourseDoubts';
import QuizFeedbackPanel from '../../components/Course/QuizFeedbackPanel';
import { useAuth } from '../../context/AuthContext';

export default function ResourceManagement() {
  const { courseId, topicId } = useParams();
  const [course, setCourse] = useState(null);
  const [topic, setTopic] = useState(null);
  const [resources, setResources] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('resources'); // resources, assignments, doubts, quiz-feedback

  let authUser = null;
  try {
    const auth = useAuth();
    authUser = auth.user;
  } catch(e) {}

  // New Resource Form
  const [type, setType] = useState('Video');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      };
      
      // Fetch course
      const resCourse = await fetch(`/courses/${courseId}`, { headers });
      if (resCourse.ok) {
        const dataCourse = await resCourse.json();
        if (dataCourse.success && dataCourse.data) {
          setCourse(dataCourse.data);
          
          // Find the topic details
          const allTopics = dataCourse.data.modules?.flatMap(m => m.topics || []) || [];
          const matchedTopic = allTopics.find(t => t.id === topicId || t._id === topicId);
          if (matchedTopic) {
            setTopic(matchedTopic);
          }
        }
      }

      // Fetch topic details to get resources
      const resTopicDetails = await fetch(`/courses/${courseId}/topics/${topicId}`, { headers });
      if (resTopicDetails.ok) {
        const dataTopic = await resTopicDetails.json();
        if (dataTopic.success && dataTopic.data && dataTopic.data.resources) {
          setResources(dataTopic.data.resources);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (courseId && topicId) {
      fetchData();
    }
  }, [courseId, topicId]);

  const handleAddResource = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg('');

    try {
      const payload = { type };
      if (type === 'Notes') {
        payload.content = content;
      } else {
        payload.url = url;
      }

      const res = await fetch(`/topics/${topicId}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg('Resource added successfully!');
        setResources(prev => [...prev, result.data]);
        setShowModal(false);
        setUrl('');
        setContent('');
      } else {
        throw new Error(result.message || 'Failed to add resource');
      }
    } catch (err) {
      setError(err.message || 'Error saving resource');
    } finally {
      setIsLoading(false);
    }
  };

  if (!course || !topic) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: 'var(--bg-neutral)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading resource manager...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex animate-fade-in text-start" style={{ backgroundColor: 'var(--bg-neutral)', width: '100%' }}>
      <style>{`
        .main-canvas-premium {
          flex: 1;
          margin-left: 260px; /* Offset for fixed sidebar */
          padding: 40px;
          overflow-y: auto;
          height: 100vh;
        }
        .modal-overlay-premium {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }
      `}</style>

      <Sidebar />

      {/* Main Content */}
      <main className="main-canvas-premium">
        <div className="container-fluid px-0" style={{ maxWidth: '960px' }}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <nav className="d-flex align-items-center gap-1 text-secondary small mb-2">
                <Link to="/instructor/courses" className="text-secondary text-decoration-none">Courses</Link>
                <span className="material-symbols-outlined fs-6">chevron_right</span>
                <Link to={`/instructor/courses/${courseId}/curriculum`} className="text-secondary text-decoration-none">{course.title}</Link>
                <span className="material-symbols-outlined fs-6">chevron_right</span>
                <span className="text-primary fw-semibold">Resources</span>
              </nav>
              <h2 className="h4 fw-bold mb-1">Resource Management</h2>
              <p className="text-secondary mb-0">Manage materials for topic: <strong className="text-dark">{topic.title}</strong></p>
            </div>
            {activeTab === 'resources' && (
              <button
                type="button"
                className="btn-premium-primary py-2.5 px-4"
                onClick={() => setShowModal(true)}
              >
                <span className="material-symbols-outlined fs-5">cloud_upload</span>
                <span>Add Resource</span>
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="d-flex border-bottom gap-4 mb-4 overflow-x-auto flex-nowrap" style={{ borderBottomColor: 'var(--border-color) !important', whiteSpace: 'nowrap' }}>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
              style={{
                background: 'none', border: 'none', padding: '12px 0', fontWeight: '600',
                color: activeTab === 'resources' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${activeTab === 'resources' ? 'var(--primary)' : 'transparent'}`,
                transition: 'var(--transition-fast)'
              }}
            >
              Resources
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignments')}
              style={{
                background: 'none', border: 'none', padding: '12px 0', fontWeight: '600',
                color: activeTab === 'assignments' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${activeTab === 'assignments' ? 'var(--primary)' : 'transparent'}`,
                transition: 'var(--transition-fast)'
              }}
            >
              Assignments
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'doubts' ? 'active' : ''}`}
              onClick={() => setActiveTab('doubts')}
              style={{
                background: 'none', border: 'none', padding: '12px 0', fontWeight: '600',
                color: activeTab === 'doubts' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${activeTab === 'doubts' ? 'var(--primary)' : 'transparent'}`,
                transition: 'var(--transition-fast)'
              }}
            >
              Doubts & Q&A
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'quiz-feedback' ? 'active' : ''}`}
              onClick={() => setActiveTab('quiz-feedback')}
              style={{
                background: 'none', border: 'none', padding: '12px 0', fontWeight: '600',
                color: activeTab === 'quiz-feedback' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${activeTab === 'quiz-feedback' ? 'var(--primary)' : 'transparent'}`,
                transition: 'var(--transition-fast)'
              }}
            >
              Quiz Feedback
            </button>
          </div>

          {activeTab === 'resources' && (
            <>
              {successMsg && <div className="alert alert-success border-0 rounded-3 small" role="alert">{successMsg}</div>}

              {/* Resources List */}
              <div className="card-premium bg-white p-4">
                <h3 className="h6 fw-bold text-dark mb-4">Topic Resources</h3>
                {resources.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-secondary mb-0">No resources configured for this topic yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table-premium">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resources.map((r) => {
                          const rId = r.id || r._id;
                          return (
                            <tr key={rId}>
                              <td>
                                <div className="d-flex align-items-center gap-3">
                                  <div className="rounded bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center">
                                    <span className="material-symbols-outlined">
                                      {r.type === 'Video' ? 'play_circle' : 'description'}
                                    </span>
                                  </div>
                                  <span className="fw-semibold text-dark">{r.type === 'Video' ? 'Video Lecture' : 'Study Notes'}</span>
                                </div>
                              </td>
                              <td>
                                <span className="badge-premium badge-premium-primary">{r.type}</span>
                              </td>
                              <td>
                                <span className="text-secondary small text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                                  {r.type === 'Video' ? r.url : r.content?.substring(0, 80)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'assignments' && (
            <CourseAssignments topicId={topic?.id || topic?._id} user={authUser} />
          )}

          {activeTab === 'doubts' && (
            <CourseDoubts topicId={topic?.id || topic?._id} user={authUser} />
          )}

          {activeTab === 'quiz-feedback' && (
            <QuizFeedbackPanel topicId={topic?.id || topic?._id} user={authUser} />
          )}
        </div>
      </main>

      {/* Add Resource Modal */}
      {showModal && (
        <div className="modal-overlay-premium" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-4 shadow-lg overflow-hidden w-100 mx-3 animate-fade-in" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <h3 className="h6 fw-bold text-dark mb-0">Add New Resource</h3>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            
            <form onSubmit={handleAddResource} className="p-4 d-flex flex-column gap-3">
              {error && <div className="alert alert-danger mb-0" role="alert">{error}</div>}

              <div className="form-group-premium">
                <label className="label-premium">Resource Type</label>
                <select
                  className="input-premium"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Video">Video Link</option>
                  <option value="Notes">Study Notes (Markdown)</option>
                </select>
              </div>

              {type === 'Video' ? (
                <div className="form-group-premium">
                  <label className="label-premium">Video URL</label>
                  <input
                    type="url"
                    className="input-premium"
                    placeholder="e.g. https://www.youtube.com/embed/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="form-group-premium">
                  <label className="label-premium">Notes Content (Markdown supported)</label>
                  <textarea
                    className="input-premium"
                    style={{ minHeight: '150px' }}
                    placeholder="Write notes here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn-premium-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-premium-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
