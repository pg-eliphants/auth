FROM node:18.15.0-alpine as builder
WORKDIR /build
COPY . ./
RUN npm i
RUN npm run build

FROM node:18.15.0-alpine as final
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /build/dist ./dist
COPY --from=builder [ "/build/package.json", "/build/package-lock.json", "/build/LICENSE.txt", "./"]
RUN npm ci --only=production
CMD ["npm", "start"]
