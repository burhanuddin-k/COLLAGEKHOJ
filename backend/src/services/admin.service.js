const { pool } = require('../config/db');
const { ApiError } = require('../utils/apiError');

async function logAudit(actorUserId, action, entityType, entityId, metadata = {}, ipAddress = null) {
  await pool.query(
    `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata_json, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [actorUserId, action, entityType, entityId, JSON.stringify(metadata), ipAddress]
  );
}

async function dashboardStats() {
  const [[collegeStats]] = await pool.query(
    `SELECT COUNT(*) AS total,
            SUM(verification_status = 'verified') AS verified,
            SUM(verification_status = 'needs_verification') AS needs_verification,
            SUM(verification_status = 'outdated') AS outdated,
            SUM(verification_status = 'reported') AS reported
     FROM colleges`
  );
  const [[reviewStats]] = await pool.query(
    `SELECT SUM(status = 'pending') AS pending, SUM(status = 'approved') AS approved,
            SUM(status = 'rejected') AS rejected FROM reviews`
  );
  const [[claimStats]] = await pool.query(`SELECT SUM(status = 'pending') AS pending FROM college_claims`);
  const [[updateStats]] = await pool.query(`SELECT SUM(status = 'pending') AS pending FROM update_requests`);
  const [[userStats]] = await pool.query(
    `SELECT SUM(role = 'student') AS students, SUM(role = 'college') AS colleges, SUM(role = 'admin') AS admins
     FROM users`
  );

  return {
    colleges: collegeStats,
    reviews: reviewStats,
    pendingClaims: claimStats.pending || 0,
    pendingUpdateRequests: updateStats.pending || 0,
    users: userStats,
  };
}

// Surfaces plain-language alerts rather than an opaque score — matches
// the product's "no black-box" principle for trust-sensitive data.
async function dataQualityAlerts() {
  const alerts = [];

  const [[staleCount]] = await pool.query(
    `SELECT COUNT(*) AS c FROM colleges
     WHERE last_verified_at IS NULL OR last_verified_at < DATE_SUB(NOW(), INTERVAL 12 MONTH)`
  );
  if (staleCount.c > 0) {
    alerts.push(`${staleCount.c} colleges have not been verified for more than 12 months.`);
  }

  const [[reportedCount]] = await pool.query(
    `SELECT COUNT(*) AS c FROM colleges WHERE verification_status = 'reported'`
  );
  if (reportedCount.c > 0) {
    alerts.push(`${reportedCount.c} colleges have open reports about incorrect data.`);
  }

  const [[pendingReviews]] = await pool.query(`SELECT COUNT(*) AS c FROM reviews WHERE status = 'pending'`);
  if (pendingReviews.c > 0) {
    alerts.push(`${pendingReviews.c} student reviews are waiting for moderation.`);
  }

  const [[pendingClaims]] = await pool.query(`SELECT COUNT(*) AS c FROM college_claims WHERE status = 'pending'`);
  if (pendingClaims.c > 0) {
    alerts.push(`${pendingClaims.c} college claim requests are awaiting verification.`);
  }

  return alerts;
}

async function listCollegesForModeration({ status, page = 1, limit = 20 }) {
  const where = [];
  const params = [];
  if (status) { where.push('verification_status = ?'); params.push(status); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Math.max(1, page) - 1) * limit;

  const [rows] = await pool.query(
    `SELECT id, name, slug, verification_status, is_published, last_verified_at, is_demo, created_at
     FROM colleges ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  return rows;
}

async function verifyCollege(adminUserId, collegeId, newStatus, publish, note) {
  const [rows] = await pool.query('SELECT verification_status FROM colleges WHERE id = ?', [collegeId]);
  if (rows.length === 0) throw ApiError.notFound('College not found');
  const previousStatus = rows[0].verification_status;

  await pool.query(
    `UPDATE colleges SET verification_status = ?, is_published = ?,
       last_verified_at = NOW() WHERE id = ?`,
    [newStatus, publish ? 1 : 0, collegeId]
  );

  await pool.query(
    `INSERT INTO verification_records (entity_type, entity_id, verified_by_admin_id, previous_status, new_status, note)
     VALUES ('college', ?, ?, ?, ?, ?)`,
    [collegeId, adminUserId, previousStatus, newStatus, note || null]
  );

  await logAudit(adminUserId, 'college.verify', 'college', collegeId, { previousStatus, newStatus, publish });
  return { collegeId, verification_status: newStatus, is_published: !!publish };
}

async function listPendingReviews({ page = 1, limit = 20 }) {
  const offset = (Math.max(1, page) - 1) * limit;
  const [rows] = await pool.query(
    `SELECT r.id, r.title, r.description, r.rating_overall, r.status, r.created_at,
            c.name AS college_name, u.full_name AS student_name
     FROM reviews r
     JOIN colleges c ON c.id = r.college_id
     JOIN students s ON s.id = r.student_id
     JOIN users u ON u.id = s.user_id
     WHERE r.status = 'pending'
     ORDER BY r.created_at ASC LIMIT ? OFFSET ?`,
    [Number(limit), Number(offset)]
  );
  return rows;
}

async function moderateReview(adminUserId, reviewId, status, note) {
  if (!['approved', 'rejected'].includes(status)) {
    throw ApiError.badRequest('Status must be approved or rejected');
  }
  const [result] = await pool.query(
    'UPDATE reviews SET status = ?, moderation_note = ? WHERE id = ?',
    [status, note || null, reviewId]
  );
  if (result.affectedRows === 0) throw ApiError.notFound('Review not found');

  await logAudit(adminUserId, `review.${status}`, 'review', reviewId, { note });
  return { reviewId, status };
}

async function listPendingUpdateRequests({ page = 1, limit = 20 }) {
  const offset = (Math.max(1, page) - 1) * limit;
  const [rows] = await pool.query(
    `SELECT ur.id, ur.entity_type, ur.entity_id, ur.payload_json, ur.created_at,
            c.name AS college_name, u.full_name AS submitted_by
     FROM update_requests ur
     JOIN colleges c ON c.id = ur.college_id
     JOIN users u ON u.id = ur.submitted_by_user_id
     WHERE ur.status = 'pending'
     ORDER BY ur.created_at ASC LIMIT ? OFFSET ?`,
    [Number(limit), Number(offset)]
  );
  return rows;
}

async function resolveUpdateRequest(adminUserId, requestId, decision, note) {
  if (!['approved', 'rejected'].includes(decision)) {
    throw ApiError.badRequest('Decision must be approved or rejected');
  }
  const [rows] = await pool.query('SELECT * FROM update_requests WHERE id = ?', [requestId]);
  const request = rows[0];
  if (!request) throw ApiError.notFound('Update request not found');

  await pool.query(
    `UPDATE update_requests SET status = ?, admin_note = ?, reviewed_by_admin_id = ?, reviewed_at = NOW()
     WHERE id = ?`,
    [decision, note || null, adminUserId, requestId]
  );

  // NOTE: applying `payload_json` onto the live entity_type/entity_id row is
  // intentionally left as an explicit, entity-specific follow-up step (each
  // entity type — fee, admission, facility, course — has different columns
  // to map) rather than a generic/blind UPDATE, to avoid writing unvalidated
  // fields into production tables.
  await logAudit(adminUserId, `update_request.${decision}`, request.entity_type, request.entity_id, { requestId });
  return { requestId, status: decision };
}

async function listAuditLogs({ page = 1, limit = 50 }) {
  const offset = (Math.max(1, page) - 1) * limit;
  const [rows] = await pool.query(
    `SELECT al.id, al.action, al.entity_type, al.entity_id, al.metadata_json, al.created_at,
            u.full_name AS actor_name
     FROM audit_logs al LEFT JOIN users u ON u.id = al.actor_user_id
     ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
    [Number(limit), Number(offset)]
  );
  return rows;
}

module.exports = {
  dashboardStats, dataQualityAlerts,
  listCollegesForModeration, verifyCollege,
  listPendingReviews, moderateReview,
  listPendingUpdateRequests, resolveUpdateRequest,
  listAuditLogs, logAudit,
};
