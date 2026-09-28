import { leadTransportationFields } from '../model/lead-transportation.helpers';

const mockLeadParams = {
   [leadTransportationFields.loadingType]: [
      { id: 1, name: 'Задняя' },
      { id: 2, name: 'Боковая' },
      { id: 3, name: 'Верхняя' },
      { id: 4, name: 'Верхняя+Боковая' },
   ],
   [leadTransportationFields.packagingType]: [
      { id: 1, name: 'Коробка' },
      { id: 2, name: 'Паллета' },
      { id: 3, name: 'Биг-бэг' },
      { id: 4, name: 'Без упаковки' },
   ],
   [leadTransportationFields.compositionType]: [
      { id: 1, name: 'Тент' },
      { id: 2, name: 'Трал' },
      { id: 3, name: 'Открытая' },
      { id: 4, name: 'Спец. техника' },
      { id: 5, name: 'Рефрижератор' },
   ],
   [leadTransportationFields.transportType]: [
      { id: 1, name: 'Грузовой авто без прицепа' },
      { id: 2, name: 'Полуприцеп открытый' },
      { id: 3, name: 'Полуприцеп тент' },
      { id: 4, name: 'Полуприцеп закрытый' },
   ],
};

export async function fetchLeadParamsMock() {
   return mockLeadParams;
}
