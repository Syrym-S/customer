import { Button } from '@mui/material';
import { CreateLeadModal } from './CreateLeadModal';
import { useState } from 'react';

export function CreateLeadButton() {
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

   const handleOpenCreateModal = () => setIsCreateModalOpen(true);

   const handleCloseCreateModal = () => setIsCreateModalOpen(false);

   return (
      <>
         <Button variant='contained' onClick={handleOpenCreateModal}>
            Создать
         </Button>

         <CreateLeadModal
            open={isCreateModalOpen}
            onClose={handleCloseCreateModal}
         />
      </>
   );
}
