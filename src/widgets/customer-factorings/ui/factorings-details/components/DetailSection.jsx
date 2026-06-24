import { Box, Typography } from '@mui/material';

export function DetailSection({ icon, title, subtitle, children }) {
    return (
        <Box
            sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                backgroundColor: 'background.paper',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1.5,
                }}
            >
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        backgroundColor: 'rgba(33, 150, 243, 0.08)',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '& svg': {
                            fontSize: 20,
                        },
                    }}
                >
                    {icon}
                </Box>

                <Box>
                    <Typography
                        sx={{
                            fontSize: '15px',
                            fontWeight: 600,
                        }}
                    >
                        {title}
                    </Typography>

                    {subtitle && (
                        <Typography
                            color='text.secondary'
                            sx={{
                                fontSize: 13,
                                mt: 0.2,
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Box>

            {children}
        </Box>
    );
}
