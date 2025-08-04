// BookingsPage - Manage booking data with connection-aware skeleton loading
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Modal,
  Descriptions,
  Select,
  Input,
  Row,
  Col,
  Statistic,
  message,
  Form,
  DatePicker,
  TimePicker
} from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import bookingService from '../services/bookingService';
import { useConnection } from '../contexts/ConnectionContext';
import { useDataSource } from '../contexts/DataSourceContext';
import { useGlobalApi } from '../contexts/GlobalApiContext';
import {
  ConnectionStatus,
  TableSkeleton,
  DataUnavailablePlaceholder,
  PageLoadingSkeleton
} from '../components/SkeletonComponents';
import ServerStatusBanner from '../components/ServerStatusBanner';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

/**
 * BookingsPage Component - Professional booking management with connection status
 */
const BookingsPage = () => {
  const connection = useConnection();
  const globalApi = useGlobalApi();
  const { useRealData } = useDataSource();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({});
  const [dataError, setDataError] = useState(null);

  // Form instance for editing
  const [editForm] = Form.useForm();

  // Table columns configuration (updated for new database schema)
  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'booking_reference',
      key: 'booking_reference',
      width: 120,
      render: (ref) => (
        <code style={{ fontSize: '12px', color: '#666' }}>
          {ref || 'N/A'}
        </code>
      )
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div>
          <div>
            <UserOutlined style={{ marginRight: 4 }} />
            {record.user_name || 'Unknown User'}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.user_email}
          </div>
        </div>
      )
    },
    {
      title: 'Room & Building',
      key: 'location',
      render: (_, record) => (
        <div>
          <div><strong>{record.room_name || 'N/A'}</strong></div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {record.building_name} ({record.building_short_name})
          </div>
        </div>
      )
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
          confirmed: { color: 'success', text: 'Confirmed' },
          cancelled: { color: 'error', text: 'Cancelled' },
          completed: { color: 'default', text: 'Completed' },
          pending: { color: 'warning', text: 'Pending' },
          active: { color: 'processing', text: 'Active' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Group Size',
      dataIndex: 'group_size',
      key: 'group_size',
      width: 100,
      render: (size) => (
        <Tag color="blue">{size || 1} people</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => viewBookingDetails(record)}
            title="View Details"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => editBooking(record)}
            title="Edit Booking"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => cancelBooking(record)}
            title="Cancel Booking"
          />
        </Space>
      )
    }
  ];

  // Manual refresh function for ServerStatusBanner
  const handleRefresh = async () => {
    await globalApi.refreshApi(); // This will refresh global data

    // Also refresh local bookings data
    await loadBookings();
  };

  // Load bookings data with proper data source handling
  const loadBookings = async () => {
    try {
      setLoading(true);
      setDataError(null);

      // Prepare filters - don't filter by status in API call, do it locally
      const filters = {};

      const response = await bookingService.getBookings({
        page: 1,
        limit: 100, // Get more records for local filtering
        filters: filters
      });

      if (response.success) {
        setBookings(response.data?.bookings || []);
        setFilteredBookings(response.data?.bookings || []);

        // Load statistics
        const statsResponse = await bookingService.getBookingStats();
        if (statsResponse.success) {
          setStats(statsResponse.data || {});
        }
      } else {
        console.warn('Failed to load bookings:', response.error);
        throw new Error(`Failed to load bookings: ${response.error}`);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setDataError(error.message);
      setBookings([]);
      setFilteredBookings([]);
      setStats({});

      // Only show error message if using real data
      if (useRealData) {
        message.error('Failed to load booking data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on search and status (updated for new schema)
  const filterBookings = () => {
    let filtered = bookings;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Search filter using new schema field names
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        (booking.user_name || '').toLowerCase().includes(query) ||
        (booking.user_email || '').toLowerCase().includes(query) ||
        (booking.room_name || '').toLowerCase().includes(query) ||
        (booking.building_name || '').toLowerCase().includes(query) ||
        (booking.building_short_name || '').toLowerCase().includes(query) ||
        (booking.id || '').toString().includes(query) ||
        (booking.booking_reference || '').toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  // Handle booking actions
  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const editBooking = (booking) => {
    setSelectedBooking(booking);

    // Populate form with current booking data
    editForm.setFieldsValue({
      user_name: booking.user_name,
      user_email: booking.user_email, // Read-only field
      booking_date: dayjs(booking.booking_date),
      start_time: dayjs(booking.start_time, 'HH:mm'),
      end_time: dayjs(booking.end_time, 'HH:mm'),
      group_size: booking.group_size,
      purpose: booking.purpose,
      notes: booking.notes,
      status: booking.status
    });

    setEditModalVisible(true);
  };

  const handleEditBooking = async (values) => {
    try {
      // Prepare update data - convert form values to proper format
      const updateData = {
        user_name: values.user_name,
        booking_date: values.booking_date.format('YYYY-MM-DD'),
        start_time: values.start_time.format('HH:mm'),
        end_time: values.end_time.format('HH:mm'),
        duration_minutes: values.end_time.diff(values.start_time, 'minutes'),
        group_size: parseInt(values.group_size),
        status: values.status,
        purpose: values.purpose,
        notes: values.notes
      };

      // Use the full updateBooking method for complete updates
      const response = await bookingService.updateBooking(selectedBooking.id, updateData);

      if (response.success) {
        message.success('Booking updated successfully');
        setEditModalVisible(false);
        setSelectedBooking(null);
        editForm.resetFields();
        loadBookings(); // Reload data
      } else {
        message.error('Failed to update booking: ' + response.error);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      message.error('Error updating booking');
    }
  };

  const cancelBooking = async (booking) => {
    Modal.confirm({
      title: 'Cancel Booking',
      content: `Are you sure you want to cancel booking ${booking.booking_reference || booking.id}?`,
      okText: 'Yes, Cancel',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          // Use updateBookingStatus to change status to 'cancelled'
          const response = await bookingService.updateBookingStatus(
            booking.id,
            'cancelled',
            'Admin cancellation'
          );

          if (response.success) {
            message.success('Booking cancelled successfully');
            loadBookings(); // Reload data
          } else {
            message.error('Failed to cancel booking: ' + response.error);
          }
        } catch (error) {
          console.error('Error cancelling booking:', error);
          message.error('Error cancelling booking');
        }
      }
    });
  };

  // Initial load when component mounts
  useEffect(() => {
    loadBookings();
  }, []);

  // Note: Removed automatic reload when connection becomes available to reduce API calls
  // Users can manually refresh data using the refresh button if needed

  // Filter bookings when search or status changes
  useEffect(() => {
    filterBookings();
  }, [searchQuery, statusFilter, bookings]);

  return (
    <div>
      <Title level={2}>Booking History Management</Title>
      <Paragraph>
        Manage library room booking history, view booking details, and handle cancellations.
        Data synchronized with bu-book and bub-backend systems.
      </Paragraph>

      {/* Server Status Banner */}
      <ServerStatusBanner
        useGlobalApi={true}
        onRefresh={handleRefresh}
        showConnectionStatus={true}
        showApiStatusCard={false}
        showConnectingAlert={false}
        showRefreshButton={false}
        style={{ marginBottom: 24 }}
      />

      {/* Loading State */}
      {loading && <PageLoadingSkeleton />}

      {/* Error State */}
      {dataError && !loading && (
        <DataUnavailablePlaceholder
          title="Booking Data Unavailable"
          description={`Error loading booking data: ${dataError}. Please try refreshing the page.`}
          onRetry={loadBookings}
        />
      )}

      {/* Normal Data Display */}
      {!loading && !dataError && (
        <>
          {/* Statistics */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Total Bookings"
                  value={stats.total || 0}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Confirmed"
                  value={stats.confirmed || 0}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Today's Bookings"
                  value={stats.todayBookings || 0}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Cancelled"
                  value={stats.cancelled || 0}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Filters and Search */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8}>
                <Space>
                  <span>Status:</span>
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 120 }}
                  >
                    <Option value="all">All Status</Option>
                    <Option value="confirmed">Confirmed</Option>
                    <Option value="cancelled">Cancelled</Option>
                    <Option value="completed">Completed</Option>
                    <Option value="no-show">No Show</Option>
                  </Select>
                </Space>
              </Col>
              <Col xs={24} sm={10}>
                <Search
                  placeholder="Search by user, email, room, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={6}>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={loadBookings}
                  loading={loading}
                  block
                >
                  Refresh Data
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Bookings Table */}
          <Card
            title={`Bookings (${filteredBookings.length} found)`}
            extra={
              <Tag color="blue">
                {filteredBookings.length} of {bookings.length} bookings
              </Tag>
            }
          >
            {loading ? (
              <TableSkeleton rows={10} columns={7} />
            ) : (
              <Table
                columns={columns}
                dataSource={filteredBookings}
                rowKey="id"
                pagination={{
                  pageSize: 15,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} bookings`
                }}
                scroll={{ x: 1000 }}
                size="small"
              />
            )}
          </Card>

          {/* Booking Details Modal */}
          <Modal
            title={`Booking Details - ${selectedBooking?.booking_reference || selectedBooking?.id}`}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setModalVisible(false)}>
                Close
              </Button>
            ]}
            width={600}
          >
            {selectedBooking && (
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Booking Reference" span={2}>
                  <code>{selectedBooking.booking_reference}</code>
                </Descriptions.Item>
                <Descriptions.Item label="User">
                  {selectedBooking.user_name}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedBooking.user_email}
                </Descriptions.Item>
                <Descriptions.Item label="Room">
                  {selectedBooking.room_name}
                </Descriptions.Item>
                <Descriptions.Item label="Building">
                  {selectedBooking.building_name} ({selectedBooking.building_short_name})
                </Descriptions.Item>
                <Descriptions.Item label="Date">
                  {dayjs(selectedBooking.booking_date).format('YYYY-MM-DD dddd')}
                </Descriptions.Item>
                <Descriptions.Item label="Time">
                  {selectedBooking.start_time} - {selectedBooking.end_time}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={
                    selectedBooking.status === 'confirmed' ? 'success' :
                      selectedBooking.status === 'cancelled' ? 'error' :
                        selectedBooking.status === 'completed' ? 'default' : 'warning'
                  }>
                    {selectedBooking.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Group Size">
                  {selectedBooking.group_size} people
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {selectedBooking.duration_minutes} minutes
                </Descriptions.Item>
                <Descriptions.Item label="Purpose" span={2}>
                  {selectedBooking.purpose || 'Not specified'}
                </Descriptions.Item>
                <Descriptions.Item label="Created At" span={2}>
                  {dayjs(selectedBooking.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                {selectedBooking.notes && (
                  <Descriptions.Item label="Notes" span={2}>
                    {selectedBooking.notes}
                  </Descriptions.Item>
                )}
              </Descriptions>
            )}
          </Modal>

          {/* Edit Booking Modal */}
          <Modal
            title={`Edit Booking - ${selectedBooking?.booking_reference || selectedBooking?.id}`}
            open={editModalVisible}
            onCancel={() => {
              setEditModalVisible(false);
              setSelectedBooking(null);
              editForm.resetFields();
            }}
            footer={null}
            width={600}
          >
            <Form
              form={editForm}
              layout="vertical"
              onFinish={handleEditBooking}
            >
              {/* User Information */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="user_name"
                    label="User Name"
                    rules={[{ required: true, message: 'Please enter user name' }]}
                  >
                    <Input placeholder="Enter user name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="user_email"
                    label="User Email (Read-only)"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              {/* Booking Date and Status */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="booking_date"
                    label="Booking Date"
                    rules={[{ required: true, message: 'Please select booking date' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select>
                      <Select.Option value="confirmed">Confirmed</Select.Option>
                      <Select.Option value="pending">Pending</Select.Option>
                      <Select.Option value="cancelled">Cancelled</Select.Option>
                      <Select.Option value="completed">Completed</Select.Option>
                      <Select.Option value="no-show">No Show</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Time and Group Size */}
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="start_time"
                    label="Start Time"
                    rules={[{ required: true, message: 'Please select start time' }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      style={{ width: '100%' }}
                      minuteStep={30}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="end_time"
                    label="End Time"
                    rules={[{ required: true, message: 'Please select end time' }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      style={{ width: '100%' }}
                      minuteStep={30}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="group_size"
                    label="Group Size"
                    rules={[
                      { required: true, message: 'Please enter group size' },
                      { type: 'number', min: 1, max: 20, message: 'Group size must be between 1 and 20' }
                    ]}
                  >
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      placeholder="Number of people"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Purpose and Notes */}
              <Form.Item
                name="purpose"
                label="Purpose"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Purpose of the booking..."
                />
              </Form.Item>

              <Form.Item
                name="notes"
                label="Admin Notes"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Add admin notes..."
                />
              </Form.Item>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Space>
                  <Button
                    onClick={() => {
                      setEditModalVisible(false);
                      setSelectedBooking(null);
                      editForm.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Update Booking
                  </Button>
                </Space>
              </div>

              <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f0f7ff', borderRadius: 6, border: '1px solid #d6e4ff' }}>
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  <strong>Admin Privileges:</strong> You can modify all booking details except the user's email address.
                  Changes will be saved to the database and users will be notified if necessary.
                </Typography.Text>
              </div>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default BookingsPage;
