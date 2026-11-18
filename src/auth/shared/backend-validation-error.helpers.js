export function normalizeBackendParams(params) {
  if (!params) {
    return [];
  }

  if (Array.isArray(params)) {
    return params.map((fieldName) => ({ fieldName, backendMessage: null }));
  }

  return Object.keys(params).map((fieldName) => ({
    fieldName,
    backendMessage: params[fieldName],
  }));
}
