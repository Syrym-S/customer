import i18n from '../../../shared/i18n';

export function createForwarderInviteInitialForm() {
    return {
        fio: '',
        phone: '',
        iin: '',
        email: '',
        document_number: '',
        issue_country: '',
        company_name: '',
        company_bin: '',
        company_account: '',
        company_bik: '',
        company_address: '',
    };
}

function normalizeText(value) {
    return String(value || '').trim();
}

export function validateForwarderInviteForm(form) {
    if (!normalizeText(form.fio)) {
        return i18n.t("validation.representativeRequired");
    }

    if (!normalizeText(form.phone)) {
        return i18n.t("validation.phoneRequired");
    }

    if (!normalizeText(form.iin)) {
        return i18n.t("validation.iinRequired");
    }

    if (!normalizeText(form.email)) {
        return i18n.t("validation.emailRequired");
    }

    if (!normalizeText(form.company_name)) {
        return i18n.t("validation.companyNameRequired");
    }

    if (!normalizeText(form.company_bin)) {
        return i18n.t("validation.companyBinRequired");
    }

    return '';
}

export function mapForwarderInviteFormToApi(form) {
    return {
        fio: normalizeText(form.fio),
        phone: normalizeText(form.phone),
        iin: normalizeText(form.iin),
        email: normalizeText(form.email),
        document_number: normalizeText(form.document_number),
        issue_country: normalizeText(form.issue_country),
        company_name: normalizeText(form.company_name),
        company_bin: normalizeText(form.company_bin),
        company_account: normalizeText(form.company_account),
        company_bik: normalizeText(form.company_bik),
        company_address: normalizeText(form.company_address),
    };
}
