import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from '@mui/material';
import { CreateTenderModal } from './CreateTenderModal';

export function CreateTenderButton() {
   const { t } = useTranslation();

   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

   const handleOpenCreateModal = () => setIsCreateModalOpen(true);

   const handleCloseCreateModal = () => setIsCreateModalOpen(false);

   return (
      <>
         <Button variant='contained' onClick={handleOpenCreateModal}>
            {t("tenders.create.action")}
         </Button>

         <CreateTenderModal
            open={isCreateModalOpen}
            onClose={handleCloseCreateModal}
         />
      </>
   );
}
