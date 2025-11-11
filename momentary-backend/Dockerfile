# 1. Start from a lightweight Node.js image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json
# We copy these first to cache our 'npm install' step
COPY package*.json ./

# 4. Install all dependencies
RUN npm install

# 5. Copy the rest of the project files (src, tsconfig, etc.)
COPY . .

# 6. Compile TypeScript to JavaScript (output goes to 'dist')
RUN npm run build

# 7. Expose the port the app runs on
EXPOSE 8080

# 8. The command to run when the container starts
# We run the compiled JavaScript file
CMD [ "node", "dist/index.js" ]