import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Button, Chip, Stack, TextField, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import {
    getForwarderInviteLink,
    isForwarderRegistered,
} from '../model/forwarders.helpers';

export function ForwarderInviteLink({
    forwarder,
    compact = false,
    onActionClick,
}) {
    const { t } = useTranslation();

    const [isCopied, setIsCopied] = useState(false);
    const inviteLink = getForwarderInviteLink(forwarder);
    const isRegistered = isForwarderRegistered(forwarder);

    async function handleCopy(event) {
        event.stopPropagation();
        onActionClick?.(event);

        if (!inviteLink) {
            return;
        }

        await navigator.clipboard.writeText(inviteLink);
        setIsCopied(true);

        window.setTimeout(() => {
            setIsCopied(false);
        }, 1500);
    }

    if (isRegistered) {
        return (
            <Chip
                icon={<CheckCircleRoundedIcon />}
                label={t("forwarders.registered")}
                color="success"
                variant="outlined"
                size="small"
                sx={{
                    maxWidth: '100%',
                    height: 22,
                    fontSize: 12,
                    '& .MuiChip-icon': {
                        fontSize: 14,
                    },
                    '& .MuiChip-label': {
                        px: 0.75,
                    },
                }}
            />
        );
    }

    if (!inviteLink) {
        return (
            <Typography color="text.secondary" fontSize={13}>
                {t("forwarders.invite.noActiveLink")}
            </Typography>
        );
    }

    if (compact) {
        return (
            <Button
                size="small"
                variant="outlined"
                onClick={handleCopy}
                sx={{
                    whiteSpace: 'nowrap',
                    px: 1,
                    py: 0.25,
                    minWidth: 0,
                    fontSize: 12,
                    lineHeight: 1.4,
                }}
            >
                {isCopied ? t("common.actions.copied") : t("common.actions.copy")}
            </Button>
        );
    }

    return (
        <Stack spacing={1}>
            <TextField
                label={t("forwarders.invite.link")}
                value={inviteLink}
                fullWidth
                size="small"
                multiline
                minRows={2}
                InputProps={{
                    readOnly: true,
                }}
                onClick={(event) => event.stopPropagation()}
            />

            <Button
                variant="outlined"
                onClick={handleCopy}
                sx={{ alignSelf: 'flex-start' }}
            >
                {isCopied ? t("forwarders.invite.linkCopied") : t("forwarders.invite.copyLink")}
            </Button>
        </Stack>
    );
}