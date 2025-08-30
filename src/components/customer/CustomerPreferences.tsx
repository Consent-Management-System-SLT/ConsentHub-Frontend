import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Clock,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Mail,
  MessageSquare,
  Phone,
  Smartphone
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { preferenceService } from '../../services/preferenceService';
import { authService } from '../../services/authService';
import { websocketService, PreferenceUpdateEvent } from '../../services/websocketService';

interface PreferenceChannel {
  _id: string;
  name: string;
  key: string;
  description: string;
  icon: string;
  enabled: boolean;
  isDefault: boolean;
}

interface PreferenceTopic {
  _id: string;
  name: string;
  key: string;
  description: string;
  category: string;
  enabled: boolean;
  isDefault: boolean;
  priority: string;
}

interface PreferenceConfig {
  communicationChannels: PreferenceChannel[];
  topicSubscriptions: PreferenceTopic[];
  lastUpdated: string;
}

interface PreferenceSettings {
  channels: { [key: string]: boolean };
  topics: { [key: string]: boolean };
  dndSettings: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  frequency: {
    maxEmailsPerDay: number;
    maxSmsPerDay: number;
    digestMode: boolean;
  };
  language: string;
  timezone: string;
}

interface CustomerPreferencesProps {
  onBack?: () => void;
}

