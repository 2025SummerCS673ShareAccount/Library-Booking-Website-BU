# Library Booking Website - Boston University

<div align="center">
  <img src="https://img.shields.io/badge/React-18.0+-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Python-3.9+-green" alt="Python">
  <img src="https://img.shields.io/badge/Flask-2.0+-green" alt="Flask">
  <img src="https://img.shields.io/badge/Supabase-Database-orange" alt="Supabase">
</div>

## 🆕 Latest Updates (August 2024)

### 📧 Email Verification System
- **EmailJS Integration**: Secure email verification for all bookings
- **Two-Step Process**: Email verification → Manual confirmation → Data refresh
- **Free Tier**: 2000 emails/month with no credit card required
- **Template System**: Customizable verification and confirmation emails

### 🎯 Enhanced Booking Flow
- **Smart Modal**: Three-step booking process (Details → Verification → Confirmation)
- **User-Controlled Timing**: Manual confirmation prevents premature page refresh
- **Real-time Validation**: Prevents double bookings with conflict detection
- **Mobile Optimization**: Touch-friendly interface for all screen sizes

### 🏢 UI/UX Improvements
- **Cleaner Building Headers**: Removed clutter, showing only available room counts
- **Responsive Layout**: Fixed mobile display issues and overflow problems
- **Room Conflict Indicators**: Clear visual feedback for unavailable rooms
- **Time Zone Support**: Eastern Time validation with past-time prevention

### 🔧 Technical Enhancements
- **Performance**: Optimized data refresh timing and state management
- **Code Quality**: Removed debug logs, improved TypeScript implementation
- **Error Handling**: Enhanced user feedback and graceful error recovery
- **Accessibility**: Improved keyboard navigation and screen reader support

## 📚 Overview

A comprehensive library room booking system for Boston University students and faculty. This platform provides real-time room availability, seamless booking management, and administrative tools for library staff.

### 🎯 Key Features

- **Real-time Room Availability**: Live updates with smart conflict detection
- **Interactive Map Interface**: Visual room selection with Mapbox integration
- **Email Verification System**: Secure booking confirmation via EmailJS
- **Smart Booking Modal**: Step-by-step booking process with verification
- **Responsive Design**: Mobile-optimized interface for all devices
- **Room Conflict Detection**: Prevents double bookings with real-time validation
- **Multi-language Support**: English and Chinese language options
- **Admin Dashboard**: Comprehensive room and booking management
- **Analytics & Statistics**: Usage tracking and reporting tools

## 🏗️ Project Structure

```
Library-Booking-Website-BU/
├── admin-page/          # Admin dashboard (React + Vite)
├── bu-book/            # Main booking interface (React + TypeScript)
├── bub-backend/        # Flask backend API
└── README.md
```

### 📦 Frontend Applications

#### **bu-book** - Main Booking Interface
- **Tech Stack**: React 18, TypeScript, Vite, EmailJS
- **Features**: Room browsing, smart booking modal, email verification, real-time conflict detection
- **UI Library**: Ant Design, Mapbox GL JS, Custom CSS modules
- **New Features**: Step-by-step booking process, email confirmation, responsive mobile UI
- **Port**: 5173 (development)

#### **admin-page** - Administrative Dashboard
- **Tech Stack**: React 18, JavaScript, Vite
- **Features**: Room management, booking oversight, analytics
- **UI Library**: Ant Design
- **Port**: 5174 (development)

### 🖥️ Backend Services

#### **bub-backend** - API Server
- **Tech Stack**: Python 3.9+, Flask, Supabase
- **Features**: LibCal integration, database management, API endpoints
- **Database**: Supabase (PostgreSQL)
- **Port**: 5000 (development)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0+ and npm
- **Python** 3.9+ and pip
- **Git** for version control

### 1. Clone Repository

```bash
git clone https://github.com/BarryShengyu/Library-Booking-Website-BU.git
cd Library-Booking-Website-BU
```

### 2. Backend Setup

```bash
cd bub-backend
pip install -r requirements.txt
python main.py
```

The backend API will be available at `http://localhost:5000`

### 3. Main Frontend Setup (bu-book)

```bash
cd bu-book
npm install
npm run dev
```

The main application will be available at `http://localhost:5173`

### 4. Admin Dashboard Setup (admin-page)

```bash
cd admin-page
npm install
npm run dev
```

The admin dashboard will be available at `http://localhost:5174`

## 🎨 Features Overview

### 👥 User Features

- **Browse Rooms**: Visual map interface with real-time availability and conflict detection
- **Smart Booking Process**: Three-step modal (Details → Email Verification → Confirmation)
- **Email Verification**: Secure verification codes sent via EmailJS integration
- **Search & Filter**: Find rooms by building, capacity, availability status
- **Room Conflict Prevention**: Real-time validation prevents double bookings
- **Manage Reservations**: View, modify, or cancel existing bookings
- **Mobile-Optimized**: Responsive design with touch-friendly interactions
- **Multi-language**: Switch between English and Chinese

### 🔧 Admin Features

- **Room Management**: Add, edit, and configure study rooms
- **Booking Oversight**: Monitor all reservations and usage
- **Analytics Dashboard**: Usage statistics and reporting
- **Maintenance Scheduling**: Manage room maintenance and closures
- **User Management**: Handle user accounts and permissions

