const express = require('express');
const {
  searchHandler, getBySlugHandler, createHandler, compareHandler,
} = require('../controllers/college.controller');
const { searchRules, createCollegeRules } = require('../validators/college.validator');
const { validate } = require('../middleware/validate.middleware');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Public
router.get('/', searchRules, validate, searchHandler);
router.get('/compare', compareHandler);
router.get('/:slug', getBySlugHandler);

// Admin/college-authoring (goes into the approval queue, never public immediately)
router.post('/', requireAuth, requireRole('admin', 'college'), createCollegeRules, validate, createHandler);

module.exports = router;
