import { Box, Typography } from '@mui/material';

export function FactoringPartiesRequisitesSection({ factoring }) {
    const forwarder = factoring.forwarder || {};
    const factor = factoring.factor || {};

    return (
        <Box
            sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                backgroundColor: 'grey.50',
            }}
        >
            <Typography
                sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    mb: 1.5,
                }}
            >
                Реквизиты сторон
            </Typography>

            <Typography
                sx={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: 'text.primary',
                    whiteSpace: 'pre-line',
                }}
            >
                {`Экспедитор: ${forwarder.company_name || '—'}
                БИН: ${forwarder.bin || '—'}
                Представитель: ${forwarder.fio || '—'}
                Телефон: ${forwarder.phone || '—'}

                Фактор: ${factor.company_name || '—'}
                БИН: ${factor.bin || '—'}
                Представитель: ${factor.fio || '—'}
                Телефон: ${factor.phone || '—'}`}
            </Typography>
        </Box>
    );
}
