// Backend requires: min 6 chars, at least one uppercase, one lowercase,
// one digit, and one special character.
export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const PASSWORD_PATTERN_MESSAGE =
  'Пароль должен содержать заглавную и строчную буквы, цифру и спецсимвол';

export const passwordPatternRule = {
  value: PASSWORD_PATTERN,
  message: PASSWORD_PATTERN_MESSAGE,
};
