import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, message, Popconfirm, Space } from 'antd';
import dayjs from 'dayjs';
import * as productApi from '../api/products';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getProducts();
      setProducts(res.data);
    } catch (err) {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingId(record.ProductID);
    form.setFieldsValue({
      productName: record.ProductName,
      category: record.Category,
      batchNumber: record.BatchNumber,
      quantityInStock: record.QuantityInStock,
      unit: record.Unit,
      expiryDate: record.ExpiryDate ? dayjs(record.ExpiryDate) : null,
      unitPrice: record.UnitPrice,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await productApi.deleteProduct(id);
      message.success('Product deleted');
      fetchProducts();
    } catch (err) {
      message.error('Failed to delete product');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : null,
      };

      if (editingId) {
        await productApi.updateProduct(editingId, payload);
        message.success('Product updated');
      } else {
        await productApi.createProduct(payload);
        message.success('Product created');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      if (err.errorFields) return; // form validation error, do nothing extra
      message.error('Failed to save product');
    }
  };

  const columns = [
    { title: 'Product Name', dataIndex: 'ProductName' },
    { title: 'Category', dataIndex: 'Category' },
    { title: 'Batch No.', dataIndex: 'BatchNumber' },
    { title: 'Qty', dataIndex: 'QuantityInStock' },
    { title: 'Unit', dataIndex: 'Unit' },
    { title: 'Expiry', dataIndex: 'ExpiryDate', render: (v) => v ? dayjs(v).format('YYYY-MM-DD') : '-' },
    { title: 'Price', dataIndex: 'UnitPrice', render: (v) => `₱${Number(v).toFixed(2)}` },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEditModal(record)}>Edit</Button>
          <Popconfirm title="Delete this product?" onConfirm={() => handleDelete(record.ProductID)}>
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Products</h2>
        <Button type="primary" onClick={openAddModal}>+ Add Product</Button>
      </Space>

      <Table
        rowKey="ProductID"
        columns={columns}
        dataSource={products}
        loading={loading}
      />

      <Modal
        title={editingId ? 'Edit Product' : 'Add Product'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Product Name" name="productName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Category" name="category">
            <Input />
          </Form.Item>
          <Form.Item label="Batch Number" name="batchNumber">
            <Input />
          </Form.Item>
          <Form.Item label="Quantity In Stock" name="quantityInStock" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item label="Unit" name="unit">
            <Input placeholder="box, pcs, bottle, etc." />
          </Form.Item>
          <Form.Item label="Expiry Date" name="expiryDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Unit Price" name="unitPrice">
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Products;