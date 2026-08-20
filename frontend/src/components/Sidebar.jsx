import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { section: 'Overview', items: [
    { path: '/dashboard',    icon: '🏠', label: 'Dashboard' },
    { path: '/profile',      icon: '👤', label: 'Digital Twin Profile' },
    { path: '/evolution',    icon: '📈', label: 'Twin Evolution' },
  ]},
  { section: 'AI Predictions', items: [
    { path: '/academic',     icon: '📊', label: 'Academic Prediction' },
    { path: '/placement',    icon: '🎯', label: 'Placement Readiness' },
    { path: '/skills',       icon: '🛠️',  label: 'Skill Development' },
  ]},
  { section: 'Intelligence & Add-ons', items: [
    { path: '/whatif',       icon: '🔮', label: 'What-If Simulator' },
    { path: '/career',       icon: '🚀', label: 'Career Compatibility' },
    { path: '/career-gap',   icon: '⚡', label: 'Career Gap Analyzer' },
    { path: '/roadmap',      icon: '🗺️', label: '30-60-90 Day Roadmap' },
    { path: '/xai',          icon: '🧠', label: 'Explainable AI' },
    { path: '/recommendations', icon: '💡', label: 'Recommendations' },
  ]},
];


export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'NT';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-name gradient-text">NextTwin</div>
        <div className="brand-sub">AI Student Digital Twin</div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(section => (
          <div key={section.section}>
            <div className="nav-section-title">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div className="user-email" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-full"
          style={{ marginTop: 8, fontSize: 13 }}
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
