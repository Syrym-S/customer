import {
    Box,
    Button,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

import {
    getForwarderBin,
    getForwarderCompanyName,
    getForwarderFio,
    getForwarderId,
    getForwarderIin,
    getForwarderPhone,
} from '../model/forwarders.helpers';

export function ForwardersTable({ forwarders, onOpenDetails }) {
    return (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Компания</TableCell>
                        <TableCell>БИН</TableCell>
                        <TableCell>ИИН</TableCell>
                        <TableCell>Представитель</TableCell>
                        <TableCell>Телефон</TableCell>
                        <TableCell align='right'>Действия</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {forwarders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <Box
                                    sx={{
                                        py: 5,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography color='text.secondary'>
                                        Экспедиторы не найдены
                                    </Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ) : (
                        forwarders.map((forwarder) => {
                            const forwarderId = getForwarderId(forwarder);

                            return (
                                <TableRow
                                    key={forwarderId}
                                    hover
                                    onClick={() => onOpenDetails(forwarder)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>
                                        <Stack spacing={0.25}>
                                            <Typography fontSize={14}>
                                                {getForwarderCompanyName(
                                                    forwarder,
                                                )}
                                            </Typography>

                                            <Typography
                                                fontSize={12}
                                                color='text.secondary'
                                            >
                                                ID: {forwarderId || '—'}
                                            </Typography>
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        {getForwarderBin(forwarder)}
                                    </TableCell>

                                    <TableCell>
                                        {getForwarderIin(forwarder)}
                                    </TableCell>

                                    <TableCell>
                                        {getForwarderFio(forwarder)}
                                    </TableCell>

                                    <TableCell>
                                        {getForwarderPhone(forwarder)}
                                    </TableCell>

                                    <TableCell align='right'>
                                        <Button
                                            size='small'
                                            variant='outlined'
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onOpenDetails(forwarder);
                                            }}
                                        >
                                            Подробнее
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
