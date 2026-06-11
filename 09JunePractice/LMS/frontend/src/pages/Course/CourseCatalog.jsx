import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Hero3DIllustration from '../../components/common/Hero3DIllustration';

// Mock course data matching catalog mockup
const DEFAULT_COURSES = [
  {
    id: 'c1',
    title: 'Mastering UI/UX Design Fundamentals',
    category: 'UI/UX Design',
    description: 'Mastering UI/UX Design principles and modern interface workflows.',
    difficulty: 'Intermediate',
    rating: 4.9,
    ratingCount: 1200,
    price: 89.99,
    originalPrice: 120.00,
    instructor: 'Sarah Jenkins',
    badge: 'Bestseller',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0J7vPA0JlcQ0Y5BdiBoXbeURb17OheHNJhUi9XZJbiCZTnrYa_h7E0wutOO2__IEJXnDe3VKtUqyjqqkqHQN2BoaFjSCpC-E9ZxtUlh4aB0OLYEFM64t93pLh0Hq57O7ZiM_X8v8bFlfFX8UIBMbAKODdH_4hw21oXS5ocPwApsEJIYYp-qf4yDbwRVDmdRMaEFo6Bq7LI2LT-J2ek28d5BcWGzIvpHWqDhtHYlst250zSojtCQ0Ti2siQIMKsIFqeZw-BqzYfYA'
  },
  {
    id: 'c2',
    title: 'Full-Stack Web Development Boot Camp',
    category: 'Software Development',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js, and deploy full applications.',
    difficulty: 'Beginner',
    rating: 4.8,
    ratingCount: 850,
    price: 149.99,
    originalPrice: 199.00,
    instructor: 'Alex Rivera',
    badge: 'Trending',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1CAsIxJQ8ci5_fYQsLUQ2Umemm5v5liZ2deJEt1X92Xr6kO9CxoEIzdKS92GKkPuCPzKJBO1bsqIC6XUTr67xeYO2Sxh7kXdf3DtwF_1ocLENJtT7AX49T70UrZzgM1_plFnqmf6EjzJdXc2WsDKP0Lu8U_WGe11kO--1aSb__h7os7gVKLoqpL0SZ6OXO9r20FJaTK1gAG9A029YjEtN58OGbtQtnzbLWBu9TmpPftJHDNNDyjrEqlEV27fJMYIdph1Qtef1IwM'
  },
  {
    id: 'c3',
    title: 'Strategic Business Growth & Scaling',
    category: 'Business Strategy',
    description: 'Understand market analysis, scaling metrics, leadership frameworks, and financial growth.',
    difficulty: 'Advanced',
    rating: 4.7,
    ratingCount: 420,
    price: 129.00,
    instructor: 'Marcus Thorne',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN9jJ7Kn6YBPhGbDEJDGluBSu9zmGpazmDjA96HhMn2_WW5MpHMvBMLKF5a4fUDDoB-S0lRMMtbOiwC9Y0sp7Tg8ynrc-tR7NJks7PT0mkvuZTsE60CrDkg7uKDaVxMtzPD8OYPaBrmhi7boaav-KWkG8mn9m8Iu9Mq3vjGcC-Wc9g0knWxE5C4HhcufXhDr7mGVLwJCHNBjkLAx8SZrVzLa6aa3WV9f4S8kYBkbz3pksmLxNpCucy5iRh6bVzKSlpvec2hESLgLE'
  },
  {
    id: 'c4',
    title: 'Python for Advanced Data Analytics',
    category: 'Data Science',
    description: 'Deep dive into pandas, numpy, scikit-learn, network analysis, and regression modeling.',
    difficulty: 'Advanced',
    rating: 5.0,
    ratingCount: 15,
    price: 74.99,
    originalPrice: 99.00,
    instructor: 'Dr. Emily Zhang',
    badge: 'New',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRe0hhbrlg0IEPqCD-MEB5_Mu0Nc_KWWj2mLt4dJbcKlpEri8-NvUlftDofQ22boHHYTxSYTa6SZWUntPeqyJJ8-FrdUE3jqYBPp7JjLUoJL4T4guVi1pzcele1-wFVyzYBMiYftGbjit5nHEiE_P48SiLpcXqbPVZHhyl_quruJx-ozwHEIUX_7davdk6M5TeEvEGlmsA-4FTqeAX_qORitkMCrgOUWjztNML0aRlMZtKoKljlCfC8M3oWQWOPi1Laf9dydPPL4o'
  }
];

