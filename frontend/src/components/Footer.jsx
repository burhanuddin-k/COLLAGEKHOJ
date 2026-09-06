import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="nav-brand" style={{ marginBottom: 10 }}>College<span>Khoj</span></div>
          <p className="text-muted">Find. Compare. Decide.</p>
          <p className="text-muted">
            Every fact on CollegeKhoj carries a verification status and a last-verified date —
            we never present unverified information as confirmed.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul className="footer-list">
            <li><Link to="/search">College Search</Link></li>
            <li><Link to="/courses">Course Explorer</Link></li>
            <li><Link to="/compare">Compare Colleges</Link></li>
            <li><Link to="/map">College Map</Link></li>
          </ul>
        </div>
        <div>
          <h4>For Institutions</h4>
          <ul className="footer-list">
            <li><Link to="/college-portal/login">College Portal</Link></li>
            <li><Link to="/college-portal/claim">Claim Your College</Link></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul className="footer-list">
            <li><Link to="/admissions">Admission Deadlines</Link></li>
            <li><Link to="/find-my-college">Find My College</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span className="text-muted">© {new Date().getFullYear()} CollegeKhoj. Built for students, not rankings.</span>
      </div>
    </footer>
  );
}
