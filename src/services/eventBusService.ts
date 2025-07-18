// Event Bus Topics Configuration for ConsentHub
// Kafka/Event Grid topic mapping for TMF669 events

export const EVENT_TOPICS = {
  CONSENT_CHANGED: 'consenthub.privacyConsent.changed',
  PREFERENCE_CHANGED: 'consenthub.privacyPreference.changed',
  NOTICE_CHANGED: 'consenthub.privacyNotice.changed',
  DSAR_REQUESTED: 'consenthub.dsar.requested',
  AUDIT_LOG: 'consenthub.audit.logged'
} as const;

export const EVENT_TYPES = {
  PRIVACY_CONSENT_CHANGE: 'PrivacyConsentChangeEvent',
  PRIVACY_PREFERENCE_CHANGE: 'PrivacyPreferenceChangeEvent',
  PRIVACY_NOTICE_CHANGE: 'PrivacyNoticeChangeEvent',
  DSAR_REQUEST: 'DSARRequestEvent',
  AUDIT_LOG: 'AuditLogEvent'
} as const;

// Event Bus Configuration
export const EVENT_BUS_CONFIG = {
  // Kafka Configuration
  KAFKA: {
    BROKERS: process.env.VITE_KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    CLIENT_ID: 'consenthub-frontend',
    GROUP_ID: 'consenthub-consumers',
    TOPICS: Object.values(EVENT_TOPICS)
  },

  // Azure Event Grid Configuration
  AZURE_EVENT_GRID: {
    ENDPOINT: process.env.VITE_AZURE_EVENT_GRID_ENDPOINT,
    ACCESS_KEY: process.env.VITE_AZURE_EVENT_GRID_ACCESS_KEY,
    TOPIC_NAME: 'consenthub-events'
  },

  // RabbitMQ Configuration
  RABBITMQ: {
    CONNECTION_STRING: process.env.VITE_RABBITMQ_CONNECTION_STRING || 'amqp://localhost:5672',
    EXCHANGE: 'consenthub-events',
    QUEUE_PREFIX: 'consenthub'
  }
};

// Event Routing Configuration
export const EVENT_ROUTING = {
  // Services that should receive consent change events
  CONSENT_SUBSCRIBERS: [
    'crm-service',
    'marketing-service',
    'compliance-engine',
    'audit-service'
  ],

  // Services that should receive preference change events
  PREFERENCE_SUBSCRIBERS: [
    'notification-engine',
    'campaign-ops',
    'csr-dashboard'
  ],

  // Services that should receive notice change events
  NOTICE_SUBSCRIBERS: [
    'consent-service',
    'customer-portal',
    'legal-service'
  ],

  // Services that should receive DSAR events
  DSAR_SUBSCRIBERS: [
    'data-vault',
    'legal-notifier',
    'customer-portal'
  ]
};

// Event Schema Validation
export const EVENT_SCHEMAS = {
  CONSENT_CHANGE: {
    type: 'object',
    required: ['eventId', 'eventTime', 'eventType', 'event'],
    properties: {
      eventId: { type: 'string' },
      eventTime: { type: 'string', format: 'date-time' },
      eventType: { type: 'string', enum: ['PrivacyConsentChangeEvent'] },
      event: {
        type: 'object',
        required: ['resource'],
        properties: {
          resource: {
            type: 'object',
            required: ['id', 'partyId', 'purpose', 'status'],
            properties: {
              id: { type: 'string' },
              partyId: { type: 'string' },
              purpose: { type: 'string' },
              status: { type: 'string', enum: ['granted', 'revoked', 'pending', 'expired'] },
              channel: { type: 'string' },
              validFor: {
                type: 'object',
                properties: {
                  startDateTime: { type: 'string', format: 'date-time' },
                  endDateTime: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    }
  },

  PREFERENCE_CHANGE: {
    type: 'object',
    required: ['eventId', 'eventTime', 'eventType', 'event'],
    properties: {
      eventId: { type: 'string' },
      eventTime: { type: 'string', format: 'date-time' },
      eventType: { type: 'string', enum: ['PrivacyPreferenceChangeEvent'] },
      event: {
        type: 'object',
        required: ['resource'],
        properties: {
          resource: {
            type: 'object',
            required: ['id', 'partyId', 'preferredChannels'],
            properties: {
              id: { type: 'string' },
              partyId: { type: 'string' },
              preferredChannels: { type: 'object' },
              topicSubscriptions: { type: 'object' },
              doNotDisturb: {
                type: 'object',
                properties: {
                  start: { type: 'string' },
                  end: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }
};

// Event Bus Service Interface
export interface EventBusService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish(topic: string, event: any): Promise<void>;
  subscribe(topic: string, callback: (event: any) => void): Promise<void>;
  unsubscribe(topic: string, callback: (event: any) => void): Promise<void>;
}

// Event Bus Factory
export class EventBusFactory {
  static create(type: 'kafka' | 'azure' | 'rabbitmq' = 'kafka'): EventBusService {
    switch (type) {
      case 'kafka':
        return new KafkaEventBusService();
      case 'azure':
        return new AzureEventGridService();
      case 'rabbitmq':
        return new RabbitMQEventBusService();
      default:
        throw new Error(`Unsupported event bus type: ${type}`);
    }
  }
}

// Mock implementations for development
class KafkaEventBusService implements EventBusService {
  async connect(): Promise<void> {
    console.log('Kafka EventBus connected');
  }

  async disconnect(): Promise<void> {
    console.log('Kafka EventBus disconnected');
  }

  async publish(topic: string, event: any): Promise<void> {
    console.log(`Publishing to Kafka topic ${topic}:`, event);
  }

  async subscribe(topic: string, callback: (event: any) => void): Promise<void> {
    console.log(`Subscribed to Kafka topic ${topic}`);
  }

  async unsubscribe(topic: string, callback: (event: any) => void): Promise<void> {
    console.log(`Unsubscribed from Kafka topic ${topic}`);
  }
}

class AzureEventGridService implements EventBusService {
  async connect(): Promise<void> {
    console.log('Azure Event Grid connected');
  }

  async disconnect(): Promise<void> {
    console.log('Azure Event Grid disconnected');
  }

  async publish(topic: string, event: any): Promise<void> {
    console.log(`Publishing to Azure Event Grid topic ${topic}:`, event);
  }

  async subscribe(topic: string, callback: (event: any) => void): Promise<void> {
    console.log(`Subscribed to Azure Event Grid topic ${topic}`);
  }

  async unsubscribe(topic: string, callback: (event: any) => void): Promise<void> {
    console.log(`Unsubscribed from Azure Event Grid topic ${topic}`);
  }
}

class RabbitMQEventBusService implements EventBusService {
  async connect(): Promise<void> {
    console.log('RabbitMQ EventBus connected');
  }

  async disconnect(): Promise<void> {
    console.log('RabbitMQ EventBus disconnected');
  }

  async publish(topic: string, event: any): Promise<void> {
    console.log(`Publishing to RabbitMQ topic ${topic}:`, event);
  }

  async subscribe(topic: string, callback: (event: any) => void): Promise<void> {
    console.log(`Subscribed to RabbitMQ topic ${topic}`);
  }

  async unsubscribe(topic: string, callback: (event: any) => void): Promise<void> {
    console.log(`Unsubscribed from RabbitMQ topic ${topic}`);
  }
}

export { KafkaEventBusService, AzureEventGridService, RabbitMQEventBusService };
