import * as contactService from '../services/contact.service.js';
import * as portfolioService from '../services/portfolio.service.js';
import * as dashboardService from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { missingEnv } from '../config/env.js';

export const health = asyncHandler(async (req, res) => {
  const missing = missingEnv();
  ok(res, { status: 'ok', configured: missing.length === 0, missing });
});

export const portfolio = asyncHandler(async (req, res) => {
  // Resume URL is edited in admin and must appear on the public site immediately.
  // Do not let browsers/CDNs keep a stale /portfolio payload.
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  ok(res, await portfolioService.getPublicPortfolio());
});

export const dashboard = asyncHandler(async (req, res) => {
  ok(res, await dashboardService.getDashboard());
});

export const createContact = asyncHandler(async (req, res) => {
  ok(res, await contactService.createMessage(req.body), 201);
});

export const listMessages = asyncHandler(async (req, res) => {
  ok(res, await contactService.listMessages({ search: req.query.search, unread: req.query.unread }));
});

export const updateMessage = asyncHandler(async (req, res) => {
  ok(res, await contactService.updateMessage(req.params.id, req.body));
});

export const deleteMessage = asyncHandler(async (req, res) => {
  await contactService.deleteMessage(req.params.id);
  ok(res, { deleted: true });
});

export const markAllRead = asyncHandler(async (req, res) => {
  ok(res, await contactService.markAllRead());
});
