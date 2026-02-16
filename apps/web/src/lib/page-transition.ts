const MAIN_NAV_STATIC_ROUTES = new Set(["/", "/users"]);
const EXCLUDED_SINGLE_SEGMENT_ROUTES = new Set(["/login", "/users"]);

export const ROUTE_TRANSITION = {
  coverDurationMs: 200,
  holdDurationMs: 50,
  revealDurationMs: 350,
  maxPendingMs: 3000,
} as const;

function isProfileRoute(pathname: string) {
  if (!pathname.startsWith("/")) return false;
  if (pathname === "/") return false;
  if (pathname.split("/").length !== 2) return false;
  return !EXCLUDED_SINGLE_SEGMENT_ROUTES.has(pathname);
}

export function shouldAnimatePath(pathname: string) {
  return MAIN_NAV_STATIC_ROUTES.has(pathname) || isProfileRoute(pathname);
}
