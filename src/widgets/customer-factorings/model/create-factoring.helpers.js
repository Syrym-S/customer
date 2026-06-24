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

export function getLeadOptionLabel(option) {
    return option?.label || option?.title || option?.id || '';
}

export function validateCreateFactoringForm(form, selectedLead) {
    const errors = {};

    const debSumm = normalizeNumber(form.debSumm);

    if (!selectedLead?.id) {
        errors.lead = 'Выберите лид';
    }

    if (!Number.isFinite(debSumm) || debSumm <= 0) {
        errors.debSumm = 'Введите сумму больше 0';
    }

    return errors;
}

export function mapCreateFactoringFormToApi(form, selectedLead) {
    return {
        lead_id: selectedLead.id,
        debSumm: normalizeNumber(form.debSumm),
        debCurrency: normalizeText(form.debCurrency) || 'KZT',
        currency: normalizeText(form.currency) || 'KZT',
    };
}
