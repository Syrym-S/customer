export const initialCreateFactoringForm = {
    debSumm: '',
    debCurrency: 'KZT',
    currency: 'KZT',
};

function normalizeText(value) {
    return String(value ?? '').trim();
}

function normalizeNumber(value) {
    const normalizedValue = String(value ?? '')
        .replace(',', '.')
        .trim();

    return Number(normalizedValue);
}

export function getFactorId(factor) {
    return factor?.id || factor?._id || factor?.factor_id || '';
}

export function getFactorOptionLabel(option) {
    if (!option) {
        return '';
    }

    return (
        option.company_name ||
        option.companyName ||
        option.name ||
        option.fio ||
        option.bin ||
        getFactorId(option) ||
        ''
    );
}

export function getLeadOptionLabel(option) {
    return option?.label || option?.title || option?.id || '';
}

export function validateCreateFactoringForm(
    form,
    selectedLead,
    selectedFactor,
) {
    const errors = {};

    const debSumm = normalizeNumber(form.debSumm);

    if (!selectedLead?.id) {
        errors.lead = 'Выберите лид';
    }

    if (!getFactorId(selectedFactor)) {
        errors.factor = 'Выберите фактор';
    }

    if (!Number.isFinite(debSumm) || debSumm <= 0) {
        errors.debSumm = 'Введите сумму больше 0';
    }

    return errors;
}

export function mapCreateFactoringFormToApi(
    form,
    selectedLead,
    selectedFactor,
) {
    return {
        lead_id: selectedLead.id,
        factor_id: getFactorId(selectedFactor),
        debSumm: normalizeNumber(form.debSumm),
        debCurrency: normalizeText(form.debCurrency) || 'KZT',
        currency: normalizeText(form.currency) || 'KZT',
    };
}

export function getCargoLabel(lead) {
    const cargo = lead?.cargo || lead?.cargo_name;

    if (!cargo) {
        return 'Не указан';
    }

    if (typeof cargo === 'string') {
        return cargo;
    }

    if (typeof cargo === 'object') {
        return cargo.name || cargo.title || cargo.description || 'Не указан';
    }

    return String(cargo);
}

export function normalizeListResponse(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.results)) {
        return response.results;
    }

    if (Array.isArray(response?.items)) {
        return response.items;
    }

    return [];
}

export function isFinishedLead(lead) {
    return String(lead?.status || '').toLowerCase() === 'finished';
}

export function getLeadId(lead) {
    return lead?.id || lead?._id || lead?.lead_id || '';
}

export function getLeadForwarderLabel(lead) {
    const forwarder = lead?.forwarder;

    if (!forwarder) {
        return '';
    }

    if (typeof forwarder === 'string') {
        return forwarder;
    }

    if (typeof forwarder === 'object') {
        return (
            forwarder.company_name ||
            forwarder.companyName ||
            forwarder.name ||
            forwarder.fio ||
            ''
        );
    }

    return String(forwarder);
}

export function getLeadPrice(lead) {
    return lead?.price || lead?.price_value || lead?.amount || '';
}

export function getLeadCurrency(lead) {
    return lead?.currency || 'KZT';
}

export function getFactorCompanyName(factor) {
    return (
        factor?.company_name ||
        factor?.companyName ||
        factor?.name ||
        'Компания не указана'
    );
}

export function getFactorBin(factor) {
    return factor?.bin || factor?.iin || 'Не указан';
}

export function getFactorContact(factor) {
    if (!factor?.fio && !factor?.phone) {
        return '';
    }

    return `${factor.fio || 'ФИО не указано'}${
        factor.phone ? ` · ${factor.phone}` : ''
    }`;
}
