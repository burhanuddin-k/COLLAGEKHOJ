const { pool } = require('../config/db');
const { ApiError } = require('../utils/apiError');

async function claimCollege(userId, collegeId, proofDocumentUrl) {
  const [collegeRows] = await pool.query('SELECT id, owner_user_id FROM colleges WHERE id = ?', [collegeId]);
  const college = collegeRows[0];
  if (!college) throw ApiError.notFound('College not found');
  if (college.owner_user_id) throw ApiError.conflict('This college profile has already been claimed');

  const [result] = await pool.query(
    `INSERT INTO college_claims (college_id, user_id, proof_document_url) VALUES (?, ?, ?)`,
    [collegeId, userId, proofDocumentUrl || null]
  );
  return { id: result.insertId, status: 'pending' };
}

async function myClaims(userId) {
  const [rows] = await pool.query(
    `SELECT cc.id, cc.status, cc.created_at, c.name AS college_name, c.id AS college_id
     FROM college_claims cc JOIN colleges c ON c.id = cc.college_id
     WHERE cc.user_id = ? ORDER BY cc.created_at DESC`,
    [userId]
  );
  return rows;
}

// Every field a claimed-college portal user submits goes into the review
// queue as JSON — never a direct write to the live, published record.
async function submitUpdateRequest(userId, { collegeId, entityType, entityId, payload }) {
  const [ownedRows] = await pool.query(
    'SELECT id FROM colleges WHERE id = ? AND owner_user_id = ?',
    [collegeId, userId]
  );
  if (ownedRows.length === 0) {
    throw ApiError.forbidden('You can only submit updates for a college you have claimed and been approved for');
  }

  const [result] = await pool.query(
    `INSERT INTO update_requests (college_id, submitted_by_user_id, entity_type, entity_id, payload_json)
     VALUES (?, ?, ?, ?, ?)`,
    [collegeId, userId, entityType, entityId || null, JSON.stringify(payload)]
  );
  return { id: result.insertId, status: 'pending' };
}

async function myUpdateRequests(userId) {
  const [rows] = await pool.query(
    `SELECT id, college_id, entity_type, entity_id, status, admin_note, created_at
     FROM update_requests WHERE submitted_by_user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

async function myCollege(userId) {
  const [rows] = await pool.query(
    `SELECT id, name, slug, verification_status, is_published, last_verified_at
     FROM colleges WHERE owner_user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

module.exports = { claimCollege, myClaims, submitUpdateRequest, myUpdateRequests, myCollege };
