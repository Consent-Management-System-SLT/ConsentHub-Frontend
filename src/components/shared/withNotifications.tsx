import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationService } from '../../services/notificationService';
export const useCRUDNotifications = () => {
  const { user } = useAuth();
  const notificationService = useNotificationService();
  const notifyOperation = React.useCallback((
    action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'import' | 'approve' | 'reject',
    entity: string,
    entityName?: string,
    metadata?: Record<string, any>
  ) => {
    notificationService.notifyCRUDOperation({
      action,
      entity,
      entityName,
      userId: user?.id,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        userRole: user?.role,
        userName: user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email
      }
    });
  }, [user, notificationService]);
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
    ) => notificationService.notify(type, category, title, message, {
      ...metadata,
      userId: user?.id,
      userRole: user?.role,
      userName: user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email
    })
  };
};
