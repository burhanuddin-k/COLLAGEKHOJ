const express = require('express');
const { listHandler, trackDeadlineHandler } = require('../controllers/admission.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', listHandler);
router.post('/deadlines', requireAuth, requireRole('student'), trackDeadlineHandler);

module.exports = router;
