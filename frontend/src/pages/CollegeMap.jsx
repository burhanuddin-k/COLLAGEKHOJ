import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { collegeApi } from '../api/endpoints';

// Default Leaflet marker icons reference files that don't resolve under
// Vite's bundler by default — point them at a CDN explicitly.
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const INDIA_CENTER = [22.9734, 78.6569];

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.setView(position, 11); }, [position, map]);
  return null;
}

export default function CollegeMap() {
  const [params, setParams] = useSearchParams();
  const [colleges, setColleges] = useState([]);
  const [state, setState] = useState(params.get('state') || '');
  const [city, setCity] = useState(params.get('city') || '');
  const [course, setCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    setLoading(true);
    collegeApi.search({ state: state || undefined, city: city || undefined, course: course || undefined, limit: 50 })
      .then(({ data }) => setColleges(data.data.filter((c) => c.latitude && c.longitude)))
      .finally(() => setLoading(false));
  }, [state, city, course]);

  function handleNearMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserPosition([pos.coords.latitude, pos.coords.longitude]);
    });
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <h1 style={{ fontSize: '1.8rem' }}>College map</h1>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <input className="input" style={{ width: 180 }} placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
        <input className="input" style={{ width: 180 }} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <input className="input" style={{ width: 180 }} placeholder="Course" value={course} onChange={(e) => setCourse(e.target.value)} />
        <button type="button" className="btn btn-ghost" onClick={handleNearMe}>Colleges near me</button>
      </div>

      {loading && <div className="skeleton" style={{ height: 480 }} />}

      {!loading && (
        <div style={{ height: 480, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)' }}>
          <MapContainer center={userPosition || INDIA_CENTER} zoom={userPosition ? 11 : 5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Recenter position={userPosition} />
            {colleges.map((c) => (
              <Marker key={c.id} position={[c.latitude, c.longitude]} icon={markerIcon}>
                <Popup>
                  <strong>{c.name}</strong><br />
                  {c.city}, {c.state}<br />
                  <Link to={`/colleges/${c.slug}`}>View college profile</Link>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
      {!loading && colleges.length === 0 && (
        <p className="text-muted" style={{ marginTop: 12 }}>No colleges with published map coordinates match this filter yet.</p>
      )}
    </div>
  );
}
