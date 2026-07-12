# Use the official Bun image
FROM oven/bun:1-slim AS base
WORKDIR /usr/src/app

# Create non-root group and user
RUN groupadd -r appgroup && useradd -r -g appgroup -d /usr/src/app appuser

# Copy package files and Prisma schema with appropriate ownership
COPY --chown=appuser:appgroup package.json bun.lock ./
COPY --chown=appuser:appgroup prisma ./prisma/

# Install dependencies (triggers postinstall: prisma generate)
RUN bun install --frozen-lockfile

# Copy the rest of the source code
COPY --chown=appuser:appgroup src ./src
COPY --chown=appuser:appgroup entrypoint.js ./

# Set correct ownership for the workspace
RUN chown -R appuser:appgroup /usr/src/app

# Expose the API port
EXPOSE 8080

# Set environment production flag
ENV NODE_ENV=production

# Switch to non-root user
USER appuser

# Use entrypoint script to clean environment variables
ENTRYPOINT ["bun", "run", "./entrypoint.js"]

# Run migrations and start the application
CMD ["bun", "run", "start"]
