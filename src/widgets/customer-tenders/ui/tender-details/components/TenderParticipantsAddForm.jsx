import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useTranslation } from "react-i18next";

export function TenderParticipantsAddForm({
    inputValue,
    selectedForwarders,
    forwarderOptions,
    isForwardersLoaded,
    isForwardersLoading,
    searchError,
    isActionLoading,
    onInputChange,
    onSelectedForwardersChange,
    onSubmit,
    onCancel,
}) {
    const { t } = useTranslation();

    return (
        <Stack spacing={1}>
            {searchError && <Alert severity="error">{searchError}</Alert>}

            <Autocomplete
                multiple
                value={selectedForwarders}
                inputValue={inputValue}
                options={forwarderOptions}
                loading={isForwardersLoading}
                filterOptions={(items) => items}
                getOptionLabel={(option) =>
                    option?.fullName || option?.companyName || option?.id || ''
                }
                isOptionEqualToValue={(option, value) =>
                    option?.id === value?.id
                }
                filterSelectedOptions
                noOptionsText={
                    isForwardersLoaded
                        ? t("common.forwarderPicker.notFound")
                        : t("common.forwarderPicker.loading")
                }
                loadingText={t("tenders.participants.searching")}
                onInputChange={(_, newInputValue, reason) => {
                    if (reason === 'reset') {
                        return;
                    }

                    onInputChange(newInputValue);
                }}
                onChange={(_, nextValue) => {
                    onSelectedForwardersChange(nextValue);
                    onInputChange('');
                }}
                renderValue={(tagValue, getItemProps) =>
                    tagValue.map((option, index) => {
                        const { key, ...itemProps } = getItemProps({ index });

                        return (
                            <Chip
                                key={key}
                                label={
                                    option.fullName ||
                                    option.companyName ||
                                    option.id
                                }
                                {...itemProps}
                                size="small"
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
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                                py: 1.2,
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography fontWeight={700}>
                                    {option.fullName || t("common.empty.fullNameNotSpecified")}
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    sx={{ fontSize: 12 }}
                                >
                                    {option.phone ||
                                        option.iin ||
                                        t("common.empty.contactsNotSpecified")}
                                </Typography>
                            </Box>

                            {option.companyName && (
                                <Chip
                                    size="small"
                                    label={option.companyName}
                                    sx={{
                                        height: 22,
                                        fontSize: '0.7rem',
                                        fontWeight: 500,
                                    }}
                                />
                            )}
                        </Box>
                    );
                }}
                renderInput={(params) => {
                    const inputProps = params.InputProps ?? {};

                    return (
                        <TextField
                            {...params}
                            label={t("forwarders.title")}
                            placeholder={t("common.forwarderPicker.searchHint")}
                            size="small"
                            fullWidth
                            InputProps={{
                                ...inputProps,
                                endAdornment: (
                                    <>
                                        {isForwardersLoading && (
                                            <CircularProgress
                                                color="inherit"
                                                size={18}
                                            />
                                        )}

                                        {inputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    );
                }}
            />

            <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={
                        isActionLoading || selectedForwarders.length === 0
                    }
                >
                    {t("common.actions.add")}
                </Button>

                <Button onClick={onCancel} disabled={isActionLoading}>
                    {t("common.actions.cancel")}
                </Button>
            </Stack>
        </Stack>
    );
}
