import { Alert, Dialog, DialogContent, Typography } from '@mui/material';

import { useLeadsContext } from '../model/useLeadsContext';
import { useCustomerMap } from '../../customer-map/model/useCustomerMap';
import { useEffect, useRef, useState } from 'react';
import {
   createLeadEditForm,
   mapLeadEditFormToApi,
} from '../model/leadEditForm.helpers';
import { LeadDetailsMap } from './lead-details/LeadDetailsMap';
import { LeadDetailsEditActions } from './lead-details/LeadDetailsEditActions';
import { LeadDetailsContent } from './lead-details/LeadDetailsContent';
import { LeadDetailsActions } from './lead-details/LeadDetailsActions';
import {
   buildLeadRoutePayload,
   decodeRoutePolyline,
   getEncodedPolylineFromRoute,
   getRoutesFromGeneratedRoute,
} from '../lib/routePolyline.helpers';
import { generateRoute } from '../api/lead-route.repository';
import {
   fetchCustomerLeadById,
   updateCustomerLead,
} from '../api/leads.repository';
import {
   mapLeadDetailsResponseFromApi,
   mapLeadDocumentsResponseFromApi,
} from '../model/lead.adapter';
import { LeadDetailsHeader } from './lead-details/LeadDetailsHeader';
import {
   isGeoWsConfigured,
   mergeGeoPointsById,
   openLeadGeoConnection,
} from '../../../utils/geologic';
import {
   deleteLeadDocument,
   fetchLeadDocuments,
   uploadLeadDocument,
} from '../api/lead-documents.api';

