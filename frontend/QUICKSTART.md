# UrbanPatch - Quick Start Guide

Get UrbanPatch up and running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- MongoDB running locally or connection string ready
- Git (optional)

## Step 1: Clone or Download

```bash
# If using Git
git clone https://github.com/yourusername/urbanpatch.git
cd urbanpatch

# Or download and extract the ZIP file
```

## Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# At minimum, set:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (any random string)

# Start the backend server
npm run dev
```

Backend should now be running on `http://localhost:5000`

## Step 3: Setup Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Frontend .env should have:
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Start the frontend
npm start
```

Frontend should open automatically at `http://localhost:3000`

## Step 4: Create Your First Account

1. Click "Login" in the top right
2. Click "Don't have an account? Sign up"
3. Fill in your details:
   - Name: Your Name
   - Email: your.email@example.com
   - Password: (at least 6 characters)
4. Click "Sign Up"

## Step 5: Report Your First Issue

1. Click the "➕ Report Issue" button
2. Click anywhere on the map to select a location
3. Fill in the form:
   - **Title**: "Broken streetlight on Main Street"
   - **Description**: "The streetlight has been out for 3 days"
   - **Severity**: Select "High"
   - **Tags**: "streetlight, safety"
4. Optionally upload a photo
5. Click "Report Issue"

🎉 Your issue should now appear on the map!

## Step 6: Try Other Features

### Upvote an Issue
- Click on any marker on the map
- Click the "View Details" button
- Click the 👍 button to upvote

### Add a Comment
- On the issue detail page
- Scroll to the comments section
- Type your comment and click "Post Comment"

### Filter Issues
- Click "Show Filters" on the home page
- Select severity levels, statuses, or tags
- Watch the map update in real-time

### View Your Profile
- Click "Profile" in the navigation bar
- See your reported issues and upvoted issues
- View your activity statistics

## Admin Features (Optional)

To test admin features, you need to manually update a user to admin role in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your.email@example.com" },
  { $set: { role: "admin" } }
)
```

Then:
1. Log out and log back in
2. Click "Admin" in the navigation bar
3. View all issues, verify, close, or export data

## Real-time Testing

Open the app in two browser windows:
1. Report an issue in window 1
2. Watch it appear instantly in window 2! ✨
3. Upvote in window 2
4. See the count update in window 1

## Troubleshooting

### Backend won't start
- **MongoDB not running**: Start MongoDB service
- **Port 5000 in use**: Change PORT in backend .env
- **Dependencies issue**: Delete node_modules and run `npm install` again

### Frontend won't start
- **Port 3000 in use**: It will ask to use 3001 - accept
- **API connection fails**: Check backend is running on port 5000
- **Map not loading**: Check internet connection (map tiles from internet)

### Can't see real-time updates
- Check browser console for Socket.io connection errors
- Verify REACT_APP_SOCKET_URL matches backend URL
- Try refreshing the page

### Upload issues
- Check file size (max 5MB per image)
- Verify supported formats (PNG, JPG, JPEG, GIF)
- Check backend upload configuration

## Next Steps

- Customize the map center location in `MapView.js`
- Add your own issue tags in `FilterSidebar.js`
- Modify colors and styling in `main.css`
- Set up email notifications (see backend README)
- Configure cloud storage for images (Cloudinary/S3)
- Deploy to production (see deployment guides)

## Default Test Accounts

For testing, you can create these accounts:

**Regular User**
- Email: user@test.com
- Password: test123

**Admin User** (after manual role update in DB)
- Email: admin@test.com
- Password: admin123

## Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| "Cannot connect to MongoDB" | Start MongoDB: `mongod` or check connection string |
| Map tiles not loading | Check internet connection |
| Images not uploading | Increase backend upload limits in config |
| Real-time not working | Restart both frontend and backend servers |
| Login not working | Check JWT_SECRET is set in backend .env |

## Development Tips

- Use Chrome DevTools for debugging
- Check Network tab for API call issues
- Use Redux DevTools for state management debugging
- Enable React Developer Tools for component inspection
- Check browser console for errors

## Production Checklist

Before deploying:
- [ ] Set strong JWT_SECRET
- [ ] Use production MongoDB instance
- [ ] Configure CORS for your domain
- [ ] Set up SSL/HTTPS
- [ ] Configure image storage (Cloudinary/S3)
- [ ] Set up email service
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Test on multiple devices
- [ ] Run security audit

## Getting Help

- Check the full README.md files in backend and frontend folders
- Look at code comments for detailed explanations
- Open an issue on GitHub
- Check the documentation

---

Happy neighborhood improving! 🏘️✨