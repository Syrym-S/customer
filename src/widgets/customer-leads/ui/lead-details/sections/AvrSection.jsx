import { useEffect, useRef, useState } from 'react';
import i18n from '../../../../../shared/i18n';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';

import {
   Alert,
   Box,
   Button,
   Chip,
   CircularProgress,
   Link,
   Stack,
   Typography,
} from '@mui/material';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

import { DetailSection } from '../components/DetailSection';
import { fetchAvrStatusApi, signAvrDocumentApi } from '../../../api/avr.api';
import {
   getAvrPartyStatusColor,
   getAvrPartyStatusLabel,
   isForwarderAvrSigned,
} from '../../../model/avr.helpers';
import { notifyError } from '../../../../../shared/model/notifications.store';

const POLL_INTERVAL_MS = 4000;

function downloadAvrDocument(avrDocument) {
   if (!avrDocument?.content) {
      notifyError(i18n.t("leads.avr.unavailable"));
      return;
   }

   const base64 = avrDocument.content.replace(/^data:[^;]+;base64,/, '');
   const binaryString = window.atob(base64);
   const bytes = new Uint8Array(binaryString.length);

   for (let index = 0; index < binaryString.length; index += 1) {
      bytes[index] = binaryString.charCodeAt(index);
   }

   const blob = new Blob([bytes], {
      type: avrDocument.mime || 'application/pdf',
   });
   const objectUrl = URL.createObjectURL(blob);
   const link = document.createElement('a');

   link.href = objectUrl;
   link.download = avrDocument.name || 'avr.pdf';
   document.body.appendChild(link);
   link.click();
   link.remove();
   URL.revokeObjectURL(objectUrl);
}

function ForwarderAvrCard({ signed }) {
   const { t } = useTranslation();

   return (
      <Box
         sx={{
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'grey.50',
         }}
      >
         <Box
            sx={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               gap: 1,
               flexWrap: 'wrap',
            }}
         >
            <Typography fontWeight={700}>{t("leads.avr.forwarderSignature")}</Typography>

            <Chip
               size='small'
               label={getAvrPartyStatusLabel(signed)}
               color={getAvrPartyStatusColor(signed)}
               sx={{ borderRadius: 999 }}
            />
         </Box>

         {!signed && (
            <Typography
               sx={{ mt: 0.5, fontSize: 12 }}
               color='text.secondary'
            >
               {t("leads.avr.waitForForwarder")}
            </Typography>
         )}
      </Box>
   );
}

ForwarderAvrCard.propTypes = {
   signed: PropTypes.bool.isRequired,
};

