# BU Library Admin Dashboard

<div align="center">
  <img src="https://img.shields.io/badge/React-18.0+-blue" alt="React">
  <img src="https://img.shields.io/badge/Ant_Design-5.0+-blue" alt="Ant Design">
  <img src="https://img.shields.io/badge/Supabase-Integrated-green" alt="Supabase">
  <img src="https://img.shields.io/badge/Vite-Latest-purple" alt="Vite">
</div>

## 📚 Overview

Professional admin dashboard for managing Boston University Library room bookings with direct Supabase integration. This React application provides library staff with comprehensive tools for room management, booking oversight, and analytics.

## ✨ Key Features

### 🎯 Core Administration
- **Room Management**: Add, edit, and configure study rooms
- **Booking Oversight**: Monitor all reservations and usage patterns
- **Real-time Analytics**: Usage statistics and reporting dashboards
- **User Management**: Handle user accounts and permissions
- **Maintenance Scheduling**: Manage room maintenance and closures

### 🔧 Technical Features
- **Direct Supabase Integration**: Serverless architecture with real-time data
- **Connection-Aware Architecture**: Intelligent connection status monitoring
- **Professional UI**: Ant Design components with responsive layout
- **Skeleton Loading**: Professional loading states for better UX
- **Real-time Updates**: Live synchronization with database changes

## 🚀 Tech Stack

- **Frontend Framework**: React 18 with JavaScript
- **Build Tool**: Vite with Hot Module Replacement
- **UI Library**: Ant Design 5.0+ for professional components
- **Database**: Direct Supabase integration (PostgreSQL)
- **Architecture**: Serverless with real-time data synchronization
- **State Management**: React Context API with connection monitoring
- **Styling**: Ant Design theming with responsive design

## 📈 Migration Status

**✅ FULLY MIGRATED TO SUPABASE** - This project has been successfully migrated from Flask backend to direct Supabase API calls.

### Migration Benefits:
- ⚡ **Improved Performance**: Direct database access eliminates backend overhead
- 🔒 **Enhanced Security**: Row-level security policies at database level
- 📊 **Real-time Data**: Live updates without polling
- 🌐 **Serverless Architecture**: No backend server maintenance required
- 💰 **Cost Effective**: Reduced infrastructure complexity

### What Changed:
- ✅ Removed dependency on `bub-backend` Python server
- ✅ Updated `apiService.js` to use `supabaseService.js` directly  
- ✅ Environment variables now use `VITE_SUPABASE_*` instead of `VITE_BACKEND_URL`
- ✅ All API methods now call Supabase database directly
- ✅ Implemented real-time subscriptions for live data updates

## �📁 Project Structure

```
admin-page/
├── src/
│   ├── components/
│   │   └── SkeletonComponents.jsx    # Loading skeleton components
│   ├── contexts/
│   │   └── ConnectionContext.jsx     # Connection state management
│   ├── pages/
│   │   ├── DashboardPage.jsx         # System overview
│   │   ├── BookingsPage.jsx          # Booking management
│   │   ├── LocationsPage.jsx         # Location management
│   │   ├── StatisticsPage.jsx        # Analytics & reports
│   │   ├── AvailabilityPage.jsx      # Availability management
│   │   └── DataMonitorPage.jsx       # Data monitoring
│   ├── services/
│   │   ├── apiService.js             # Main API service (now uses Supabase)
│   │   ├── supabaseService.js        # Direct Supabase operations
│   │   ├── locationService.js        # Location management
│   │   ├── bookingService.js         # Booking operations
│   │   └── statsService.js           # Statistics & analytics
│   └── lib/
│       └── supabase.js               # Supabase client configuration
│   │   ├── bookingService.js         # Booking operations
│   │   ├── locationService.js        # Location data
│   │   ├── statsService.js           # Statistics
│   │   ├── apiService.js             # LibCal API integration
│   │   └── dataMonitorService.js     # Data monitoring
│   └── layouts/
│       └── MainLayout.jsx            # Main application layout
├── public/
└── package.json
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18.0+ and npm
- Supabase account and project setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Backend API (for hybrid mode)
VITE_BACKEND_API_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:5174`

### 4. Build for Production
```bash
npm run build
npm run preview  # Preview production build
```

## � Project Architecture

### Environment Variables

**Required Configuration:**
```env
# Supabase Database (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Backend API for hybrid mode
VITE_BACKEND_API_URL=http://localhost:5000
```

**Security Notes:**
- Never commit `.env.local` files to version control
- Use environment-specific configurations for staging/production
- Ensure Supabase Row Level Security (RLS) policies are properly configured

### Connection Context

The application uses a centralized connection context that monitors:
- **Supabase Database**: Real-time connection status and health
- **Backend API**: Optional Flask backend availability  
- **Network State**: Connection reliability and error handling
- **Auto-retry Logic**: Automatic reconnection attempts

