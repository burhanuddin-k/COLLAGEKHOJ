const express = require('express');
const {
  dashboardHandler, dataQualityHandler,
  listCollegesHandler, verifyCollegeHandler,
  listPendingReviewsHandler, moderateReviewHandler,
  listUpdateRequestsHandler, resolveUpdateRequestHandler,
  auditLogsHandler,
} = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', dashboardHandler);
router.get('/data-quality', dataQualityHandler);

router.get('/colleges', listCollegesHandler);
router.put('/colleges/:id/verify', verifyCollegeHandler);

router.get('/reviews/pending', listPendingReviewsHandler);
router.put('/reviews/:id/moderate', moderateReviewHandler);

router.get('/update-requests', listUpdateRequestsHandler);
router.put('/update-requests/:id/resolve', resolveUpdateRequestHandler);

router.get('/audit-logs', auditLogsHandler);

module.exports = router;
