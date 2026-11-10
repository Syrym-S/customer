import PropTypes from 'prop-types';
import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';

import i18n from '../../../../shared/i18n';

function getValue(value) {
    return value || i18n.t('common.empty.notSpecifiedM');
}

export function ForwarderDataGroup({ title, rows }) {
    return (
        <Box
            sx={{
                p: {
                    xs: 1.25,
                    sm: 1.5,
                },
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
            }}
        >
            <Typography
                sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'text.secondary',
                    mb: 0.5,
                }}
            >
                {title}
            </Typography>

            <TableContainer component={Box}>
                <Table size="small">
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.label}>
                                <TableCell
                                    sx={{
                                        width: '45%',
                                        color: 'text.secondary',
                                        pl: 0,
                                        borderBottom: 'none',
                                        verticalAlign: 'top',
                                    }}
                                >
                                    {row.label}:
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 500,
                                        pr: 0,
                                        borderBottom: 'none',
                                        overflowWrap: 'anywhere',
                                    }}
                                >
                                    {getValue(row.value)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

ForwarderDataGroup.propTypes = {
    title: PropTypes.string.isRequired,
    rows: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.node,
        }),
    ).isRequired,
};