export function AvrSection({ lead }) {
   const { t } = useTranslation();

   const [forwarderSigned, setForwarderSigned] = useState(() =>
      isForwarderAvrSigned(lead),
   );

   const [avrDocument, setAvrDocument] = useState(null);
   const [isSigned, setIsSigned] = useState(false);
   const [isCheckingStatus, setIsCheckingStatus] = useState(false);
   const [hasLoadedStatus, setHasLoadedStatus] = useState(false);
   const [isSigning, setIsSigning] = useState(false);
   const [signUrl, setSignUrl] = useState(null);
   const [serviceUnavailableMessage, setServiceUnavailableMessage] =
      useState('');

   const pollIntervalRef = useRef(null);
   const signExpiresAtRef = useRef(null);

   function stopPolling() {
      if (pollIntervalRef.current) {
         clearInterval(pollIntervalRef.current);
         pollIntervalRef.current = null;
      }
   }

   useEffect(() => stopPolling, []);

   useEffect(() => {
      if (avrDocument || isCheckingStatus) {
         return;
      }

      let isCancelled = false;

      async function checkStatus() {
         setIsCheckingStatus(true);

         try {
            const status = await fetchAvrStatusApi(lead.id);

            if (isCancelled) {
               return;
            }

            setServiceUnavailableMessage('');
            setAvrDocument(status?.document || null);
            setIsSigned(Boolean(status?.signed));

            if (status?.document) {
               setForwarderSigned(true);
            }
         } catch (error) {
            if (!isCancelled) {
               const statusCode = error.response?.status;

               if (statusCode === 404) {
                  // A 404 here just means the forwarder hasn't produced the AVR
                  // document yet — an expected state, not an error worth a toast.
               } else if (statusCode === 502) {
                  // Signing service being temporarily down is a transient,
                  // expected-ish backend issue — shown inline in this section
                  // rather than as a disruptive global toast.
                  setServiceUnavailableMessage(
                     error.response?.data?.message ||
                        t("common.signing.unavailable"),
                  );
               } else {
                  notifyError(
                     error.response?.data?.message ||
                        error.message ||
                        t("leads.avr.statusLoadFailed"),
                  );
               }
            }
         } finally {
            if (!isCancelled) {
               setIsCheckingStatus(false);
               setHasLoadedStatus(true);
            }
         }
      }

      checkStatus();

      return () => {
         isCancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [lead.id]);

   function pollForSignature() {
      stopPolling();

      pollIntervalRef.current = setInterval(async () => {
         if (
            signExpiresAtRef.current &&
            Date.now() > signExpiresAtRef.current
         ) {
            stopPolling();
            setIsSigning(false);
            setSignUrl(null);
            notifyError(t("leads.avr.timeout"));
            return;
         }

         try {
            const status = await fetchAvrStatusApi(lead.id);

            if (status?.document) {
               setAvrDocument(status.document);
               setForwarderSigned(true);
            }

            if (status?.signed) {
               stopPolling();
               setIsSigning(false);
               setIsSigned(true);
               setSignUrl(null);
            }
         } catch {
            // Transient poll errors are ignored — the interval retries on
            // its own until success, expiry, or unmount.
         }
      }, POLL_INTERVAL_MS);
   }

   async function handleSign() {
      if (isSigning || isSigned) {
         return;
      }

      setIsSigning(true);

      try {
         const session = await signAvrDocumentApi(lead.id);

         signExpiresAtRef.current = session?.expires_at
            ? new Date(session.expires_at).getTime()
            : null;

         if (session?.sign_url) {
            setSignUrl(session.sign_url);
            window.open(session.sign_url, '_blank');
         }

         pollForSignature();
      } catch (error) {
         setIsSigning(false);
         setSignUrl(null);
         notifyError(
            error.response?.data?.message ||
               error.message ||
               t("leads.avr.signStartFailed"),
         );
      }
   }

   return (
      <DetailSection
         icon={<FactCheckOutlinedIcon />}
         title={t("leads.avr.titleShort")}
      >
         <Stack spacing={1.5}>
            {!hasLoadedStatus ? (
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                  <CircularProgress size={18} />

                  <Typography fontSize={13} color='text.secondary'>
                     {t("leads.avr.checking")}
                  </Typography>
               </Box>
            ) : (
               <>
                  {serviceUnavailableMessage && (
                     <Alert severity='error'>{serviceUnavailableMessage}</Alert>
                  )}

                  <ForwarderAvrCard signed={forwarderSigned} />

                  {/* Dev-only: mocks the forwarder having signed, since no
                     real forwarder AVR field exists yet. Remove once backend
                     confirms and delivers the real field. */}
                  {import.meta.env.DEV && !forwarderSigned && (
                     <Button
                        size='small'
                        variant='text'
                        onClick={() => setForwarderSigned(true)}
                        sx={{ alignSelf: 'flex-start' }}
                     >
                        {t("leads.avr.devSimulateForwarder")}
                     </Button>
                  )}

                  <Box
                     sx={{
                        p: 1.5,
                        border: '1px solid',
                        borderColor: isSigned ? 'divider' : 'primary.light',
                        borderRadius: 2,
                        backgroundColor: isSigned
                           ? 'background.paper'
                           : 'rgba(33, 150, 243, 0.04)',
                        opacity: forwarderSigned ? 1 : 0.5,
                        pointerEvents: forwarderSigned ? 'auto' : 'none',
                     }}
                  >
                     <Stack spacing={1}>
                        <Typography fontWeight={700}>{t("leads.avr.customerSignature")}</Typography>

                        {avrDocument && (
                           <Box
                              onClick={() => downloadAvrDocument(avrDocument)}
                              role='button'
                              tabIndex={0}
                              onKeyDown={(event) => {
                                 if (
                                    event.key === 'Enter' ||
                                    event.key === ' '
                                 ) {
                                    downloadAvrDocument(avrDocument);
                                 }
                              }}
                              sx={{
                                 display: 'flex',
                                 alignItems: 'center',
                                 gap: 1.5,
                                 p: 1,
                                 border: '1px solid',
                                 borderColor: 'divider',
                                 borderRadius: 2,
                                 cursor: 'pointer',
                              }}
                           >
                              <InsertDriveFileOutlinedIcon color='primary' />

                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                 <Typography variant='body2' fontWeight={500}>
                                    {avrDocument.name ||
                                       t("leads.avr.title")}
                                 </Typography>

                                 <Typography
                                    variant='caption'
                                    color='text.secondary'
                                 >
                                    {t("leads.avr.clickToDownload")}
                                 </Typography>
                              </Box>

                              <Chip
                                 size='small'
                                 label={getAvrPartyStatusLabel(isSigned)}
                                 color={getAvrPartyStatusColor(isSigned)}
                                 sx={{ borderRadius: 999 }}
                              />
                           </Box>
                        )}

                        {!avrDocument && forwarderSigned && (
                           <Typography fontSize={13} color='text.secondary'>
                              {t("leads.avr.notReady")}
                           </Typography>
                        )}

                        {avrDocument && !isSigned && (
                           <Button
                              variant='outlined'
                              size='small'
                              disabled={isSigning}
                              onClick={handleSign}
                              sx={{ alignSelf: 'flex-start' }}
                              startIcon={
                                 isSigning ? (
                                    <CircularProgress size={16} />
                                 ) : undefined
                              }
                           >
                              {isSigning ? t("common.signing.waiting") : t("common.actions.sign")}
                           </Button>
                        )}

                        {isSigning && (
                           <Typography fontSize={12} color='text.secondary'>
                              {t("common.signing.keepPageOpen")}
                           </Typography>
                        )}

                        {isSigning && signUrl && (
                           <Typography fontSize={12} color='text.secondary'>
                              {t('common.signing.windowHint')}{' '}
                              <Link
                                 href={signUrl}
                                 target='_blank'
                                 rel='noopener noreferrer'
                              >
                                 {t("common.signing.thisLink")}
                              </Link>
                              .
                           </Typography>
                        )}
                     </Stack>
                  </Box>
               </>
            )}
         </Stack>
      </DetailSection>
   );
}

AvrSection.propTypes = {
   lead: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
         .isRequired,
      forwarder_avr_signed: PropTypes.bool,
   }).isRequired,
};
