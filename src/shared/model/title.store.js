import { create } from 'zustand';

// Дополнительные сегменты заголовка, которые регистрирует всё, что сейчас
// смонтировано над страницей (вкладка, модалка с деталями, шаг визарда) —
// с ключом, чтобы каждый регистрант мог убрать свой сегмент при
// размонтировании без влияния на соседей.
export const useTitleStore = create((set) => ({
   segments: {},

   setSegment: (key, label, order = 1) =>
      set((state) => ({
         segments: { ...state.segments, [key]: { label, order } },
      })),

   removeSegment: (key) =>
      set((state) => {
         if (!(key in state.segments)) return state;
         const segments = { ...state.segments };
         delete segments[key];
         return { segments };
      }),
}));
