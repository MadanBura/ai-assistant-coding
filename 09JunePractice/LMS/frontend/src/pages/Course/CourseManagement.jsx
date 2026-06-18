import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  let auth = null;
  try {
    auth = useAuth();
  } catch (e) {
    // Auth context missing in tests
  }
  const user = auth?.user || null;
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Filter courses owned by this instructor
          const filtered = user?.id 
            ? result.data.filter(c => c.instructorId === user.id)
            : result.data;
          setCourses(filtered);
        }
      } else {
        throw new Error('Failed to fetch courses');
      }
    } catch (err) {
      setError(err.message || 'Error loading courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course and all its progress records?')) {
      return;
    }
    try {
      const response = await fetch(`/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (response.ok) {
        setCourses(prev => prev.filter(c => c.id !== courseId && c._id !== courseId));
      } else {
        const resData = await response.json();
        alert(resData.message || 'Deletion failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error deleting course');
    }
  };

  // Filter logic
  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? c.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

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
        .course-img-placeholder-premium {
          width: 56px;
          height: 40px;
          border-radius: var(--radius-sm);
          background-color: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          font-weight: bold;
        }
      `}</style>

      <Sidebar />

      {/* Main Content */}
      <main className="main-canvas-premium">
        {/* Top bar */}
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 fw-bold mb-0">Course Management</h2>
        </header>

        {/* Stats Bento */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card-premium-static p-4 bg-white">
              <span className="text-secondary small uppercase tracking-wider">Total Courses</span>
              <h3 className="fw-bold mt-2 mb-0 text-dark">{courses.length}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card-premium-static p-4 bg-white">
              <span className="text-secondary small uppercase tracking-wider">Active Learners</span>
              <h3 className="fw-bold mt-2 mb-0 text-dark">1,284</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card-premium-static p-4 bg-white">
              <span className="text-secondary small uppercase tracking-wider">Completion Rate</span>
              <h3 className="fw-bold mt-2 mb-0 text-dark">78.5%</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card-premium-static p-4 bg-white">
              <span className="text-secondary small uppercase tracking-wider">Average Rating</span>
              <h3 className="fw-bold mt-2 mb-0 text-dark">4.92</h3>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-premium-static p-3 bg-white mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex flex-wrap gap-2 flex-grow-1" style={{ maxWidth: '600px' }}>
            <input
              type="text"
              className="input-premium"
              style={{ width: '240px' }}
              placeholder="Filter by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="input-premium"
              style={{ width: '180px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
            </select>
          </div>
          <Link to="/course/create" className="btn-premium-primary text-decoration-none py-2 px-4">
            <span className="material-symbols-outlined fs-5">add</span>
            <span>Create Course</span>
          </Link>
        </div>

        {/* Courses Table */}
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading courses...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">{error}</div>
        ) : filteredCourses.length === 0 ? (
          <div className="card-premium text-center p-5 bg-white">
            <h3 className="text-secondary h5 mb-3">No Courses Found</h3>
            <p className="text-muted mb-4">You have not created any courses matching the criteria.</p>
            <Link to="/course/create" className="btn-premium-primary text-decoration-none">Create Your First Course</Link>
          </div>
        ) : (
          <div className="card-premium-static bg-white p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Category</th>
                    <th>Total Learners</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((c) => {
                    const cId = c.id || c._id;
                    return (
                      <tr key={cId}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="course-img-placeholder-premium">
                              {c.title ? c.title.substring(0, 2).toUpperCase() : 'CO'}
                            </div>
                            <div>
                              <p className="fw-semibold text-dark mb-0">{c.title}</p>
                              <span className="text-secondary small">{c.description?.substring(0, 50)}...</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge-premium badge-premium-primary text-capitalize">{c.category || 'Development'}</span>
                        </td>
                        <td>
                          <span className="fw-semibold text-dark">842</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1.5">
                            <div className="rounded-circle bg-success" style={{ width: '8px', height: '8px' }}></div>
                            <span className="text-sm">Published</span>
                          </div>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <button
                              type="button"
                              className="btn btn-link text-secondary p-1"
                              title="Analytics"
                              onClick={() => navigate(`/instructor/courses/${cId}/analytics`)}
                            >
                              <span className="material-symbols-outlined fs-5">bar_chart</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-link text-secondary p-1"
                              title="Announcements"
                              onClick={() => navigate(`/instructor/courses/${cId}/announcements`)}
                            >
                              <span className="material-symbols-outlined fs-5">campaign</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-link text-secondary p-1"
                              title="Edit Curriculum"
                              onClick={() => navigate(`/instructor/courses/${cId}/curriculum`)}
                            >
                              <span className="material-symbols-outlined fs-5">edit_note</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-link text-danger p-1"
                              title="Delete Course"
                              onClick={() => handleDeleteCourse(cId)}
                            >
                              <span className="material-symbols-outlined fs-5">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
