import React, { useState, useEffect } from 'react';

/**
 * CourseBuilder Component
 * Renders the course curriculum editor page.
 * Manages modules, topics, and reordering.
 *
 * @param {Object} props
 * @param {String} props.courseId - ID of the course being edited
 * @param {Array} props.initialCurriculum - List of modules in the course
 */
export default function CourseBuilder({ courseId, initialCurriculum = [] }) {
  const [curriculum, setCurriculum] = useState(initialCurriculum);
  const [originalCurriculum, setOriginalCurriculum] = useState(initialCurriculum);

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
    <div data-testid="course-builder-wrapper" className="container py-4">
      <header className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h2 text-primary fw-bold mb-1">Course Curriculum</h1>
          <p className="text-muted small">Design modules, structure lessons, and order topics</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => handleSaveOrder()}
            disabled={isSavingOrder}
          >
            {isSavingOrder ? 'Saving order...' : 'Save Order'}
          </button>
        </div>
      </header>

      {reorderError && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <span className="me-2">⚠️</span>
          <div>{reorderError}</div>
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-3 mb-4">
        {curriculum.map((module, idx) => (
          <div key={module.id} className="card shadow-sm border-0 bg-white p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
              <div className="d-flex align-items-center gap-2">
                {/* Module Title with specific class name for test assertions */}
                <div className="module-title-item fw-bold h5 text-dark mb-0">
                  {module.title}
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleMoveUp(idx)}
                  disabled={idx === 0}
                  aria-label="Move Up"
                >
                  ▲
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleMoveDown(idx)}
                  disabled={idx === curriculum.length - 1}
                  aria-label="Move Down"
                >
                  ▼
                </button>
              </div>
            </div>

            {/* Nested Topics List */}
            <ul className="list-group list-group-flush mb-3">
              {module.topics?.map((topic) => (
                <li
                  key={topic.id}
                  className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent py-2 border-light-subtle"
                >
                  <span className="small text-muted">{topic.title}</span>
                </li>
              ))}
            </ul>

            {/* Topic Addition Section */}
            {activeAddTopicModuleId === module.id ? (
              <form
                onSubmit={(e) => handleSaveTopic(e, module.id)}
                className="d-flex gap-2 mt-2 bg-light p-2 rounded"
              >
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Enter topic title"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-sm btn-success">
                  Save Topic
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setActiveAddTopicModuleId(null);
                    setNewTopicTitle('');
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div>
                <button
                  className="btn btn-sm btn-link text-primary p-0 fw-semibold text-decoration-none"
                  onClick={() => setActiveAddTopicModuleId(module.id)}
                >
                  + Add Topic
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Module Section */}
      {showAddModule ? (
        <form onSubmit={handleSaveModule} className="card shadow-sm border-0 p-3 bg-light">
          <div className="mb-3">
            <label htmlFor="newModuleTitleInput" className="form-label fw-bold text-dark small">
              New Module Title
            </label>
            <input
              id="newModuleTitleInput"
              type="text"
              className="form-control"
              placeholder="Enter module title"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              required
            />
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-success">
              Save Module
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
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
          className="btn btn-outline-primary w-100 py-3 border-dashed"
          onClick={() => setShowAddModule(true)}
        >
          + Add Module
        </button>
      )}
    </div>
  );
}
