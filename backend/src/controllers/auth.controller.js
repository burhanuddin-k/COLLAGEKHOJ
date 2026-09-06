const authService = require('../services/auth.service');
const { asyncHandler } = require('../utils/apiError');

const registerHandler = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, role } = req.body;
  const result = await authService.register({ fullName, email, password, phone, role });
  res.status(201).json({ success: true, data: result });
});

const loginHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  res.status(200).json({ success: true, data: result });
});

const meHandler = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);
  res.status(200).json({ success: true, data: profile });
});

module.exports = { registerHandler, loginHandler, meHandler };
