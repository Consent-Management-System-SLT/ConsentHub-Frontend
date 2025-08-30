import { useNotifications } from '../contexts/NotificationContext';

// Define operation types and their corresponding message templates
interface CRUDOperation {
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'import' | 'approve' | 'reject';
  entity: string;
  entityName?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface NotificationTemplate {
  type: 'consent' | 'preference' | 'privacy-notice' | 'dsar' | 'user' | 'system';
  category: 'urgent' | 'warning' | 'info' | 'success';
  titleTemplate: string;
  messageTemplate: string;
}

// Notification templates for different operations
const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  // Consent Management
  'consent_create': {
    type: 'consent',
    category: 'info',
    titleTemplate: 'New Consent Record Created',
    messageTemplate: 'Consent record for {entityName} has been created successfully.'
  },
  'consent_update': {
    type: 'consent',
    category: 'info',
    titleTemplate: 'Consent Record Updated',
    messageTemplate: 'Consent record for {entityName} has been updated.'
  },
  'consent_delete': {
    type: 'consent',
    category: 'warning',
    titleTemplate: 'Consent Record Deleted',
    messageTemplate: 'Consent record for {entityName} has been permanently deleted.'
  },

  // Guardian Management
  'guardian_create': {
    type: 'user',
    category: 'success',
    titleTemplate: 'New Guardian Added',
    messageTemplate: 'Guardian {entityName} has been successfully added to the system.'
  },
  'guardian_update': {
    type: 'user',
    category: 'info',
    titleTemplate: 'Guardian Updated',
    messageTemplate: 'Guardian {entityName} information has been updated.'
  },
  'guardian_delete': {
    type: 'user',
    category: 'warning',
    titleTemplate: 'Guardian Removed',
    messageTemplate: 'Guardian {entityName} has been removed from the system.'
  },

  // User Management
  'user_create': {
    type: 'user',
    category: 'success',
    titleTemplate: 'New User Created',
    messageTemplate: 'User {entityName} has been successfully created.'
  },
  'user_update': {
    type: 'user',
    category: 'info',
    titleTemplate: 'User Profile Updated',
    messageTemplate: 'User {entityName} profile has been updated.'
  },
  'user_delete': {
    type: 'user',
    category: 'warning',
    titleTemplate: 'User Account Deleted',
    messageTemplate: 'User account for {entityName} has been deleted.'
  },

  // Preferences
  'preference_create': {
    type: 'preference',
    category: 'success',
    titleTemplate: 'New Preference Set',
    messageTemplate: 'Preference profile for {entityName} has been created.'
  },
  'preference_update': {
    type: 'preference',
    category: 'info',
    titleTemplate: 'Preferences Updated',
    messageTemplate: 'Preference settings for {entityName} have been updated.'
  },
  'preference_delete': {
    type: 'preference',
    category: 'warning',
    titleTemplate: 'Preference Deleted',
    messageTemplate: 'Preference profile for {entityName} has been deleted.'
  },

  // Topic Preferences
  'topic_preference_create': {
    type: 'preference',
    category: 'success',
    titleTemplate: 'New Topic Preference',
    messageTemplate: 'Topic preference "{entityName}" has been created.'
  },
  'topic_preference_update': {
    type: 'preference',
    category: 'info',
    titleTemplate: 'Topic Preference Updated',
    messageTemplate: 'Topic preference "{entityName}" has been updated.'
  },
  'topic_preference_delete': {
    type: 'preference',
    category: 'warning',
    titleTemplate: 'Topic Preference Deleted',
    messageTemplate: 'Topic preference "{entityName}" has been removed.'
  },

