# Troubleshooting Guide

## MongoDB Connection Issues

If you're getting `connect ETIMEDOUT` error, follow these steps:

### 1. Check MongoDB Atlas IP Whitelist
- Go to MongoDB Atlas Dashboard
- Navigate to **Network Access** (or **IP Whitelist**)
- Click **Add IP Address**
- Add your current IP address OR add `0.0.0.0/0` to allow all IPs (for development only)
- Wait 1-2 minutes for changes to take effect

### 2. Verify Connection String
- Make sure your `.env` file has the correct format:
  ```
  MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
  ```
- Remove quotes around the MONGO_URI value
- Ensure password is URL-encoded if it contains special characters

### 3. Check Database User
- Go to MongoDB Atlas → **Database Access**
- Verify your database user exists and has proper permissions
- Reset password if needed

### 4. Test Connection
Try connecting with MongoDB Compass or mongosh to verify the connection string works.

### 5. Network Issues
- Check if your firewall is blocking port 27017
- Try using a different network (mobile hotspot) to test
- Check if your ISP is blocking MongoDB Atlas

## Common Fixes

### Fix 1: Update .env file
Remove quotes and add database name:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/online-exam-system?retryWrites=true&w=majority
```

### Fix 2: Whitelist IP in MongoDB Atlas
1. Login to MongoDB Atlas
2. Go to Network Access
3. Add IP Address: `0.0.0.0/0` (for development)
4. Save and wait 2 minutes

### Fix 3: Verify Connection String Format
The connection string should NOT have quotes in the .env file:
```
❌ MONGO_URI="mongodb+srv://..."
✅ MONGO_URI=mongodb+srv://...
```
