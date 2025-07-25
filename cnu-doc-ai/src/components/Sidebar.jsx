import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.title}>제출 서류 목록</div>
            <hr className={styles.divider} />
            <ul className={styles.menu}>
                <li>▶ 학적 | 학사지원과</li>
                <li>▶ 등록 | 재무과</li>
                <li>▶ 수업 | 학사지원과</li>
                <li>▶ 학생 | 학생과</li>
            </ul>
        </aside>
    );
};

export default Sidebar;
