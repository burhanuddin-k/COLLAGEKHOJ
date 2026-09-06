-- ==========================================================
-- DEMO SEED DATA — FOR LOCAL DEVELOPMENT ONLY
-- ==========================================================
-- Every college row here has is_demo = 1 and verification_status =
-- 'needs_verification'. The frontend MUST render a visible
-- "DEMO DATA — NOT VERIFIED" badge whenever is_demo = 1.
-- Do NOT load this file in a production/RDS database.
-- Do NOT edit is_demo/verification_status to make these look real.
-- ==========================================================
USE collegekhoj;

INSERT INTO states (name, code) VALUES
 ('Maharashtra','MH'), ('Karnataka','KA'), ('Delhi','DL'), ('Tamil Nadu','TN')
ON DUPLICATE KEY UPDATE code = VALUES(code);

INSERT INTO cities (state_id, name, latitude, longitude)
SELECT s.id, c.name, c.lat, c.lng FROM (
  SELECT 'Maharashtra' st, 'Pune' name, 18.5204 lat, 73.8567 lng UNION ALL
  SELECT 'Maharashtra', 'Mumbai', 19.0760, 72.8777 UNION ALL
  SELECT 'Karnataka', 'Bengaluru', 12.9716, 77.5946 UNION ALL
  SELECT 'Delhi', 'New Delhi', 28.6139, 77.2090 UNION ALL
  SELECT 'Tamil Nadu', 'Chennai', 13.0827, 80.2707
) c JOIN states s ON s.name = c.st
ON DUPLICATE KEY UPDATE latitude = VALUES(latitude);

INSERT INTO courses (name, slug, degree_level, full_name, duration_years, description, eligibility, entrance_exams)
VALUES
 ('BBA','bba','undergraduate','Bachelor of Business Administration',3,
  'A demo course description for local development.','10+2 from a recognized board.', JSON_ARRAY('CUET','IPMAT')),
 ('BCA','bca','undergraduate','Bachelor of Computer Applications',3,
  'A demo course description for local development.','10+2 with Mathematics.', JSON_ARRAY('CUET')),
 ('MBA','mba','postgraduate','Master of Business Administration',2,
  'A demo course description for local development.','Bachelor''s degree, any stream.', JSON_ARRAY('CAT','MAT','CMAT'))
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- One DEMO college, explicitly marked, unpublished by default (admin must publish)
INSERT INTO colleges
 (name, slug, city_id, state_id, address, college_type, established_year, affiliation,
  website, description, is_demo, verification_status, is_published)
SELECT
 'Demo Institute of Technology (SAMPLE DATA)', 'demo-institute-of-technology',
 c.id, c.state_id, 'Sample Address, For Local Dev Only', 'private', 2001,
 'Sample University', 'https://example.com',
 'THIS IS DEMO DATA for local development only. It is not a real college and must never be shown as verified.',
 1, 'needs_verification', 0
FROM cities c WHERE c.name = 'Pune' LIMIT 1;
