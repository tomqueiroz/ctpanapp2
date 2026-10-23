export const CANONICAL_PUBLIC_ORIGIN =
  "https://cursoanapp.org.br";

export const PUBLIC_SITE_ORIGINS = new Set([
  CANONICAL_PUBLIC_ORIGIN,
  "https://www.cursoanapp.org.br",
  "https://ctp-anapp-3.skywork.website",
]);

export function isAllowedSiteOrigin(origin: string | null): boolean {
  return !origin || PUBLIC_SITE_ORIGINS.has(origin);
}

export function responseSiteOrigin(origin: string | null): string {
  return origin && PUBLIC_SITE_ORIGINS.has(origin)
    ? origin
    : CANONICAL_PUBLIC_ORIGIN;
}
