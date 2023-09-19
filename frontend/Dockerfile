FROM node:current-alpine

COPY ./ /app
COPY .eslintrc*.js /

WORKDIR /app

# Reactivate at a later time, since we will do the version patch manually for now
# RUN npm version patch && npm install && npm run build
RUN npm ci && npm run build

FROM openresty/openresty
RUN mkdir /app
COPY --from=0 /app/dist /app
ADD ./nginx.conf /conf/nginx.conf

CMD ["/usr/local/openresty/bin/openresty", "-g", "daemon off;", "-p", "/app", "-c", "/conf/nginx.conf"]
