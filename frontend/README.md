# FixItNow Frontend

A modern React.js frontend for the Smart Complaint & Maintenance Portal with role-based access control and real-time features.

## Features

- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Role-based Access**: Different interfaces for Students, Staff, Maintenance, and Admin
- **Authentication**: Secure login/register with JWT tokens
- **Complaint Management**: Create, view, and track maintenance requests
- **Image Upload**: Before/after photos for complaints
- **QR Code Integration**: Location tagging for complaints
- **Real-time Updates**: Live status tracking
- **Advanced Filtering**: Search and filter complaints by various criteria
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **React.js** - Frontend framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Icons** - Icon library
- **Chart.js** - Analytics and charts
- **CSS-in-JS** - Styled components with styled-jsx

## Prerequisites

- Node.js v24.0.2 or higher
- npm or yarn package manager
- Backend API running (see backend README)

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.js       # Navigation component
├── contexts/           # React contexts
│   └── AuthContext.js  # Authentication context
├── pages/              # Page components
│   ├── Login.js        # Login page
│   ├── Register.js     # Registration page
│   ├── Dashboard.js    # Main dashboard
│   ├── ComplaintForm.js # New complaint form
│   ├── ComplaintList.js # Complaints list
│   ├── ComplaintDetail.js # Single complaint view
│   ├── AdminDashboard.js # Admin dashboard
│   ├── MaintenanceDashboard.js # Maintenance dashboard
│   └── Profile.js      # User profile
├── App.js              # Main app component
├── App.css             # Global styles
└── index.js            # App entry point
```

## User Roles & Features

### Student/Staff
- Submit new complaints
- View their own complaints
- Track complaint status
- Upload photos
- Update profile

### Maintenance Staff
- View assigned complaints
- Update complaint status
- Add notes and comments
- Upload after photos
- Mark complaints as resolved

### Admin
- View all complaints
- Manage users
- Analytics and reports
- Assign complaints to maintenance staff
- Export data
- System overview

## Key Components

### Authentication
- JWT-based authentication
- Protected routes
- Role-based access control
- Automatic token refresh

### Complaint Management
- Multi-step complaint form
- Image upload with preview
- QR code scanning (manual input)
- Real-time status updates
- Advanced filtering and search

### Dashboard
- Role-specific dashboards
- Statistics and analytics
- Quick actions
- Recent activity

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`:

- **Authentication**: `/auth/*`
- **Complaints**: `/complaints/*`
- **Admin**: `/admin/*`

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Development

### Code Style
- Use functional components with hooks
- Follow React best practices
- Use styled-jsx for component-specific styles
- Implement proper error handling

### State Management
- Use React Context for global state
- Local state for component-specific data
- Proper loading and error states

### Responsive Design
- Mobile-first approach
- Breakpoints: 768px, 1024px
- Touch-friendly interactions

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder**
   - Upload to your web server
   - Configure for single-page application routing
   - Set up environment variables

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
