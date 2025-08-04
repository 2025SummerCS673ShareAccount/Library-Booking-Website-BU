/**
 * Server Status Banner Component
 * A reusable component that displays connection status and API health
 * Based on DashboardPage.jsx Connection Status implementation
 * Now supports both local and global API status with refresh functionality
 */
import React from 'react';
import { Card, Space, Tag, Alert, Button } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ApiOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import ConnectionStatus from './ConnectionStatus';
import { useGlobalApi } from '../contexts/GlobalApiContext';

const ServerStatusBanner = ({
  // Local API status (for backward compatibility)
  apiStatus: localApiStatus = null,
  connectionDetails: localConnectionDetails = null,
  isConnecting: localIsConnecting = null,

  // Refresh callback for local pages
  onRefresh = null,

  // Display options
  showConnectionStatus = true,
  showApiStatusCard = true,
  showConnectingAlert = true,
  showRefreshButton = true,
  useGlobalApi: useGlobalApiStatus = false,
  style = {}
}) => {
  const globalApi = useGlobalApi();

  // Use global API status if requested, otherwise use local status
  const apiStatus = useGlobalApiStatus ? globalApi.apiStatus : (localApiStatus || 'disconnected');
  const connectionDetails = useGlobalApiStatus ? globalApi.connectionDetails : (localConnectionDetails || {
    backend: 'unknown',
    database: 'unknown',
    lastUpdated: null,
    responseTime: null
  });
  const isConnecting = useGlobalApiStatus ? globalApi.isConnecting : (localIsConnecting || false);

  // Handle refresh click
  const handleRefresh = async () => {
    if (useGlobalApiStatus) {
      // Use global API refresh
      await globalApi.refreshApi();
    } else if (onRefresh) {
      // Use local page refresh callback
      await onRefresh();
    }
  };

  return (
    <div style={style}>
      {/* Connection Status Component */}
      {showConnectionStatus && (
        <ConnectionStatus
          showDetails={true}
          compact={false}
          style={{ marginBottom: 24 }}
          customStatus={{
            apiStatus: apiStatus,
            connectionDetails: connectionDetails,
            isConnecting: isConnecting
          }}
          onRefresh={handleRefresh}
        />
      )}

      {/* API Connection Status Indicator (connecting alert) */}
      {showConnectingAlert && isConnecting && (
        <Alert
          message={useGlobalApiStatus ? "Initializing Global API" : "Connecting to Backend API"}
          description={useGlobalApiStatus ? "Establishing global connection to bub-backend API service..." : "Establishing connection to bub-backend API service..."}
          type="info"
          showIcon
          icon={<ClockCircleOutlined spin />}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Real-time API Status Card */}
      {showApiStatusCard && (
        <Card
          size="small"
          style={{ marginBottom: 16 }}
          extra={
            showRefreshButton && (
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isConnecting}
                title={useGlobalApiStatus ? "Refresh Global Data" : "Refresh Page Data"}
              >
                Refresh
              </Button>
            )
          }
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Space>
                <Tag
                  color={
                    apiStatus === 'connected' ? 'success' :
                      apiStatus === 'connecting' ? 'processing' :
                        apiStatus === 'error' ? 'error' : 'default'
                  }
                  icon={
                    apiStatus === 'connected' ? <CheckCircleOutlined /> :
                      apiStatus === 'connecting' ? <ClockCircleOutlined spin /> :
                        apiStatus === 'error' ? <CloseCircleOutlined /> :
                          <ApiOutlined />
                  }
                >
                  {apiStatus === 'connected' ? 'API Connected' :
                    apiStatus === 'connecting' ? 'Connecting...' :
                      apiStatus === 'error' ? 'API Error' :
                        'Disconnected'}
                </Tag>
                <Tag color={connectionDetails.backend === 'healthy' ? 'success' : 'error'}>
                  Backend: {connectionDetails.backend}
                </Tag>
                <Tag color={connectionDetails.database === 'connected' ? 'success' : 'error'}>
                  Database: {connectionDetails.database}
                </Tag>
                {useGlobalApiStatus && (
                  <Tag color="blue" title="Using Global API Status">
                    Global
                  </Tag>
                )}
              </Space>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {connectionDetails.responseTime && `${connectionDetails.responseTime}ms`}
              {connectionDetails.lastUpdated && (
                <span style={{ marginLeft: 8 }}>
                  Updated: {new Date(connectionDetails.lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ServerStatusBanner;
