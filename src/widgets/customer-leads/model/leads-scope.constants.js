// Which slice of the orders list is shown: every order, or only the ones still
// in progress. Backed by two endpoints — see leadsEndpointsByScope in leads.api.
export const leadsScopes = {
   ALL: 'all',
   ACTIVE: 'active',
};
