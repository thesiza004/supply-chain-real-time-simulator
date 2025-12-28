FROM node:20-alpine AS builder

WORKDIR /app

# install dependencies (including dev deps needed for the Vite build)
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# copy sources and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config to enable SPA fallback
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
