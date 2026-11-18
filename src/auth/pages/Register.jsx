import AuthHeader from "../shared/AuthHeader";
import { useAuthTranslation } from "../i18n/useAuthTranslation";
import FormButton from "../shared/FormButton";
import RegistrationLanguageSelect from "../shared/RegistrationLanguageSelect";
import i18n from "../i18n";
import FormInput from "../shared/FormInput";
import {
  Box,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  MenuItem,
} from "@mui/material";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { DocumentUploadField } from "../shared/DocumentUploadField";
import { getSelectedFile } from "../shared/document-upload-file.helpers";
import { normalizeBackendParams } from "../shared/backend-validation-error.helpers";
import { useState, useEffect } from "react";
import { getClaimInfoApi, registerRequest } from "../api/auth";
import { useRegister } from "../context/InviteContext";
import { useForm, Controller } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { isStaging } from "../api/client";
import { formatPhoneInput } from "../shared/phone-format.helpers";
import { passwordPatternRule } from "../shared/password-validation.helpers";
import { NotRegisteredModal } from "../shared/NotRegisteredModal";
import {
  getVerifyRegistered,
  getSupportContacts,
  getRegistrationNotVerifiedError,
} from "../shared/verify-registered.helpers";
import {
  DOCUMENT_ISSUED_BY_OPTIONS,
  getTodayDateInputValue,
  validateNotAfterToday,
} from "../shared/identity-document.helpers";

const REGISTRATION_DOCUMENT_NAME = "Документ о регистрации юридического лица";

const EMPLOYER_DOCUMENT_NAME =
  "Документ о трудоустройстве сотрудника с правом подписи или приказ о назначении первого руководителя";

// Fail-open: only an explicit `false` hides the documents block.
const isRegistrationDocumentsEnabled =
  window?.APP_DATA?.features?.registration_documents !== false;

