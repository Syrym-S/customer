import { useCallback } from 'react';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { PageContainer } from '../../shared/ui/PageContainer';
import {
   ALL_MANUFACTURERS_VALUE,
   ManufacturerLeadsTab,
} from '../../widgets/customer-manufacturers/ui/ManufacturerLeadsTab';
import { ManufacturerLinksTab } from '../../widgets/customer-manufacturers/ui/ManufacturerLinksTab';
import { useMyManufacturers } from '../../widgets/customer-manufacturers/model/useManufacturers';
import { useLeadsPool } from '../../widgets/customer-manufacturers/model/useLeadsPool';

const TABS = {
   LEADS: 'leads',
   MANUFACTURERS: 'manufacturers',
};

function getActiveTab(searchParams) {
   return searchParams.get('tab') === TABS.MANUFACTURERS
      ? TABS.MANUFACTURERS
      : TABS.LEADS;
}

export function ManufacturersPage() {
   const [searchParams, setSearchParams] = useSearchParams();

   const {
      manufacturers,
      isLoading: isManufacturersLoading,
      error: manufacturersError,
      reloadManufacturers,
   } = useMyManufacturers();

   const {
      leads,
      isLoading: isLeadsLoading,
      error: leadsError,
      reloadLeads,
   } = useLeadsPool();

   const activeTab = getActiveTab(searchParams);
   const manufacturerFilter =
      searchParams.get('manufacturer') || ALL_MANUFACTURERS_VALUE;

   const updateParams = useCallback(
      (nextTab, nextManufacturerId) => {
         const nextParams = {};

         if (nextTab !== TABS.LEADS) {
            nextParams.tab = nextTab;
         }

         if (nextManufacturerId && nextManufacturerId !== ALL_MANUFACTURERS_VALUE) {
            nextParams.manufacturer = nextManufacturerId;
         }

         setSearchParams(nextParams);
      },
      [setSearchParams],
   );

   function handleTabChange(_, nextTab) {
      updateParams(nextTab, manufacturerFilter);
   }

   function handleManufacturerFilterChange(nextManufacturerId) {
      updateParams(TABS.LEADS, nextManufacturerId);
   }

   function handleOpenManufacturerLeads(manufacturerId) {
      updateParams(TABS.LEADS, manufacturerId);
   }

   return (
      <PageContainer>
         <Stack spacing={3}>
            <Box>
               <Typography variant="h6" fontWeight={600}>
                  Производители
               </Typography>

               <Typography color="text.secondary" fontSize={14}>
                  Привязка производителей к перевозкам и список своих производителей
               </Typography>
            </Box>

            <Tabs
               value={activeTab}
               onChange={handleTabChange}
               variant="scrollable"
               scrollButtons="auto"
               sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
            >
               <Tab value={TABS.LEADS} label="Привязка перевозок" />

               <Tab value={TABS.MANUFACTURERS} label="Привязка с производителем" />
            </Tabs>

            {activeTab === TABS.LEADS ? (
               <ManufacturerLeadsTab
                  leads={leads}
                  isLoading={isLeadsLoading}
                  error={leadsError}
                  reloadLeads={reloadLeads}
                  manufacturerOptions={manufacturers}
                  manufacturerFilter={manufacturerFilter}
                  onManufacturerFilterChange={handleManufacturerFilterChange}
               />
            ) : (
               <ManufacturerLinksTab
                  manufacturers={manufacturers}
                  isLoading={isManufacturersLoading || isLeadsLoading}
                  error={manufacturersError || leadsError}
                  leads={leads}
                  reloadManufacturers={reloadManufacturers}
                  reloadLeads={reloadLeads}
                  onOpenManufacturerLeads={handleOpenManufacturerLeads}
               />
            )}
         </Stack>
      </PageContainer>
   );
}
