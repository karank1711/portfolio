import { getSupabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { assign } from '../utils/fields.js';
import { query } from '../utils/db.js';
import { toCamel } from '../utils/present.js';

export function createCollection({ table, columns, filterPublic, normalize, defaults, orderColumn = 'display_order' }) {
  const db = () => getSupabase();

  async function nextOrder() {
    const rows = await query(
      db().from(table).select(orderColumn).order(orderColumn, { ascending: false }).limit(1),
    );
    return (rows?.[0]?.[orderColumn] ?? 0) + 1;
  }

  async function getRaw(id) {
    const row = await query(db().from(table).select('*').eq('id', id).maybeSingle());
    if (!row) throw new ApiError(404, 'Record not found');
    return row;
  }

  async function list({ all = false } = {}) {
    let builder = db().from(table).select('*').order(orderColumn, { ascending: true });
    if (!all && filterPublic) builder = filterPublic(builder);
    const rows = await query(builder);
    return (rows || []).map((row) => toCamel(row));
  }

  function buildRow(input, existing) {
    const row = assign(input, columns);
    return normalize ? normalize(row, input, existing) : row;
  }

  async function create(input) {
    const row = { ...(defaults || {}), ...buildRow(input) };
    row[orderColumn] = await nextOrder();
    const created = await query(db().from(table).insert(row).select('*').single());
    return toCamel(created);
  }

  async function update(id, input) {
    const existing = await getRaw(id);
    const row = buildRow(input, existing);
    if (!Object.keys(row).length) throw new ApiError(400, 'No changes provided');
    const updated = await query(db().from(table).update(row).eq('id', id).select('*').single());
    return toCamel(updated);
  }

  async function remove(id) {
    await getRaw(id);
    await query(db().from(table).delete().eq('id', id));
  }

  async function reorder(ids) {
    await Promise.all(ids.map((id, index) => query(
      db().from(table).update({ [orderColumn]: index + 1 }).eq('id', id),
    )));
    return list({ all: true });
  }

  return { list, getRaw, create, update, remove, reorder };
}
