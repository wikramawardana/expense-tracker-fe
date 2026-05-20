# ================================
# Stage 1: Dependencies
# ================================
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm. Pinned to a specific version to avoid breakage from
# `pnpm@latest` rolling forward. pnpm 10.4.0 was released Feb 2025
# and predates the strict ERR_PNPM_IGNORED_BUILDS gate that the very
# latest pnpm releases enforce on docker builds.
RUN corepack enable && corepack prepare pnpm@10.4.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (HUSKY=0 disables the husky prepare script during
# `pnpm install`; the .git directory is excluded by .dockerignore so husky
# would otherwise fail with "can't find .git")
ENV HUSKY=0
RUN pnpm install --frozen-lockfile

# ================================
# Stage 2: Builder
# ================================
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm (pinned, see deps stage above)
RUN corepack enable && corepack prepare pnpm@10.4.0 --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_BASE_URL

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN mkdir -p public

# Build with dummy server-side env vars (real values provided at runtime)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    BETTER_AUTH_SECRET="dummy-secret-for-build-only" \
    AUTH_CLIENT_ID="dummy" \
    AUTH_CLIENT_SECRET="dummy" \
    pnpm build

# ================================
# Stage 3: Runner (Production)
# ================================
FROM node:22-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Start the application
CMD ["node", "server.js"]
