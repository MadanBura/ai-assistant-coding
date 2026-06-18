import React, { useState, useEffect } from 'react';
import { getUserBadges } from '../../services/gamificationService';

const GRADIENTS = [
  'linear-gradient(135deg,#FFD700,#FFA500)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fd7043,#ff8a65)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
];

function BadgeCard({ badge, unlockedAt }) {
  const g = GRADIENTS[(badge.title?.charCodeAt(0) || 0) % GRADIENTS.length];
  return (
    <div className="text-center p-3" style={{ minWidth: '140px' }} role="article" aria-label={badge.title}>
      {badge.iconUrl && (badge.iconUrl.startsWith('http') || badge.iconUrl.startsWith('/')) ? (
        <img
          src={badge.iconUrl}
          alt={badge.title}
          className="rounded-circle mb-3"
          style={{ width: 64, height: 64, objectFit: 'cover', border: '3px solid var(--border-color)' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: 64, height: 64, background: g, boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }}
        >
          <span className="material-symbols-outlined text-white" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>
            military_tech
          </span>
        </div>
      )}
      <h4 className="small fw-bold text-dark mb-1">{badge.title}</h4>
      {badge.description && (
        <p className="text-muted-custom mb-1" style={{ fontSize: '11px', lineHeight: 1.4 }}>{badge.description}</p>
      )}
      {unlockedAt && (
        <span className="badge-premium badge-premium-primary" style={{ fontSize: '10px' }}>
          {new Date(unlockedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="d-flex gap-3 flex-wrap" aria-busy="true">
      {[1, 2, 3].map(i => (
        <div key={i} className="text-center" style={{ width: 140 }}>
          <div className="skeleton-shimmer rounded-circle mx-auto mb-2" style={{ width: 64, height: 64 }} />
          <div className="skeleton-shimmer mx-auto mb-1 rounded" style={{ width: 100, height: 12 }} />
          <div className="skeleton-shimmer mx-auto rounded" style={{ width: 70, height: 10 }} />
        </div>
      ))}
    </div>
  );
}

export default function BadgeGallery() {
  const [userBadges, setUserBadges] = useState(undefined);
  const [fetchErr, setFetchErr]     = useState('');

  const load = async () => {
    setFetchErr('');
    setUserBadges(undefined);
    try {
      const res = await getUserBadges();
      setUserBadges(res.data || []);
    } catch (err) {
      setFetchErr(err.message);
      setUserBadges([]);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h3 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
          military_tech
        </span>
        My Achievements
      </h3>

      {userBadges === undefined && <Skeleton />}

      {fetchErr && (
        <div className="alert alert-danger py-2 px-3 small" role="alert">
          {fetchErr}
          <button type="button" className="btn btn-sm btn-link py-0 ms-1" onClick={load}>Retry</button>
        </div>
      )}

      {Array.isArray(userBadges) && userBadges.length === 0 && (
        <div className="text-center py-4">
          <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}>
            military_tech
          </span>
          <p className="small text-secondary mb-0">
            No badges earned yet. Complete courses and ace quizzes to unlock achievements!
          </p>
        </div>
      )}

      {Array.isArray(userBadges) && userBadges.length > 0 && (
        <div className="d-flex flex-wrap gap-2" role="list" aria-label="Earned badges">
          {userBadges.map((ub, idx) => {
            const badge = ub.badgeId;
            if (!badge) return null;
            return (
              <div key={badge.id || idx} role="listitem">
                <BadgeCard badge={badge} unlockedAt={ub.unlockedAt} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
