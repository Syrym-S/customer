const STATE_STATUS_MAP = {
   new: 'pending',
   pending: 'pending',
   in_work: 'in_progress',
   completed: 'completed',
   rejected: 'rejected',
};

export const COMPLAINT_REQUEST_MAX_LENGTH = 1000;

export const COMPLAINT_WINDOW_DAYS = 30;

// Mirrors customer-factorings/model/factorings.helpers.js's formatDate,
// which already handles both a plain ISO string and the Laravel-style
// { date, timezone_type, timezone } object leads.mock.js uses — needed
// here too since the target picker reads created_at off raw lead/
// factoring records, not just off complaints' own plain ISO strings.
export function parseApiDate(value) {
   if (!value) {
      return null;
   }

   let dateValue = value;

   if (typeof value === 'object') {
      dateValue = value.date || value.datetime || value.value || '';

      if (!dateValue) {
         return null;
      }
   }

   const normalized =
      typeof dateValue === 'string' ? dateValue.replace(' ', 'T') : dateValue;

   const date = new Date(normalized);

   return Number.isNaN(date.getTime()) ? null : date;
}

export function isWithinLastDays(value, days = COMPLAINT_WINDOW_DAYS) {
   const date = parseApiDate(value);

   if (!date) {
      return false;
   }

   const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

   return date.getTime() >= cutoff;
}

const STATUS_META = {
   completed: { label: 'Решена', color: 'success.main' },
   rejected: { label: 'Отклонена', color: 'error.main' },
   pending: { label: 'Ожидает рассмотрения', color: 'warning.main' },
   in_progress: { label: 'В работе', color: 'info.main' },
};

// final_status is authoritative; acceptance_at (without a final_status yet)
// distinguishes "picked up by admin" from "just submitted", and response
// presence is only ever a secondary hint shown alongside the status, never
// used to override it — a response could in theory exist before
// final_status is set (e.g. a clarifying reply), so it can't be trusted
// alone to mean "resolved".
export function getComplaintStatusKey(complaint) {
   if (complaint?.final_status === 'completed') {
      return 'completed';
   }

   if (complaint?.final_status === 'rejected') {
      return 'rejected';
   }

   if (complaint?.state && STATE_STATUS_MAP[complaint.state]) {
      return STATE_STATUS_MAP[complaint.state];
   }

   if (complaint?.acceptance_at) {
      return 'in_progress';
   }

   return 'pending';
}

export function getComplaintStatusLabel(complaint) {
   return STATUS_META[getComplaintStatusKey(complaint)].label;
}

export function getComplaintStatusColor(complaint) {
   return STATUS_META[getComplaintStatusKey(complaint)].color;
}

export function getComplaintResponseLabel(complaint) {
   if (complaint?.final_status === 'rejected') {
      return 'Отклонено';
   }

   return complaint?.response ? 'Ответ получен' : 'Ожидает ответа';
}

// The backend embeds full target details directly on the complaint (and on
// the /complaints/targets picker options) — { num, from_city, to_city, ... }
// for a lead, { lead_num, factor, summ, currency, ... } for a factoring —
// so these read straight off that object, no client-side join needed.

// Short "№{num}" label, same convention as
// customer-tenders/model/tender-lead-option.helpers.js's
// getLeadOptionNumberLabel, reused here for the complaint target picker and
// for displaying "which shipment" on a complaint card/modal.
export function getLeadTargetLabel(lead) {
   if (!lead) {
      return 'Заказ не найден';
   }

   const number = Number(lead.num);
   const numberLabel = Number.isFinite(number) && number > 0 ? `№${number}` : `#${lead.id}`;

   return `${numberLabel} · ${lead.from_city || '?'} → ${lead.to_city || '?'}`;
}

// No short-label formatter exists for factoring deals anywhere in the
// codebase today (unlike leads) — this is built from scratch here, scoped
// to the complaints widget only, per the audit's finding #4.
export function getFactoringTargetLabel(factoring) {
   if (!factoring) {
      return 'Факторинг не найден';
   }

   const amount = Number(factoring.summ);
   const amountLabel = Number.isFinite(amount)
      ? `${new Intl.NumberFormat('ru-RU').format(amount)} ${factoring.currency || 'KZT'}`
      : '';

   return [factoring.factor, amountLabel].filter(Boolean).join(' · ');
}

export function getComplaintTargetLabel(target) {
   if (!target) {
      return null;
   }

   if (target.type === 'lead') {
      return getLeadTargetLabel(target);
   }

   if (target.type === 'factoring') {
      return getFactoringTargetLabel(target);
   }

   return null;
}

