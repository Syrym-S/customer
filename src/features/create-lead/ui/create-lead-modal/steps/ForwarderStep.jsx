import { useCallback, useEffect, useMemo, useState } from 'react';
import i18n from '../../../../../shared/i18n';
import { useTranslation } from "react-i18next";
import { Controller, useWatch } from 'react-hook-form';
import PropTypes from 'prop-types';
import {
    Autocomplete,
    Box,
    Chip,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { InfoBadge } from '../components/InfoBadge';
import { StepSection } from '../components/StepSection';
import {
    fetchForwarderById,
    fetchForwardersApi,
} from '../../../api/forwarders.api';
import { FORWARDERS_PER_PAGE } from '../../../../../widgets/customer-forwarders/model/forwarders.helpers';

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
            i18n.t("common.empty.noName"),

        iin: forwarder.iin || forwarder.personIin || '',

        companyName:
            forwarder.companyName ||
            forwarder.company_name ||
            forwarder.name ||
            i18n.t("common.empty.noCompany"),

        companyBin:
            forwarder.companyBin ||
            forwarder.company_bin ||
            forwarder.bin ||
            '',

        phone: forwarder.phone || forwarder.tel || '',

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
        .join(' ')
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

export function ForwarderStep({ control, errors, setValue }) {
    const { t } = useTranslation();

    const selectedForwarderId = useWatch({
        control,
        name: 'forwarderId',
    });

    const [inputValue, setInputValue] = useState('');
    const [allForwarders, setAllForwarders] = useState([]);
    const [isForwardersLoaded, setIsForwardersLoaded] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedForwarder, setSelectedForwarder] = useState(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const loadForwarders = useCallback(async () => {
        if (isForwardersLoaded || isLoading) {
            return;
        }

        try {
            setIsLoading(true);
            setSearchError(null);

            const response = await fetchForwardersApi({
                page: 1,
                perPage: FORWARDERS_PER_PAGE,
            });

            setAllForwarders(normalizeForwardersOptions(response));
            setIsForwardersLoaded(true);
        } catch (error) {
            setSearchError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    t("common.forwarderPicker.loadFailed"),
            );

            setAllForwarders([]);
        } finally {
            setIsLoading(false);
        }
    }, [isForwardersLoaded, isLoading, t]);

    useEffect(() => {
        if (!selectedForwarderId) {
            setSelectedOption(null);
            setSelectedForwarder(null);
        }
    }, [selectedForwarderId]);

    const options = useMemo(() => {
        const filteredForwarders = filterForwardersLocally(
            allForwarders,
            inputValue,
        );

        if (
            selectedOption &&
            !filteredForwarders.some(
                (forwarder) => forwarder.id === selectedOption.id,
            )
        ) {
            return [selectedOption, ...filteredForwarders];
        }

        return filteredForwarders;
    }, [allForwarders, inputValue, selectedOption]);

    return (
        <StepSection
            title={t("createLead.steps.forwarder")}
            description={t("createLead.forwarder.hint")}
        >
            <Controller
                name="forwarderId"
                control={control}
                render={({ field }) => (
                    <Stack spacing={2}>
                        <Autocomplete
                            multiple
                            value={selectedOption ? [selectedOption] : []}
                            inputValue={inputValue}
                            options={options}
                            loading={isLoading || isDetailsLoading}
                            filterOptions={(items) => items}
                            getOptionLabel={(option) =>
                                option?.fullName ||
                                option?.fio ||
                                option?.name ||
                                ''
                            }
                            isOptionEqualToValue={(option, value) =>
                                option?.id === value?.id
                            }
                            onOpen={loadForwarders}
                            noOptionsText={
                                isForwardersLoaded
                                    ? t("common.forwarderPicker.notFound")
                                    : t("common.forwarderPicker.clickToLoad")
                            }
                            loadingText={t("common.forwarderPicker.loading")}
                            filterSelectedOptions
                            onInputChange={(_, newInputValue, reason) => {
                                if (reason === 'reset') {
                                    return;
                                }

                                setInputValue(newInputValue);
                            }}
                            onChange={async (_, newValue) => {
                                const lastSelectedForwarder =
                                    newValue.at(-1) ?? null;

                                if (!lastSelectedForwarder?.id) {
                                    setSelectedOption(null);
                                    setSelectedForwarder(null);
                                    field.onChange('');

                                    setValue('forwarder', null, {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                        shouldValidate: false,
                                    });

                                    setInputValue('');
                                    return;
                                }

                                setSelectedOption(lastSelectedForwarder);
                                setSelectedForwarder(null);
                                field.onChange(lastSelectedForwarder.id);
                                setInputValue('');
                                setSearchError(null);

                                setValue('forwarder', null, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                    shouldValidate: false,
                                });

                                try {
                                    setIsDetailsLoading(true);

                                    const response = await fetchForwarderById(
                                        lastSelectedForwarder.id,
                                    );
                                    const details = response?.data || response;

                                    const detailedForwarder = {
                                        id:
                                            details.id ||
                                            lastSelectedForwarder.id,

                                        fullName:
                                            details.fio ||
                                            details.fullName ||
                                            lastSelectedForwarder.fullName ||
                                            '',

                                        iin:
                                            details.iin ||
                                            details.personIin ||
                                            lastSelectedForwarder.iin ||
                                            '',

                                        companyName:
                                            details.company_name ||
                                            details.companyName ||
                                            details.name ||
                                            lastSelectedForwarder.companyName ||
                                            '',

                                        companyBin:
                                            details.company_bin ||
                                            details.companyBin ||
                                            details.bin ||
                                            lastSelectedForwarder.companyBin ||
                                            '',

                                        phone:
                                            details.phone ||
                                            details.tel ||
                                            lastSelectedForwarder.phone ||
                                            '',

                                        email: details.email || '',

                                        companyAccount:
                                            details.company_account || '',
                                        companyBik: details.company_bik || '',
                                        companyAddress:
                                            details.company_address || '',
                                    };

                                    setSelectedOption(detailedForwarder);
                                    setSelectedForwarder(detailedForwarder);

                                    setValue('forwarder', detailedForwarder, {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                        shouldValidate: false,
                                    });
                                } catch (error) {
                                    console.error(
                                        'Не удалось загрузить детали экспедитора:',
                                        error,
                                    );

                                    setSelectedOption(null);
                                    setSelectedForwarder(null);
                                    field.onChange('');

                                    setValue('forwarder', null, {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                        shouldValidate: false,
                                    });

                                    setSearchError(
                                        t("common.forwarderPicker.detailsLoadFailed"),
                                    );
                                } finally {
                                    setIsDetailsLoading(false);
                                }
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
                                                option.fullName ||
                                                option.fio ||
                                                option.name ||
                                                t("common.empty.noName")
                                            }
                                            {...itemProps}
                                            sx={{
                                                maxWidth: '100%',
                                                height: 28,
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                bgcolor: 'primary.main',
                                                color: 'primary.contrastText',
                                                borderRadius: '10px',

                                                '& .MuiChip-deleteIcon': {
                                                    color: 'primary.contrastText',
                                                    opacity: 0.85,
                                                    fontSize: 18,
                                                },

                                                '& .MuiChip-deleteIcon:hover': {
                                                    color: 'primary.contrastText',
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
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 2,
                                            py: 1.2,
                                        }}
                                    >
                                        <Typography fontWeight={700}>
                                            {option.fullName ||
                                                option.fio ||
                                                option.name ||
                                                t("common.empty.noName")}
                                        </Typography>

                                        <Chip
                                            size="small"
                                            label={
                                                option.companyName ||
                                                option.name ||
                                                t("common.empty.noCompany")
                                            }
                                            sx={{
                                                height: 22,
                                                fontSize: '0.7rem',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </Box>
                                );
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={t("common.fields.forwarder")}
                                    placeholder={
                                        selectedForwarder
                                            ? ''
                                            : t("common.forwarderPicker.searchHint")
                                    }
                                    onFocus={loadForwarders}
                                    error={
                                        Boolean(errors.forwarderId) ||
                                        Boolean(searchError)
                                    }
                                    helperText={
                                        errors.forwarderId?.message ||
                                        searchError ||
                                        t("createLead.forwarder.skippable")
                                    }
                                />
                            )}
                        />

                        {isDetailsLoading && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: 'action.hover',
                                }}
                            >
                                <CircularProgress size={18} />
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t("createLead.forwarder.loadingDetails")}
                                </Typography>
                            </Box>
                        )}

                        {selectedForwarder && !isDetailsLoading && (
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                                    },
                                    gap: 1.5,
                                }}
                            >
                                <InfoBadge
                                    label={t("common.fields.forwarderFullName")}
                                    value={selectedForwarder.fullName}
                                />
                                <InfoBadge
                                    label={t("common.fields.forwarderIin")}
                                    value={selectedForwarder.iin}
                                />
                                <InfoBadge
                                    label={t("common.fields.company")}
                                    value={selectedForwarder.companyName}
                                />
                                <InfoBadge
                                    label={t("common.fields.companyBin")}
                                    value={selectedForwarder.companyBin}
                                />
                                <InfoBadge
                                    label={t("common.fields.phone")}
                                    value={selectedForwarder.phone}
                                />
                                <InfoBadge
                                    label="Email"
                                    value={selectedForwarder.email}
                                />
                            </Box>
                        )}
                    </Stack>
                )}
            />
        </StepSection>
    );
}

ForwarderStep.propTypes = {
    setValue: PropTypes.func.isRequired,
    control: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
};
