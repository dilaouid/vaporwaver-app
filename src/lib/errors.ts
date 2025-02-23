export class VaporwaverError extends Error {
    constructor(message: string, public readonly details?: unknown) {
        super(message);
        this.name = 'VaporwaverError';
    }
}

export const VAPORWAVER_ERRORS = {
    RATE_LIMIT: 'Too many requests, please try again later',
    SERVER_BUSY: 'Server is currently busy processing images',
    INVALID_IMAGE: 'Invalid image format or data',
    FILE_TOO_LARGE: 'Image file is too large',
    PROCESSING_FAILED: 'Failed to process image effects',
} as const;