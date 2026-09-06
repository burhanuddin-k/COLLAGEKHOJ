import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseApi } from '../api/endpoints';

function renderList(json) {
  try {
    const arr = typeof json === 'string' ? JSON.parse(json) : json;
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr;
  } catch {
    return null;
  }
}

export default function CourseDetails() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    courseApi.getBySlug(slug)
      .then(({ data: res }) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error?.message || 'Course not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container" style={{ paddingTop: 40 }}><div className="skeleton" style={{ height: 200 }} /></div>;
  if (error || !data) return <div className="container empty-state">{error}</div>;

  const { course, colleges } = data;
  const subjects = renderList(course.typical_subjects);
  const careers = renderList(course.career_paths);
  const exams = renderList(course.entrance_exams);
  const specializations = renderList(course.popular_specializations);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <h1 style={{ fontSize: '2rem' }}>{course.name}</h1>
      <p className="text-muted" style={{ fontSize: '1.05rem' }}>{course.full_name}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, marginTop: 24 }}>
        <div>
          <h3>What is this course?</h3>
          <p>{course.description || 'A description for this course has not been added yet.'}</p>

          <h3>Eligibility</h3>
          <p>{course.eligibility || 'Eligibility details have not been added yet.'}</p>

          {subjects && (
            <>
              <h3>Subjects</h3>
              <ul>{subjects.map((s) => <li key={s}>{s}</li>)}</ul>
            </>
          )}

          {careers && (
            <>
              <h3>Career opportunities</h3>
              <ul>{careers.map((c) => <li key={c}>{c}</li>)}</ul>
            </>
          )}

          {specializations && (
            <>
              <h3>Popular specializations</h3>
              <ul>{specializations.map((s) => <li key={s}>{s}</li>)}</ul>
            </>
          )}

          <h3>Higher education options</h3>
          <p>{course.higher_education_options || 'Not documented yet.'}</p>
        </div>

        <div className="card" style={{ padding: 20, height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><span className="text-muted" style={{ fontSize: '0.8rem' }}>DURATION</span><br /><strong>{course.duration_years ? `${course.duration_years} years` : 'Varies'}</strong></div>
            <div><span className="text-muted" style={{ fontSize: '0.8rem' }}>DEGREE LEVEL</span><br /><strong style={{ textTransform: 'capitalize' }}>{course.degree_level}</strong></div>
            {exams && (
              <div><span className="text-muted" style={{ fontSize: '0.8rem' }}>ENTRANCE EXAMS</span><br /><strong>{exams.join(', ')}</strong></div>
            )}
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: 40 }}>Colleges offering {course.name}</h3>
      {colleges.length === 0 ? (
        <div className="empty-state">No published colleges offer this course yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {colleges.map((c) => (
            <Link key={c.id} to={`/colleges/${c.slug}`} className="card" style={{ padding: 16, color: 'inherit' }}>
              <strong>{c.name}</strong>
              <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{c.city}, {c.state}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
