import React from 'react';

export default function Hero3DIllustration() {
  return (
    <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center overflow-visible" style={{ minHeight: '320px', perspective: '1000px' }}>
      
      {/* Dynamic Keyframes for float and depth shadows */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatBook {
          0%, 100% { transform: translateY(0px) rotate(3deg) rotateX(15deg) rotateY(-10deg); }
          50% { transform: translateY(-12px) rotate(1deg) rotateX(10deg) rotateY(-5deg); }
        }
        @keyframes floatGlobe {
          0%, 100% { transform: translateY(0px) rotate(-5deg) rotateX(10deg) rotateY(15deg); }
          50% { transform: translateY(-16px) rotate(-8deg) rotateX(15deg) rotateY(20deg); }
        }
        @keyframes floatBulb {
          0%, 100% { transform: translateY(0px) rotate(6deg) rotateX(-5deg) rotateY(-15deg); }
          50% { transform: translateY(-10px) rotate(8deg) rotateX(-8deg) rotateY(-20deg); }
        }
        @keyframes floatMinor {
          0%, 100% { transform: translateY(0px) scale(0.95); opacity: 0.7; }
          50% { transform: translateY(-8px) scale(1.05); opacity: 0.9; }
        }
        .animate-book {
          animation: floatBook 6s infinite ease-in-out;
          transform-style: preserve-3d;
        }
        .animate-globe {
          animation: floatGlobe 7s infinite ease-in-out;
          transform-style: preserve-3d;
        }
        .animate-bulb {
          animation: floatBulb 5s infinite ease-in-out;
          transform-style: preserve-3d;
        }
        .animate-minor {
          animation: floatMinor 4s infinite ease-in-out;
        }
        .glass-card-effect {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}} />

      {/* Main Container Layer representing knowledge canvas */}
      <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center">
        
        {/* Floating Book Element */}
        <div 
          className="position-absolute animate-book d-flex align-items-center justify-content-center shadow-lg p-3 rounded-4 glass-card-effect"
          style={{ 
            width: '120px', 
            height: '130px', 
            left: '15%', 
            top: '20%',
            zIndex: 3
          }}
          data-testid="3d-book-node"
        >
          <svg className="w-100 h-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <div className="position-absolute text-primary fw-bold" style={{ bottom: '12px', fontSize: '10px', letterSpacing: '0.1em' }}>KNOWLEDGE</div>
        </div>

        {/* Floating Globe Element */}
        <div 
          className="position-absolute animate-globe d-flex align-items-center justify-content-center shadow-lg p-3 rounded-circle glass-card-effect"
          style={{ 
            width: '140px', 
            height: '140px', 
            right: '12%', 
            top: '35%',
            zIndex: 2,
            color: '#14b8a6'
          }}
          data-testid="3d-globe-node"
        >
          <svg className="w-100 h-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
          </svg>
          <div className="position-absolute fw-bold" style={{ bottom: '15px', fontSize: '9px', letterSpacing: '0.15em', color: '#14b8a6' }}>GLOBAL</div>
        </div>

        {/* Floating Lightbulb Element */}
        <div 
          className="position-absolute animate-bulb d-flex align-items-center justify-content-center shadow-lg p-3 rounded-4 glass-card-effect"
          style={{ 
            width: '110px', 
            height: '110px', 
            left: '42%', 
            bottom: '12%',
            zIndex: 4,
            color: '#f59e0b'
          }}
          data-testid="3d-bulb-node"
        >
          <svg className="w-100 h-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3m0 0h.01m-.01 0H12m0-3a5.969 5.969 0 01-4.743-2.318 6.002 6.002 0 011.538-8.243 6 6 0 018.41 1.538 6.002 6.002 0 01-1.538 8.243A5.968 5.968 0 0112 18zM9.75 18h4.5" />
          </svg>
          <div className="position-absolute fw-bold" style={{ bottom: '10px', fontSize: '9px', letterSpacing: '0.1em', color: '#f59e0b' }}>IDEAS</div>
        </div>

        {/* Backdrop Decorative Shapes (Spheres, Rings) */}
        <div 
          className="position-absolute rounded-circle animate-minor bg-primary bg-opacity-10 border border-primary border-opacity-25"
          style={{ width: '48px', height: '48px', left: '10%', bottom: '30%', zIndex: 1 }}
        />
        
        <div 
          className="position-absolute rounded-circle animate-minor bg-info bg-opacity-10 border border-info border-opacity-25"
          style={{ width: '32px', height: '32px', right: '25%', top: '15%', zIndex: 1, animationDelay: '1.5s' }}
        />

        <div 
          className="position-absolute rounded-circle animate-minor bg-warning bg-opacity-10 border border-warning border-opacity-25"
          style={{ width: '24px', height: '24px', left: '48%', top: '10%', zIndex: 1, animationDelay: '0.8s' }}
        />

        {/* Central Ambient Radial Glow */}
        <div 
          className="position-absolute rounded-circle bg-primary bg-opacity-10"
          style={{ width: '300px', height: '300px', filter: 'blur(60px)', zIndex: 0 }}
        />
      </div>
    </div>
  );
}
