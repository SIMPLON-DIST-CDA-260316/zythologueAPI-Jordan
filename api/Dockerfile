FROM node:24-alpine
WORKDIR /repo
COPY package.json package-lock.json ./
COPY api/package.json api/
COPY dashboard/package.json dashboard/
COPY packages/shared/package.json packages/shared/
RUN npm ci -w api
COPY packages/shared packages/shared
COPY api api
WORKDIR /repo/api
EXPOSE 3000
CMD ["npm", "run", "dev:app"]
