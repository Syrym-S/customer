import i18n from '../../../shared/i18n';

export const FORWARDERS_PER_PAGE = 10;

export function normalizeForwardersListResponse(response) {
    const forwarders = Array.isArray(response?.results) ? response.results : [];

    return {
        forwarders,
        page: Number(response?.page || 1),
        perPage: Number(response?.per_page || FORWARDERS_PER_PAGE),
        total: Number(response?.count || 0),
    };
}

export function getForwarderId(forwarder) {
    return forwarder?.id || forwarder?._id || '';
}

export function getForwarderCompanyName(forwarder) {
    return (
        forwarder?.name ||
        forwarder?.company_name ||
        forwarder?.companyName ||
        i18n.t("common.empty.companyNotSpecified")
    );
}

export function getForwarderBin(forwarder) {
    return forwarder?.company_bin || i18n.t("common.empty.notSpecifiedM");
}

export function getForwarderIin(forwarder) {
    return forwarder?.iin || i18n.t("common.empty.notSpecifiedM");
}

export function getForwarderFio(forwarder) {
    return (
        forwarder?.fio ||
        forwarder?.fullname ||
        forwarder?.fullName ||
        i18n.t("common.empty.notSpecifiedM")
    );
}

export function getForwarderPhone(forwarder) {
    return forwarder?.phone || i18n.t("common.empty.notSpecifiedM");
}

export function getForwarderEmail(forwarder) {
    return forwarder?.email || i18n.t("common.empty.notSpecifiedM");
}

export function getForwarderAddress(forwarder) {
    return forwarder?.company_address || i18n.t("common.empty.notSpecifiedM");
}

export function getForwarderBik(forwarder) {
    return forwarder?.company_bik || i18n.t("common.empty.notSpecifiedM");
}

export function getForwarderAccount(forwarder) {
    return forwarder?.company_account || i18n.t("common.empty.notSpecifiedM");
}

export function getForwarderInviteLink(forwarder) {
    return forwarder?.invite_link || forwarder?.inviteLink || '';
}

export function getForwarderInviteCode(forwarder) {
    return forwarder?.invite || '';
}

export function isForwarderRegistered(forwarder) {
    return Boolean(forwarder?.is_registered ?? forwarder?.isRegistered);
}

export function hasForwarderInviteLink(forwarder) {
    return Boolean(getForwarderInviteLink(forwarder));
}