import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';

/**
 * CourseBuilder Component
 * Renders the course curriculum editor page.
 * Manages modules, topics, and reordering.
 *
 * @param {Object} props
 * @param {String} props.courseId - ID of the course being edited
 * @param {Array} props.initialCurriculum - List of modules in the course
 */
export default function CourseBuilder({ courseId: propCourseId, initialCurriculum = null }) {
  const params = useParams();
  const courseId = propCourseId || params.courseId;

  const [curriculum, setCurriculum] = useState(initialCurriculum || []);
  const [originalCurriculum, setOriginalCurriculum] = useState(initialCurriculum || []);

  useEffect(() => {
    if ((!initialCurriculum || initialCurriculum.length === 0) && courseId) {
      const fetchCurriculum = async () => {
        try {
          const response = await fetch(`/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            },
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data && result.data.modules) {
              setCurriculum(result.data.modules);
              setOriginalCurriculum(result.data.modules);
            }
          }
        } catch (err) {
          console.error('Failed to fetch curriculum:', err);
        }
      };
      fetchCurriculum();
    }
  }, [initialCurriculum, courseId]);

  // Add Module states
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // Add Topic states
  const [activeAddTopicModuleId, setActiveAddTopicModuleId] = useState(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');

  // Saving states
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [reorderError, setReorderError] = useState(null);

  // Sync state with props
  useEffect(() => {
    if (initialCurriculum) {
      setCurriculum(initialCurriculum);
      setOriginalCurriculum(initialCurriculum);
    }
  }, [initialCurriculum]);

  // Add Module submit
  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    try {
      const nextSequence = curriculum.length;
      const response = await fetch(`/courses/${courseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          title: newModuleTitle,
          sequenceIndex: nextSequence,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add module');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setCurriculum((prev) => [...prev, { ...result.data, topics: [] }]);
        setOriginalCurriculum((prev) => [...prev, { ...result.data, topics: [] }]);
        setNewModuleTitle('');
        setShowAddModule(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Topic submit
  const handleSaveTopic = async (e, moduleId) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    try {
      const parentModule = curriculum.find((m) => m.id === moduleId);
      const nextSequence = parentModule?.topics?.length || 0;

      const response = await fetch(`/modules/${moduleId}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          title: newTopicTitle,
          sequenceIndex: nextSequence,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add topic');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setCurriculum((prev) =>
          prev.map((mod) => {
            if (mod.id === moduleId) {
              return {
                ...mod,
                topics: [...(mod.topics || []), result.data],
              };
            }
            return mod;
          })
        );
        setOriginalCurriculum((prev) =>
          prev.map((mod) => {
            if (mod.id === moduleId) {
              return {
                ...mod,
                topics: [...(mod.topics || []), result.data],
              };
            }
            return mod;
          })
        );
        setNewTopicTitle('');
        setActiveAddTopicModuleId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Optimistic Move Down
  const handleMoveDown = (idx) => {
    if (idx >= curriculum.length - 1) return;
    setReorderError(null);
    setOriginalCurriculum(curriculum); // Keep backup

    const updated = [...curriculum];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;

    const updatedWithSequence = updated.map((mod, i) => ({
      ...mod,
      sequenceIndex: i,
    }));

    setCurriculum(updatedWithSequence);
  };

  // Optimistic Move Up
  const handleMoveUp = (idx) => {
    if (idx <= 0) return;
    setReorderError(null);
    setOriginalCurriculum(curriculum); // Keep backup

    const updated = [...curriculum];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;

    const updatedWithSequence = updated.map((mod, i) => ({
      ...mod,
      sequenceIndex: i,
    }));

    setCurriculum(updatedWithSequence);
  };

  // Batch Save Order
  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    setReorderError(null);
    try {
      const response = await fetch(`/courses/${courseId}/curriculum/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          modules: curriculum.map((mod) => ({
            id: mod.id,
            sequenceIndex: mod.sequenceIndex,
          })),
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setOriginalCurriculum(curriculum); // Commit order backup
      } else {
        throw new Error(result.message || 'Reordering failed');
      }
    } catch (err) {
      setReorderError(err.message || 'Reordering failed');
      setCurriculum(originalCurriculum); // Rollback optimistic UI swap
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <div data-testid="course-builder-wrapper" className="container-fluid p-0 d-flex min-vh-100 animate-fade-in text-start" style={{ backgroundColor: 'var(--bg-neutral)' }}>
      <style>{`
        .main-canvas-premium {
          flex: 1;
          margin-left: 260px; /* Offset for fixed sidebar */
          height: 100vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .reorder-btn-premium {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background-color: #ffffff;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .reorder-btn-premium:hover {
          background-color: var(--border-light);
          color: var(--primary);
          border-color: var(--primary);
        }
        .reorder-btn-premium:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>

      <Sidebar />

      {/* Main Content Area */}
      <main className="main-canvas-premium">
          {/* Top Header Bar */}
          <header className="nav-premium-top justify-content-between shrink-0">
            <div className="d-flex align-items-center gap-3">
              <Link to="/instructor/courses" className="text-decoration-none d-flex align-items-center gap-2 text-secondary hover-text-primary me-2">
                <span className="material-symbols-outlined fs-5">arrow_back</span>
                <span className="fw-semibold small">Back</span>
              </Link>
              <div className="vr text-secondary" style={{ height: '20px' }}></div>
              <h1 className="h6 fw-bold text-dark mb-0 ms-2">Course Curriculum</h1>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Link
                to={`/instructor/courses/${courseId}/announcements`}
                className="btn-premium-secondary py-2 px-4 text-decoration-none d-flex align-items-center gap-1"
              >
                <span className="material-symbols-outlined fs-5">campaign</span>
                <span>Announcements</span>
              </Link>
              <Link
                to={`/instructor/courses/${courseId}/modules/manage`}
                className="btn-premium-secondary py-2 px-4 text-decoration-none d-flex align-items-center gap-1"
              >
                <span className="material-symbols-outlined fs-5">edit</span>
                <span>Manage Modules</span>
              </Link>
              <button
                className="btn-premium-primary py-2 px-4"
                onClick={() => handleSaveOrder()}
                disabled={isSavingOrder}
              >
                <span className="material-symbols-outlined fs-5">save</span>
                <span>{isSavingOrder ? 'Saving order...' : 'Save Order'}</span>
              </button>
            </div>
          </header>

          <div className="p-4 p-md-5 max-w-4xl mx-auto w-100 flex-grow-1" style={{ maxWidth: '960px' }}>
            {reorderError && (
              <div className="alert alert-danger d-flex align-items-center mb-4 border-0 rounded-3" role="alert">
                <span className="material-symbols-outlined me-2">error</span>
                <div>{reorderError}</div>
              </div>
            )}

            {/* Modules List */}
            <div className="mb-4">
              {curriculum.map((module, idx) => (
                <div key={module.id} className="card-premium p-4 mb-4 bg-white">
                  {/* Module Header */}
                  <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="material-symbols-outlined text-primary">folder</span>
                      <div className="fw-bold h6 text-dark mb-0" style={{ lineHeight: '1.4' }}>
                        {module.title}
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="reorder-btn-premium"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        aria-label="Move Up"
                      >
                        <span className="material-symbols-outlined fs-5">arrow_upward</span>
                      </button>
                      <button
                        className="reorder-btn-premium"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === curriculum.length - 1}
                        aria-label="Move Down"
                      >
                        <span className="material-symbols-outlined fs-5">arrow_downward</span>
                      </button>
                    </div>
                  </div>

                  {/* Topics List */}
                  <ul className="list-group list-group-flush mb-3">
                    {module.topics?.map((topic) => (
                      <li
                        key={topic.id}
                        className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent py-2.5 border-light-subtle"
                      >
                        <div className="d-flex align-items-center gap-2 text-secondary flex-grow-1">
                          <span className="material-symbols-outlined fs-5">article</span>
                          <span className="small fw-medium">{topic.title}</span>
                        </div>
                        <Link 
                          to={`/instructor/courses/${courseId}/topics/${topic.id || topic._id}/resources`}
                          className="btn btn-sm btn-outline-primary py-1 px-2 d-flex align-items-center gap-1"
                          style={{ fontSize: '11px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>settings</span>
                          Manage Topic
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* Add Topic Panel */}
                  {activeAddTopicModuleId === module.id ? (
                    <form
                      onSubmit={(e) => handleSaveTopic(e, module.id)}
                      className="mt-3 bg-light p-3 rounded-3 border"
                    >
                      <div className="mb-3">
                        <input
                          type="text"
                          className="input-premium form-control-sm"
                          placeholder="Enter topic title"
                          value={newTopicTitle}
                          onChange={(e) => setNewTopicTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-sm btn-success px-3 rounded-pill fw-semibold">
                          Save Topic
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary px-3 rounded-pill fw-semibold"
                          onClick={() => {
                            setActiveAddTopicModuleId(null);
                            setNewTopicTitle('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-2">
                      <button
                        className="btn btn-sm btn-link text-primary p-0 fw-semibold text-decoration-none d-flex align-items-center gap-1"
                        onClick={() => setActiveAddTopicModuleId(module.id)}
                      >
                        <span className="material-symbols-outlined fs-5">add</span>
                        <span>Add Topic</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Module Section */}
            {showAddModule ? (
              <form onSubmit={handleSaveModule} className="card-premium p-4 bg-light rounded-4">
                <div className="form-group-premium">
                  <label htmlFor="newModuleTitleInput" className="label-premium">
                    New Module Title
                  </label>
                  <input
                    id="newModuleTitleInput"
                    type="text"
                    className="input-premium"
                    placeholder="Enter module title"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn-premium-primary py-2 px-4">
                    Save Module
                  </button>
                  <button
                    type="button"
                    className="btn-premium-secondary py-2 px-4"
                    onClick={() => {
                      setShowAddModule(false);
                      setNewModuleTitle('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                className="btn btn-outline-primary w-100 py-3.5 border-dashed rounded-4 fw-semibold d-flex align-items-center justify-content-center gap-2"
                onClick={() => setShowAddModule(true)}
              >
                <span className="material-symbols-outlined fs-5">add</span>
                <span>Add Module</span>
              </button>
            )}
          </div>
        </main>
    </div>
  );
}
