import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";

import { TenderCard } from "./TenderCard";
import { TenderDetailsModal } from "./TenderDetailsModal";
import { useTendersContext } from "../model/useTendersContext";
import { TendersPagination } from "./TendersPagination";

// const mockTendersById = {
//    1001: {
//       status: 'active',
//       type: 'forwarder',
//       publication_type: 'public',
//       planningType: 'planned',
//       public_date_time: '2026-06-13T09:00:00+05:00',
//       endDateTime: '2026-06-20T18:00:00+05:00',
//       max_participants: 10,
//       participants_count: 6,
//       bets_count: 5,

//       from_location: 'Казахстан, г Алматы',
//       to_location: 'Казахстан, г Астана',
//       from_point: [43.238949, 76.889709],
//       to_point: [51.160522, 71.470356],

//       cargo: {
//          weight_kg: 18500,
//          type: 'Паллеты',
//          description:
//             'Продукты питания на паллетах. Требуется тентованный транспорт, аккуратная фиксация груза и доставка без нарушения упаковки.',
//       },
//       summ: 450000,
//       currency: 'KZT',
//       vat: 'без НДС',

//       participants: [
//          {
//             type: 'forwarder',
//             date: '2026-06-13T11:20:00+05:00',
//             participant_id: '64f1a2b3c4d5e6f7a8b9c0d2',
//             name: 'ТОО Fast Logistics',
//          },
//          {
//             type: 'forwarder',
//             date: '2026-06-13T14:10:00+05:00',
//             participant_id: '64f1a2b3c4d5e6f7a8b9c0d3',
//             name: 'ТОО Almaty Freight',
//          },
//          {
//             type: 'forwarder',
//             date: '2026-06-14T09:35:00+05:00',
//             participant_id: '64f1a2b3c4d5e6f7a8b9c0d4',
//             name: 'ИП Jet Logistic',
//          },
//          {
//             type: 'forwarder',
//             date: '2026-06-14T12:45:00+05:00',
//             participant_id: '64f1a2b3c4d5e6f7a8b9c0d5',
//             name: 'ТОО Nomad Cargo',
//          },
//          {
//             type: 'forwarder',
//             date: '2026-06-15T10:05:00+05:00',
//             participant_id: '64f1a2b3c4d5e6f7a8b9c0d6',
//             name: 'ТОО QazTrans Route',
//          },
//          {
//             type: 'forwarder',
//             date: '2026-06-15T16:30:00+05:00',
//             participant_id: '64f1a2b3c4d5e6f7a8b9c0d7',
//             name: 'ИП Road Partner',
//          },
//       ],

//       bets: [
//          {
//             amount: 455000,
//             status: 'closed',
//             comment:
//                'Готовы забрать груз завтра утром. Машина тентованная, 20 тонн.',
//             currency: 'KZT',
//             participant_id: '64f1a2b3c4d5e6f7a8b9c0d2',
//             participant_name: 'ТОО Fast Logistics',
//          },
//          {
//             amount: 448000,
//             status: 'new',
//             comment: 'Можем подать машину сегодня после 18:00.',
//             currency: 'KZT',
//             participant_id: '64f1a2b3c4d5e6f7a8b9c0d3',
//             participant_name: 'ТОО Almaty Freight',
//          },
//          {
//             amount: 462000,
//             status: 'new',
//             comment:
//                'Цена включает подачу транспорта и сопровождение погрузки.',
//             currency: 'KZT',
//             participant_id: '64f1a2b3c4d5e6f7a8b9c0d4',
//             participant_name: 'ИП Jet Logistic',
//          },
//          {
//             amount: 440000,
//             status: 'new',
//             comment: 'Готовы выполнить рейс без догруза, доставка до склада.',
//             currency: 'KZT',
//             participant_id: '64f1a2b3c4d5e6f7a8b9c0d5',
//             participant_name: 'ТОО Nomad Cargo',
//          },
//          {
//             amount: 470000,
//             status: 'new',
//             comment:
//                'Подача машины возможна через 2 дня, цена с учётом простоев.',
//             currency: 'KZT',
//             participant_id: '64f1a2b3c4d5e6f7a8b9c0d6',
//             participant_name: 'ТОО QazTrans Route',
//          },
//       ],
//    },
// };

export function TendersList() {
   const { tenders, page, setPage, perPage, count, isLoading, error } =
      useTendersContext();

   const pagesCount = Math.max(1, Math.ceil(count / perPage));

   function handlePageChange(_, value) {
      setPage(value);
   }

   return (
      <Box
         sx={{
            maxWidth: 640,
            mx: "auto",
            mt: 4,
         }}
      >
         {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
               {error}
            </Alert>
         )}

         {isLoading && (
            <Box
               sx={{
                  py: 4,
                  display: "flex",
                  justifyContent: "center",
               }}
            >
               <CircularProgress size={32} />
            </Box>
         )}

         {!isLoading && !error && tenders.length === 0 && (
            <Typography
               color="text.secondary"
               sx={{
                  py: 4,
                  textAlign: "center",
               }}
            >
               Тендеры не найдены
            </Typography>
         )}

         {!isLoading && !error && tenders.length > 0 && (
            <>
               <Stack spacing={2}>
                  {tenders.map((tender) => (
                     <TenderCard key={tender.id} tender={tender} />
                  ))}
               </Stack>
               <TendersPagination
                  page={page}
                  count={pagesCount}
                  onChange={handlePageChange}
               />
            </>
         )}

         <TenderDetailsModal />
      </Box>
   );
}
