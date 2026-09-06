import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Home.css';

const POPULAR_SEARCHES = ['BBA', 'BCA', 'MBA', 'B.Com', 'MCA', 'Engineering', 'MBBS', 'Law'];
const POPULAR_COURSES = [
  { name: 'BBA', slug: 'bba', blurb: 'Business fundamentals, 3 years' },
  { name: 'BCA', slug: 'bca', blurb: 'Computer applications, 3 years' },
  { name: 'B.Tech', slug: 'b-tech', blurb: 'Engineering, 4 years' },
  { name: 'MBA', slug: 'mba', blurb: 'Management, 2 years' },
  { name: 'MBBS', slug: 'mbbs', blurb: 'Medicine, 5.5 years' },
  { name: 'B.Com', slug: 'b-com', blurb: 'Commerce, 3 years' },
];
const POPULAR_CITIES = ['Pune', 'Mumbai', 'Bengaluru', 'New Delhi', 'Chennai', 'Hyderabad'];
const STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh', 'Gujarat'];

const HOW_IT_WORKS = [
  { step: 1, title: 'Tell us what you want', body: 'Course, city, budget, and the things that actually matter to you.' },
  { step: 2, title: 'Compare real options', body: 'See fees, admissions, and facilities side by side, sourced with a verification date.' },
  { step: 3, title: 'Decide with confidence', body: 'Save colleges, track deadlines, and build your application checklist in one place.' },
];

const FAQS = [
  { q: 'How is college data verified?', a: 'Every fee, admission date, and facility listing carries a verification status and a last-verified date. Colleges can submit updates, but nothing goes live until our team reviews it.' },
  { q: 'Is CollegeKhoj free for students?', a: 'Yes — searching, comparing, saving colleges, and tracking deadlines are free for students.' },
  { q: 'Can my college claim its profile?', a: 'Yes. Institutions can claim their profile through the College Portal and submit ownership proof for verification.' },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>Find the college that fits your future.</h1>
            <p className="hero-subtitle">
              Explore colleges, compare your options, understand courses and fees,
              and make a smarter education decision.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <input
                className="input"
                placeholder="Search college, course or city…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-accent">Search</button>
            </form>

            <div className="hero-chips">
              {POPULAR_SEARCHES.map((term) => (
                <button key={term} type="button" className="chip" onClick={() => navigate(`/search?q=${term}`)}>
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-trust">
            <div className="trust-stat">
              <span className="trust-number">Verified</span>
              <span className="text-muted">Every listing shows its verification status and last-checked date — no invented fees or rankings.</span>
            </div>
            <div className="trust-row">
              <div>
                <strong>India-wide</strong>
                <span className="text-muted">States &amp; cities</span>
              </div>
              <div>
                <strong>No black-box scores</strong>
                <span className="text-muted">Reasons, not rankings</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Explore popular courses</h2>
          <div className="grid-6">
            {POPULAR_COURSES.map((c) => (
              <Link to={`/courses/${c.slug}`} key={c.slug} className="tile">
                <strong>{c.name}</strong>
                <span className="text-muted">{c.blurb}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container two-col">
          <div>
            <h2>Popular cities</h2>
            <div className="pill-list">
              {POPULAR_CITIES.map((city) => (
                <Link to={`/search?city=${city}`} key={city} className="pill-link">{city}</Link>
              ))}
            </div>
          </div>
          <div>
            <h2>Explore by state</h2>
            <div className="pill-list">
              {STATES.map((state) => (
                <Link to={`/search?state=${state}`} key={state} className="pill-link">{state}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>How CollegeKhoj works</h2>
          <div className="steps">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="step">
                <span className="step-number">{s.step}</span>
                <h3>{s.title}</h3>
                <p className="text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container cta-split">
          <div>
            <h2>Not sure where to start?</h2>
            <p>Answer a short questionnaire and see colleges that actually match your budget, course, and preferences — with plain reasons, not a hidden score.</p>
            <Link to="/find-my-college" className="btn btn-primary">Find my college</Link>
          </div>
          <div>
            <h2>Comparing a shortlist?</h2>
            <p>Put up to three colleges side by side — fees, admissions, placements, and facilities in one table.</p>
            <Link to="/compare" className="btn btn-ghost">Compare colleges</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Why CollegeKhoj</h2>
          <div className="grid-3">
            <div className="value-card">
              <h3>Verified over viral</h3>
              <p className="text-muted">We'd rather show "needs verification" than a confident, invented number.</p>
            </div>
            <div className="value-card">
              <h3>Decisions, not rankings</h3>
              <p className="text-muted">Recommendations explain their reasons in plain language — no opaque scores.</p>
            </div>
            <div className="value-card">
              <h3>Built for the whole journey</h3>
              <p className="text-muted">From first search to application checklist, in one dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2>Frequently asked questions</h2>
          <div className="faq-list">
            {FAQS.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <p className="text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
