import { useState } from 'react';
import { Button } from '@mui/material';

import { ComplaintForm } from './ComplaintForm';

export function ComplaintFormButton() {
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

   const handleOpenCreateModal = () => setIsCreateModalOpen(true);

   const handleCloseCreateModal = () => setIsCreateModalOpen(false);

   return (
      <>
         <Button variant="contained" onClick={handleOpenCreateModal}>
            Подать жалобу
         </Button>

         <ComplaintForm open={isCreateModalOpen} onClose={handleCloseCreateModal} />
      </>
   );
}
