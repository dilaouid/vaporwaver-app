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
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
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

# Create tmp directory with correct permissions
RUN mkdir -p /app/tmp && chown nextjs:nodejs /app/tmp && chmod 755 /app/tmp

# Copy public and static files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy the Python files and resources from vaporwaver-ts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/vaporwaver-ts/vaporwaver.py ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/vaporwaver-ts/data.py ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/vaporwaver-ts/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/vaporwaver-ts/picts ./picts

# Copy the standalone Next.js output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Create symlink for node_modules to ensure vaporwaver-ts can be found
RUN mkdir -p node_modules && \
    ln -s /app/node_modules/vaporwaver-ts node_modules/vaporwaver-ts

# Ensure Python can write to tmp
RUN chmod 777 /app/tmp

USER nextjs

# Use PORT from Railway
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

EXPOSE ${PORT}

CMD ["node", "server.js"]