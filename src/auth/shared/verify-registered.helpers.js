// TODO: remove the mock once QA no longer needs to force the "not verified" state manually.
export function isMockUnverifiedRegistration() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    new URLSearchParams(window.location.search).get("mockUnverified") === "1"
  );
}

function getResponseBody(response) {
  // v1 endpoints (forwarder/factor/customer) put fields on the body root,
  // v2 endpoints (driver) nest them one level deeper under `data`.
  const body = response?.data ?? response ?? {};
  return body.data && typeof body.data === "object" ? body.data : body;
}

// Fail-open: until the backend ships the field, treat the user as verified.
export function getVerifyRegistered(response) {
  if (isMockUnverifiedRegistration()) {
    return false;
  }

  const body = getResponseBody(response);

  if (typeof body.verify_registered === "boolean") {
    return body.verify_registered;
  }

  return true;
}

export function getSupportContacts(response) {
  const body = getResponseBody(response);
  const support = body.support || {};

  return {
    phone: support.phone || "",
    email: support.email || "",
  };
}

// The backend rejects the request outright (403) with this shape once
// registration needs manager approval, instead of a normal validation error.
export function getRegistrationNotVerifiedError(error) {
  const data = error?.response?.data;

  if (data?.code !== "registration_not_verified") {
    return null;
  }

  const support = data?.support || {};

  return {
    phone: support.phone || "",
    email: support.email || "",
  };
}

export function getAppDataSupportContacts() {
  const support =
    (typeof window === "undefined" ? null : window?.APP_DATA?.support) || {};

  return {
    phone: support.phone || "",
    email: support.email || "",
  };
}