  // Privacy Notices
  'privacy_notice_create': {
    type: 'privacy-notice',
    category: 'success',
    titleTemplate: 'New Privacy Notice Published',
    messageTemplate: 'Privacy notice "{entityName}" has been published.'
  },
  'privacy_notice_update': {
    type: 'privacy-notice',
    category: 'info',
    titleTemplate: 'Privacy Notice Updated',
    messageTemplate: 'Privacy notice "{entityName}" has been updated.'
  },
  'privacy_notice_delete': {
    type: 'privacy-notice',
    category: 'warning',
    titleTemplate: 'Privacy Notice Removed',
    messageTemplate: 'Privacy notice "{entityName}" has been removed.'
  },

  // DSAR Requests
  'dsar_create': {
    type: 'dsar',
    category: 'urgent',
    titleTemplate: 'New DSAR Request',
    messageTemplate: 'DSAR request from {entityName} has been submitted and requires attention.'
  },
  'dsar_update': {
    type: 'dsar',
    category: 'info',
    titleTemplate: 'DSAR Request Updated',
    messageTemplate: 'DSAR request for {entityName} has been updated.'
  },
  'dsar_approve': {
    type: 'dsar',
    category: 'success',
    titleTemplate: 'DSAR Request Approved',
    messageTemplate: 'DSAR request for {entityName} has been approved.'
  },
  'dsar_reject': {
    type: 'dsar',
    category: 'warning',
    titleTemplate: 'DSAR Request Rejected',
    messageTemplate: 'DSAR request for {entityName} has been rejected.'
  },

  // DSAR Auto Process
  'dsar_auto_process': {
    type: 'dsar',
    category: 'success',
    titleTemplate: 'DSAR Auto-Processed',
    messageTemplate: 'DSAR request for {entityName} has been automatically processed.'
  },

  // Audit Logs
  'audit_export': {
    type: 'system',
    category: 'info',
    titleTemplate: 'Audit Logs Exported',
    messageTemplate: 'Audit logs have been exported successfully.'
  },

  // Bulk Operations
  'bulk_import': {
    type: 'system',
    category: 'success',
    titleTemplate: 'Bulk Import Completed',
    messageTemplate: 'Bulk import of {entity} records has been completed successfully.'
  },
  'bulk_export': {
    type: 'system',
    category: 'info',
    titleTemplate: 'Bulk Export Completed',
    messageTemplate: 'Bulk export of {entity} records has been completed.'
  },

  // Compliance
  'compliance_rule_create': {
    type: 'system',
    category: 'success',
    titleTemplate: 'New Compliance Rule',
    messageTemplate: 'Compliance rule "{entityName}" has been created.'
  },
  'compliance_rule_update': {
    type: 'system',
    category: 'info',
    titleTemplate: 'Compliance Rule Updated',
    messageTemplate: 'Compliance rule "{entityName}" has been updated.'
  },
  'compliance_rule_delete': {
    type: 'system',
    category: 'warning',
    titleTemplate: 'Compliance Rule Deleted',
    messageTemplate: 'Compliance rule "{entityName}" has been removed.'
  },

  // Event Listeners
  'event_listener_create': {
    type: 'system',
    category: 'success',
    titleTemplate: 'Event Listener Created',
    messageTemplate: 'Event listener "{entityName}" has been created.'
  },
  'event_listener_update': {
    type: 'system',
    category: 'info',
    titleTemplate: 'Event Listener Updated',
    messageTemplate: 'Event listener "{entityName}" has been updated.'
  },
  'event_listener_delete': {
    type: 'system',
    category: 'warning',
    titleTemplate: 'Event Listener Removed',
    messageTemplate: 'Event listener "{entityName}" has been removed.'
  }
};

class NotificationService {
  private addNotification: ((notification: any) => void) | null = null;

  // Initialize the service with the notification context
  init(addNotificationFn: (notification: any) => void) {
    this.addNotification = addNotificationFn;
  }

