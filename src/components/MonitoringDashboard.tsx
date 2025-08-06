import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { 
  advancedMonitoringService, 
  HealthCheckResult, 
  ConsentMetrics 
} from '../services/advancedMonitoringService';

interface MonitoringDashboardProps {
  refreshInterval?: number;
  showRealTime?: boolean;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  refreshInterval = 30000,
  showRealTime = true
}) => {
  const [healthData, setHealthData] = useState<{
    overall: string;
    services: HealthCheckResult[];
    summary: any;
  } | null>(null);
  
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [consentMetrics, setConsentMetrics] = useState<ConsentMetrics | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        setIsLoading(true);
        
        const [health, performance, consent, alerts] = await Promise.all([
          advancedMonitoringService.performSystemHealthCheck(),
          Promise.resolve(advancedMonitoringService.getPerformanceAnalytics('1h')),
          advancedMonitoringService.getConsentMetrics(),
          advancedMonitoringService.getActiveAlerts()
        ]);

        setHealthData(health);
        setPerformanceData(performance);
        setConsentMetrics(consent);
        setActiveAlerts(alerts);
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Failed to fetch monitoring data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonitoringData();
    
    const interval = setInterval(fetchMonitoringData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  useEffect(() => {
    if (!showRealTime) return;

    const stopStreaming = advancedMonitoringService.startMetricsStreaming((metrics) => {
      setHealthData(metrics.health);
      setPerformanceData(metrics.performance);
      setConsentMetrics(metrics.consent);
      setActiveAlerts(metrics.alerts);
      setLastUpdate(new Date().toLocaleTimeString());
    });

    return stopStreaming;
  }, [showRealTime]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">ConsentHub Monitoring Dashboard</h1>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdate}
              {showRealTime && <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(healthData?.overall || 'unknown')}`}>
                  {healthData?.overall?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {healthData?.summary.healthy || 0}/{healthData?.summary.total || 0}
              </div>
              <p className="text-xs text-gray-500">Healthy Services</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {performanceData?.averageResponseTime?.toFixed(0) || 0}ms
              </div>
              <p className="text-xs text-gray-500">Last Hour</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {activeAlerts.length}
              </div>
              <p className="text-xs text-gray-500">Requires Attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Service Health Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthData?.services.map((service, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900 capitalize">{service.service}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {service.responseTime > 0 ? `${service.responseTime}ms` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">Response Time</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {performanceData?.requestCount || 0}
                    </div>
                    <p className="text-sm text-gray-500">Total Requests</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {performanceData?.errorRate?.toFixed(1) || 0}%
                    </div>
                    <p className="text-sm text-gray-500">Error Rate</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {performanceData?.p95ResponseTime?.toFixed(0) || 0}ms
                    </div>
                    <p className="text-sm text-gray-500">P95 Response</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {performanceData?.throughput?.toFixed(1) || 0}/h
                    </div>
                    <p className="text-sm text-gray-500">Throughput</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consent Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Consent Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {consentMetrics?.totalConsents || 0}
                  </div>
                  <p className="text-sm text-gray-500">Total Consents</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {consentMetrics?.complianceScore || 0}%
                  </div>
                  <p className="text-sm text-gray-500">Compliance Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GDPR Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Avg Response Time</span>
                  <span className="font-medium">
                    {consentMetrics?.gdprComplianceMetrics.averageResponseTime || 0}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Completion Rate</span>
                  <span className="font-medium">
                    {consentMetrics?.gdprComplianceMetrics.completionRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Pending Requests</span>
                  <span className="font-medium text-orange-600">
                    {consentMetrics?.gdprComplianceMetrics.pendingRequests || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consent by Purpose</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(consentMetrics?.consentsByPurpose || {}).map(([purpose, count]) => (
                  <div key={purpose} className="flex justify-between">
                    <span className="text-sm text-gray-500 capitalize">{purpose}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-red-600">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{alert.name}</div>
                        <div className="text-sm text-gray-600">{alert.message}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {new Date(alert.triggeredAt).toLocaleString()}
                      </div>
                      {!alert.acknowledged && (
                        <button className="mt-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Slowest Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Slowest Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Endpoint</th>
                    <th className="text-right py-2">Avg Response Time</th>
                    <th className="text-right py-2">Request Count</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData?.slowestEndpoints?.slice(0, 10).map((endpoint: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 font-mono text-xs">{endpoint.endpoint}</td>
                      <td className="text-right py-2">{endpoint.averageTime.toFixed(0)}ms</td>
                      <td className="text-right py-2">{endpoint.requestCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
