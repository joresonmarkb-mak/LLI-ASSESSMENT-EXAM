import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, message, Popconfirm, Space } from 'antd';
import dayjs from 'dayjs';
import * as orderApi from '../api/orders';
import * as productApi from '../api/products';

const statusColors = {
  Pending: 'default',
  Packing: 'blue',
  Shipped: 'orange',
  Delivered: 'green',
  Cancelled: 'red',
};

const statusFlow = ['Pending', 'Packing', 'Shipped', 'Delivered'];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrders();
      setOrders(res.data);
    } catch (err) {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productApi.getProducts();
      setProducts(res.data);
    } catch (err) {
      message.error('Failed to load products');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const openAddModal = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await orderApi.createOrder(values);
      message.success('Order created');
      setModalOpen(false);
      fetchOrders();
      fetchProducts(); // stock changed
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || 'Failed to create order');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await orderApi.updateOrderStatus(id, status);
      message.success('Order status updated');
      fetchOrders();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCancel = async (id) => {
    try {
      await orderApi.cancelOrder(id);
      message.success('Order cancelled, stock restored');
      fetchOrders();
      fetchProducts();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getNextStatus = (current) => {
    const idx = statusFlow.indexOf(current);
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  const columns = [
    { title: 'Client Name', dataIndex: 'ClientName' },
    { title: 'Product', dataIndex: 'ProductName' },
    { title: 'Quantity', dataIndex: 'Quantity' },
    { title: 'Unit', dataIndex: 'Unit' },
    {
      title: 'Status',
      dataIndex: 'Status',
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    { title: 'Ordered By', dataIndex: 'CreatedBy' },
    { title: 'Date', dataIndex: 'CreatedAt', render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    {
      title: 'Actions',
      render: (_, record) => {
        const next = getNextStatus(record.Status);
        const isFinal = record.Status === 'Delivered' || record.Status === 'Cancelled';
        return (
          <Space>
            {next && (
              <Button size="small" onClick={() => handleStatusChange(record.OrderID, next)}>
                Mark as {next}
              </Button>
            )}
            {!isFinal && (
              <Popconfirm title="Cancel this order? Stock will be restored." onConfirm={() => handleCancel(record.OrderID)}>
                <Button size="small" danger>Cancel</Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Orders</h2>
        <Button type="primary" onClick={openAddModal}>+ New Order</Button>
      </Space>

      <Table
        rowKey="OrderID"
        columns={columns}
        dataSource={orders}
        loading={loading}
      />

      <Modal
        title="New Order"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText="Create Order"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Client Name" name="clientName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Product" name="productId" rules={[{ required: true }]}>
            <Select
              placeholder="Select a product"
              options={products.map(p => ({
                value: p.ProductID,
                label: `${p.ProductName} (${p.QuantityInStock} ${p.Unit} available)`,
              }))}
            />
          </Form.Item>
          <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Orders;