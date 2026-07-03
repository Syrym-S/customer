import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

export function BannedScreen({ onLogout, onAppeal }) {
    return (
        <Box
            sx={{
                minHeight: 'calc(100dvh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                py: 4,
                backgroundColor: 'background.default',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: 520,
                    p: {
                        xs: 3,
                        sm: 4,
                    },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        width: 72,
                        height: 72,
                        mx: 'auto',
                        mb: 2,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'error.light',
                        color: 'error.contrastText',
                    }}
                >
                    <BlockOutlinedIcon sx={{ fontSize: 38 }} />
                </Box>

                <Typography variant='h5' fontWeight={700}>
                    Аккаунт заблокирован
                </Typography>

                <Typography
                    color='text.secondary'
                    sx={{
                        mt: 1.5,
                        fontSize: 14,
                        lineHeight: 1.6,
                    }}
                >
                    Доступ к рабочему пространству временно ограничен. Вы не
                    можете создавать заявки, работать с тендерами и выполнять
                    другие действия в системе.
                </Typography>

                <Stack
                    direction={{
                        xs: 'column',
                        sm: 'row',
                    }}
                    spacing={1.5}
                    justifyContent='center'
                    sx={{ mt: 3 }}
                >
                    <Button
                        variant='contained'
                        color='error'
                        startIcon={<LogoutOutlinedIcon />}
                        onClick={onLogout}
                    >
                        Выйти из аккаунта
                    </Button>

                    <Button
                        variant='outlined'
                        startIcon={<SupportAgentOutlinedIcon />}
                        onClick={onAppeal}
                    >
                        Связаться с поддержкой
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}
