export const ADMIN_EMAILS = ['alan@wedosoft.net'] as const;

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return (ADMIN_EMAILS as readonly string[]).includes(email.trim().toLowerCase());
}
