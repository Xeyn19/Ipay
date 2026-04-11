# Step 1: Use Node 20 on lightweight Alpine Linux
FROM node:20-alpine

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy package files first (for caching efficiency)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of your project
COPY . .

# Step 6: Build the Next.js app
RUN npm run build

# Step 7: Tell Docker this app uses port 3000
EXPOSE 3000

# Step 8: Start the app
CMD ["npm", "start"]