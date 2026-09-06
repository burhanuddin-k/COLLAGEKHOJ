import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { portalApi } from '../../api/endpoints';
import VerifiedBadge from '../../components/VerifiedBadge.jsx';

export default function CollegePortalDashboard() {
  const [myCollege, setMyCollege] = useState(undefined);
  const [claims, setClaims] = useState([]);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    portalApi.myCollege().then(({ data }) => setMyCollege(data.data));
    portalApi.myClaims().then(({ data }) => setClaims(data.data));
    portalApi.myUpdateRequests().then(({ data }) => setUpdates(data.data));
  }, []);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <h1 style={{ fontSize: '1.8rem' }}>College portal</h1>

      <div className="card" style={{ padding: 20, margin: '20px 0' }}>
        {myCollege === undefined && <div className="skeleton" style={{ height: 60 }} />}
        {myCollege === null && (
          <>
            <strong>You haven't claimed a college profile yet</strong>
            <p className="text-muted">Claim your institution's profile to start submitting verified updates.</p>
            <Link to="/college-portal/claim" className="btn btn-primary btn-sm">Claim your college</Link>
          </>
        )}
        {myCollege && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <strong>{myCollege.name}</strong>
              <VerifiedBadge status={myCollege.verification_status} lastVerifiedAt={myCollege.last_verified_at} />
            </div>
            <Link to="/college-portal/submit-update" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Submit an update</Link>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <h3>Your claim requests</h3>
          {claims.length === 0
            ? <div className="empty-state">No claim requests submitted yet.</div>
            : claims.map((c) => (
              <div key={c.id} className="card" style={{ padding: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>{c.college_name}</span>
                <span className="badge badge-needs-verification" style={{ textTransform: 'capitalize' }}>{c.status}</span>
              </div>
            ))}
        </div>
        <div>
          <h3>Your update requests</h3>
          {updates.length === 0
            ? <div className="empty-state">No update requests submitted yet.</div>
            : updates.map((u) => (
              <div key={u.id} className="card" style={{ padding: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ textTransform: 'capitalize' }}>{u.entity_type.replace('_', ' ')}</span>
                <span className="badge badge-needs-verification" style={{ textTransform: 'capitalize' }}>{u.status}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