  // Create a notification for CRUD operations
  notifyCRUDOperation(operation: CRUDOperation) {
    if (!this.addNotification) {
      console.warn('NotificationService not initialized');
      return;
    }

    const templateKey = `${operation.entity}_${operation.action}`;
    const template = NOTIFICATION_TEMPLATES[templateKey];

    if (!template) {
      // Fallback generic notification
      this.addNotification({
        type: 'system',
        category: 'info',
        title: `${operation.action.charAt(0).toUpperCase() + operation.action.slice(1)} Operation`,
        message: `${operation.entity} has been ${operation.action}d successfully.`,
        metadata: {
          operation: operation.action,
          entity: operation.entity,
          userId: operation.userId,
          ...operation.metadata
        }
      });
      return;
    }

    // Replace placeholders in template
    const title = template.titleTemplate
      .replace('{entityName}', operation.entityName || operation.entity)
      .replace('{entity}', operation.entity);

    const message = template.messageTemplate
      .replace('{entityName}', operation.entityName || operation.entity)
      .replace('{entity}', operation.entity);

    this.addNotification({
      type: template.type,
      category: template.category,
      title,
      message,
      metadata: {
        operation: operation.action,
        entity: operation.entity,
        entityName: operation.entityName,
        userId: operation.userId,
        ...operation.metadata
      }
    });
  }

  // Specialized methods for common operations
  notifyConsentCreated(entityName: string, userId?: string, metadata?: Record<string, any>) {
    this.notifyCRUDOperation({
      action: 'create',
      entity: 'consent',
      entityName,
      userId,
      metadata
    });
  }

  notifyGuardianUpdated(guardianName: string, userId?: string, metadata?: Record<string, any>) {
    this.notifyCRUDOperation({
      action: 'update',
      entity: 'guardian',
      entityName: guardianName,
      userId,
      metadata
    });
  }

  notifyDSARCreated(customerName: string, userId?: string, metadata?: Record<string, any>) {
    this.notifyCRUDOperation({
      action: 'create',
      entity: 'dsar',
      entityName: customerName,
      userId,
      metadata
    });
  }

  notifyUserDeleted(userName: string, userId?: string, metadata?: Record<string, any>) {
    this.notifyCRUDOperation({
      action: 'delete',
      entity: 'user',
      entityName: userName,
      userId,
      metadata
    });
  }

  notifyPreferenceUpdated(entityName: string, userId?: string, metadata?: Record<string, any>) {
    this.notifyCRUDOperation({
      action: 'update',
      entity: 'preference',
      entityName,
      userId,
      metadata
    });
  }

  notifyPrivacyNoticePublished(noticeName: string, userId?: string, metadata?: Record<string, any>) {
    this.notifyCRUDOperation({
      action: 'create',
      entity: 'privacy_notice',
      entityName: noticeName,
      userId,
      metadata
    });
  }

  notifyBulkImport(entity: string, count: number, userId?: string, metadata?: Record<string, any>) {
    this.addNotification?.({
      type: 'system',
      category: 'success',
      title: 'Bulk Import Completed',
      message: `Successfully imported ${count} ${entity} records.`,
      metadata: {
        operation: 'import',
        entity,
        count,
        userId,
        ...metadata
      }
    });
  }

  notifyComplianceRuleCreated(ruleName: string, userId?: string, metadata?: Record<string, any>) {
    this.notifyCRUDOperation({
      action: 'create',
      entity: 'compliance_rule',
      entityName: ruleName,
      userId,
      metadata
    });
  }

  // Custom notification method
  notify(
    type: 'consent' | 'preference' | 'privacy-notice' | 'dsar' | 'user' | 'system',
    category: 'urgent' | 'warning' | 'info' | 'success',
    title: string,
    message: string,
    metadata?: Record<string, any>
  ) {
    this.addNotification?.({
      type,
      category,
      title,
      message,
      metadata
    });
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// React hook to initialize and use the service
export const useNotificationService = () => {
  const { addNotification } = useNotifications();
  
  // Initialize the service when the hook is used
  if (addNotification) {
    notificationService.init(addNotification);
  }
  
  return notificationService;
};

export default notificationService;
