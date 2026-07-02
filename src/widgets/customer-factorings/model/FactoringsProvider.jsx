import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    acceptCustomerFactoring,
    fetchCustomerFactoringByIndex,
    fetchCustomerFactorings,
} from '../api/factorings.api';

import { FactoringsContext } from './FactoringsContext';
import { fetchCustomerLeadById } from '../../customer-leads/api/leads.repository';
import {
    notificationDomainEventNames,
    subscribeToNotificationDomainEvent,
} from '../../../shared/model/notification-domain-events';

const DEFAULT_PER_PAGE = 10;

export function FactoringsProvider({ children }) {
    const [factorings, setFactorings] = useState([]);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
    const [total, setTotal] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState('');

    const [selectedFactoring, setSelectedFactoring] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState('');

    const [isAccepting, setIsAccepting] = useState(false);
    const [acceptError, setAcceptError] = useState('');

    const pageCount = Math.max(1, Math.ceil(total / perPage));

    function getFactoringLeadId(factoring) {
        return (
            factoring?.lead_id || factoring?.leadId || factoring?.lead?.id || ''
        );
    }

    function unwrapLeadResponse(response) {
        return response?.data || response?.result || response?.lead || response;
    }

    const loadFactorings = useCallback(
        async (nextPage = page, { withLoader = true } = {}) => {
            try {
                if (withLoader) {
                    setIsLoading(true);
                }

                setLoadError('');

                const response = await fetchCustomerFactorings({
                    page: nextPage,
                    perPage,
                });

                setFactorings(
                    Array.isArray(response?.data) ? response.data : [],
                );
                setTotal(Number(response?.total || 0));
                setPage(Number(response?.page || nextPage));
                setPerPage(Number(response?.per_page || perPage));
            } catch (error) {
                setLoadError(
                    error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message ||
                        'Не удалось загрузить факторинг-покупки',
                );
            } finally {
                if (withLoader) {
                    setIsLoading(false);
                }
            }
        },
        [page, perPage],
    );

    const loadFactoringDetailsWithLead = useCallback(async (factoringIndex) => {
        const details = await fetchCustomerFactoringByIndex(factoringIndex);

        const leadId = getFactoringLeadId(details);

        if (!leadId) {
            return details;
        }

        try {
            const leadResponse = await fetchCustomerLeadById(leadId);
            const lead = unwrapLeadResponse(leadResponse);

            return {
                ...details,
                lead,
            };
        } catch (leadError) {
            console.error('[factoring lead load error]', leadError);

            return details;
        }
    }, []);

    const openFactoringDetails = useCallback(
        async (factoring) => {
            if (!factoring?.index && factoring?.index !== 0) {
                return;
            }

            try {
                setIsDetailsOpen(true);
                setSelectedFactoring(null);
                setDetailsError('');
                setAcceptError('');
                setIsDetailsLoading(true);

                const details = await loadFactoringDetailsWithLead(
                    factoring.index,
                );

                setSelectedFactoring(details);
            } catch (error) {
                setDetailsError(
                    error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message ||
                        'Не удалось загрузить детали факторинга',
                );
            } finally {
                setIsDetailsLoading(false);
            }
        },
        [loadFactoringDetailsWithLead],
    );

    const closeFactoringDetails = useCallback(() => {
        setIsDetailsOpen(false);
        setSelectedFactoring(null);
        setDetailsError('');
        setAcceptError('');
    }, []);

    const acceptFactoring = useCallback(async () => {
        if (!selectedFactoring?.index && selectedFactoring?.index !== 0) {
            return;
        }

        try {
            setIsAccepting(true);
            setAcceptError('');

            await acceptCustomerFactoring(selectedFactoring.index);

            const updatedFactoring = await loadFactoringDetailsWithLead(
                selectedFactoring.index,
            );

            setSelectedFactoring(updatedFactoring);

            await loadFactorings(page);
        } catch (error) {
            setAcceptError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Не удалось подтвердить факторинг',
            );
        } finally {
            setIsAccepting(false);
        }
    }, [selectedFactoring, loadFactorings, loadFactoringDetailsWithLead, page]);

    useEffect(() => {
        loadFactorings(page, { withLoader: true });
    }, [loadFactorings, page]);

    useEffect(() => {
        return subscribeToNotificationDomainEvent(
            notificationDomainEventNames.factoringsChanged,
            () => {
                loadFactorings(page, { withLoader: false });

                if (
                    isDetailsOpen &&
                    selectedFactoring?.index !== undefined &&
                    selectedFactoring?.index !== null
                ) {
                    loadFactoringDetailsWithLead(selectedFactoring.index)
                        .then((updatedFactoring) => {
                            setSelectedFactoring(updatedFactoring);
                        })
                        .catch((error) => {
                            console.error(
                                'Не удалось обновить детали факторинга после уведомления:',
                                error,
                            );
                        });
                }
            },
        );
    }, [
        loadFactorings,
        page,
        isDetailsOpen,
        selectedFactoring?.index,
        loadFactoringDetailsWithLead,
    ]);

    const value = useMemo(
        () => ({
            factorings,

            page,
            setPage,
            perPage,
            setPerPage,
            total,
            count: total,
            pageCount,

            isLoading,
            loadError,

            selectedFactoring,
            setSelectedFactoring,
            isDetailsOpen,
            isDetailsLoading,
            detailsError,

            isAccepting,
            acceptError,

            reloadFactorings: loadFactorings,

            openFactoringDetails,
            closeFactoringDetails,

            acceptFactoring,
        }),
        [
            factorings,
            page,
            perPage,
            total,
            pageCount,
            isLoading,
            loadError,
            selectedFactoring,
            isDetailsOpen,
            isDetailsLoading,
            detailsError,
            isAccepting,
            acceptError,
            loadFactorings,
            openFactoringDetails,
            closeFactoringDetails,
            acceptFactoring,
        ],
    );

    return (
        <FactoringsContext.Provider value={value}>
            {children}
        </FactoringsContext.Provider>
    );
}

FactoringsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
