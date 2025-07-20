// Advanced Monitoring Service for ConsentHub Production Readiness
import { multiServiceApiClient } from './multiServiceApiClient';

// Monitoring interfaces
export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  timestamp: string;
  details?: any;
  version?: string;
  uptime?: number;
}

export interface PerformanceMetrics {
  service: string;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: string;
  requestSize?: number;
  responseSize?: number;
  userId?: string;
  sessionId?: string;
}

export interface ErrorMetrics {
  service: string;
  endpoint: string;
  method: string;
  errorType: string;
  errorMessage: string;
  statusCode: number;
  timestamp: string;
  userId?: string;
  stackTrace?: string;
  requestData?: any;
}

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    used: number;
    free: number;
    total: number;
    usage: number;
  };
  disk: {
    used: number;
    free: number;
    total: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
}

export interface ConsentMetrics {
  totalConsents: number;
  consentsByType: Record<string, number>;
  consentsByStatus: Record<string, number>;
  consentsByPurpose: Record<string, number>;
  recentConsentTrends: Array<{
    date: string;
    created: number;
    updated: number;
    revoked: number;
  }>;
  complianceScore: number;
  gdprComplianceMetrics: {
    averageResponseTime: number;
    completionRate: number;
    pendingRequests: number;
  };
}

export interface AlertConfiguration {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'error' | 'security' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  condition: {
    metric: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    threshold: number | string;
    timeWindow: string; // e.g., '5m', '1h', '24h'
  };
  enabled: boolean;
  channels: string[]; // email, slack, webhook, etc.
}

export interface MonitoringDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  refreshInterval: number;
  timeRange: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'alert';
  title: string;
  position: { x: number; y: number; width: number; height: number };
  config: any;
  dataSource: string;
}

class AdvancedMonitoringService {
  private metricsBuffer: PerformanceMetrics[] = [];
  private errorBuffer: ErrorMetrics[] = [];
  private healthChecks: Map<string, HealthCheckResult> = new Map();

  /**
   * Comprehensive system health check
   */
  async performSystemHealthCheck(): Promise<{
    overall: 'healthy' | 'unhealthy' | 'degraded';
    services: HealthCheckResult[];
    summary: {
      total: number;
      healthy: number;
      unhealthy: number;
      degraded: number;
    };
  }> {
    const services = [
      'consent',
      'preference', 
      'privacy-notice',
      'party',
      'dsar',
      'event',
      'catalog'
    ];

    const results: HealthCheckResult[] = [];
    
    for (const service of services) {
      try {
        const startTime = Date.now();
        const response = await multiServiceApiClient.makeRequest('GET', '/health', undefined, 'admin', service);
        const responseTime = Date.now() - startTime;

        const healthResult: HealthCheckResult = {
          service,
          status: response.error ? 'unhealthy' : 'healthy',
          responseTime,
          timestamp: new Date().toISOString(),
          details: response,
          version: response.version || 'unknown'
        };

        results.push(healthResult);
        this.healthChecks.set(service, healthResult);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const healthResult: HealthCheckResult = {
          service,
          status: 'unhealthy',
          responseTime: -1,
          timestamp: new Date().toISOString(),
          details: { error: errorMessage }
        };
        
        results.push(healthResult);
        this.healthChecks.set(service, healthResult);
      }
    }

    const summary = {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      unhealthy: results.filter(r => r.status === 'unhealthy').length,
      degraded: results.filter(r => r.status === 'degraded').length
    };

    let overall: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (summary.unhealthy > 0) {
      overall = summary.unhealthy > summary.total / 2 ? 'unhealthy' : 'degraded';
    }

    return { overall, services: results, summary };
  }

  /**
   * Track API performance metrics
   */
  recordPerformanceMetric(metric: PerformanceMetrics): void {
    this.metricsBuffer.push({
      ...metric,
      timestamp: new Date().toISOString()
    });

    // Keep buffer size manageable
    if (this.metricsBuffer.length > 1000) {
      this.metricsBuffer = this.metricsBuffer.slice(-500);
    }
  }

