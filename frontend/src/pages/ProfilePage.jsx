import { useEffect, useState } from 'react';
import { profileAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const SKILLS = [
  { key: 'java',            label: 'Java' },
  { key: 'python_skill',    label: 'Python' },
  { key: 'javascript',      label: 'JavaScript' },
  { key: 'sql',             label: 'SQL' },
  { key: 'dsa',             label: 'DSA (Data Structures & Algorithms)' },
  { key: 'machine_learning',label: 'Machine Learning' },
  { key: 'communication',   label: 'Communication' },
  { key: 'problem_solving', label: 'Problem Solving' },
  { key: 'aptitude',        label: 'Aptitude' },
];

const TABS = ['Academic', 'Skills', 'Achievements', 'Career'];

function SliderInput({ label, value, onChange, min = 0, max = 10, step = 0.5 }) {
  return (
    <div className="slider-row">
      <div className="slider-row-header">
        <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
        <span className="slider-value">{value}/{max}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

export default function ProfilePage() {
  const [tab,     setTab]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [form,    setForm]    = useState({
    university: '', degree: 'B.Tech', branch: 'Computer Science',
    semester: 4, cgpa: 7.5, attendance: 80,
    sem_grades: {}, subjects: {},
    java: 5, python_skill: 5, javascript: 5, sql: 5, dsa: 4,
    machine_learning: 3, communication: 6, problem_solving: 5, aptitude: 5,
    projects_count: 1, certifications_count: 0, internship_months: 0, hackathons: 0,
    desired_role: '', preferred_domain: '', target_companies: '', career_interests: '',
  });

  useEffect(() => {
    profileAPI.get().then(({ data }) => {
      setForm(prev => ({ ...prev, ...data }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      await profileAPI.update(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="Loading your profile…" />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🧬 Digital Twin Profile</h1>
        <p>Your complete academic, skill, and career profile — the foundation of your AI predictions</p>
      </div>

      {/* Tab nav */}
      <div className="tab-nav">
        {TABS.map((t, i) => (
          <button key={t} className={`tab-btn ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>
            {['🎓','🛠️','🏆','🚀'][i]} {t}
          </button>
        ))}
      </div>

      {/* ── Academic Tab ── */}
      {tab === 0 && (
        <div className="card fade-in">
          <div className="section-title">Academic Information</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">University / College</label>
              <input className="form-input" placeholder="RGPV, Bhopal" value={form.university} onChange={e => set('university', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Degree</label>
              <select className="form-input" value={form.degree} onChange={e => set('degree', e.target.value)}>
                {['B.Tech','B.E.','M.Tech','MCA','BCA'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Branch</label>
              <select className="form-input" value={form.branch} onChange={e => set('branch', e.target.value)}>
                {['Computer Science','Information Technology','Electronics','Mechanical','Civil','AI & ML','Data Science'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Current Semester</label>
              <select className="form-input" value={form.semester} onChange={e => set('semester', parseInt(e.target.value))}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2" style={{ marginTop: 8 }}>
            <div>
              <div className="slider-row-header" style={{ marginBottom: 8 }}>
                <span className="form-label">Current CGPA</span>
                <span className="slider-value">{form.cgpa}/10</span>
              </div>
              <input type="range" min={0} max={10} step={0.1} value={form.cgpa} onChange={e => set('cgpa', parseFloat(e.target.value))} />
            </div>
            <div>
              <div className="slider-row-header" style={{ marginBottom: 8 }}>
                <span className="form-label">Attendance (%)</span>
                <span className="slider-value">{form.attendance}%</span>
              </div>
              <input type="range" min={0} max={100} step={1} value={form.attendance} onChange={e => set('attendance', parseFloat(e.target.value))} />
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="section-title">Semester-wise CGPA History</div>
            <div className="grid-4">
              {Array.from({ length: form.semester }, (_, i) => (
                <div className="form-group" key={i}>
                  <label className="form-label">Sem {i+1}</label>
                  <input type="number" className="form-input" min={0} max={10} step={0.1}
                    placeholder="7.5"
                    value={form.sem_grades?.[`sem${i+1}`] || ''}
                    onChange={e => set('sem_grades', { ...form.sem_grades, [`sem${i+1}`]: parseFloat(e.target.value) || 0 })} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Skills Tab ── */}
      {tab === 1 && (
        <div className="card fade-in">
          <div className="section-title">Technical & Soft Skills (0–10 scale)</div>
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            Rate each skill honestly. These values directly feed into the ML prediction model.
          </div>
          <div className="grid-2">
            {SKILLS.map(sk => (
              <SliderInput
                key={sk.key}
                label={sk.label}
                value={form[sk.key] || 0}
                onChange={v => set(sk.key, v)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Achievements Tab ── */}
      {tab === 2 && (
        <div className="card fade-in">
          <div className="section-title">Projects, Certifications & More</div>
          <div className="grid-2">
            {[
              { key: 'projects_count',       label: 'Number of Projects',       max: 20 },
              { key: 'certifications_count',  label: 'Certifications',           max: 15 },
              { key: 'internship_months',     label: 'Internship Experience (months)', max: 24 },
              { key: 'hackathons',            label: 'Hackathons Participated',  max: 15 },
            ].map(item => (
              <div key={item.key}>
                <div className="slider-row-header" style={{ marginBottom: 8 }}>
                  <span className="form-label">{item.label}</span>
                  <span className="slider-value">{form[item.key]}</span>
                </div>
                <input type="range" min={0} max={item.max} step={1} value={form[item.key] || 0}
                  onChange={e => set(item.key, parseInt(e.target.value))} />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="section-title">Project Details (optional)</div>
            {(form.projects_details || []).map((p, i) => (
              <div key={i} className="grid-2" style={{ marginBottom: 12, padding: 12, background: 'var(--bg-elevated)', borderRadius: 8 }}>
                <input className="form-input" placeholder="Project name" value={p.name || ''} onChange={e => {
                  const arr = [...(form.projects_details || [])];
                  arr[i] = { ...arr[i], name: e.target.value };
                  set('projects_details', arr);
                }} />
                <input className="form-input" placeholder="Tech stack (React, Python…)" value={p.tech || ''} onChange={e => {
                  const arr = [...(form.projects_details || [])];
                  arr[i] = { ...arr[i], tech: e.target.value };
                  set('projects_details', arr);
                }} />
              </div>
            ))}
            {(form.projects_details?.length || 0) < form.projects_count && (
              <button className="btn btn-secondary btn-sm" onClick={() => set('projects_details', [...(form.projects_details||[]), {}])}>
                + Add Project
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Career Tab ── */}
      {tab === 3 && (
        <div className="card fade-in">
          <div className="section-title">Career Aspirations</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Desired Career Role</label>
              <select className="form-input" value={form.desired_role} onChange={e => set('desired_role', e.target.value)}>
                <option value="">Select role…</option>
                {['Software Developer','Java Developer','Backend Developer','Data Analyst','Data Scientist','AI/ML Engineer','QA Engineer','Business Analyst','Frontend Developer'].map(r => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Domain</label>
              <select className="form-input" value={form.preferred_domain} onChange={e => set('preferred_domain', e.target.value)}>
                <option value="">Select domain…</option>
                {['Web Development','Data Science','AI & Machine Learning','Mobile Apps','Cloud Computing','Cybersecurity','DevOps','Embedded Systems'].map(d => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Target Companies</label>
              <input className="form-input" placeholder="Google, Microsoft, TCS, Infosys…" value={form.target_companies} onChange={e => set('target_companies', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Career Interests</label>
              <input className="form-input" placeholder="Building AI products, Data analysis…" value={form.career_interests} onChange={e => set('career_interests', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : '💾 Save Profile'}
        </button>
        {saved && <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: 14 }}>✅ Saved successfully!</span>}
      </div>
    </div>
  );
}
