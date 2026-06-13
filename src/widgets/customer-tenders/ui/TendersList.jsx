import { Alert, Box, Stack, Typography } from '@mui/material';

import { TenderCard } from './TenderCard';
import { TenderDetailsModal } from './TenderDetailsModal';

const mockTendersById = {
   1001: {
      status: 'active',
      type: 'forwarder',
      publication_type: 'public',
      planningType: 'planned',
      public_date_time: '2026-06-13T09:00:00+05:00',
      endDateTime: '2026-06-20T18:00:00+05:00',
      max_participants: 10,
      participants_count: 6,
      bets_count: 5,

      from_location: 'Казахстан, г Алматы',
      to_location: 'Казахстан, г Астана',
      from_point: [43.238949, 76.889709],
      to_point: [51.160522, 71.470356],

      cargo: {
         weight_kg: 18500,
         type: 'Паллеты',
         description:
            'Продукты питания на паллетах. Требуется тентованный транспорт, аккуратная фиксация груза и доставка без нарушения упаковки.',
      },
      summ: 450000,
      currency: 'KZT',
      vat: 'без НДС',

      participants: [
         {
            type: 'forwarder',
            date: '2026-06-13T11:20:00+05:00',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0d2',
            name: 'ТОО Fast Logistics',
         },
         {
            type: 'forwarder',
            date: '2026-06-13T14:10:00+05:00',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0d3',
            name: 'ТОО Almaty Freight',
         },
         {
            type: 'forwarder',
            date: '2026-06-14T09:35:00+05:00',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0d4',
            name: 'ИП Jet Logistic',
         },
         {
            type: 'forwarder',
            date: '2026-06-14T12:45:00+05:00',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0d5',
            name: 'ТОО Nomad Cargo',
         },
         {
            type: 'forwarder',
            date: '2026-06-15T10:05:00+05:00',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0d6',
            name: 'ТОО QazTrans Route',
         },
         {
            type: 'forwarder',
            date: '2026-06-15T16:30:00+05:00',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0d7',
            name: 'ИП Road Partner',
         },
      ],

      bets: [
         {
            amount: 455000,
            status: 'closed',
            comment:
               'Готовы забрать груз завтра утром. Машина тентованная, 20 тонн.',
            currency: 'KZT',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0d2',
            participant_name: 'ТОО Fast Logistics',
         },
         {
            amount: 448000,
            status: 'new',
            comment: 'Можем подать машину сегодня после 18:00.',
            currency: 'KZT',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0d3',
            participant_name: 'ТОО Almaty Freight',
         },
         {
            amount: 462000,
            status: 'new',
            comment:
               'Цена включает подачу транспорта и сопровождение погрузки.',
            currency: 'KZT',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0d4',
            participant_name: 'ИП Jet Logistic',
         },
         {
            amount: 440000,
            status: 'new',
            comment: 'Готовы выполнить рейс без догруза, доставка до склада.',
            currency: 'KZT',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0d5',
            participant_name: 'ТОО Nomad Cargo',
         },
         {
            amount: 470000,
            status: 'new',
            comment:
               'Подача машины возможна через 2 дня, цена с учётом простоев.',
            currency: 'KZT',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0d6',
            participant_name: 'ТОО QazTrans Route',
         },
      ],
   },

   1002: {
      status: 'closed',
      type: 'forwarder',
      publication_type: 'private',
      planningType: 'unplanned',
      public_date_time: '2026-06-08T08:00:00+05:00',
      endDateTime: '2026-06-12T18:00:00+05:00',
      max_participants: 8,
      participants_count: 5,
      bets_count: 5,

      from_location: 'Казахстан, г Шымкент',
      to_location: 'Казахстан, г Караганда',
      from_point: [42.341684, 69.590101],
      to_point: [49.806844, 73.085772],

      cargo: {
         weight_kg: 12000,
         type: 'Оборудование',
         description:
            'Промышленное оборудование в деревянной обрешетке. Нужна аккуратная погрузка, крепление ремнями и перевозка без перегруза.',
      },
      summ: 380000,
      currency: 'KZT',
      vat: 'с НДС',

      participants: [
         {
            type: 'forwarder',
            date: '2026-06-08T12:00:00+05:00',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0e1',
            name: 'ТОО Asia Cargo',
         },
         {
            type: 'forwarder',
            date: '2026-06-08T14:45:00+05:00',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0e2',
            name: 'ИП Trans Group',
         },
         {
            type: 'forwarder',
            date: '2026-06-09T10:10:00+05:00',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0e3',
            name: 'ТОО Nomad Logistic',
         },
         {
            type: 'forwarder',
            date: '2026-06-09T15:25:00+05:00',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0e4',
            name: 'ТОО Karaganda Express',
         },
         {
            type: 'forwarder',
            date: '2026-06-10T09:40:00+05:00',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0e5',
            name: 'ИП South Road',
         },
      ],

      bets: [
         {
            amount: 390000,
            status: 'loss',
            comment: 'Готовы были подать машину на следующий день.',
            currency: 'KZT',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0e1',
            participant_name: 'ТОО Asia Cargo',
         },
         {
            amount: 375000,
            status: 'winning',
            comment:
               'Машина находилась рядом с точкой загрузки. Забор груза в день подтверждения.',
            currency: 'KZT',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0e2',
            participant_name: 'ИП Trans Group',
         },
         {
            amount: 382000,
            status: 'loss',
            comment: 'Цена включает погрузку и сопровождение.',
            currency: 'KZT',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0e3',
            participant_name: 'ТОО Nomad Logistic',
         },
         {
            amount: 395000,
            status: 'loss',
            comment: 'Готовы были выполнить рейс без догруза.',
            currency: 'KZT',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0e4',
            participant_name: 'ТОО Karaganda Express',
         },
         {
            amount: 388000,
            status: 'loss',
            comment: 'Цена с НДС, подача транспорта утром.',
            currency: 'KZT',
            participant_id: '64f1a2b3c4d5e6f7a8b9c0e5',
            participant_name: 'ИП South Road',
         },
      ],
   },
};

export function TendersList() {
   const isLoading = false;
   const error = '';

   const tenders = Object.entries(mockTendersById).map(([id, tender]) => ({
      id,
      ...tender,
   }));

   return (
      <Box
         sx={{
            maxWidth: 640,
            mx: 'auto',
            mt: 4,
         }}
      >
         {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
               {error}
            </Alert>
         )}

         {!isLoading && !error && tenders.length === 0 && (
            <Typography
               color='text.secondary'
               sx={{
                  py: 4,
                  textAlign: 'center',
               }}
            >
               Тендеры не найдены
            </Typography>
         )}

         {!isLoading && !error && tenders.length > 0 && (
            <Stack spacing={2}>
               {tenders.map((tender) => (
                  <TenderCard key={tender.id} tender={tender} />
               ))}
            </Stack>
         )}

         <TenderDetailsModal />
      </Box>
   );
}
