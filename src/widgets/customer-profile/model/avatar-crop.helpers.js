import i18n from '../../../shared/i18n';

export const AVATAR_ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg'];

/** Предел квадрата кадрирования — результат, который живёт в состоянии страницы. */
export const AVATAR_MAX_CROP_SIZE = 1500;

/** Размер квадрата, который уходит на сервер. */
export const AVATAR_UPLOAD_SIZE = 400;

/** Минимальная сторона исходника и минимальная сторона области кадрирования. */
const MIN_SOURCE_SIZE = 400;
const MIN_CROP_SIZE = 400;

const MAX_FILE_SIZE_MB = 10;
const MAX_ZOOM_LIMIT = 3;
const JPEG_QUALITY = 0.92;

/**
 * react-easy-crop возвращает размеры области в пикселях исходника, и округление
 * иногда даёт 399.6 вместо 400 — такой кроп считаем допустимым.
 */
const CROP_SIZE_TOLERANCE = 1;

export function revokeAvatarSourceUrl(url) {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
}

function getAvatarOutputMimeType(sourceType) {
    return sourceType === 'image/png' ? 'image/png' : 'image/jpeg';
}

function getAvatarFileName(sourceName, mimeType) {
    const extension = mimeType === 'image/png' ? 'png' : 'jpg';

    const baseName = String(sourceName || '')
        .replace(/\.[^.]+$/, '')
        .trim();

    return `${baseName || 'avatar'}.${extension}`;
}

function validateAvatarFile(file) {
    if (!file) {
        return i18n.t('profile.avatar.uploadFailed');
    }

    if (!AVATAR_ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return i18n.t('profile.avatar.allowedTypes');
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return i18n.t('profile.avatar.maxFileSize', {
            size: MAX_FILE_SIZE_MB,
        });
    }

    return '';
}

/**
 * Зум ограничиваем так, чтобы область кадрирования не могла стать меньше
 * MIN_CROP_SIZE пикселей исходника: иначе на сервер уходил бы растянутый
 * из мелкого фрагмента квадрат.
 */
export function getAvatarMaxZoom(source) {
    const minSide = Math.min(source?.width || 0, source?.height || 0);

    if (!minSide) {
        return 1;
    }

    return Math.max(1, Math.min(MAX_ZOOM_LIMIT, minSide / MIN_CROP_SIZE));
}

/** Страховка на случай, если область кадрирования всё же оказалась мелкой. */
export function getAvatarCropAreaError(croppedAreaPixels) {
    if (!croppedAreaPixels) {
        return '';
    }

    const side = Math.min(croppedAreaPixels.width, croppedAreaPixels.height);

    if (side + CROP_SIZE_TOLERANCE < MIN_CROP_SIZE) {
        return i18n.t('profile.avatar.minCropSize', { size: MIN_CROP_SIZE });
    }

    return '';
}

function loadImageElement(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(i18n.t('profile.avatar.readFailed')));

        image.src = src;
    });
}

async function readImageSource(file) {
    if (typeof createImageBitmap === 'function') {
        try {
            const bitmap = await createImageBitmap(file, {
                imageOrientation: 'from-image',
            });

            return {
                drawable: bitmap,
                width: bitmap.width,
                height: bitmap.height,
                release: () => bitmap.close?.(),
            };
        } catch {
            // Браузер не поддерживает ориентацию из EXIF — читаем через Image.
        }
    }

    const objectUrl = URL.createObjectURL(file);

    try {
        const image = await loadImageElement(objectUrl);

        return {
            drawable: image,
            width: image.naturalWidth,
            height: image.naturalHeight,
            release: () => URL.revokeObjectURL(objectUrl),
        };
    } catch (readError) {
        URL.revokeObjectURL(objectUrl);

        throw readError;
    }
}

function createCanvasContext(width, height, mimeType) {
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error(i18n.t('profile.avatar.cropFailed'));
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    if (mimeType === 'image/jpeg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
    }

    return { canvas, context };
}

function canvasToBlob(canvas, mimeType) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                    return;
                }

                reject(new Error(i18n.t('profile.avatar.cropFailed')));
            },
            mimeType,
            mimeType === 'image/jpeg' ? JPEG_QUALITY : undefined,
        );
    });
}

function getRotatedBoundingBox(width, height, rotation) {
    const radians = (rotation * Math.PI) / 180;

    return {
        width:
            Math.abs(Math.cos(radians) * width) +
            Math.abs(Math.sin(radians) * height),
        height:
            Math.abs(Math.sin(radians) * width) +
            Math.abs(Math.cos(radians) * height),
    };
}

