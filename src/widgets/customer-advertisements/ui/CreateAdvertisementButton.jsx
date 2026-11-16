import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import { CreateAdvertisementModal } from './CreateAdvertisementModal';

export function CreateAdvertisementButton() {
   const { t } = useTranslation();

   const [isModalOpen, setIsModalOpen] = useState(false);

   return (
      <>
         <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setIsModalOpen(true)}
         >
            {t('advertisements.create.button')}
         </Button>

         <CreateAdvertisementModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
         />
      </>
   );
}
