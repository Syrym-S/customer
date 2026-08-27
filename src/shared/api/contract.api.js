// TODO(backend): replace mock body with a real request once the contract-status
// endpoint exists, e.g.:
//   const response = await apiClient.get('/contracts/v1/status');
//   return { hasValidContract: Boolean(response.data?.has_valid_contract) };
// Keep the function signature and return shape (`{ hasValidContract: boolean }`)
// unchanged so callers don't need to change.

const MOCK_CONTRACT_SIGNED_KEY = 'mock_contract_signed';
const MOCK_DELAY_MIN_MS = 200;
const MOCK_DELAY_MAX_MS = 300;

function readMockContractSigned() {
   return localStorage.getItem(MOCK_CONTRACT_SIGNED_KEY) === 'true';
}

function wait(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function checkContractStatus() {
   await wait(
      MOCK_DELAY_MIN_MS + Math.random() * (MOCK_DELAY_MAX_MS - MOCK_DELAY_MIN_MS),
   );

   return { hasValidContract: readMockContractSigned() };
}
