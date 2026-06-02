import { Button } from '@mui/material';
import { CreateRouteModal } from './CreateRouteModal';
import { useState } from 'react';

export function CreateRouteButton() {
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

   const handleOpenCreateModal = () => setIsCreateModalOpen(true);

   const handleCloseCreateModal = () => setIsCreateModalOpen(false);

   return (
      <>
         <Button variant='contained' onClick={handleOpenCreateModal}>
            Создать
         </Button>

         <CreateRouteModal
            open={isCreateModalOpen}
            onClose={handleCloseCreateModal}
         />
      </>
   );
}
