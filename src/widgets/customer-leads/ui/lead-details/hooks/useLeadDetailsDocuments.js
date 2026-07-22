import { useCallback, useEffect, useState } from 'react';

import {
   deleteLeadDocument,
   fetchLeadDocuments,
   uploadLeadDocument,
} from '../../../api/lead-documents.api';
import { mapLeadDocumentsResponseFromApi } from '../../../model/lead.adapter';

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
      if (!leadId) {
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

         await deleteLeadDocument(leadId, document.path);

         await reloadLeadDocuments();
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
