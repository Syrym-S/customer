import PropTypes from 'prop-types';

export const sxPropType = PropTypes.oneOfType([
   PropTypes.object,
   PropTypes.array,
   PropTypes.func,
]);

export const locationPropType = PropTypes.oneOfType([
   PropTypes.string,
   PropTypes.shape({
      country: PropTypes.string,
      region: PropTypes.string,
      city: PropTypes.string,
      address: PropTypes.string,
      lat: PropTypes.number,
      lon: PropTypes.number,
   }),
]);

export const cargoPropType = PropTypes.shape({
   id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   name: PropTypes.string,
   description: PropTypes.string,
   context: PropTypes.string,
   type: PropTypes.string,
   weight_kg: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   cargo_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   width_cm: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   height_cm: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   length_cm: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

export const participantPropType = PropTypes.shape({
   type: PropTypes.string,
   date: PropTypes.string,
   participant_id: PropTypes.string,
   name: PropTypes.string,
});

export const betPropType = PropTypes.shape({
   amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   status: PropTypes.oneOf(['new', 'winning', 'loss', 'closed']),
   comment: PropTypes.string,
   currency: PropTypes.string,
   participant_id: PropTypes.string,
   participant_name: PropTypes.string,
});

export const tenderEditFormPropType = PropTypes.shape({
   endDateTime: PropTypes.string,
   publicationType: PropTypes.oneOf(['public', 'private']),
   maxParticipants: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

   from_location: PropTypes.string,
   to_location: PropTypes.string,

   cargos: PropTypes.arrayOf(cargoPropType),

   summ: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   currency: PropTypes.string,
   vat: PropTypes.string,
});

export const tenderDocumentPropType = PropTypes.shape({
   id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   name: PropTypes.string,
   context: PropTypes.string,
   fileName: PropTypes.string,
   fileUrl: PropTypes.string,
   fileType: PropTypes.string,
   createdAt: PropTypes.string,
   path: PropTypes.string,
   source: PropTypes.string,
   raw: PropTypes.object,
});

export const leadPropType = PropTypes.shape({
   id: PropTypes.string,
   num: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   status: PropTypes.string,
   summ: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   currency: PropTypes.string,
   vat: PropTypes.string,
   from_location: locationPropType,
   to_location: locationPropType,
   cargos: PropTypes.arrayOf(cargoPropType),
   documents: PropTypes.arrayOf(tenderDocumentPropType),
   files: PropTypes.arrayOf(tenderDocumentPropType),
});

export const tenderPropType = PropTypes.shape({
   id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   status: PropTypes.oneOf(['new', 'active', 'closed', 'cancelled']),
   type: PropTypes.string,
   publication_type: PropTypes.oneOf(['public', 'private']),
   planningType: PropTypes.string,
   public_date_time: PropTypes.string,
   endDateTime: PropTypes.string,
   end_date_time: PropTypes.string,
   max_participants: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   participants_count: PropTypes.number,
   bets_count: PropTypes.number,

   from_location: locationPropType,
   to_location: locationPropType,
   from_point: PropTypes.arrayOf(PropTypes.number),
   to_point: PropTypes.arrayOf(PropTypes.number),

   cargos: PropTypes.arrayOf(cargoPropType),
   lead: leadPropType,

   summ: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   currency: PropTypes.string,
   vat: PropTypes.string,

   participants: PropTypes.arrayOf(participantPropType),
   bets: PropTypes.arrayOf(betPropType),
});
