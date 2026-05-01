FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Run in dev mode for hot reloading
CMD ["npm", "run", "dev", "--", "--host"]
