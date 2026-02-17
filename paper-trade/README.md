# PaperTrade - Paper Trading App Wireframe

A complete responsive HTML wireframe for a Paper Trading Mobile + Web App (India stock market) inspired by Zerodha, Groww, and Angel One.

## 📁 File Structure

### Auth Screens
- `login.html` - Mobile number + OTP login screen
- `otp.html` - OTP verification screen
- `signup.html` - User registration screen
- `pin-setup.html` - Transaction PIN setup screen

### Main App Screens
- `dashboard.html` - Home/Dashboard with portfolio overview
- `watchlist.html` - Market watchlist with stock search
- `stock-detail.html` - Individual stock details page
- `buy-sell.html` - Order placement screen
- `portfolio.html` - User portfolio holdings
- `order-book.html` - Open and completed orders
- `funds.html` - Funds management and transaction history
- `notifications.html` - Price alerts and order updates
- `profile.html` - User profile and settings

## 🔄 User Flow

### Authentication Flow
1. **Login** (`login.html`) → Enter mobile number
2. **OTP** (`otp.html`) → Verify OTP
3. **PIN Setup** (`pin-setup.html`) → Set transaction PIN
4. **Dashboard** (`dashboard.html`) → Main app entry point

### Alternative Flow
- **Signup** (`signup.html`) → New user registration → OTP → PIN Setup → Dashboard

### Main App Flow
- **Dashboard** → View portfolio, market indices, watchlist preview
- **Markets** (`watchlist.html`) → Browse stocks, search, add to watchlist
- **Stock Detail** (`stock-detail.html`) → View stock info, charts, place orders
- **Buy/Sell** (`buy-sell.html`) → Place market/limit orders
- **Portfolio** (`portfolio.html`) → View holdings and positions
- **Orders** (`order-book.html`) → View open/completed orders
- **Funds** (`funds.html`) → Manage funds, view transaction history
- **Notifications** (`notifications.html`) → View alerts and updates
- **Profile** (`profile.html`) → User settings and logout

## 🎨 Design Features

- **Mobile-first responsive design**
- **Tailwind CSS** via CDN
- **Color Scheme:**
  - Primary: Blue-700 (#1e40af)
  - Profit: Green-500 (#10b981)
  - Loss: Red-500 (#ef4444)
  - Background: Gray-50
- **Bottom Navigation Bar** on all main app screens
- **Card-based layouts** with shadows
- **Smooth transitions** and hover effects

## 🚀 Getting Started

1. Open `login.html` in a web browser to start
2. Navigate through the app using the links and bottom navigation
3. All pages are interconnected and follow a logical flow

## 📱 Pages Overview

### Entry Point
- Start at `login.html` or `index.html` (redirects to login)

### Navigation
- Bottom navigation bar available on all main app screens
- Back buttons on detail pages
- Header navigation for quick access to notifications and profile

## 🛠️ Technologies Used

- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript (minimal, for navigation)
- SVG Icons (Heroicons style)

## 📝 Notes

- This is a wireframe/prototype - no backend functionality
- All data is static/dummy data
- Navigation uses standard HTML links (`<a>` tags)
- Responsive design works on mobile and desktop
- Indian stock market focus (NSE stocks, NIFTY indices)
