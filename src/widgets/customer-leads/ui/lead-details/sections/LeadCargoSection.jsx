import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import i18n from "../../../../../shared/i18n";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";

import { DetailSection } from "../components/DetailSection";
import { InfoBadge } from "../components/InfoBadge";
import { useEffect, useMemo, useState } from "react";
import { formatAmount } from "../../../../../shared/helpers/currency-format.helpers";
import {
  fetchCustomerCargoTypesApi,
  searchCustomerCargoTypesApi,
} from "../../../api/cargo-types.api";
import { CurrencyAutocomplete } from "../../../../../features/create-lead/ui/create-lead-modal/components/CurrencyAutocomplete";
import { TnvedCodeAutocomplete } from "../../../../customer-tnved/ui/TnvedCodeAutocomplete";
import {
  isFinishedLead,
  isCancelledLead,
  isEmergencyLead,
  isFinishedEmergencyLead,
} from "../../../model/lead.helpers";
import {
  computeCargoVolumeM3,
  formatCargoVolumeM3,
} from "../../../model/lead-transportation.helpers";
import { NumericTextField } from "../../../../../shared/ui/NumericTextField";

function createEmptyLeadCargo() {
  return {
    name: "",
    description: "",
    weight_kg: "",
    cargo_price: "",
    type: i18n.t("common.empty.notSpecifiedM"),
    width_cm: "",
    height_cm: "",
    length_cm: "",
    volume_m3: "",
    isVolumeManual: false,
    tnved: null,
  };
}

function getLeadCargos(lead) {
  return Array.isArray(lead.cargos) ? lead.cargos : [];
}

