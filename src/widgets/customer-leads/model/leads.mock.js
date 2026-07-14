const mockRoutes = [
   {
      from_location: 'Казахстан, г Алматы',
      to_location: 'Казахстан, г Астана',
      route: {
         from: { lat: 43.238949, lng: 76.889709 },
         to: { lat: 51.169392, lng: 71.449074 },
      },
      customer: 'ТОО Almaty Trade',
      driver: 'Сулейменов Сырым',
   },
   {
      from_location: 'Казахстан, г Шымкент',
      to_location: 'Казахстан, г Караганда',
      route: {
         from: { lat: 42.341684, lng: 69.590101 },
         to: { lat: 49.806567, lng: 73.085953 },
      },
      customer: 'ТОО Shymkent Logistics',
      driver: 'Абдрахманов Нурлан',
   },
   {
      from_location: 'Казахстан, г Павлодар',
      to_location: 'Казахстан, г Костанай',
      route: {
         from: { lat: 52.287303, lng: 76.967402 },
         to: { lat: 53.219809, lng: 63.635423 },
      },
      customer: 'ТОО Pavlodar Plast',
      driver: 'Ибраев Ерлан',
   },
   {
      from_location: 'Казахстан, г Актобе',
      to_location: 'Казахстан, г Атырау',
      route: {
         from: { lat: 50.283933, lng: 57.166978 },
         to: { lat: 47.094495, lng: 51.923837 },
      },
      customer: 'ТОО Aktobe Supply',
      driver: 'Касымов Арман',
   },
   {
      from_location: 'Казахстан, г Усть-Каменогорск',
      to_location: 'Казахстан, г Семей',
      route: {
         from: { lat: 49.948267, lng: 82.627487 },
         to: { lat: 50.411111, lng: 80.2275 },
      },
      customer: 'ТОО East Cargo',
      driver: 'Мухамедьяров Азамат',
   },
   {
      from_location: 'Казахстан, г Тараз',
      to_location: 'Казахстан, г Кызылорда',
      route: {
         from: { lat: 42.899908, lng: 71.377914 },
         to: { lat: 44.848831, lng: 65.482268 },
      },
      customer: 'ТОО South Road',
      driver: 'Омаров Данияр',
   },
   {
      from_location: 'Казахстан, г Уральск',
      to_location: 'Казахстан, г Актобе',
      route: {
         from: { lat: 51.233333, lng: 51.366667 },
         to: { lat: 50.283933, lng: 57.166978 },
      },
      customer: 'ТОО West Trans',
      driver: 'Смагулов Руслан',
   },
   {
      from_location: 'Казахстан, г Петропавл',
      to_location: 'Казахстан, г Кокшетау',
      route: {
         from: { lat: 54.875285, lng: 69.162772 },
         to: { lat: 53.283333, lng: 69.383333 },
      },
      customer: 'ТОО North Delivery',
      driver: 'Нурпеисов Алихан',
   },
   {
      from_location: 'Казахстан, г Актау',
      to_location: 'Казахстан, г Атырау',
      route: {
         from: { lat: 43.653226, lng: 51.197456 },
         to: { lat: 47.094495, lng: 51.923837 },
      },
      customer: 'ТОО Caspian Freight',
      driver: 'Тлеубердиев Мирас',
   },
   {
      from_location: 'Казахстан, г Туркестан',
      to_location: 'Казахстан, г Алматы',
      route: {
         from: { lat: 43.29733, lng: 68.25175 },
         to: { lat: 43.238949, lng: 76.889709 },
      },
      customer: 'ТОО Turkestan Market',
      driver: 'Жумабаев Самат',
   },
   {
      from_location: 'Казахстан, г Алматы',
      to_location: 'Казахстан, г Костанай',
      route: {
         from: { lat: 43.238949, lng: 76.889709 },
         to: { lat: 53.219809, lng: 63.635423 },
      },
      customer: 'ТОО Mega Build',
      driver: 'Айтбаев Тимур',
   },
   {
      from_location: 'Казахстан, г Астана',
      to_location: 'Казахстан, г Павлодар',
      route: {
         from: { lat: 51.169392, lng: 71.449074 },
         to: { lat: 52.287303, lng: 76.967402 },
      },
      customer: 'ТОО Capital Delivery',
      driver: 'Сериков Марат',
   },
   {
      from_location: 'Казахстан, г Караганда',
      to_location: 'Казахстан, г Алматы',
      route: {
         from: { lat: 49.806567, lng: 73.085953 },
         to: { lat: 43.238949, lng: 76.889709 },
      },
      customer: 'ТОО Karaganda Metal',
      driver: 'Есенов Бауыржан',
   },
   {
      from_location: 'Казахстан, г Атырау',
      to_location: 'Казахстан, г Уральск',
      route: {
         from: { lat: 47.094495, lng: 51.923837 },
         to: { lat: 51.233333, lng: 51.366667 },
      },
      customer: 'ТОО Oil Region Logistics',
      driver: 'Мусин Артем',
   },
   {
      from_location: 'Казахстан, г Актау',
      to_location: 'Казахстан, г Актобе',
      route: {
         from: { lat: 43.653226, lng: 51.197456 },
         to: { lat: 50.283933, lng: 57.166978 },
      },
      customer: 'ТОО Mangystau Cargo',
      driver: 'Назаров Руслан',
   },
   {
      from_location: 'Казахстан, г Кызылорда',
      to_location: 'Казахстан, г Шымкент',
      route: {
         from: { lat: 44.848831, lng: 65.482268 },
         to: { lat: 42.341684, lng: 69.590101 },
      },
      customer: 'ТОО Kyzylorda Food',
      driver: 'Абилов Ермек',
   },
   {
      from_location: 'Казахстан, г Семей',
      to_location: 'Казахстан, г Павлодар',
      route: {
         from: { lat: 50.411111, lng: 80.2275 },
         to: { lat: 52.287303, lng: 76.967402 },
      },
      customer: 'ТОО Semey Export',
      driver: 'Кенжебеков Али',
   },
   {
      from_location: 'Казахстан, г Кокшетау',
      to_location: 'Казахстан, г Астана',
      route: {
         from: { lat: 53.283333, lng: 69.383333 },
         to: { lat: 51.169392, lng: 71.449074 },
      },
      customer: 'ТОО Kokshe Grain',
      driver: 'Рахимов Ержан',
   },
   {
      from_location: 'Казахстан, г Петропавл',
      to_location: 'Казахстан, г Караганда',
      route: {
         from: { lat: 54.875285, lng: 69.162772 },
         to: { lat: 49.806567, lng: 73.085953 },
      },
      customer: 'ТОО North Agro',
      driver: 'Турсунов Асхат',
   },
   {
      from_location: 'Казахстан, г Туркестан',
      to_location: 'Казахстан, г Тараз',
      route: {
         from: { lat: 43.29733, lng: 68.25175 },
         to: { lat: 42.899908, lng: 71.377914 },
      },
      customer: 'ТОО Turkestan Textile',
      driver: 'Садыков Арсен',
   },
   {
      from_location: 'Казахстан, г Алматы',
      to_location: 'Казахстан, г Шымкент',
      route: {
         from: { lat: 43.238949, lng: 76.889709 },
         to: { lat: 42.341684, lng: 69.590101 },
      },
      customer: 'ТОО Fresh Market',
      driver: 'Жаксылыков Нурбек',
   },
   {
      from_location: 'Казахстан, г Астана',
      to_location: 'Казахстан, г Костанай',
      route: {
         from: { lat: 51.169392, lng: 71.449074 },
         to: { lat: 53.219809, lng: 63.635423 },
      },
      customer: 'ТОО Astana Retail',
      driver: 'Исабаев Канат',
   },
   {
      from_location: 'Казахстан, г Караганда',
      to_location: 'Казахстан, г Усть-Каменогорск',
      route: {
         from: { lat: 49.806567, lng: 73.085953 },
         to: { lat: 49.948267, lng: 82.627487 },
      },
      customer: 'ТОО Central Mining',
      driver: 'Молдабеков Адилет',
   },
   {
      from_location: 'Казахстан, г Павлодар',
      to_location: 'Казахстан, г Семей',
      route: {
         from: { lat: 52.287303, lng: 76.967402 },
         to: { lat: 50.411111, lng: 80.2275 },
      },
      customer: 'ТОО Irtysh Cargo',
      driver: 'Оразбаев Дамир',
   },
   {
      from_location: 'Казахстан, г Актобе',
      to_location: 'Казахстан, г Уральск',
      route: {
         from: { lat: 50.283933, lng: 57.166978 },
         to: { lat: 51.233333, lng: 51.366667 },
      },
      customer: 'ТОО Aktobe Oil Service',
      driver: 'Бекенов Саян',
   },
   {
      from_location: 'Казахстан, г Атырау',
      to_location: 'Казахстан, г Актау',
      route: {
         from: { lat: 47.094495, lng: 51.923837 },
         to: { lat: 43.653226, lng: 51.197456 },
      },
      customer: 'ТОО Caspian Oil',
      driver: 'Кудайбергенов Ислам',
   },
   {
      from_location: 'Казахстан, г Костанай',
      to_location: 'Казахстан, г Петропавл',
      route: {
         from: { lat: 53.219809, lng: 63.635423 },
         to: { lat: 54.875285, lng: 69.162772 },
      },
      customer: 'ТОО Kostanay Agro',
      driver: 'Абдиев Алмас',
   },
   {
      from_location: 'Казахстан, г Кызылорда',
      to_location: 'Казахстан, г Туркестан',
      route: {
         from: { lat: 44.848831, lng: 65.482268 },
         to: { lat: 43.29733, lng: 68.25175 },
      },
      customer: 'ТОО Syr Darya Trade',
      driver: 'Смагулов Елдос',
   },
   {
      from_location: 'Казахстан, г Тараз',
      to_location: 'Казахстан, г Алматы',
      route: {
         from: { lat: 42.899908, lng: 71.377914 },
         to: { lat: 43.238949, lng: 76.889709 },
      },
      customer: 'ТОО Taraz Cement',
      driver: 'Ким Роман',
   },
   {
      from_location: 'Казахстан, г Усть-Каменогорск',
      to_location: 'Казахстан, г Кокшетау',
      route: {
         from: { lat: 49.948267, lng: 82.627487 },
         to: { lat: 53.283333, lng: 69.383333 },
      },
      customer: 'ТОО Altai Supply',
      driver: 'Нурмагамбетов Ермек',
   },
   {
      from_location: 'Казахстан, г Астана',
      to_location: 'Казахстан, г Шымкент',
      route: {
         from: { lat: 51.169392, lng: 71.449074 },
         to: { lat: 42.341684, lng: 69.590101 },
      },
      customer: 'ТОО Qazaq Distribution',
      driver: 'Ахметов Самир',
   },
   {
      from_location: 'Казахстан, г Алматы',
      to_location: 'Казахстан, г Усть-Каменогорск',
      route: {
         from: { lat: 43.238949, lng: 76.889709 },
         to: { lat: 49.948267, lng: 82.627487 },
      },
      customer: 'ТОО Techno Supply',
      driver: 'Мамытов Ринат',
   },
   {
      from_location: 'Казахстан, г Караганда',
      to_location: 'Казахстан, г Актобе',
      route: {
         from: { lat: 49.806567, lng: 73.085953 },
         to: { lat: 50.283933, lng: 57.166978 },
      },
      customer: 'ТОО Industrial Parts',
      driver: 'Хасенов Мурат',
   },
   {
      from_location: 'Казахстан, г Павлодар',
      to_location: 'Казахстан, г Кокшетау',
      route: {
         from: { lat: 52.287303, lng: 76.967402 },
         to: { lat: 53.283333, lng: 69.383333 },
      },
      customer: 'ТОО Pavlodar Energy',
      driver: 'Иманбаев Сакен',
   },
   {
      from_location: 'Казахстан, г Уральск',
      to_location: 'Казахстан, г Атырау',
      route: {
         from: { lat: 51.233333, lng: 51.366667 },
         to: { lat: 47.094495, lng: 51.923837 },
      },
      customer: 'ТОО Oral Trans',
      driver: 'Габдуллин Тимур',
   },
   {
      from_location: 'Казахстан, г Актау',
      to_location: 'Казахстан, г Кызылорда',
      route: {
         from: { lat: 43.653226, lng: 51.197456 },
         to: { lat: 44.848831, lng: 65.482268 },
      },
      customer: 'ТОО West Food',
      driver: 'Махамбетов Ербол',
   },
   {
      from_location: 'Казахстан, г Семей',
      to_location: 'Казахстан, г Петропавл',
      route: {
         from: { lat: 50.411111, lng: 80.2275 },
         to: { lat: 54.875285, lng: 69.162772 },
      },
      customer: 'ТОО Semey Wood',
      driver: 'Ергалиев Артур',
   },
   {
      from_location: 'Казахстан, г Туркестан',
      to_location: 'Казахстан, г Караганда',
      route: {
         from: { lat: 43.29733, lng: 68.25175 },
         to: { lat: 49.806567, lng: 73.085953 },
      },
      customer: 'ТОО Turkestan Agro',
      driver: 'Мырзахметов Данияр',
   },
   {
      from_location: 'Казахстан, г Тараз',
      to_location: 'Казахстан, г Шымкент',
      route: {
         from: { lat: 42.899908, lng: 71.377914 },
         to: { lat: 42.341684, lng: 69.590101 },
      },
      customer: 'ТОО Zhambyl Cargo',
      driver: 'Оспанов Ержан',
   },
   {
      from_location: 'Казахстан, г Кокшетау',
      to_location: 'Казахстан, г Костанай',
      route: {
         from: { lat: 53.283333, lng: 69.383333 },
         to: { lat: 53.219809, lng: 63.635423 },
      },
      customer: 'ТОО Steppe Logistics',
      driver: 'Серикбаев Нурсултан',
   },
];

