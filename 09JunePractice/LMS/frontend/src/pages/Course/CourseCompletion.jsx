import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserBadges } from '../../services/gamificationService';

const DEFAULT_COURSE_DATA = {
  id: 'c-default',
  title: 'Advanced UI Design: The Art of Systems',
  finalScore: '98%',
  completionDate: 'May 24, 2024',
  timeInvested: '42 Hours',
  modulesCleared: '12 / 12',
  instructorName: 'Sarah J. Miller',
  certificateId: 'EF-99234-AXS'
};

const DEFAULT_LEARNER_DATA = {
  name: 'Alex Sterling',
  profilePicture: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkFwQVqaaHSB7aV-Cs-W1eKtBYV5JuuOMJfpN61nAFYwPY8P9RQM3IGAX7uHk3tENmf-dwLHNUClpAh05fr6Lp939zmIxG94y3MEHSWkcMTZ9CBqn3VM8mBrmgnf9LLkTQOaUUuu3pLMAZX6gYNdZIi095PEPiJp8ZL1t9YX3WBHNBvwn94e-iGtHZU9R2i3p1SKWZpKRrjVYW85jkPSWrwBEsofAn_sfo3vO2LIpTjAZxyFZsIOZUwZwMPOnt3WwS7BbpioI3Inq2'
};

