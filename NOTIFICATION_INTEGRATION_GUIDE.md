# Notification System Integration Guide

This guide shows how to integrate notifications for all CRUD operations across different admin pages in the ConsentHub system.

## Components Already Integrated

### ✅ UserManagement.tsx
- ✅ User creation notifications
- ✅ User deletion notifications  
- ✅ Guardian update notifications
- ✅ User status change notifications

### ✅ ConsentManagement.tsx
- ✅ Consent creation notifications
- ✅ Consent update/status change notifications

### 🔄 DSARRequests.tsx (Partially integrated)
- ✅ Import added
- ❌ Need to add notification calls to status update functions

## Integration Steps for Remaining Components

### 1. Add Notification Import
```tsx
import { useCRUDNotifications } from './shared/withNotifications';
```

### 2. Add Notification Hooks
```tsx
const {
  notifyCreate,
  notifyUpdate, 
  notifyDelete,
  notifyApprove,
  notifyReject,
  notifyCustom
} = useCRUDNotifications();
```

### 3. Add Notifications to CRUD Operations

#### For Create Operations:
```tsx
// After successful creation
notifyCreate('entity_type', entityName, {
  // metadata about the created item
});
```

#### For Update Operations:
```tsx
// After successful update
notifyUpdate('entity_type', entityName, {
  // metadata about the updated item
});
```

#### For Delete Operations:
```tsx
// After successful deletion
notifyDelete('entity_type', entityName, {
  // metadata about the deleted item
});
```

## Components That Need Integration

### 1. PrivacyNotices.tsx
**Location:** `src/components/PrivacyNotices.tsx`

**Integration Points:**
```tsx
// Privacy Notice Creation
notifyCreate('privacy_notice', noticeName, {
  version: notice.version,
  status: notice.status
});

// Privacy Notice Update
notifyUpdate('privacy_notice', noticeName, {
  oldVersion: oldVersion,
  newVersion: newVersion
});

// Privacy Notice Deletion
notifyDelete('privacy_notice', noticeName, {
  version: notice.version
});
```

### 2. TopicPreferences.tsx
**Location:** `src/components/admin/TopicPreferences.tsx`

**Integration Points:**
```tsx
// Topic Preference Creation
notifyCreate('topic_preference', topicName, {
  category: topic.category,
  channels: topic.channels
});

// Topic Preference Update
notifyUpdate('topic_preference', topicName, {
  updatedChannels: updatedChannels
});
```

### 3. PreferenceManager.tsx / PreferenceManagerNew.tsx
**Location:** `src/components/admin/PreferenceManager*.tsx`

**Integration Points:**
```tsx
// Preference Creation
notifyCreate('preference', customerName, {
  preferenceType: type,
  settings: settings
});

// Preference Update
notifyUpdate('preference', customerName, {
  changedSettings: changes
});
```

### 4. AuditTrail.tsx
**Location:** `src/components/AuditTrail.tsx`

**Integration Points:**
```tsx
// Audit Log Export
notifyCustom('system', 'info', 'Audit Logs Exported', 
  `Audit logs exported for date range: ${startDate} to ${endDate}`, {
    dateRange: { startDate, endDate },
    recordCount: exportedRecords.length
  });
```

### 5. DSARRequests.tsx (Complete Integration)
**Location:** `src/components/DSARRequests.tsx`

**Integration Points:**
```tsx
// DSAR Request Status Update
const handleStatusUpdate = async (requestId: string, newStatus: string) => {
  try {
    await updateDSARRequest(requestId, { status: newStatus });
    
    const request = requests.find(r => r.id === requestId);
    const customerName = getCustomerName(request.partyId);
    
    if (newStatus === 'approved') {
      notifyApprove('dsar', customerName, {
        requestType: request.requestType,
        requestId: requestId
      });
    } else if (newStatus === 'rejected') {
      notifyReject('dsar', customerName, {
        requestType: request.requestType, 
        reason: rejectionReason
      });
    } else {
      notifyUpdate('dsar', customerName, {
        oldStatus: request.status,
        newStatus: newStatus
      });
    }
    
    await refetchDSAR();
  } catch (error) {
    console.error('Failed to update DSAR request:', error);
  }
};
```

### 6. Bulk Import/Export Components

**Integration Points:**
```tsx
// Bulk Import Success
notifyCustom('system', 'success', 'Bulk Import Completed', 
  `Successfully imported ${importedCount} ${entityType} records.`, {
    entityType,
    importedCount,
    fileName: file.name
  });

// Bulk Export Success  
notifyCustom('system', 'info', 'Bulk Export Completed',
  `Successfully exported ${exportedCount} ${entityType} records.`, {
    entityType,
    exportedCount,
    format: exportFormat
  });
```

### 7. Compliance Rules Management

**Integration Points:**
```tsx
// Compliance Rule Creation
notifyCreate('compliance_rule', ruleName, {
  ruleType: rule.type,
  severity: rule.severity
});

// Compliance Rule Update
notifyUpdate('compliance_rule', ruleName, {
  updatedFields: changes
});

// Compliance Rule Deletion
notifyDelete('compliance_rule', ruleName, {
  ruleType: rule.type
});
```

### 8. Event Listeners Management

**Integration Points:**
```tsx
// Event Listener Creation
notifyCreate('event_listener', listenerName, {
  eventType: listener.eventType,
  endpoint: listener.endpoint
});

// Event Listener Update
notifyUpdate('event_listener', listenerName, {
  updatedConfig: changes
});
```

## Notification Categories

Use appropriate categories for different types of operations:

- **success**: For successful creations, approvals, completions
- **info**: For updates, exports, routine operations  
- **warning**: For deletions, rejections, status changes
- **urgent**: For critical operations, security events, overdue items

## Entity Types

Use consistent entity types across the system:

- `user` - User accounts
- `guardian` - Guardian accounts
- `consent` - Consent records
- `preference` - Preference settings
- `topic_preference` - Topic-specific preferences
- `privacy_notice` - Privacy notices
- `dsar` - DSAR requests
- `compliance_rule` - Compliance rules
- `event_listener` - Event listeners
- `system` - System-level operations

## Testing the Integration

1. **Start both frontend and backend servers**
2. **Login as admin user**
3. **Perform CRUD operations on each page**
4. **Check notification bell for new notifications**
5. **Verify notification content and metadata**

## Implementation Priority

1. **High Priority:** UserManagement ✅, ConsentManagement ✅, DSARRequests
2. **Medium Priority:** PrivacyNotices, TopicPreferences, PreferenceManager
3. **Low Priority:** AuditTrail, Bulk Operations, Compliance Rules, Event Listeners

## Next Steps

1. Complete DSARRequests integration
2. Add notifications to PrivacyNotices component
3. Add notifications to TopicPreferences component
4. Add notifications to PreferenceManager components
5. Test all integrations thoroughly
6. Consider adding notification filtering and search capabilities
