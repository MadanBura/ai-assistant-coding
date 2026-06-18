import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';

export default function GlobalModuleManagement() {
  let auth = null;
  try {
    auth = useAuth();
  } catch (e) {
    // Auth context missing in tests
  }
  const user = auth?.user || null;

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [error, setError] = useState(null);

  // New module state
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Editing state
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Deletion state
  const [moduleToDelete, setModuleToDelete] = useState(null);

  // Fetch all courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const response = await fetch('/courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            if (user && user.id) {
              setCourses(result.data.filter((c) => c.instructorId === user.id));
            } else {
              setCourses(result.data);
            }
          }
        } else {
          throw new Error('Failed to fetch courses');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [user]);

  // Fetch modules when a course is selected
  useEffect(() => {
    if (!selectedCourseId) {
      setModules([]);
      return;
    }

    const fetchModules = async () => {
      setIsLoadingModules(true);
      setError(null);
      try {
        const response = await fetch(`/courses/${selectedCourseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setModules(result.data.modules || []);
          }
        } else {
          throw new Error('Failed to fetch course details');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingModules(false);
      }
    };
    fetchModules();
  }, [selectedCourseId]);

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim() || !selectedCourseId) return;

    setIsAdding(true);
    try {
      const nextSequence = modules.length;
      const response = await fetch(`/courses/${selectedCourseId}/modules`, {
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
        setModules([...modules, result.data]);
        setNewModuleTitle('');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding module');
    } finally {
      setIsAdding(false);
    }
  };

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
    <div data-testid="global-module-management-wrapper" className="container-fluid p-0 d-flex min-vh-100 animate-fade-in text-start" style={{ backgroundColor: 'var(--bg-neutral)' }}>
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
        <header className="nav-premium-top shrink-0 border-bottom border-light">
          <div className="d-flex align-items-center">
            <h1 className="h5 fw-bold text-dark mb-0 ms-3">Create & Manage Modules</h1>
          </div>
        </header>

        <div className="p-4 p-md-5 max-w-4xl mx-auto w-100 flex-grow-1" style={{ maxWidth: '960px' }}>
          {error && (
            <div className="alert alert-danger border-0 rounded-3 mb-4" role="alert">
              <span className="material-symbols-outlined me-2 align-middle">error</span>
              {error}
            </div>
          )}

          {/* Course Selection Area */}
          <div className="card-premium p-4 bg-white mb-5 shadow-sm">
            <h2 className="h6 fw-bold text-dark mb-3 uppercase tracking-wider text-secondary small">Select a Course</h2>
            {isLoadingCourses ? (
              <div className="d-flex align-items-center text-primary">
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                <span>Loading your courses...</span>
              </div>
            ) : courses.length === 0 ? (
              <div className="alert alert-warning border-0 rounded-3 mb-0">
                You haven't created any courses yet. Please create a course first.
              </div>
            ) : (
              <select
                className="input-premium form-select form-select-lg"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="">-- Choose a course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Modules Area (only visible if course is selected) */}
          {selectedCourseId && (
            <div className="animate-fade-in">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h4 fw-bold text-dark mb-0">Course Curriculum</h2>
              </div>

              {/* Add New Module Form */}
              <div className="card-premium p-4 bg-white mb-4 border border-primary border-opacity-25">
                <form onSubmit={handleAddModule} className="d-flex flex-column flex-sm-row gap-3 align-items-sm-end">
                  <div className="flex-grow-1">
                    <label className="form-label text-secondary small fw-semibold">New Module Title</label>
                    <input
                      type="text"
                      className="input-premium"
                      placeholder="e.g. Introduction to React"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-premium-primary py-2 px-4 d-flex align-items-center justify-content-center gap-2"
                    disabled={isAdding || !newModuleTitle.trim()}
                  >
                    {isAdding ? (
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                    ) : (
                      <span className="material-symbols-outlined fs-5">add_circle</span>
                    )}
                    <span>Add Module</span>
                  </button>
                </form>
              </div>

              {/* List of Existing Modules */}
              {isLoadingModules ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading modules...</span>
                  </div>
                </div>
              ) : (
                <div className="card-premium p-0 bg-white overflow-hidden shadow-sm">
                  {modules.length === 0 ? (
                    <div className="p-5 text-center">
                      <span className="material-symbols-outlined display-4 text-muted mb-3">inventory_2</span>
                      <p className="text-secondary mb-0">No modules have been added to this course yet.</p>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {modules.map((mod) => (
                        <div key={mod.id} className="list-group-item p-4 d-flex justify-content-between align-items-center border-bottom">
                          {editingModuleId === mod.id ? (
                            <div className="d-flex w-100 align-items-center gap-3">
                              <input
                                type="text"
                                className="input-premium flex-grow-1"
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
                                <div className="bg-light p-2 rounded text-secondary d-flex align-items-center justify-content-center">
                                  <span className="material-symbols-outlined fs-4">folder</span>
                                </div>
                                <div>
                                  <div className="fw-bold text-dark fs-5">{mod.title}</div>
                                  <div className="small text-secondary fw-medium">Sequence #{mod.sequenceIndex + 1}</div>
                                </div>
                              </div>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary px-3 rounded-pill fw-semibold d-flex align-items-center gap-1 hover-lift"
                                  onClick={() => handleEditClick(mod)}
                                >
                                  <span className="material-symbols-outlined fs-6">edit</span>
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger px-3 rounded-pill fw-semibold d-flex align-items-center gap-1 hover-lift"
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
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {moduleToDelete && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 1050 }} role="dialog">
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
                  className="btn btn-danger px-4 py-2 rounded-3 fw-semibold small shadow-sm"
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
