FROM node:current-alpine

COPY ./ /app
COPY .eslintrc*.js /

WORKDIR /app

# Reactivate at a later time, since we will do the version patch manually for now
# RUN npm version patch && npm install && npm run build
RUN npm ci && npm run build

FROM nginx
RUN mkdir /app
COPY --from=0 /app/dist /app
COPY ./nginx.conf /etc/nginx/nginx.conf
