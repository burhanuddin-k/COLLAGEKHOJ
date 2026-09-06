const slugify = require('slugify');
const { pool } = require('../config/db');
const { ApiError } = require('../utils/apiError');

const SORT_MAP = {
  relevance: 'c.created_at DESC',
  fees_asc: 'min_fee ASC',
  fees_desc: 'min_fee DESC',
  name: 'c.name ASC',
  recently_verified: 'c.last_verified_at DESC',
};

// Only published (admin-approved) rows are ever visible to students —
// this is the enforcement point for the whole verification workflow.
async function search(filters) {
  const {
    q, state, city, course, degreeType, collegeType, minFee, maxFee,
    hostel, library, sports, wifi, labs, cafeteria, transport,
    accreditation, entranceExam, sort = 'relevance',
    page = 1, limit = 12,
  } = filters;

  const where = ['c.is_published = 1'];
  const params = [];

  if (q) {
    where.push('(MATCH(c.name, c.description) AGAINST (? IN NATURAL LANGUAGE MODE) OR c.name LIKE ?)');
    params.push(q, `%${q}%`);
  }
  if (state) { where.push('st.name = ?'); params.push(state); }
  if (city) { where.push('ci.name = ?'); params.push(city); }
  if (collegeType) { where.push('c.college_type = ?'); params.push(collegeType); }
  if (accreditation) { where.push('c.accreditation LIKE ?'); params.push(`%${accreditation}%`); }

  const facilityFilters = { hostel, library, sports, wifi, labs, cafeteria, transport };
  const activeFacilities = Object.entries(facilityFilters).filter(([, v]) => v === 'true' || v === true);

  let courseJoin = '';
  if (course || degreeType || entranceExam || minFee !== undefined || maxFee !== undefined) {
    courseJoin = `
      INNER JOIN college_courses cc ON cc.college_id = c.id AND cc.is_published = 1
      INNER JOIN courses co ON co.id = cc.course_id
      LEFT JOIN fees f ON f.college_course_id = cc.id AND f.is_published = 1
    `;
    if (course) { where.push('(co.slug = ? OR co.name = ?)'); params.push(course, course); }
    if (degreeType) { where.push('co.degree_level = ?'); params.push(degreeType); }
    if (entranceExam) { where.push('cc.entrance_exam LIKE ?'); params.push(`%${entranceExam}%`); }
    if (minFee !== undefined) { where.push('f.estimated_total >= ?'); params.push(minFee); }
    if (maxFee !== undefined) { where.push('f.estimated_total <= ?'); params.push(maxFee); }
  }

  let facilityJoin = '';
  activeFacilities.forEach(([code], idx) => {
    const alias = `cf${idx}`;
    facilityJoin += ` INNER JOIN college_facilities ${alias}
      ON ${alias}.college_id = c.id AND ${alias}.available = 1 AND ${alias}.is_published = 1
      INNER JOIN facilities fac${idx} ON fac${idx}.id = ${alias}.facility_id AND fac${idx}.code = ? `;
    params.push(code);
  });

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Math.max(1, page) - 1) * limit;

  const baseFrom = `
    FROM colleges c
    JOIN cities ci ON ci.id = c.city_id
    JOIN states st ON st.id = c.state_id
    ${courseJoin}
    ${facilityJoin}
  `;

  const countSql = `SELECT COUNT(DISTINCT c.id) AS total ${baseFrom} ${whereClause}`;
  const [countRows] = await pool.query(countSql, params);
  const total = countRows[0]?.total || 0;

  const dataSql = `
    SELECT DISTINCT c.id, c.name, c.slug, c.college_type, c.logo_url, c.verification_status,
      c.last_verified_at, c.latitude, c.longitude, ci.name AS city, st.name AS state,
      (SELECT MIN(f2.estimated_total) FROM fees f2
         INNER JOIN college_courses cc2 ON cc2.id = f2.college_course_id
         WHERE cc2.college_id = c.id AND f2.is_published = 1) AS min_fee,
      (SELECT MAX(f3.estimated_total) FROM fees f3
         INNER JOIN college_courses cc3 ON cc3.id = f3.college_course_id
         WHERE cc3.college_id = c.id AND f3.is_published = 1) AS max_fee
    ${baseFrom}
    ${whereClause}
    ORDER BY ${SORT_MAP[sort] || SORT_MAP.relevance}
    LIMIT ? OFFSET ?
  `;
  const [rows] = await pool.query(dataSql, [...params, Number(limit), Number(offset)]);

  return {
    results: rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function getBySlug(slug) {
  const [rows] = await pool.query(
    `SELECT c.*, ci.name AS city, st.name AS state, cp.about_long, cp.vision, cp.mission, cp.gallery_json
     FROM colleges c
     JOIN cities ci ON ci.id = c.city_id
     JOIN states st ON st.id = c.state_id
     LEFT JOIN college_profiles cp ON cp.college_id = c.id
     WHERE c.slug = ? AND c.is_published = 1`,
    [slug]
  );
  const college = rows[0];
  if (!college) throw ApiError.notFound('College not found');

  const [courses] = await pool.query(
    `SELECT cc.id AS college_course_id, co.id AS course_id, co.name, co.degree_level, co.duration_years,
            cc.seats, cc.entrance_exam, cc.eligibility_note, cc.verification_status, cc.last_verified_at
     FROM college_courses cc JOIN courses co ON co.id = cc.course_id
     WHERE cc.college_id = ? AND cc.is_published = 1`,
    [college.id]
  );

  const [fees] = await pool.query(
    `SELECT f.* FROM fees f
     JOIN college_courses cc ON cc.id = f.college_course_id
     WHERE cc.college_id = ? AND f.is_published = 1`,
    [college.id]
  );

  const [admissions] = await pool.query(
    `SELECT a.* FROM admissions a
     JOIN college_courses cc ON cc.id = a.college_course_id
     WHERE cc.college_id = ? AND a.is_published = 1`,
    [college.id]
  );

  const [facilities] = await pool.query(
    `SELECT fac.code, fac.label, cf.available, cf.notes
     FROM college_facilities cf JOIN facilities fac ON fac.id = cf.facility_id
     WHERE cf.college_id = ? AND cf.is_published = 1`,
    [college.id]
  );

  const [reviewStats] = await pool.query(
    `SELECT COUNT(*) AS review_count, AVG(rating_overall) AS avg_rating
     FROM reviews WHERE college_id = ? AND status = 'approved'`,
    [college.id]
  );

  return { college, courses, fees, admissions, facilities, reviewStats: reviewStats[0] };
}

async function create(data, ownerRole) {
  const slug = slugify(data.name, { lower: true, strict: true });
  const [existing] = await pool.query('SELECT id FROM colleges WHERE slug = ?', [slug]);
  if (existing.length > 0) throw ApiError.conflict('A college with a similar name already exists');

  // Anything created via the API starts unpublished and unverified —
  // admin review is mandatory before it becomes visible to students.
  const [result] = await pool.query(
    `INSERT INTO colleges
      (name, slug, city_id, state_id, address, college_type, established_year, affiliation,
       accreditation, website, contact_email, contact_phone, description,
       verification_status, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'needs_verification', 0)`,
    [
      data.name, slug, data.cityId, data.stateId, data.address || null, data.collegeType,
      data.establishedYear || null, data.affiliation || null, data.accreditation || null,
      data.website || null, data.contactEmail || null, data.contactPhone || null,
      data.description || null,
    ]
  );
  return { id: result.insertId, slug };
}

async function compare(collegeIds) {
  if (!Array.isArray(collegeIds) || collegeIds.length < 2 || collegeIds.length > 3) {
    throw ApiError.badRequest('Select between 2 and 3 colleges to compare');
  }
  const placeholders = collegeIds.map(() => '?').join(',');
  const [colleges] = await pool.query(
    `SELECT c.id, c.name, c.college_type, c.established_year, c.accreditation, c.verification_status,
            ci.name AS city, st.name AS state
     FROM colleges c JOIN cities ci ON ci.id = c.city_id JOIN states st ON st.id = c.state_id
     WHERE c.id IN (${placeholders}) AND c.is_published = 1`,
    collegeIds
  );
  if (colleges.length !== collegeIds.length) {
    throw ApiError.notFound('One or more selected colleges could not be found');
  }

  for (const college of colleges) {
    const [courses] = await pool.query(
      `SELECT co.name FROM college_courses cc JOIN courses co ON co.id = cc.course_id
       WHERE cc.college_id = ? AND cc.is_published = 1`,
      [college.id]
    );
    const [feeRange] = await pool.query(
      `SELECT MIN(f.estimated_total) AS min_fee, MAX(f.estimated_total) AS max_fee
       FROM fees f JOIN college_courses cc ON cc.id = f.college_course_id
       WHERE cc.college_id = ? AND f.is_published = 1`,
      [college.id]
    );
    const [facilities] = await pool.query(
      `SELECT fac.label FROM college_facilities cf JOIN facilities fac ON fac.id = cf.facility_id
       WHERE cf.college_id = ? AND cf.available = 1 AND cf.is_published = 1`,
      [college.id]
    );
    const [reviewStats] = await pool.query(
      `SELECT COUNT(*) AS review_count, AVG(rating_overall) AS avg_rating
       FROM reviews WHERE college_id = ? AND status = 'approved'`,
      [college.id]
    );
    college.courses = courses.map((c) => c.name);
    college.feeRange = feeRange[0];
    college.facilities = facilities.map((f) => f.label);
    college.reviewStats = reviewStats[0];
  }

  return colleges;
}

module.exports = { search, getBySlug, create, compare };
