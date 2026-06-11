import React, { useState, useEffect } from 'react';

/**
 * CourseCreator Component
 * Renders the course creation wizard form for instructors.
 * Handles validation, submission requests, error banners, and deletion workflows.
 *
 * @param {Object} props
 * @param {String} props.userRole - The role of the logged-in user ('Instructor' or 'Learner')
 * @param {Array} props.mockCourses - Initial list of courses for deletion tests
 */
export default function CourseCreator({ userRole = 'Instructor', mockCourses = [] }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Software Engineering');
  const [description, setDescription] = useState('');
  const [coursesList, setCoursesList] = useState(mockCourses);

  // Stateful flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Local input validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Deletion modal state
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Keep courses synced when props change
  useEffect(() => {
    if (mockCourses) {
      setCoursesList(mockCourses);
    }
  }, [mockCourses]);

  // Access check
  if (userRole === 'Learner') {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center p-4 border-0 shadow-sm" role="alert">
          <h4 className="fw-bold">🔒 Access Restricted</h4>
          <p className="mb-0">Only registered Instructors have permission to create or delete courses.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setValidationErrors({});

    // Client-side validations
    const errors = {};
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    if (!description.trim()) {
      errors.description = 'Description is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ title, category, description }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        // Clear inputs on success
        setTitle('');
        setDescription('');
        // Redirect or refresh
      } else {
        throw new Error(result.message || 'Server creation error');
      }
    } catch (err) {
      setSubmitError(err.message || 'Server creation error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      const response = await fetch(`/courses/${courseToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (response.ok) {
        setCoursesList((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setCourseToDelete(null);
    }
  };

  return (
    <div data-testid="course-creator-wrapper" className="container py-4">
      <header className="mb-4">
        <h1 className="h2 text-primary fw-bold">Create Course</h1>
        <p className="text-muted small">Design and launch your new educational module</p>
      </header>

      {submitError && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <span className="me-2">⚠️</span>
          <div>{submitError}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Creation Form Column */}
        <div className="col-12 col-lg-8">
          <form onSubmit={handleSubmit} className="card shadow-sm border-0 bg-white p-4">
            <div className="mb-3">
              <label htmlFor="courseTitle" className="form-label fw-semibold text-dark">
                Course Title
              </label>
              <input
                type="text"
                className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
                id="courseTitle"
                placeholder="e.g. Introduction to Programming"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {validationErrors.title ? (
                <div className="invalid-feedback">{validationErrors.title}</div>
              ) : (
                <div className="form-text text-muted small">
                  Give your course a clear, descriptive, and engaging title.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="category" className="form-label fw-semibold text-dark">
                Category
              </label>
              <select
                className="form-select"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="form-label fw-semibold text-dark">
                Description
              </label>
              <textarea
                className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
                id="description"
                rows="5"
                placeholder="Describe what learners will discover in this course..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              {validationErrors.description ? (
                <div className="invalid-feedback">{validationErrors.description}</div>
              ) : (
                <div className="form-text text-muted small">
                  Summarize the learning goals, prerequisites, and curriculum values.
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary px-4 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>

        {/* Existing Courses Deletion Administration Column */}
        {coursesList.length > 0 && (
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm border-0 bg-white p-4">
              <h3 className="h5 fw-bold mb-3">Manage Created Courses</h3>
              <div className="list-group list-group-flush">
                {coursesList.map((course) => (
                  <div
                    key={course.id}
                    className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent py-3 border-bottom"
                  >
                    <span className="fw-semibold text-truncate me-2" style={{ maxWidth: '180px' }}>
                      {course.title}
                    </span>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setCourseToDelete(course)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Deletion Confirmation Modal */}
      {courseToDelete && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger-subtle text-danger-emphasis">
                <h5 className="modal-title fw-bold">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setCourseToDelete(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="mb-0">
                  Are you sure you want to delete the course <strong className="text-dark">"{courseToDelete.title}"</strong>?
                  This action is permanent and cannot be undone.
                </p>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setCourseToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
