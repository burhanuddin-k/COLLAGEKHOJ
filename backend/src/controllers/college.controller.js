const collegeService = require('../services/college.service');
const { asyncHandler } = require('../utils/apiError');

const searchHandler = asyncHandler(async (req, res) => {
  const result = await collegeService.search(req.query);
  res.status(200).json({ success: true, data: result.results, pagination: result.pagination });
});

const getBySlugHandler = asyncHandler(async (req, res) => {
  const result = await collegeService.getBySlug(req.params.slug);
  res.status(200).json({ success: true, data: result });
});

const createHandler = asyncHandler(async (req, res) => {
  const result = await collegeService.create(req.body, req.user.role);
  res.status(201).json({
    success: true,
    data: result,
    message: 'College submitted. It will appear publicly once an admin verifies and approves it.',
  });
});

const compareHandler = asyncHandler(async (req, res) => {
  const ids = (req.query.ids || '').split(',').map(Number).filter(Boolean);
  const result = await collegeService.compare(ids);
  res.status(200).json({ success: true, data: result });
});

module.exports = { searchHandler, getBySlugHandler, createHandler, compareHandler };
