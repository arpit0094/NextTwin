import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI, predictAPI, recsAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line
} from 'recharts';

function ScoreCard({ label, value, unit = '%', color, icon, sub }) {
  return (
    <div className="score-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{
          background: `${color}22`, color, fontSize: 11, fontWeight: 600,
          padding: '3px 10px', borderRadius: 99,
        }}>LIVE</span>
      </div>
      <div className="score-card-value" style={{ color }}>
        {value !== null && value !== undefined ? `${value}${unit}` : '—'}
      </div>
      <div className="score-card-label">{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile,    setProfile]    = useState(null);
  const [placement,  setPlacement]  = useState(null);
  const [academic,   setAcademic]   = useState(null);
  const [top3,       setTop3]       = useState([]);
  const [evolution,  setEvolution]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data: p } = await profileAPI.get();
        setProfile(p);
        if (p.cgpa) {
          setHasProfile(true);
          const [pl, ac, t3, ev] = await Promise.allSettled([
            predictAPI.placement(),
            predictAPI.academic(),
            recsAPI.top3(),
            profileAPI.evolution(),
          ]);
          if (pl.status === 'fulfilled') setPlacement(pl.value.data);
          if (ac.status === 'fulfilled') setAcademic(ac.value.data);
          if (t3.status === 'fulfilled') setTop3(t3.value.data?.top3 || []);
          if (ev.status === 'fulfilled') setEvolution(ev.value.data?.timeline || []);
        }
      } catch {}
      finally { setLoading(false); }
    }
    fetchAll();
  }, []);


  if (loading) return <LoadingSpinner text="Loading your Digital Twin…" />;

  // Skill radar data
  const radarData = profile ? [
    { skill: 'DSA',     value: profile.dsa || 0 },
    { skill: 'Python',  value: profile.python_skill || 0 },
    { skill: 'Java',    value: profile.java || 0 },
    { skill: 'SQL',     value: profile.sql || 0 },
    { skill: 'Comm.',   value: profile.communication || 0 },
    { skill: 'Apt.',    value: profile.aptitude || 0 },
    { skill: 'PS',      value: profile.problem_solving || 0 },
    { skill: 'ML',      value: profile.machine_learning || 0 },
  ] : [];

  // Bar chart for achievements
  const achieveData = profile ? [
    { name: 'Projects',  value: profile.projects_count || 0 },
    { name: 'Certs',     value: profile.certifications_count || 0 },
    { name: 'Internship',value: Math.min(profile.internship_months || 0, 12) },
    { name: 'Hackathons',value: profile.hackathons || 0 },
  ] : [];

  const twinScore = placement && academic
    ? Math.round((placement.placement_readiness * 0.6 + (academic.predicted_cgpa / 10) * 40))
    : null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋</h1>
        <p>Your AI-powered Digital Twin overview</p>
      </div>

      {!hasProfile && (
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          🚀 Your Digital Twin profile is empty.{' '}
          <Link to="/profile" style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>Complete your profile</Link>{' '}
          to unlock AI predictions.
        </div>
      )}

      {/* Score Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <ScoreCard label="Placement Readiness" value={placement?.placement_readiness?.toFixed(1)} unit="%" color="#6366f1" icon="🎯"
          sub={placement ? (placement.placement_readiness >= 70 ? '✅ On track' : '⚠️ Needs work') : 'Run prediction'} />
        <ScoreCard label="Current CGPA" value={profile?.cgpa} unit="" color="#10b981" icon="📚"
          sub={academic ? `Predicted: ${academic.predicted_cgpa}` : 'Run prediction'} />
        <ScoreCard label="Projects" value={profile?.projects_count} unit="" color="#06b6d4" icon="🚀" />
        <ScoreCard label="Twin Score" value={twinScore} unit="" color="#8b5cf6" icon="🧬"
          sub="Composite AI score" />
      </div>

      {/* Top 3 Actions Add-On */}
      {top3.length > 0 && (
        <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid var(--accent-primary)' }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🔥 Your Top 3 High-Impact Actions</span>
            <Link to="/recommendations" style={{ fontSize: 13, color: 'var(--accent-primary)', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div className="grid-3">
            {top3.map((act, i) => (
              <div key={i} style={{ padding: 14, background: 'var(--bg-elevated)', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{act.icon}</span>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{i + 1}. {act.title}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{act.action}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-green)' }}>
                  Impact: {act.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Radar */}
        <div className="card">
          <div className="section-title">Skill Radar</div>
          {radarData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              Add skill data in your profile
            </div>
          )}
        </div>

        {/* Digital Twin Evolution Line Chart */}
        <div className="card">
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📈 Digital Twin Evolution</span>
            <Link to="/evolution" style={{ fontSize: 13, color: 'var(--accent-primary)', textDecoration: 'none' }}>Full Timeline →</Link>
          </div>
          {evolution.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={evolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  formatter={(v) => [`${v}%`, 'Readiness']}
                />
                <Line type="monotone" dataKey="readiness" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={achieveData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="value" fill="#6366f1" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>


      {/* Academic details */}
      {profile?.cgpa > 0 && (
        <div className="card">
          <div className="section-title">Digital Twin Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'University',    val: profile.university || '—' },
              { label: 'Degree / Branch', val: `${profile.degree} · ${profile.branch}` },
              { label: 'Semester',       val: `Semester ${profile.semester}` },
              { label: 'Attendance',     val: `${profile.attendance}%` },
              { label: 'Certifications', val: profile.certifications_count },
              { label: 'Desired Role',   val: profile.desired_role || '—' },
            ].map(item => (
              <div key={item.label} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick nav */}
      <div style={{ marginTop: 24 }}>
        <div className="section-title">Quick Actions</div>
        <div className="grid-3">
          {[
            { to: '/placement', icon: '🎯', label: 'Run Placement Prediction', desc: 'ML-powered readiness score' },
            { to: '/whatif',    icon: '🔮', label: 'What-If Simulator',        desc: 'Simulate skill improvements' },
            { to: '/career',    icon: '🚀', label: 'Career Compatibility',     desc: 'Find your ideal role' },
          ].map(q => (
            <Link key={q.to} to={q.to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{q.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{q.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{q.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
