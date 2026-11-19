const SESSION_EXPIRED_CODES = new Set([
   'invalid_token',
   'expired_token',
   'token_expired',
   'invalid_bearer_token',
   'jwt_auth_invalid_token',
   'jwt_auth_expired_token',
   'rest_not_logged_in',
   'rest_forbidden_token',
]);

const SESSION_EXPIRED_MESSAGE_PATTERN =
   /(token|токен|expired|истёк|истек|не авторизован|unauthorized)/i;

export function isSessionExpiredResponse(error) {
   const status = error?.response?.status;

   if (status === 401) {
      return true;
   }

   if (status !== 403) {
      return false;
   }

   const data = error?.response?.data;
   const code = String(data?.code || data?.error_code || '').toLowerCase();

   if (SESSION_EXPIRED_CODES.has(code)) {
      return true;
   }

   const message = String(data?.message || data?.error || '');

   return SESSION_EXPIRED_MESSAGE_PATTERN.test(message);
}