const mockLeadStatuses = [
   'new',
   'add_driver',
   'start_driver',
   'loading',
   'in_progress',
   'unloading',
   'finished',
   'cancelled',
   'unknown_backend_status',
];

export const mockLeads = Array.from({ length: 60 }, (_, index) => {
   const mockRoute = mockRoutes[index % mockRoutes.length];
   const status = mockLeadStatuses[index % mockLeadStatuses.length];

   return {
      status,
      id: `mock-lead-${index + 1}`,
      num: index + 1,

      created_at: {
         date: '2026-05-19 05:16:24.059000',
         timezone_type: 3,
         timezone: 'UTC',
      },

      driver: mockRoute.driver,
      summ: index % 4 === 0 ? 0 : 150000 + index * 5000,
      currency: 'KZT',
      transportation_price: index % 4 === 0 ? 0 : 100000 + index * 3000,
      vat: 'с НДС',

      from_location: mockRoute.from_location,
      to_location: mockRoute.to_location,

      route: mockRoute.route,

      gsm: false,
      customer: mockRoute.customer,

      cargo: {
         description: `Груз заявки #${33249585 + index} Не указан`,
         context: null,
         weight_kg: index % 5 === 0 ? 0 : 500 + index * 50,
         type: index % 2 === 0 ? 'Не указан' : 'Оборудование',
         volume_cm: null,
      },
   };
});
