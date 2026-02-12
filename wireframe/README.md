# PSIP - Wireframe

Complete HTML wireframe prototype for PSIP with separate pages for user and admin interfaces.

## File Structure

```
wireframe/
├── index.html              # Splash/Home page
├── css/
│   └── styles.css         # Shared CSS styles
├── js/
│   └── main.js            # Shared JavaScript functions
├── README.md              # This file
│
├── User Pages:
│   ├── login.html         # User login
│   ├── register.html      # User registration
│   ├── dashboard.html     # User dashboard
│   ├── pools.html         # Pool list
│   ├── pool-details.html  # Pool details
│   ├── buy-token.html     # Buy tokens page
│   ├── monthly-result.html # Monthly draw results
│   ├── wallet.html        # Wallet page
│   ├── history.html       # Transaction history
│   └── profile.html       # User profile
│
└── Admin Pages:
    ├── admin-login.html        # Admin login
    ├── admin-dashboard.html    # Admin dashboard
    ├── admin-create-pool.html  # Create new pool
    ├── admin-pools.html        # Manage pools
    ├── admin-pool-details.html # Pool details (admin view)
    ├── admin-results.html      # Conduct draws
    ├── admin-users.html        # User management
    ├── admin-user-details.html # User details (admin view)
    ├── admin-transactions.html # Transaction management
    ├── admin-reports.html      # Reports & analytics
    └── admin-settings.html     # Admin settings
```

## Features

- **Separate User & Admin Interfaces**: Complete separation of user and admin pages
- **One-time Payment Model**: Users pay once per token, receive monthly payouts automatically
- **Mobile-First Design**: Responsive layout with bottom navigation for mobile
- **Clean Wireframe Style**: Grayscale design, minimal colors
- **Pure HTML/CSS/JS**: No frameworks required

## How to Use

1. Open `index.html` in a web browser
2. Navigate through pages using the links
3. All pages are interconnected with proper navigation

## Business Model

- Token-based pool system
- Admin creates fixed pools
- Users buy tokens (one-time payment)
- Monthly draws select winning tokens
- Winners receive 2x payout
- Other tokens receive 3% monthly return
- Each token wins exactly once over pool duration

## Pages Overview

### User Pages
- **Splash**: Entry point with role selection
- **Login/Register**: User authentication
- **Dashboard**: Overview of tokens, pools, earnings
- **Pools**: List of active pools
- **Pool Details**: Detailed pool information
- **Buy Token**: Purchase tokens (one-time payment)
- **Monthly Result**: View draw results
- **Wallet**: Balance and transactions
- **History**: Complete transaction history
- **Profile**: User information and settings

### Admin Pages
- **Login**: Admin authentication
- **Dashboard**: Platform overview and stats
- **Create Pool**: Form to create new pools
- **Manage Pools**: View and manage all pools
- **Pool Details**: Detailed pool analytics
- **Conduct Draw**: Run monthly draws
- **User Management**: View and manage users
- **User Details**: Individual user information
- **Transactions**: Financial transaction management
- **Reports**: Analytics and reporting
- **Settings**: Platform configuration

## Navigation

- **User Navigation**: Header nav + bottom nav (mobile)
- **Admin Navigation**: Header nav only (dark theme)
- All pages link properly to related pages

## Styling

- Shared CSS in `css/styles.css`
- Consistent design across all pages
- Responsive breakpoints at 768px
- Mobile-first approach

## JavaScript

- Shared functions in `js/main.js`
- Token purchase calculation
- Navigation helpers
