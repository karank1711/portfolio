import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getSupabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { assign } from '../utils/fields.js';
import { query } from '../utils/db.js';
import { toCamel } from '../utils/present.js';
import { slugify } from '../utils/slug.js';
import { clearMedia, replaceMedia } from './media.service.js';
import { removeFile, uploadFile } from './storage.service.js';

const COLUMNS = {
  name: 'name',
  shortDescription: 'short_description',
  detailedDescription: 'detailed_description',
  features: 'features',
  technologies: 'technologies',
  githubUrl: 'github_url',
  liveUrl: 'live_url',
  category: 'category',
  isFeatured: 'is_featured',
  status: 'status',
  isPublished: 'is_published',
  startDate: 'start_date',
  endDate: 'end_date',
  developmentDetails: 'development_details',
};

const DETAIL = '*, project_images(id, image_url, alt_text, display_order)';

function present(row) {
  if (!row) return null;
  const base = toCamel(row);
  const images = (base.projectImages || [])
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((image) => ({
      id: image.id,
      url: image.imageUrl,
      alt: image.altText || '',
      displayOrder: image.displayOrder,
    }));
  delete base.projectImages;
  return { ...base, images };
}

async function uniqueSlug(name, requested, ignoreId) {
  const base = slugify(requested || name);
  let slug = base;
  let suffix = 2;
  while (suffix < 50) {
    let builder = getSupabase().from('projects').select('id').eq('slug', slug);
    if (ignoreId) builder = builder.neq('id', ignoreId);
    const existing = await query(builder.maybeSingle());
    if (!existing) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  throw new ApiError(409, 'Choose a different project URL');
}

async function nextOrder() {
  const rows = await query(
    getSupabase().from('projects').select('display_order').order('display_order', { ascending: false }).limit(1),
  );
  return (rows?.[0]?.display_order ?? 0) + 1;
}

function cleanTerm(value) {
  return String(value || '').replace(/[%_]/g, '').trim();
}

export async function listProjects({ all = false, search, category, status } = {}) {
  let builder = getSupabase().from('projects').select(DETAIL);
  if (!all) builder = builder.eq('is_published', true);
  if (all && category) builder = builder.eq('category', category);
  if (all && status) builder = builder.eq('status', status);
  const term = all ? cleanTerm(search) : '';
  if (term) builder = builder.ilike('name', `%${term}%`);
  builder = all
    ? builder.order('display_order', { ascending: true })
    : builder.order('is_featured', { ascending: false }).order('display_order', { ascending: true });
  const rows = await query(builder);
  return (rows || []).map(present);
}

export async function getById(id) {
  const row = await query(getSupabase().from('projects').select(DETAIL).eq('id', id).maybeSingle());
  if (!row) throw new ApiError(404, 'Project not found');
  return present(row);
}

export async function getBySlug(slug, previewToken) {
  const row = await query(getSupabase().from('projects').select(DETAIL).eq('slug', slug).maybeSingle());
  if (!row || (!row.is_published && !previewMatches(previewToken, slug))) {
    throw new ApiError(404, 'Project not found');
  }
  return present(row);
}

function previewMatches(token, slug) {
  if (!token || !env.jwtSecret) return false;
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    return payload.purpose === 'preview' && payload.slug === slug;
  } catch {
    return false;
  }
}

export async function createProject(input) {
  const row = assign(input, COLUMNS);
  row.slug = await uniqueSlug(input.name, input.slug);
  row.display_order = await nextOrder();
  const created = await query(getSupabase().from('projects').insert(row).select(DETAIL).single());
  return present(created);
}

export async function updateProject(id, input) {
  const current = await query(getSupabase().from('projects').select('id, name, slug').eq('id', id).maybeSingle());
  if (!current) throw new ApiError(404, 'Project not found');
  const row = assign(input, COLUMNS);
  if (input.slug !== undefined) row.slug = await uniqueSlug(input.name || current.name, input.slug, id);
  if (!Object.keys(row).length) throw new ApiError(400, 'No changes provided');
  const updated = await query(getSupabase().from('projects').update(row).eq('id', id).select(DETAIL).single());
  return present(updated);
}

export async function deleteProject(id) {
  const raw = await query(
    getSupabase().from('projects').select('id, cover_image_path, project_images(image_path)').eq('id', id).maybeSingle(),
  );
  if (!raw) throw new ApiError(404, 'Project not found');
  await query(getSupabase().from('projects').delete().eq('id', id));
  await removeFile('projects', raw.cover_image_path);
  await Promise.all((raw.project_images || []).map((image) => removeFile('projects', image.image_path)));
}

export async function reorderProjects(ids) {
  await Promise.all(ids.map((id, index) => query(
    getSupabase().from('projects').update({ display_order: index + 1 }).eq('id', id),
  )));
  return listProjects({ all: true });
}

export async function uploadCover(id, file) {
  await replaceMedia({
    table: 'projects',
    id,
    bucket: 'projects',
    prefix: 'covers',
    urlColumn: 'cover_image_url',
    pathColumn: 'cover_image_path',
    file,
  });
  return getById(id);
}

export async function deleteCover(id) {
  await clearMedia({
    table: 'projects',
    id,
    bucket: 'projects',
    urlColumn: 'cover_image_url',
    pathColumn: 'cover_image_path',
  });
  return getById(id);
}

export async function addImages(id, files, alt = '') {
  const project = await query(getSupabase().from('projects').select('id').eq('id', id).maybeSingle());
  if (!project) throw new ApiError(404, 'Project not found');
  if (!files?.length) throw new ApiError(400, 'Choose at least one image');
  const existing = await query(getSupabase().from('project_images').select('id').eq('project_id', id));
  if ((existing?.length || 0) + files.length > 12) {
    throw new ApiError(400, 'A project can have at most 12 screenshots');
  }
  const start = existing?.length || 0;
  const rows = [];
  for (let index = 0; index < files.length; index += 1) {
    const uploaded = await uploadFile('projects', files[index], 'gallery');
    rows.push({
      project_id: id,
      image_url: uploaded.url,
      image_path: uploaded.path,
      alt_text: alt,
      display_order: start + index + 1,
    });
  }
  await query(getSupabase().from('project_images').insert(rows));
  return getById(id);
}

export async function deleteImage(projectId, imageId) {
  const image = await query(
    getSupabase().from('project_images').select('*').eq('id', imageId).eq('project_id', projectId).maybeSingle(),
  );
  if (!image) throw new ApiError(404, 'Image not found');
  await query(getSupabase().from('project_images').delete().eq('id', imageId));
  await removeFile('projects', image.image_path);
  return getById(projectId);
}

export async function reorderImages(projectId, ids) {
  const project = await query(getSupabase().from('projects').select('id').eq('id', projectId).maybeSingle());
  if (!project) throw new ApiError(404, 'Project not found');
  await Promise.all(ids.map((imageId, index) => query(
    getSupabase().from('project_images').update({ display_order: index + 1 }).eq('id', imageId).eq('project_id', projectId),
  )));
  return getById(projectId);
}

export async function createPreviewToken(id) {
  const project = await query(getSupabase().from('projects').select('slug').eq('id', id).maybeSingle());
  if (!project) throw new ApiError(404, 'Project not found');
  const token = jwt.sign({ purpose: 'preview', slug: project.slug }, env.jwtSecret, { expiresIn: '30m' });
  return { token, slug: project.slug };
}
