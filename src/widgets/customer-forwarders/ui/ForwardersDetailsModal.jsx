import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Dialog, DialogContent, Divider } from '@mui/material';

import { DialogCloseButton } from '../../../shared/ui/DialogCloseButton';
import { LeadDetailsReadOnlyModal } from '../../customer-leads/ui/lead-details/LeadDetailsReadOnlyModal';
import { ForwarderInfoColumn } from './forwarder-details/ForwarderInfoColumn';
import { ForwarderLeadsColumn } from './forwarder-details/ForwarderLeadsColumn';
import { getForwarderId } from '../model/forwarders.helpers';
import { useForwarderDetails } from '../model/useForwarderDetails';

export function ForwarderDetailsModal({ open, forwarder: listForwarder, onClose }) {
    const {
        forwarder,
        leads,
        page,
        setPage,
        pageCount,
        isDetailsLoading,
        isLeadsLoading,
        error,
    } = useForwarderDetails({
        forwarderId: getForwarderId(listForwarder),
        enabled: open,
        initialForwarder: listForwarder,
    });

    const [openLead, setOpenLead] = useState(null);

    useEffect(() => {
        if (!open) {
            setOpenLead(null);
        }
    }, [open]);

    function handleLeadsPageChange(_, nextPage) {
        setPage(nextPage);
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="lg"
                slotProps={{
                    paper: {
                        sx: {
                            m: {
                                xs: 1,
                                sm: 2,
                            },
                            width: {
                                xs: 'calc(100% - 16px)',
                                sm: 'calc(100% - 64px)',
                            },
                            height: {
                                xs: 'auto',
                                md: 'calc(100% - 64px)',
                            },
                            maxHeight: {
                                xs: 'calc(100% - 16px)',
                                sm: 'calc(100% - 64px)',
                            },
                            borderRadius: {
                                xs: 2,
                                sm: 3,
                            },
                            overflowX: 'hidden',
                        },
                    },
                }}
            >
                <DialogCloseButton onClick={onClose} />

                <DialogContent
                    sx={{
                        p: 0,
                        display: 'flex',
                        minHeight: 0,
                        overflowX: 'hidden',
                        overflowY: {
                            xs: 'auto',
                            md: 'hidden',
                        },
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: {
                                xs: 'column',
                                md: 'row',
                            },
                            alignItems: 'stretch',
                            width: '100%',
                            minHeight: 0,
                        }}
                    >
                        <Box
                            sx={{
                                flex: {
                                    xs: 'none',
                                    md: '0 0 34%',
                                },
                                minWidth: 0,
                                px: {
                                    xs: 2,
                                    sm: 3,
                                },
                                py: {
                                    xs: 2.5,
                                    sm: 3,
                                },
                                overflowY: {
                                    xs: 'visible',
                                    md: 'auto',
                                },
                            }}
                        >
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <ForwarderInfoColumn
                                forwarder={forwarder}
                                loading={isDetailsLoading}
                            />
                        </Box>

                        <Divider
                            flexItem
                            orientation="vertical"
                            sx={{
                                display: {
                                    xs: 'none',
                                    md: 'block',
                                },
                            }}
                        />

                        <Divider
                            sx={{
                                display: {
                                    xs: 'block',
                                    md: 'none',
                                },
                            }}
                        />

                        <Box
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                minHeight: 0,
                                px: {
                                    xs: 2,
                                    sm: 3,
                                },
                                py: {
                                    xs: 2.5,
                                    sm: 3,
                                },
                                pr: {
                                    xs: 2,
                                    sm: 7,
                                },
                            }}
                        >
                            <ForwarderLeadsColumn
                                leads={leads}
                                page={page}
                                pageCount={pageCount}
                                loading={isLeadsLoading}
                                onPageChange={handleLeadsPageChange}
                                onOpenLead={setOpenLead}
                            />
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {openLead && (
                <LeadDetailsReadOnlyModal
                    lead={openLead}
                    onClose={() => setOpenLead(null)}
                />
            )}
        </>
    );
}

ForwarderDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    forwarder: PropTypes.object,
    onClose: PropTypes.func.isRequired,
};