### 📱 Technical Features

- **Real-time Updates**: Live synchronization with smart data refresh timing
- **Email Integration**: EmailJS for verification and confirmation emails (2000 free emails/month)
- **Room Conflict System**: Prevents overlapping bookings with verified status checking
- **Responsive Design**: Mobile-first approach optimized for all screen sizes
- **Performance Optimized**: Lazy loading, code splitting, efficient state management
- **User-Controlled Refresh**: Manual confirmation modal closure prevents premature data refresh
- **Error Handling**: Comprehensive error reporting and graceful fallbacks
- **Accessibility**: WCAG compliant interface with keyboard navigation
- **Time Validation**: Eastern Time zone support with past-time booking prevention

## 🛠️ Development

### Available Scripts

#### Backend (bub-backend)
```bash
python main.py          # Start development server
```

#### Frontend (bu-book & admin-page)
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

### 🔌 API Integration

The system integrates with:
- **LibCal API**: Real-time room availability and booking data
- **Supabase**: Database operations and authentication
- **Mapbox**: Interactive maps for room visualization

### 🌐 Environment Configuration

Create `.env` files in respective directories:

**bub-backend/.env**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
LIBCAL_API_KEY=your_libcal_key
```

**bu-book/.env**
```env
# Core Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACK_END_URL=your_backend_url
VITE_DEBUG=true
VITE_APP_NAME=BU Library Booking System
VITE_APP_VERSION=1.0.0

# EmailJS Configuration (Required for booking verification)
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_VERIFICATION_TEMPLATE_ID=verification_email
VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID=confirmation_email
```

### 📧 Email Setup Guide

For complete EmailJS setup instructions, see [EMAILJS_SETUP.md](EMAILJS_SETUP.md).

**Quick Setup:**
1. Create free EmailJS account (2000 emails/month)
2. Connect your email service (Gmail, Outlook, etc.)
3. Create verification and confirmation email templates
4. Add your EmailJS credentials to `.env` file

**Email Templates Required:**
- `verification_email` - Sends verification codes to users
- `confirmation_email` - Sends booking confirmation details

## 📁 Project Architecture

### Frontend Architecture
- **Component-based**: Modular React components
- **State Management**: React Context API
- **Routing**: React Router v6
- **Styling**: CSS Modules + Ant Design
- **API Layer**: Axios with request/response interceptors

### Backend Architecture
- **RESTful API**: Flask with structured endpoints
- **Database Layer**: Supabase integration
- **External APIs**: LibCal API integration
- **Error Handling**: Centralized error management
- **CORS**: Configured for frontend origins

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

## 📋 API Documentation

### Core Endpoints

#### Buildings
- `GET /api/buildings` - List all library buildings
- `GET /api/buildings/{id}` - Get building details

#### Rooms
- `GET /api/rooms` - List all study rooms
- `GET /api/rooms/{id}` - Get room details
- `POST /api/admin/v1/rooms` - Create new room (admin)
- `PUT /api/admin/v1/rooms/{id}` - Update room (admin)

#### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking with email verification
- `PUT /api/bookings/{id}/verify` - Verify booking with email code
- `GET /api/bookings/{id}/conflicts` - Check for room conflicts
- `DELETE /api/bookings/{id}` - Cancel booking

#### Email & Verification
- `POST /api/send-verification` - Send verification email
- `POST /api/verify-code` - Verify email confirmation code
- `POST /api/resend-verification` - Resend verification email

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Success",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🐛 Troubleshooting

### Common Issues

**Backend Connection Issues**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Verify environment variables
python -c "import os; print(os.getenv('SUPABASE_URL'))"
```

**Frontend Build Issues**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

**Database Connection Issues**
- Verify Supabase credentials in environment variables
- Check database connection and table structure
- Ensure proper row-level security policies
- Run SQL migrations for verification fields

**Email System Issues**
```bash
# Check EmailJS configuration
console.log(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)

# Test email sending (check browser console for verification codes)
# Look for "🔑 TEST VERIFICATION CODE: xxxxxx" in development mode

# Verify EmailJS service status
# Check EmailJS dashboard for delivery statistics
```

**Booking Verification Problems**
- Ensure verification email templates are correctly configured
- Check EmailJS template variable names match code expectations
- Verify email service connection in EmailJS dashboard
- Test with different email providers if delivery issues occur

## 📊 Performance Monitoring

The application includes:
- **Error Tracking**: Console error logging
- **Performance Metrics**: React DevTools integration
- **API Monitoring**: Request/response timing
- **User Analytics**: Usage pattern tracking

## 🛡️ Security Features

- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Properly configured cross-origin requests
- **Environment Variables**: Secure credential management
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Development Team

- **Project Lead**: Barry Shengyu
- **Frontend Development**: React/TypeScript specialists
- **Backend Development**: Python/Flask developers
- **UI/UX Design**: Ant Design implementation

## 📞 Support

For support and questions:
- **Issues**: Use GitHub Issues for bug reports
- **Documentation**: Check project wiki
- **Contact**: Reach out to project maintainers

---

<div align="center">
  <p>Built with ❤️ for Boston University Library System</p>
  <p>© 2024 Boston University - Library Booking System</p>
</div>
