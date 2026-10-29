import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from "react-i18next";
import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';

import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import {
    getCustomerName,
    getForwarderName,
} from '../../../model/factorings.helpers';

export function FactoringParticipantsSection({
    factoring,
    customerProfile,
    isCustomerProfileLoading,
    customerProfileLoadFailed,
}) {
    const { t } = useTranslation();

    return (
        <DetailSection
            icon={<BusinessOutlinedIcon />}
            title={t("common.fields.participants")}
            subtitle={t("factorings.participants.subtitle")}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(2, 1fr)',
                        lg: 'repeat(3, 1fr)',
                    },
                    gap: 1,
                }}
            >
                <Box
                    sx={{
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: 'grey.50',
                    }}
                >
                    <Typography fontWeight={700} sx={{ mb: 1 }}>
                        {t("common.fields.factor")}
                    </Typography>

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
                            label={t("common.fields.company")}
                            value={factoring.factor?.company_name || '—'}
                        />

                        <InfoBadge
                            label={t("common.fields.bin")}
                            value={factoring.factor?.bin || '—'}
                        />

                        <InfoBadge
                            label={t("common.fields.fullName")}
                            value={factoring.factor?.fio || '—'}
                        />

                        <InfoBadge
                            label={t("common.fields.phone")}
                            value={factoring.factor?.phone || '—'}
                        />
                    </Box>
                </Box>

                <Box
                    sx={{
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: 'grey.50',
                    }}
                >
                    <Typography fontWeight={700} sx={{ mb: 1 }}>
                        {t("enums.participantType.forwarder")}
                    </Typography>

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
                            label={t("common.fields.company")}
                            value={factoring.forwarder?.company_name || '—'}
                        />

                        <InfoBadge
                            label={t("common.fields.bin")}
                            value={factoring.forwarder?.bin || '—'}
                        />

                        <InfoBadge
                            label={t("common.fields.fullName")}
                            value={factoring.forwarder?.fio || '—'}
                        />

                        <InfoBadge
                            label={t("common.fields.phone")}
                            value={factoring.forwarder?.phone || '—'}
                        />
                    </Box>
                </Box>

                <Box
                    sx={{
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: 'grey.50',
                    }}
                >
                    <Typography fontWeight={700} sx={{ mb: 1 }}>
                        {t("common.fields.customer")}
                    </Typography>

                    {isCustomerProfileLoading ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                py: 2,
                            }}
                        >
                            <CircularProgress size={20} />
                        </Box>
                    ) : customerProfileLoadFailed ? (
                        <Typography fontSize={13} color='text.secondary'>
                            {t("factorings.participants.customerLoadFailed")}
                        </Typography>
                    ) : (
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
                                label={t("common.fields.company")}
                                value={customerProfile?.fullName || '—'}
                            />

                            <InfoBadge
                                label={t("common.fields.bin")}
                                value={customerProfile?.bin || '—'}
                            />

                            <InfoBadge
                                label={t("common.fields.fullName")}
                                value={customerProfile?.personFio || '—'}
                            />

                            <InfoBadge
                                label={t("common.fields.phone")}
                                value={customerProfile?.personPhone || '—'}
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        </DetailSection>
    );
}