  /**
   * Track error metrics
   */
  recordErrorMetric(error: ErrorMetrics): void {
    this.errorBuffer.push({
      ...error,
      timestamp: new Date().toISOString()
    });

    // Keep buffer size manageable
    if (this.errorBuffer.length > 500) {
      this.errorBuffer = this.errorBuffer.slice(-250);
    }
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics(timeRange: string = '1h'): {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    requestCount: number;
    errorRate: number;
    throughput: number;
    slowestEndpoints: Array<{
      endpoint: string;
      averageTime: number;
      requestCount: number;
    }>;
  } {
    const cutoffTime = this.getTimeRangeCutoff(timeRange);
    const recentMetrics = this.metricsBuffer.filter(m => 
      new Date(m.timestamp) >= cutoffTime
    );

    if (recentMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        requestCount: 0,
        errorRate: 0,
        throughput: 0,
        slowestEndpoints: []
      };
    }

    const responseTimes = recentMetrics.map(m => m.responseTime).sort((a, b) => a - b);
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length;
    
    // Calculate percentiles
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    // Group by endpoint for slowest endpoints analysis
    const endpointMetrics = new Map<string, { times: number[]; count: number }>();
    recentMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!endpointMetrics.has(key)) {
        endpointMetrics.set(key, { times: [], count: 0 });
      }
      const endpointData = endpointMetrics.get(key)!;
      endpointData.times.push(metric.responseTime);
      endpointData.count++;
    });

    const slowestEndpoints = Array.from(endpointMetrics.entries())
      .map(([endpoint, data]) => ({
        endpoint,
        averageTime: data.times.reduce((sum, time) => sum + time, 0) / data.times.length,
        requestCount: data.count
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);

    const timeRangeHours = this.parseTimeRange(timeRange);
    const throughput = recentMetrics.length / timeRangeHours;

    return {
      averageResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      requestCount: recentMetrics.length,
      errorRate: (errorCount / recentMetrics.length) * 100,
      throughput,
      slowestEndpoints
    };
  }

  /**
   * Get consent-specific metrics
   */
  async getConsentMetrics(): Promise<ConsentMetrics> {
    try {
      const response = await multiServiceApiClient.makeRequest('GET', '/metrics/consent', undefined, 'admin', 'consent');
      return response;
    } catch (error) {
      console.error('Failed to fetch consent metrics:', error);
      return {
        totalConsents: 0,
        consentsByType: {},
        consentsByStatus: {},
        consentsByPurpose: {},
        recentConsentTrends: [],
        complianceScore: 0,
        gdprComplianceMetrics: {
          averageResponseTime: 0,
          completionRate: 0,
          pendingRequests: 0
        }
      };
    }
  }

  /**
   * Configure monitoring alerts
   */
  async configureAlerts(alerts: AlertConfiguration[]): Promise<void> {
    try {
      await multiServiceApiClient.makeRequest('POST', '/monitoring/alerts', { alerts }, 'admin');
    } catch (error) {
      console.error('Failed to configure alerts:', error);
      throw error;
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<Array<{
    id: string;
    name: string;
    severity: string;
    triggeredAt: string;
    message: string;
    acknowledged: boolean;
  }>> {
    try {
      const response = await multiServiceApiClient.makeRequest('GET', '/monitoring/alerts/active', undefined, 'admin');
      return response.alerts || [];
    } catch (error) {
      console.error('Failed to fetch active alerts:', error);
      return [];
    }
  }

  /**
   * Create monitoring dashboard
   */
  async createDashboard(dashboard: MonitoringDashboard): Promise<string> {
    try {
      const response = await multiServiceApiClient.makeRequest('POST', '/monitoring/dashboards', dashboard, 'admin');
      return response.dashboardId;
    } catch (error) {
      console.error('Failed to create dashboard:', error);
      throw error;
    }
  }

  /**
   * Real-time metrics streaming
   */
  startMetricsStreaming(callback: (metrics: any) => void): () => void {
    const interval = setInterval(async () => {
      try {
        const healthCheck = await this.performSystemHealthCheck();
        const performance = this.getPerformanceAnalytics('5m');
        const consentMetrics = await this.getConsentMetrics();
        const activeAlerts = await this.getActiveAlerts();

        callback({
          timestamp: new Date().toISOString(),
          health: healthCheck,
          performance,
          consent: consentMetrics,
          alerts: activeAlerts,
          errors: this.getRecentErrors('5m')
        });
      } catch (error) {
        console.error('Metrics streaming error:', error);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }

  private getRecentErrors(timeRange: string): ErrorMetrics[] {
    const cutoffTime = this.getTimeRangeCutoff(timeRange);
    return this.errorBuffer.filter(e => new Date(e.timestamp) >= cutoffTime);
  }

  private getTimeRangeCutoff(timeRange: string): Date {
    const now = new Date();
    const value = parseInt(timeRange.slice(0, -1));
    const unit = timeRange.slice(-1);

    switch (unit) {
      case 'm':
        return new Date(now.getTime() - value * 60 * 1000);
      case 'h':
        return new Date(now.getTime() - value * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 60 * 60 * 1000); // Default 1 hour
    }
  }

  private parseTimeRange(timeRange: string): number {
    const value = parseInt(timeRange.slice(0, -1));
    const unit = timeRange.slice(-1);

    switch (unit) {
      case 'm':
        return value / 60; // Convert minutes to hours
      case 'h':
        return value;
      case 'd':
        return value * 24;
      default:
        return 1; // Default 1 hour
    }
  }
}

export const advancedMonitoringService = new AdvancedMonitoringService();
