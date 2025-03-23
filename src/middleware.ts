import { NextRequest, NextResponse } from 'next/server';

interface RateLimit {
    windowSizeInSeconds: number;
    maxRequests: number;
}

interface RateLimitConfig {
    [path: string]: RateLimit;
}

interface RequestData {
    count: number;
    startTime: number;
    windowSizeInSeconds: number;
}

// Configuration spécifique pour vaporwaver.dilaouid.fr
const API_RATE_LIMITS: RateLimitConfig = {
    '/api/assets': {
        windowSizeInSeconds: 60,
        maxRequests: 120,
    },
    '/api/generate': {
        windowSizeInSeconds: 60,
        maxRequests: 20,
    },
    '/api/preview-effects': {
        windowSizeInSeconds: 60,
        maxRequests: 30,
    },
    'default': {
        windowSizeInSeconds: 60,
        maxRequests: 100,
    }
};

// Stockage des requêtes par IP et par route
const requestStore = new Map<string, RequestData>();

// Fonction pour nettoyer le stockage périodiquement
function cleanupStore(): void {
    const now = Math.floor(Date.now() / 1000);
    for (const [key, data] of requestStore.entries()) {
        if (now - data.startTime > data.windowSizeInSeconds * 2) {
            requestStore.delete(key);
        }
    }
}

// Planifier le nettoyage toutes les 10 minutes
if (typeof global !== 'undefined') {
    setInterval(cleanupStore, 10 * 60 * 1000);
}

export function middleware(request: NextRequest): NextResponse {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const currentTime = Math.floor(Date.now() / 1000);
    const path = request.nextUrl.pathname;

    // Ignorer les ressources statiques
    if (
        path.includes('.jpg') ||
        path.includes('.png') ||
        path.includes('.css') ||
        path.includes('.svg') ||
        path.includes('.ico') ||
        path.includes('.js') && !path.includes('/api/')
    ) {
        return NextResponse.next();
    }

    // Déterminer quelle limite de taux s'applique
    let rateLimit: RateLimit | undefined;
    for (const apiPath in API_RATE_LIMITS) {
        if (apiPath !== 'default' && path.startsWith(apiPath)) {
            rateLimit = API_RATE_LIMITS[apiPath];
            break;
        }
    }

    // Utiliser la limite par défaut si aucune limite spécifique n'est trouvée
    if (!rateLimit) {
        rateLimit = API_RATE_LIMITS['default'];
    }

    // Créer une clé unique pour cette IP et cette route
    const storeKey = `${ip}:${path}`;

    // Vérifier si combinaison IP/route est déjà enregistrée
    if (!requestStore.has(storeKey)) {
        requestStore.set(storeKey, {
            count: 1,
            startTime: currentTime,
            windowSizeInSeconds: rateLimit.windowSizeInSeconds
        });
        return NextResponse.next();
    }

    const requestData = requestStore.get(storeKey);

    // Si requestData est undefined (ce qui ne devrait pas arriver), traiter comme nouvelle requête
    if (!requestData) {
        requestStore.set(storeKey, {
            count: 1,
            startTime: currentTime,
            windowSizeInSeconds: rateLimit.windowSizeInSeconds
        });
        return NextResponse.next();
    }

    // Réinitialiser le compteur si la fenêtre de temps est dépassée
    if (currentTime - requestData.startTime > rateLimit.windowSizeInSeconds) {
        requestStore.set(storeKey, {
            count: 1,
            startTime: currentTime,
            windowSizeInSeconds: rateLimit.windowSizeInSeconds
        });
        return NextResponse.next();
    }

    // Si le nombre de requêtes dépasse la limite, bloquer
    if (requestData.count >= rateLimit.maxRequests) {
        console.log(`Rate limit exceeded for IP: ${ip} on path: ${path}`);
        return new NextResponse('Too Many Requests', {
            status: 429,
            headers: {
                'Retry-After': String(rateLimit.windowSizeInSeconds),
                'Content-Type': 'text/plain',
            },
        });
    }

    requestData.count += 1;
    requestStore.set(storeKey, requestData);

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/assets',
        '/api/generate',
        '/api/preview-effects',
        '/chunks/:path*',
        '/_next/static/chunks/:path*',
    ],
};