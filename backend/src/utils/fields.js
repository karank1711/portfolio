export function assign(input, columns) {
  const row = {};
  for (const [key, column] of Object.entries(columns)) {
    if (Object.prototype.hasOwnProperty.call(input, key) && input[key] !== undefined) {
      row[column] = input[key];
    }
  }
  return row;
}
