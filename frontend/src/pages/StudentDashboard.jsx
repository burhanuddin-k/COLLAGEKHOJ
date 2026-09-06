import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext.jsx';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => { userApi.dashboard().then(({ data: res }) => setData(res.data)); }, []);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <h1 style={{ fontSize: '1.8rem' }}>Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}</h1>

      {!data ? (
        <div className="skeleton" style={{ height: 200, marginTop: 20 }} />
      ) : (
        <>
          <div className="card" style={{ padding: 20, margin: '20px 0' }}>
            <strong>Your college search progress</strong>
            <div style={{ background: 'var(--paper-dim)', borderRadius: 999, height: 10, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ width: `${data.checklist.progressPercent}%`, background: 'var(--marigold)', height: '100%' }} />
            </div>
            <p className="text-muted" style={{ margin: '8px 0 0', fontSize: '0.85rem' }}>
              {data.checklist.done} of {data.checklist.total} checklist items complete
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Saved colleges</span>
              <h2 style={{ margin: '4px 0 12px' }}>{data.savedCollegesCount}</h2>
              <Link to="/saved-colleges" className="btn btn-ghost btn-sm">View saved</Link>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Application checklist</span>
              <h2 style={{ margin: '4px 0 12px' }}>{data.checklist.total}</h2>
              <Link to="/checklist" className="btn btn-ghost btn-sm">Manage checklist</Link>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Recommendations</span>
              <h2 style={{ margin: '4px 0 12px' }}>New</h2>
              <Link to="/find-my-college" className="btn btn-ghost btn-sm">Find my college</Link>
            </div>
          </div>

          <h3 style={{ marginTop: 32 }}>Upcoming deadlines</h3>
          {data.upcomingDeadlines.length === 0 ? (
            <div className="empty-state">No deadlines tracked yet. Set reminders from the Admissions page.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.upcomingDeadlines.map((d) => (
                <div key={d.id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{d.college_name} · {d.course_name}</span>
                  <strong>{d.application_end_date}</strong>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
