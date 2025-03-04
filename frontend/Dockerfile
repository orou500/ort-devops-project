# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_BACKEND_URL_DEV
ENV REACT_APP_BACKEND_URL_DEV=${REACT_APP_BACKEND_URL_DEV}

RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 3000

# Add custom nginx config to listen on port 3000
RUN sed -i 's/listen.*80;/listen 3000;/g' /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]