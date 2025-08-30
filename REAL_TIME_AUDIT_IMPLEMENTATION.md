# Real-Time Consent History & Audit Trail Implementation

## Overview

The Consent History & Audit Trail page now displays real-time customer consent grants and revokes, as well as preference updates. This implementation uses WebSocket connections to provide live updates without requiring page refreshes.

## Key Features

### 🔴 Real-Time Updates
- **Live WebSocket Connection**: Displays connection status with visual indicators
- **Instant Notifications**: New consent grants/revokes and preference updates appear immediately
- **Visual Highlighting**: New entries are highlighted with animation and badges
- **Auto-Refresh**: Updates appear in real-time without manual refresh

### 📊 Visual Indicators
- **Connection Status**: 
  - 🟢 Green "Live" indicator when connected
  - 🔴 Red "Offline" indicator when disconnected
- **New Entry Highlighting**: 
  - Blue pulsing border for brand new updates
  - Green border for real-time entries
  - "NEW" and "LIVE" badges on timestamps
- **Last Update Time**: Shows when the last update was received

### 🔍 Filtering & Search
- **Real-time Filtering**: All existing filters work with real-time data
- **Search Functionality**: Search across real-time and historical data
- **Statistics Display**: Shows total entries and real-time entry count

## Implementation Details

### Frontend Components
1. **Enhanced AuditTrail.tsx**:
   - WebSocket integration for real-time updates
   - Visual indicators for connection status
   - Highlighting for new entries
   - Real-time event handlers

2. **WebSocket Service**:
   - Manages WebSocket connections
   - Handles consent and preference update events
   - Provides connection status monitoring

3. **Type Definitions**:
   - Extended AuditLog interface to support real-time fields
   - Added fields for MongoDB IDs and real-time metadata

### Backend Integration
- **WebSocket Events**: Listens for `consent-updated`, `customerPreferencesUpdated`, and `csrPreferencesUpdated` events
- **Database Sync**: Real-time updates are also stored in the database
- **Room Management**: Joins CSR dashboard room for targeted updates

## Event Types Supported

### 1. Consent Updates
- **Consent Granted**: When customers grant consent
- **Consent Revoked**: When customers revoke consent
- **Source Tracking**: Tracks whether updates come from customer portal or CSR actions

### 2. Preference Updates
- **Customer Self-Service**: When customers update their own preferences
- **CSR Updates**: When CSR representatives update customer preferences
- **Channel Preferences**: Email, SMS, push notification preferences

## Real-Time Data Structure

```typescript
interface RealTimeAuditLog extends AuditLog {
  _id: string;           // MongoDB ID for real-time entries
  details: {
    realTime: boolean;   // Flag indicating real-time entry
    source: string;      // Source of the update
    [key: string]: any;  // Additional metadata
  };
}
```

## Testing the Implementation

### Manual Testing
1. Open the frontend at `http://localhost:5174`
2. Navigate to the Audit Trail page
3. Run the test script: `node test-real-time-audit.js`
4. Observe real-time updates appearing with visual indicators

### Automated Testing Script
The `test-real-time-audit.js` script simulates:
- Random consent grants and revokes
- Customer and CSR preference updates
- Database entries and WebSocket events
- Updates every 5 seconds for continuous testing

## Usage Instructions

### For Administrators
1. **Monitor Real-Time Status**: Check the connection indicator in the top-right
2. **View Live Updates**: New entries appear at the top with highlighting
3. **Filter Real-Time Data**: Use existing filters to focus on specific event types
4. **Manual Refresh**: Use the refresh button to reload historical data

### For CSR Representatives
1. **Customer Activity Monitoring**: See when customers grant/revoke consent
2. **Real-Time Preference Changes**: Monitor when customers update preferences
3. **Audit Trail Integrity**: All real-time events are permanently stored

## Benefits

1. **Immediate Visibility**: CSR teams can see customer actions as they happen
2. **Enhanced Customer Service**: Real-time awareness improves response times
3. **Compliance Monitoring**: Live tracking of consent changes for audit purposes
4. **System Integration**: Real-time events can trigger other business processes

## Future Enhancements

1. **Push Notifications**: Alert CSR teams of critical consent changes
2. **Dashboard Widgets**: Real-time statistics and counters
3. **Advanced Filtering**: Time-based filters for real-time events
4. **Export Functionality**: Include real-time metadata in exports

## Technical Architecture

```
Customer Action → Backend API → Database + WebSocket → Frontend Update
                                    ↓
                              Audit Log Created → Real-Time Event → UI Highlight
```

The system ensures that all real-time updates are:
- ✅ Persistently stored in MongoDB
- ✅ Immediately visible in the UI
- ✅ Properly filtered and searchable
- ✅ Visually distinguished from historical data
