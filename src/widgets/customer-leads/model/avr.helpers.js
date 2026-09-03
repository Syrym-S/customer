// TODO(backend): `forwarder_avr_signed` is an assumed/placeholder field name
// — no real lead API response has ever included an AVR-related field (none
// of forwarder_avr_signed / avr_signed / avr_status / AWAIT_AVR* exist in
// lead.adapter.js or any observed response). This must be confirmed with
// backend before relying on it outside the mocked flow, same as
// AWAIT_AVR_STATUS was flagged as a placeholder on driver-mobile.
export function isForwarderAvrSigned(lead) {
   return Boolean(lead?.forwarder_avr_signed);
}

export function getAvrPartyStatusLabel(signed) {
   return signed ? 'Подписан' : 'Не подписан';
}

export function getAvrPartyStatusColor(signed) {
   return signed ? 'success' : 'default';
}
