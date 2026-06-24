import { Box, Typography } from '@mui/material';

export function InfoBadge({ label, value, accent, fullWidth }) {
    const displayValue =
        value === null || value === undefined || value === '' ? '—' : value;

    return (
        <Box
            sx={{
                p: 1.25,
                borderRadius: 2,
                backgroundColor: accent
                    ? 'rgba(33, 150, 243, 0.08)'
                    : 'grey.50',
                border: '1px solid',
                borderColor: accent ? 'primary.light' : 'divider',
                minWidth: 0,
                width: fullWidth ? '100%' : 'auto',
            }}
        >
            <Typography
                color='text.secondary'
                sx={{
                    fontSize: 12,
                    mb: 0.3,
                }}
            >
                {label}
            </Typography>

            <Typography
                component='div'
                sx={{
                    fontSize: 14,
                    fontWeight: accent ? 600 : 400,
                    color: accent ? 'primary.main' : 'text.primary',
                    wordBreak: 'break-word',
                }}
            >
                {displayValue}
            </Typography>
        </Box>
    );
}
