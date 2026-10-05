import * as profileService from '../services/profile.service.js';
import * as aboutService from '../services/about.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

export const getProfile = asyncHandler(async (req, res) => {
  ok(res, await profileService.getProfile());
});

export const saveProfile = asyncHandler(async (req, res) => {
  ok(res, await profileService.saveProfile(req.body));
});

export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  ok(res, await profileService.uploadProfilePhoto(req.file));
});

export const deleteProfilePhoto = asyncHandler(async (req, res) => {
  ok(res, await profileService.deleteProfilePhoto());
});

export const getAbout = asyncHandler(async (req, res) => {
  ok(res, await aboutService.getAbout());
});

export const saveAbout = asyncHandler(async (req, res) => {
  ok(res, await aboutService.saveAbout(req.body));
});
