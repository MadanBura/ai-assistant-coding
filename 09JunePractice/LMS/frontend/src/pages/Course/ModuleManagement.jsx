import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';

export default function ModuleManagement() {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');

  // Editing state
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Deletion state
  const [moduleToDelete, setModuleToDelete] = useState(null);

  const fetchModules = async () => {
    try {
      const response = await fetch(`/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setModules(result.data.modules || []);
          setCourseTitle(result.data.title || 'Course');
        }
      } else {
        throw new Error('Failed to fetch course data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const handleEditClick = (mod) => {
    setEditingModuleId(mod.id);
    setEditTitle(mod.title);
  };

  const handleSaveEdit = async (moduleId) => {
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`/modules/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ title: editTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update module');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setModules((prev) =>
          prev.map((m) => (m.id === moduleId ? { ...m, title: result.data.title } : m))
        );
        setEditingModuleId(null);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating module');
    }
  };

  const handleConfirmDelete = async () => {
    if (!moduleToDelete) return;

    try {
      const response = await fetch(`/modules/${moduleToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (response.ok) {
        setModules((prev) => prev.filter((m) => m.id !== moduleToDelete.id));
      } else {
        throw new Error('Failed to delete module');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting module');
    } finally {
      setModuleToDelete(null);
    }
  };

  return (
    <div data-testid="module-management-wrapper" className="container-fluid p-0 d-flex min-vh-100 animate-fade-in text-start" style={{ backgroundColor: 'var(--bg-neutral)' }}>
      <style>{`
        .main-canvas-premium {
          flex: 1;
          margin-left: 260px;
          height: 100vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
      `}</style>
      <Sidebar />

      <main className="main-canvas-premium">
        <header className="nav-premium-top justify-content-between shrink-0">
          <div className="d-flex align-items-center gap-3">
            <Link to={`/instructor/courses/${courseId}/curriculum`} className="text-decoration-none d-flex align-items-center gap-2 text-secondary hover-text-primary me-2">
              <span className="material-symbols-outlined fs-5">arrow_back</span>
              <span className="fw-semibold small">Back to Curriculum</span>
            </Link>
            <div className="vr text-secondary" style={{ height: '20px' }}></div>
            <h1 className="h6 fw-bold text-dark mb-0 ms-2">Manage Modules</h1>
          </div>
        </header>

        <div className="p-4 p-md-5 max-w-4xl mx-auto w-100 flex-grow-1" style={{ maxWidth: '960px' }}>
          <div className="mb-4">
            <h1 className="h3 fw-bold text-dark mb-1">Modules for: {courseTitle}</h1>
            <p className="text-secondary mb-0">Edit module titles or delete modules entirely.</p>
          </div>

          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger border-0 rounded-3" role="alert">
              <span className="material-symbols-outlined me-2 align-middle">error</span>
              {error}
            </div>
          ) : (
            <div className="card-premium p-4 bg-white">
              {modules.length === 0 ? (
                <p className="text-secondary text-center my-4">No modules found for this course.</p>
              ) : (
                <div className="list-group list-group-flush">
                  {modules.map((mod) => (
                    <div key={mod.id} className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent py-3 border-bottom">
                      {editingModuleId === mod.id ? (
                        <div className="d-flex w-100 align-items-center gap-3">
                          <input
                            type="text"
                            className="input-premium form-control-sm flex-grow-1"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            autoFocus
                          />
                          <button
                            className="btn btn-sm btn-success px-3 rounded-pill fw-semibold"
                            onClick={() => handleSaveEdit(mod.id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary px-3 rounded-pill fw-semibold"
                            onClick={() => setEditingModuleId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="d-flex align-items-center gap-3">
                            <span className="material-symbols-outlined text-primary fs-4">folder</span>
                            <div>
                              <div className="fw-bold text-dark">{mod.title}</div>
                              <div className="small text-secondary">Sequence Index: {mod.sequenceIndex}</div>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary px-3 rounded-pill fw-semibold d-flex align-items-center gap-1"
                              onClick={() => handleEditClick(mod)}
                            >
                              <span className="material-symbols-outlined fs-6">edit</span>
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger px-3 rounded-pill fw-semibold d-flex align-items-center gap-1"
                              onClick={() => setModuleToDelete(mod)}
                            >
                              <span className="material-symbols-outlined fs-6">delete</span>
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {moduleToDelete && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.4)', zIndex: 1050 }} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-danger bg-opacity-10 text-danger border-0 px-4 pt-4">
                <h5 className="modal-title fw-bold">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModuleToDelete(null)}
                ></button>
              </div>
              <div className="modal-body px-4 py-3">
                <p className="mb-0 text-secondary small" style={{ lineHeight: '1.6' }}>
                  Are you sure you want to delete the module <strong className="text-dark">"{moduleToDelete.title}"</strong>?
                  This will also permanently delete all associated topics and resources. This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer bg-light border-0 px-4 py-3">
                <button
                  type="button"
                  className="btn-premium-secondary py-2"
                  onClick={() => setModuleToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4 py-2 rounded-3 fw-semibold small"
                  onClick={handleConfirmDelete}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
