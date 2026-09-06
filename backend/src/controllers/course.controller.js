const courseService = require('../services/course.service');
const { asyncHandler } = require('../utils/apiError');

const listHandler = asyncHandler(async (req, res) => {
  const result = await courseService.list(req.query);
  res.status(200).json({ success: true, data: result.results, total: result.total });
});

const getBySlugHandler = asyncHandler(async (req, res) => {
  const result = await courseService.getBySlug(req.params.slug);
  res.status(200).json({ success: true, data: result });
});

module.exports = { listHandler, getBySlugHandler };
