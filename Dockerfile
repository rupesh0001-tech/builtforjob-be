# Use the official Bun image
FROM oven/bun:1-slim AS base
WORKDIR /usr/src/app

# Copy package files and Prisma schema
COPY package.json bun.lock ./
COPY prisma ./prisma/

# Install dependencies (triggers postinstall: prisma generate)
RUN bun install --frozen-lockfile

# Copy the rest of the source code
COPY src ./src
COPY entrypoint.js ./

# Expose the API port
EXPOSE 8080

# Set environment production flag
ENV NODE_ENV=production

# Use entrypoint script to clean environment variables
ENTRYPOINT ["bun", "run", "./entrypoint.js"]

# Run migrations and start the application
CMD ["bun", "run", "start"]
