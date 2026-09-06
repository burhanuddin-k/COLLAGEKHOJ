import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../api/endpoints';

const LEVELS = [
  { value: '', label: 'All levels' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'doctorate', label: 'Doctorate' },
];

export default function CourseExplorer() {
  const [courses, setCourses] = useState([]);
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    courseApi.list({ degreeLevel: level || undefined, limit: 50 })
      .then(({ data }) => setCourses(data.data))
      .finally(() => setLoading(false));
  }, [level]);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Explore courses</h1>
        <select className="input" style={{ width: 220 }} value={level} onChange={(e) => setLevel(e.target.value)}>
          {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className="empty-state">No courses found for this filter yet.</div>
      )}

      {!loading && courses.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {courses.map((c) => (
            <Link to={`/courses/${c.slug}`} key={c.id} className="card" style={{ padding: 18, color: 'inherit' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{c.name}</h3>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.88rem' }}>{c.full_name}</p>
              <p className="text-muted" style={{ margin: '8px 0 0', fontSize: '0.82rem', textTransform: 'capitalize' }}>
                {c.degree_level} {c.duration_years ? `· ${c.duration_years} yrs` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
