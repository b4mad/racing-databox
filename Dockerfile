# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the app
RUN yarn build:prod

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create required directories and set permissions for OpenShift
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
    chmod -R g+rwx /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html && \
    chgrp -R root /var/cache/nginx /var/run /var/log/nginx && \
    chmod -R g+rwx /etc/nginx && \
    chgrp -R root /etc/nginx

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Use non-root user
USER nginx

# Expose port 8080 (OpenShift preferred)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
