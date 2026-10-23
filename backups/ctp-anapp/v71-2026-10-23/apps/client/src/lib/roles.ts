export type LmsRole = "student" | "admin" | "master_admin";

export function isAdministrativeRole(role: unknown): role is "admin" | "master_admin" {
  return role === "admin" || role === "master_admin";
}

export function isMasterAdminRole(role: unknown): role is "master_admin" {
  return role === "master_admin";
}
