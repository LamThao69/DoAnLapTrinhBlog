FROM node:18-alpine
WORKDIR /app

# Install system deps (postgresql client for migrations)
RUN apk add --no-cache bash postgresql-client

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app
COPY . .

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["./entrypoint.sh"]
