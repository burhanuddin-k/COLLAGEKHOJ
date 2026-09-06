import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collegeApi, reviewApi, userApi } from '../api/endpoints';
import VerifiedBadge from '../components/VerifiedBadge.jsx';
import RatingStars from '../components/RatingStars.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './CollegeDetails.css';

const TABS = ['Overview', 'Courses', 'Fees', 'Admissions', 'Placements', 'Facilities', 'Reviews', 'Gallery', 'Location'];

function money(v) {
  if (v === null || v === undefined) return '—';
  return `₹${Number(v).toLocaleString('en-IN')}`;
}

export default function CollegeDetails() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    collegeApi.getBySlug(slug)
      .then(async ({ data: res }) => {
        if (cancelled) return;
        setData(res.data);
        const { data: reviewRes } = await reviewApi.listForCollege(res.data.college.id);
        if (!cancelled) setReviews(reviewRes.data);
      })
      .catch((err) => !cancelled && setError(err.response?.data?.error?.message || 'College not found'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <div className="container" style={{ paddingTop: 40 }}><div className="skeleton" style={{ height: 220 }} /></div>;
  if (error || !data) return <div className="container empty-state">{error || 'College not found.'}</div>;

  const { college, courses, fees, admissions, facilities, reviewStats } = data;

  async function handleSave() {
    if (!user) return;
    await userApi.saveCollege(college.id);
    setSaved(true);
  }

  return (
    <div className="college-detail">
      <div className="college-hero">
        <div className="container college-hero-inner">
          <div className="college-hero-logo">
            {college.logo_url ? <img src={college.logo_url} alt="" /> : college.name.charAt(0)}
          </div>
          <div className="college-hero-info">
            <div className="college-hero-top">
              <h1>{college.name}</h1>
              <VerifiedBadge status={college.verification_status} lastVerifiedAt={college.last_verified_at} isDemo={college.is_demo} />
            </div>
            <p className="text-muted">{college.city}, {college.state} · <span style={{ textTransform: 'capitalize' }}>{college.college_type}</span></p>
            <div className="college-hero-actions">
              {college.website && <a href={college.website} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Visit website</a>}
              {user && <button type="button" className="btn btn-ghost btn-sm" onClick={handleSave}>{saved ? 'Saved' : 'Save'}</button>}
              <Link to={`/compare?ids=${college.id}`} className="btn btn-primary btn-sm">Add to compare</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <nav className="tab-bar">
          {TABS.map((t) => (
            <button key={t} type="button" className={`tab-btn ${activeTab === t ? 'tab-btn-active' : ''}`} onClick={() => setActiveTab(t)}>
              {t}
            </button>
          ))}
        </nav>

        <div className="tab-content">
          {activeTab === 'Overview' && (
            <div className="two-col-detail">
              <div>
                <h3>About</h3>
                <p>{college.description || 'A description for this college has not been added yet.'}</p>
              </div>
              <div className="card overview-facts">
                <div><span>Established</span><strong>{college.established_year || '—'}</strong></div>
                <div><span>Affiliation</span><strong>{college.affiliation || '—'}</strong></div>
                <div><span>Accreditation</span><strong>{college.accreditation || '—'}</strong></div>
                <div><span>Address</span><strong>{college.address || '—'}</strong></div>
              </div>
            </div>
          )}

          {activeTab === 'Courses' && (
            <div className="table-wrap">
              {courses.length === 0
                ? <div className="empty-state">No courses have been published for this college yet.</div>
                : (
                  <table className="data-table">
                    <thead><tr><th>Course</th><th>Degree</th><th>Duration</th><th>Eligibility</th><th>Seats</th><th>Entrance exam</th></tr></thead>
                    <tbody>
                      {courses.map((c) => (
                        <tr key={c.college_course_id}>
                          <td>{c.name}</td>
                          <td style={{ textTransform: 'capitalize' }}>{c.degree_level}</td>
                          <td>{c.duration_years ? `${c.duration_years} yrs` : '—'}</td>
                          <td>{c.eligibility_note || '—'}</td>
                          <td>{c.seats ?? 'Not officially available'}</td>
                          <td>{c.entrance_exam || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          )}

          {activeTab === 'Fees' && (
            <div className="table-wrap">
              {fees.length === 0
                ? <div className="empty-state">Fee details have not been verified for this college yet.</div>
                : fees.map((f) => (
                  <div key={f.id} className="card fee-card">
                    <div className="fee-grid">
                      <div><span className="text-muted">Tuition</span><strong>{money(f.tuition_fee)}</strong></div>
                      <div><span className="text-muted">Admission</span><strong>{money(f.admission_fee)}</strong></div>
                      <div><span className="text-muted">Exam</span><strong>{money(f.exam_fee)}</strong></div>
                      <div><span className="text-muted">Hostel</span><strong>{money(f.hostel_fee)}</strong></div>
                      <div><span className="text-muted">Other</span><strong>{money(f.other_charges)}</strong></div>
                      <div><span className="text-muted">Estimated total</span><strong>{money(f.estimated_total)}</strong></div>
                    </div>
                    <p className="text-muted" style={{ marginTop: 12, marginBottom: 0 }}>
                      Last verified: {f.last_verified_at ? new Date(f.last_verified_at).toLocaleDateString('en-IN') : 'Not yet verified'}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'Admissions' && (
            <div className="table-wrap">
              {admissions.length === 0
                ? <div className="empty-state">No admission information has been published yet.</div>
                : admissions.map((a) => (
                  <div key={a.id} className="card admission-card">
                    <div className="fee-grid">
                      <div><span className="text-muted">Application opens</span><strong>{a.application_start_date || '—'}</strong></div>
                      <div><span className="text-muted">Application closes</span><strong>{a.application_end_date || '—'}</strong></div>
                      <div><span className="text-muted">Entrance exam</span><strong>{a.entrance_exam || '—'}</strong></div>
                      <div><span className="text-muted">Counselling</span><strong>{a.counselling_date || '—'}</strong></div>
                      <div><span className="text-muted">Classes begin</span><strong>{a.classes_start_date || '—'}</strong></div>
                    </div>
                    {a.official_application_url && (
                      <a href={a.official_application_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                        Official application link
                      </a>
                    )}
                    <p className="text-muted" style={{ marginTop: 12, marginBottom: 0 }}>
                      Last verified: {a.last_verified_at ? new Date(a.last_verified_at).toLocaleDateString('en-IN') : 'Not yet verified'}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'Placements' && (
            <div className="empty-state">
              Placement statistics are not published for this college yet. We only show placement
              data once it has been verified with a source — we never estimate it.
            </div>
          )}

          {activeTab === 'Facilities' && (
            <div className="facility-grid">
              {facilities.length === 0
                ? <div className="empty-state">Facility information has not been verified yet.</div>
                : facilities.map((f) => (
                  <div key={f.code} className={`facility-pill ${f.available ? 'facility-yes' : 'facility-no'}`}>
                    {f.label}: {f.available ? 'Available' : 'Not available'}
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="reviews-section">
              <div className="reviews-summary card">
                <RatingStars value={reviewStats.avg_rating || 0} />
                <span className="text-muted">{reviewStats.review_count || 0} approved reviews</span>
              </div>
              {reviews.length === 0
                ? <div className="empty-state">No approved reviews yet. Be the first to share your experience.</div>
                : reviews.map((r) => (
                  <div key={r.id} className="card review-card">
                    <div className="review-top">
                      <strong>{r.title}</strong>
                      <RatingStars value={r.rating_overall} />
                    </div>
                    <p className="text-muted">{r.course_name ? `${r.course_name} · ` : ''}{r.academic_year}</p>
                    <p>{r.description}</p>
                  </div>
                ))}
              {user?.role === 'student' && (
                <Link to={`/reviews/new?collegeId=${college.id}`} className="btn btn-primary btn-sm">Write a review</Link>
              )}
            </div>
          )}

          {activeTab === 'Gallery' && (
            <div className="empty-state">
              {college.gallery_json ? 'Gallery' : 'No gallery images have been uploaded for this college yet.'}
            </div>
          )}

          {activeTab === 'Location' && (
            <div>
              <p className="text-muted">{college.address}</p>
              <Link to={`/map?collegeId=${college.id}`} className="btn btn-ghost btn-sm">View on map</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
