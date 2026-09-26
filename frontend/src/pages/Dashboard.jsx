import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, message, Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import * as productApi from '../api/products.js';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await productApi.getStockReport();
      setData(res.data);
    } catch (err) {
      message.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const lowStockColumns = [
    { title: 'Product Name', dataIndex: 'ProductName' },
    { title: 'Quantity', dataIndex: 'QuantityInStock' },
    { title: 'Unit', dataIndex: 'Unit' },
  ];

  const nearExpiryColumns = [
    { title: 'Product Name', dataIndex: 'ProductName' },
    { title: 'Batch No.', dataIndex: 'BatchNumber' },
    { title: 'Expiry Date', dataIndex: 'ExpiryDate', render: (v) => dayjs(v).format('YYYY-MM-DD') },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Welcome, {user?.firstName} {user?.lastName}</h2>
        <Link to="/products">
          <Button type="primary">Go to Products</Button>
        </Link>
      </Space>

      {loading || !data ? (
        <Spin style={{ margin: 40 }} />
      ) : (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card>
                <Statistic title="Total Products" value={data.summary.TotalProducts} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Total Stock Quantity" value={data.summary.TotalStockQuantity} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Stock Value"
                  value={data.summary.TotalStockValue}
                  precision={2}
                  prefix="₱"
                />
              </Card>
            </Col>
          </Row>

          <Card title="Low Stock Items (≤ 50 units)" style={{ marginBottom: 24 }}>
            <Table
              rowKey="ProductID"
              columns={lowStockColumns}
              dataSource={data.lowStockItems}
              pagination={false}
              locale={{ emptyText: 'No low stock items' }}
            />
          </Card>

          <Card title="Near Expiry Items (within 3 months)">
            <Table
              rowKey="ProductID"
              columns={nearExpiryColumns}
              dataSource={data.nearExpiryItems}
              pagination={false}
              locale={{ emptyText: 'No items nearing expiry' }}
            />
          </Card>
        </>
      )}
    </div>
  );
}

export default Dashboard;