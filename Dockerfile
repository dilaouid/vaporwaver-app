FROM node:20-slim AS base

RUN apt-get update && apt-get install -y \
    python3-full \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Installer les librairies Python
RUN pip3 install --no-cache-dir pillow opencv-python glitch-this

FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM base AS builder
WORKDIR /app
# Copier les dépendances Node installées
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY . .
# Désactiver la télémétrie Next.js (car nous sommes en mode standalone)
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV HOST=0.0.0.0

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier le répertoire public (images, etc.)
COPY --from=builder /app/public ./public

# Créer les dossiers nécessaires et ajuster les permissions
RUN mkdir -p .next tmp picts/backgrounds picts/miscs picts/crt && \
    chown -R nextjs:nodejs .next tmp picts

# Copier l’output standalone et les fichiers statiques générés par Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copier la totalité de la lib vaporwaver-ts afin d’inclure ses fichiers Python et autres ressources
# (En mode standalone, Next.js n’inclut pas forcément toute la hiérarchie de node_modules)
COPY --from=builder /app/node_modules/vaporwaver-ts ./node_modules/vaporwaver-ts

# Copier les assets images de la lib (backgrounds, miscs, crt)
COPY --from=builder /app/node_modules/vaporwaver-ts/picts/backgrounds/* ./picts/backgrounds/
COPY --from=builder /app/node_modules/vaporwaver-ts/picts/miscs/* ./picts/miscs/
COPY --from=builder /app/node_modules/vaporwaver-ts/picts/crt/* ./picts/crt/

RUN chown -R nextjs:nodejs .

USER nextjs

EXPOSE $PORT
ENV PORT=$PORT

# Démarrer l'application avec la commande "npm start" qui invoque "next start"
CMD ["npm", "start"]