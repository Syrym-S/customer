import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from '@mui/material';

import { ComplaintForm } from './ComplaintForm';

export function ComplaintFormButton() {
   const { t } = useTranslation();

   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

   const handleOpenCreateModal = () => setIsCreateModalOpen(true);

   const handleCloseCreateModal = () => setIsCreateModalOpen(false);

   return (
      <>
         <Button variant="contained" onClick={handleOpenCreateModal}>
            {t("complaints.create.action")}
         </Button>

         <ComplaintForm open={isCreateModalOpen} onClose={handleCloseCreateModal} />
      </>
   );
}