## 📊 API Integration

See [API_DOCUMENTATION.md](./markdowns/API_DOCUMENTATION.md) for detailed API specifications.

## 📚 Technical Documentation

All technical documentation has been organized in the [`markdowns/`](./markdowns/) folder:

- **Database**: Field mappings and data structure documentation
- **Geocoding**: Analysis, debugging guides, and fix reports  
- **API**: Integration guides and specifications
- **Supabase**: Setup guides and troubleshooting
- **Development**: Copilot instructions and console cleanup

See [`markdowns/README.md`](./markdowns/README.md) for a complete documentation index.

## 🎨 UI Components & Design

### Professional Components
- **ConnectionStatus**: Real-time connection indicator with status badges
- **TableSkeleton**: Loading states for data tables with shimmer effects
- **PageLoadingSkeleton**: Full page loading states during navigation
- **DataUnavailablePlaceholder**: Graceful error and offline state handling

### Design System
- **Ant Design Integration**: Professional component library with consistent theming
- **Responsive Layout**: Mobile-first design with breakpoint optimization
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Color Scheme**: Professional blue/gray palette suitable for administrative interfaces

### Loading States
```jsx
// Example skeleton loading implementation
<TableSkeleton 
  rows={5} 
  columns={4} 
  loading={isLoading}
  title="Loading bookings..."
/>
```

## 📊 Data Management

### Real-time Features
- **Live Updates**: Automatic data refresh using Supabase subscriptions
- **Optimistic Updates**: Immediate UI feedback with rollback on errors
- **Conflict Resolution**: Handles concurrent modifications gracefully
- **Offline Support**: Cached data and queue sync when connection restored

### Performance Optimization
- **Data Pagination**: Efficient loading of large datasets
- **Query Optimization**: Selective field loading and filtering
- **Caching Strategy**: Smart caching with TTL and invalidation
- **Batch Operations**: Efficient bulk updates and deletions

## 🐛 Troubleshooting

### Common Issues

**Supabase Connection Problems**
```bash
# Check environment variables
console.log(import.meta.env.VITE_SUPABASE_URL)

# Verify Supabase project status
# Visit: https://supabase.com/dashboard/projects

# Test connection in browser console
import { supabase } from './src/lib/supabase'
supabase.from('rooms').select('*').limit(1)
```

**Authentication Issues**
- Verify Supabase RLS policies are correctly configured
- Check anon key permissions in Supabase dashboard
- Ensure proper table access permissions

**Build and Development Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for JavaScript errors
npm run lint
```

## 🔐 Security & Permissions

### Database Security
- **Row Level Security**: Supabase RLS policies for data protection
- **API Key Management**: Secure handling of Supabase credentials
- **Admin Authentication**: Future implementation for admin access control
- **Audit Logging**: Track administrative actions and changes

### Best Practices
- Regular security updates for dependencies
- Environment variable validation
- Input sanitization for all user inputs
- Secure error handling without data leakage

## 🔗 Related Projects

- **[bu-book](../bu-book/)**: Main booking interface for students and faculty
- **[bub-backend](../bub-backend/)**: Optional Python backend API (legacy)
- **[Main Project](../README.md)**: Complete system documentation

## 🆕 Recent Updates (August 2024)

### Supabase Migration Completion
- ✅ **Full Migration**: Successfully migrated from Flask backend to direct Supabase
- ✅ **Performance Improvements**: Eliminated backend overhead for faster data access  
- ✅ **Real-time Features**: Implemented live data subscriptions
- ✅ **Serverless Architecture**: Reduced infrastructure complexity

### Enhanced Admin Features
- ✅ **Connection Monitoring**: Real-time database connection status
- ✅ **Professional UI**: Updated Ant Design components with skeleton loading
- ✅ **Error Handling**: Improved error states and recovery mechanisms
- ✅ **Performance Optimization**: Efficient data loading and caching strategies

### Security Enhancements
- ✅ **RLS Policies**: Implemented proper Row Level Security
- ✅ **Environment Security**: Secure credential management
- ✅ **Input Validation**: Comprehensive client-side validation
- ✅ **Audit Logging**: Administrative action tracking

## 🤝 Contributing

### Development Guidelines
1. Follow existing React component patterns
2. Use Ant Design components for consistency
3. Implement proper loading states with skeletons
4. Test connection states and error handling
5. Document any new API integrations

### Code Quality
```bash
npm run lint          # ESLint code quality checks
npm run format        # Code formatting (if configured)
npm run type-check    # TypeScript validation (if applicable)
```

---

<div align="center">
  <p>🛡️ Built for Boston University Library Administration</p>
  <p>Professional admin dashboard with enterprise-grade features</p>
</div>
