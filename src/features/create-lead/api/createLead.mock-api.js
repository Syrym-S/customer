export async function createLeadMock(payload) {
   return {
      id: `mock-lead-${Date.now()}`,
      ...payload,
   };
}
