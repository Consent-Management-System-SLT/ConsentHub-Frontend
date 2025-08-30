# Admin Preference Management System

## Overview

The Admin Preference Management System allows administrators to dynamically configure the communication preferences that customers see in their dashboard. This eliminates the need for code changes when adding or removing communication channels and topic subscriptions.

## Features

### 🔧 **Communication Channels Management**
- Add/remove communication channels (Email, SMS, Push, In-App, etc.)
- Configure channel properties (name, description, icon, default status)
- Enable/disable channels for customer selection
- Real-time updates to customer preference pages

### 📢 **Topic Subscriptions Management**
- Add/remove topic categories (Marketing, Product, Security, etc.)
- Set topic priorities (High, Medium, Low)
- Configure default subscription settings
- Categorize topics for better organization

### 👀 **Customer View Preview**
- Real-time preview of how customers will see the preferences
- Shows only enabled channels and topics
- Displays default selections and priority indicators

## How It Works

### 1. **Admin Configuration**
Administrators access the Preference Management page via:
- **Navigation**: Admin Dashboard → Preference Config
- **URL**: `/admin/preference-management`

### 2. **Dynamic Customer Updates**
When customers visit their Communication Preferences page:
- System fetches current configuration from `/api/v1/customer/preference-config`
- Only enabled channels and topics are displayed
- Default selections are pre-checked
- Changes are applied immediately without code deployment

### 3. **Database Storage**
Configuration is stored in MongoDB collections:
- **PreferenceChannels**: Communication channel definitions
- **PreferenceTopics**: Topic subscription definitions

## API Endpoints

### Admin Management APIs
```javascript
// Communication Channels
GET    /api/v1/admin/preference-channels     // List all channels
POST   /api/v1/admin/preference-channels     // Create new channel
PUT    /api/v1/admin/preference-channels/:id // Update channel
DELETE /api/v1/admin/preference-channels/:id // Delete channel

// Topic Subscriptions  
GET    /api/v1/admin/preference-topics       // List all topics
POST   /api/v1/admin/preference-topics       // Create new topic
PUT    /api/v1/admin/preference-topics/:id   // Update topic
DELETE /api/v1/admin/preference-topics/:id   // Delete topic
```

### Customer Configuration API
```javascript
GET /api/v1/customer/preference-config  // Get current config for customer UI
```

## Data Models

### Communication Channel
```typescript
interface CommunicationChannel {
  id: string;
  name: string;              // "WhatsApp Notifications"
  key: string;               // "whatsapp" (unique identifier)
  description: string;       // "Receive notifications via WhatsApp"
  icon: string;              // "MessageSquare" (Lucide icon name)
  enabled: boolean;          // Show in customer preferences
  isDefault: boolean;        // Pre-selected for new customers
  createdAt: string;
  updatedAt: string;
}
```

### Topic Subscription
```typescript
interface TopicSubscription {
  id: string;
  name: string;              // "Security Alerts"
  key: string;               // "security_alerts" (unique identifier)
  description: string;       // "Account security and privacy updates"
  category: string;          // "security" | "marketing" | "product" | etc.
  enabled: boolean;          // Show in customer preferences
  isDefault: boolean;        // Pre-selected for new customers
  priority: 'low' | 'medium' | 'high';  // Importance level
  createdAt: string;
  updatedAt: string;
}
```

## Usage Examples

### 1. Adding a New Communication Channel

**Admin Action:**
```javascript
// Admin adds "WhatsApp Notifications"
{
  name: "WhatsApp Notifications",
  key: "whatsapp",
  description: "Receive notifications via WhatsApp",
  icon: "MessageSquare",
  enabled: true,
  isDefault: false
}
```

**Customer Result:**
The WhatsApp option immediately appears in all customer preference pages without any code deployment.

### 2. Adding a New Topic Subscription

**Admin Action:**
```javascript
// Admin adds "App Update Notifications"
{
  name: "App Update Notifications",
  key: "app_updates",
  description: "Notifications about new app features",
  category: "product",
  enabled: true,
  isDefault: true,  // New customers will be subscribed by default
  priority: "medium"
}
```

**Customer Result:**
New topic appears in customer preferences, pre-checked for new customers.

## Benefits

### ✅ **For Administrators**
- **No Code Changes**: Add/remove preferences without developer intervention
- **Real-time Updates**: Changes appear immediately for customers
- **Flexible Configuration**: Full control over channels, topics, and defaults
- **Preview Functionality**: See exactly how customers will view preferences

### ✅ **For Customers**
- **Dynamic Options**: Always see current available communication methods
- **Smart Defaults**: Important topics pre-selected for convenience
- **Organized Interface**: Topics grouped by category and priority
- **Consistent Experience**: UI updates automatically with new options

### ✅ **For Developers**
- **Reduced Maintenance**: No code changes for preference modifications
- **Scalable Architecture**: Easy to extend with new preference types
- **Clean Separation**: Business logic separated from UI configuration
- **API-Driven**: RESTful design for easy integration

## Implementation Status

### ✅ **Completed Features**
- Admin preference management interface
- Communication channel CRUD operations
- Topic subscription CRUD operations
- Customer configuration API
- Real-time preview functionality
- MongoDB schemas and API endpoints

### 🔄 **Integration Steps**
1. **Backend Integration**: Add the API routes to comprehensive-backend.js
2. **Database Setup**: Add the MongoDB schemas
3. **Customer UI Update**: Modify customer preference page to use dynamic config
4. **Testing**: Verify end-to-end functionality

## Technical Notes

### Database Fallbacks
If the database is unavailable, the system falls back to hardcoded defaults ensuring the customer preference page always functions.

### Real-time Updates
WebSocket events are emitted when administrators make changes, allowing for real-time updates across all connected customer sessions.

### Security
All admin preference management endpoints require admin authentication and authorization.

### Performance
- Efficient database indexes for fast queries
- Caching strategies for frequently accessed configuration data
- Optimized API responses with only necessary data

This system provides a powerful, flexible foundation for managing customer communication preferences that can adapt to changing business needs without technical overhead.
