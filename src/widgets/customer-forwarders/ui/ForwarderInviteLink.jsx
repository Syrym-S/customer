import { useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { getForwarderInviteLink } from '../model/forwarders.helpers';

export function ForwarderInviteLink({
    forwarder,
    compact = false,
    onActionClick,
}) {
    const [isCopied, setIsCopied] = useState(false);
    const inviteLink = getForwarderInviteLink(forwarder);

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

    if (!inviteLink) {
        return (
            <Typography color="text.secondary" fontSize={13}>
                Нет активной ссылки
            </Typography>
        );
    }

    if (compact) {
        return (
            <Button
                size="small"
                variant="outlined"
                onClick={handleCopy}
                sx={{ whiteSpace: 'nowrap' }}
            >
                {isCopied ? 'Скопировано' : 'Скопировать'}
            </Button>
        );
    }

    return (
        <Stack spacing={1}>
            <TextField
                label="Пригласительная ссылка"
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
                {isCopied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
            </Button>
        </Stack>
    );
}