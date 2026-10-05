import * as projectService from '../services/project.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

export const listProjects = asyncHandler(async (req, res) => {
  const all = Boolean(req.user);
  ok(res, await projectService.listProjects({
    all,
    search: all ? req.query.search : undefined,
    category: all ? req.query.category : undefined,
    status: all ? req.query.status : undefined,
  }));
});

export const getProject = asyncHandler(async (req, res) => {
  ok(res, await projectService.getById(req.params.id));
});

export const getProjectBySlug = asyncHandler(async (req, res) => {
  ok(res, await projectService.getBySlug(req.params.slug, req.query.preview));
});

export const createProject = asyncHandler(async (req, res) => {
  ok(res, await projectService.createProject(req.body), 201);
});

export const updateProject = asyncHandler(async (req, res) => {
  ok(res, await projectService.updateProject(req.params.id, req.body));
});

export const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id);
  ok(res, { deleted: true });
});

export const reorderProjects = asyncHandler(async (req, res) => {
  ok(res, await projectService.reorderProjects(req.body.ids));
});

export const uploadCover = asyncHandler(async (req, res) => {
  ok(res, await projectService.uploadCover(req.params.id, req.file));
});

export const deleteCover = asyncHandler(async (req, res) => {
  ok(res, await projectService.deleteCover(req.params.id));
});

export const addImages = asyncHandler(async (req, res) => {
  ok(res, await projectService.addImages(req.params.id, req.files, req.body.alt || ''));
});

export const deleteImage = asyncHandler(async (req, res) => {
  ok(res, await projectService.deleteImage(req.params.id, req.params.imageId));
});

export const reorderImages = asyncHandler(async (req, res) => {
  ok(res, await projectService.reorderImages(req.params.id, req.body.ids));
});

export const previewToken = asyncHandler(async (req, res) => {
  ok(res, await projectService.createPreviewToken(req.params.id));
});
