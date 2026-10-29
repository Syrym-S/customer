import { Button } from '@mui/material';
import { useTranslation } from "react-i18next";
import { CreateLeadModal } from './CreateLeadModal';
import { useState } from 'react';

export function CreateLeadButton() {
   const { t } = useTranslation();

   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

   const handleOpenCreateModal = () => setIsCreateModalOpen(true);

   const handleCloseCreateModal = () => setIsCreateModalOpen(false);

   return (
      <>
         <Button variant='contained' onClick={handleOpenCreateModal}>
            {t("common.actions.create")}
         </Button>

         <CreateLeadModal
            open={isCreateModalOpen}
            onClose={handleCloseCreateModal}
         />
      </>
   );
}
