import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import { useTendersContext } from "../model/useTendersContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { searchTenderLeadsApi } from "../api/tender.api";
import { formatDateToTenderApiDateTime } from "../model/tender.helpers";
import { fetchForwardersApi } from "../../../features/create-lead/api/forwarders.api";
import { FORWARDERS_PER_PAGE } from "../../customer-forwarders/model/forwarders.helpers";
import { TenderLeadOption } from "./TenderLeadOption";
import { formatAmount } from "../../../shared/helpers/currency-format.helpers";

// A tender must be published at least this far in the future — gives a
// safety buffer against the few seconds between picking "now" and actually
// hitting submit, which previously could trip the backend's "must be in the
// present or future" (Almaty-time) validation on a near-miss.
const PUBLICATION_LEAD_TIME_MS = 5 * 60 * 1000;

// "Дата окончания" must be at least this far after "Дата публикации".
const MIN_GAP_AFTER_PUBLICATION_MS = 30 * 60 * 1000;

// NOTE on timezones: everything below compares and offsets plain JS Date
// instants (ms since epoch), which is timezone-independent by
// construction — "5 minutes from now" or "is this before that" doesn't
// depend on which zone you're framing it in, only actual duration math
// does. The one place a timezone actually matters is turning an instant
// into the "YYYY-MM-DD HH:mm:ss" string the backend expects, which is
// Asia/Almaty wall-clock time — that conversion already happens in
// formatDateTimeForTenderApi below (via formatDateToTenderApiDateTime) and
// is untouched here.

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function formatDateTimeLocalValue(date) {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  const hours = padDatePart(date.getHours());
  const minutes = padDatePart(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultTenderEndDateTime(notBeforeDate) {
  const date = new Date();

  date.setHours(date.getHours() + 1);

  if (
    date.getMinutes() > 0 ||
    date.getSeconds() > 0 ||
    date.getMilliseconds() > 0
  ) {
    date.setHours(date.getHours() + 1);
  }

  date.setMinutes(0, 0, 0);

  const minEndDate = new Date(
    notBeforeDate.getTime() + MIN_GAP_AFTER_PUBLICATION_MS,
  );

  return formatDateTimeLocalValue(date < minEndDate ? minEndDate : date);
}

function createInitialForm() {
  const publicationDate = new Date(Date.now() + PUBLICATION_LEAD_TIME_MS);

  return {
    publicationDateTime: formatDateTimeLocalValue(publicationDate),
    endDateTime: getDefaultTenderEndDateTime(publicationDate),
    isPublic: true,
    maxParticipants: 0,
    startAfterCreate: false,
  };
}

// A datetime-local input's value (e.g. "2026-09-08T19:00") has no timezone
// designator, so `new Date(value)` correctly parses it as the user's local
// time, giving us the correct absolute instant. From there,
// formatDateToTenderApiDateTime (tender.helpers.js) re-expresses that same
// instant as Asia/Almaty wall-clock time — NOT UTC — since that's what the
// backend actually validates against (see the comment there for why).
function formatDateTimeForTenderApi(value) {
  if (!value) {
    return "";
  }

  return formatDateToTenderApiDateTime(new Date(value));
}

function formatMoney(value) {
  const formattedAmount = formatAmount(value);

  if (!formattedAmount) {
    return "Цена не указана";
  }

  return `${formattedAmount} KZT`;
}

function getLeadOptionLabel(option) {
  return option?.label || option?.title || option?.id || "";
}

function normalizeForwarderOption(forwarder) {
  if (!forwarder) {
    return null;
  }

  return {
    id: forwarder.id,

    fullName:
      forwarder.fullName ||
      forwarder.full_name ||
      forwarder.fio ||
      forwarder.name ||
      "Без имени",

    iin: forwarder.iin || forwarder.personIin || "",

    companyName:
      forwarder.companyName ||
      forwarder.company_name ||
      forwarder.name ||
      "Без компании",

    companyBin:
      forwarder.companyBin || forwarder.company_bin || forwarder.bin || "",

    phone: forwarder.phone || forwarder.tel || "",

    raw: forwarder.raw || forwarder,
  };
}

function getForwardersFromResponse(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data?.results)) {
    return data.data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function normalizeForwardersOptions(response) {
  return getForwardersFromResponse(response)
    .map(normalizeForwarderOption)
    .filter((forwarder) => forwarder?.id);
}

function getForwarderSearchText(forwarder) {
  return [
    forwarder.fullName,
    forwarder.companyName,
    forwarder.companyBin,
    forwarder.iin,
    forwarder.phone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterForwardersLocally(forwarders, query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return forwarders;
  }

  return forwarders.filter((forwarder) =>
    getForwarderSearchText(forwarder).includes(normalizedQuery),
  );
}

export function CreateTenderModal({ open, onClose }) {
  const { createTender, addParticipant, reloadTenders, startTender } =
    useTendersContext();

  const [form, setForm] = useState(() => createInitialForm());

  const [leadInputValue, setLeadInputValue] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [pendingLead, setPendingLead] = useState(null);
  const [isLeadConfirmOpen, setIsLeadConfirmOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [isLeadsLoading, setIsLeadsLoading] = useState(false);
  const [leadsSearchError, setLeadsSearchError] = useState("");

  const [selectedForwarders, setSelectedForwarders] = useState([]);
  const [forwarderInputValue, setForwarderInputValue] = useState("");
  const [allForwarders, setAllForwarders] = useState([]);
  const [isForwardersLoaded, setIsForwardersLoaded] = useState(false);
  const [isForwardersLoading, setIsForwardersLoading] = useState(false);
  const [forwardersSearchError, setForwardersSearchError] = useState("");

  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const leadOptions = useMemo(() => {
    if (selectedLead && !leads.some((lead) => lead.id === selectedLead.id)) {
      return [selectedLead, ...leads];
    }

    return leads;
  }, [leads, selectedLead]);

  const loadForwarders = useCallback(async () => {
    if (form.isPublic || isForwardersLoaded || isForwardersLoading) {
      return;
    }

    try {
      setIsForwardersLoading(true);
      setForwardersSearchError("");

      const response = await fetchForwardersApi({
        page: 1,
        perPage: FORWARDERS_PER_PAGE,
      });

      setAllForwarders(normalizeForwardersOptions(response));
      setIsForwardersLoaded(true);
    } catch (error) {
      setForwardersSearchError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Не удалось загрузить экспедиторов",
      );

      setAllForwarders([]);
    } finally {
      setIsForwardersLoading(false);
    }
  }, [form.isPublic, isForwardersLoaded, isForwardersLoading]);

  function handleRequestLeadChange(_, newValue, reason) {
    if (reason === "clear" || !newValue) {
      setPendingLead(null);
      setIsLeadConfirmOpen(false);
      setSelectedLead(null);
      setLeadInputValue("");
      return;
    }

    if (newValue?.id === selectedLead?.id) {
      setLeadInputValue(getLeadOptionLabel(newValue));
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setPendingLead(newValue);
    setLeadInputValue(getLeadOptionLabel(newValue));
    setIsLeadConfirmOpen(true);
  }

  function handleCloseLeadConfirm() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setPendingLead(null);
    setIsLeadConfirmOpen(false);

    setLeadInputValue(selectedLead ? getLeadOptionLabel(selectedLead) : "");
  }

  function handleConfirmLeadSelection() {
    if (!pendingLead) {
      return;
    }

    setSelectedLead(pendingLead);
    setLeadInputValue(getLeadOptionLabel(pendingLead));
    setPendingLead(null);
    setIsLeadConfirmOpen(false);
  }

  const forwarderOptions = useMemo(() => {
    const normalizedSelectedForwarders = selectedForwarders
      .map(normalizeForwarderOption)
      .filter(Boolean);

    const selectedIds = new Set(
      normalizedSelectedForwarders.map((forwarder) => forwarder.id),
    );

    const filteredForwarders = filterForwardersLocally(
      allForwarders,
      forwarderInputValue,
    );

    const uniqueForwarders = filteredForwarders.filter(
      (forwarder) => !selectedIds.has(forwarder.id),
    );

    return [...normalizedSelectedForwarders, ...uniqueForwarders];
  }, [allForwarders, forwarderInputValue, selectedForwarders]);

  function handleFieldChange(field, value) {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  }

  function validateForm() {
    if (!selectedLead?.id) {
      return "Выберите лид";
    }

    if (!form.publicationDateTime) {
      return "Укажите дату публикации";
    }

    const publicationDate = new Date(form.publicationDateTime);
    const now = new Date();

    if (Number.isNaN(publicationDate.getTime())) {
      return "Некорректная дата публикации";
    }

    if (publicationDate < now) {
      return "Дата публикации не может быть в прошлом";
    }

    if (!form.endDateTime) {
      return "Укажите дату окончания";
    }

    const endDate = new Date(form.endDateTime);

    if (Number.isNaN(endDate.getTime())) {
      return "Некорректная дата окончания";
    }

    if (endDate <= now) {
      return "Дата окончания должна быть позже текущего времени";
    }

    if (
      endDate.getTime() - publicationDate.getTime() <
      MIN_GAP_AFTER_PUBLICATION_MS
    ) {
      return "Дата окончания должна быть минимум через 30 минут после даты публикации";
    }

    if (form.isPublic) {
      const maxParticipants = Number(form.maxParticipants);

      if (Number.isNaN(maxParticipants) || maxParticipants < 0) {
        return "Максимальное количество участников не может быть меньше 0";
      }
    }

    if (!form.isPublic && selectedForwarders.length === 0) {
      return "Выберите хотя бы одного экспедитора для приватного аукциона";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const isPublicTender = form.isPublic;

      const payload = {
        lead_id: selectedLead.id,
        public_date_time: formatDateTimeForTenderApi(
          form.publicationDateTime,
        ),
        end_date_time: formatDateTimeForTenderApi(form.endDateTime),
        type: "forwarder",
        publication_type: isPublicTender ? "public" : "private",
        max_participants: isPublicTender
          ? Number(form.maxParticipants) || 0
          : 0,
      };

      const createdTender = await createTender(payload);

      if (!isPublicTender) {
        await Promise.all(
          selectedForwarders.map((forwarder) =>
            addParticipant(createdTender.id, forwarder.id),
          ),
        );
      }

      if (form.startAfterCreate) {
        await startTender(createdTender.id);
      } else {
        await reloadTenders();
      }
      setForm(() => createInitialForm());
      setSelectedLead(null);
      onClose();
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Не удалось создать аукцион",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    const query = leadInputValue.trim();

    if (selectedLead && query === getLeadOptionLabel(selectedLead)) {
      setLeads([]);
      setLeadsSearchError("");
      return;
    }

    if (query.length < 2) {
      setLeads([]);
      setLeadsSearchError("");
      return;
    }

    let isCancelled = false;

    const timeoutId = setTimeout(async () => {
      try {
        setIsLeadsLoading(true);
        setLeadsSearchError("");

        const response = await searchTenderLeadsApi({
          q: query,
          page: 1,
          perPage: 10,
        });

        if (!isCancelled) {
          setLeads(response.results);
        }
      } catch (error) {
        if (!isCancelled) {
          setLeads([]);
          setLeadsSearchError(
            error.response?.data?.message ||
              error.message ||
              "Не удалось найти лиды",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLeadsLoading(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [leadInputValue, selectedLead]);

  useEffect(() => {
    if (!form.isPublic) {
      return;
    }

    setSelectedForwarders([]);
    setForwarderInputValue("");
    setForwardersSearchError("");
  }, [form.isPublic]);

  // Private tenders auto-activate on the server once a participant is added
  // (they require at least one), so "start" (only valid from `new`) would
  // fail with a 400 right after creation. Hide + reset this field for
  // private tenders so the submit flow never attempts that start call.
  useEffect(() => {
    if (form.isPublic) {
      return;
    }

    setForm((prevForm) =>
      prevForm.startAfterCreate
        ? { ...prevForm, startAfterCreate: false }
        : prevForm,
    );
  }, [form.isPublic]);

  const nowLocalValue = formatDateTimeLocalValue(new Date());

  // "Дата окончания" can never be in the past, and never less than 30
  // minutes after whatever "Дата публикации" currently holds — recomputed
  // on every render, so it always reflects the live publication value.
  const publicationDateValue = form.publicationDateTime
    ? new Date(form.publicationDateTime)
    : null;

  const endDateTimeMinDate =
    publicationDateValue && !Number.isNaN(publicationDateValue.getTime())
      ? new Date(
          Math.max(
            Date.now(),
            publicationDateValue.getTime() + MIN_GAP_AFTER_PUBLICATION_MS,
          ),
        )
      : new Date();

  const endDateTimeMin = formatDateTimeLocalValue(endDateTimeMinDate);

  // If the user pushes "Дата публикации" forward after already picking an
  // end date, the previously-valid end date can fall below the new
  // minimum — auto-advance it instead of leaving the picker's own min
  // constraint silently disagreeing with its selected value.
  useEffect(() => {
    setForm((prevForm) => {
      if (!prevForm.endDateTime) {
        return prevForm;
      }

      const currentEndDate = new Date(prevForm.endDateTime);

      if (
        Number.isNaN(currentEndDate.getTime()) ||
        currentEndDate.getTime() >= endDateTimeMinDate.getTime()
      ) {
        return prevForm;
      }

      return {
        ...prevForm,
        endDateTime: formatDateTimeLocalValue(endDateTimeMinDate),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.publicationDateTime]);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Создание аукциона</DialogTitle>

        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
            <Stack spacing={2.5}>
              {submitError && <Alert severity="error">{submitError}</Alert>}

              <Autocomplete
                value={selectedLead}
                inputValue={leadInputValue}
                options={leadOptions}
                loading={isLeadsLoading}
                filterOptions={(items) => items}
                getOptionLabel={getLeadOptionLabel}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                noOptionsText={
                  leadInputValue.trim().length < 2
                    ? "Введите минимум 2 символа"
                    : "Лиды не найдены"
                }
                loadingText="Поиск лидов..."
                onInputChange={(_, newInputValue, reason) => {
                  if (reason === "reset") {
                    setLeadInputValue(newInputValue);
                    return;
                  }

                  if (reason === "clear") {
                    setSelectedLead(null);
                    setLeadInputValue("");
                    setPendingLead(null);
                    setIsLeadConfirmOpen(false);
                    return;
                  }

                  setLeadInputValue(newInputValue);

                  if (
                    selectedLead &&
                    newInputValue !== getLeadOptionLabel(selectedLead)
                  ) {
                    setSelectedLead(null);
                  }
                }}
                onChange={handleRequestLeadChange}
                renderOption={(optionProps, option) => {
                  const { key, ...listItemProps } = optionProps;

                  return (
                    <Box
                      key={key}
                      component="li"
                      {...listItemProps}
                      sx={{
                        py: 1.25,
                        "&:not(:last-of-type)": {
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        },
                      }}
                    >
                      <TenderLeadOption option={option} />
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Лид"
                    placeholder="Введите город, груз или направление"
                    error={Boolean(leadsSearchError)}
                    helperText={
                      leadsSearchError ||
                      "Выберите лид, для которого создаётся аукцион"
                    }
                  />
                )}
              />

              <TextField
                label="Дата публикации"
                type="datetime-local"
                value={form.publicationDateTime}
                onChange={(event) =>
                  handleFieldChange(
                    "publicationDateTime",
                    event.target.value,
                  )
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                  htmlInput: {
                    min: nowLocalValue,
                  },
                }}
                fullWidth
              />

              <TextField
                label="Дата окончания"
                type="datetime-local"
                value={form.endDateTime}
                onChange={(event) =>
                  handleFieldChange("endDateTime", event.target.value)
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                  htmlInput: {
                    min: endDateTimeMin,
                  },
                }}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isPublic}
                    onChange={(event) => {
                      const isPublic = event.target.checked;

                      handleFieldChange("isPublic", isPublic);

                      if (isPublic) {
                        setSelectedForwarders([]);
                        setForwarderInputValue("");
                        setForwardersSearchError("");
                      }
                    }}
                  />
                }
                label="Публичный аукцион"
              />

              {form.isPublic && (
                <TextField
                  label="Максимум участников"
                  type="number"
                  value={form.maxParticipants}
                  onChange={(event) =>
                    handleFieldChange("maxParticipants", event.target.value)
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0,
                    },
                  }}
                  fullWidth
                />
              )}

              {form.isPublic && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(form.startAfterCreate)}
                      onChange={(event) =>
                        handleFieldChange(
                          "startAfterCreate",
                          event.target.checked,
                        )
                      }
                    />
                  }
                  label="Запустить аукцион после создания"
                />
              )}

              {!form.isPublic && (
                <Autocomplete
                  multiple
                  value={selectedForwarders}
                  inputValue={forwarderInputValue}
                  options={forwarderOptions}
                  loading={isForwardersLoading}
                  filterOptions={(items) => items}
                  getOptionLabel={(option) =>
                    option?.fullName ||
                    option?.companyName ||
                    option?.fio ||
                    option?.name ||
                    ""
                  }
                  isOptionEqualToValue={(option, value) =>
                    option?.id === value?.id
                  }
                  filterSelectedOptions
                  onOpen={loadForwarders}
                  noOptionsText={
                    isForwardersLoaded
                      ? "Экспедитор не найден"
                      : "Нажмите, чтобы загрузить экспедиторов"
                  }
                  loadingText="Загружаем экспедиторов..."
                  onInputChange={(_, newInputValue, reason) => {
                    if (reason === "reset") {
                      return;
                    }

                    setForwarderInputValue(newInputValue);
                  }}
                  onChange={(_, newValue) => {
                    setSelectedForwarders(
                      newValue.map(normalizeForwarderOption).filter(Boolean),
                    );
                    setForwarderInputValue("");
                  }}
                  renderValue={(tagValue, getItemProps) =>
                    tagValue.map((option, index) => {
                      const { key, ...itemProps } = getItemProps({
                        index,
                      });

                      return (
                        <Chip
                          key={key}
                          label={
                            option.fullName || option.companyName || option.id
                          }
                          {...itemProps}
                          sx={{
                            maxWidth: "100%",
                            height: 28,
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            borderRadius: "10px",

                            "& .MuiChip-deleteIcon": {
                              color: "primary.contrastText",
                              opacity: 0.85,
                              fontSize: 18,
                            },

                            "& .MuiChip-deleteIcon:hover": {
                              color: "primary.contrastText",
                              opacity: 1,
                            },
                          }}
                        />
                      );
                    })
                  }
                  renderOption={(optionProps, option) => {
                    const { key, ...listItemProps } = optionProps;

                    return (
                      <Box
                        key={key}
                        component="li"
                        {...listItemProps}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          py: 1.2,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={700}>
                            {option.fullName || "ФИО не указано"}
                          </Typography>

                          <Typography
                            color="text.secondary"
                            sx={{ fontSize: 12 }}
                          >
                            {option.phone ||
                              option.iin ||
                              option.companyBin ||
                              "Контакты не указаны"}
                          </Typography>
                        </Box>

                        {option.companyName && (
                          <Chip
                            size="small"
                            label={option.companyName}
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Экспедиторы"
                      placeholder={
                        selectedForwarders.length > 0
                          ? ""
                          : "Введите ФИО, ИИН, компанию, БИН или телефон"
                      }
                      onFocus={loadForwarders}
                      error={Boolean(forwardersSearchError)}
                      helperText={
                        forwardersSearchError ||
                        "Выберите экспедиторов, которые будут приглашены в приватный аукцион"
                      }
                    />
                  )}
                />
              )}
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Создаём..." : "Создать аукцион"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isLeadConfirmOpen} onClose={handleCloseLeadConfirm}>
        <DialogTitle>Выбор лида</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите создать аукцион по этому лиду?
          </DialogContentText>

          {pendingLead && (
            <Box sx={{ mt: 2 }}>
              <Typography fontWeight={700}>
                {pendingLead.title ||
                  pendingLead.label ||
                  `Лид #${pendingLead.id}`}
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Груз: {pendingLead.cargo || "Не указан"}
              </Typography>

              {pendingLead.forwarder && (
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Экспедитор: {pendingLead.forwarder}
                </Typography>
              )}

              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Цена: {formatMoney(pendingLead.price)}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseLeadConfirm}>Отмена</Button>

          <Button variant="contained" onClick={handleConfirmLeadSelection}>
            Выбрать лид
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

CreateTenderModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
