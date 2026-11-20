let appRoutes = [];

export function registerAppRoutes(routes) {
  appRoutes = Array.isArray(routes) ? routes : [];
}

export function getAppRoutes() {
  return appRoutes;
}