export default function CourseCompletion({
  course = null,
  learner = null,
  onDownload = null,
  onShare = null,
  onViewFeedback = null
}) {
  const { courseId } = useParams();
  const location = useLocation();
  const canvasRef = useRef(null);

  let auth = null;
  try {
    auth = useAuth();
  } catch (e) {}

  const user = auth?.user;
  const token = auth?.token || localStorage.getItem('token') || '';

  const [courseData, setCourseData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [awardedBadges, setAwardedBadges] = useState([]);

  const examResult = location.state?.result;
  const finalScoreString = examResult ? `${examResult.score}%` : '95%';

  useEffect(() => {
    const fetchCourseAndBadges = async () => {
      try {
        const [courseRes, badgesRes] = await Promise.all([
          fetch(`/courses/${courseId}`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
          getUserBadges().catch(() => ({ data: [] }))
        ]);

        if (courseRes?.ok) {
          const result = await courseRes.json();
          if (result.success && result.data) {
            setCourseData(result.data);
          }
        }
        
        // Filter badges to show only those awarded for this course
        if (badgesRes?.data) {
          const courseBadges = badgesRes.data.filter(b => b.badgeId && b.badgeId.courseId === courseId);
          setAwardedBadges(courseBadges);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (courseId) fetchCourseAndBadges();
  }, [courseId, token]);

  const activeCourse = useMemo(() => {
    const base = course || courseData;
    if (!base && !courseId) return DEFAULT_COURSE_DATA;
    return {
      id: courseId || base?.id || 'c-default',
      title: base?.title || 'Mastering WebGL',
      finalScore: base?.finalScore || finalScoreString,
      completionDate: base?.completionDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      timeInvested: base?.timeInvested || '32 Hours',
      modulesCleared: base?.modulesCleared || (base?.modules ? `${base.modules.length} / ${base.modules.length}` : '4 / 4'),
      instructorName: base?.instructorName || 'Dr. Marcus Thorne',
      certificateId: base?.certificateId || ('CERT-' + (courseId ? courseId.slice(-5) : '882XR') + '-' + Math.floor(Math.random() * 1000))
    };
  }, [course, courseData, courseId, finalScoreString]);

  const activeLearner = useMemo(() => {
    if (!user && !learner) return DEFAULT_LEARNER_DATA;
    return {
      name: user?.name || learner?.name || 'Alex Sterling',
      profilePicture: learner?.profilePicture || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkFwQVqaaHSB7aV-Cs-W1eKtBYV5JuuOMJfpN61nAFYwPY8P9RQM3IGAX7uHk3tENmf-dwLHNUClpAh05fr6Lp939zmIxG94y3MEHSWkcMTZ9CBqn3VM8mBrmgnf9LLkTQOaUUuu3pLMAZX6gYNdZIi095PEPiJp8ZL1t9YX3WBHNBvwn94e-iGtHZU9R2i3p1SKWZpKRrjVYW85jkPSWrwBEsofAn_sfo3vO2LIpTjAZxyFZsIOZUwZwMPOnt3WwS7BbpioI3Inq2'
    };
  }, [user, learner]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx;
    try {
      ctx = canvas.getContext('2d');
    } catch (e) {
      return;
    }
    if (!ctx) return;
    let animationFrameId;
    let particles = [];
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#3b82f6', '#10b981', '#312e81'];

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    class ConfettiParticle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.size = Math.random() * 8 + 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speed = Math.random() * 3 + 2;
        this.angle = Math.random() * 360;
        this.rotation = Math.random() * 5;
      }

      update() {
        this.y += this.speed;
        this.angle += this.rotation;
        if (this.y > canvas.height) {
          this.y = -20;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.angle * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(120, Math.floor(window.innerWidth / 10));
      for (let i = 0; i < particleCount; i++) {
        particles.push(new ConfettiParticle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    initParticles();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDownloadClick = async (e) => {
    if (e) e.preventDefault();
    if (onDownload) {
      onDownload();
      return;
    }
    
    setDownloading(true);
    try {
      const response = await fetch(`/courses/${courseId}/certificate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Certificate download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeCourse.title || 'course'}-certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download certificate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    } else {
      alert('Share link copied to clipboard!');
    }
  };

  const handleViewFeedbackClick = () => {
    if (onViewFeedback) {
      onViewFeedback();
    } else {
      alert('Displaying course feedback logs.');
    }
  };

  const congratsName = activeLearner.name.includes('Alex') ? 'Alex' : activeLearner.name;

  return (
    <div className="container-fluid p-0 d-flex flex-column min-vh-100 animate-fade-in" style={{ backgroundColor: 'var(--bg-neutral)', position: 'relative' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .certificate-frame-premium {
          border: 16px solid #f8fafc;
          outline: 1px solid #cbd5e1;
          outline-offset: -8px;
          background-color: #ffffff;
          position: relative;
          box-shadow: var(--shadow-lg);
        }
        .gold-seal-badge {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: conic-gradient(#BF953F, #FCF6BA, #B38728, #FBF5B7, #BF953F);
          box-shadow: 0 4px 10px rgba(179, 135, 40, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(12deg);
        }
        .gold-seal-inner {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          border: 2px dashed #8a6d29;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .seal-ribbon-left, .seal-ribbon-right {
          position: absolute;
          bottom: -24px;
          width: 16px;
          height: 48px;
          background-color: #B38728;
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%);
        }
        .seal-ribbon-left {
          left: calc(50% - 14px);
          transform: rotate(5deg);
        }
        .seal-ribbon-right {
          left: calc(50% + 2px);
          transform: rotate(-5deg);
        }
        .bounce-badge {
          animation: bounceBadge 2.5s infinite ease-in-out;
        }
        @keyframes bounceBadge {
          0%, 100% { transform: translateY(0) scale(1.02); }
          50% { transform: translateY(-4px) scale(1.05); }
        }
        .font-serif-custom {
          font-family: Georgia, serif;
        }
      `}} />

      {/* Confetti Physics Layer */}
      <canvas
        ref={canvasRef}
        style={{
          pointerEvents: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10
        }}
      />

      {/* Top Nav Bar */}
      <header className="nav-premium-top justify-content-between" style={{ zIndex: 100 }}>
        <div className="d-flex align-items-center gap-3">
          <Link to="/" className="text-decoration-none fw-extrabold text-primary fs-4" style={{ letterSpacing: '-0.02em' }}>EduFlow</Link>
          <nav className="d-none d-md-flex gap-3 ms-4">
            <Link to="/courses" className="text-secondary text-decoration-none hover-text-primary text-sm">Catalog</Link>
            <Link to="/dashboard" className="text-primary text-decoration-none text-sm fw-semibold">My Learning</Link>
          </nav>
        </div>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-link text-secondary p-2 text-decoration-none hover-text-primary" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="rounded-circle overflow-hidden border" style={{ width: '32px', height: '32px' }}>
            <img 
              alt="User profile" 
              className="w-100 h-100 object-fit-cover" 
              src={activeLearner.profilePicture}
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container-xl flex-grow-1 px-4" style={{ paddingTop: '40px', paddingBottom: '60px', position: 'relative', zIndex: 20 }}>
        {/* Celebration Header */}
        <header className="text-center mb-5 mt-4">
          <div 
            className="bounce-badge bg-primary rounded-circle d-inline-flex align-items-center justify-content-center text-white mb-3 shadow-lg"
            style={{ width: '80px', height: '80px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
          </div>
          <h1 className="display-5 fw-bold text-primary mb-2">{`Congratulations, ${congratsName}!`}</h1>
          <p className="lead text-secondary mx-auto" style={{ maxWidth: '640px', fontSize: '1.05rem' }}>
            You have successfully completed <span className="fw-bold text-dark">{activeCourse.title}</span>. You've demonstrated exceptional skill and dedication.
          </p>
        </header>

        {/* Grid Split Content */}
        <div className="row g-4">
          {/* Left Column: Summary and CTA */}
          <div className="col-12 col-lg-4 d-flex flex-column gap-4">
            {/* Performance Summary Card */}
            <section className="card-premium bg-white p-4">
              <h2 className="h6 fw-bold mb-4 text-dark d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-primary">assessment</span>
                Performance Summary
              </h2>
              
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom">
                  <span className="small text-muted fw-bold uppercase">FINAL SCORE</span>
                  <span className="h4 fw-bold text-primary mb-0">{activeCourse.finalScore}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom">
                  <span className="small text-muted fw-bold">COMPLETION DATE</span>
                  <span className="small fw-semibold text-dark">{activeCourse.completionDate}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom">
                  <span className="small text-muted fw-bold">TIME INVESTED</span>
                  <span className="small fw-semibold text-dark">{activeCourse.timeInvested}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted fw-bold">MODULES CLEARED</span>
                  <span className="small fw-semibold text-dark">{activeCourse.modulesCleared}</span>
                </div>
              </div>
            </section>

            {/* Earned Badges Section */}
            {awardedBadges.length > 0 && (
              <section className="card-premium bg-white p-4">
                <h2 className="h6 fw-bold mb-4 text-dark d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-warning" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                  Earned Badges
                </h2>
                <div className="d-flex flex-wrap gap-3">
                  {awardedBadges.map((ub, idx) => (
                    <div key={idx} className="text-center d-flex flex-column align-items-center" style={{ width: '80px' }}>
                      <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm mb-2" 
                           style={{ width: '56px', height: '56px', background: 'var(--primary-light)' }}>
                        {ub.badgeId.iconUrl && ub.badgeId.iconUrl.startsWith('http') ? (
                          <img src={ub.badgeId.iconUrl} alt="Badge Icon" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          <span className="fs-1">{ub.badgeId.iconUrl || '🏆'}</span>
                        )}
                      </div>
                      <span className="small fw-semibold text-dark" style={{ fontSize: '10px', lineHeight: '1.2' }}>{ub.badgeId.title}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Actions list */}
            <div className="d-flex flex-column gap-2">
              <button 
                onClick={handleDownloadClick}
                disabled={downloading}
                className="btn-premium-primary py-3 w-100"
              >
                <span className="material-symbols-outlined fs-5">download</span>
                {downloading ? 'Downloading...' : 'Download PDF Certificate'}
              </button>
              
              <button 
                onClick={handleShareClick}
                className="btn-premium-secondary py-3 w-100"
              >
                <span className="material-symbols-outlined fs-5">share</span>
                Share Achievement
              </button>
              
              <button 
                onClick={handleViewFeedbackClick}
                className="btn btn-link text-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-1 text-decoration-none"
              >
                View Course Feedback
                <span className="material-symbols-outlined fs-5">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Right Column: Certificate Print Frame */}
          <div className="col-12 col-lg-8">
            <div className="bg-white rounded-3 shadow border overflow-hidden">
              {/* Outer frame matching parchment landscape layout ratio */}
              <div className="certificate-frame-premium p-4 p-md-5 d-flex flex-column align-items-center justify-content-center text-center">
                {/* Logo top Header */}
                <div className="position-relative mb-4">
                  <span className="fs-5 fw-bold text-primary tracking-widest uppercase">EduFlow Academy</span>
                  <div className="bg-primary mx-auto mt-2" style={{ width: '48px', height: '2px' }}></div>
                </div>

                {/* Main Wording */}
                <p className="font-serif-custom fs-5 text-secondary mb-2 fst-italic">This is to certify that</p>
                <h2 className="font-serif-custom display-6 fw-bold text-dark mb-4 leading-tight">{activeLearner.name}</h2>
                <div className="mb-4" style={{ width: '75%', height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                
                <p className="font-serif-custom fs-6 text-secondary mb-5 max-w-lg mx-auto" style={{ maxWidth: '500px', lineHeight: '1.6' }}>
                  has successfully completed the comprehensive professional curriculum of 
                  <span className="fw-bold d-block mt-2 text-dark fst-normal">{activeCourse.title}</span>
                </p>

                {/* Bottom Signature & Gold Seal row */}
                <div className="row w-100 align-items-end mt-4">
                  {/* Left: Instructor Sign */}
                  <div className="col-4 text-center">
                    <div className="font-serif-custom fs-6 mb-1 fst-italic">{activeCourse.instructorName}</div>
                    <div className="bg-secondary bg-opacity-20 mx-auto mb-2" style={{ width: '120px', height: '1px' }}></div>
                    <span className="small text-secondary uppercase tracking-widest" style={{ fontSize: '9px', fontWeight: '600' }}>LEAD INSTRUCTOR</span>
                  </div>

                  {/* Center: Gold Medal Seal */}
                  <div className="col-4 d-flex justify-content-center position-relative">
                    <div className="gold-seal-badge">
                      <div className="gold-seal-inner">
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '40px', color: '#5C4033', fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                      </div>
                      <div className="seal-ribbon-left" />
                      <div className="seal-ribbon-right" />
                    </div>
                  </div>

                  {/* Right: Issuance date */}
                  <div className="col-4 text-center">
                    <div className="font-serif-custom fs-6 mb-1">{activeCourse.completionDate}</div>
                    <div className="bg-secondary bg-opacity-20 mx-auto mb-2" style={{ width: '120px', height: '1px' }}></div>
                    <span className="small text-secondary uppercase tracking-widest" style={{ fontSize: '9px', fontWeight: '600' }}>ISSUE DATE</span>
                  </div>
                </div>

                {/* Verification credential ID code */}
                <div className="position-absolute bottom-0 end-0 p-3">
                  <span className="font-monospace text-muted" style={{ fontSize: '9px', letterSpacing: '0.1em' }}>
                    {`CERT-ID: ${activeCourse.certificateId}`}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center mt-3 text-secondary small fst-italic">
              Verified Digital Credential — Issued by EduFlow Certification Authority
            </p>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="bg-dark text-light py-4 mt-auto">
        <div className="container text-center">
          <p className="small text-secondary mb-0">© 2026 EduFlow LMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
