# Quick Fix for MongoDB Connection Error

## The Problem
You're getting: `MongoDB connection failed: connect ETIMEDOUT`

This means MongoDB Atlas is blocking your connection, most likely because your IP address is not whitelisted.

## Solution (2 minutes)

### Step 1: Whitelist Your IP in MongoDB Atlas

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Login** to your account
3. **Click on "Network Access"** (left sidebar, under Security)
4. **Click "Add IP Address"** button
5. **Choose one of these options:**
   - **Option A (Recommended for Development)**: Click "Allow Access from Anywhere" 
     - This adds `0.0.0.0/0` which allows all IPs
     - ⚠️ Only use this for development/testing
   - **Option B (More Secure)**: Click "Add Current IP Address"
     - This adds only your current IP
     - You'll need to update this if your IP changes
6. **Click "Confirm"**
7. **Wait 1-2 minutes** for the changes to take effect

### Step 2: Restart Your Server

After whitelisting your IP, restart the backend server:

```bash
cd backend
npm run dev
```

### Step 3: Test the Connection

If you want to test the connection separately:

```bash
cd backend
node test-connection.js
```

## What I Fixed

1. ✅ Updated `.env` file - removed quotes and added database name
2. ✅ Improved error messages in `db.js`
3. ✅ Created test script (`test-connection.js`)

## Still Having Issues?

1. **Check your connection string** in `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/online-exam-system?retryWrites=true&w=majority
   ```

2. **Verify database user**:
   - Go to MongoDB Atlas → Database Access
   - Make sure your user exists and password is correct

3. **Check network/firewall**:
   - Some networks block MongoDB connections
   - Try using mobile hotspot to test

4. **Test with MongoDB Compass**:
   - Download MongoDB Compass
   - Try connecting with your connection string
   - This will help identify if it's a code issue or network issue

## After Fixing

Once connected, you should see:
```
MongoDB Connected Successfully: cluster0-shard-00-00.xxxxx.mongodb.net
Server running on port 5000
```

Then you can start the frontend:
```bash
cd frontend
npm install  # if not already done
npm start
```
