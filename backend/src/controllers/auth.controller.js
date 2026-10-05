import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body.email, req.body.password);
  ok(res, data);
});

export const me = asyncHandler(async (req, res) => {
  ok(res, await authService.me(req.user));
});

export const updateName = asyncHandler(async (req, res) => {
  ok(res, await authService.updateName(req.user, req.body.name));
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user, req.body.currentPassword, req.body.newPassword);
  ok(res, { updated: true });
});

export const logout = asyncHandler(async (req, res) => {
  ok(res, { loggedOut: true });
});
