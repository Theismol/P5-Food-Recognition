# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the app dependencies
RUN npm install --production

# Copy the rest of the application code
COPY ./src ./src
COPY ./index.js ./

# Expose the port your app runs on
EXPOSE 2000

# Command to run the app
CMD ["node", "index.js"]

