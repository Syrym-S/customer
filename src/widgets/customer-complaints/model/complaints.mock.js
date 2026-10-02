import { mockLeads } from '../../customer-leads/model/leads.mock';

// Self-contained mock factoring deals used only by the complaints widget
// (target picker options + resolving an existing complaint's factoring
// target label). customer-factorings has no isMockApi mock-api layer of
// its own (factorings.api.js always hits the real backend), so there is
// no shared mock factoring dataset to pull from — this list exists only
// here and is never exposed outside customer-complaints.
function daysAgoIso(days, hours = 9, minutes = 0) {
   const date = new Date();

   date.setDate(date.getDate() - days);
   date.setHours(hours, minutes, 0, 0);

   return date.toISOString();
}

export const mockComplaintFactoringRefs = [
   {
      id: 'mock-factoring-1',
      company_name: 'ТОО FinTrust Factor',
      deb_summ: 4200000,
      currency: 'KZT',
      created_at: daysAgoIso(3),
   },
   {
      id: 'mock-factoring-2',
      company_name: 'АО Capital Finance',
      deb_summ: 1850000,
      currency: 'KZT',
      created_at: daysAgoIso(11),
   },
   {
      id: 'mock-factoring-3',
      company_name: 'ТОО Qazaq Factor',
      deb_summ: 980000,
      currency: 'KZT',
      created_at: daysAgoIso(22),
   },
   {
      id: 'mock-factoring-4',
      company_name: 'ТОО Silk Road Factoring',
      deb_summ: 6300000,
      currency: 'KZT',
      created_at: daysAgoIso(55),
   },
   {
      id: 'mock-factoring-5',
      company_name: 'АО National Factor Group',
      deb_summ: 2750000,
      currency: 'KZT',
      created_at: daysAgoIso(70),
   },
];

function leadTarget(index) {
   const lead = mockLeads[index % mockLeads.length];

   return { type: 'lead', id: lead.id };
}

function factoringTarget(index) {
   const factoring =
      mockComplaintFactoringRefs[index % mockComplaintFactoringRefs.length];

   return { type: 'factoring', id: factoring.id };
}

function buildComplaint({
   index,
   daysAgo,
   finalStatus,
   request,
   response,
   target,
   hasFiles,
   acceptedDaysAgo,
   finaledDaysAgo,
}) {
   const createdAt = daysAgoIso(daysAgo, 10, index);
   const updatedAt =
      finaledDaysAgo !== undefined
         ? daysAgoIso(finaledDaysAgo, 12, index)
         : acceptedDaysAgo !== undefined
           ? daysAgoIso(acceptedDaysAgo, 12, index)
           : createdAt;

   return {
      id: `mock-complaint-${index + 1}`,
      final_status: finalStatus,
      request,
      response: response ?? null,
      files: hasFiles
         ? [
              {
                 id: `mock-complaint-${index + 1}-file-1`,
                 url: '#',
                 filename: 'photo_cargo.jpg',
                 mime_type: 'image/jpeg',
                 size: 2_400_000,
              },
           ]
         : [],
      created_at: createdAt,
      updated_at: updatedAt,
      acceptance_at:
         acceptedDaysAgo !== undefined ? daysAgoIso(acceptedDaysAgo, 11, index) : null,
      finaled_at:
         finaledDaysAgo !== undefined ? daysAgoIso(finaledDaysAgo, 12, index) : null,
      creator_id: null, // resolved to the current user at seed time, see mockComplaints below
      target: target ?? null,
   };
}

const complaintSeeds = [
   {
      daysAgo: 1,
      finalStatus: null,
      request: 'Водитель приехал на 4 часа позже заявленного времени погрузки, груз простоял без охраны.',
      target: leadTarget(0),
      hasFiles: true,
   },
   {
      daysAgo: 3,
      finalStatus: null,
      request: 'Не могу открыть договор факторинга в личном кабинете, страница выдает ошибку.',
      target: factoringTarget(0),
   },
   {
      daysAgo: 5,
      finalStatus: 'completed',
      request: 'Груз был доставлен поврежденным, упаковка нарушена, часть товара испорчена водой.',
      response: 'Претензия рассмотрена, компенсация по договору перевозки согласована, подробности отправлены на почту.',
      target: leadTarget(5),
      hasFiles: true,
      acceptedDaysAgo: 4,
      finaledDaysAgo: 1,
   },
   {
      daysAgo: 6,
      finalStatus: null,
      request: 'Экспедитор не отвечает на звонки уже третий день, срочно нужна информация по заявке.',
      target: leadTarget(11),
      acceptedDaysAgo: 5,
   },
   {
      daysAgo: 8,
      finalStatus: 'rejected',
      request: 'Прошу пересчитать сумму факторинга — по моим расчетам комиссия указана неверно.',
      response: 'Проверка показала, что комиссия рассчитана верно согласно условиям договора. Жалоба отклонена.',
      target: factoringTarget(1),
      acceptedDaysAgo: 7,
      finaledDaysAgo: 2,
   },
   {
      daysAgo: 10,
      finalStatus: null,
      request: 'Не пришло уведомление о статусе рейса, хотя по трекингу груз уже должен быть на месте.',
      target: leadTarget(18),
   },
   {
      daysAgo: 14,
      finalStatus: 'completed',
      request: 'Водитель запросил дополнительную оплату наличными сверх указанной в заявке суммы.',
      response: 'По результатам служебной проверки водителю вынесено предупреждение, перерасчет не требуется.',
      target: leadTarget(24),
      acceptedDaysAgo: 13,
      finaledDaysAgo: 9,
   },
   {
      daysAgo: 17,
      finalStatus: null,
      request: 'Хочу уточнить причину задержки платежа по факторинговой сделке.',
      target: factoringTarget(2),
      hasFiles: true,
   },
   {
      daysAgo: 20,
      finalStatus: 'rejected',
      request: 'Считаю, что груз был принят без проверки веса, прошу пересмотреть акт приема-передачи.',
      response: 'Акт приема-передачи подписан обеими сторонами без замечаний, основания для пересмотра отсутствуют.',
      target: leadTarget(31),
      acceptedDaysAgo: 19,
      finaledDaysAgo: 15,
   },
   {
      daysAgo: 26,
      finalStatus: null,
      request: 'Общий вопрос по работе личного кабинета, не связанный с конкретной перевозкой.',
      target: null,
   },
   {
      daysAgo: 29,
      finalStatus: 'completed',
      request: 'Транспортное средство не соответствовало заявленным характеристикам в заявке.',
      response: 'Подтверждено несоответствие, экспедитору направлено требование об устранении.',
      target: leadTarget(40),
      acceptedDaysAgo: 28,
      finaledDaysAgo: 24,
   },
   {
      daysAgo: 38,
      finalStatus: 'completed',
      request: 'Жалоба за пределами 30 дней — должна отсутствовать в списке «за последние 30 дней».',
      response: 'Рассмотрено и закрыто.',
      target: factoringTarget(3),
      acceptedDaysAgo: 37,
      finaledDaysAgo: 33,
   },
   {
      daysAgo: 45,
      finalStatus: 'rejected',
      request: 'Еще одна старая жалоба для проверки границы окна в 30 дней.',
      response: 'Жалоба отклонена по итогам проверки.',
      target: leadTarget(45),
      acceptedDaysAgo: 44,
      finaledDaysAgo: 40,
   },
];

export const mockComplaints = complaintSeeds.map((seed, index) =>
   buildComplaint({ index, ...seed }),
);
