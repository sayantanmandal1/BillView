# MongoDB Setup Options

You have several options to get MongoDB running for the PDF Review Dashboard:

## Option 1: MongoDB Atlas (Recommended - Free Cloud Database)

1. **Sign up for MongoDB Atlas**: https://www.mongodb.com/atlas
2. **Create a free cluster** (M0 Sandbox - Free forever)
3. **Get your connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
4. **Update your .env file**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pdf-dashboard
   ```

## Option 2: Local MongoDB Installation

### Windows:
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run automatically as a service
4. Your connection string: `mongodb://localhost:27017/pdf-dashboard`

### Using Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Option 3: Test Without Database (Limited Mode)

The API will run in limited mode without MongoDB - you can test the UI but won't be able to save data.

## Verify Connection

After setting up MongoDB, test the connection:
```bash
curl http://localhost:3001/health
```

You should see `"connected": true` in the response.