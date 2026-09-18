import { useCallback, useEffect, useState } from 'react';

import {
   deleteLeadDocument,
   fetchLeadDocuments,
   uploadLeadDocument,
} from '../../../api/lead-documents.api';
import { mapLeadDocumentsResponseFromApi } from '../../../model/lead.adapter';
import { notifyError } from '../../../../../shared/model/notifications.store';

export function useLeadDetailsDocuments(leadId) {
   const [documents, setDocuments] = useState([]);
   const [isDocumentUploading, setIsDocumentUploading] = useState(false);
   const [documentUploadError, setDocumentUploadError] = useState('');
   const [deletingDocumentIds, setDeletingDocumentIds] = useState([]);

   const reloadLeadDocuments = useCallback(async () => {
      if (!leadId) {
         setDocuments([]);
         return;
      }

      const response = await fetchLeadDocuments(leadId);
      const mappedDocuments = mapLeadDocumentsResponseFromApi(response);

      setDocuments(mappedDocuments);
   }, [leadId]);

   function resetDocuments() {
      setDocuments([]);
      setIsDocumentUploading(false);
      setDocumentUploadError('');
      setDeletingDocumentIds([]);
   }

   async function handleAddDocument({ name, context, file }) {
      if (!leadId || !file) {
         return;
      }

      try {
         setIsDocumentUploading(true);
         setDocumentUploadError('');

         await uploadLeadDocument(leadId, {
            file,
            name,
            context,
         });

         await reloadLeadDocuments();
      } catch (error) {
         const message =
            error.response?.data?.message ||
            error.message ||
            'Не удалось загрузить документ';

         setDocumentUploadError(message);
         notifyError(message);
      } finally {
         setIsDocumentUploading(false);
      }
   }

   async function handleDeleteDocument(documentId) {
      if (!leadId) {
         return;
      }

      const document = documents.find((item) => item.id === documentId);

      if (!document?.path) {
         const message = 'Не удалось определить файл для удаления';

         setDocumentUploadError(message);
         notifyError(message);
         return;
      }

      if (document.source && document.source !== 'customer') {
         const message = 'Можно удалить только файлы заказчика';

         setDocumentUploadError(message);
         notifyError(message);
         return;
      }

      try {
         setDocumentUploadError('');
         setDeletingDocumentIds((prevIds) => [...prevIds, documentId]);

         await deleteLeadDocument(leadId, document.path);

         await reloadLeadDocuments();
      } catch (error) {
         const message =
            error.response?.data?.message ||
            error.message ||
            'Не удалось удалить документ';

         setDocumentUploadError(message);
         notifyError(message);
      } finally {
         setDeletingDocumentIds((prevIds) =>
            prevIds.filter((id) => id !== documentId),
         );
      }
   }

   useEffect(() => {
      if (!leadId) {
         setDocuments([]);
         return;
      }

      let isCancelled = false;

      async function loadDocuments() {
         try {
            setDocuments([]);
            setDocumentUploadError('');

            const response = await fetchLeadDocuments(leadId);
            const mappedDocuments = mapLeadDocumentsResponseFromApi(response);

            if (!isCancelled) {
               setDocuments(mappedDocuments);
            }
         } catch (error) {
            if (!isCancelled) {
               const message =
                  error.response?.data?.message ||
                  error.message ||
                  'Не удалось загрузить документы';

               setDocuments([]);
               setDocumentUploadError(message);
               notifyError(message);
            }
         }
      }

      loadDocuments();

      return () => {
         isCancelled = true;
      };
   }, [leadId]);

   return {
      documents,
      isDocumentUploading,
      documentUploadError,
      deletingDocumentIds,
      handleAddDocument,
      handleDeleteDocument,
      resetDocuments,
   };
}
