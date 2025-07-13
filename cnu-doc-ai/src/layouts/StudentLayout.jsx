import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from './StudentLayout.module.css';

const StudentLayout = ({ children }) => {
    return (
        <div className={styles.layoutWrapper}>
            <Header />
            <div className={styles.bodyWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>{children}</main>
            </div>
        </div>
    );
};

export default StudentLayout;