export function getComplaintTargetTypeLabel(target) {
   if (target?.type === 'lead') {
      return 'Перевозка';
   }

   if (target?.type === 'factoring') {
      return 'Факторинг';
   }

   return null;
}

// --- File attachments --------------------------------------------------
// Deliberately NOT reusing chat-widget's chat.helpers.js constants — the
// requirements differ (3 files / 100MB / image+video+docx+pdf here vs.
// 5 files / 10MB / image+pdf+office-docs there).

export const COMPLAINT_ATTACHMENT_MAX_COUNT = 3;
export const COMPLAINT_ATTACHMENT_MAX_SIZE_MB = 100;
export const COMPLAINT_ATTACHMENT_MAX_SIZE_BYTES =
   COMPLAINT_ATTACHMENT_MAX_SIZE_MB * 1024 * 1024;

export const COMPLAINT_ATTACHMENT_ALLOWED_EXTENSIONS = ['docx', 'pdf'];

function isAllowedComplaintAttachmentType(file) {
   if (file.type?.startsWith('image/') || file.type?.startsWith('video/')) {
      return true;
   }

   if (file.type === 'application/pdf') {
      return true;
   }

   if (
      file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
   ) {
      return true;
   }

   const extension = String(file.name || '').split('.').pop()?.toLowerCase();

   return (
      COMPLAINT_ATTACHMENT_ALLOWED_EXTENSIONS.includes(extension) ||
      Boolean(extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'webp')
   );
}

export function formatFileSize(size) {
   if (!size && size !== 0) {
      return '';
   }

   if (size < 1024) {
      return `${size} Б`;
   }

   if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(0)} КБ`;
   }

   return `${(size / 1024 / 1024).toFixed(1)} МБ`;
}

// Shared by both the attachments field (on selection) and the form's
// submit-time validation, per the spec's "same validator, not duplicated
// rules" requirement.
export function validateComplaintAttachmentFile(file) {
   if (!isAllowedComplaintAttachmentType(file)) {
      return 'Разрешены только изображения, видео, PDF или DOCX';
   }

   if (file.size > COMPLAINT_ATTACHMENT_MAX_SIZE_BYTES) {
      return `Размер файла не должен превышать ${COMPLAINT_ATTACHMENT_MAX_SIZE_MB} МБ`;
   }

   return '';
}

// Lazy-preview threshold: only auto-eligible for an inline image preview
// (still behind an explicit click, never eager) when the file is under
// this size — a judgment call to avoid decoding a huge image into memory
// just because the user clicked "предпросмотр". Video files always get an
// explicit play-on-demand control regardless of size (a <video> element
// streams rather than decoding the whole file up front).
export const COMPLAINT_PREVIEW_IMAGE_MAX_BYTES = 20 * 1024 * 1024;

export function isPreviewableImage(mimeType, size) {
   return (
      Boolean(mimeType?.startsWith('image/')) &&
      (size ?? 0) <= COMPLAINT_PREVIEW_IMAGE_MAX_BYTES
   );
}

export function isPreviewableVideo(mimeType) {
   return Boolean(mimeType?.startsWith('video/'));
}

// Already-uploaded files come back from the backend as { index, name, url }
// only — no mime type — so previews/icons for them go off the file
// extension instead of File.type (which pending, not-yet-uploaded
// attachments use via the mime-based helpers above).
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'webm', 'mkv'];

export function getFileExtension(name) {
   return String(name || '').split('.').pop()?.toLowerCase() || '';
}

export function isImageFileName(name) {
   return IMAGE_EXTENSIONS.includes(getFileExtension(name));
}

export function isVideoFileName(name) {
   return VIDEO_EXTENSIONS.includes(getFileExtension(name));
}

export function isPreviewableImageByName(name, size) {
   return isImageFileName(name) && (size ?? 0) <= COMPLAINT_PREVIEW_IMAGE_MAX_BYTES;
}

export function isPreviewableVideoByName(name) {
   return isVideoFileName(name);
}

export function validateComplaintAttachments(files) {
   if (files.length > COMPLAINT_ATTACHMENT_MAX_COUNT) {
      return `Можно прикрепить не более ${COMPLAINT_ATTACHMENT_MAX_COUNT} файлов`;
   }

   for (const file of files) {
      const fileError = validateComplaintAttachmentFile(file);

      if (fileError) {
         return fileError;
      }
   }

   return '';
}
