import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Link, Tooltip } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

export function CopyableContact({ type, value, placeholder }) {
   const { t } = useTranslation();

   const [isCopied, setIsCopied] = useState(false);
   const resetTimeoutRef = useRef(null);

   useEffect(
      () => () => {
         if (resetTimeoutRef.current) {
            window.clearTimeout(resetTimeoutRef.current);
         }
      },
      [],
   );

   const text = String(value ?? '').trim();

   const isLinkable =
      Boolean(text) &&
      text !== placeholder &&
      text !== t('common.empty.notSpecifiedM') &&
      text !== t('common.empty.notSpecifiedN');

   if (!isLinkable) {
      return <>{text || placeholder || t('common.empty.notSpecifiedM')}</>;
   }

   const href =
      type === 'phone'
         ? `tel:${text.replace(/[^+\d]/g, '')}`
         : `mailto:${text}`;

   async function handleCopy(event) {
      event.stopPropagation();
      event.preventDefault();

      try {
         await navigator.clipboard.writeText(text);
      } catch {
         return;
      }

      setIsCopied(true);

      if (resetTimeoutRef.current) {
         window.clearTimeout(resetTimeoutRef.current);
      }

      resetTimeoutRef.current = window.setTimeout(() => {
         setIsCopied(false);
      }, 1500);
   }

   return (
      <Box
         sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            minWidth: 0,
            maxWidth: '100%',
         }}
      >
         <Link
            href={href}
            underline="hover"
            onClick={(event) => event.stopPropagation()}
            sx={{
               fontWeight: 500,
               minWidth: 0,
               overflowWrap: 'anywhere',
            }}
         >
            {text}
         </Link>

         <Tooltip
            title={isCopied ? t('common.actions.copied') : t('common.actions.copy')}
            placement="top"
            arrow
         >
            <IconButton
               size="small"
               onClick={handleCopy}
               aria-label={t('common.actions.copy')}
               sx={{
                  p: 0.25,
                  flexShrink: 0,
                  color: isCopied ? 'success.main' : 'text.secondary',
               }}
            >
               {isCopied ? (
                  <CheckRoundedIcon sx={{ fontSize: 15 }} />
               ) : (
                  <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
               )}
            </IconButton>
         </Tooltip>
      </Box>
   );
}

CopyableContact.propTypes = {
   type: PropTypes.oneOf(['phone', 'email']).isRequired,
   value: PropTypes.string,
   placeholder: PropTypes.string,
};
