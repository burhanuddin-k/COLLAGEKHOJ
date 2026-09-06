import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collegeApi } from '../api/endpoints';
import VerifiedBadge from '../components/VerifiedBadge.jsx';
import RatingStars from '../components/RatingStars.jsx';
import './Compare.css';

const ROWS = [
  { key: 'location', label: 'Location', render: (c) => `${c.city}, ${c.state}` },
  { key: 'college_type', label: 'College type', render: (c) => c.college_type },
  { key: 'established_year', label: 'Established', render: (c) => c.established_year || '—' },
  { key: 'courses', label: 'Courses', render: (c) => (c.courses.length ? c.courses.join(', ') : 'Not published yet') },
  { key: 'fees', label: 'Annual fees', render: (c) => (c.feeRange.min_fee ? `₹${Number(c.feeRange.min_fee).toLocaleString('en-IN')} – ₹${Number(c.feeRange.max_fee).toLocaleString('en-IN')}` : 'Needs verification') },
  { key: 'facilities', label: 'Facilities', render: (c) => (c.facilities.length ? c.facilities.join(', ') : 'Not published yet') },
  { key: 'accreditation', label: 'Accreditation', render: (c) => c.accreditation || '—' },
  { key: 'reviews', label: 'Reviews', render: (c) => (c.reviewStats.review_count > 0 ? <RatingStars value={c.reviewStats.avg_rating} /> : 'No approved reviews yet') },
];

export default function Compare() {
  const [params] = useSearchParams();
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const ids = (params.get('ids') || '').split(',').map(Number).filter(Boolean);

  useEffect(() => {
    if (ids.length < 2) return;
    setLoading(true);
    setError(null);
    collegeApi.compare(ids)
      .then(({ data }) => setColleges(data.data))
      .catch((err) => setError(err.response?.data?.error?.message || 'Could not compare these colleges'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  if (ids.length < 2) {
    return (
      <div className="container empty-state" style={{ paddingTop: 56 }}>
        <h2>Pick 2–3 colleges to compare</h2>
        <p className="text-muted">Head to college search and use "Add to compare" on the ones you're considering.</p>
        <Link to="/search" className="btn btn-primary">Search colleges</Link>
      </div>
    );
  }

  if (loading) return <div className="container" style={{ paddingTop: 40 }}><div className="skeleton" style={{ height: 300 }} /></div>;
  if (error) return <div className="container empty-state">{error}</div>;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <h1 style={{ fontSize: '1.8rem' }}>Compare colleges</h1>
      <p className="text-muted">Fees and facilities are shown as reported and verified — CollegeKhoj does not assign an overall score.</p>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th>College</th>
              {colleges.map((c) => (
                <th key={c.id}>
                  <Link to={`/colleges/${c.id}`}>{c.name}</Link>
                  <div style={{ marginTop: 6 }}>
                    <VerifiedBadge status={c.verification_status} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key}>
                <td className="compare-row-label">{row.label}</td>
                {colleges.map((c) => {
                  const values = colleges.map((cc) => JSON.stringify(row.render(cc)));
                  const allSame = values.every((v) => v === values[0]);
                  return (
                    <td key={c.id} className={allSame ? '' : 'compare-cell-diff'}>
                      {row.render(c)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-muted" style={{ marginTop: 16, fontSize: '0.85rem' }}>
        Highlighted cells show where these colleges differ.
      </p>
    </div>
  );
}
