import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recsAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const PRIORITY_LABELS = { 1: 'High Priority', 2: 'Medium Priority', 3: 'Quick Win' };
const PRIORITY_COLORS = { 1: '#ef4444', 2: '#f59e0b', 3: '#10b981' };

export default function RecommendationsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    recsAPI.get()
      .then(({ data: res }) => { setData(res); setLoading(false); })
      .catch(e => { setError(e.response?.data?.detail || 'Please complete your profile first.'); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner text="Generating personalized recommendations…" />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>💡 Personalized Recommendations</h1>
        <p>Actionable steps to improve your placement readiness and career prospects</p>
      </div>

      {error && (
        <div className="alert alert-warning">
          {error} <Link to="/profile" style={{ color: 'var(--accent-orange)' }}>Complete profile →</Link>
        </div>
      )}

      {data && (
        <div className="fade-in">
          {/* Profile summary */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">Profile Snapshot</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
              {[
                { label: 'CGPA',           val: data.profile_summary.cgpa,            unit: '/10', color: '#6366f1' },
                { label: 'Skill Average',  val: data.profile_summary.skill_average,   unit: '/10', color: '#8b5cf6' },
                { label: 'Projects',       val: data.profile_summary.projects,         unit: '',   color: '#06b6d4' },
                { label: 'Certifications', val: data.profile_summary.certifications,   unit: '',   color: '#10b981' },
                { label: 'Internship',     val: `${data.profile_summary.internship_months} mo`, unit: '', color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center', padding: 16, background: 'var(--bg-elevated)', borderRadius: 10 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: item.color }}>{item.val}{item.unit}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {data.recommendations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌟</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Excellent Profile!</div>
              <div style={{ color: 'var(--text-muted)' }}>You're meeting all key benchmarks. Keep up the great work!</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="section-title" style={{ marginBottom: 0 }}>
                  {data.total} Recommendation{data.total !== 1 ? 's' : ''} Found
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1,2,3].map(p => (
                    <span key={p} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: `${PRIORITY_COLORS[p]}22`, color: PRIORITY_COLORS[p], fontWeight: 600 }}>
                      {PRIORITY_LABELS[p]}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {data.recommendations.map(rec => (
                  <div key={rec.id} className={`rec-card rec-priority-${rec.priority}`}>
                    <div className="rec-icon">{rec.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{rec.title}</div>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                          background: `${PRIORITY_COLORS[rec.priority]}22`, color: PRIORITY_COLORS[rec.priority],
                          flexShrink: 0, marginLeft: 12,
                        }}>
                          {PRIORITY_LABELS[rec.priority]}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 10 }}>{rec.description}</div>
                      <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>RECOMMENDED ACTION</div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{rec.action}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Expected Impact:</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>{rec.expected_impact}</span>
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <span style={{ fontSize: 11, background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4, color: 'var(--text-muted)' }}>
                          {rec.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
