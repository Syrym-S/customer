import { Box } from '@mui/material';
import PropTypes from 'prop-types';

import { InfoBadge } from '../components/InfoBadge';
import { StepSection } from '../components/StepSection';

export function ConfirmStep({ form }) {
   const selectedForwarder = form.forwarder;

   return (
      <Box sx={{ display: 'grid', gap: 2 }}>
         <StepSection title='Проверьте данные'>
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     sm: '1fr 1fr',
                  },
                  gap: 1,
               }}
            >
               <InfoBadge label='Откуда' value={form.fromLocation} />

               <InfoBadge label='Куда' value={form.toLocation} />

               <InfoBadge label='Дата загрузки' value={form.loadingDate} />

               <InfoBadge label='Тип груза' value={form.cargoType} />

               <InfoBadge label='Вес' value={`${form.weightKg} кг`} />

               <InfoBadge
                  label='Размеры'
                  value={`${form.cargoLengthCm} × ${form.cargoWidthCm} × ${form.cargoHeightCm} см`}
               />

               <InfoBadge
                  label='Цена'
                  value={`${form.price} ${form.currency}`}
                  accent
               />
            </Box>
         </StepSection>

         <StepSection title='Экспедитор'>
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     sm: 'repeat(2, 1fr)',
                  },
                  gap: 1.5,
               }}
            >
               <InfoBadge
                  label='ФИО экспедитора'
                  value={selectedForwarder?.fullName || 'Не выбран'}
               />
               <InfoBadge
                  label='ИИН экспедитора'
                  value={selectedForwarder?.iin || '—'}
               />
               <InfoBadge
                  label='Компания'
                  value={selectedForwarder?.companyName || '—'}
               />
               <InfoBadge
                  label='БИН компании'
                  value={selectedForwarder?.companyBin || '—'}
               />
               <InfoBadge
                  label='Телефон'
                  value={selectedForwarder?.phone || '—'}
               />
            </Box>
         </StepSection>

         <StepSection title='Документы'>
            {form.documents?.length ? (
               <Box
                  sx={{
                     display: 'grid',
                     gap: 1,
                  }}
               >
                  {form.documents.map((document) => (
                     <InfoBadge
                        key={document.id}
                        label={document.name || 'Документ'}
                        value={document.fileName || 'Файл'}
                     />
                  ))}
               </Box>
            ) : (
               <InfoBadge label='Документы' value='Не добавлены' />
            )}
         </StepSection>
      </Box>
   );
}

ConfirmStep.propTypes = {
   form: PropTypes.object.isRequired,
};
