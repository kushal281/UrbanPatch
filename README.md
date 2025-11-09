# UrbanPatch Frontend

Community-driven micro-improvement platform for neighborhoods. Report, track, and fix local issues with real-time updates and interactive maps.

## Features

- 🗺️ **Interactive Map** - View and report issues on an interactive map with clustering
- 📍 **Geolocation** - Automatically center map on your current location
- 📸 **Photo Uploads** - Attach photos to issue reports
- 👍 **Upvoting System** - Support issues that matter to you
- 💬 **Real-time Comments** - Discuss issues with other community members
- 🔔 **Live Updates** - See new issues and updates in real-time via WebSocket
- 🎯 **Advanced Filtering** - Filter by severity, status, and tags
- 📊 **Admin Dashboard** - Verify, close, and manage issues
- 📤 **Export Data** - Export issues as CSV or GeoJSON
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **React 18** - UI library
- **React Router** - Navigation
- **React Bootstrap** - UI components
- **Leaflet** - Interactive maps
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **React Dropzone** - File uploads
- **date-fns** - Date formatting

## Prerequisites

- Node.js 16+ and npm
- Backend server running (see backend README)

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

5. **Start development server**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # HTML template
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # React components
│   │   ├── AdminPanel.js   # Admin dashboard
│   │   ├── CommentSection.js
│   │   ├── FilterSidebar.js
│   │   ├── IssueCard.js
│   │   ├── IssueForm.js
│   │   ├── IssueList.js
│   │   ├── Loader.js
│   │   ├── MapView.js      # Map component
│   │   └── Navbar.js
│   ├── context/
│   │   └── AuthContext.js  # Authentication state
│   ├── pages/
│   │   ├── Home.js         # Main map view
│   │   ├── IssuePage.js    # Issue details
│   │   ├── Login.js        # Auth page
│   │   └── Profile.js      # User profile
│   ├── styles/
│   │   └── main.css        # Global styles
│   ├── api.js              # API configuration
│   ├── socket.js           # Socket.io setup
│   ├── App.js              # Main app component
│   └── index.js            # Entry point
├── package.json
└── README.md
```

## Features Guide

### For Users

1. **Browse Issues**
   - View all reported issues on the interactive map
   - Click clusters to zoom in and see individual issues
   - Click markers to see issue details

2. **Report an Issue**
   - Click "Report Issue" button
   - Click on the map to select location
   - Fill in title, description, severity, and tags
   - Upload photos (optional)
   - Submit

3. **Engage with Issues**
   - Upvote issues you care about
   - Add comments and suggestions
   - View issue history and updates

4. **Track Your Activity**
   - View your reported issues in your profile
   - See issues you've upvoted
   - Track resolution status

### For Admins/Moderators

1. **Access Admin Dashboard**
   - Navigate to `/admin` (link appears in navbar for admins)

2. **Manage Issues**
   - Verify legitimate issues
   - Close resolved or invalid issues
   - Delete spam or inappropriate content

3. **Export Data**
   - Export issues as CSV for spreadsheet analysis
   - Export as GeoJSON for GIS software

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `REACT_APP_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |

## Real-time Features

The app uses Socket.io for real-time updates:

- **New Issues** - See new issues appear on the map instantly
- **Upvotes** - Vote counts update in real-time
- **Comments** - New comments appear immediately
- **Status Changes** - See when issues are verified or closed

## Customization

### Map Settings
Edit `src/components/MapView.js`:
- Change default center coordinates
- Adjust zoom levels
- Customize marker icons

### Styling
Edit `src/styles/main.css`:
- Update color scheme (CSS variables)
- Modify spacing and layout
- Customize component styles

### Issue Categories
Edit `src/components/FilterSidebar.js`:
- Add or remove severity levels
- Customize available tags
- Modify status options

## Production Build

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Serve static files**
   - The build folder contains optimized production files
   - Serve with any static hosting service (Netlify, Vercel, etc.)
   - Or serve from your backend server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Troubleshooting

### Map not loading
- Check that Leaflet CSS is properly loaded
- Verify tile server URLs are accessible
- Check browser console for errors

### Real-time updates not working
- Ensure backend Socket.io server is running
- Check CORS settings on backend
- Verify Socket.io connection in browser console

### Authentication issues
- Clear localStorage and try again
- Check token expiration settings
- Verify backend auth endpoints

### Images not uploading
- Check file size limits (max 5MB)
- Verify upload endpoint configuration
- Check backend storage configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Contact the development team
- Check documentation

---

Built with ❤️ for better neighborhoods