const CustomerPreferences: React.FC<CustomerPreferencesProps> = () => {
  // Dynamic preference configuration from admin
  const [preferenceConfig, setPreferenceConfig] = useState<PreferenceConfig | null>(null);
  
  const [preferences, setPreferences] = useState<PreferenceSettings>({
    channels: {},
    topics: {},
    dndSettings: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00'
    },
    frequency: {
      maxEmailsPerDay: 3,
      maxSmsPerDay: 2,
      digestMode: false
    },
    language: 'en',
    timezone: 'Asia/Colombo'
  });

  // Load dynamic preference configuration from admin
  const loadPreferenceConfig = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/customer/preference-config');
      const data = await response.json();
      if (data.success) {
        setPreferenceConfig(data.config);
        console.log('📋 Customer Dashboard - Dynamic config loaded:', data.config);
        console.log('📺 Available Channels:', data.config.communicationChannels?.length || 0);
        console.log('📰 Available Topics:', data.config.topicSubscriptions?.length || 0);
        
        // Initialize default preferences based on config
        initializeDefaultPreferences(data.config);
      }
    } catch (error) {
      console.error('Failed to load customer preference configuration:', error);
    }
  };

  // Initialize default preferences based on config
  const initializeDefaultPreferences = (config: PreferenceConfig) => {
    setPreferences(prev => {
      const defaultChannels: { [key: string]: boolean } = {};
      const defaultTopics: { [key: string]: boolean } = {};
      
      // Set default channel preferences (use isDefault from config)
      config.communicationChannels?.forEach(channel => {
        defaultChannels[channel.key] = channel.isDefault || false;
      });
      
      // Set default topic preferences (use isDefault from config)
      config.topicSubscriptions?.forEach(topic => {
        defaultTopics[topic.key] = topic.isDefault || false;
      });
      
      return {
        ...prev,
        channels: defaultChannels,
        topics: defaultTopics
      };
    });
  };

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add notification functionality
  const { addNotification } = useNotifications();

  // Load preferences from the correct service
  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      console.log('Loading customer preferences...');
      
      const response = await preferenceService.getCustomerPreferences();
      
      if (response.success && response.data) {
        console.log('Raw preferences data:', response.data);
        
        console.log('Debug - response.data:', typeof response.data, response.data);
        
        // Handle both possible response structures for maximum compatibility
        let communicationData = null;
        
        // Pattern 1: Direct communication array
        if (response.data.communication && Array.isArray(response.data.communication) && response.data.communication.length > 0) {
          communicationData = response.data.communication;
          console.log('Using direct communication structure');
        }
        // Pattern 2: Nested data.communication array (comprehensive backend)
        else if (response.data.data && response.data.data.communication && Array.isArray(response.data.data.communication) && response.data.data.communication.length > 0) {
          communicationData = response.data.data.communication;
          console.log('Using nested data.communication structure');
        }
        // Pattern 3: Single communication object (after CSR updates)
        else if (response.data.data && response.data.data.communication && !Array.isArray(response.data.data.communication)) {
          communicationData = [response.data.data.communication];
          console.log('Using single communication object structure');
        }
        // Pattern 4: Direct preferences in response data
        else if (response.data.preferences && typeof response.data.preferences === 'object') {
          communicationData = [response.data.preferences];
          console.log('Using direct preferences structure');
        }
        
        const communicationPrefs = communicationData && communicationData.length > 0 
          ? communicationData[0] 
          : null;
        
        console.log('Debug - communicationPrefs result:', !!communicationPrefs);

        if (communicationPrefs) {
          console.log('Mapping backend preferences to UI format...');
          console.log('Communication preferences:', communicationPrefs);
          const updatedPreferences = { ...preferences };
          
          // Map preferred channels using dynamic configuration
          if (communicationPrefs.preferredChannels && preferenceConfig?.communicationChannels) {
            const channelMappings: { [key: string]: boolean } = {};
            preferenceConfig.communicationChannels.forEach(channel => {
              channelMappings[channel.key] = communicationPrefs.preferredChannels[channel.key] || false;
            });
            updatedPreferences.channels = channelMappings;
          } else if (communicationPrefs.preferredChannels) {
            // Fallback to direct mapping if no config available
            updatedPreferences.channels = communicationPrefs.preferredChannels;
          }
          
          // Map topic subscriptions using dynamic configuration
          if (communicationPrefs.topicSubscriptions && preferenceConfig?.topicSubscriptions) {
            const topicMappings: { [key: string]: boolean } = {};
            preferenceConfig.topicSubscriptions.forEach(topic => {
              topicMappings[topic.key] = communicationPrefs.topicSubscriptions[topic.key] || false;
            });
            updatedPreferences.topics = topicMappings;
          } else if (communicationPrefs.topicSubscriptions) {
            // Fallback to direct mapping if no config available
            updatedPreferences.topics = communicationPrefs.topicSubscriptions;
          }
          
          // Map do not disturb settings (handle both quietHours and doNotDisturb field names)
          if (communicationPrefs.doNotDisturb || communicationPrefs.quietHours) {
            const dndData = communicationPrefs.doNotDisturb || communicationPrefs.quietHours;
            updatedPreferences.dndSettings = {
              enabled: dndData.enabled || false,
              startTime: dndData.start || '22:00',
              endTime: dndData.end || '08:00',
            };
          }
          
          // Map other settings
          if (communicationPrefs.language) {
            updatedPreferences.language = communicationPrefs.language;
          }
          
          if (communicationPrefs.timezone) {
            updatedPreferences.timezone = communicationPrefs.timezone;
          }
          
          console.log('Preferences mapped successfully:', updatedPreferences);
          setPreferences(updatedPreferences);
          
        } else {
          console.log('No communication preferences found in response, using defaults');
        }
      } else {
        console.warn('Failed to load preferences:', response.error);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load preference configuration first, then preferences
  useEffect(() => {
    const initializePreferences = async () => {
      await loadPreferenceConfig(); // Load dynamic configuration from admin first
      await loadPreferences(); // Then load user preferences with config available
    };
    
    initializePreferences();
  }, []);

  // Reload preferences when preference config changes
  useEffect(() => {
    if (preferenceConfig) {
      console.log('Preference config loaded, reloading preferences with proper mapping');
      loadPreferences();
    }
  }, [preferenceConfig]);

  // Set up real-time preference update listener for CSR changes
  useEffect(() => {
    console.log('Setting up real-time CSR preference update listener in customer dashboard');
    
    const handleCSRPreferenceUpdate = async (event: PreferenceUpdateEvent) => {
      console.log('Customer received CSR preference update:', event);
      
      try {
        const currentUser = await authService.getCurrentUser();
        
        // Only update if it's for the current customer and source is CSR
        if (currentUser?.id && event.customerId === currentUser.id && event.source === 'csr') {
          console.log('Refreshing customer view for CSR preference update');
          await loadPreferences(); // Reload preferences to get latest data
          setSaveStatus('idle'); // Reset any save status
          setHasChanges(false); // Reset changes flag
          
          // Show a notification that CSR made changes
          addNotification({
            type: 'preference',
            category: 'info',
            title: 'Preferences Updated',
            message: 'Your communication preferences have been updated by customer service.'
          });
        }
      } catch (error) {
        console.error('Error handling CSR preference update:', error);
      }
    };

    // Set up the listener
    websocketService.onCSRPreferenceUpdate(handleCSRPreferenceUpdate);

    // Cleanup listener on unmount
    return () => {
      console.log('Cleaning up CSR preference update listener in customer dashboard');
      websocketService.offCSRPreferenceUpdate();
    };
  }, []); // Run once on mount
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const updateChannelPreference = (channel: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: value
      }
    }));
    setHasChanges(true);
  };

  const updateTopicPreference = (topic: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      topics: {
        ...prev.topics,
        [topic]: value
      }
    }));
    setHasChanges(true);
  };

  // Helper functions for dynamic rendering
  const getChannelIcon = (iconName: string) => {
    const iconProps = { className: "w-5 h-5 text-myslt-primary" };
    switch (iconName) {
      case 'Mail':
        return <Mail {...iconProps} />;
      case 'MessageSquare':
        return <MessageSquare {...iconProps} />;
      case 'Bell':
        return <Bell {...iconProps} />;
      case 'Phone':
        return <Phone {...iconProps} />;
      case 'Smartphone':
        return <Smartphone {...iconProps} />;
      default:
        return <Settings {...iconProps} />; // Default fallback
    }
  };

  const renderChannelToggles = () => {
    if (!preferenceConfig?.communicationChannels) {
      // Fallback to hardcoded channels if config not loaded
      return (
        <>
          <ToggleSwitch
            enabled={preferences.channels.email}
            onChange={(value) => updateChannelPreference('email', value)}
            label="Email Notifications"
            description="Receive notifications via email"
          />
          <ToggleSwitch
            enabled={preferences.channels.sms}
            onChange={(value) => updateChannelPreference('sms', value)}
            label="SMS Notifications"
            description="Receive notifications via SMS"
          />
          <ToggleSwitch
            enabled={preferences.channels.push}
            onChange={(value) => updateChannelPreference('push', value)}
            label="Push Notifications"
            description="Receive push notifications on your mobile device"
          />
          <ToggleSwitch
            enabled={preferences.channels.inApp}
            onChange={(value) => updateChannelPreference('inApp', value)}
            label="In-App Notifications"
            description="Receive notifications within the application"
          />
        </>
      );
    }

    // Dynamic rendering based on admin configuration
    return preferenceConfig.communicationChannels.map((channel) => (
      <ToggleSwitch
        key={channel.key}
        enabled={preferences.channels[channel.key as keyof typeof preferences.channels] ?? channel.isDefault}
        onChange={(value) => updateChannelPreference(channel.key, value)}
        label={channel.name}
        description={channel.description}
      />
    ));
  };

  const renderTopicToggles = () => {
    if (!preferenceConfig?.topicSubscriptions) {
      // Fallback to hardcoded topics if config not loaded
      return (
        <>
          <ToggleSwitch
            enabled={preferences.topics.offers}
            onChange={(value) => updateTopicPreference('offers', value)}
            label="Special Offers & Promotions"
            description="Promotional offers and discounts"
          />
          <ToggleSwitch
            enabled={preferences.topics.productUpdates}
            onChange={(value) => updateTopicPreference('productUpdates', value)}
            label="Product Updates"
            description="Notifications about new features and updates"
          />
          <ToggleSwitch
            enabled={preferences.topics.serviceAlerts}
            onChange={(value) => updateTopicPreference('serviceAlerts', value)}
            label="Service Alerts"
            description="Important service notifications and outages"
          />
          <ToggleSwitch
            enabled={preferences.topics.billing}
            onChange={(value) => updateTopicPreference('billing', value)}
            label="Billing & Payments"
            description="Bill notifications and payment reminders"
          />
          <ToggleSwitch
            enabled={preferences.topics.security}
            onChange={(value) => updateTopicPreference('security', value)}
            label="Security Alerts"
            description="Account security and privacy updates"
          />
        </>
      );
    }

    // Dynamic rendering based on admin configuration
    return preferenceConfig.topicSubscriptions.map((topic) => (
      <ToggleSwitch
        key={topic.key}
        enabled={preferences.topics[topic.key as keyof typeof preferences.topics] ?? topic.isDefault}
        onChange={(value) => updateTopicPreference(topic.key, value)}
        label={topic.name}
        description={topic.description}
      />
    ));
  };

  const updateDndSettings = (setting: keyof PreferenceSettings['dndSettings'], value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      dndSettings: {
        ...prev.dndSettings,
        [setting]: value
      }
    }));
    setHasChanges(true);
  };

  const updateFrequencySettings = (setting: keyof PreferenceSettings['frequency'], value: number | boolean) => {
    setPreferences(prev => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        [setting]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Get the current user data from context
      const userData = await authService.getCurrentUser();
      if (!userData || !userData.id) {
        throw new Error('User not authenticated');
      }

      console.log('🔄 Saving customer preferences...', { userId: userData.id, preferences });

      // Build dynamic channel preferences based on admin configuration
      const preferredChannels: { [key: string]: boolean } = {};
      if (preferenceConfig?.communicationChannels) {
        preferenceConfig.communicationChannels.forEach(channel => {
          preferredChannels[channel.key] = preferences.channels[channel.key] ?? channel.isDefault;
        });
      } else {
        // Fallback to hardcoded if config not loaded
        preferredChannels['email'] = preferences.channels.email;
        preferredChannels['sms'] = preferences.channels.sms;
        preferredChannels['push'] = preferences.channels.push;
        preferredChannels['inApp'] = preferences.channels.inApp;
      }

      // Build dynamic topic subscriptions based on admin configuration
      const topicSubscriptions: { [key: string]: boolean } = {};
      if (preferenceConfig?.topicSubscriptions) {
        preferenceConfig.topicSubscriptions.forEach(topic => {
          topicSubscriptions[topic.key] = preferences.topics[topic.key] ?? topic.isDefault;
        });
      } else {
        // Fallback to hardcoded if config not loaded
        topicSubscriptions['offers'] = preferences.topics.offers;
        topicSubscriptions['productUpdates'] = preferences.topics.productUpdates;
        topicSubscriptions['serviceAlerts'] = preferences.topics.serviceAlerts;
        topicSubscriptions['billing'] = preferences.topics.billing;
        topicSubscriptions['security'] = preferences.topics.security;
        topicSubscriptions['newsletters'] = preferences.topics.newsletters;
      }

      const doNotDisturbSettings = {
        enabled: preferences.dndSettings.enabled,
        start: preferences.dndSettings.startTime,
        end: preferences.dndSettings.endTime
      };

      console.log('📤 Sending preference data:', {
        preferredChannels,
        topicSubscriptions,
        doNotDisturbSettings
      });

      // Use the preferenceService to update communication preferences
      const response = await preferenceService.updateCommunicationPreferences(userData.id, {
        preferredChannels,
        topicSubscriptions,
        frequency: 'immediate',
        timezone: preferences.timezone,
        language: preferences.language,
        doNotDisturb: doNotDisturbSettings
      });

      if (response.success) {
        console.log('✅ Preferences saved successfully to MongoDB');
        setSaveStatus('success');
        setHasChanges(false);
        
        // Reload preferences to ensure UI shows the saved state
        console.log('🔄 Reloading preferences after save...');
        await loadPreferences();
        
        // Add notification for admin/CSR users
        addNotification({
          title: 'Customer Preferences Updated',
          message: `Customer has updated their communication preferences at ${new Date().toLocaleString()}`,
          type: 'preference',
          category: 'info'
        });
      } else {
        throw new Error(response.error || 'Failed to save preferences');
      }
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('❌ Failed to save preferences:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setPreferences({
      channels: {
        email: true,
        sms: true,
        push: false,
        inApp: true
      },
      topics: {
        offers: true,
        productUpdates: true,
        serviceAlerts: true,
        billing: true,
        security: true,
        newsletters: false
      },
      dndSettings: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00'
      },
      frequency: {
        maxEmailsPerDay: 3,
        maxSmsPerDay: 2,
        digestMode: false
      },
      language: 'en',
      timezone: 'Asia/Colombo'
    });
    setHasChanges(false);
  };

  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    label, 
    description 
  }: { 
    enabled: boolean; 
    onChange: (value: boolean) => void; 
    label: string; 
    description?: string; 
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-myslt-accent/10 last:border-b-0">
      <div className="flex-1">
        <label className="text-sm font-medium text-myslt-text-primary">{label}</label>
        {description && <p className="text-xs text-myslt-text-muted mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-myslt-primary focus:ring-offset-2 ${
          enabled ? 'bg-myslt-primary' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  // Show loading state while preferences are being loaded
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-myslt-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-myslt-text-muted">Loading your preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-myslt-text-primary">Communication Preferences</h1>
          <p className="text-myslt-text-muted mt-2">Customize how and when you receive communications from us</p>
        </div>
        
        {saveStatus === 'success' && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-myslt-success/10 text-myslt-success rounded-lg border border-myslt-success/20">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Preferences saved!</span>
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Error saving preferences</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Communication Channels */}
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20">
          <div className="p-6 border-b border-myslt-accent/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-myslt-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-myslt-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-myslt-text-primary">Communication Channels</h2>
                <p className="text-sm text-myslt-text-muted">Choose how you'd like to receive notifications</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {renderChannelToggles()}
          </div>
        </div>

        {/* Topic Subscriptions */}
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20">
          <div className="p-6 border-b border-myslt-accent/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-myslt-success/10 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-myslt-success" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-myslt-text-primary">Topic Subscriptions</h2>
                <p className="text-sm text-myslt-text-muted">Select the types of communications you want to receive</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {renderTopicToggles()}
          </div>
        </div>

        {/* Do Not Disturb Settings */}
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20">
          <div className="p-6 border-b border-myslt-accent/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                {preferences.dndSettings.enabled ? <VolumeX className="w-5 h-5 text-purple-600" /> : <Volume2 className="w-5 h-5 text-purple-600" />}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-myslt-text-primary">Do Not Disturb</h2>
                <p className="text-sm text-myslt-text-muted">Set quiet hours for notifications</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <ToggleSwitch
              enabled={preferences.dndSettings.enabled}
              onChange={(value) => updateDndSettings('enabled', value)}
              label="Enable Do Not Disturb"
              description="Suppress non-urgent notifications during specified hours"
            />
            
            {preferences.dndSettings.enabled && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-myslt-accent/10">
                <div>
                  <label className="block text-sm font-medium text-myslt-text-primary mb-2">Start Time</label>
                  <input
                    type="time"
                    value={preferences.dndSettings.startTime}
                    onChange={(e) => updateDndSettings('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent bg-myslt-service-card text-myslt-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-myslt-text-primary mb-2">End Time</label>
                  <input
                    type="time"
                    value={preferences.dndSettings.endTime}
                    onChange={(e) => updateDndSettings('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent bg-myslt-service-card text-myslt-text-primary"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Frequency Limits */}
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20">
          <div className="p-6 border-b border-myslt-accent/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-myslt-text-primary">Frequency Limits</h2>
                <p className="text-sm text-myslt-text-muted">Control how often you receive notifications</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-myslt-text-primary mb-2">Maximum Emails per Day</label>
              <select
                value={preferences.frequency.maxEmailsPerDay}
                onChange={(e) => updateFrequencySettings('maxEmailsPerDay', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent bg-myslt-service-card text-myslt-text-primary"
              >
                <option value={1}>1 email per day</option>
                <option value={2}>2 emails per day</option>
                <option value={3}>3 emails per day</option>
                <option value={5}>5 emails per day</option>
                <option value={10}>10 emails per day</option>
                <option value={999}>No limit</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-myslt-text-primary mb-2">Maximum SMS per Day</label>
              <select
                value={preferences.frequency.maxSmsPerDay}
                onChange={(e) => updateFrequencySettings('maxSmsPerDay', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent bg-myslt-service-card text-myslt-text-primary"
              >
                <option value={1}>1 SMS per day</option>
                <option value={2}>2 SMS per day</option>
                <option value={3}>3 SMS per day</option>
                <option value={5}>5 SMS per day</option>
                <option value={999}>No limit</option>
              </select>
            </div>

            <ToggleSwitch
              enabled={preferences.frequency.digestMode}
              onChange={(value) => updateFrequencySettings('digestMode', value)}
              label="Daily Digest Mode"
              description="Receive a single daily summary instead of individual notifications"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div>
              <p className="text-sm font-medium text-myslt-text-primary">You have unsaved changes</p>
              <p className="text-xs text-myslt-text-muted">Your preferences will be lost if you leave without saving</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-myslt-text-primary bg-myslt-service-card hover:bg-myslt-service-card/80 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-myslt-primary hover:bg-myslt-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPreferences;
