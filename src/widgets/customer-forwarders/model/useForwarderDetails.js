import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { fetchForwarderById } from '../../../features/create-lead/api/forwarders.api';
import { getForwarderLeads } from './forwarders.helpers';
import {
    FORWARDER_LEADS_PER_PAGE,
    getForwarderLeadsPage,
    mapForwarderLeads,
    normalizeForwarderLeadsPagination,
} from './forwarder-leads.helpers';

export function useForwarderDetails({ forwarderId, enabled, initialForwarder }) {
    const { t } = useTranslation();

    const [forwarder, setForwarder] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(false);
    const [error, setError] = useState('');

    const requestIdRef = useRef(0);

    const loadForwarder = useCallback(
        async (nextPage) => {
            const requestId = ++requestIdRef.current;

            try {
                setError('');

                if (nextPage === 1) {
                    setIsDetailsLoading(true);
                } else {
                    setIsPageLoading(true);
                }

                const response = await fetchForwarderById(forwarderId, {
                    page: nextPage,
                    perPage: FORWARDER_LEADS_PER_PAGE,
                });

                if (requestId !== requestIdRef.current) {
                    return;
                }

                const details = response?.data ?? response;

                setForwarder(details ?? null);
                setPagination(
                    normalizeForwarderLeadsPagination(details, {
                        requestedPage: nextPage,
                        requestedPerPage: FORWARDER_LEADS_PER_PAGE,
                        itemsCount: getForwarderLeads(details).length,
                    }),
                );
            } catch (requestError) {
                if (requestId !== requestIdRef.current) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                        requestError.response?.data?.error ||
                        requestError.message ||
                        t('common.forwarderPicker.detailsLoadFailed'),
                );
            } finally {
                if (requestId === requestIdRef.current) {
                    setIsDetailsLoading(false);
                    setIsPageLoading(false);
                }
            }
        },
        [forwarderId, t],
    );

    useEffect(() => {
        requestIdRef.current += 1;

        setForwarder(null);
        setPagination(null);
        setPage(1);
        setError('');
        setIsDetailsLoading(false);
        setIsPageLoading(false);
    }, [forwarderId, enabled]);

    useEffect(() => {
        if (!enabled || !forwarderId) {
            return;
        }

        loadForwarder(page);
    }, [enabled, forwarderId, page, loadForwarder]);

    const leads = useMemo(
        () => mapForwarderLeads(getForwarderLeads(forwarder)),
        [forwarder],
    );

    const pageLeads = useMemo(() => {
        if (!pagination?.isClientPaginated) {
            return leads;
        }

        return getForwarderLeadsPage(leads, page, pagination.perPage);
    }, [leads, page, pagination]);

    return {
        forwarder: forwarder ?? initialForwarder ?? null,
        leads: pageLeads,
        page,
        setPage,
        pageCount: pagination?.pageCount ?? 1,
        total: pagination?.total ?? null,
        isDetailsLoading: isDetailsLoading && !forwarder,
        isLeadsLoading: isDetailsLoading || isPageLoading,
        error,
    };
}
