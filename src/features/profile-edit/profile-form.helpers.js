import { getTodayDateInputValue } from "../create-lead/lib/point-schedule.helpers";

// Sent to the backend exactly as written (same convention as driver-mobile).
export const DOCUMENT_ISSUED_BY_OPTIONS = ["МЮ РК", "МВД РК"];

export function validateNotAfterToday(value) {
  if (!value) {
    return true;
  }

  return (
    value <= getTodayDateInputValue() ||
    "Дата не может быть позже сегодняшнего дня"
  );
}

export const initialProfileForm = {
  fullName: "",
  bin: "",
  legalAddress: "",
  accountNumber: "",
  bik: "",
  bankName: "",
  personFio: "",
  personPhone: "",
  personEmail: "",
  personIin: "",

  documentNumber: "",
  issueCountry: "",
  documentIssueDate: "",
  documentIssuedBy: "",

  registrationDocument: "",
  employerDocument: "",

  currentPassword: "",
  newPassword: "",
  newPasswordConfirm: "",
};

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function onlyDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function addIfNotEmpty(payload, key, value) {
  const normalizedValue = normalizeText(value);

  if (normalizedValue) {
    payload[key] = normalizedValue;
  }
}

export function mapProfileFromApi(profile, legalDocuments) {
  return {
    fullName: profile?.fullName || profile?.name || "",
    bin: profile?.bin || "",
    legalAddress: profile?.legalAddress || profile?.legal_address || "",
    accountNumber: profile?.accountNumber || profile?.iik || "",
    bik: profile?.bik || "",
    bankName: profile?.bankName || profile?.bank_name || "",

    personFio: profile?.personFio || "",
    personPhone: profile?.personPhone || "",
    personEmail: profile?.personEmail || "",
    personIin: profile?.personIin || "",

    documentNumber:
      profile?.document_number ||
      profile?.documentNumber ||
      profile?.personDocumentNumber ||
      "",
    issueCountry:
      profile?.issue_country ||
      profile?.issueCountry ||
      profile?.personIssueCountry ||
      "",
    documentIssueDate:
      profile?.document_issue_date || profile?.documentIssueDate || "",
    documentIssuedBy:
      profile?.document_issued_by || profile?.documentIssuedBy || "",

    // registrationDocument: profile?.registrationDocument || "",
    // employerDocument: profile?.employerDocument || "",

    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
    registrationDocument:
      legalDocuments?.find((document) => document.context === "registration") ||
      {},
    employerDocument:
      legalDocuments?.find((document) => document.context === "employer") || {},
  };
}

export function mapProfileFormToApi(form) {
  const payload = {};

  addIfNotEmpty(payload, "fullName", form.fullName);
  addIfNotEmpty(payload, "legalAddress", form.legalAddress);
  addIfNotEmpty(payload, "bankName", form.bankName);
  addIfNotEmpty(payload, "personFio", form.personFio);
  addIfNotEmpty(payload, "personPhone", form.personPhone);
  addIfNotEmpty(payload, "document_number", form.documentNumber);
  addIfNotEmpty(payload, "issue_country", form.issueCountry);

  const bin = onlyDigits(form.bin);
  const personIin = onlyDigits(form.personIin);
  const accountNumber = normalizeText(form.accountNumber).toUpperCase();
  const bik = normalizeText(form.bik).toUpperCase();
  const personEmail = normalizeText(form.personEmail);

  if (bin) payload.bin = bin;
  if (personIin) payload.personIin = personIin;
  if (accountNumber) payload.accountNumber = accountNumber;
  if (bik) payload.bik = bik;
  if (personEmail) payload.personEmail = personEmail;

  const currentPassword = String(form.currentPassword ?? "").trim();
  const newPassword = String(form.newPassword ?? "").trim();
  const newPasswordConfirm = String(form.newPasswordConfirm ?? "").trim();

  if (currentPassword || newPassword || newPasswordConfirm) {
    payload.currentPassword = currentPassword;
    payload.newPassword = newPassword;
    payload.newPasswordConfirm = newPasswordConfirm;
  }

  return payload;
}

function normalizeProfileValue(value) {
  return String(value ?? "").trim();
}

