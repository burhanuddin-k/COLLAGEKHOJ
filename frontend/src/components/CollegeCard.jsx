import React from 'react';
import { Link } from 'react-router-dom';
import VerifiedBadge from './VerifiedBadge.jsx';
import './CollegeCard.css';

export default function CollegeCard({ college, onSave, onCompareToggle, isComparing, saved }) {
  const feeLabel = college.min_fee
    ? `₹${Number(college.min_fee).toLocaleString('en-IN')}${college.max_fee && college.max_fee !== college.min_fee ? ` – ₹${Number(college.max_fee).toLocaleString('en-IN')}` : ''} / yr`
    : 'Fee data pending verification';

  return (
    <div className="college-card card">
      <div className="college-card-media">
        {college.logo_url
          ? <img src={college.logo_url} alt={`${college.name} logo`} />
          : <div className="college-card-media-placeholder">{college.name?.charAt(0)}</div>}
      </div>
      <div className="college-card-body">
        <div className="college-card-top">
          <h3><Link to={`/colleges/${college.slug}`}>{college.name}</Link></h3>
          <VerifiedBadge status={college.verification_status} lastVerifiedAt={college.last_verified_at} isDemo={college.is_demo} />
        </div>
        <p className="text-muted college-card-location">{college.city}, {college.state} · <span style={{ textTransform: 'capitalize' }}>{college.college_type}</span></p>
        <p className="college-card-fee">{feeLabel}</p>
        <div className="college-card-actions">
          <Link to={`/colleges/${college.slug}`} className="btn btn-primary btn-sm">View college</Link>
          {onCompareToggle && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onCompareToggle(college)}>
              {isComparing ? 'Remove from compare' : 'Add to compare'}
            </button>
          )}
          {onSave && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onSave(college)}>
              {saved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
