# Customer Dashboard Integration Guide

## Quick Start

The Customer Dashboard has been successfully created with all the components you requested. Here's how to integrate it into your ConsentHub application:

## Component Structure Created

```
src/components/customer/
├── CustomerMainDashboard.tsx     # Main container component
├── CustomerHeader.tsx            # Header with logo and logout
├── CustomerSidebar.tsx          # Navigation sidebar
├── CustomerDashboardOverview.tsx # Dashboard home page
├── ConsentCenter.tsx            # Consent management
├── CustomerPreferences.tsx      # Communication preferences
├── CustomerPrivacyNotices.tsx   # Privacy notices
├── CustomerDSARRequests.tsx     # DSAR requests
├── CustomerDashboardDemo.tsx    # Demo component
└── README.md                    # Detailed documentation
```

## Integration Steps

### 1. Update Your App Router

If using React Router, add the customer dashboard route:

```tsx
// In your main App.tsx or routing file
import CustomerDashboard from './components/CustomerDashboard';

// Add to your routes
<Route path="/customer-dashboard" element={<CustomerDashboard />} />
```

### 2. Update Navigation

Add a link to the customer dashboard in your main navigation:

```tsx
// In your main navigation component
<Link to="/customer-dashboard" className="nav-link">
  Customer Portal
</Link>
```

### 3. Test the Dashboard

You can test the dashboard using the demo component:

```tsx
// Import and use the demo
import CustomerDashboardDemo from './components/customer/CustomerDashboardDemo';

// Use in development
<CustomerDashboardDemo />
```

## Features Implemented

✅ **Header with logo and logout button**
- SLT Mobitel logo
- Language selector integration
- User profile display
- Notification bell with badge

✅ **Sidebar navigation**
- Dashboard, Consent Center, Preferences, Privacy Notices, DSAR Requests
- Mobile responsive with hamburger menu
- Active section highlighting

✅ **Main dashboard page**
- Welcome message with customer name
- Quick stats cards (consents, preferences, etc.)
- Quick action buttons
- Recent activity timeline

✅ **Consent Center Page**
- List of all consents in card format
- Each shows: Purpose, Status, Channel, Validity Period
- Actions: Revoke, Edit, View History
- Search and filtering capabilities

✅ **Preferences Page**
- Toggle switches for Email, SMS, Push, In-App notifications
- Topic subscriptions (offers, product updates, service alerts, etc.)
- Do Not Disturb time range selector
- Frequency limiter (max emails/SMS per day)

✅ **Privacy Notices Page**
- List of privacy notices with version tracking
- Language selector: English / Sinhala / Tamil
- Show published date, jurisdiction, acceptance status
- PDF download functionality

✅ **DSAR Request Page**
- Form with dropdown: Export Data / Delete Data / Rectify / Restrict
- Submit button with form validation
- List of submitted requests with status and timestamps
- Download links for completed exports

✅ **Responsive Design**
- Mobile-first approach
- Tailwind CSS utilities
- Touch-friendly interactions

✅ **Modern UI Features**
- Loading spinners and states
- Lucide React icons throughout
- Active navigation highlighting
- Professional color scheme

## Mock Data

All components use comprehensive mock data that demonstrates:
- Different consent statuses and types
- Various DSAR request states
- Multi-language privacy notices
- Communication preference options
- Recent activity history

## Next Steps

1. **API Integration**: Replace mock data with actual API calls
2. **Authentication**: Integrate with your auth system
3. **Localization**: Add translation files for i18n
4. **Testing**: Add unit and integration tests
5. **Customization**: Adjust colors/styling to match your brand

## Browser Testing

Test the dashboard in:
- Chrome (recommended)
- Firefox
- Safari
- Edge

All components are built with modern React patterns and should work seamlessly with your existing ConsentHub application.

## Support

Refer to the detailed README.md in the customer folder for comprehensive documentation, API integration notes, and customization guidelines.
