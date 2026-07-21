import { useCallback, useMemo, useState } from 'react';
import { fetchForwardersApi } from '../../../../../features/create-lead/api/forwarders.api';
import { FORWARDERS_PER_PAGE } from '../../../../customer-forwarders/model/forwarders.helpers';
import {
    filterForwardersLocally,
    getParticipantForwarderId,
    normalizeForwardersOptions,
} from './tender-participants.helpers';

export function useTenderParticipantForwarders({
    participants = [],
    selectedForwarders = [],
    inputValue = '',
}) {
    const [forwarders, setForwarders] = useState([]);
    const [isForwardersLoaded, setIsForwardersLoaded] = useState(false);
    const [isForwardersLoading, setIsForwardersLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    const loadForwarders = useCallback(async () => {
        if (isForwardersLoaded || isForwardersLoading) {
            return;
        }

        try {
            setIsForwardersLoading(true);
            setSearchError('');

            const response = await fetchForwardersApi({
                page: 1,
                perPage: FORWARDERS_PER_PAGE,
            });

            setForwarders(normalizeForwardersOptions(response));
            setIsForwardersLoaded(true);
        } catch (error) {
            setForwarders([]);
            setSearchError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Не удалось загрузить экспедиторов',
            );
        } finally {
            setIsForwardersLoading(false);
        }
    }, [isForwardersLoaded, isForwardersLoading]);

    const existingParticipantIds = useMemo(() => {
        return new Set(
            participants
                .map((participant) => getParticipantForwarderId(participant))
                .filter(Boolean)
                .map(String),
        );
    }, [participants]);

    const filteredForwarders = useMemo(() => {
        return filterForwardersLocally(forwarders, inputValue);
    }, [forwarders, inputValue]);

    const forwarderOptions = useMemo(() => {
        const selectedIds = new Set(
            selectedForwarders
                .map((forwarder) => forwarder?.id)
                .filter(Boolean)
                .map(String),
        );

        return filteredForwarders.filter((forwarder) => {
            const forwarderId = forwarder?.id ? String(forwarder.id) : '';

            if (!forwarderId) {
                return false;
            }

            if (existingParticipantIds.has(forwarderId)) {
                return false;
            }

            if (selectedIds.has(forwarderId)) {
                return false;
            }

            return true;
        });
    }, [filteredForwarders, selectedForwarders, existingParticipantIds]);

    return {
        forwarderOptions,
        isForwardersLoaded,
        isForwardersLoading,
        searchError,
        setSearchError,
        loadForwarders,
    };
}
