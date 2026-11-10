export function generateId(prefix = 'id'): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
