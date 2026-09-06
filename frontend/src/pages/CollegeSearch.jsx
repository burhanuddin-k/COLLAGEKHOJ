import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collegeApi } from '../api/endpoints';
import CollegeCard from '../components/CollegeCard.jsx';
import Pagination from '../components/Pagination.jsx';
import { userApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext.jsx';
import './CollegeSearch.css';

const FACILITY_OPTIONS = ['hostel', 'library', 'sports', 'wifi', 'labs', 'cafeteria', 'transport'];
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'fees_asc', label: 'Fees: low to high' },
  { value: 'fees_desc', label: 'Fees: high to low' },
  { value: 'name', label: 'College name' },
  { value: 'recently_verified', label: 'Recently verified' },
];

export default function CollegeSearch() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparing, setComparing] = useState([]);

  const filters = {
    q: params.get('q') || '',
    state: params.get('state') || '',
    city: params.get('city') || '',
    collegeType: params.get('collegeType') || '',
    minFee: params.get('minFee') || '',
    maxFee: params.get('maxFee') || '',
    sort: params.get('sort') || 'relevance',
    page: Number(params.get('page') || 1),
  };

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFacilities = {};
      FACILITY_OPTIONS.forEach((f) => {
        if (params.get(f) === 'true') activeFacilities[f] = 'true';
      });
      const { data } = await collegeApi.search({ ...filters, ...activeFacilities, limit: 12 });
      setResults(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load colleges right now.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setParams(next);
  }

  function toggleCompare(college) {
    setComparing((prev) => {
      const exists = prev.find((c) => c.id === college.id);
      if (exists) return prev.filter((c) => c.id !== college.id);
      if (prev.length >= 3) return prev;
      return [...prev, college];
    });
  }

  async function handleSave(college) {
    if (!user) return;
    await userApi.saveCollege(college.id);
  }

  return (
    <div className="container search-page">
      <aside className="filters card">
        <h3>Filters</h3>
        <div className="form-row">
          <label htmlFor="state">State</label>
          <input id="state" className="input" defaultValue={filters.state} onBlur={(e) => updateParam('state', e.target.value)} placeholder="e.g. Maharashtra" />
        </div>
        <div className="form-row">
          <label htmlFor="city">City</label>
          <input id="city" className="input" defaultValue={filters.city} onBlur={(e) => updateParam('city', e.target.value)} placeholder="e.g. Pune" />
        </div>
        <div className="form-row">
          <label htmlFor="collegeType">College type</label>
          <select id="collegeType" className="input" value={filters.collegeType} onChange={(e) => updateParam('collegeType', e.target.value)}>
            <option value="">Any</option>
            <option value="government">Government</option>
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="autonomous">Autonomous</option>
            <option value="university">University</option>
          </select>
        </div>
        <div className="form-row">
          <label>Annual fee range (₹)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" type="number" placeholder="Min" defaultValue={filters.minFee} onBlur={(e) => updateParam('minFee', e.target.value)} />
            <input className="input" type="number" placeholder="Max" defaultValue={filters.maxFee} onBlur={(e) => updateParam('maxFee', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <label>Facilities</label>
          <div className="facility-checks">
            {FACILITY_OPTIONS.map((f) => (
              <label key={f} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={params.get(f) === 'true'}
                  onChange={(e) => updateParam(f, e.target.checked ? 'true' : '')}
                />
                <span style={{ textTransform: 'capitalize' }}>{f}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      <main className="results">
        <div className="results-header">
          <p className="text-muted" style={{ margin: 0 }}>
            {loading ? 'Searching…' : `${pagination.total ?? results.length} colleges found`}
          </p>
          <select className="input" style={{ width: 220 }} value={filters.sort} onChange={(e) => updateParam('sort', e.target.value)}>
            {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {comparing.length > 0 && (
          <div className="compare-tray card">
            <span>{comparing.length} selected for comparison:</span>
            <div className="compare-tray-names">{comparing.map((c) => c.name).join(', ')}</div>
            <a
              className="btn btn-accent btn-sm"
              href={comparing.length >= 2 ? `/compare?ids=${comparing.map((c) => c.id).join(',')}` : undefined}
              aria-disabled={comparing.length < 2}
            >
              Compare now
            </a>
          </div>
        )}

        {loading && (
          <div className="results-list">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 130 }} />)}
          </div>
        )}

        {!loading && error && <div className="empty-state">{error}</div>}

        {!loading && !error && results.length === 0 && (
          <div className="empty-state">
            <h3>No colleges match these filters yet</h3>
            <p className="text-muted">Try widening your fee range or clearing a filter.</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <>
            <div className="results-list">
              {results.map((college) => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  onCompareToggle={toggleCompare}
                  isComparing={!!comparing.find((c) => c.id === college.id)}
                  onSave={user ? handleSave : null}
                />
              ))}
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={(p) => updateParam('page', p)} />
          </>
        )}
      </main>
    </div>
  );
}
