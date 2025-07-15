// src/layouts/AdminLayout.jsx
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header'; // 공통 헤더

const AdminLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex' }}>
            <AdminSidebar />
            <div style={{ flex: 1 }}>
                <Header />
                <div style={{ padding: '20px' }}>{children}</div>
            </div>
        </div>
    );
};

export default AdminLayout;
