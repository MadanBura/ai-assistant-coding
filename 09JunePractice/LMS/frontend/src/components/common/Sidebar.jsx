import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  let auth = null;
  try {
    auth = useAuth();
  } catch (e) {
    // Auth context missing in tests
  }

  const logout = auth?.logout || (() => {});
  const user = auth?.user || null;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isInstructor = user?.role === 'Instructor';
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="sidebar-premium">
      <style>{`
        .sidebar-premium {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 260px;
          background: #ffffff;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow-y: auto;
          padding: 0;
        }

        .sidebar-logo-area {
          padding: 20px 20px 16px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .sidebar-logo-icon {
          width: 36px;
          height: 36px;
          background: var(--primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-logo-icon .material-symbols-outlined {
          font-size: 20px;
          color: #ffffff;
        }

        .sidebar-logo-text {
          font-weight: 800;
          font-size: 1.05rem;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .sidebar-logo-tagline {
          font-size: 0.65rem;
          color: var(--text-secondary);
          font-weight: 500;
          margin-top: 1px;
          letter-spacing: 0.02em;
        }

        .sidebar-section {
          padding: 16px 12px 8px;
          flex: 1;
        }

        .sidebar-section-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0 8px;
          margin-bottom: 6px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.15s ease;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          text-decoration: none;
          margin-bottom: 2px;
        }

        .sidebar-item .material-symbols-outlined {
          font-size: 18px;
          flex-shrink: 0;
          transition: color 0.15s;
        }

        .sidebar-item:hover {
          background: var(--bg-neutral);
          color: var(--text-primary);
          text-decoration: none;
        }

        .sidebar-item:hover .material-symbols-outlined {
          color: var(--primary);
        }

        .sidebar-item.active {
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 600;
        }

        .sidebar-item.active .material-symbols-outlined {
          color: var(--primary);
        }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .sidebar-user-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          background: var(--bg-neutral);
          margin-bottom: 8px;
        }

        .sidebar-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--primary);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }

        .sidebar-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sidebar-user-name {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-user-role {
          font-size: 0.7rem;
          color: var(--text-secondary);
          line-height: 1;
        }

        .sidebar-switch-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 500;
          background: transparent;
          border: 1px solid var(--border-color);
          width: 100%;
          text-align: left;
          text-decoration: none;
          transition: all 0.15s;
          margin-bottom: 6px;
        }

        .sidebar-switch-btn:hover {
          background: var(--bg-neutral);
          color: var(--primary);
          border-color: var(--primary);
          text-decoration: none;
        }

        .sidebar-switch-btn .material-symbols-outlined {
          font-size: 16px;
        }

        .sidebar-logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: var(--radius-md);
          color: #ef4444;
          font-size: 0.825rem;
          font-weight: 500;
          background: transparent;
          border: 1px solid #fecaca;
          width: 100%;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }

        .sidebar-logout-btn:hover {
          background: #fff5f5;
          border-color: #ef4444;
        }

        .sidebar-logout-btn .material-symbols-outlined {
          font-size: 16px;
        }

        .sidebar-divider {
          height: 1px;
          background: var(--border-color);
          margin: 8px 0;
        }
      `}</style>

      {/* Logo */}
      <div className="sidebar-logo-area">
        <div className="sidebar-logo-icon">
          <span className="material-symbols-outlined">local_library</span>
        </div>
        <div>
          <div className="sidebar-logo-text">EduFlow</div>
          <div className="sidebar-logo-tagline">Learning Management System</div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-section">
        {isInstructor ? (
          <>
            <div className="sidebar-section-label">Instructor Portal</div>

            <NavLink
              to="/instructor"
              end
              className={({ isActive }) =>
                `sidebar-item text-decoration-none ${isActive ? 'active' : ''}`
              }
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/instructor/courses"
              className={({ isActive }) =>
                `sidebar-item text-decoration-none ${isActive ? 'active' : ''}`
              }
            >
              <span className="material-symbols-outlined">menu_book</span>
              <span>Course Manager</span>
            </NavLink>

            <NavLink
              to="/course/create"
              className={({ isActive }) =>
                `sidebar-item text-decoration-none ${isActive ? 'active' : ''}`
              }
            >
              <span className="material-symbols-outlined">add_box</span>
              <span>Create Course</span>
            </NavLink>

            <NavLink
              to="/instructor/modules/global"
              className={({ isActive }) =>
                `sidebar-item text-decoration-none ${isActive ? 'active' : ''}`
              }
            >
              <span className="material-symbols-outlined">view_module</span>
              <span>Create Module</span>
            </NavLink>

            <NavLink
              to="/instructor/gamification/badges"
              className={({ isActive }) =>
                `sidebar-item text-decoration-none ${isActive ? 'active' : ''}`
              }
            >
              <span className="material-symbols-outlined">military_tech</span>
              <span>Gamification</span>
            </NavLink>

            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Account</div>

            <NavLink
              to="/instructor/settings"
              className={({ isActive }) =>
                `sidebar-item text-decoration-none ${isActive ? 'active' : ''}`
              }
            >
              <span className="material-symbols-outlined">settings</span>
              <span>Settings</span>
            </NavLink>
          </>
        ) : (
          <>
            <div className="sidebar-section-label">My Learning</div>

            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `sidebar-item text-decoration-none ${isActive ? 'active' : ''}`
              }
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `sidebar-item text-decoration-none ${isActive ? 'active' : ''}`
              }
            >
              <span className="material-symbols-outlined">school</span>
              <span>Course Catalog</span>
            </NavLink>

            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Account</div>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `sidebar-item text-decoration-none ${isActive ? 'active' : ''}`
              }
            >
              <span className="material-symbols-outlined">person</span>
              <span>My Profile</span>
            </NavLink>
          </>
        )}
      </div>

      {/* Footer: User chip, portal-switch, sign-out */}
      <div className="sidebar-footer">
        {/* User chip */}
        <div className="sidebar-user-chip">
          <div className="sidebar-avatar">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Avatar" />
            ) : (
              initials
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="sidebar-user-name">{user?.name || 'Guest User'}</div>
            <div className="sidebar-user-role">{user?.role || 'Learner'}</div>
          </div>
        </div>



        {/* Sign out */}
        <button onClick={handleLogout} className="sidebar-logout-btn" type="button">
          <span className="material-symbols-outlined">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
