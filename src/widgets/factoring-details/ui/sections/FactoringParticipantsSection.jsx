import { Box, Typography } from '@mui/material';
import { DetailSection } from '../../../../shared/ui/DetailSection';
import { InfoBadge } from '../../../../shared/ui/InfoBadge';

import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

export function FactoringParticipantsSection({ factoring }) {
    return (
        <DetailSection
            icon={<BusinessOutlinedIcon />}
            title='Участники'
            subtitle='Фактор и экспедитор по факторингу'
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(2, 1fr)',
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
                            variant='compact'
                        />

                        <InfoBadge
                            label='БИН'
                            value={factoring.factor?.bin || '—'}
                            variant='compact'
                        />

                        <InfoBadge
                            label='ФИО'
                            value={factoring.factor?.fio || '—'}
                            variant='compact'
                        />

                        <InfoBadge
                            label='Телефон'
                            value={factoring.factor?.phone || '—'}
                            variant='compact'
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
                            variant='compact'
                        />

                        <InfoBadge
                            label='БИН'
                            value={factoring.forwarder?.bin || '—'}
                            variant='compact'
                        />

                        <InfoBadge
                            label='ФИО'
                            value={factoring.forwarder?.fio || '—'}
                            variant='compact'
                        />

                        <InfoBadge
                            label='Телефон'
                            value={factoring.forwarder?.phone || '—'}
                            variant='compact'
                        />
                    </Box>
                </Box>
            </Box>
        </DetailSection>
    );
}
