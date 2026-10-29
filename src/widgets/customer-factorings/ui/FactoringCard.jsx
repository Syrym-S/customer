import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from "react-i18next";
import {
    formatDate,
    formatMoney,
    getFactoringLineTypeColor,
    getFactoringLineTypeLabel,
    getFactoringStatusColor,
    getFactoringStatusLabel,
    getVerificationColor,
    getVerificationLabel,
} from '../model/factorings.helpers';
import { paletteKeyToColorPath } from '../../../shared/helpers/status-color.helpers';
import { StatusDot } from '../../../shared/ui/StatusDot';
import { InfoBadge } from './InfoBadge';

export function FactoringCard({ factoring, onOpenDetails }) {
    const { t } = useTranslation();

    return (
        <Box
            onClick={() => onOpenDetails(factoring)}
            role="button"
            tabIndex={0}
            sx={{
                p: {
                    xs: 2,
                    sm: 3,
                },
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: 4,
                backgroundColor: 'background.paper',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                transition: '0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 8px 24px rgba(33, 150, 243, 0.12)',
                },
            }}
        >
            <Stack spacing={2.5}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 2,
                        flexWrap: 'wrap',
                    }}
                >
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.75 }}
                        >
                            {t("common.fields.factor")}
                        </Typography>

                        <Typography
                            sx={{
                                lineHeight: 1.3,
                                fontSize: {
                                    xs: '16px',
                                    sm: '18px',
                                },
                                fontWeight: 600,
                            }}
                        >
                            {factoring.factor?.company_name || '—'}
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.5,
                                fontSize: 13,
                                color: 'text.secondary',
                            }}
                        >
                            {t("common.fields.binValue", { bin: factoring.factor?.bin || '—' })}
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        sx={{
                            flexWrap: 'wrap',
                            justifyContent: {
                                xs: 'flex-start',
                                sm: 'flex-end',
                            },
                        }}
                    >
                        <Chip
                            label={`#${factoring.id ?? factoring.index ?? '—'}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{
                                borderRadius: 999,
                                fontWeight: 600,
                                backgroundColor: 'rgba(33, 150, 243, 0.04)',
                            }}
                        />

                        <StatusDot
                            label={getFactoringStatusLabel(factoring.status)}
                            color={paletteKeyToColorPath(getFactoringStatusColor(factoring.status))}
                        />

                        <StatusDot
                            label={getFactoringLineTypeLabel(factoring.is_line)}
                            color={paletteKeyToColorPath(
                                getFactoringLineTypeColor(factoring.is_line),
                            )}
                        />
                    </Stack>
                </Box>

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
                        label={t("enums.participantType.forwarder")}
                        value={factoring.forwarder?.company_name || '—'}
                    />

                    <InfoBadge
                        label={t("common.fields.forwarderBin")}
                        value={factoring.forwarder?.bin || '—'}
                    />

                    {factoring.forwarder?.fio && (
                        <InfoBadge
                            label={t("common.fields.forwarderFullName")}
                            value={factoring.forwarder.fio}
                        />
                    )}

                    <InfoBadge
                        label={t("factorings.details.createdAt")}
                        value={formatDate(factoring.created_at)}
                    />
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                        },
                        gap: 1,
                    }}
                >
                    <InfoBadge
                        label={t("factorings.finance.debtAmount")}
                        value={formatMoney(
                            factoring.deb_summ,
                            factoring.deb_currency,
                        )}
                        accent
                    />

                    <InfoBadge
                        label={t("factorings.finance.creditAmount")}
                        value={formatMoney(
                            factoring.cred_summ,
                            factoring.currency,
                        )}
                        accent
                    />

                    <InfoBadge
                        label={t("common.fields.gracePeriod")}
                        value={
                            factoring.grace_period_days
                                ? t("common.units.days", { count: factoring.grace_period_days })
                                : t("common.empty.notSpecifiedN")
                        }
                    />
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: {
                            xs: 'flex-start',
                            sm: 'center',
                        },
                        gap: 2,
                        flexDirection: {
                            xs: 'column',
                            sm: 'row',
                        },
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        sx={{
                            flexWrap: 'wrap',
                        }}
                    >
                        <StatusDot
                            label={t('factorings.confirmations.youStatus', {
                                status: getVerificationLabel(
                                    factoring.verified_customer,
                                ),
                            })}
                            color={paletteKeyToColorPath(
                                getVerificationColor(
                                    factoring.verified_customer,
                                ),
                            )}
                        />

                        <StatusDot
                            label={t('factorings.confirmations.forwarderStatus', {
                                status: getVerificationLabel(
                                    factoring.verified_forwarder,
                                ),
                            })}
                            color={paletteKeyToColorPath(
                                getVerificationColor(
                                    factoring.verified_forwarder,
                                ),
                            )}
                        />

                        <StatusDot
                            label={t('factorings.confirmations.factorStatus', {
                                status: getVerificationLabel(
                                    factoring.verified_factor,
                                ),
                            })}
                            color={paletteKeyToColorPath(
                                getVerificationColor(
                                    factoring.verified_factor,
                                ),
                            )}
                        />
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
}
