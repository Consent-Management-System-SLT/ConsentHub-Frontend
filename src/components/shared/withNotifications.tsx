import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface WithNotificationsProps {
  onCRUDOperation?: (operation: {
    action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'import' | 'approve' | 'reject';
    entity: string;
    entityName?: string;
    metadata?: Record<string, any>;
  }) => void;
}

// Higher-order component to automatically track CRUD operations and send notifications
export function withNotifications<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultEntityType: string
) {
  const WithNotificationsComponent = (props: P & WithNotificationsProps) => {
    const { user } = useAuth();
    const { addNotification } = useNotifications();

    // Enhanced CRUD operation handler that automatically sends notifications
    const handleCRUDOperation = React.useCallback((operation: {
      action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'import' | 'approve' | 'reject';
      entity: string;
      entityName?: string;
      metadata?: Record<string, any>;
    }) => {
      // Send notification with default entity type if none provided
      const entityType = operation.entity || defaultEntityType;
      
      // Create a simple notification directly
      const getActionMessage = (action: string, entity: string, entityName?: string) => {
        const name = entityName || entity;
        switch (action) {
          case 'create': return `${name} has been created successfully.`;
          case 'update': return `${name} has been updated.`;
          case 'delete': return `${name} has been deleted.`;
          case 'approve': return `${name} has been approved.`;
          case 'reject': return `${name} has been rejected.`;
          default: return `${action} operation completed for ${name}.`;
        }
      };
      
      addNotification({
        type: 'system',
        category: operation.action === 'delete' ? 'warning' : 'success',
        title: `${operation.action.charAt(0).toUpperCase() + operation.action.slice(1)} ${entityType}`,
        message: getActionMessage(operation.action, entityType, operation.entityName),
        userId: user?.id,
        metadata: {
          ...operation.metadata,
          timestamp: new Date().toISOString(),
          userRole: user?.role,
          userName: user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email
        }
      });

      // Call the original handler if provided
      if (props.onCRUDOperation) {
        props.onCRUDOperation(operation);
      }
    }, [user, addNotification, props]);

    return (
      <WrappedComponent
        {...props}
        onCRUDOperation={handleCRUDOperation}
      />
    );
  };

  WithNotificationsComponent.displayName = `withNotifications(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithNotificationsComponent;
}

// Utility hook to easily send notifications from any component
export const useCRUDNotifications = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const notifyOperation = React.useCallback((
    action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'import' | 'approve' | 'reject',
    entity: string,
    entityName?: string,
    metadata?: Record<string, any>
  ) => {
    // Create a simple notification directly
    const getActionMessage = (action: string, entity: string, entityName?: string) => {
      const name = entityName || entity;
      switch (action) {
        case 'create': return `${name} has been created successfully.`;
        case 'update': return `${name} has been updated.`;
        case 'delete': return `${name} has been deleted.`;
        case 'approve': return `${name} has been approved.`;
        case 'reject': return `${name} has been rejected.`;
        default: return `${action} operation completed for ${name}.`;
      }
    };
    
    addNotification({
      type: 'system',
      category: action === 'delete' ? 'warning' : 'success',
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} ${entity}`,
      message: getActionMessage(action, entity, entityName),
      userId: user?.id,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        userRole: user?.role,
        userName: user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email
      }
    });
  }, [user, addNotification]);

  return {
    notifyCreate: (entity: string, entityName?: string, metadata?: Record<string, any>) => 
      notifyOperation('create', entity, entityName, metadata),
    
    notifyUpdate: (entity: string, entityName?: string, metadata?: Record<string, any>) => 
      notifyOperation('update', entity, entityName, metadata),
    
    notifyDelete: (entity: string, entityName?: string, metadata?: Record<string, any>) => 
      notifyOperation('delete', entity, entityName, metadata),
    
    notifyView: (entity: string, entityName?: string, metadata?: Record<string, any>) => 
      notifyOperation('view', entity, entityName, metadata),
    
    notifyExport: (entity: string, entityName?: string, metadata?: Record<string, any>) => 
      notifyOperation('export', entity, entityName, metadata),
    
    notifyImport: (entity: string, entityName?: string, metadata?: Record<string, any>) => 
      notifyOperation('import', entity, entityName, metadata),
    
    notifyApprove: (entity: string, entityName?: string, metadata?: Record<string, any>) => 
      notifyOperation('approve', entity, entityName, metadata),
    
    notifyReject: (entity: string, entityName?: string, metadata?: Record<string, any>) => 
      notifyOperation('reject', entity, entityName, metadata),

    notifyCustom: (
      type: 'consent' | 'preference' | 'privacy-notice' | 'dsar' | 'user' | 'system',
      category: 'urgent' | 'warning' | 'info' | 'success',
      title: string,
      message: string,
      metadata?: Record<string, any>
    ) => addNotification({
      type,
      category,
      title,
      message,
      userId: user?.id,
      metadata: {
        ...metadata,
        userRole: user?.role,
        userName: user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email
      }
    })
  };
};
