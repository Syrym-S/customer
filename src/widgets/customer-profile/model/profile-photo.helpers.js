export const PROFILE_PHOTO_UPDATED_EVENT = 'customer-profile-photo-updated';

export function notifyProfilePhotoUpdated(photoUrl) {
    window.dispatchEvent(
        new CustomEvent(PROFILE_PHOTO_UPDATED_EVENT, {
            detail: {
                photoUrl,
            },
        }),
    );
}

export function getAvatarFromUploadResponse(response, fallback = '') {
    return (
        response?.avatar ||
        response?.url ||
        response?.data?.avatar ||
        response?.data?.url ||
        fallback
    );
}
