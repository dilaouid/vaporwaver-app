FROM node:20-slim AS base

# Install Python and required packages
RUN apt-get update && apt-get install -y \
    python3-full \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install required Python packages in the virtual environment
RUN pip3 install --no-cache-dir pillow opencv-python glitch-this

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public directory which contains the necessary images
COPY --from=builder /app/public ./public

# Create necessary directories
RUN mkdir -p .next tmp picts/backgrounds picts/miscs picts/crt \
    && chown -R nextjs:nodejs .next tmp picts

# Copy the Python files from vaporwaver-ts
# COPY --from=builder /app/node_modules/vaporwaver-ts/vaporwaver.py ./
# COPY --from=builder /app/node_modules/vaporwaver-ts/data.py ./
# COPY --from=builder /app/node_modules/vaporwaver-ts/lib ./lib

# Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy necessary image assets from vaporwaver-ts
COPY --from=builder /app/node_modules/vaporwaver-ts/picts/backgrounds/* ./picts/backgrounds/
COPY --from=builder /app/node_modules/vaporwaver-ts/picts/miscs/* ./picts/miscs/
COPY --from=builder /app/node_modules/vaporwaver-ts/picts/crt/* ./picts/crt/

# Ensure proper permissions
RUN chown -R nextjs:nodejs .

USER nextjs

EXPOSE $PORT

# Railway will provide these values at runtime
ENV PORT=$PORT

CMD ["node", "server.js"]