const express = require('express');
const { registerHandler, loginHandler, meHandler } = require('../controllers/auth.controller');
const { registerRules, loginRules } = require('../validators/auth.validator');
const { validate } = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.post('/register', authLimiter, registerRules, validate, registerHandler);
router.post('/login', authLimiter, loginRules, validate, loginHandler);
router.get('/me', requireAuth, meHandler);

module.exports = router;
