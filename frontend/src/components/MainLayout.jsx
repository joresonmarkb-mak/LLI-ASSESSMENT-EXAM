import { useState } from 'react';
import { Layout, Menu, Button, Avatar, Space, Dropdown } from 'antd';
import { DashboardOutlined, AppstoreOutlined, LogoutOutlined, MedicineBoxOutlined,ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/products', icon: <AppstoreOutlined />, label: 'Products' },
     { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Orders' },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{
          height: 48,
          margin: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          color: '#fff',
          fontWeight: 600,
          fontSize: collapsed ? 20 : 16,
          gap: 8,
        }}>
          <MedicineBoxOutlined />
          {!collapsed && 'PharmaStock'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar>{user?.firstName?.[0]}</Avatar>
              <span >{user?.firstName} {user?.lastName}- {user?.role}</span>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ margin: 24, background: '#fff', padding: 24, borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;