export default function CourseCatalog({
  initialCourses = null,
  enrolledCourseIds = [],
  isAuthenticated = false,
}) {
  const navigate = useNavigate();

  // Pick incoming prop lists or use high-fidelity default mock data
  const baseCourses = useMemo(() => {
    return initialCourses || DEFAULT_COURSES;
  }, [initialCourses]);

  // States
  const [courses, setCourses] = useState(baseCourses);
  const [enrolledIds, setEnrolledIds] = useState(enrolledCourseIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  // Synchronize state with props
  useEffect(() => {
    if (initialCourses) {
      setCourses(initialCourses);
    }
  }, [initialCourses]);

  useEffect(() => {
    if (enrolledCourseIds) {
      setEnrolledIds(enrolledCourseIds);
    }
  }, [enrolledCourseIds]);

  // Enrollment CTA click
  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setEnrollingCourseId(courseId);
    try {
      const response = await fetch(`/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Enrollment request failed');
      }

      const result = await response.json();
      if (result.success) {
        setEnrolledIds((prev) => [...prev, courseId]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Extract unique category lists for dropdowns
  const categoriesList = useMemo(() => {
    return Array.from(new Set(courses.map((c) => c.category).filter(Boolean)));
  }, [courses]);

  // Handle sidebar checkbox selectors
  const handleDifficultyToggle = (level) => {
    setSelectedDifficulties((prev) =>
      prev.includes(level) ? prev.filter((d) => d !== level) : [...prev, level]
    );
  };

  // Perform search and filter combinations
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        !searchQuery ||
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory ||
        course.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesDifficulty =
        selectedDifficulties.length === 0 ||
        (course.difficulty && selectedDifficulties.includes(course.difficulty));

      const matchesRating =
        !selectedRating ||
        (course.rating && course.rating >= selectedRating);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesRating;
    });
  }, [courses, searchQuery, selectedCategory, selectedDifficulties, selectedRating]);

  return (
    <div data-testid="course-catalog-wrapper" className="container-fluid p-0 d-flex flex-column min-vh-100 bg-light">
      <style dangerouslySetInnerHTML={{ __html: `
        .glass-nav-catalog {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          background-color: rgba(255, 255, 255, 0.85);
        }
        .card-hover-scale {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-hover-scale:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08) !important;
        }
        .custom-chip-btn {
          border-radius: 50px;
          padding: 8px 18px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          white-space: nowrap;
        }
      `}} />

      {/* Top Navbar */}
      <nav className="fixed-top w-100 glass-nav-catalog border-bottom shadow-sm z-3" style={{ height: '64px' }}>
        <div className="container-xl h-100 d-flex align-items-center justify-content-between px-4">
          <div className="d-flex align-items-center gap-4">
            <span className="fs-4 fw-bold text-primary tracking-tight">EduFlow</span>
            <div className="d-none d-md-flex align-items-center gap-3 ms-4">
              <a href="#" className="text-primary fw-bold text-decoration-none border-primary pb-1" style={{ borderBottom: '2px solid' }}>Courses</a>
              <a href="#" className="text-secondary text-decoration-none hover-text-primary">Mentors</a>
              <a href="#" className="text-secondary text-decoration-none hover-text-primary">Pricing</a>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-link p-2 text-secondary hover-text-primary" aria-label="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="btn btn-link p-2 text-secondary hover-text-primary" aria-label="Help">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <div className="vr mx-2" style={{ height: '24px' }}></div>
            {isAuthenticated ? (
              <div className="rounded-circle overflow-hidden border" style={{ width: '32px', height: '32px' }}>
                <img 
                  alt="User Avatar" 
                  className="w-100 h-100 object-fit-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2QJUU_nSiHPn7M5jCNGmphFUdSDwE9333HS9ditjZeKTwHbJxhaT0MNYc3j7hJsGO8DUyN_N8Go4jun-2hC_rp2GWhfI0vBxH6A8UYhJErqlN90fJFL-Z8a71e7gw0myFV5tgNNgasw1eyI4a7Pn5Oda-vRtl76KFk4VV3twJ5NvTgyBMk4lBBdL652BvHiSAmo8aqtqN9HunSq-LjPOu3VSJPUu0UHDTKFeowsnAk38-tnOQW_boRTLEC_YibyDJAZXvHRiEUk4"
                />
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <button onClick={() => navigate('/login')} className="btn btn-link text-secondary text-decoration-none fw-semibold small px-3">Sign In</button>
                <button onClick={() => navigate('/register')} className="btn btn-primary fw-semibold small px-4 rounded-3">Get Started</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main split canvas layout */}
      <div className="d-flex flex-grow-1 overflow-hidden" style={{ paddingTop: '64px' }}>
        
        {/* Left Filter Sidebar */}
        <aside className="d-none d-md-flex flex-column bg-white border-end p-4 flex-shrink-0" style={{ width: '280px' }}>
          
          {/* User Profile Info */}
          <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
            <img 
              alt="Avatar" 
              className="rounded-circle border border-primary-subtle" 
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2QJUU_nSiHPn7M5jCNGmphFUdSDwE9333HS9ditjZeKTwHbJxhaT0MNYc3j7hJsGO8DUyN_N8Go4jun-2hC_rp2GWhfI0vBxH6A8UYhJErqlN90fJFL-Z8a71e7gw0myFV5tgNNgasw1eyI4a7Pn5Oda-vRtl76KFk4VV3twJ5NvTgyBMk4lBBdL652BvHiSAmo8aqtqN9HunSq-LjPOu3VSJPUu0UHDTKFeowsnAk38-tnOQW_boRTLEC_YibyDJAZXvHRiEUk4"
            />
            <div>
              <h3 className="h6 fw-bold mb-0 text-dark">EduFlow Pro</h3>
              <span className="small text-muted" style={{ fontSize: '11px' }}>Instructor Mode</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="list-group list-group-flush mb-4 small">
            <a href="#" className="list-group-item list-group-item-action border-0 px-3 py-2.5 rounded d-flex align-items-center gap-3 bg-primary bg-opacity-10 text-primary fw-bold">
              <span className="material-symbols-outlined">dashboard</span> Dashboard
            </a>
            <a href="#" className="list-group-item list-group-item-action border-0 px-3 py-2.5 rounded d-flex align-items-center gap-3 text-secondary hover-text-primary">
              <span className="material-symbols-outlined">school</span> My Courses
            </a>
            <a href="#" className="list-group-item list-group-item-action border-0 px-3 py-2.5 rounded d-flex align-items-center gap-3 text-secondary hover-text-primary">
              <span className="material-symbols-outlined">assignment</span> Assignments
            </a>
            <a href="#" className="list-group-item list-group-item-action border-0 px-3 py-2.5 rounded d-flex align-items-center gap-3 text-secondary hover-text-primary">
              <span className="material-symbols-outlined">monitoring</span> Analytics
            </a>
            <a href="#" className="list-group-item list-group-item-action border-0 px-3 py-2.5 rounded d-flex align-items-center gap-3 text-secondary hover-text-primary">
              <span className="material-symbols-outlined">settings</span> Settings
            </a>
          </div>

          {/* Difficulty Checkboxes */}
          <div className="mb-4">
            <h4 className="fw-bold text-dark mb-2 uppercase tracking-wider" style={{ fontSize: '11px' }}>DIFFICULTY</h4>
            <div className="d-flex flex-column gap-2">
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <label key={level} className="d-flex align-items-center gap-2 small text-secondary cursor-pointer hover-text-primary">
                  <input 
                    type="checkbox" 
                    className="form-check-input"
                    checked={selectedDifficulties.includes(level)}
                    onChange={() => handleDifficultyToggle(level)}
                  />
                  <span>{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Radios */}
          <div className="mb-4">
            <h4 className="fw-bold text-dark mb-2 uppercase tracking-wider" style={{ fontSize: '11px' }}>RATING</h4>
            <div className="d-flex flex-column gap-2">
              <label className="d-flex align-items-center gap-2 small text-secondary cursor-pointer hover-text-primary">
                <input 
                  type="radio" 
                  name="rating-radio"
                  className="form-check-input"
                  checked={selectedRating === 4.5}
                  onChange={() => setSelectedRating(4.5)}
                />
                <span className="d-flex align-items-center gap-1">
                  4.5 & up
                  <span className="material-symbols-outlined text-warning" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                </span>
              </label>
              <label className="d-flex align-items-center gap-2 small text-secondary cursor-pointer hover-text-primary">
                <input 
                  type="radio" 
                  name="rating-radio"
                  className="form-check-input"
                  checked={selectedRating === 4.0}
                  onChange={() => setSelectedRating(4.0)}
                />
                <span className="d-flex align-items-center gap-1">
                  4.0 & up
                  <span className="material-symbols-outlined text-warning" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                </span>
              </label>
              <label className="d-flex align-items-center gap-2 small text-secondary cursor-pointer hover-text-primary">
                <input 
                  type="radio" 
                  name="rating-radio"
                  className="form-check-input"
                  checked={selectedRating === 0}
                  onChange={() => setSelectedRating(0)}
                />
                <span>All Ratings</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-auto pt-3 border-top d-flex flex-column gap-1 small">
            <a href="#" className="list-group-item list-group-item-action border-0 px-3 py-2 rounded d-flex align-items-center gap-3 text-secondary hover-text-primary">
              <span className="material-symbols-outlined">contact_support</span> Support
            </a>
            <a href="#" className="list-group-item list-group-item-action border-0 px-3 py-2 rounded d-flex align-items-center gap-3 text-danger hover-text-danger">
              <span className="material-symbols-outlined">logout</span> Logout
            </a>
          </div>
        </aside>

        {/* Right Content Section */}
        <main className="flex-grow-1 bg-white overflow-y-auto position-relative p-4">
          
          {/* Floating 3D Background Illustration (semi-transparent decorative header) */}
          <div className="position-absolute top-0 end-0 pointer-events-none opacity-25 d-none d-lg-block" style={{ width: '360px', height: '360px' }}>
            <Hero3DIllustration />
          </div>

          <div className="container-xl position-relative z-1" style={{ maxWidth: '1100px' }}>
            
            {/* Header section with search bar and filter button */}
            <header className="row g-4 mb-4 align-items-end justify-content-between">
              <div className="col-12 col-lg-6">
                <h1 className="display-6 fw-bold text-dark mb-1">Explore Courses</h1>
                <p className="text-secondary mb-0">Master new skills with our premium selection of curated online courses from world-class experts.</p>
              </div>

              <div className="col-12 col-lg-6 d-flex align-items-center gap-3">
                <div className="position-relative flex-grow-1">
                  <span className="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y text-muted ms-3">search</span>
                  <input 
                    id="searchInput"
                    type="text" 
                    className="form-control py-2.5 ps-5 rounded-3" 
                    placeholder="Search courses..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Combobox category dropdown (required by integration tests) */}
                <div className="d-none d-sm-block" style={{ width: '180px' }}>
                  <label htmlFor="categoryFilter" className="visually-hidden">Category</label>
                  <select 
                    id="categoryFilter"
                    aria-label="Category"
                    className="form-select py-2.5 rounded-3"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categoriesList.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                    {!categoriesList.includes('Backend') && <option value="Backend">Backend</option>}
                    {!categoriesList.includes('Frontend') && <option value="Frontend">Frontend</option>}
                  </select>
                </div>

                <button 
                  onClick={() => {
                    // Mobile filters toggler toggle difficulties/rating selectors
                    setSelectedDifficulties([]);
                    setSelectedRating(0);
                  }}
                  className="btn btn-outline-secondary py-2.5 px-3 rounded-3 d-flex align-items-center gap-1 fw-semibold"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>tune</span>
                  <span>Filter</span>
                </button>
              </div>
            </header>

            {/* Category chips list */}
            <div className="d-flex align-items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar" style={{ borderBottom: '1px solid #f1f3f9' }}>
              <button 
                onClick={() => setSelectedCategory('')}
                className={`custom-chip-btn btn \${!selectedCategory ? 'btn-primary' : 'btn-light border text-secondary'}`}
              >
                All Topics
              </button>
              {['UI/UX Design', 'Software Development', 'Business Strategy', 'Data Science', 'Marketing'].map((topic) => {
                const isActive = selectedCategory.toLowerCase() === topic.toLowerCase();
                return (
                  <button 
                    key={topic}
                    onClick={() => setSelectedCategory(topic)}
                    className={`custom-chip-btn btn \${isActive ? 'btn-primary' : 'btn-light border text-secondary'}`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>

            {/* Course Grid view */}
            {filteredCourses.length === 0 ? (
              <div className="alert alert-warning text-center py-5 rounded border border-warning-subtle shadow-sm my-4" role="alert">
                <h3 className="h5 fw-bold text-warning-emphasis mb-2">No Courses Available</h3>
                <p className="text-muted mb-0 small">
                  We couldn't find any courses matching your search criteria. Please adjust your filters.
                </p>
              </div>
            ) : (
              <div className="row g-4 mb-5">
                {filteredCourses.map((course) => {
                  const isEnrolled = enrolledIds.includes(course.id);
                  const isEnrolling = enrollingCourseId === course.id;

                  return (
                    <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={course.id}>
                      <div className="card h-100 border border-light-subtle rounded-3 overflow-hidden shadow-sm card-hover-scale bg-white flex-column d-flex">
                        
                        {/* Aspect Ratio Header Cover Image */}
                        <div className="position-relative aspect-video overflow-hidden bg-dark">
                          <img 
                            alt={course.title}
                            className="w-100 h-100 object-fit-cover"
                            src={course.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0J7vPA0JlcQ0Y5BdiBoXbeURb17OheHNJhUi9XZJbiCZTnrYa_h7E0wutOO2__IEJXnDe3VKtUqyjqqkqHQN2BoaFjSCpC-E9ZxtUlh4aB0OLYEFM64t93pLh0Hq57O7ZiM_X8v8bFlfFX8UIBMbAKODdH_4hw21oXS5ocPwApsEJIYYp-qf4yDbwRVDmdRMaEFo6Bq7LI2LT-J2ek28d5BcWGzIvpHWqDhtHYlst250zSojtCQ0Ti2siQIMKsIFqeZw-BqzYfYA'}
                          />
                          {course.badge && (
                            <div className="position-absolute top-0 start-0 m-3">
                              <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill small fw-bold">
                                {course.badge}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Contents */}
                        <div className="card-body p-3 d-flex flex-column justify-content-between flex-grow-1">
                          
                          <div>
                            {/* Category and ratings */}
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="badge bg-primary-subtle text-primary uppercase font-monospace" style={{ fontSize: '10px' }}>
                                {course.category || 'Course'}
                              </span>
                              <div className="d-flex align-items-center gap-1">
                                <span className="material-symbols-outlined text-warning" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="small fw-bold text-dark">{course.rating || 4.8}</span>
                                <span className="small text-muted">({course.ratingCount || 100})</span>
                              </div>
                            </div>

                            {/* Title & Instructor */}
                            <h3 className="h6 text-dark fw-bold mb-1 line-clamp-2" style={{ lineHeight: '1.4', minHeight: '40px' }}>
                              {course.title}
                            </h3>
                            <p className="small text-muted mb-3">{course.instructor || 'EduFlow Mentor'}</p>
                          </div>

                          {/* Price & CTA action button */}
                          <div className="mt-auto">
                            <div className="d-flex align-items-baseline gap-2 mb-3">
                              <span className="h5 fw-bold text-dark mb-0">${course.price || '89.99'}</span>
                              {course.originalPrice && (
                                <span className="small text-muted text-decoration-line-through">${course.originalPrice}</span>
                              )}
                            </div>

                            {isEnrolled ? (
                              <Link
                                to={`/course/${course.id}`}
                                data-testid={`resume-link-${course.id}`}
                                className="text-decoration-none"
                              >
                                <button
                                  data-testid={`resume-btn-${course.id}`}
                                  className="btn btn-outline-primary w-100 fw-semibold rounded-3"
                                >
                                  Resume Learning
                                </button>
                              </Link>
                            ) : (
                              <button
                                data-testid={`enroll-btn-${course.id}`}
                                className="btn btn-primary w-100 fw-semibold rounded-3"
                                onClick={() => handleEnroll(course.id)}
                                disabled={isEnrolling}
                              >
                                {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination steppers */}
            <div className="d-flex align-items-center justify-content-center gap-2 mt-5 mb-4">
              <button className="btn btn-outline-secondary p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="d-flex align-items-center gap-1.5">
                <button className="btn btn-primary fw-bold rounded-3" style={{ width: '40px', height: '40px' }}>1</button>
                <button className="btn btn-outline-secondary text-secondary rounded-3" style={{ width: '40px', height: '40px' }}>2</button>
                <button className="btn btn-outline-secondary text-secondary rounded-3" style={{ width: '40px', height: '40px' }}>3</button>
                <span className="text-muted px-1">...</span>
                <button className="btn btn-outline-secondary text-secondary rounded-3" style={{ width: '40px', height: '40px' }}>12</button>
              </div>
              <button className="btn btn-outline-secondary p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

          </div>

          {/* Global Footer inside scroll */}
          <footer className="w-100 py-5 bg-dark text-light border-top mt-5">
            <div className="container-xl" style={{ maxWidth: '1100px' }}>
              <div className="row g-4 mb-4">
                <div className="col-12 col-md-3">
                  <span className="fs-5 fw-bold text-white">EduFlow</span>
                  <p className="mt-3 text-secondary small">Elevating digital education through premium content and seamless learning experiences.</p>
                </div>
                <div className="col-4 col-md-3">
                  <h4 className="fw-bold text-white h6 mb-3">Platform</h4>
                  <ul className="list-unstyled d-flex flex-column gap-2 small">
                    <li><a className="text-secondary text-decoration-none hover-text-primary" href="#">Course Catalog</a></li>
                    <li><a className="text-secondary text-decoration-none hover-text-primary" href="#">Learning Paths</a></li>
                    <li><a className="text-secondary text-decoration-none hover-text-primary" href="#">Instructor Tools</a></li>
                  </ul>
                </div>
                <div className="col-4 col-md-3">
                  <h4 className="fw-bold text-white h6 mb-3">Support</h4>
                  <ul className="list-unstyled d-flex flex-column gap-2 small">
                    <li><a className="text-secondary text-decoration-none hover-text-primary" href="#">Help Center</a></li>
                    <li><a className="text-secondary text-decoration-none hover-text-primary" href="#">Contact Us</a></li>
                    <li><a className="text-secondary text-decoration-none hover-text-primary" href="#">Privacy Policy</a></li>
                  </ul>
                </div>
                <div className="col-12 col-md-3">
                  <h4 className="fw-bold text-white h6 mb-3">Newsletter</h4>
                  <div className="d-flex items-center gap-1.5 mb-2">
                    <input className="form-control form-control-sm bg-white border px-3 py-2 text-dark" placeholder="Your email" type="email"/>
                    <button className="btn btn-primary btn-sm d-flex align-items-center justify-content-center px-3">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
                    </button>
                  </div>
                  <p className="text-secondary" style={{ fontSize: '10px' }}>© 2024 EduFlow LMS. All rights reserved.</p>
                </div>
              </div>
            </div>
          </footer>

        </main>
      </div>

      {/* Floating Action Button for mobile */}
      <button className="d-md-none position-fixed bottom-0 end-0 m-4 w-14 h-14 bg-primary text-white rounded-circle shadow-lg d-flex align-items-center justify-content-center z-3" style={{ width: '56px', height: '56px', border: 'none' }}>
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}
