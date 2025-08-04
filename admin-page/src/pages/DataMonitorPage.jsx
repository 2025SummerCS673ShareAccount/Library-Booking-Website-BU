/**
 * Data Monitor Page - Monitor and manage data from all systems
 * 
 * This page provides comprehensive monitoring for:
 * - bub-backend API data
 * - bu-book frontend data usage
 * - Real-time availability data
 * - System health monitoring
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Typography,
  Badge,
  message
} from 'antd';
import {
  DatabaseOutlined,
  MonitorOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dataMonitorService from '../services/dataMonitorService';
import { useConnection } from '../contexts/ConnectionContext';
import { useDataSource } from '../contexts/DataSourceContext';
import { 
  DataUnavailablePlaceholder,
  PageLoadingSkeleton 
} from '../components/SkeletonComponents';
import ServerStatusBanner from '../components/ServerStatusBanner';

const { Title, Paragraph } = Typography;

/**
 * Data Monitor Dashboard Component
 */
const DataMonitorPage = () => {
  const connection = useConnection();
  const { useRealData } = useDataSource();
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState({});

  // Load all data when component mounts
  useEffect(() => {
    loadAllData();
  }, [connection.isDataAvailable, useRealData]);

  /**
   * Load all monitoring data
   */
  const loadAllData = async () => {
    try {
      setLoading(true);
      await checkSystemHealth();
    } catch (error) {
      message.error('Failed to load monitoring data');
      console.error('Data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check system health status
   */
  const checkSystemHealth = async () => {
    try {
      if (!useRealData) {
        // Use mock health data
        setSystemHealth({
          supabase: { status: 'healthy', message: 'Mock database connected', responseTime: 32 },
          buBookFrontend: { status: 'healthy', message: 'Mock frontend service accessible', responseTime: 120 },
          adminPage: { status: 'running', message: 'Current session active', responseTime: 5 }
        });
        return;
      }

      // Check bu-book frontend status
      const buBookFrontendHealth = await checkBuBookFrontendHealth();
      
      // Check Supabase status
      const supabaseHealth = await checkSupabaseHealth();
      
      const health = await dataMonitorService.checkSystemHealth();
      setSystemHealth({
        ...health,
        supabase: supabaseHealth,
        buBookFrontend: buBookFrontendHealth
      });
    } catch (error) {
      console.error('Health check failed:', error);
      setSystemHealth({
        supabase: { status: 'error', message: 'Database check failed' },
        buBookFrontend: { status: 'error', message: 'Frontend check failed' },
        adminPage: { status: 'running', message: 'Current session active' }
      });
    }
  };

  /**
   * Check Supabase database health status
   */
  const checkSupabaseHealth = async () => {
    const startTime = Date.now();
    
    try {
      // Import supabase client
      const { supabase } = await import('../lib/supabase');
      
      // Perform a simple query to test database connection
      const { data, error } = await supabase
        .from('buildings')
        .select('count', { count: 'exact', head: true });
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        return {
          status: 'error',
          message: `Database query failed: ${error.message}`,
          responseTime: responseTime
        };
      }
      
      return {
        status: 'healthy',
        message: 'Database connection successful',
        responseTime: responseTime,
        details: `Query executed successfully`
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'error',
        message: `Database connection failed: ${error.message}`,
        responseTime: responseTime
      };
    }
  };

  /**
   * Check bu-book frontend health status
   */
  const checkBuBookFrontendHealth = async () => {
    const frontendUrl = 'https://terrier-libroom-booking.vercel.app/';
    const startTime = Date.now();
    
    try {
      // Use fetch with no-cors mode to avoid CORS issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(frontendUrl, {
        method: 'HEAD',
        mode: 'no-cors', // This will avoid CORS issues but we won't get response details
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      // With no-cors mode, we can only check if the request completed without network error
      return {
        status: 'healthy',
        message: 'Frontend domain accessible',
        responseTime: responseTime,
        url: frontendUrl
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error.name === 'AbortError') {
        return {
          status: 'error',
          message: 'Frontend domain timeout (>10s)',
          responseTime: responseTime,
          url: frontendUrl
        };
      }
      
      return {
        status: 'error',
        message: `Frontend domain unreachable: ${error.message}`,
        responseTime: responseTime,
        url: frontendUrl
      };
    }
  };

  /**
   * Get system status color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  return (
    <div>
      <Title level={2}>System Monitor Dashboard</Title>
      <Paragraph>
        Monitor Supabase database connections, bu-book frontend (
        <a href="https://terrier-libroom-booking.vercel.app/" target="_blank" rel="noopener noreferrer">
          terrier-libroom-booking.vercel.app
        </a>
        ), and real-time availability systems.
      </Paragraph>

      {/* Server Status Banner */}
      <ServerStatusBanner 
        useGlobalApi={true}
        showConnectionStatus={true}
        showApiStatusCard={false}
        showConnectingAlert={false}
        showRefreshButton={false}
        style={{ marginBottom: 24 }}
      />

      {/* Action Buttons */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button
            icon={<DatabaseOutlined />}
            onClick={async () => {
              const supabaseHealth = await checkSupabaseHealth();
              setSystemHealth(prev => ({
                ...prev,
                supabase: supabaseHealth
              }));
              message.info(`Supabase status: ${supabaseHealth.status}`);
            }}
            loading={loading}
          >
            Check Database
          </Button>
          <Button
            icon={<MonitorOutlined />}
            onClick={async () => {
              const frontendHealth = await checkBuBookFrontendHealth();
              setSystemHealth(prev => ({
                ...prev,
                buBookFrontend: frontendHealth
              }));
              message.info(`Frontend status: ${frontendHealth.status}`);
            }}
            loading={loading}
          >
            Check Frontend
          </Button>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={loadAllData}
            loading={loading}
          >
            Refresh All Data
          </Button>
        </Space>
      </Card>

      {/* Show loading skeleton when data is not available */}
      {!connection.isDataAvailable ? (
        <DataUnavailablePlaceholder 
          title="Data Monitor Unavailable"
          description="Data monitoring requires active connections to display system health and statistics."
        />
      ) : loading ? (
        <PageLoadingSkeleton />
      ) : (
        <>
          {/* System Health Overview */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Supabase Status"
                  value={systemHealth.supabase?.status || 'Unknown'}
                  prefix={
                    <Badge 
                      status={getStatusColor(systemHealth.supabase?.status)} 
                      icon={systemHealth.supabase?.status === 'healthy' ? <CheckCircleOutlined /> : <WarningOutlined />}
                    />
                  }
                  valueStyle={{ 
                    color: systemHealth.supabase?.status === 'healthy' ? '#3f8600' : '#cf1322' 
                  }}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
                  {systemHealth.supabase?.message}
                  {systemHealth.supabase?.responseTime && (
                    <div>Response: {systemHealth.supabase.responseTime}ms</div>
                  )}
                </div>
              </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="bu-book Frontend"
              value={systemHealth.buBookFrontend?.status || 'Checking...'}
              prefix={
                <Badge 
                  status={getStatusColor(systemHealth.buBookFrontend?.status)} 
                  icon={systemHealth.buBookFrontend?.status === 'healthy' ? <CheckCircleOutlined /> : <WarningOutlined />}
                />
              }
              valueStyle={{ 
                color: systemHealth.buBookFrontend?.status === 'healthy' ? '#3f8600' : '#cf1322' 
              }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              <div>{systemHealth.buBookFrontend?.message}</div>
              {systemHealth.buBookFrontend?.responseTime && (
                <div>Response: {systemHealth.buBookFrontend.responseTime}ms</div>
              )}
              {systemHealth.buBookFrontend?.url && (
                <div style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                  {systemHealth.buBookFrontend.url}
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Admin Page"
              value="Running"
              prefix={<Badge status="success" icon={<CheckCircleOutlined />} />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              Current session active
            </div>
          </Card>
        </Col>
      </Row>
        </>
      )}
    </div>
  );
};

export default DataMonitorPage;
