# BU Library Booking System - Main Interface

<div align="center">
  <img src="https://img.shields.io/badge/React-18.0+-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-Latest-purple" alt="Vite">
  <img src="https://img.shields.io/badge/EmailJS-Integrated-green" alt="EmailJS">
</div>

## 📚 Overview

The main booking interface for Boston University's Library Room Booking System. This React + TypeScript application provides students and faculty with an intuitive way to discover, book, and manage library room reservations.

## ✨ Key Features

### 🎯 Core Functionality
- **Interactive Room Browser**: Visual room selection with real-time availability
- **Smart Booking Modal**: Three-step booking process (Details → Email Verification → Confirmation)
- **Email Verification System**: Secure booking confirmation via EmailJS integration
- **Room Conflict Detection**: Prevents double bookings with real-time validation
- **Mobile-Optimized UI**: Responsive design for all screen sizes

### 📱 User Experience
- **Mapbox Integration**: Interactive maps for room visualization
- **Real-time Updates**: Live availability with user-controlled refresh timing
- **Time Zone Support**: Eastern Time validation with past-time prevention
- **Multi-language Support**: English and Chinese language options
- **Accessibility**: WCAG compliant with keyboard navigation

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with Hot Module Replacement
- **UI Components**: Ant Design + Custom CSS Modules
- **Maps**: Mapbox GL JS for interactive room visualization
- **Email Service**: EmailJS for verification and confirmation emails
- **Database**: Supabase integration
- **Styling**: CSS Modules with responsive design patterns

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0+ and npm
- EmailJS account (for booking verification)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the project root:

```env
# Core Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACK_END_URL=your_backend_url
VITE_DEBUG=true
VITE_APP_NAME=BU Library Booking System
VITE_APP_VERSION=1.0.0

# EmailJS Configuration (Required)
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_VERIFICATION_TEMPLATE_ID=verification_email
VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID=confirmation_email
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
bu-book/
├── src/
│   ├── components/          # React components
│   │   ├── Map.tsx         # Interactive map component
│   │   ├── RoomAvailabilityList.tsx  # Room listing and availability
│   │   └── RoomBookingModal.tsx      # Booking process modal
│   ├── lib/                # Utility libraries
│   │   ├── bookingService.ts        # Booking API integration
│   │   ├── emailService.ts          # EmailJS integration
│   │   └── roomConflictChecker.ts   # Conflict detection logic
│   ├── assets/             # Static assets and styles
│   │   └── styles/         # CSS modules
│   ├── types/              # TypeScript type definitions
│   └── pages/              # Page components
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🎨 Key Components

### RoomBookingModal
Three-step booking process:
1. **Details Form**: User information and booking preferences
2. **Email Verification**: Secure code verification via email
3. **Confirmation**: Booking summary with manual close option

### RoomAvailabilityList
- Displays rooms grouped by building
- Real-time conflict detection for verified bookings
- Mobile-responsive card layout
- Collapsible building sections

### Map Component
- Interactive Mapbox integration
- Room location visualization
- Clean debug-free implementation

## 📧 Email Integration

### EmailJS Setup
See [EMAILJS_SETUP.md](../EMAILJS_SETUP.md) for complete setup instructions.

**Free Tier Benefits:**
- 2000 emails/month at no cost
- No credit card required
- Reliable delivery through major email providers

**Email Templates:**
- `verification_email`: Sends verification codes to users
- `confirmation_email`: Sends booking confirmation details

### Development Mode
In development, verification codes are logged to the browser console:
```
🔑 TEST VERIFICATION CODE: 123456
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality
npm run type-check   # TypeScript type checking
```

## 🎯 Recent Updates (August 2024)

### Email Verification System
- ✅ EmailJS integration for secure booking verification
- ✅ Two-step confirmation process with manual user control
- ✅ Prevents premature data refresh during confirmation

### UI/UX Improvements
- ✅ Mobile-optimized responsive design
- ✅ Cleaner building headers (removed unavailable counts)
- ✅ Fixed overflow issues on small screens
- ✅ Enhanced room conflict visual indicators

### Technical Enhancements
- ✅ Removed all debug console.log statements
- ✅ Improved TypeScript implementation
- ✅ Real-time room conflict detection
- ✅ Eastern Time zone support

## 🐛 Troubleshooting

### Common Development Issues

**Email Not Sending**
```bash
# Check EmailJS configuration
console.log(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)

# Look for verification codes in browser console during development
# Search for "🔑 TEST VERIFICATION CODE"
```

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

**Map Not Loading**
- Verify Mapbox access token in `.env`
- Check browser console for API errors
- Ensure token has correct permissions

## 📱 Mobile Support

The application is optimized for:
- **Phones**: 320px - 767px
- **Tablets**: 768px - 1023px  
- **Desktop**: 1024px+

### Mobile Features
- Touch-friendly room selection
- Responsive booking modal
- Optimized text sizes
- Improved button spacing

## 🔐 Security Considerations

- **Environment Variables**: All sensitive data in `.env` files
- **Input Validation**: Client and server-side validation
- **Email Verification**: Secure booking confirmation process
- **CORS Configuration**: Properly configured API access

## 🤝 Contributing

1. Follow existing TypeScript and React patterns
2. Use CSS Modules for styling
3. Ensure mobile responsiveness
4. Test email functionality in development mode
5. Run linting before committing: `npm run lint`

## 📖 Documentation

- [EmailJS Setup Guide](../EMAILJS_SETUP.md)
- [Main Project README](../README.md)
- [Backend API Documentation](../bub-backend/README.md)

---

Built with ❤️ for Boston University Library System
