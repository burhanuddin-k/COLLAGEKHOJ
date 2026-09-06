const express = require('express');
const {
  listForCollegeHandler, createHandler, reportHandler,
} = require('../controllers/review.controller');
const { createReviewRules } = require('../validators/review.validator');
const { validate } = require('../middleware/validate.middleware');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

const router = express.Router();

router.get('/college/:collegeId', listForCollegeHandler);
router.post('/', requireAuth, requireRole('student'), createReviewRules, validate, createHandler);
router.post(
  '/:id/report',
  requireAuth,
  body('reason').trim().isLength({ min: 5, max: 500 }),
  validate,
  reportHandler
);

module.exports = router;
