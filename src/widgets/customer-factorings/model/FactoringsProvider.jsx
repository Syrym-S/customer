import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    acceptCustomerFactoring,
    acceptFactoringLine,
    cancelCustomerFactoring,
    fetchCustomerFactoringById,
    fetchCustomerFactorings,
    fetchFactoringLine,
    fetchFactoringLineDocument,
} from '../api/factorings.api';

import { FactoringsContext } from './FactoringsContext';
import { fetchCustomerLeadById } from '../../customer-leads/api/leads.repository';
import {
    notificationDomainEventNames,
    subscribeToNotificationDomainEvent,
} from '../../../shared/model/notification-domain-events';
import { mapLeadDetailsResponseFromApi } from '../../customer-leads/model/lead.adapter';
import { getFactoringLeadId } from './factorings.helpers';

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

    const [isInitiatingSigning, setIsInitiatingSigning] = useState(false);
    const [signingError, setSigningError] = useState('');

    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState('');

    const pageCount = Math.max(1, Math.ceil(total / perPage));

    function getFactoringId(factoring) {
        return (
            factoring?.id ||
            factoring?._id ||
            factoring?.factoring_id ||
            factoring?.factoringId ||
            ''
        );
    }

    function unwrapLeadResponse(response) {
        const data = response?.data ?? response;

        return data?.data || data?.result || data?.lead || data;
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

    // Closed factorings carry their own factoring-line document. Absence of
    // one (404, or a body with no `document`) just means this factoring has
    // no line — i.e. it's an "open" factoring from the UI's perspective, so
    // any fetch failure here is swallowed and treated the same way.
    async function loadFactoringLine(factoringId) {
        try {
            const line = await fetchFactoringLine(factoringId);

            return line?.document ? line : null;
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('[factoring line load error]', error);
            }

            return null;
        }
    }

    // The general factoring-line contract between forwarder and factor —
    // view-only for the customer, no `signed` concept. Same absent-means-open
    // treatment as loadFactoringLine above.
    async function loadFactoringLineDocument(factoringId) {
        try {
            const response = await fetchFactoringLineDocument(factoringId);

            return response?.document || null;
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('[factoring line document load error]', error);
            }

            return null;
        }
    }

    const loadFactoringDetailsWithLead = useCallback(async (factoringId) => {
        const [details, factoringLine, factoringLineDocument] =
            await Promise.all([
                fetchCustomerFactoringById(factoringId),
                loadFactoringLine(factoringId),
                loadFactoringLineDocument(factoringId),
            ]);

        const leadId = getFactoringLeadId(details);

        if (!leadId) {
            return { ...details, factoringLine, factoringLineDocument };
        }

        try {
            const leadResponse = await fetchCustomerLeadById(leadId);

            const rawLead = unwrapLeadResponse(leadResponse);
            const mappedLead = mapLeadDetailsResponseFromApi(leadResponse);

            const lead = mappedLead
                ? {
                      ...rawLead,
                      ...mappedLead,
                      raw: mappedLead.raw || rawLead,
                  }
                : rawLead;

            return {
                ...details,
                lead,
                factoringLine,
                factoringLineDocument,
            };
        } catch (leadError) {
            console.error('[factoring lead load error]', leadError);

            return { ...details, factoringLine, factoringLineDocument };
        }
    }, []);

    const openFactoringDetails = useCallback(
        async (factoring) => {
            const factoringId = getFactoringId(factoring);

            if (!factoringId) {
                return;
            }

            try {
                setIsDetailsOpen(true);

                setSelectedFactoring({
                    ...factoring,
                    id: factoringId,
                    isDetailsPlaceholder: true,
                });

                setDetailsError('');
                setSigningError('');
                setCancelError('');
                setIsDetailsLoading(true);

                const details = await loadFactoringDetailsWithLead(factoringId);

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
        setSigningError('');
        setCancelError('');
    }, []);

    // `is_line: true` on the factoring (from both the list and details
    // endpoints) marks a closed factoring line — its accept call goes to the
    // line-specific endpoint; everything else keeps using the regular one.
    const initiateFactoringSigning = useCallback(async () => {
        const factoringId = getFactoringId(selectedFactoring);

        if (!factoringId) {
            return;
        }

        try {
            setIsInitiatingSigning(true);
            setSigningError('');

            const response = selectedFactoring?.is_line
                ? await acceptFactoringLine(factoringId)
                : await acceptCustomerFactoring(factoringId);

            const signUrl =
                response?.sign_url ||
                response?.data?.sign_url ||
                response?.result?.sign_url;

            if (signUrl) {
                window.open(signUrl, '_blank');
            }
        } catch (error) {
            setSigningError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Не удалось открыть окно подписания',
            );
        } finally {
            setIsInitiatingSigning(false);
        }
    }, [selectedFactoring]);

    const cancelFactoring = useCallback(async () => {
        const factoringId = getFactoringId(selectedFactoring);

        if (!factoringId) {
            return;
        }

        try {
            setIsCancelling(true);
            setCancelError('');

            await cancelCustomerFactoring(factoringId);

            const updatedFactoring =
                await loadFactoringDetailsWithLead(factoringId);

            setSelectedFactoring(updatedFactoring);

            await loadFactorings(page, { withLoader: false });
        } catch (error) {
            setCancelError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Не удалось отменить факторинг',
            );
        } finally {
            setIsCancelling(false);
        }
    }, [selectedFactoring, loadFactoringDetailsWithLead, loadFactorings, page]);

    useEffect(() => {
        loadFactorings(page, { withLoader: true });
    }, [loadFactorings, page]);

    const selectedFactoringId = getFactoringId(selectedFactoring);

    useEffect(() => {
        return subscribeToNotificationDomainEvent(
            notificationDomainEventNames.factoringsChanged,
            () => {
                loadFactorings(page, { withLoader: false });

                if (isDetailsOpen && selectedFactoringId) {
                    loadFactoringDetailsWithLead(selectedFactoringId)
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
        selectedFactoringId,
        loadFactoringDetailsWithLead,
    ]);

    useEffect(() => {
        return subscribeToNotificationDomainEvent(
            notificationDomainEventNames.shippingChanged,
            () => {
                if (isDetailsOpen && selectedFactoringId) {
                    loadFactoringDetailsWithLead(selectedFactoringId)
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
    }, [isDetailsOpen, selectedFactoringId, loadFactoringDetailsWithLead]);

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

            isInitiatingSigning,
            signingError,

            isCancelling,
            cancelError,

            reloadFactorings: loadFactorings,

            openFactoringDetails,
            closeFactoringDetails,

            initiateFactoringSigning,
            cancelFactoring,
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
            isInitiatingSigning,
            signingError,
            isCancelling,
            cancelError,
            loadFactorings,
            openFactoringDetails,
            closeFactoringDetails,
            initiateFactoringSigning,
            cancelFactoring,
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