/**
 * Область кадрирования всегда квадратная (aspect = 1), поэтому и клампим её
 * квадратом: разные width/height растянули бы результат.
 */
function clampCropArea(area, maxWidth, maxHeight) {
    const size = Math.max(
        1,
        Math.min(
            Math.round(area.width),
            Math.round(area.height),
            maxWidth,
            maxHeight,
        ),
    );

    return {
        x: Math.max(0, Math.min(Math.round(area.x), maxWidth - size)),
        y: Math.max(0, Math.min(Math.round(area.y), maxHeight - size)),
        size,
    };
}

export async function prepareAvatarSource(file) {
    const validationError = validateAvatarFile(file);

    if (validationError) {
        throw new Error(validationError);
    }

    const source = await readImageSource(file);

    try {
        if (!source.width || !source.height) {
            throw new Error(i18n.t('profile.avatar.sizeCheckFailed'));
        }

        if (source.width < MIN_SOURCE_SIZE || source.height < MIN_SOURCE_SIZE) {
            throw new Error(i18n.t('profile.avatar.minSize'));
        }

        const mimeType = getAvatarOutputMimeType(file.type);

        const scale = Math.min(
            1,
            AVATAR_MAX_CROP_SIZE / Math.min(source.width, source.height),
        );

        const width = Math.max(1, Math.round(source.width * scale));
        const height = Math.max(1, Math.round(source.height * scale));

        const { canvas, context } = createCanvasContext(width, height, mimeType);

        context.drawImage(source.drawable, 0, 0, width, height);

        const blob = await canvasToBlob(canvas, mimeType);

        return {
            url: URL.createObjectURL(blob),
            fileName: getAvatarFileName(file.name, mimeType),
            mimeType,
            width,
            height,
        };
    } finally {
        source.release();
    }
}

function drawCroppedSquare({ stageCanvas, cropArea, size, mimeType }) {
    const output = createCanvasContext(size, size, mimeType);

    output.context.drawImage(
        stageCanvas,
        cropArea.x,
        cropArea.y,
        cropArea.size,
        cropArea.size,
        0,
        0,
        size,
        size,
    );

    return output.canvas;
}

/**
 * Возвращает два результата одного кадрирования:
 * - dataUrl — квадрат до AVATAR_MAX_CROP_SIZE px для состояния страницы;
 * - file — квадрат AVATAR_UPLOAD_SIZE px для отправки на сервер.
 */
export async function createCroppedAvatarFile({
    sourceUrl,
    croppedAreaPixels,
    rotation = 0,
    mimeType = 'image/jpeg',
    fileName = 'avatar.jpg',
}) {
    if (!sourceUrl || !croppedAreaPixels) {
        throw new Error(i18n.t('profile.avatar.cropFailed'));
    }

    const cropAreaError = getAvatarCropAreaError(croppedAreaPixels);

    if (cropAreaError) {
        throw new Error(cropAreaError);
    }

    const image = await loadImageElement(sourceUrl);

    const boundingBox = getRotatedBoundingBox(
        image.naturalWidth,
        image.naturalHeight,
        rotation,
    );

    const stage = createCanvasContext(
        Math.max(1, Math.round(boundingBox.width)),
        Math.max(1, Math.round(boundingBox.height)),
        mimeType,
    );

    stage.context.translate(stage.canvas.width / 2, stage.canvas.height / 2);
    stage.context.rotate((rotation * Math.PI) / 180);

    stage.context.drawImage(
        image,
        -image.naturalWidth / 2,
        -image.naturalHeight / 2,
    );

    const cropArea = clampCropArea(
        croppedAreaPixels,
        stage.canvas.width,
        stage.canvas.height,
    );

    // Превью не апскейлим: берём меньшее из фактического кропа и предела.
    const previewSize = Math.max(
        1,
        Math.min(cropArea.size, AVATAR_MAX_CROP_SIZE),
    );

    const previewCanvas = drawCroppedSquare({
        stageCanvas: stage.canvas,
        cropArea,
        size: previewSize,
        mimeType,
    });

    const uploadCanvas = drawCroppedSquare({
        stageCanvas: stage.canvas,
        cropArea,
        size: AVATAR_UPLOAD_SIZE,
        mimeType,
    });

    const blob = await canvasToBlob(uploadCanvas, mimeType);

    return {
        file: new File([blob], fileName, { type: mimeType }),
        dataUrl: previewCanvas.toDataURL(
            mimeType,
            mimeType === 'image/jpeg' ? JPEG_QUALITY : undefined,
        ),
    };
}
