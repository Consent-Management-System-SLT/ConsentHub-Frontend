import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useCustomerPreferences } from "../../hooks/useCustomerApi";
import { customerApiClient } from "../../services/customerApiClient";
import { useNotifications } from "../../contexts/NotificationContext";

interface PreferenceSettings {
  channels: { email: boolean; sms: boolean; push: boolean; inApp: boolean };
  topics: {
    offers: boolean;
    productUpdates: boolean;
    serviceAlerts: boolean;
    billing: boolean;
    security: boolean;
    newsletters: boolean;
  };
  dndSettings: { enabled: boolean; startTime: string; endTime: string };
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

const defaultPreferences: PreferenceSettings = {
  channels: { email: true, sms: true, push: false, inApp: true },
  topics: {
    offers: true,
    productUpdates: true,
    serviceAlerts: true,
    billing: true,
    security: true,
    newsletters: false,
  },
  dndSettings: { enabled: true, startTime: "22:00", endTime: "08:00" },
  frequency: { maxEmailsPerDay: 3, maxSmsPerDay: 2, digestMode: false },
  language: "en",
  timezone: "Asia/Colombo",
};

const CustomerPreferences: React.FC<CustomerPreferencesProps> = () => {
  const [preferences, setPreferences] = useState<PreferenceSettings | null>(
    null
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const { data: preferencesData, loading, error } = useCustomerPreferences();
  const { addNotification } = useNotifications();

  // Map backend preferences to frontend state
  useEffect(() => {
    if (!loading && preferencesData && preferencesData.preferences) {
      const backendPrefs = preferencesData.preferences;

      const loadedPreferences: PreferenceSettings = {
        channels: {
          email:
            backendPrefs.find((p: any) => p.channelType === "email")
              ?.isAllowed ?? defaultPreferences.channels.email,
          sms:
            backendPrefs.find((p: any) => p.channelType === "sms")?.isAllowed ??
            defaultPreferences.channels.sms,
          push:
            backendPrefs.find((p: any) => p.channelType === "push")
              ?.isAllowed ?? defaultPreferences.channels.push,
          inApp:
            backendPrefs.find((p: any) => p.channelType === "inApp")
              ?.isAllowed ?? defaultPreferences.channels.inApp,
        },
        topics: {
          offers:
            backendPrefs.find((p: any) => p.preferenceType === "offers")
              ?.isAllowed ?? defaultPreferences.topics.offers,
          productUpdates:
            backendPrefs.find((p: any) => p.preferenceType === "productUpdates")
              ?.isAllowed ?? defaultPreferences.topics.productUpdates,
          serviceAlerts:
            backendPrefs.find((p: any) => p.preferenceType === "serviceAlerts")
              ?.isAllowed ?? defaultPreferences.topics.serviceAlerts,
          billing:
            backendPrefs.find((p: any) => p.preferenceType === "billing")
              ?.isAllowed ?? defaultPreferences.topics.billing,
          security:
            backendPrefs.find((p: any) => p.preferenceType === "security")
              ?.isAllowed ?? defaultPreferences.topics.security,
          newsletters:
            backendPrefs.find((p: any) => p.preferenceType === "newsletters")
              ?.isAllowed ?? defaultPreferences.topics.newsletters,
        },
        dndSettings: {
          enabled:
            backendPrefs.find((p: any) => p.preferenceType === "dndEnabled")
              ?.isAllowed ?? defaultPreferences.dndSettings.enabled,
          startTime:
            backendPrefs.find((p: any) => p.preferenceType === "dndStart")
              ?.value ?? defaultPreferences.dndSettings.startTime,
          endTime:
            backendPrefs.find((p: any) => p.preferenceType === "dndEnd")
              ?.value ?? defaultPreferences.dndSettings.endTime,
        },
        frequency: {
          maxEmailsPerDay:
            backendPrefs.find((p: any) => p.preferenceType === "maxEmails")
              ?.value ?? defaultPreferences.frequency.maxEmailsPerDay,
          maxSmsPerDay:
            backendPrefs.find((p: any) => p.preferenceType === "maxSms")
              ?.value ?? defaultPreferences.frequency.maxSmsPerDay,
          digestMode:
            backendPrefs.find((p: any) => p.preferenceType === "digestMode")
              ?.isAllowed ?? defaultPreferences.frequency.digestMode,
        },
        language:
          backendPrefs.find((p: any) => p.preferenceType === "language")
            ?.value ?? defaultPreferences.language,
        timezone:
          backendPrefs.find((p: any) => p.preferenceType === "timezone")
            ?.value ?? defaultPreferences.timezone,
      };

      setPreferences(loadedPreferences);
    }
  }, [loading, preferencesData]);

  // Early return while loading preferences
  if (loading || !preferences) return <div>Loading preferences...</div>;
  if (error) return <div>Error loading preferences</div>;

  // Helper functions
  const updateChannelPreference = (
    channel: keyof PreferenceSettings["channels"],
    value: boolean
  ) => {
    setPreferences((prev) =>
      prev
        ? { ...prev, channels: { ...prev.channels, [channel]: value } }
        : prev
    );
    setHasChanges(true);
  };

  const updateTopicPreference = (
    topic: keyof PreferenceSettings["topics"],
    value: boolean
  ) => {
    setPreferences((prev) =>
      prev ? { ...prev, topics: { ...prev.topics, [topic]: value } } : prev
    );
    setHasChanges(true);
  };

  const updateDndSettings = (
    setting: keyof PreferenceSettings["dndSettings"],
    value: boolean | string
  ) => {
    setPreferences((prev) =>
      prev
        ? { ...prev, dndSettings: { ...prev.dndSettings, [setting]: value } }
        : prev
    );
    setHasChanges(true);
  };

  const updateFrequencySettings = (
    setting: keyof PreferenceSettings["frequency"],
    value: number | boolean
  ) => {
    setPreferences((prev) =>
      prev
        ? { ...prev, frequency: { ...prev.frequency, [setting]: value } }
        : prev
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!preferences) return;
    setIsSaving(true);
    try {
      // Save preferences to backend
      await customerApiClient.post("/preferences/save", preferences);
      setSaveStatus("success");
      setHasChanges(false);

      addNotification({
        title: "Customer Preferences Updated",
        message: `Customer has updated their communication preferences at ${new Date().toLocaleString()}`,
        type: "preference",
        category: "info",
      });

      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
    setHasChanges(false);
  };

  // ToggleSwitch component (unchanged)
  const ToggleSwitch = ({
    enabled,
    onChange,
    label,
    description,
  }: {
    enabled: boolean;
    onChange: (value: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ...rest of your JSX for channels, topics, DND, frequency, and buttons remains unchanged */}
      {/* Just make sure to pass the updated 'preferences' state */}
    </div>
  );
};

export default CustomerPreferences;
