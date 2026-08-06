import { Box, Container } from '@mui/material';

export function PageContainer({ children, fullWidth = false, sx, ...boxProps }) {
    if (fullWidth) {
        return (
            <Container maxWidth={false} sx={sx} {...boxProps}>
                {children}
            </Container>
        );
    }

    return (
        <Container maxWidth={false}>
            <Box
                sx={{
                    width: {
                        xs: '100%',
                        md: '85%',
                        lg: '78%',
                    },
                    maxWidth: 1200,
                    mx: 'auto',
                    py: 3,
                    ...sx,
                }}
                {...boxProps}
            >
                {children}
            </Box>
        </Container>
    );
}