function getEditCargos(editForm) {
  if (Array.isArray(editForm.cargos) && editForm.cargos.length) {
    return editForm.cargos;
  }

  return [createEmptyLeadCargo()];
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function getCargoWeightDisplay(cargo) {
  return hasValue(cargo.weight_kg) ? i18n.t("common.units.kg", { value: cargo.weight_kg }) : i18n.t("common.empty.notSpecifiedN");
}

function getCargoDimensionsDisplay(cargo) {
  const length = cargo.length_cm;
  const width = cargo.width_cm;
  const height = cargo.height_cm;

  if (!hasValue(length) && !hasValue(width) && !hasValue(height)) {
    return i18n.t("common.empty.notSpecifiedN");
  }

  return i18n.t("common.units.dimensionsCm", {
    length: length || "—",
    width: width || "—",
    height: height || "—",
  });
}

function getCargoVolumeDisplay(cargo) {
  return formatCargoVolumeM3(cargo.volume_m3) || i18n.t("common.empty.notSpecifiedN");
}

export function LeadCargoSection({
  lead,
  isEditing,
  editForm,
  onEditChange,
  onDeleteCargo,
  deletingCargoIndex = null,
  hidePrice = false,
}) {
  const { t } = useTranslation();

  const [cargoTypes, setCargoTypes] = useState([]);
  const [cargoTypesSearch, setCargoTypesSearch] = useState("");
  const [isCargoTypesLoading, setIsCargoTypesLoading] = useState(false);

  const leadCargos = getLeadCargos(lead);
  const editCargos = getEditCargos(editForm);

  const isForwarderCreatedLead = lead?.created_by === "forwarder";
  const isInternational = Boolean(
    isEditing ? editForm.is_international : lead?.is_international,
  );
  const canBeDeleted = lead?.cargos?.length > 1;
  const canDeleteCargo =
    !isFinishedLead(lead) &&
    !isCancelledLead(lead) &&
    !isEmergencyLead(lead) &&
    !isFinishedEmergencyLead(lead);

  useEffect(() => {
    if (!isEditing) {
      return undefined;
    }

    let isCancelled = false;

    async function loadCargoTypes() {
      try {
        setIsCargoTypesLoading(true);

        const response = await fetchCustomerCargoTypesApi();

        if (!isCancelled) {
          setCargoTypes(response);
        }
      } catch (error) {
        console.error("Не удалось загрузить типы груза:", error);

        if (!isCancelled) {
          setCargoTypes([]);
        }
      } finally {
        if (!isCancelled) {
          setIsCargoTypesLoading(false);
        }
      }
    }

    loadCargoTypes();

    return () => {
      isCancelled = true;
    };
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      return undefined;
    }

    const search = cargoTypesSearch.trim();

    if (!search) {
      return undefined;
    }

    let isCancelled = false;

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsCargoTypesLoading(true);

        const response = await searchCustomerCargoTypesApi(search);

        if (!isCancelled) {
          setCargoTypes(response);
        }
      } catch (error) {
        console.error("Не удалось найти типы груза:", error);
      } finally {
        if (!isCancelled) {
          setIsCargoTypesLoading(false);
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [cargoTypesSearch, isEditing]);

  const cargoTypeOptions = useMemo(() => {
    const defaultOption = {
      id: "",
      name: t("common.empty.notSpecifiedM"),
    };

    const uniqueMap = new Map();

    [defaultOption, ...cargoTypes].forEach((item) => {
      if (!item?.name) {
        return;
      }

      uniqueMap.set(String(item.name).toLowerCase(), item);
    });

    return Array.from(uniqueMap.values());
  }, [cargoTypes, t]);

  function handleCargoChange(index, key, value) {
    const nextCargos = editCargos.map((cargo, cargoIndex) => {
      if (cargoIndex !== index) {
        return cargo;
      }

      const nextCargo = { ...cargo, [key]: value };

      if (key === "volume_m3") {
        nextCargo.isVolumeManual = value !== "";

        if (!nextCargo.isVolumeManual) {
          const computedVolume = computeCargoVolumeM3(
            nextCargo.length_cm,
            nextCargo.width_cm,
            nextCargo.height_cm,
          );

          nextCargo.volume_m3 = computedVolume === null ? "" : computedVolume;
        }

        return nextCargo;
      }

      if (
        ["length_cm", "width_cm", "height_cm"].includes(key) &&
        !nextCargo.isVolumeManual
      ) {
        const computedVolume = computeCargoVolumeM3(
          nextCargo.length_cm,
          nextCargo.width_cm,
          nextCargo.height_cm,
        );

        nextCargo.volume_m3 = computedVolume === null ? "" : computedVolume;
      }

      return nextCargo;
    });

    onEditChange("cargos", nextCargos);
  }

  function handleAddCargo() {
    onEditChange("cargos", [...editCargos, createEmptyLeadCargo()]);
  }

  function handleRemoveCargo(index) {
    const nextCargos = editCargos.filter(
      (_, cargoIndex) => cargoIndex !== index,
    );

    onEditChange(
      "cargos",
      nextCargos.length ? nextCargos : [createEmptyLeadCargo()],
    );
  }

  return (
    <DetailSection icon={<LocalShippingOutlinedIcon />} title={t("common.fields.cargos")}>
      <Stack spacing={2}>
        {isEditing ? (
          <>
            {editCargos.map((cargo, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  backgroundColor: "grey.50",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Typography fontWeight={600}>{t("leads.cargo.itemNumber", { index: index + 1 })}</Typography>

                  {canBeDeleted && (
                    <IconButton
                      size="small"
                      color="error"
                      disabled={editCargos.length === 1}
                      onClick={() => handleRemoveCargo(index)}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 1,
                  }}
                >
                  <TextField
                    label={t("common.fields.cargoName")}
                    value={cargo.name || ""}
                    onChange={(event) =>
                      handleCargoChange(index, "name", event.target.value)
                    }
                    fullWidth
                    size="small"
                  />

                  <Autocomplete
                    options={cargoTypeOptions}
                    value={
                      cargoTypeOptions.find(
                        (option) => option.name === cargo.type,
                      ) || cargoTypeOptions[0]
                    }
                    loading={isCargoTypesLoading}
                    getOptionLabel={(option) => option?.name || ""}
                    isOptionEqualToValue={(option, value) =>
                      String(option?.id || option?.name) ===
                      String(value?.id || value?.name)
                    }
                    onInputChange={(_, value, reason) => {
                      if (reason === "input") {
                        setCargoTypesSearch(value);
                      }
                    }}
                    onChange={(_, option) => {
                      handleCargoChange(
                        index,
                        "type",
                        option?.name || t("common.empty.notSpecifiedM"),
                      );
                    }}
                    renderInput={(params) => {
                      const inputProps = params.InputProps || {};

                      return (
                        <TextField
                          {...params}
                          label={t("common.fields.cargoType")}
                          fullWidth
                          size="small"
                          InputProps={{
                            ...inputProps,
                            endAdornment: (
                              <>
                                {isCargoTypesLoading && (
                                  <CircularProgress color="inherit" size={18} />
                                )}

                                {inputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      );
                    }}
                  />

                  <NumericTextField
                    label={t("common.fields.weightKg")}
                    value={cargo.weight_kg || ""}
                    onChange={(nextValue) =>
                      handleCargoChange(index, "weight_kg", nextValue)
                    }
                    decimals={3}
                    fullWidth
                    size="small"
                  />

                  <NumericTextField
                    label={t("common.fields.cargoPrice")}
                    value={cargo.cargo_price || ""}
                    onChange={(nextValue) =>
                      handleCargoChange(index, "cargo_price", nextValue)
                    }
                    decimals={2}
                    fullWidth
                    size="small"
                  />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(4, 1fr)",
                      },
                      gap: 1,
                      gridColumn: {
                        xs: "auto",
                        sm: "1 / -1",
                      },
                    }}
                  >
                    <NumericTextField
                      label={t("common.fields.lengthCm")}
                      value={cargo.length_cm || ""}
                      onChange={(nextValue) =>
                        handleCargoChange(index, "length_cm", nextValue)
                      }
                      decimals={0}
                      fullWidth
                      size="small"
                    />

                    <NumericTextField
                      label={t("common.fields.widthCm")}
                      value={cargo.width_cm || ""}
                      onChange={(nextValue) =>
                        handleCargoChange(index, "width_cm", nextValue)
                      }
                      decimals={0}
                      fullWidth
                      size="small"
                    />

                    <NumericTextField
                      label={t("common.fields.heightCm")}
                      value={cargo.height_cm || ""}
                      onChange={(nextValue) =>
                        handleCargoChange(index, "height_cm", nextValue)
                      }
                      decimals={0}
                      fullWidth
                      size="small"
                    />

                    <NumericTextField
                      label={t("common.fields.volumeM3")}
                      value={cargo.volume_m3 || ""}
                      onChange={(nextValue) =>
                        handleCargoChange(index, "volume_m3", nextValue)
                      }
                      decimals={3}
                      fullWidth
                      size="small"
                    />
                  </Box>

                  <TextField
                    label={t("common.fields.description")}
                    value={cargo.description || ""}
                    onChange={(event) =>
                      handleCargoChange(
                        index,
                        "description",
                        event.target.value,
                      )
                    }
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                    sx={{
                      gridColumn: {
                        xs: "auto",
                        sm: "1 / -1",
                      },
                    }}
                  />

                  {isInternational && (
                    <Box
                      sx={{
                        gridColumn: {
                          xs: "auto",
                          sm: "1 / -1",
                        },
                      }}
                    >
                      <TnvedCodeAutocomplete
                        value={cargo.tnved}
                        onChange={(nextTnved) =>
                          handleCargoChange(index, "tnved", nextTnved)
                        }
                        label={t("common.fields.tnvedCode")}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            ))}

            <Button
              type="button"
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddCargo}
              sx={{ alignSelf: "flex-start" }}
            >
              {t("leads.cargo.add")}
            </Button>
          </>
        ) : (
          <>
            {leadCargos.length ? (
              leadCargos.map((cargo, index) => (
                <Box
                  key={cargo.id || index}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    backgroundColor: "grey.50",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography fontWeight={600}>{t("leads.cargo.itemNumber", { index: index + 1 })}</Typography>

                    {canDeleteCargo && (
                      <IconButton
                        size="small"
                        color="error"
                        disabled={deletingCargoIndex === index}
                        onClick={() => onDeleteCargo?.(index)}
                      >
                        {deletingCargoIndex === index ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          canBeDeleted && (
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          )
                        )}
                      </IconButton>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(4, 1fr)",
                      },
                      gap: 1,
                    }}
                  >
                    <InfoBadge
                      label={t("common.fields.title")}
                      value={cargo.name || t("common.empty.notSpecifiedN")}
                    />

                    <InfoBadge label={t("common.fields.type")} value={cargo.type || t("common.empty.notSpecifiedN")} />

                    <InfoBadge
                      label={t("common.fields.weight")}
                      value={getCargoWeightDisplay(cargo)}
                    />

                    {!hidePrice && (
                      <InfoBadge
                        label={t("common.fields.cargoPrice")}
                        value={
                          hasValue(cargo.cargo_price)
                            ? `${formatAmount(cargo.cargo_price)} ${lead.currency || ""}`.trim()
                            : t("common.empty.notSpecifiedN")
                        }
                      />
                    )}

                    <InfoBadge
                      label={t("common.fields.dimensions")}
                      value={getCargoDimensionsDisplay(cargo)}
                    />

                    <InfoBadge
                      label={t("common.fields.volume")}
                      value={getCargoVolumeDisplay(cargo)}
                    />

                    {cargo.tnved?.code && (
                      <InfoBadge
                        label={t("common.fields.tnvedCode")}
                        value={
                          cargo.tnved.name
                            ? `${cargo.tnved.code} — ${cargo.tnved.name}`
                            : cargo.tnved.code
                        }
                      />
                    )}
                  </Box>

                  <InfoBadge
                    label={t("common.fields.description")}
                    value={cargo.description || t("common.empty.notSpecifiedN")}
                    fullWidth
                    sx={{ mt: 1 }}
                  />
                </Box>
              ))
            ) : (
              <InfoBadge label={t("common.fields.cargo")} value={t("common.empty.notSpecifiedM")} fullWidth />
            )}
          </>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isEditing
              ? {
                  xs: "1fr",
                  sm: "minmax(0, 1fr) minmax(160px, 220px) minmax(120px, 160px)",
                }
              : {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                },
            gap: 1,
          }}
        >
          {isEditing ? (
            <>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{
                  minWidth: 0,
                  width: "100%",
                }}
              >
                <NumericTextField
                  name="price"
                  label={t("common.fields.executionPrice")}
                  value={editForm.price ?? ""}
                  onChange={(nextValue) => onEditChange("price", nextValue)}
                  decimals={2}
                  disabled={isForwarderCreatedLead}
                  helperText={
                    isForwarderCreatedLead ? t("leads.cargo.priceSetByForwarder") : ""
                  }
                  fullWidth
                  size="small"
                  sx={{
                    minWidth: 0,
                    flex: "1 1 auto",
                  }}
                />

                <CurrencyAutocomplete
                  value={editForm.currency || "KZT"}
                  onChange={(nextCurrency) => {
                    onEditChange("currency", nextCurrency);
                  }}
                  label={t("common.fields.currency")}
                  size="small"
                  disabled={isForwarderCreatedLead}
                  sx={{
                    minWidth: {
                      xs: "100%",
                      sm: 145,
                      md: 155,
                    },
                    flex: {
                      xs: "1 1 auto",
                      sm: "0 0 155px",
                    },
                  }}
                />
              </Stack>

              <TextField
                name="vat"
                label={t("common.fields.vat")}
                value={editForm.vat || t("common.fields.withoutVat")}
                onChange={onEditChange}
                fullWidth
                size="small"
                select
                sx={{ minWidth: 0 }}
              >
                <MenuItem value={t("common.fields.withVat")}>{t("common.fields.withVat")}</MenuItem>
                <MenuItem value={t("common.fields.withoutVat")}>{t("common.fields.withoutVat")}</MenuItem>
              </TextField>

              <NumericTextField
                name="gracePeriodDays"
                label={t("common.fields.gracePeriodDays")}
                value={editForm.gracePeriodDays ?? ""}
                onChange={(nextValue) =>
                  onEditChange("gracePeriodDays", nextValue)
                }
                decimals={0}
                fullWidth
                size="small"
                sx={{ minWidth: 0 }}
              />
            </>
          ) : (
            <>
              {!hidePrice && (
                <InfoBadge
                  label={t("common.fields.executionPrice")}
                  value={
                    hasValue(lead.price)
                      ? `${formatAmount(lead.price)} ${lead.currency}`
                      : t("common.empty.notSpecifiedN")
                  }
                  accent
                />
              )}

              <InfoBadge label={t("common.fields.vat")} value={lead.vat || t("common.empty.notSpecifiedN")} />

              <InfoBadge
                label={t("common.fields.cargoCountLabel")}
                value={leadCargos.length || t("common.empty.notSpecifiedN")}
              />

              <InfoBadge
                label={t("common.fields.gracePeriod")}
                value={
                  hasValue(lead.grace_period_days)
                    ? t("common.units.days", { count: lead.grace_period_days })
                    : t("common.empty.notSpecifiedN")
                }
              />
            </>
          )}
        </Box>
      </Stack>
    </DetailSection>
  );
}

LeadCargoSection.propTypes = {
  lead: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  editForm: PropTypes.object.isRequired,
  onEditChange: PropTypes.func.isRequired,
  onDeleteCargo: PropTypes.func,
  deletingCargoIndex: PropTypes.number,
  hidePrice: PropTypes.bool,
};
