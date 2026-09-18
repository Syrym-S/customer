import { Box, CircularProgress, Typography } from '@mui/material';
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
    return (
        <DetailSection
            icon={<BusinessOutlinedIcon />}
            title='Участники'
            subtitle='Все участники по факторингу'
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
                        Фактор
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
                            label='Компания'
                            value={factoring.factor?.company_name || '—'}
                        />

                        <InfoBadge
                            label='БИН'
                            value={factoring.factor?.bin || '—'}
                        />

                        <InfoBadge
                            label='ФИО'
                            value={factoring.factor?.fio || '—'}
                        />

                        <InfoBadge
                            label='Телефон'
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
                        Экспедитор
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
                            label='Компания'
                            value={factoring.forwarder?.company_name || '—'}
                        />

                        <InfoBadge
                            label='БИН'
                            value={factoring.forwarder?.bin || '—'}
                        />

                        <InfoBadge
                            label='ФИО'
                            value={factoring.forwarder?.fio || '—'}
                        />

                        <InfoBadge
                            label='Телефон'
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
                        Заказчик
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
                            Не удалось загрузить данные заказчика
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
                                label='Компания'
                                value={customerProfile?.fullName || '—'}
                            />

                            <InfoBadge
                                label='БИН'
                                value={customerProfile?.bin || '—'}
                            />

                            <InfoBadge
                                label='ФИО'
                                value={customerProfile?.personFio || '—'}
                            />

                            <InfoBadge
                                label='Телефон'
                                value={customerProfile?.personPhone || '—'}
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        </DetailSection>
    );
}