export default function Register() {
  const { t } = useAuthTranslation();
  const { invite } = useRegister();
  const { search } = useLocation();

  const claimCode = new URLSearchParams(search).get("claim");

  // const [valuesFromInviteLink, setValuesFromInviteLink] = useState(null);
  const [error, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNotRegisteredOpen, setIsNotRegisteredOpen] = useState(false);
  const [support, setSupport] = useState(null);
  const [fileInputKeys, setFileInputKeys] = useState({
    registration_document: 0,
    signer_authority_document: 0,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      company_name: "",
      bin: "",
      bik: "",
      bank_name: "",
      iik: "",
      legal_address: "",
      fio: "",
      phone: "",
      iin: "",
      document_number: "",
      issue_country: "",
      document_issue_date: "",
      document_issued_by: "",
      registration_document: null,
      signer_authority_document: null,
      email: "",
      password: "",
      password_confirm: "",
      language: i18n.language,
    },
  });

  const password = watch("password");
  const company_name = watch("company_name");
  const bin = watch("bin");
  const email = watch("email");
  const registrationDocument = watch("registration_document");
  const signerAuthorityDocument = watch("signer_authority_document");
  const registrationDocumentFile = getSelectedFile(registrationDocument);
  const signerAuthorityDocumentFile = getSelectedFile(signerAuthorityDocument);

  const BACKEND_FIELD_MAP = {
    company_name: {
      field: "company_name",
      message: "Проверьте название компании",
    },
    bin: { field: "bin", message: "БИН указан некорректно" },
    bik: { field: "bik", message: "БИК указан некорректно" },
    bank_name: { field: "bank_name", message: "Проверьте название банка" },
    iik: { field: "iik", message: "Проверьте правильность ИИК" },
    legal_address: {
      field: "legal_address",
      message: "Проверьте адрес компании",
    },
    fio: { field: "fio", message: "Проверьте корректность ФИО" },
    phone: { field: "phone", message: "Проверьте номер телефона" },
    iin: { field: "iin", message: "ИИН указан некорректно" },
    document_number: {
      field: "document_number",
      message: "Проверьте номер документа",
    },
    issue_country: {
      field: "issue_country",
      message: "Укажите страну выдачи документа",
    },
    document_issue_date: {
      field: "document_issue_date",
      message: "Проверьте дату выдачи документа",
    },
    document_issued_by: {
      field: "document_issued_by",
      message: "Укажите, кем выдан документ",
    },
    email: { field: "email", message: "Проверьте правильность email" },
    password: { field: "password", message: "Проверьте пароль" },
    password_confirm: {
      field: "password_confirm",
      message: "Проверьте подтверждение пароля",
    },
    registration_document: {
      field: "registration_document",
      message: "Проверьте загруженный документ о регистрации",
    },
    employer_document: {
      field: "signer_authority_document",
      message: "Проверьте загруженный документ о праве подписи",
    },
  };

  function handleRemoveFile(fieldName) {
    setValue(fieldName, null, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setFileInputKeys((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName] + 1,
    }));
  }

  const onSubmit = async (data) => {
    setErrorMessage("");

    try {
      const registrationDocumentFile = getSelectedFile(
        data.registration_document,
      );

      const employerDocumentFile = getSelectedFile(
        data.signer_authority_document,
      );

      const payload = new FormData();

      payload.append("company_name", data.company_name);
      payload.append("bin", data.bin);
      payload.append("legal_address", data.legal_address);
      payload.append("fio", data.fio);
      payload.append("phone", data.phone);
      payload.append("iin", data.iin);
      payload.append("document_number", data.document_number);
      payload.append("issue_country", data.issue_country);
      payload.append("document_issue_date", data.document_issue_date);
      payload.append("document_issued_by", data.document_issued_by);
      payload.append("email", data.email);
      payload.append("language", data.language);
      payload.append("password", data.password);
      payload.append("password_confirm", data.password_confirm);

      if (invite) {
        payload.append("invite", invite);
      }

      if (data.bik) {
        payload.append("bik", data.bik);
      }

      if (data.bank_name) {
        payload.append("bank_name", data.bank_name);
      }

      if (data.iik) {
        payload.append("iik", data.iik);
      }

      if (registrationDocumentFile) {
        payload.append(
          "registration_document",
          registrationDocumentFile,
          registrationDocumentFile.name,
        );
        payload.append(
          "registration_document_name",
          REGISTRATION_DOCUMENT_NAME,
        );
      }

      if (employerDocumentFile) {
        payload.append(
          "employer_document",
          employerDocumentFile,
          employerDocumentFile.name,
        );
        payload.append("employer_document_name", EMPLOYER_DOCUMENT_NAME);
      }

      const res = await registerRequest(payload, window?.APP_DATA?.nonce);

      if (res.data?.error) {
        throw new Error(res.data.error);
      }

      if (!getVerifyRegistered(res)) {
        setSupport(getSupportContacts(res));
        setIsNotRegisteredOpen(true);
        return;
      }

      window.location.href = isStaging ? "/staging/customer" : "/customer";
    } catch (e) {
      const notVerifiedSupport = getRegistrationNotVerifiedError(e);

      if (notVerifiedSupport) {
        setSupport(notVerifiedSupport);
        setIsNotRegisteredOpen(true);
        return;
      }

      const ulStatus = e?.response?.data?.ul_status;

      if (ulStatus) {
        if (ulStatus === "pending") {
          setErrorMessage(
            "Не удалось найти организацию по указанному БИН. Проверьте правильность БИН и повторите попытку.",
          );
        } else if (ulStatus === "unknown") {
          setErrorMessage(
            "Сервис проверки документов временно недоступен. Попробуйте позже.",
          );
        } else {
          setErrorMessage(
            "Не удалось проверить организацию. Попробуйте позже.",
          );
        }
        return;
      }

      if (e?.response?.data?.error === "Company exists") {
        setError("bin", {
          type: "server",
          message: "Компания с таким БИН уже зарегистрирована",
        });
        setErrorMessage("Проверьте БИН — компания уже зарегистрирована");
        return;
      }

      if (e?.response?.data?.error === "User exists") {
        setErrorMessage("Пользователь с таким email уже зарегистрирован");
        return;
      }

      if (
        e?.response?.data?.error ===
        "Registration document (file + name) is required"
      ) {
        setError(BACKEND_FIELD_MAP.registration_document.field, {
          type: "server",
          message: "Загрузите документ",
        });
        setError(BACKEND_FIELD_MAP.employer_document.field, {
          type: "server",
          message: "Загрузите документ",
        });
        setErrorMessage("Необходимо загрузить документ о регистрации");
        return;
      }

      const params = e?.response?.data?.data?.params;
      const paramEntries = normalizeBackendParams(params);

      const unmatchedMessages = [];
      let matchedAny = false;

      paramEntries.forEach(({ fieldName, backendMessage }) => {
        const mapping = BACKEND_FIELD_MAP[fieldName];
        if (mapping) {
          matchedAny = true;
          setError(mapping.field, {
            type: "server",
            message: mapping.message,
          });
        } else {
          unmatchedMessages.push(backendMessage || fieldName);
        }
      });

      if (matchedAny && unmatchedMessages.length === 0) {
        setErrorMessage("Проверьте выделенные поля");
      } else if (matchedAny) {
        setErrorMessage({
          key: "Проверьте выделенные поля. Также: {{messages}}",
          values: { messages: unmatchedMessages },
        });
      } else if (unmatchedMessages.length > 0) {
        setErrorMessage(unmatchedMessages.join(", "));
      } else {
        setErrorMessage(
          e?.response?.data?.message ||
            e?.response?.data?.error ||
            e?.message ||
            "Ошибка регистрации",
        );
      }
    }
  };

  const fetchClaimInfo = async () => {
    if (!claimCode) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await getClaimInfoApi(claimCode);

      const data = response.data;

      reset({
        company_name: data.full_name ?? "",
        bin: data.bin ?? "",
        bik: data.bik ?? "",
        bank_name: data.bank_name ?? "",
        iik: data.iik ?? "",
        legal_address: data.legal_address ?? "",
        fio: data?.person?.fio ?? "",
        phone: data?.person?.phone ?? "",
        iin: data?.person?.iin ?? "",
        document_number: "",
        issue_country: data.issue_country ?? "",
        document_issue_date: "",
        document_issued_by: "",
        registration_document: null,
        signer_authority_document: null,
        email: data?.person?.email ?? "",
        password: "",
        password_confirm: "",
        language: i18n.language,
      });
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          e?.message ||
          "Ошибка c получением claim code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimInfo();
  }, [claimCode]);

  return (
    <AuthLayout>
      <NotRegisteredModal open={isNotRegisteredOpen} support={support} />

      <AuthHeader languageSelect={<RegistrationLanguageSelect control={control} />}>
        {t("Регистрация")}
        {isLoading && <CircularProgress size={16} sx={{ pl: 2 }} />}
      </AuthHeader>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t(error)}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          fullWidth
          label={t("БИН")}
          placeholder="210540012345"
          margin="normal"
          error={!!errors.bin}
          helperText={t(errors.bin?.message)}
          {...register("bin", {
            required: "Введите БИН",
            minLength: {
              value: 12,
              message: "БИН должен содержать 12 цифр",
            },
            maxLength: {
              value: 12,
              message: "БИН должен содержать 12 цифр",
            },
          })}
          slotProps={{
            inputLabel: {
              shrink: bin ? true : undefined,
            },
          }}
        />

        <FormInput
          fullWidth
          label={t("Название компании")}
          placeholder={t("ТОО «Алтын Жол Логистик»")}
          margin="normal"
          error={!!errors.company_name}
          helperText={t(errors.company_name?.message)}
          {...register("company_name", {
            required: "Введите название компании",
          })}
          slotProps={{
            inputLabel: {
              shrink: company_name ? true : undefined,
            },
          }}
        />

        <FormInput
          fullWidth
          label={t("Юридический адрес")}
          placeholder={t("г. Алматы, ул. Абая, д. 10, оф. 5")}
          margin="normal"
          error={!!errors.legal_address}
          helperText={t(errors.legal_address?.message)}
          {...register("legal_address", {
            required: "Введите юридический адрес",
          })}
        />

        <FormInput
          fullWidth
          label={t("Банк")}
          placeholder={t("АО «Пример Банк»")}
          margin="normal"
          error={!!errors.bank_name}
          helperText={t(errors.bank_name?.message)}
          {...register("bank_name")}
        />

        <FormInput
          fullWidth
          label={t("БИК")}
          placeholder="BANKKZKX"
          margin="normal"
          error={!!errors.bik}
          helperText={t(errors.bik?.message)}
          {...register("bik")}
        />

        <FormInput
          fullWidth
          label={t("ИИК (расчётный счёт)")}
          placeholder="KZ123456789012345678"
          margin="normal"
          error={!!errors.iik}
          helperText={t(errors.iik?.message)}
          {...register("iik")}
        />

        <FormInput
          fullWidth
          label={t("ФИО")}
          placeholder={t("Нурланов Ерлан Серикович")}
          margin="normal"
          error={!!errors.fio}
          helperText={t(errors.fio?.message)}
          {...register("fio", {
            required: "Введите ФИО",
          })}
        />

        <FormInput
          fullWidth
          label={t("ИИН")}
          placeholder="900115300123"
          margin="normal"
          error={!!errors.iin}
          helperText={t(errors.iin?.message)}
          {...register("iin", {
            required: "Введите ИИН",
            minLength: {
              value: 12,
              message: "ИИН должен содержать 12 цифр",
            },
            maxLength: {
              value: 12,
              message: "ИИН должен содержать 12 цифр",
            },
            pattern: {
              value: /^[0-9]{12}$/,
              message: "ИИН должен содержать только 12 цифр",
            },
          })}
        />

        <FormInput
          fullWidth
          label={t("Номер документа")}
          placeholder="012345678"
          margin="normal"
          error={!!errors.document_number}
          helperText={t(errors.document_number?.message)}
          {...register("document_number", {
            required: "Введите номер документа",
          })}
        />

        <FormInput
          fullWidth
          label={t("Страна документа")}
          placeholder="KZ"
          margin="normal"
          error={!!errors.issue_country}
          helperText={t(errors.issue_country?.message)}
          {...register("issue_country", {
            required: "Введите страну документа",
          })}
        />

        <FormInput
          fullWidth
          type="date"
          label={t("Когда выдан документ")}
          margin="normal"
          error={!!errors.document_issue_date}
          helperText={t(errors.document_issue_date?.message)}
          {...register("document_issue_date", {
            required: "Укажите дату выдачи документа",
            validate: validateNotAfterToday,
          })}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            htmlInput: {
              max: getTodayDateInputValue(),
            },
          }}
        />

        <Controller
          name="document_issued_by"
          control={control}
          rules={{ required: "Укажите, кем выдан документ" }}
          render={({ field }) => (
            <FormInput
              select
              fullWidth
              label={t("Кем выдан документ")}
              margin="normal"
              error={!!errors.document_issued_by}
              helperText={t(errors.document_issued_by?.message)}
              inputRef={field.ref}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              {DOCUMENT_ISSUED_BY_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {t(option)}
                </MenuItem>
              ))}
            </FormInput>
          )}
        />

        {isRegistrationDocumentsEnabled && (
          <>
            <DocumentUploadField
              label={t(REGISTRATION_DOCUMENT_NAME)}
              file={registrationDocumentFile}
              inputKey={fileInputKeys.registration_document}
              error={errors.registration_document?.message}
              inputProps={register("registration_document", {
                required: "Загрузите документ о регистрации юридического лица",
              })}
              onRemove={() => handleRemoveFile("registration_document")}
            />

            <DocumentUploadField
              label={t(EMPLOYER_DOCUMENT_NAME)}
              file={signerAuthorityDocumentFile}
              inputKey={fileInputKeys.signer_authority_document}
              error={errors.signer_authority_document?.message}
              inputProps={register("signer_authority_document", {
                required:
                  "Загрузите документ о праве подписи или приказ о назначении",
              })}
              onRemove={() => handleRemoveFile("signer_authority_document")}
            />
          </>
        )}

        <Controller
          name="phone"
          control={control}
          rules={{
            required: "Введите телефон",
            pattern: {
              value: /^\+?[0-9]{10,15}$/,
              message: "Некорректный номер телефона",
            },
          }}
          render={({ field }) => (
            <FormInput
              fullWidth
              label={t("Телефон")}
              placeholder="+7 (700) 123-45-67"
              margin="normal"
              error={!!errors.phone}
              helperText={t(errors.phone?.message)}
              inputRef={field.ref}
              name={field.name}
              onBlur={field.onBlur}
              value={formatPhoneInput(field.value).display}
              onChange={(e) => {
                field.onChange(
                  formatPhoneInput(e.target.value, field.value).value,
                );
              }}
            />
          )}
        />

        <FormInput
          fullWidth
          label={t("Email")}
          placeholder="nurlanov.erlan@gmail.com"
          margin="normal"
          error={!!errors.email}
          helperText={t(errors.email?.message)}
          {...register("email", {
            required: "Введите email",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Некорректный email",
            },
          })}
          slotProps={{
            inputLabel: {
              shrink: email ? true : undefined,
            },
          }}
        />

        <FormInput
          type="password"
          fullWidth
          label={t("Пароль")}
          margin="normal"
          error={!!errors.password}
          helperText={t(errors.password?.message)}
          {...register("password", {
            required: "Введите пароль",
            minLength: {
              value: 6,
              message: "Минимум 6 символов",
            },
            pattern: passwordPatternRule,
          })}
        />

        <FormInput
          type="password"
          fullWidth
          label={t("Повторите пароль")}
          margin="normal"
          error={!!errors.password_confirm}
          helperText={t(errors.password_confirm?.message)}
          {...register("password_confirm", {
            required: "Подтвердите пароль",
            validate: (value) => value === password || "Пароли не совпадают",
          })}
        />

        <FormButton
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? t("Загрузка...") : t("Зарегистрировать")}
        </FormButton>
      </Box>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />

        <FormButton component={Link} to="/auth/login" fullWidth variant="outlined">
          {t("Войти")}
        </FormButton>
      </Box>
    </AuthLayout>
  );
}
