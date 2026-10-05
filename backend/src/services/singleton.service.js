import { getSupabase } from '../config/supabase.js';
import { assign } from '../utils/fields.js';
import { query } from '../utils/db.js';
import { toCamel } from '../utils/present.js';

export function createSingleton({ table, columns }) {
  const db = () => getSupabase();

  async function getRaw() {
    return query(db().from(table).select('*').limit(1).maybeSingle());
  }

  async function get() {
    const row = await getRaw();
    return row ? toCamel(row) : null;
  }

  async function save(input) {
    const row = assign(input, columns);
    const existing = await getRaw();
    if (!existing) {
      const created = await query(db().from(table).insert(row).select('*').single());
      return toCamel(created);
    }
    if (!Object.keys(row).length) return toCamel(existing);
    const updated = await query(db().from(table).update(row).eq('id', existing.id).select('*').single());
    return toCamel(updated);
  }

  return { getRaw, get, save };
}
