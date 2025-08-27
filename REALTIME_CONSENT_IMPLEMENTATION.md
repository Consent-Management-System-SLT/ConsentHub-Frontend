# Real-Time Consent Management Implementation

## 🎯 Overview
Successfully implemented real-time consent updates for the CSR Dashboard using WebSocket technology. When customers grant or revoke consents, CSR staff will see instant updates without needing to refresh the page.

## ✅ What's Been Implemented

### 1. Backend WebSocket Server
- **Location**: `comprehensive-backend.js`
- **Technology**: Socket.IO
- **Features**:
  - WebSocket server running alongside HTTP server
  - Room-based communication (`csr-dashboard` room)
  - Real-time event emission on consent changes

### 2. Frontend WebSocket Service
- **Location**: `src/services/websocketService.ts`
- **Features**:
  - Singleton pattern for global connection management
  - Auto-reconnection with exponential backoff
  - Room management for CSR dashboard
  - Event listening for consent updates

### 3. Real-Time CSR Dashboard Updates
- **Location**: `src/components/csr/ConsentHistoryTable_Backend.tsx`
- **Features**:
  - Instant consent list updates when changes occur
  - Real-time notifications for consent grants/revokes
  - WebSocket connection status indicator
  - Fallback polling when WebSocket disconnected

### 4. Notification System
- **Location**: `src/components/shared/NotificationContainer.tsx`
- **Features**:
  - Toast notifications for real-time events
  - Auto-dismiss with customizable timing
  - Different notification types (success, warning, error, info)
  - Clean UI with animations

### 5. WebSocket Status Indicator
- **Location**: `src/components/shared/WebSocketStatus.tsx`
- **Features**:
  - Visual indicator of connection status
  - Real-time status updates
  - Color-coded status (green=connected, yellow=connecting, red=disconnected)

## 🔄 How It Works

### Consent Grant/Revoke Flow:
1. **Customer Action**: Customer clicks toggle button in ConsentCenter
2. **API Call**: Frontend sends POST to `/api/v1/customer/consents/:id/grant` or `/revoke`
3. **Database Update**: Backend updates MongoDB with new consent status
4. **WebSocket Emission**: Backend emits `consent-updated` event to `csr-dashboard` room
5. **Real-Time Update**: CSR dashboard receives event and updates UI instantly
6. **Notification**: CSR sees toast notification about the change

### Event Data Structure:
```javascript
{
  type: 'granted' | 'revoked',
  consent: {
    id: 'consent_id',
    status: 'granted' | 'revoked',
    purpose: 'marketing',
    // ... other consent fields
  },
  timestamp: '2025-08-27T...',
  user: {
    id: 'user_id',
    email: 'customer@example.com'
  }
}
```

## 🛠️ Technical Implementation Details

### Backend Changes:
- Added Socket.IO dependency and server setup
- Modified grant/revoke endpoints to emit WebSocket events
- Added room-based broadcasting for CSR dashboard

### Frontend Changes:
- Added socket.io-client dependency
- Created WebSocket service for connection management
- Updated ConsentHistoryTable to use real-time updates
- Added notification system for user feedback
- Reduced polling frequency (30s) since real-time updates are active

## 🧪 Testing the Real-Time Functionality

### Step-by-Step Test:
1. **Open two browser windows**:
   - Window 1: Customer dashboard (`http://localhost:5173`) - login as `customer@sltmobitel.lk`
   - Window 2: CSR dashboard (`http://localhost:5173`) - login as `csr@sltmobitel.lk`

2. **In CSR Dashboard**:
   - Navigate to "Consent History" section
   - Look for green "Real-time Updates Active" status indicator

3. **In Customer Dashboard**:
   - Go to "Consent Center"
   - Click any toggle button to grant/revoke a consent

4. **Observe CSR Dashboard**:
   - Should instantly see the consent status change in the table
   - Should receive a toast notification about the change
   - "Last updated" timestamp should update immediately

## 🔍 Monitoring & Debugging

### Console Logs to Watch:
- `🔌 Connected to WebSocket server` - Frontend connection established
- `👨‍💼 CSR joined dashboard room` - CSR dashboard joined for updates
- `📡 Real-time update sent to CSR dashboard` - Backend sending updates
- `📡 Received real-time consent update` - Frontend receiving updates

### Connection Status:
- **Green indicator**: Real-time updates active
- **Yellow indicator**: Connecting to WebSocket
- **Red indicator**: Offline, using fallback polling

## 🚀 Benefits

1. **Instant Updates**: No more waiting for page refresh or polling
2. **Better User Experience**: CSR staff see changes immediately
3. **Reduced Server Load**: Less frequent polling needed
4. **Visual Feedback**: Clear notifications when changes occur
5. **Robust Fallback**: Automatic fallback to polling if WebSocket fails

## 🔧 Configuration

### WebSocket Settings:
- **Server Port**: 3001 (same as HTTP server)
- **Reconnection Attempts**: 5
- **Reconnection Delay**: 1000ms
- **Notification Duration**: 5000ms (auto-close)

### Polling Fallback:
- **Frequency**: 30 seconds (reduced from 10s)
- **Only Active**: When WebSocket disconnected

## 📝 Future Enhancements

Potential improvements for the future:
1. **User-specific notifications**: Show which specific customer made changes
2. **Audit trail events**: Real-time updates for DSAR requests, preference changes
3. **Admin dashboard**: Real-time updates for admin users
4. **Mobile optimization**: Better mobile support for notifications
5. **Sound notifications**: Optional audio alerts for important changes

---

**Status**: ✅ **COMPLETE AND READY FOR TESTING**

The real-time consent management system is now fully functional. CSR staff will see instant updates when customers grant or revoke consents, making the system much more responsive and user-friendly.