function normalizeDigitsValue(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function mapProfileFormToChangedApi(form, initialForm) {
  const payload = {};

  const comparableFields = [
    "fullName",
    "legalAddress",
    "accountNumber",
    "bik",
    "bankName",
    "personFio",
    "personPhone",
    "personEmail",
  ];

  comparableFields.forEach((field) => {
    const nextValue = normalizeProfileValue(form[field]);
    const prevValue = normalizeProfileValue(initialForm?.[field]);

    if (nextValue && nextValue !== prevValue) {
      payload[field] = nextValue;
    }
  });

  const nextDocumentNumber = normalizeProfileValue(form.documentNumber);
  const prevDocumentNumber = normalizeProfileValue(initialForm?.documentNumber);

  if (nextDocumentNumber && nextDocumentNumber !== prevDocumentNumber) {
    payload.personDocumentNumber = nextDocumentNumber;
  }

  const nextIssueCountry = normalizeProfileValue(form.issueCountry);
  const prevIssueCountry = normalizeProfileValue(initialForm?.issueCountry);

  if (nextIssueCountry && nextIssueCountry !== prevIssueCountry) {
    payload.personIssueCountry = nextIssueCountry;
  }

  const nextDocumentIssueDate = normalizeProfileValue(form.documentIssueDate);
  const prevDocumentIssueDate = normalizeProfileValue(
    initialForm?.documentIssueDate,
  );

  if (nextDocumentIssueDate && nextDocumentIssueDate !== prevDocumentIssueDate) {
    payload.document_issue_date = nextDocumentIssueDate;
  }

  const nextDocumentIssuedBy = normalizeProfileValue(form.documentIssuedBy);
  const prevDocumentIssuedBy = normalizeProfileValue(
    initialForm?.documentIssuedBy,
  );

  if (nextDocumentIssuedBy && nextDocumentIssuedBy !== prevDocumentIssuedBy) {
    payload.document_issued_by = nextDocumentIssuedBy;
  }

  const nextBin = normalizeDigitsValue(form.bin);
  const prevBin = normalizeDigitsValue(initialForm?.bin);

  if (nextBin && nextBin !== prevBin) {
    payload.bin = nextBin;
  }

  const nextPersonIin = normalizeDigitsValue(form.personIin);
  const prevPersonIin = normalizeDigitsValue(initialForm?.personIin);

  if (nextPersonIin && nextPersonIin !== prevPersonIin) {
    payload.personIin = nextPersonIin;
  }

  const currentPassword = normalizeProfileValue(form.currentPassword);
  const newPassword = normalizeProfileValue(form.newPassword);
  const newPasswordConfirm = normalizeProfileValue(form.newPasswordConfirm);

  if (currentPassword || newPassword || newPasswordConfirm) {
    payload.currentPassword = currentPassword;
    payload.newPassword = newPassword;
    payload.newPasswordConfirm = newPasswordConfirm;
  }

  return payload;
}

const DOCUMENT_SECTION_FIELDS = [
  "documentNumber",
  "issueCountry",
  "documentIssueDate",
  "documentIssuedBy",
];

// Like the password block, the issue date / issuer become required only once
// the user edits the document section, so unrelated profile saves (and
// profiles registered before these fields existed) are not blocked.
function isDocumentSectionChanged(form, initialForm) {
  return DOCUMENT_SECTION_FIELDS.some(
    (field) =>
      normalizeProfileValue(form[field]) !==
      normalizeProfileValue(initialForm?.[field]),
  );
}

export function validateProfileForm(form, initialForm) {
  const errors = {};

  const fullName = normalizeText(form.fullName);
  const bin = onlyDigits(form.bin);
  const legalAddress = normalizeText(form.legalAddress);
  const accountNumber = normalizeText(form.accountNumber).toUpperCase();
  const bik = normalizeText(form.bik);
  const bankName = normalizeText(form.bankName);
  const personEmail = normalizeText(form.personEmail);
  const personIin = onlyDigits(form.personIin);
  const documentNumber = normalizeText(form.documentNumber);
  const issueCountry = normalizeText(form.issueCountry);

  const currentPassword = String(form.currentPassword ?? "").trim();
  const newPassword = String(form.newPassword ?? "").trim();
  const newPasswordConfirm = String(form.newPasswordConfirm ?? "").trim();

  const wantsPasswordChange =
    currentPassword || newPassword || newPasswordConfirm;

  if (fullName && (fullName.length < 2 || fullName.length > 100)) {
    errors.fullName = "От 2 до 100 символов";
  }

  if (bin && !/^\d{12}$/.test(bin)) {
    errors.bin = "БИН должен содержать 12 цифр";
  }

  if (legalAddress && (legalAddress.length < 2 || legalAddress.length > 255)) {
    errors.legalAddress = "От 2 до 255 символов";
  }

  if (accountNumber && !/^KZ[A-Z0-9]{18}$/i.test(accountNumber)) {
    errors.accountNumber = "Формат: KZ + 18 символов";
  }

  if (bik && bik.length !== 8) {
    errors.bik = "БИК должен содержать 8 символов";
  }

  if (bankName && (bankName.length < 2 || bankName.length > 100)) {
    errors.bankName = "От 2 до 100 символов";
  }

  if (personEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personEmail)) {
    errors.personEmail = "Некорректный email";
  }

  if (personIin && !/^\d{12}$/.test(personIin)) {
    errors.personIin = "ИИН должен содержать 12 цифр";
  }

  if (documentNumber && documentNumber.length > 50) {
    errors.documentNumber = "Не больше 50 символов";
  }

  if (issueCountry && issueCountry.length > 100) {
    errors.issueCountry = "Не больше 100 символов";
  }

  const documentIssueDate = normalizeText(form.documentIssueDate);
  const documentIssuedBy = normalizeText(form.documentIssuedBy);
  const documentSectionChanged = isDocumentSectionChanged(form, initialForm);

  if (documentIssueDate) {
    const issueDateValidation = validateNotAfterToday(documentIssueDate);

    if (issueDateValidation !== true) {
      errors.documentIssueDate = issueDateValidation;
    }
  } else if (documentSectionChanged) {
    errors.documentIssueDate = "Укажите дату выдачи документа";
  }

  if (!documentIssuedBy && documentSectionChanged) {
    errors.documentIssuedBy = "Укажите, кем выдан документ";
  }

  if (wantsPasswordChange) {
    if (!currentPassword) {
      errors.currentPassword = "Введите текущий пароль";
    }

    if (!newPassword) {
      errors.newPassword = "Введите новый пароль";
    } else if (newPassword.length < 6) {
      errors.newPassword = "Минимум 6 символов";
    }

    if (!newPasswordConfirm) {
      errors.newPasswordConfirm = "Повторите новый пароль";
    } else if (newPasswordConfirm !== newPassword) {
      errors.newPasswordConfirm = "Пароли не совпадают";
    }
  }

  return errors;
}
