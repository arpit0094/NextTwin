import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🧬', title: 'Digital Twin', desc: 'A living digital replica of your academic and skill profile.' },
  { icon: '🤖', title: 'AI Predictions', desc: 'ML models predict your CGPA, placement readiness, and skill growth.' },
  { icon: '🔮', title: 'What-If Simulator', desc: 'Simulate hypothetical improvements and see their impact instantly.' },
  { icon: '🧠', title: 'Explainable AI', desc: 'Understand exactly why the AI made each prediction.' },
  { icon: '🎯', title: 'Career Matching', desc: 'Find which career roles align best with your skills and goals.' },
  { icon: '💡', title: 'Recommendations', desc: 'Get personalized, actionable steps to improve your placement odds.' },
];

const FLOW_STEPS = [
  'Student Profile', 'Digital Twin', 'AI/ML Analysis',
  'Predictions', 'What-If Sim', 'XAI Reasoning', 'Recommendations',
];

export default function LandingPage() {
  return (
    <div className="landing-hero">
      {/* Navbar */}
      <nav className="landing-nav">
        <span className="brand-name gradient-text" style={{ fontSize: 22, fontWeight: 800 }}>NextTwin</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-badge">
          <span>🎓</span> 7th Semester AIML Innovation Project
        </div>
        <h1 className="hero-title">
          Your AI-Powered<br />
          <span className="gradient-text">Student Digital Twin</span>
        </h1>
        <p className="hero-subtitle">
          NextTwin creates a personalized digital replica of you — predicting academic performance,
          placement readiness, and career compatibility using real Machine Learning.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn btn-primary btn-lg">
            🚀 Create Your Twin
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>

        {/* Flow diagram */}
        <div style={{ marginTop: 56, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {FLOW_STEPS.map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500,
                color: i === 0 ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}>{step}</div>
              {i < FLOW_STEPS.length - 1 && (
                <span style={{ color: 'var(--accent-primary)', fontSize: 18 }}>→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <div className="features-grid">
        {FEATURES.map(f => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <div style={{ textAlign: 'center', padding: '40px 24px 80px', borderTop: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>BUILT WITH</p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['React', 'FastAPI', 'Python', 'Scikit-learn', 'SQLite', 'Recharts'].map(t => (
            <span key={t} style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '4px 12px', fontSize: 13, color: 'var(--text-secondary)',
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
