# Specifies the image of your engine
FROM node:14
# The working directory inside your container
WORKDIR /app

# Get the package.json first to install dependencies
COPY package.json /app

# This will install those dependencies
RUN npm install -g nodemon
RUN npm install
# Copy the rest of the app to the working directory
COPY . /app
# Run the container
CMD ["npm", "start"]


# FROM node:14
# WORKDIR /app
# COPY package.json .
# RUN npm install
# RUN npm install pm2
# COPY . .
# CMD ["pm2-runtime -i 0", "src/index.js"]
