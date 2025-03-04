# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install any needed dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Add build arguments
ARG BASE_URL_DEV
ARG AUTH_SECRET
ARG DB_PASS
ARG DB_USER
ARG DB_URL_DEV
ARG JWT_KEY
ARG REFRESH_TOKEN_KEY
ARG MAIL_PASS
ARG MAIL_USER
ARG MAIL_USER2
ARG MAIL_PASS2
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG SESSION_SECRET

# Set environment variables from build arguments
ENV BASE_URL_DEV=${BASE_URL_DEV} \
    AUTH_SECRET=${AUTH_SECRET} \
    DB_PASS=${DB_PASS} \
    DB_USER=${DB_USER} \
    DB_URL_DEV=${DB_URL_DEV} \
    JWT_KEY=${JWT_KEY} \
    REFRESH_TOKEN_KEY=${REFRESH_TOKEN_KEY} \
    MAIL_PASS=${MAIL_PASS} \
    MAIL_USER=${MAIL_USER} \
    MAIL_USER2=${MAIL_USER2} \
    MAIL_PASS2=${MAIL_PASS2} \
    GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID} \
    GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET} \
    SESSION_SECRET=${SESSION_SECRET}

# Expose the port your app runs on
EXPOSE 3010

# Command to run your app
CMD ["npm", "start"]