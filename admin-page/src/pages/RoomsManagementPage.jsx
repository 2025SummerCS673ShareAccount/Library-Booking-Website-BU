// Rooms Management page - Comprehensive room and schedule management system
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Select,
  Typography,
  Input,
  Row,
  Col,
  Tag,
  Modal,
  Form,
  TimePicker,
  DatePicker,
  Switch,
  Drawer,
  Descriptions,
  Tabs,
  Calendar,
  Badge,
  Divider,
  Popconfirm,
  Tooltip,
  message
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  CalendarOutlined,
  SettingOutlined,
  ReloadOutlined,
  HomeOutlined,
  TeamOutlined,
  WifiOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useConnection } from '../contexts/ConnectionContext';
import { useDataSource } from '../contexts/DataSourceContext';
import { useGlobalApi } from '../contexts/GlobalApiContext';
import {
  TableSkeleton,
  DataUnavailablePlaceholder,
  PageLoadingSkeleton
} from '../components/SkeletonComponents';
import ServerStatusBanner from '../components/ServerStatusBanner';
import supabaseService from '../services/supabaseService';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

/**
 * Rooms Management page component
 * Comprehensive system for managing study rooms, schedules, and maintenance
 */
const RoomsManagementPage = () => {
  const connection = useConnection();
  const globalApi = useGlobalApi();
  const { useRealData } = useDataSource();

  // Main state
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [dataError, setDataError] = useState(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('all');

  // Modal and drawer state
  const [addRoomModalVisible, setAddRoomModalVisible] = useState(false);
  const [editRoomModalVisible, setEditRoomModalVisible] = useState(false);
  const [scheduleDrawerVisible, setScheduleDrawerVisible] = useState(false);
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Form instances
  const [addRoomForm] = Form.useForm();
  const [editRoomForm] = Form.useForm();
  const [scheduleForm] = Form.useForm();
  const [maintenanceForm] = Form.useForm();

  // Get building options from Supabase or use defaults
  const getBuildingOptions = () => {
    // Try to get buildings from GlobalAPI first
    const globalBuildings = globalApi.getCachedData('buildings');
    
    if (globalBuildings && globalBuildings.length > 0) {
      return globalBuildings.map(building => ({
        id: building.id,
        code: building.short_name || building.ShortName,
        name: building.name || building.Name
      }));
    }
    
    // Fallback to hardcoded options with estimated IDs
    return [
      { id: 1, code: 'mug', name: 'Mugar Memorial Library' },
      { id: 2, code: 'par', name: 'Pardee Library' },
      { id: 3, code: 'pic', name: 'Pickering Educational Resources Library' },
      { id: 4, code: 'sci', name: 'Science & Engineering Library' }
    ];
  };

  const BUILDING_OPTIONS = getBuildingOptions();

  // Helper functions to parse room data
  const extractFloorFromName = (roomName) => {
    // Extract floor from names like "Mugar 403A" -> 4, "Mugar 501C" -> 5
    const match = roomName.match(/(\d{1})(\d{2})[A-Z]/);
    return match ? parseInt(match[1]) : 1;
  };

  const extractRoomNumberFromName = (roomName) => {
    // Extract room number from names like "Mugar 403A (Capacity 2)" -> "403A"
    const match = roomName.match(/(\d{3}[A-Z])/);
    return match ? match[1] : roomName.split(' ').pop();
  };

  const mapRoomType = (roomType) => {
    // Map backend room types to our frontend types
    const typeMapping = {
      'Individual Study Rooms': 'study',
      'Group Study Rooms': 'group',
      'Computer Lab': 'computer',
      'Media Room': 'media'
    };
    return typeMapping[roomType] || 'study';
  };

  const getDefaultFeatures = (roomType) => {
    // Default features based on room type
    const featureMapping = {
      'Individual Study Rooms': ['WiFi', 'Desk Lamp', 'Power Outlet'],
      'Group Study Rooms': ['WiFi', 'Whiteboard', 'Power Outlets'],
      'Computer Lab': ['WiFi', 'Computers', 'Projector', 'Printing'],
      'Media Room': ['WiFi', 'Projector', 'Audio System', 'Screen']
    };
    return featureMapping[roomType] || ['WiFi'];
  };

  const ROOM_TYPES = [
    { value: 'study', label: 'Study Room', icon: <HomeOutlined /> },
    { value: 'group', label: 'Group Study Room', icon: <TeamOutlined /> },
    { value: 'computer', label: 'Computer Lab', icon: <WifiOutlined /> },
    { value: 'media', label: 'Media Room', icon: <VideoCameraOutlined /> }
  ];

  const CAPACITY_OPTIONS = [
    { value: '1-2', label: '1-2 people' },
    { value: '3-4', label: '3-4 people' },
    { value: '5-8', label: '5-8 people' },
    { value: '9-12', label: '9-12 people' },
    { value: '13+', label: '13+ people' }
  ];

  // Mock room data
  const mockRooms = [
    {
      id: 'room_001',
      name: 'Group Study Room A',
      building_code: 'mug',
      building_name: 'Mugar Memorial Library',
      floor: 2,
      room_number: 'A201',
      type: 'group',
      capacity: 6,
      status: 'active',
      features: ['Whiteboard', 'Projector', 'WiFi'],
      open_time: '08:00',
      close_time: '22:00',
      is_24_hours: false,
      maintenance_schedule: [],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: 'room_002',
      name: 'Individual Study Pod B',
      building_code: 'par',
      building_name: 'Pardee Library',
      floor: 1,
      room_number: 'B105',
      type: 'study',
      capacity: 2,
      status: 'active',
      features: ['Desk Lamp', 'Power Outlet', 'WiFi'],
      open_time: '07:00',
      close_time: '23:00',
      is_24_hours: false,
      maintenance_schedule: [
        {
          id: 'maint_001',
          title: 'Weekly Cleaning',
          start_date: '2024-02-01',
          end_date: '2024-02-01',
          start_time: '06:00',
          end_time: '07:00',
          reason: 'Routine cleaning'
        }
      ],
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-25T16:45:00Z'
    },
    {
      id: 'room_003',
      name: 'Computer Lab C',
      building_code: 'sci',
      building_name: 'Science & Engineering Library',
      floor: 3,
      room_number: 'C301',
      type: 'computer',
      capacity: 12,
      status: 'maintenance',
      features: ['24 Computers', 'Projector', 'WiFi', 'Printing'],
      open_time: '08:00',
      close_time: '20:00',
      is_24_hours: false,
      maintenance_schedule: [
        {
          id: 'maint_002',
          title: 'System Upgrade',
          start_date: '2024-02-05',
          end_date: '2024-02-07',
          start_time: '00:00',
          end_time: '23:59',
          reason: 'Computer system upgrade'
        }
      ],
      created_at: '2024-01-05T11:00:00Z',
      updated_at: '2024-02-01T10:15:00Z'
    }
  ];

  // Load rooms data directly from Supabase
  const loadRooms = async () => {
    try {
      setLoading(true);
      setDataError(null);

      // Get rooms from GlobalAPI cache first
      const globalRooms = globalApi.getCachedData('rooms');

      if (globalRooms && globalRooms.length > 0) {
        // Transform GlobalAPI room data to our room management format
        const transformedRooms = globalRooms.map(room => {
          return {
            id: room.id,
            name: room.name,
            building_code: room.building_code || 'unknown',
            building_name: room.building_name || 'Unknown Building',
            building_id: room.building_id,
            floor: extractFloorFromName(room.name), // Extract from room name like "Mugar 403A"
            room_number: extractRoomNumberFromName(room.name),
            type: mapRoomType(room.room_type),
            capacity: room.capacity,
            status: room.available ? 'active' : 'inactive',
            features: getDefaultFeatures(room.room_type),
            open_time: '08:00', // Default values - can be customized later
            close_time: '22:00',
            is_24_hours: false,
            maintenance_schedule: [],
            created_at: room.created_at,
            updated_at: room.updated_at,
            // Keep backend-specific fields for reference
            eid: room.eid,
            gtype: room.gtype,
            url: room.url,
            _original: room
          };
        });

        setRooms(transformedRooms);
        setFilteredRooms(transformedRooms);
      } else {
        // No global room data available, try to refresh
        await globalApi.refreshApi();
        const refreshedRooms = globalApi.getCachedData('rooms');

        if (refreshedRooms && refreshedRooms.length > 0) {
          const transformedRooms = refreshedRooms.map(room => {
            return {
              id: room.id,
              name: room.name,
              building_code: room.building_code || 'unknown',
              building_name: room.building_name || 'Unknown Building',
              building_id: room.building_id,
              floor: extractFloorFromName(room.name),
              room_number: extractRoomNumberFromName(room.name),
              type: mapRoomType(room.room_type),
              capacity: room.capacity,
              status: room.available ? 'active' : 'inactive',
              features: getDefaultFeatures(room.room_type),
              open_time: '08:00',
              close_time: '22:00',
              is_24_hours: false,
              maintenance_schedule: [],
              created_at: room.created_at,
              updated_at: room.updated_at,
              eid: room.eid,
              gtype: room.gtype,
              url: room.url,
              _original: room
            };
          });

          setRooms(transformedRooms);
          setFilteredRooms(transformedRooms);
        } else {
          // If still no data available, use mock data for development
          setRooms(mockRooms);
          setFilteredRooms(mockRooms);
          setDataError('No room data available from API');
        }
      }

    } catch (error) {
      console.error('Failed to load rooms:', error);
      setDataError(error.message);

      // Use mock data as fallback even on error
      setRooms(mockRooms);
      setFilteredRooms(mockRooms);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function for direct Supabase data loading
  const handleRefresh = async () => {
    // Refresh GlobalAPI data and reload rooms
    await globalApi.refreshApi();
    await loadRooms();
  };

  // Filter rooms based on search and filters
  const filterRooms = () => {
    let filtered = [...rooms];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(query) ||
        room.building_name.toLowerCase().includes(query) ||
        room.room_number.toLowerCase().includes(query) ||
        room.type.toLowerCase().includes(query)
      );
    }

    // Building filter
    if (buildingFilter !== 'all') {
      filtered = filtered.filter(room => room.building_code === buildingFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(room => room.status === statusFilter);
    }

    // Capacity filter
    if (capacityFilter !== 'all') {
      const [min, max] = capacityFilter.includes('+')
        ? [parseInt(capacityFilter.replace('+', '')), Infinity]
        : capacityFilter.split('-').map(num => parseInt(num));

      filtered = filtered.filter(room => {
        const capacity = room.capacity;
        return capacity >= min && (max === Infinity || capacity <= max);
      });
    }

    setFilteredRooms(filtered);
  };

  // Room management functions
  const handleAddRoom = async (values) => {
    try {
      // Generate a unique eid (LibCal Equipment ID) for the new room
      // Use timestamp + random number to ensure uniqueness
      const uniqueEid = parseInt(`${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`);
      
      // Find the selected building
      const selectedBuilding = BUILDING_OPTIONS.find(b => b.code === values.building_code);
      if (!selectedBuilding) {
        message.error('Invalid building selection');
        return;
      }
      
      // Prepare room data for Supabase
      const roomData = {
        name: values.name,
        building_id: selectedBuilding.id,
        capacity: values.capacity,
        room_type: values.type,
        available: values.status !== 'inactive',
        eid: uniqueEid, // Required unique identifier for LibCal integration
      };

      console.log('Creating room with data:', roomData);

      // Create room in Supabase
      const result = await supabaseService.createRoom(roomData);

      if (result.success) {
        // Refresh global data and reload rooms
        await globalApi.refreshApi();
        await loadRooms();

        setAddRoomModalVisible(false);
        addRoomForm.resetFields();

        message.success('Room added successfully');
      } else {
        message.error(`Failed to add room: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to add room:', error);
      message.error(`Error adding room: ${error.message}`);
    }
  };

  const handleEditRoom = async (values) => {
    try {
      if (!selectedRoom || !selectedRoom._original) {
        message.error('Invalid room data for editing');
        return;
      }

      // Find the selected building
      const selectedBuilding = BUILDING_OPTIONS.find(b => b.code === values.building_code);
      if (!selectedBuilding) {
        message.error('Invalid building selection');
        return;
      }

      // Prepare updated room data for Supabase
      const roomData = {
        name: values.name,
        capacity: values.capacity,
        room_type: values.type,
        available: values.status !== 'inactive',
        building_id: selectedBuilding.id,
      };

      // Update room in Supabase
      const result = await supabaseService.updateRoom(selectedRoom.id, roomData);

      if (result.success) {
        // Refresh global data and reload rooms
        await globalApi.refreshApi();
        await loadRooms();

        setEditRoomModalVisible(false);
        setSelectedRoom(null);

        message.success('Room updated successfully');
      } else {
        message.error(`Failed to update room: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to update room:', error);
      message.error(`Error updating room: ${error.message}`);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      // Delete room from Supabase (soft delete - set available to false)
      const result = await supabaseService.updateRoom(roomId, { available: false });

      if (result.success) {
        // Refresh global data and reload rooms
        await globalApi.refreshApi();
        await loadRooms();

        message.success('Room deleted successfully');
      } else {
        message.error(`Failed to delete room: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to delete room:', error);
      message.error(`Error deleting room: ${error.message}`);
    }
  };

  const handleAddMaintenance = async (values) => {
    try {
      const maintenance = {
        id: `maint_${Date.now()}`,
        title: values.title,
        start_date: values.date_range[0].format('YYYY-MM-DD'),
        end_date: values.date_range[1].format('YYYY-MM-DD'),
        start_time: values.time_range[0].format('HH:mm'),
        end_time: values.time_range[1].format('HH:mm'),
        reason: values.reason
      };

      const updatedRooms = rooms.map(room =>
        room.id === selectedRoom.id
          ? {
            ...room,
            maintenance_schedule: [...room.maintenance_schedule, maintenance],
            updated_at: new Date().toISOString()
          }
          : room
      );

      setRooms(updatedRooms);
      setFilteredRooms(updatedRooms);
      setMaintenanceModalVisible(false);
      maintenanceForm.resetFields();
    } catch (error) {
      console.error('Failed to add maintenance schedule:', error);
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Room Info',
      key: 'room_info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {record.name}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.building_name} - Floor {record.floor}
          </div>
          <div style={{ color: '#999', fontSize: '11px' }}>
            Room: {record.room_number}
          </div>
        </div>
      )
    },
    {
      title: 'Type & Capacity',
      key: 'type_capacity',
      render: (_, record) => (
        <div>
          <div>
            {ROOM_TYPES.find(type => type.value === record.type)?.icon}
            <span style={{ marginLeft: 4 }}>
              {ROOM_TYPES.find(type => type.value === record.type)?.label || record.type}
            </span>
          </div>
          <div style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
            <TeamOutlined style={{ marginRight: 4 }} />
            {record.capacity} people
          </div>
        </div>
      )
    },
    {
      title: 'Operating Hours',
      key: 'hours',
      render: (_, record) => (
        <div>
          {record.is_24_hours ? (
            <Tag color="blue">24/7 Available</Tag>
          ) : (
            <div>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {record.open_time} - {record.close_time}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          active: { color: 'success', text: 'Active' },
          maintenance: { color: 'warning', text: 'Under Maintenance' },
          inactive: { color: 'error', text: 'Inactive' },
          closed: { color: 'default', text: 'Closed' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Features',
      dataIndex: 'features',
      key: 'features',
      render: (features) => (
        <div>
          {features?.slice(0, 2).map(feature => (
            <Tag key={feature} size="small" style={{ marginBottom: 2 }}>
              {feature}
            </Tag>
          ))}
          {features?.length > 2 && (
            <Tag size="small" color="blue">
              +{features.length - 2} more
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Maintenance',
      key: 'maintenance',
      render: (_, record) => (
        <div>
          {record.maintenance_schedule?.length > 0 ? (
            <div>
              <Badge count={record.maintenance_schedule.length} size="small">
                <ToolOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
              </Badge>
              <div style={{ fontSize: '11px', color: '#666', marginTop: 2 }}>
                {record.maintenance_schedule.length} scheduled
              </div>
            </div>
          ) : (
            <span style={{ color: '#999' }}>No maintenance</span>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Room">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedRoom(record);
                editRoomForm.setFieldsValue({
                  ...record,
                  open_time: dayjs(record.open_time, 'HH:mm'),
                  close_time: dayjs(record.close_time, 'HH:mm')
                });
                setEditRoomModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Manage Schedule">
            <Button
              type="text"
              icon={<CalendarOutlined />}
              onClick={() => {
                setSelectedRoom(record);
                setScheduleDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Add Maintenance">
            <Button
              type="text"
              icon={<ToolOutlined />}
              onClick={() => {
                setSelectedRoom(record);
                setMaintenanceModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete Room">
            <Popconfirm
              title="Are you sure you want to delete this room?"
              onConfirm={() => handleDeleteRoom(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  // Effect hooks
  useEffect(() => {
    // Update building options when component mounts or global data changes
    setBuildings(getBuildingOptions());
    loadRooms();
  }, []);

  // Listen for GlobalAPI data updates
  useEffect(() => {
    loadRooms();
  }, [globalApi.globalData.lastUpdated]);

  useEffect(() => {
    filterRooms();
  }, [searchQuery, buildingFilter, statusFilter, capacityFilter, rooms]);

  return (
    <div>
      <Title level={2}>Rooms Management</Title>
      <Paragraph>
        Comprehensive management system for library study rooms, schedules, and maintenance.
        Add, edit, and configure room availability and operating hours.
      </Paragraph>

      {/* Server Status Banner - GlobalAPI Connection */}
      <ServerStatusBanner
        useGlobalApi={true}
        onRefresh={handleRefresh}
        showConnectionStatus={true}
        showApiStatusCard={false}
        showConnectingAlert={false}
        showRefreshButton={true}
        style={{ marginBottom: 24 }}
      />

      {/* Loading State */}
      {loading && <PageLoadingSkeleton />}

      {/* Error State */}
      {dataError && !loading && (
        <DataUnavailablePlaceholder
          title="Room Data Unavailable"
          description={`Error loading room data: ${dataError}. Please try refreshing the page.`}
          onRetry={loadRooms}
        />
      )}

      {/* Main Content */}
      {!loading && !dataError && (
        <>
          {/* Action Bar */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={6}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAddRoomModalVisible(true)}
                  block
                >
                  Add New Room
                </Button>
              </Col>
              <Col xs={24} sm={6}>
                <Search
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={4}>
                <Select
                  placeholder="Building"
                  value={buildingFilter}
                  onChange={setBuildingFilter}
                  style={{ width: '100%' }}
                >
                  <Option value="all">All Buildings</Option>
                  {BUILDING_OPTIONS.map(building => (
                    <Option key={building.code} value={building.code}>
                      {building.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={4}>
                <Select
                  placeholder="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: '100%' }}
                >
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="maintenance">Maintenance</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="closed">Closed</Option>
                </Select>
              </Col>
              <Col xs={24} sm={4}>
                <Select
                  placeholder="Capacity"
                  value={capacityFilter}
                  onChange={setCapacityFilter}
                  style={{ width: '100%' }}
                >
                  <Option value="all">All Capacities</Option>
                  {CAPACITY_OPTIONS.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>

          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {rooms.length}
                  </div>
                  <div style={{ color: '#666' }}>Total Rooms</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {rooms.filter(room => room.status === 'active').length}
                  </div>
                  <div style={{ color: '#666' }}>Active Rooms</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                    {rooms.filter(room => room.status === 'maintenance').length}
                  </div>
                  <div style={{ color: '#666' }}>Under Maintenance</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                    {rooms.reduce((total, room) => total + (room.maintenance_schedule?.length || 0), 0)}
                  </div>
                  <div style={{ color: '#666' }}>Scheduled Maintenance</div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Rooms Table */}
          <Card
            title={`Rooms (${filteredRooms.length} found)`}
            extra={
              <Space>
                <Tag color="blue">
                  {filteredRooms.length} of {rooms.length} rooms
                </Tag>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadRooms}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredRooms}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} rooms`
              }}
              scroll={{ x: 1200 }}
              size="small"
            />
          </Card>
        </>
      )}

      {/* Add Room Modal */}
      <Modal
        title="Add New Room"
        open={addRoomModalVisible}
        onCancel={() => {
          setAddRoomModalVisible(false);
          addRoomForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={addRoomForm}
          layout="vertical"
          onFinish={handleAddRoom}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Room Name"
                rules={[{ required: true, message: 'Please enter room name' }]}
              >
                <Input placeholder="e.g., Group Study Room A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="room_number"
                label="Room Number"
                rules={[{ required: true, message: 'Please enter room number' }]}
              >
                <Input placeholder="e.g., A201" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="building_code"
                label="Building"
                rules={[{ required: true, message: 'Please select building' }]}
              >
                <Select placeholder="Select building">
                  {BUILDING_OPTIONS.map(building => (
                    <Option key={building.code} value={building.code}>
                      {building.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="floor"
                label="Floor"
                rules={[{ required: true, message: 'Please enter floor' }]}
              >
                <Input type="number" placeholder="1" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="capacity"
                label="Capacity"
                rules={[{ required: true, message: 'Please enter capacity' }]}
              >
                <Input type="number" placeholder="4" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Room Type"
                rules={[{ required: true, message: 'Please select room type' }]}
              >
                <Select placeholder="Select room type">
                  {ROOM_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="features"
                label="Features (Optional)"
              >
                <Select mode="tags" placeholder="Add features">
                  <Option value="Whiteboard">Whiteboard</Option>
                  <Option value="Projector">Projector</Option>
                  <Option value="WiFi">WiFi</Option>
                  <Option value="Power Outlet">Power Outlet</Option>
                  <Option value="Printing">Printing</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="open_time"
                label="Open Time"
                rules={[{ required: true, message: 'Please select open time' }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="close_time"
                label="Close Time"
                rules={[{ required: true, message: 'Please select close time' }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="is_24_hours"
                valuePropName="checked"
                label=" "
              >
                <Switch checkedChildren="24/7" unCheckedChildren="Limited Hours" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Room
              </Button>
              <Button onClick={() => {
                setAddRoomModalVisible(false);
                addRoomForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        title="Edit Room"
        open={editRoomModalVisible}
        onCancel={() => {
          setEditRoomModalVisible(false);
          setSelectedRoom(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editRoomForm}
          layout="vertical"
          onFinish={handleEditRoom}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Room Name"
                rules={[{ required: true, message: 'Please enter room name' }]}
              >
                <Input placeholder="e.g., Group Study Room A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="room_number"
                label="Room Number"
                rules={[{ required: true, message: 'Please enter room number' }]}
              >
                <Input placeholder="e.g., A201" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="building_code"
                label="Building"
                rules={[{ required: true, message: 'Please select building' }]}
              >
                <Select placeholder="Select building">
                  {BUILDING_OPTIONS.map(building => (
                    <Option key={building.code} value={building.code}>
                      {building.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="floor"
                label="Floor"
                rules={[{ required: true, message: 'Please enter floor' }]}
              >
                <Input type="number" placeholder="1" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="capacity"
                label="Capacity"
                rules={[{ required: true, message: 'Please enter capacity' }]}
              >
                <Input type="number" placeholder="4" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Room Type"
                rules={[{ required: true, message: 'Please select room type' }]}
              >
                <Select placeholder="Select room type">
                  {ROOM_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="maintenance">Under Maintenance</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="closed">Closed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="features"
                label="Features"
              >
                <Select mode="tags" placeholder="Add features">
                  <Option value="Whiteboard">Whiteboard</Option>
                  <Option value="Projector">Projector</Option>
                  <Option value="WiFi">WiFi</Option>
                  <Option value="Power Outlet">Power Outlet</Option>
                  <Option value="Printing">Printing</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_24_hours"
                valuePropName="checked"
                label="24/7 Available"
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="open_time"
                label="Open Time"
                rules={[{ required: true, message: 'Please select open time' }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="close_time"
                label="Close Time"
                rules={[{ required: true, message: 'Please select close time' }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Room
              </Button>
              <Button onClick={() => {
                setEditRoomModalVisible(false);
                setSelectedRoom(null);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Maintenance Schedule Modal */}
      <Modal
        title={`Add Maintenance Schedule - ${selectedRoom?.name}`}
        open={maintenanceModalVisible}
        onCancel={() => {
          setMaintenanceModalVisible(false);
          setSelectedRoom(null);
          maintenanceForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={maintenanceForm}
          layout="vertical"
          onFinish={handleAddMaintenance}
        >
          <Form.Item
            name="title"
            label="Maintenance Title"
            rules={[{ required: true, message: 'Please enter maintenance title' }]}
          >
            <Input placeholder="e.g., Weekly Cleaning, System Upgrade" />
          </Form.Item>
          <Form.Item
            name="date_range"
            label="Date Range"
            rules={[{ required: true, message: 'Please select date range' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="time_range"
            label="Time Range"
            rules={[{ required: true, message: 'Please select time range' }]}
          >
            <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: 'Please enter reason' }]}
          >
            <Input.TextArea rows={3} placeholder="Describe the maintenance activity..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Maintenance
              </Button>
              <Button onClick={() => {
                setMaintenanceModalVisible(false);
                setSelectedRoom(null);
                maintenanceForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Schedule Management Drawer */}
      <Drawer
        title={`Schedule Management - ${selectedRoom?.name}`}
        placement="right"
        width={600}
        open={scheduleDrawerVisible}
        onClose={() => {
          setScheduleDrawerVisible(false);
          setSelectedRoom(null);
        }}
      >
        {selectedRoom && (
          <div>
            <Tabs defaultActiveKey="info">
              <TabPane tab="Room Info" key="info">
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Room Name">
                    {selectedRoom.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Building">
                    {selectedRoom.building_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Floor & Room">
                    Floor {selectedRoom.floor}, Room {selectedRoom.room_number}
                  </Descriptions.Item>
                  <Descriptions.Item label="Type & Capacity">
                    {ROOM_TYPES.find(type => type.value === selectedRoom.type)?.label || selectedRoom.type} - {selectedRoom.capacity} people
                  </Descriptions.Item>
                  <Descriptions.Item label="Operating Hours">
                    {selectedRoom.is_24_hours ? '24/7 Available' : `${selectedRoom.open_time} - ${selectedRoom.close_time}`}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={
                      selectedRoom.status === 'active' ? 'success' :
                        selectedRoom.status === 'maintenance' ? 'warning' :
                          selectedRoom.status === 'inactive' ? 'error' : 'default'
                    }>
                      {selectedRoom.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Features">
                    {selectedRoom.features?.map(feature => (
                      <Tag key={feature} style={{ marginBottom: 4 }}>
                        {feature}
                      </Tag>
                    ))}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
              <TabPane tab="Maintenance Schedule" key="maintenance">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setMaintenanceModalVisible(true)}
                  >
                    Add Maintenance
                  </Button>
                  {selectedRoom.maintenance_schedule?.length > 0 ? (
                    selectedRoom.maintenance_schedule.map(maintenance => (
                      <Card key={maintenance.id} size="small">
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{maintenance.title}</div>
                          <div style={{ color: '#666', fontSize: '12px' }}>
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            {maintenance.start_date} to {maintenance.end_date}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {maintenance.start_time} - {maintenance.end_time}
                          </div>
                          <div style={{ marginTop: 8, fontSize: '12px' }}>
                            {maintenance.reason}
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                      No maintenance scheduled
                    </div>
                  )}
                </Space>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RoomsManagementPage;
