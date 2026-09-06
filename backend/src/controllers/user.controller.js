const userService = require('../services/user.service');
const authService = require('../services/auth.service');
const { asyncHandler } = require('../utils/apiError');

const meHandler = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);
  res.status(200).json({ success: true, data: profile });
});

const updateMeHandler = asyncHandler(async (req, res) => {
  const result = await userService.updateProfile(req.user.id, req.body);
  res.status(200).json({ success: true, data: result });
});

const dashboardHandler = asyncHandler(async (req, res) => {
  const result = await userService.dashboard(req.user.id);
  res.status(200).json({ success: true, data: result });
});

const listSavedHandler = asyncHandler(async (req, res) => {
  const rows = await userService.listSaved(req.user.id);
  res.status(200).json({ success: true, data: rows });
});

const saveCollegeHandler = asyncHandler(async (req, res) => {
  const result = await userService.saveCollege(req.user.id, req.body.collegeId);
  res.status(200).json({ success: true, data: result });
});

const unsaveCollegeHandler = asyncHandler(async (req, res) => {
  const result = await userService.unsaveCollege(req.user.id, req.params.collegeId);
  res.status(200).json({ success: true, data: result });
});

const listChecklistHandler = asyncHandler(async (req, res) => {
  const rows = await userService.listChecklist(req.user.id);
  res.status(200).json({ success: true, data: rows });
});

const addChecklistItemHandler = asyncHandler(async (req, res) => {
  const result = await userService.addChecklistItem(req.user.id, req.body);
  res.status(201).json({ success: true, data: result });
});

const toggleChecklistItemHandler = asyncHandler(async (req, res) => {
  const result = await userService.toggleChecklistItem(req.user.id, req.params.id, req.body.isDone);
  res.status(200).json({ success: true, data: result });
});

module.exports = {
  meHandler, updateMeHandler, dashboardHandler,
  listSavedHandler, saveCollegeHandler, unsaveCollegeHandler,
  listChecklistHandler, addChecklistItemHandler, toggleChecklistItemHandler,
};
