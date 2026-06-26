import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    acceptCustomerFactoring,
    createCustomerFactoring,
    fetchCustomerFactoringByIndex,
    fetchCustomerFactorings,
} from '../api/factorings.api';

import { FactoringsContext } from './FactoringsContext';

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

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');

    const [isAccepting, setIsAccepting] = useState(false);
    const [acceptError, setAcceptError] = useState('');

    const pageCount = Math.max(1, Math.ceil(total / perPage));

    const loadFactorings = useCallback(
        async (nextPage = page) => {
            try {
                setIsLoading(true);
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
                setIsLoading(false);
            }
        },
        [page, perPage],
    );

    const openFactoringDetails = useCallback(async (factoring) => {
        if (!factoring?.index && factoring?.index !== 0) {
            return;
        }

        try {
            setIsDetailsOpen(true);
            setSelectedFactoring(null);
            setDetailsError('');
            setAcceptError('');
            setIsDetailsLoading(true);

            const details = await fetchCustomerFactoringByIndex(
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
    }, []);

    const closeFactoringDetails = useCallback(() => {
        setIsDetailsOpen(false);
        setSelectedFactoring(null);
        setDetailsError('');
        setAcceptError('');
    }, []);

    const openCreateModal = useCallback(() => {
        setIsCreateOpen(true);
        setCreateError('');
        setCreateSuccess('');
    }, []);

    const closeCreateModal = useCallback(() => {
        if (isCreating) {
            return;
        }

        setIsCreateOpen(false);
        setCreateError('');
    }, [isCreating]);

    const createFactoring = useCallback(
        async (payload) => {
            try {
                setIsCreating(true);
                setCreateError('');
                setCreateSuccess('');

                await createCustomerFactoring(payload);

                setIsCreateOpen(false);
                setCreateSuccess('Факторинг успешно создан');

                await loadFactorings(1);
            } catch (error) {
                setCreateError(
                    error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message ||
                        'Не удалось создать факторинг',
                );
            } finally {
                setIsCreating(false);
            }
        },
        [loadFactorings],
    );

    const acceptFactoring = useCallback(async () => {
        if (!selectedFactoring?.index && selectedFactoring?.index !== 0) {
            return;
        }

        try {
            setIsAccepting(true);
            setAcceptError('');

            await acceptCustomerFactoring(selectedFactoring.index);

            const updatedFactoring = await fetchCustomerFactoringByIndex(
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
    }, [selectedFactoring, loadFactorings, page]);

    useEffect(() => {
        loadFactorings(page);
    }, [loadFactorings, page]);

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

            isCreateOpen,
            isCreating,
            createError,
            createSuccess,

            isAccepting,
            acceptError,

            reloadFactorings: loadFactorings,

            openFactoringDetails,
            closeFactoringDetails,

            openCreateModal,
            closeCreateModal,
            createFactoring,
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
            isCreateOpen,
            isCreating,
            createError,
            createSuccess,
            isAccepting,
            acceptError,
            loadFactorings,
            openFactoringDetails,
            closeFactoringDetails,
            openCreateModal,
            closeCreateModal,
            createFactoring,
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
