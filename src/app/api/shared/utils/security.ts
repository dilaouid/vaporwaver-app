import { ALLOWED_MIME_TYPES, RATE_LIMIT } from '../../preview-effects/config';

export class SecurityUtils {
    protected static store = new Map<string, { count: number; timestamp: number }>();

    static validateBase64(base64String: string): boolean {
        const base64Regex = /^(?:data:image\/[a-zA-Z]+;base64,)?(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
        return base64Regex.test(base64String);
    }

    static async validateImage(buffer: Buffer): Promise<boolean> {
        const fileType = await import('file-type');
        const type = await fileType.fileTypeFromBuffer(buffer);
        return type ? ALLOWED_MIME_TYPES.includes(type.mime) : false;
    }

    static sanitizeFileName(fileName: string): string {
        return fileName.replace(/[^a-zA-Z0-9]/g, '');
    }

    static checkRateLimit(ip: string): boolean {
        const current = this.store.get(ip) || { count: 0, timestamp: Date.now() };

        if (Date.now() - current.timestamp > RATE_LIMIT.WINDOW_MS) {
            current.count = 0;
            current.timestamp = Date.now();
        }

        current.count++;
        this.store.set(ip, current);

        return current.count <= RATE_LIMIT.MAX_REQUESTS;
    }
}