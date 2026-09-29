# Opcjonalne wdrożenie gry na własnym serwerze.
# Na sali szkoleniowej wystarczy „npm start” na laptopie prowadzącej — Docker nie jest potrzebny.
FROM node:22-slim

WORKDIR /gra

# najpierw manifesty, żeby warstwa z zależnościami nie przebudowywała się przy każdej zmianie kodu
COPY package.json package-lock.json ./
COPY packages/engine/package.json packages/engine/
COPY packages/server/package.json packages/server/
COPY packages/web/package.json packages/web/
COPY packages/print/package.json packages/print/
RUN npm ci --omit=optional

COPY . .
RUN npm run build:web

ENV HOST=0.0.0.0
ENV PORT=4173
EXPOSE 4173

# stan sesji to migawki JSON w katalogu .sesje — podepnij wolumen, jeśli ma przetrwać restart
VOLUME ["/gra/.sesje"]

CMD ["node", "--import", "tsx", "packages/server/src/main.ts"]
