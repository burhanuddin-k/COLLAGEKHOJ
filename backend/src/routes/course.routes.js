const express = require('express');
const { listHandler, getBySlugHandler } = require('../controllers/course.controller');

const router = express.Router();

router.get('/', listHandler);
router.get('/:slug', getBySlugHandler);

module.exports = router;
