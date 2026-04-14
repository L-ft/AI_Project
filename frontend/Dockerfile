FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 域名反代时可传入：--build-arg VITE_MGMT_API_URL=/api --build-arg VITE_EXEC_ENGINE_URL=/engine
# 或复制 .env.production（见 .env.production.domain.example）
ARG VITE_MGMT_API_URL
ARG VITE_EXEC_ENGINE_URL
ARG VITE_DATA_BUILDER_URL
ENV VITE_MGMT_API_URL=$VITE_MGMT_API_URL
ENV VITE_EXEC_ENGINE_URL=$VITE_EXEC_ENGINE_URL
ENV VITE_DATA_BUILDER_URL=$VITE_DATA_BUILDER_URL
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
