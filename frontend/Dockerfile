FROM node:current-alpine

COPY ./ /app
COPY .eslintrc*.js /

WORKDIR /app

# Reactivate at a later time, since we will do the version patch manually for now
# RUN npm version patch && npm install && npm run build
RUN npm ci && npm run build

# FROM nginx
FROM openresty/openresty
RUN mkdir /app
COPY --from=0 /app/dist /app
COPY ./nginx_binaries/http.lua /usr/local/openresty/lualib/resty/http.lua
COPY ./nginx_binaries/http_connect.lua /usr/local/openresty/lualib/resty/http_connect.lua
COPY ./nginx_binaries/http_headers.lua /usr/local/openresty/lualib/resty/http_headers.lua
COPY ./nginx.conf /usr/local/openresty/nginx/conf/nginx.conf

CMD ["/usr/local/openresty/bin/openresty", "-g", "daemon off;"]
