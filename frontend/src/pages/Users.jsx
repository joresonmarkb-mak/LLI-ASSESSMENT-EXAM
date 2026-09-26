import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Popconfirm, Space } from 'antd';
import dayjs from 'dayjs';
import * as userApi from '../api/users';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getUsers();
      setUsers(res.data);
    } catch (err) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await userApi.createUser(values);
      message.success('User created');
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDelete = async (id) => {
    try {
      await userApi.deleteUser(id);
      message.success('User deleted');
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const columns = [
    { title: 'Username', dataIndex: 'Username' },
    { title: 'First Name', dataIndex: 'FirstName' },
    { title: 'Last Name', dataIndex: 'LastName' },
    {
      title: 'Role',
      dataIndex: 'Role',
      render: (role) => <Tag color={role === 'admin' ? 'gold' : 'blue'}>{role}</Tag>,
    },
    { title: 'Created', dataIndex: 'CreatedAt', render: (v) => dayjs(v).format('YYYY-MM-DD') },
    {
      title: 'Actions',
      render: (_, record) => (
        <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(record.UserID)}>
          <Button size="small" danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>User Management</h2>
        <Button type="primary" onClick={openAddModal}>+ Add User</Button>
      </Space>

      <Table
        rowKey="UserID"
        columns={columns}
        dataSource={users}
        loading={loading}
      />

      <Modal
        title="Add User"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText="Create User"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Username" name="username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select
              placeholder="Select a role"
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'staff', label: 'Staff' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Users;