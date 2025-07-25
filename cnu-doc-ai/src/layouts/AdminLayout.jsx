import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header'; // 공통 헤더

const AdminLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <AdminSidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header />
                <div style={{ padding: '20px', flex: 1 }}>{children}
                    <Outlet />
                </div>
            </div>
        </div>
    );
};


export default AdminLayout;
