import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { careerAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CareerGapPage() {
  const [role,       setRole]       = useState('Software Developer');
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  const fetchGap = async (targetRole) => {
    setLoading(true); setError('');
    try {
      const { data: res } = await careerAPI.gap(targetRole);
      setData(res);
    } catch (e) {
      setError(e.response?.data?.detail || 'Please complete your profile first.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchGap(role); }, [role]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>⚡ Career Gap Analyzer</h1>
        <p>Compare your Digital Twin against ideal industry benchmarks to identify critical skill gaps</p>
      </div>

      {/* Role selector */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>Select Target Role:</div>
        <select
          className="form-input"
          style={{ maxWidth: 300 }}
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          {['Software Developer','Java Developer','Backend Developer','Data Analyst','Data Scientist','AI/ML Engineer','QA Engineer','Business Analyst'].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="alert alert-warning">
          {error} <Link to="/profile" style={{ color: 'var(--accent-orange)' }}>Complete profile →</Link>
        </div>
      )}

      {loading && <LoadingSpinner text="Analyzing career gaps…" />}

      {data && !loading && (
        <div className="fade-in">
          {/* Readiness banner */}
          <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--accent-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>TARGET ROLE</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{data.target_role}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>CAREER READINESS</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: data.career_readiness >= 75 ? '#10b981' : data.career_readiness >= 55 ? '#f59e0b' : '#ef4444' }}>
                {data.career_readiness}%
              </div>
            </div>
          </div>

          {/* Gaps overview cards */}
          <div className="grid-3" style={{ marginBottom: 24 }}>
            <div className="card">
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>STRENGTHS (MET)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {data.strongest_skills?.length ? data.strongest_skills.map(s => (
                  <span key={s} style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: 12, padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>
                    ✓ {s}
                  </span>
                )) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>None yet</span>}
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>CRITICAL GAPS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {data.weakest_skills?.length ? data.weakest_skills.map(s => (
                  <span key={s} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 12, padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>
                    ⚠ {s}
                  </span>
                )) : <span style={{ color: '#10b981', fontSize: 13 }}>No major gaps!</span>}
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>TOP PRIORITY TO IMPROVE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {data.top_to_improve?.length ? data.top_to_improve.map(item => (
                  <div key={item.skill} style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>• {item.skill}</span>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>Gap: +{item.gap}</span>
                  </div>
                )) : <span style={{ color: '#10b981', fontSize: 13 }}>All benchmarks satisfied!</span>}
              </div>
            </div>
          </div>

          {/* Detailed gap matrix table */}
          <div className="card">
            <div className="section-title">Digital Twin vs Target Role Benchmark Matrix</div>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Skill / Metric</th>
                  <th>Current Level</th>
                  <th>Required Benchmark</th>
                  <th>Gap</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.matrix.map(row => (
                  <tr key={row.key}>
                    <td style={{ fontWeight: 600 }}>{row.label}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{row.current}</td>
                    <td style={{ fontWeight: 500 }}>{row.required}</td>
                    <td style={{ fontWeight: 600, color: row.gap === 0 ? '#10b981' : '#f59e0b' }}>
                      {row.gap === 0 ? '0' : `+${row.gap}`}
                    </td>
                    <td>
                      {row.status === 'met' && (
                        <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                          ✓ Satisfied
                        </span>
                      )}
                      {row.status === 'moderate' && (
                        <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                          ⚠️ Minor Gap
                        </span>
                      )}
                      {row.status === 'critical' && (
                        <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                          ✗ Critical Gap
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
