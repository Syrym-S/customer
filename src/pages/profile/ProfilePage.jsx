import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  initialProfileForm,
  mapProfileFormToChangedApi,
  mapProfileFromApi,
  validateProfileForm,
} from "../../features/profile-edit/profile-form.helpers";
import {
  fetchCustomerProfile,
  updateCustomerProfile,
  uploadCustomerAvatar,
  deleteCustomerAvatar,
  updateProfileDocuments,
  getLegalDocumentsApi,
} from "../../features/profile-edit/profile.api";
import { notifySuccess } from "../../shared/model/notifications.store";
import {
  getAvatarFromUploadResponse,
  notifyProfilePhotoUpdated,
} from "../../widgets/customer-profile/model/profile-photo.helpers";
import { ProfilePhotoUploader } from "../../widgets/customer-profile/ui/ProfilePhotoUploader";
import { EmailVerificationStatus } from "../../widgets/customer-verification/ui/EmailVerificationStatus";
import { ProfileDocumentUpdateField } from "../../widgets/customer-profile/ui/ProfileDocumentUpdateField";

export function ProfilePage() {
  const [form, setForm] = useState(initialProfileForm);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [legalFilesLoading, setLegalFilesLoading] = useState(false);
  const [initialLoadedForm, setInitialLoadedForm] =
    useState(initialProfileForm);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoError, setProfilePhotoError] = useState("");
  const [shouldDeleteProfilePhoto, setShouldDeleteProfilePhoto] =
    useState(false);

  const [profileDocumentFiles, setProfileDocumentFiles] = useState({
    registrationDocument: null,
    employerDocument: null,
  });

  const [profileDocumentErrors, setProfileDocumentErrors] = useState({
    registrationDocument: "",
    employerDocument: "",
  });

  const [profileDocumentInputKeys, setProfileDocumentInputKeys] = useState({
    registrationDocument: 0,
    employerDocument: 0,
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));

    setSubmitError("");
  }

  async function getProfileData(isCancelled) {
    try {
      setIsProfileLoading(true);
      setProfileLoadError("");

      const profile = await fetchCustomerProfile();
      const legalDocuments = await getLegalDocumentsApi();

      if (!isCancelled) {
        const mappedProfile = mapProfileFromApi(profile, legalDocuments);
        const avatar = profile?.avatar || "";

        setForm(mappedProfile);
        setInitialLoadedForm(mappedProfile);

        setProfilePhoto(avatar);
        setProfilePhotoFile(null);
        setProfilePhotoError("");
        setShouldDeleteProfilePhoto(false);

        setProfileDocumentFiles({
          registrationDocument: null,
          employerDocument: null,
        });

        setProfileDocumentErrors({
          registrationDocument: "",
          employerDocument: "",
        });

        setProfileDocumentInputKeys({
          registrationDocument: 0,
          employerDocument: 0,
        });

        setErrors({});
        setSubmitError("");
      }
    } catch (error) {
      if (!isCancelled) {
        setProfileLoadError(
          error.response?.data?.message ||
            error.message ||
            "Не удалось загрузить профиль",
        );
      }
    } finally {
      if (!isCancelled) {
        setIsProfileLoading(false);
      }
    }
  }

  function validateProfileDocumentFile(file) {
    if (!file) {
      return "";
    }

    const maxSizeMb = 10;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];

    const fileExtension = String(file.name || "")
      .split(".")
      .pop()
      ?.toLowerCase();

    const hasAllowedType = allowedTypes.includes(file.type);
    const hasAllowedExtension = allowedExtensions.includes(fileExtension);

    if (!hasAllowedType && !hasAllowedExtension) {
      return "Разрешены только PDF, JPG, JPEG или PNG";
    }

    if (file.size > maxSizeBytes) {
      return `Размер файла не должен превышать ${maxSizeMb} MB`;
    }

    return "";
  }

  function handleProfileDocumentChange(fieldName, file) {
    const validationError = validateProfileDocumentFile(file);

    if (validationError) {
      setProfileDocumentFiles((prevFiles) => ({
        ...prevFiles,
        [fieldName]: null,
      }));

      setProfileDocumentErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: validationError,
      }));

      setProfileDocumentInputKeys((prevKeys) => ({
        ...prevKeys,
        [fieldName]: prevKeys[fieldName] + 1,
      }));

      return;
    }

    setProfileDocumentFiles((prevFiles) => ({
      ...prevFiles,
      [fieldName]: file,
    }));

    setProfileDocumentErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: "",
    }));

    setSubmitError("");
  }

  function handleCancelProfileDocumentChange(fieldName) {
    setProfileDocumentFiles((prevFiles) => ({
      ...prevFiles,
      [fieldName]: null,
    }));

    setProfileDocumentErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: "",
    }));

    setProfileDocumentInputKeys((prevKeys) => ({
      ...prevKeys,
      [fieldName]: prevKeys[fieldName] + 1,
    }));

    setSubmitError("");
  }

  async function uploadLegalDocuments(files) {
    try {
      setLegalFilesLoading(true);

      updateProfileDocuments(files);

      setLegalFilesLoading(false);
    } catch (e) {
      console.log(e);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateProfileForm(form);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (profilePhotoError) {
      return;
    }

    const payload = mapProfileFormToChangedApi(form, initialLoadedForm);

    uploadLegalDocuments(profileDocumentFiles);

    const hasProfileChanges = Object.keys(payload).length > 0;
    const hasPhotoUpload = Boolean(profilePhotoFile);
    const hasPhotoDelete = shouldDeleteProfilePhoto;

    const hasDocumentUploads = Boolean(
      profileDocumentFiles.registrationDocument ||
      profileDocumentFiles.employerDocument,
    );

    const hasDocumentErrors = Boolean(
      profileDocumentErrors.registrationDocument ||
      profileDocumentErrors.employerDocument,
    );

    if (hasDocumentErrors) {
      return;
    }

    if (
      !hasProfileChanges &&
      !hasPhotoUpload &&
      !hasPhotoDelete &&
      !hasDocumentUploads
    ) {
      setSubmitError("Нет изменений для сохранения");
      return;
    }

    try {
      setIsSaving(true);
      setSubmitError("");

      if (hasProfileChanges) {
        await updateCustomerProfile(payload);
      }

      let nextAvatar = profilePhoto;

      if (hasPhotoDelete) {
        await deleteCustomerAvatar();

        nextAvatar = "";

        notifyProfilePhotoUpdated("");
      }

      if (hasPhotoUpload) {
        const uploadResponse = await uploadCustomerAvatar(profilePhotoFile);
        const updatedProfile = await fetchCustomerProfile();

        nextAvatar =
          updatedProfile?.avatar ||
          getAvatarFromUploadResponse(uploadResponse, profilePhoto);

        notifyProfilePhotoUpdated(nextAvatar);
      }

      if (hasDocumentUploads) {
        await updateProfileDocuments({
          registrationDocumentFile: profileDocumentFiles.registrationDocument,
          employerDocumentFile: profileDocumentFiles.employerDocument,
        });
      }

      const nextInitialForm = {
        ...form,
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      };

      setInitialLoadedForm(nextInitialForm);
      setProfilePhoto(nextAvatar);
      setProfilePhotoFile(null);
      setShouldDeleteProfilePhoto(false);
      setForm(nextInitialForm);

      setProfileDocumentFiles({
        registrationDocument: null,
        employerDocument: null,
      });

      setProfileDocumentErrors({
        registrationDocument: "",
        employerDocument: "",
      });

      setProfileDocumentInputKeys((prevKeys) => ({
        registrationDocument: prevKeys.registrationDocument + 1,
        employerDocument: prevKeys.employerDocument + 1,
      }));

      await getProfileData();

      notifySuccess("Профиль успешно обновлен");
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Не удалось обновить профиль",
      );
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadProfile() {
      await getProfileData(isCancelled);
    }

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
          borderRadius: 3,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Профиль
            </Typography>

            <Typography color="text.secondary" fontSize={14}>
              Данные компании и контактного лица
            </Typography>
          </Box>

          {profileLoadError && (
            <Alert severity="error">{profileLoadError}</Alert>
          )}

          {submitError && <Alert severity="error">{submitError}</Alert>}

          <EmailVerificationStatus />

          <ProfilePhotoUploader
            value={profilePhoto}
            error={profilePhotoError}
            disabled={isSaving || isProfileLoading}
            isLoading={isProfileLoading}
            onChange={(nextPhoto, file) => {
              setProfilePhoto(nextPhoto);
              setProfilePhotoFile(file);
              setShouldDeleteProfilePhoto(false);
              setProfilePhotoError("");
              setSubmitError("");
            }}
            onRemove={() => {
              setProfilePhoto("");
              setProfilePhotoFile(null);
              setShouldDeleteProfilePhoto(true);
              setProfilePhotoError("");
              setSubmitError("");
            }}
            onError={setProfilePhotoError}
          />

          <Stack spacing={2}>
            <Typography fontWeight={600}>Компания и реквизиты</Typography>

            <TextField
              name="fullName"
              label="Название"
              value={form.fullName}
              onChange={handleChange}
              error={Boolean(errors.fullName)}
              helperText={errors.fullName}
              fullWidth
            />

            <TextField
              name="bin"
              label="БИН"
              value={form.bin}
              onChange={handleChange}
              error={Boolean(errors.bin)}
              helperText={errors.bin}
              fullWidth
            />

            <TextField
              name="bik"
              label="БИК"
              value={form.bik}
              onChange={handleChange}
              error={Boolean(errors.bik)}
              helperText={errors.bik}
              fullWidth
            />

            <TextField
              name="accountNumber"
              label="ИИК"
              value={form.accountNumber}
              onChange={handleChange}
              error={Boolean(errors.accountNumber)}
              helperText={errors.accountNumber}
              fullWidth
            />

            <TextField
              name="legalAddress"
              label="Юридический адрес"
              value={form.legalAddress}
              onChange={handleChange}
              error={Boolean(errors.legalAddress)}
              helperText={errors.legalAddress}
              fullWidth
            />

            <TextField
              name="bankName"
              label="Название банка"
              value={form.bankName}
              onChange={handleChange}
              error={Boolean(errors.bankName)}
              helperText={errors.bankName}
              fullWidth
            />
          </Stack>

          <Stack spacing={2}>
            <Typography fontWeight={600}>Контактное лицо</Typography>

            <TextField
              name="personFio"
              label="ФИО"
              value={form.personFio}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              name="personPhone"
              label="Телефон"
              value={form.personPhone}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              name="personEmail"
              label="Email"
              value={form.personEmail}
              onChange={handleChange}
              error={Boolean(errors.personEmail)}
              helperText={errors.personEmail}
              fullWidth
            />

            <TextField
              name="personIin"
              label="ИИН"
              value={form.personIin}
              onChange={handleChange}
              error={Boolean(errors.personIin)}
              helperText={errors.personIin}
              fullWidth
            />
          </Stack>

          <Stack spacing={2}>
            <Typography fontWeight={600}>Смена пароля</Typography>

            <TextField
              name="profileCurrentPassword"
              label="Текущий пароль"
              type="password"
              value={form.currentPassword}
              onChange={(event) => {
                handleChange({
                  target: {
                    name: "currentPassword",
                    value: event.target.value,
                  },
                });
              }}
              error={Boolean(errors.currentPassword)}
              helperText={errors.currentPassword}
              fullWidth
              autoComplete="new-password"
              inputProps={{
                autoComplete: "new-password",
                readOnly: true,
                onFocus: (event) => {
                  event.target.removeAttribute("readonly");
                },
              }}
            />

            <TextField
              name="newPassword"
              label="Новый пароль"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword}
              fullWidth
              autoComplete="new-password"
              inputProps={{
                autoComplete: "new-password",
              }}
            />

            <TextField
              name="newPasswordConfirm"
              label="Повторите новый пароль"
              type="password"
              value={form.newPasswordConfirm}
              onChange={handleChange}
              error={Boolean(errors.newPasswordConfirm)}
              helperText={errors.newPasswordConfirm}
              fullWidth
              autoComplete="new-password"
              inputProps={{
                autoComplete: "new-password",
              }}
            />
          </Stack>

          <Stack spacing={2}>
            <Typography fontWeight={600}>Документ</Typography>

            <TextField
              name="documentNumber"
              label="Номер документа"
              value={form.documentNumber}
              onChange={handleChange}
              error={Boolean(errors.documentNumber)}
              helperText={errors.documentNumber}
              fullWidth
            />

            <TextField
              name="issueCountry"
              label="Страна выдачи"
              value={form.issueCountry}
              onChange={handleChange}
              error={Boolean(errors.issueCountry)}
              helperText={errors.issueCountry}
              fullWidth
            />
          </Stack>

          <Stack spacing={2}>
            <Box>
              <Typography fontWeight={600}>
                Регистрационные документы
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr",
                },
                gap: 1,
              }}
            >
              <ProfileDocumentUpdateField
                label="Документ о регистрации юридического лица"
                currentDocument={form.registrationDocument}
                file={profileDocumentFiles.registrationDocument}
                inputKey={profileDocumentInputKeys.registrationDocument}
                error={profileDocumentErrors.registrationDocument}
                disabled={isSaving || isProfileLoading}
                onChange={(file) =>
                  handleProfileDocumentChange("registrationDocument", file)
                }
                onCancel={() =>
                  handleCancelProfileDocumentChange("registrationDocument")
                }
              />
              <ProfileDocumentUpdateField
                label="Документ о трудоустройстве сотрудника"
                currentDocument={form.employerDocument}
                file={profileDocumentFiles.employerDocument}
                inputKey={profileDocumentInputKeys.employerDocument}
                error={profileDocumentErrors.employerDocument}
                disabled={isSaving || isProfileLoading}
                onChange={(file) =>
                  handleProfileDocumentChange("employerDocument", file)
                }
                onCancel={() =>
                  handleCancelProfileDocumentChange("employerDocument")
                }
              />
            </Box>
          </Stack>

          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={isSaving || isProfileLoading}
            >
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
