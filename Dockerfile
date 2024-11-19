# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy build configuration files
COPY tsconfig.json tsconfig.app.json webpack.config.js index.html .babelrc ./

# Copy source code and public assets
COPY src/ ./src/
COPY public/favicon.png ./public/

# Build the app
RUN yarn build:prod

# Production stage
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/public/favicon.png /usr/share/nginx/html/

# Create required directories and set permissions for OpenShift
# RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
#     chmod -R g+rwx /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html && \
#     chgrp -R root /var/cache/nginx /var/run /var/log/nginx && \
#     chmod -R g+rwx /etc/nginx && \
#     chgrp -R root /etc/nginx

# Copy custom nginx config
# COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/templates/nginx.conf.template

ENV DATA_BOX_GRAPHQL_URL=http://postgraphile.b4mad-racing.svc.cluster.local:5000/graphql
ENV DATA_BOX_API_URL=http://paddock.b4mad-racing.svc.cluster.local:8000/api/
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx

# Use non-root user
# USER nginx

# Expose port 8080 (OpenShift preferred)
# EXPOSE 8080

# Start nginx
# CMD ["nginx", "-g", "daemon off;"]
