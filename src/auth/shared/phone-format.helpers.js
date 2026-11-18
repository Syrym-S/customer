const MAX_DIGITS = 11; // "7" + 10-digit subscriber number

function normalizePhoneDigits(rawValue) {
  let digits = (rawValue || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits[0] === "8") {
    digits = "7" + digits.slice(1);
  } else if (digits[0] !== "7") {
    digits = "7" + digits;
  }

  return digits.slice(0, MAX_DIGITS);
}

function formatPhoneMask(digits) {
  if (!digits) {
    return "";
  }

  const rest = digits.slice(1);
  let formatted = "+7";

  if (rest.length === 0) {
    return formatted + " ";
  }

  formatted += " (" + rest.slice(0, 3);

  if (rest.length >= 3) {
    formatted += ")";
  }

  if (rest.length > 3) {
    formatted += " " + rest.slice(3, 6);
  }

  if (rest.length > 6) {
    formatted += "-" + rest.slice(6, 8);
  }

  if (rest.length > 8) {
    formatted += "-" + rest.slice(8, 10);
  }

  return formatted;
}

// Takes whatever raw text is currently in the input (typed digits mixed
// with mask characters) plus the previously stored digits-only value, and
// returns the normalized submission value (digits only, e.g. "7XXXXXXXXXX",
// no "+" — the backend rejects a "+" prefix) alongside the masked display
// string ("+7 (XXX) XXX-XX-XX").
//
// previousDigits is required to make backspace behave naturally: deleting
// the character right before "+7 (" only removes a static mask character,
// which by itself wouldn't change the extracted digit string. When that
// happens we drop the last digit ourselves so backspace always removes one
// digit no matter which character the cursor lands on.
export function formatPhoneInput(rawValue, previousDigits = "") {
  let digits = normalizePhoneDigits(rawValue);

  const prevDisplayLength = formatPhoneMask(previousDigits).length;
  const isMaskCharDeleted =
    (rawValue || "").length < prevDisplayLength &&
    digits === previousDigits &&
    digits.length > 0;

  if (isMaskCharDeleted) {
    digits = digits.slice(0, -1);
  }

  return {
    value: digits,
    display: formatPhoneMask(digits),
  };
}
