import React, { useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';

// Default mock values for course and learner details
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
  profilePicture: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNiIIqEmidwzZUzXytCbWTh6o9QIfrcvMx_uT7n3Qo6yOFyRmXMsW9fJgEkcvknUMlDOCYa29dm31Lv9gjeJ_f3aKwJyG-bWF53SH1irdzu_ylyaQnkWoLF_ozd_izukOzBFVIDGSzmW2B0J3Bilf9wMfyxXduf6g6qv1Ra9hzO-kKpuwzX4E2o0FipveMEGdv_20UpBO4n9fqcf7-Y4mehkeCxN19My9HbPoV_NXNd7bOxgAiXn7MnuPFEsS0zJl9Yj01hKcjAGw'
};

export default function CourseCompletion({
  course = null,
  learner = null,
  onDownload = null,
  onShare = null,
  onViewFeedback = null
}) {
  const canvasRef = useRef(null);

  // Memoize parameters with default values
  const activeCourse = useMemo(() => {
    return course ? { ...DEFAULT_COURSE_DATA, ...course } : DEFAULT_COURSE_DATA;
  }, [course]);

  const activeLearner = useMemo(() => {
    return learner ? { ...DEFAULT_LEARNER_DATA, ...learner } : DEFAULT_LEARNER_DATA;
  }, [learner]);

  // Confetti canvas animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx;
    try {
      ctx = canvas.getContext('2d');
    } catch (e) {
      // Canvas is not implemented in JSDOM testing environment without npm canvas package
      return;
    }
    if (!ctx) return;
    let animationFrameId;
    let particles = [];
    const colors = ['#004ac6', '#6df5e1', '#2563eb', '#ffddb8', '#ffd700', '#006b5f'];

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        // set height to fit the window, clamped or scrolling
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

    // Cleanup resources on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // CTA Click handlers with fallback scaling animations
  const handleDownloadClick = (e) => {
    if (onDownload) {
      onDownload();
    } else {
      console.log('Downloading PDF certificate...');
      alert('Your certificate download has started!');
    }
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    } else {
      console.log('Sharing achievement...');
      alert('Share link copied to clipboard!');
    }
  };

  const handleViewFeedbackClick = () => {
    if (onViewFeedback) {
      onViewFeedback();
    } else {
      console.log('Redirecting to feedback...');
      alert('Displaying course feedback logs.');
    }
  };

  const congratsName = activeLearner.name === DEFAULT_LEARNER_DATA.name ? 'Alex' : activeLearner.name;

  return (
    <div className="container-fluid p-0 d-flex flex-column min-vh-100 bg-light text-dark overflow-x-hidden position-relative">
      
      {/* Styles for custom decorations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .glass-nav-completion {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          background-color: rgba(255, 255, 255, 0.85);
        }
        .confetti-canvas-overlay {
          pointer-events: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1;
        }
        .certificate-frame {
          border: 16px solid #FDFCF0;
          outline: 1px solid #D1B48C;
          outline-offset: -8px;
          background-color: #FFFEFA;
          position: relative;
          box-shadow: 0 1rem 3rem rgba(0,0,0,0.125);
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
        @keyframes bounceBadge {
          0%, 100% { transform: translateY(0) scale(1.05); }
          50% { transform: translateY(-8px) scale(1.08); }
        }
        .badge-animation-bounce {
          animation: bounceBadge 2.5s infinite ease-in-out;
        }
        .serif-text {
          font-family: 'Playfair Display', Georgia, serif;
        }
      `}} />

      {/* Confetti Physics Layer */}
      <canvas ref={canvasRef} className="confetti-canvas-overlay" />

      {/* Top Navigation Bar */}
      <nav className="fixed-top w-100 glass-nav-completion border-bottom shadow-sm z-3" style={{ height: '64px' }}>
        <div className="container-xl h-100 d-flex align-items-center justify-content-between px-4">
          <div className="d-flex align-items-center gap-3">
            <span className="fs-4 fw-bold text-primary tracking-tight">EduFlow</span>
            <div className="d-none d-md-flex align-items-center gap-3 ms-4">
              <Link to="/courses" className="text-secondary text-decoration-none small hover-text-primary">Courses</Link>
              <a href="#mentors" className="text-secondary text-decoration-none small hover-text-primary">Mentors</a>
              <a href="#pricing" className="text-secondary text-decoration-none small hover-text-primary">Pricing</a>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-link p-2 text-secondary hover-text-primary" aria-label="Notifications">
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
        </div>
      </nav>

      {/* Main Container */}
      <main className="container-xl flex-grow-1 px-4 z-2" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
        
        {/* Celebration Header */}
        <header className="text-center mb-5">
          <div 
            className="badge-animation-bounce bg-primary rounded-circle d-inline-flex align-items-center justify-content-center text-white mb-3 shadow-lg"
            style={{ width: '80px', height: '80px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
          </div>
          <h1 className="display-5 fw-bold text-primary mb-2">Congratulations, {congratsName}!</h1>
          <p className="lead text-secondary mx-auto" style={{ maxWidth: '640px' }}>
            You have successfully completed <span className="fw-bold text-dark">{activeCourse.title}</span>. You've demonstrated exceptional skill and dedication.
          </p>
        </header>

        {/* Grid Split Content */}
        <div className="row g-4">
          
          {/* Left Column: Summary and CTA */}
          <div className="col-12 col-lg-4 d-flex flex-column gap-4">
            
            {/* Performance Summary Card */}
            <section className="card border-light-subtle shadow-sm rounded-3 p-4 bg-white">
              <h2 className="h5 fw-bold mb-4 text-dark">Performance Summary</h2>
              
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom border-light-subtle">
                  <span className="small text-muted fw-bold uppercase">FINAL SCORE</span>
                  <span className="h4 fw-bold text-primary mb-0">{activeCourse.finalScore}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom border-light-subtle">
                  <span className="small text-muted fw-bold">COMPLETION DATE</span>
                  <span className="small fw-semibold text-dark">{activeCourse.completionDate}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom border-light-subtle">
                  <span className="small text-muted fw-bold">TIME INVESTED</span>
                  <span className="small fw-semibold text-dark">{activeCourse.timeInvested}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted fw-bold">MODULES CLEARED</span>
                  <span className="small fw-semibold text-dark">{activeCourse.modulesCleared}</span>
                </div>
              </div>
            </section>

            {/* Actions list */}
            <div className="d-flex flex-column gap-2">
              <button 
                onClick={handleDownloadClick}
                className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3"
              >
                <span className="material-symbols-outlined">download</span>
                Download PDF Certificate
              </button>
              
              <button 
                onClick={handleShareClick}
                className="btn btn-white border border-secondary-subtle w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2 bg-white text-dark rounded-3"
              >
                <span className="material-symbols-outlined">share</span>
                Share Achievement
              </button>
              
              <button 
                onClick={handleViewFeedbackClick}
                className="btn btn-link text-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-1 text-decoration-none"
              >
                View Course Feedback
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Right Column: Certificate Print Frame */}
          <div className="col-12 col-lg-8">
            <div className="bg-white rounded-3 shadow border overflow-hidden">
              
              {/* Outer frame matching parchment landscape layout ratio */}
              <div className="certificate-frame p-4 p-md-5 d-flex flex-column align-items-center justify-content-center text-center">
                
                {/* Subtle parchment background watermark details */}
                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-5 pointer-events-none overflow-hidden">
                  <img 
                    className="w-100 h-100 object-fit-cover" 
                    alt="Parchment backdrop"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLP2g_5i2byXM4otrTCgjKDG-oWjD4pXlvq4-f2MXiHzb2V-WNkCHZAfYuOr4RIFu75LHE2P_B67iaCz8dVlCLM0RUJrfNF-4Vw8SwkhDnr_1x9_CzPcJpzHvAUWwrGtMUKyqWlKMScuLkz3Keegb1f6dNilCYbsPpIWVuB4-uBTU4ZECQnKgXGIfjku7swzfuu33odvhHcIDN42B69bSlJuU6YQjbYCOUNDkf9Jcb6L8X4k7jUiLLxI40EZsvlmAK5PA9huGlkMw"
                  />
                </div>

                {/* Logo top Header */}
                <div className="position-relative mb-4">
                  <span className="fs-5 fw-bold text-primary tracking-widest uppercase">EduFlow</span>
                  <div className="bg-secondary-subtle mx-auto mt-2" style={{ width: '64px', height: '2px' }}></div>
                </div>

                {/* Main Wording */}
                <p className="serif-text fs-5 text-secondary mb-2 fst-italic">This is to certify that</p>
                <h2 className="serif-text display-4 fw-bold text-dark mb-4 leading-tight">{activeLearner.name}</h2>
                <div className="bg-light-subtle mb-4" style={{ width: '75%', height: '1px' }}></div>
                
                <p className="serif-text fs-5 text-secondary mb-5 max-w-lg mx-auto" style={{ maxWidth: '500px' }}>
                  has successfully completed the comprehensive professional curriculum of 
                  <span className="fw-bold d-block mt-2 text-dark fst-normal">{activeCourse.title}</span>
                </p>

                {/* Bottom Signature & Gold Seal row */}
                <div className="row w-100 align-items-end mt-4">
                  
                  {/* Left: Instructor Sign */}
                  <div className="col-4 text-center">
                    <div className="serif-text fs-5 mb-1 fst-italic">{activeCourse.instructorName}</div>
                    <div className="bg-secondary-subtle mx-auto mb-2" style={{ width: '120px', height: '1px' }}></div>
                    <span className="small text-secondary uppercase tracking-widest" style={{ fontSize: '10px' }}>LEAD INSTRUCTOR</span>
                  </div>

                  {/* Center: Gold Medal Seal */}
                  <div className="col-4 d-flex justify-content-center position-relative">
                    <div className="gold-seal-badge">
                      <div className="gold-seal-inner">
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '40px', color: '#5C4033', fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                      </div>
                      {/* Ribbon decorations */}
                      <div className="seal-ribbon-left" />
                      <div className="seal-ribbon-right" />
                    </div>
                  </div>

                  {/* Right: Issuance date */}
                  <div className="col-4 text-center">
                    <div className="serif-text fs-5 mb-1">{activeCourse.completionDate}</div>
                    <div className="bg-secondary-subtle mx-auto mb-2" style={{ width: '120px', height: '1px' }}></div>
                    <span className="small text-secondary uppercase tracking-widest" style={{ fontSize: '10px' }}>ISSUE DATE</span>
                  </div>
                </div>

                {/* Verification credential ID code */}
                <div className="position-absolute bottom-0 end-0 p-3">
                  <span className="font-monospace text-muted" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                    CERT-ID: {activeCourse.certificateId}
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
      <footer className="bg-dark text-light py-5 mt-auto z-2">
        <div className="container-xl">
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-6">
              <span className="fs-4 fw-bold text-white">EduFlow</span>
              <p className="mt-3 text-secondary" style={{ maxWidth: '360px' }}>
                Empowering learners worldwide through world-class educational systems and modern pedagogical approaches.
              </p>
            </div>
            <div className="col-6 col-md-3 d-flex flex-column gap-2">
              <h4 className="h6 fw-bold text-white mb-2">Resource</h4>
              <a href="#privacy" className="text-secondary text-decoration-none small hover-text-primary">Privacy Policy</a>
              <a href="#terms" className="text-secondary text-decoration-none small hover-text-primary">Terms of Service</a>
            </div>
            <div className="col-6 col-md-3 d-flex flex-column gap-2">
              <h4 className="h6 fw-bold text-white mb-2">Connect</h4>
              <a href="#contact" className="text-secondary text-decoration-none small hover-text-primary">Contact Us</a>
              <a href="#cookies" className="text-secondary text-decoration-none small hover-text-primary">Cookie Policy</a>
            </div>
          </div>
          
          <div className="pt-4 border-top border-secondary text-center">
            <p className="small text-secondary mb-0">© 2024 EduFlow LMS. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