export function LeadDetailsModal() {
   const map = useCustomerMap();
   const { openLead, setOpenLead } = useLeadsContext();

   const [leadDetails, setLeadDetails] = useState(null);
   const [isLeadDetailsLoading, setIsLeadDetailsLoading] = useState(false);
   const [leadDetailsError, setLeadDetailsError] = useState(null);

   const [route, setRoute] = useState(null);
   const [routePoints, setRoutePoints] = useState([]);
   const [isRouteLoading, setIsRouteLoading] = useState(false);

   const [geoPoints, setGeoPoints] = useState([]);
   const [geoCurrentPoint, setGeoCurrentPoint] = useState(null);

   const [documents, setDocuments] = useState([]);
   const [isDocumentUploading, setIsDocumentUploading] = useState(false);
   const [documentUploadError, setDocumentUploadError] = useState('');
   const [deletingDocumentIds, setDeletingDocumentIds] = useState([]);

   const [isEditing, setIsEditing] = useState(false);
   const [isSavingEdit, setIsSavingEdit] = useState(false);
   const [saveEditError, setSaveEditError] = useState(null);
   const [editForm, setEditForm] = useState(() => createLeadEditForm(null));

   const geoConnectionRef = useRef(null);

   const currentLead = leadDetails ?? openLead;

   function handleClose() {
      setOpenLead(null);
      setLeadDetails(null);
      setLeadDetailsError(null);
      setRoute(null);
      setRoutePoints([]);
      setGeoPoints([]);
      setGeoCurrentPoint(null);
      setIsEditing(false);
      setSaveEditError(null);
      setDocuments([]);
      setIsDocumentUploading(false);
      setDocumentUploadError('');
      setDeletingDocumentIds([]);
   }

   function handleEditChange(eventOrName, maybeValue) {
      if (typeof eventOrName === 'string') {
         setEditForm((prevForm) => ({
            ...prevForm,
            [eventOrName]: maybeValue,
         }));

         return;
      }

      const { name, value } = eventOrName.target;

      setEditForm((prevForm) => ({
         ...prevForm,
         [name]: value,
      }));
   }

   function handleStartEdit() {
      setIsEditing(true);
   }

   function handleCancelEdit() {
      setEditForm(createLeadEditForm(currentLead));
      setIsEditing(false);
   }

   async function handleAddDocument({ name, context, file }) {
      if (!currentLead?.id || !file) {
         return;
      }

      try {
         setIsDocumentUploading(true);
         setDocumentUploadError('');

         await uploadLeadDocument(currentLead.id, {
            file,
            name,
            context,
         });

         await reloadLeadDocuments(currentLead.id);
      } catch (error) {
         setDocumentUploadError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось загрузить документ',
         );
      } finally {
         setIsDocumentUploading(false);
      }
   }

   async function handleDeleteDocument(documentId) {
      if (!currentLead?.id) {
         return;
      }

      const document = documents.find((item) => item.id === documentId);

      if (!document?.path) {
         setDocumentUploadError('Не удалось определить файл для удаления');
         return;
      }

      if (document.source && document.source !== 'customer') {
         setDocumentUploadError('Можно удалить только файлы заказчика');
         return;
      }

      try {
         setDocumentUploadError('');
         setDeletingDocumentIds((prevIds) => [...prevIds, documentId]);

         await deleteLeadDocument(currentLead.id, document.path);

         await reloadLeadDocuments(currentLead.id);
      } catch (error) {
         setDocumentUploadError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось удалить документ',
         );
      } finally {
         setDeletingDocumentIds((prevIds) =>
            prevIds.filter((id) => id !== documentId),
         );
      }
   }

   async function handleSaveEdit() {
      if (!currentLead || isSavingEdit) {
         return;
      }

      const payload = mapLeadEditFormToApi(editForm, currentLead);

      if (Object.keys(payload).length === 0) {
         setIsEditing(false);
         setSaveEditError(null);
         return;
      }

      try {
         setIsSavingEdit(true);
         setSaveEditError(null);

         await updateCustomerLead(currentLead.id, payload);

         const response = await fetchCustomerLeadById(currentLead.id);
         const mappedLead = mapLeadDetailsResponseFromApi(response);

         if (!mappedLead) {
            throw new Error('Не удалось получить обновленные данные лида');
         }

         setOpenLead(mappedLead);
         setLeadDetails(mappedLead);
         setEditForm(createLeadEditForm(mappedLead));
         setIsEditing(false);
      } catch (error) {
         setSaveEditError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось сохранить изменения',
         );
      } finally {
         setIsSavingEdit(false);
      }
   }

   async function reloadLeadDocuments(leadId) {
      const response = await fetchLeadDocuments(leadId);
      const mappedDocuments = mapLeadDocumentsResponseFromApi(response);

      setDocuments(mappedDocuments);
   }

   useEffect(() => {
      if (!currentLead?.id) {
         setDocuments([]);
         return;
      }

      let isCancelled = false;

      async function loadDocuments() {
         try {
            setDocuments([]);
            setDocumentUploadError('');

            const response = await fetchLeadDocuments(currentLead.id);
            const mappedDocuments = mapLeadDocumentsResponseFromApi(response);

            if (!isCancelled) {
               setDocuments(mappedDocuments);
            }
         } catch (error) {
            if (!isCancelled) {
               setDocuments([]);
               setDocumentUploadError(
                  error.response?.data?.message ||
                     error.message ||
                     'Не удалось загрузить документы',
               );
            }
         }
      }

      loadDocuments();

      return () => {
         isCancelled = true;
      };
   }, [currentLead?.id]);

   useEffect(() => {
      if (!openLead?.id) {
         setLeadDetails(null);
         return;
      }

      let isCancelled = false;

      async function loadLeadDetails() {
         try {
            setIsLeadDetailsLoading(true);
            setLeadDetailsError(null);

            const response = await fetchCustomerLeadById(openLead.id);
            const mappedLead = mapLeadDetailsResponseFromApi(response);

            if (!isCancelled) {
               setLeadDetails(mappedLead);
            }
         } catch (error) {
            if (!isCancelled) {
               setLeadDetailsError(error.message || 'Не удалось загрузить лид');
            }
         } finally {
            if (!isCancelled) {
               setIsLeadDetailsLoading(false);
            }
         }
      }

      loadLeadDetails();

      return () => {
         isCancelled = true;
      };
   }, [openLead?.id]);

   useEffect(() => {
      if (!currentLead) {
         return;
      }

      setEditForm(createLeadEditForm(currentLead));
      setIsEditing(false);
   }, [currentLead]);

   useEffect(() => {
      if (!leadDetails?.id) {
         setRoute(null);
         setRoutePoints([]);
         return;
      }

      let isCancelled = false;

      async function loadLeadRoute() {
         try {
            setIsRouteLoading(true);
            setRoute(null);
            setRoutePoints([]);

            const payload = buildLeadRoutePayload(leadDetails);

            if (!payload) {
               return;
            }

            const generatedRoute = await generateRoute(payload);

            if (isCancelled || !generatedRoute) {
               return;
            }

            const routes = getRoutesFromGeneratedRoute(generatedRoute);
            const mainRoute = routes[0];

            if (!mainRoute) {
               console.warn('Маршруты не найдены в response:', generatedRoute);
               return;
            }

            const encodedPolyline = getEncodedPolylineFromRoute(mainRoute);
            const decodedPoints = decodeRoutePolyline(encodedPolyline);

            if (!decodedPoints.length) {
               console.warn('Polyline не декодировался:', {
                  generatedRoute,
                  mainRoute,
                  encodedPolyline,
               });

               return;
            }

            setRoute(mainRoute);
            setRoutePoints(decodedPoints);
         } finally {
            if (!isCancelled) {
               setIsRouteLoading(false);
            }
         }
      }

      loadLeadRoute();

      return () => {
         isCancelled = true;
      };
   }, [leadDetails]);

   useEffect(() => {
      geoConnectionRef.current?.close();
      geoConnectionRef.current = null;

      setGeoPoints([]);
      setGeoCurrentPoint(null);

      if (!openLead?.id) return;

      if (!isGeoWsConfigured()) {
         console.info('GeoWS is not configured for this environment');
         return;
      }

      const connection = openLeadGeoConnection({
         leadId: openLead.id,

         onError: (error) => {
            console.error('Lead GeoWS error:', error);
         },

         onAuthFailed: (payload) => {
            console.error('Lead GeoWS auth failed:', payload);
         },

         onPoints: (points) => {
            if (!points?.length) {
               return;
            }

            setGeoPoints((prevPoints) => {
               const nextPoints = mergeGeoPointsById(prevPoints, points);
               setGeoCurrentPoint(nextPoints.at(-1) ?? null);

               return nextPoints;
            });
         },
      });

      geoConnectionRef.current = connection;

      return () => {
         connection.close();

         if (geoConnectionRef.current === connection) {
            geoConnectionRef.current = null;
         }
      };
   }, [openLead?.id]);

   if (!openLead || !currentLead) {
      return null;
   }

   return (
      <Dialog
         open={Boolean(openLead)}
         onClose={handleClose}
         fullWidth
         maxWidth='md'
         slotProps={{
            paper: {
               sx: {
                  borderRadius: 4,
               },
            },
         }}
      >
         <LeadDetailsHeader lead={currentLead} />

         <DialogContent sx={{ px: 3 }}>
            {isLeadDetailsLoading && (
               <Typography color='text.secondary' sx={{ mb: 2 }}>
                  Загружаем детали лида...
               </Typography>
            )}

            {leadDetailsError && (
               <Alert severity='error' sx={{ mb: 2 }}>
                  {leadDetailsError}
               </Alert>
            )}

            {saveEditError && (
               <Alert severity='error' sx={{ mb: 2 }}>
                  {saveEditError}
               </Alert>
            )}

            <LeadDetailsMap
               map={map}
               lead={currentLead}
               route={route}
               routePoints={routePoints}
               geoPoints={geoPoints}
               geoCurrentPoint={geoCurrentPoint}
               isRouteLoading={isRouteLoading}
            />

            <LeadDetailsEditActions
               isEditing={isEditing}
               onStartEdit={handleStartEdit}
               onCancelEdit={handleCancelEdit}
            />

            <LeadDetailsContent
               lead={currentLead}
               isEditing={isEditing}
               editForm={editForm}
               onEditChange={handleEditChange}
               documents={documents}
               onAddDocument={handleAddDocument}
               onDeleteDocument={handleDeleteDocument}
               isDocumentUploading={isDocumentUploading}
               documentUploadError={documentUploadError}
               deletingDocumentIds={deletingDocumentIds}
            />
         </DialogContent>

         <LeadDetailsActions
            isEditing={isEditing}
            isSaving={isSavingEdit}
            onSave={handleSaveEdit}
            onClose={handleClose}
         />
      </Dialog>
   );
}
