import { useState } from 'react';
import { Button } from '@mui/material';
import { CreateTenderModal } from './CreateTenderModal';

export function CreateTenderButton() {
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

   const handleOpenCreateModal = () => setIsCreateModalOpen(true);

   const handleCloseCreateModal = () => setIsCreateModalOpen(false);

   return (
      <>
         <Button variant='contained' onClick={handleOpenCreateModal}>
            Создать тендер
         </Button>

         <CreateTenderModal
            open={isCreateModalOpen}
            onClose={handleCloseCreateModal}
         />
      </>
   );
}
