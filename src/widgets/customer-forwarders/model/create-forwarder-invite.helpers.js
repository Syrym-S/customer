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
        return 'Укажите ФИО представителя';
    }

    if (!normalizeText(form.phone)) {
        return 'Укажите телефон';
    }

    if (!normalizeText(form.iin)) {
        return 'Укажите ИИН';
    }

    if (!normalizeText(form.email)) {
        return 'Укажите email';
    }

    if (!normalizeText(form.company_name)) {
        return 'Укажите название компании';
    }

    if (!normalizeText(form.company_bin)) {
        return 'Укажите БИН компании';
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
