FROM node:24-alpine
WORKDIR /repo
COPY package.json package-lock.json ./
COPY api/package.json api/
COPY dashboard/package.json dashboard/
COPY packages/shared/package.json packages/shared/
RUN npm ci -w dashboard
COPY packages/shared packages/shared
COPY dashboard dashboard
WORKDIR /repo/dashboard
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
