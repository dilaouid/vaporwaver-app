import { v4 as uuidv4 } from 'uuid';

interface FileData {
    id: string;
    data: Blob;
    timestamp: number;
}

export class FileService {
    private static instance: FileService;
    private files: Map<string, FileData> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;

    private constructor() {
        this.startCleanupInterval();
    }

    static getInstance() {
        if (!FileService.instance) {
            FileService.instance = new FileService();
        }
        return FileService.instance;
    }

    private startCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000); // Nettoyage toutes les 5 minutes
    }

    async storeFile(file: File | Blob): Promise<string> {
        const id = uuidv4();
        this.files.set(id, {
            id,
            data: file,
            timestamp: Date.now()
        });
        return id;
    }

    getFile(id: string): Blob | null {
        const fileData = this.files.get(id);
        return fileData ? fileData.data : null;
    }

    getFileUrl(id: string): string | null {
        const file = this.getFile(id);
        if (!file) return null;
        return URL.createObjectURL(file);
    }

    cleanup() {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30 minutes

        for (const [id, fileData] of this.files.entries()) {
            if (now - fileData.timestamp > maxAge) {
                this.files.delete(id);
            }
        }
    }

    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.files.clear();
    }
}
