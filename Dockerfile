FROM node:22

# Set working directory
WORKDIR /a

# Copy the entire project directory into the container
COPY . .

# Install dependencies
RUN npm install

# Run the build script
RUN npm run build

CMD ["npm", "run", "start"]
