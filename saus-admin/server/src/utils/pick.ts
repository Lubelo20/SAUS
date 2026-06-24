/**
 * Return a new object containing only the allowlisted keys from `obj`.
 * Prevents mass-assignment: callers pass an explicit list of client-settable
 * fields so request bodies can never set protected columns (id, createdById,
 * role, isActive on other models, etc.).
 */
export function pick(obj: any, keys: string[]): any {
  const out: Record<string, any> = {};
  if (obj && typeof obj === 'object') {
    for (const k of keys) {
      if (obj[k] !== undefined) out[k] = obj[k];
    }
  }
  return out;
}
