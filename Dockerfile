###################

# BUILD FOR LOCAL DEVELOPMENT

###################

FROM node:18 As development
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

WORKDIR /app

COPY --chown=node:node pnpm-lock.yaml ./

# 设置pnpm的镜像加速
RUN pnpm config set registry https://registry.npmmirror.com
RUN pnpm fetch --prod

COPY --chown=node:node . .
RUN pnpm install

USER node

###################

# BUILD FOR PRODUCTION

###################

FROM node:18 As build
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

WORKDIR /app

COPY --chown=node:node pnpm-lock.yaml ./

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

RUN pnpm build

ENV NODE_ENV production

RUN pnpm install --prod

USER node

###################

# PRODUCTION

###################

FROM node:18-alpine As production

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

ENV NODE_ENV production

CMD [ "node", "dist/src/main.js" ]
