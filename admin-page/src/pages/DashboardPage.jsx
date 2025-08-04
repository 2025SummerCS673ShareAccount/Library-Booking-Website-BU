// Dashboard page - Real-time overview of bu-book and Supabase system
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  List,
  Avatar,
  Typography,
  Space,
  Button,
  Alert,
  Descriptions,
  Timeline,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  HomeOutlined,
  TeamOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ApiOutlined,
  DatabaseOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import statsService from '../services/statsService';
import locationService from '../services/locationService';
import bookingService from '../services/bookingService';
import apiService from '../services/apiService';
import { useConnection } from '../contexts/ConnectionContext';
import { useDataSource } from '../contexts/DataSourceContext';
import { useGlobalApi } from '../contexts/GlobalApiContext';
import ConnectionStatus from '../components/ConnectionStatus';
import ServerStatusBanner from '../components/ServerStatusBanner';

const { Title, Paragraph } = Typography;

/**
 * Dashboard page component
 * Real-time overview of Library Booking System integrating:
 * - bu-book: Building and Room data from Supabase
 * - bub-backend: LibCal availability API proxy
 * - System health and statistics monitoring
 */
const DashboardPage = () => {
  const connection = useConnection();
  const globalApi = useGlobalApi();
  const {
    useRealData,
    apiConfig,
    autoRefreshEnabled,
    refreshInterval,
    dataSourceMode,
    isBackendProxyMode,
    isMockDataMode,
    addNotification
  } = useDataSource();
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({});
  const [buildingStats, setBuildingStats] = useState({});
  const [bookingStats, setBookingStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [dataError, setDataError] = useState(null);

  // Load dashboard data from global cache
  useEffect(() => {
    const cachedDashboardData = globalApi.getCachedData('dashboard');

    if (cachedDashboardData) {
      // Set data from cached dashboard response
      setSystemStats({
        total_buildings: cachedDashboardData.stats?.total_buildings || 0,
        total_rooms: cachedDashboardData.stats?.total_rooms || 0,
        total_bookings: cachedDashboardData.stats?.active_bookings || 0,
        active_buildings: cachedDashboardData.buildings?.filter(b => b.available).length || 0,
        available_rooms: cachedDashboardData.stats?.available_rooms || 0,
        active_bookings: cachedDashboardData.stats?.active_bookings || 0,
        api_health_score: 95,
        lastUpdated: cachedDashboardData.timestamp
      });

      setBuildingStats({
        totalBuildings: cachedDashboardData.stats?.total_buildings || 0,
        buildings: cachedDashboardData.buildings || [],
        activeBuildings: cachedDashboardData.buildings?.filter(b => b.available).length || 0
      });

      setBookingStats({
        totalBookings: cachedDashboardData.stats?.active_bookings || 0,
        activeBookings: cachedDashboardData.stats?.active_bookings || 0
      });
    } else {
      // Set empty default values
      setSystemStats({});
      setBuildingStats({});
      setBookingStats({});
    }

    setLoading(false);
  }, [globalApi.globalData.lastUpdated]); // Respond to global data updates

  // Note: Removed automatic reload when connection becomes available to reduce API calls
  // Users can manually refresh data using the refresh button if needed

  // Manual refresh function
  const handleRefresh = async () => {
    await globalApi.refreshApi();

    // After global refresh, reload local data
    const cachedDashboardData = globalApi.getCachedData('dashboard');
    if (cachedDashboardData) {
      // Set data from refreshed dashboard response
      setSystemStats({
        total_buildings: cachedDashboardData.stats.total_buildings,
        total_rooms: cachedDashboardData.stats.total_rooms,
        total_bookings: cachedDashboardData.stats.active_bookings,
        active_buildings: cachedDashboardData.buildings.filter(b => b.available).length,
        available_rooms: cachedDashboardData.stats.available_rooms || 0,
        active_bookings: cachedDashboardData.stats.active_bookings,
        api_health_score: 95,
        lastUpdated: cachedDashboardData.timestamp
      });

      setBuildingStats({
        totalBuildings: cachedDashboardData.stats.total_buildings,
        buildings: cachedDashboardData.buildings,
        activeBuildings: cachedDashboardData.buildings.filter(b => b.available).length
      });

      setBookingStats({
        totalBookings: cachedDashboardData.stats.active_bookings,
        activeBookings: cachedDashboardData.stats.active_bookings
      });
    }
  };

  // Recent activity table columns (updated for new database schema)
  const activityColumns = [
    {
      title: 'Activity Type',
      key: 'type',
      render: (_, record) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
            <CalendarOutlined />
          </Avatar>
          <span>Booking</span>
        </Space>
      ),
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div>
          <strong>{record.user_name || 'Unknown User'}</strong>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.user_email}
          </div>
        </div>
      ),
    },
    {
      title: 'Room & Building',
      key: 'location',
      render: (_, record) => (
        <div>
          <strong>{record.room_name || 'N/A'}</strong>
          <div style={{ color: '#666', fontSize: '12px' }}>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {record.building_name}
          </div>
        </div>
      ),
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => (
        <div>
          <div>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {record.booking_date}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {record.start_time} - {record.end_time}
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          confirmed: { color: 'green', text: 'Confirmed' },
          pending: { color: 'orange', text: 'Pending' },
          cancelled: { color: 'red', text: 'Cancelled' },
          active: { color: 'blue', text: 'Active' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Booking Reference',
      dataIndex: 'booking_reference',
      key: 'booking_reference',
      render: (ref) => (
        <code style={{ fontSize: '12px', color: '#666' }}>
          {ref}
        </code>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>System Dashboard</Title>
        <Paragraph style={{ margin: 0, marginTop: 8 }}>
          Real-time monitoring of Library Booking System - bu-book frontend and Supabase database integration.
        </Paragraph>
      </div>

      {/* Server Status Banner */}
      <ServerStatusBanner
        useGlobalApi={true}
        showConnectionStatus={true}
        showApiStatusCard={false}
        showConnectingAlert={true}
        showRefreshButton={false}
        style={{ marginBottom: 24 }}
      />

      {/* Show appropriate content based on connection status and data mode */}
      {!useRealData ? (
        <Alert
          message="Mock Data Mode"
          description="Currently using simulated data for demonstration. To view real data, switch to backend proxy or direct Supabase mode in data source configuration."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <>
          {/* Dynamic System Status Alert */}
          <Alert
            message={`System Status: ${globalApi.apiStatus === 'connected' ? 'System Online' :
              globalApi.apiStatus === 'connecting' ? 'Initializing...' :
                globalApi.apiStatus === 'error' ? 'Service Issues' :
                  'System Offline'
              }`}
            description={
              globalApi.apiStatus === 'connected'
                ? `Supabase API is connected and functioning normally. Response time: ${globalApi.connectionDetails.responseTime}ms`
                : globalApi.apiStatus === 'connecting'
                  ? 'Establishing connection to backend services. Please wait...'
                  : globalApi.apiStatus === 'error'
                    ? 'Backend API is experiencing issues. Some features may be limited.'
                    : 'System is not responding. Please check your connection.'
            }
            type={
              globalApi.apiStatus === 'connected' ? 'success' :
                globalApi.apiStatus === 'connecting' ? 'info' :
                  'warning'
            }
            style={{ marginBottom: 24 }}
            showIcon
            icon={
              globalApi.apiStatus === 'connecting' ? <ClockCircleOutlined spin /> : undefined
            }
          />

          {/* Key Metrics Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Buildings"
                  value={systemStats.total_buildings || 0}
                  prefix={<HomeOutlined />}
                />
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  {systemStats.active_buildings || 0} active
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Rooms"
                  value={systemStats.total_rooms || 0}
                  prefix={<TeamOutlined />}
                />
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  {systemStats.available_rooms || 0} available
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Bookings"
                  value={systemStats.total_bookings || 0}
                  prefix={<CalendarOutlined />}
                />
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  {systemStats.active_bookings || 0} active today
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="API Health Score"
                  value={
                    globalApi.apiStatus === 'connected' ? 95 :
                      globalApi.apiStatus === 'connecting' ? 50 :
                        globalApi.apiStatus === 'error' ? 25 :
                          0
                  }
                  precision={0}
                  suffix="%"
                  prefix={<ApiOutlined />}
                  valueStyle={{
                    color:
                      globalApi.apiStatus === 'connected' ? '#52c41a' :
                        globalApi.apiStatus === 'connecting' ? '#1890ff' :
                          globalApi.apiStatus === 'error' ? '#ff4d4f' :
                            '#d9d9d9'
                  }}
                />
                <div style={{
                  marginTop: 8,
                  fontSize: '12px',
                  color:
                    globalApi.apiStatus === 'connected' ? '#52c41a' :
                      globalApi.apiStatus === 'connecting' ? '#1890ff' :
                        globalApi.apiStatus === 'error' ? '#ff4d4f' :
                          '#d9d9d9'
                }}>
                  Status: {
                    globalApi.apiStatus === 'connected' ? 'Healthy' :
                      globalApi.apiStatus === 'connecting' ? 'Initializing' :
                        globalApi.apiStatus === 'error' ? 'Error' :
                          'Offline'
                  }
                </div>
              </Card>
            </Col>
          </Row>

          {/* Detailed Analytics Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <DatabaseOutlined />
                    <span>Building & Room Analytics</span>
                  </Space>
                }
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Buildings with Rooms">
                    {buildingStats.totalBuildings || systemStats.total_buildings || 0} / {systemStats.total_buildings || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Room Availability Rate">
                    <Progress
                      percent={
                        systemStats.total_rooms
                          ? Math.round(((systemStats.total_rooms - (systemStats.active_bookings || 0)) / systemStats.total_rooms) * 100)
                          : 100
                      }
                      size="small"
                      status="active"
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Building Availability Rate">
                    <Progress
                      percent={
                        systemStats.total_buildings
                          ? Math.round(((buildingStats.activeBuildings || systemStats.total_buildings || 0) / systemStats.total_buildings) * 100)
                          : 100
                      }
                      size="small"
                      status="active"
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Average Rooms per Building">
                    {systemStats.total_buildings
                      ? Math.round((systemStats.total_rooms / systemStats.total_buildings) * 10) / 10
                      : 0}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <CalendarOutlined />
                    <span>Booking Analytics</span>
                  </Space>
                }
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Booking Status">
                    <Tag
                      color={systemStats.active_bookings > 0 ? 'green' : 'orange'}
                      icon={systemStats.active_bookings > 0 ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    >
                      {systemStats.active_bookings > 0 ? 'ACTIVE BOOKINGS' : 'NO ACTIVE BOOKINGS'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Active Bookings Today">
                    {systemStats.active_bookings || 0} total active
                  </Descriptions.Item>
                  <Descriptions.Item label="Room Utilization Rate">
                    <Progress
                      percent={
                        systemStats.total_rooms
                          ? Math.round((systemStats.active_bookings / systemStats.total_rooms) * 100)
                          : 0
                      }
                      size="small"
                      status="active"
                    />
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity Table */}
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Recent Activity</span>
              </Space>
            }
            style={{ marginTop: 24 }}
          >
            <Table
              columns={activityColumns}
              dataSource={recentActivity}
              rowKey={(record) => record.id || record.checksum || Math.random()}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} activities`
              }}
              scroll={{ x: 800 }}
            />
          </Card>

          {/* System Integration Status Footer */}
          <Card
            title="System Integration Status"
            style={{ marginTop: 24 }}
            size="small"
          >
            <Timeline
              items={[
                {
                  color: connection.isBackendConnected ? 'green' : 'red',
                  children: (
                    <div>
                      <strong>Database Connection</strong> - PostgreSQL database with booking data
                      <br />
                      <span style={{ color: '#666' }}>
                        Status: {connection.isBackendConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  ),
                },
                {
                  color: connection.isBackendConnected ? 'green' : 'red',
                  children: (
                    <div>
                      <strong>bub-backend API</strong> - REST API server with database integration
                      <br />
                      <span style={{ color: '#666' }}>
                        Status: {connection.isBackendConnected ? 'Connected' : 'Disconnected'} | Port: 5000
                      </span>
                    </div>
                  ),
                },
                {
                  color: connection.isSupabaseConnected ? 'green' : 'red',
                  children: (
                    <div>
                      <strong>Supabase Integration</strong> - Buildings and rooms data (bu-book)
                      <br />
                      <span style={{ color: '#666' }}>
                        Status: {connection.isSupabaseConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <strong>Admin Dashboard</strong> - Real-time monitoring interface
                      <br />
                      <span style={{ color: '#666' }}>
                        Data Source: {useRealData ? 'Real Data' : 'Mock Data'} | Auto-refresh enabled
                      </span>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
