function camelKey(key) {
  return key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

export function toCamel(value) {
  if (Array.isArray(value)) return value.map(toCamel);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.endsWith('_path') && key !== 'password_hash' && key !== 'singleton')
        .map(([key, nested]) => [camelKey(key), toCamel(nested)]),
    );
  }
  return value;
}
