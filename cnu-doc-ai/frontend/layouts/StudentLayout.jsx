import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from './StudentLayout.module.css';
import { Outlet } from 'react-router-dom';

const StudentLayout = () => {
    const [selectedMenu, setSelectedMenu] = useState('default');

    return (
        <div className={styles.layoutWrapper}>
            <div className={styles.bodyWrapper}>
                <Sidebar onMenuClick={setSelectedMenu} />
                <main className={styles.mainContent}>
                    {/* selectedMenu를 Outlet에 전달 */}
                    <Outlet context={{ selectedMenu }} />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
