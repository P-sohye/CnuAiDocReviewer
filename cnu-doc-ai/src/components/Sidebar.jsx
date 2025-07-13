import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({ onMenuClick }) => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.title}>제출 서류 목록</div>
            <hr className={styles.divider} />
            <ul className={styles.menu}>
                <li onClick={() => onMenuClick('학적')} className={styles.menuItem}>▶ 학적 | 학사지원과</li>
                <li onClick={() => onMenuClick('등록')} className={styles.menuItem}>▶ 등록 | 재무과</li>
                <li onClick={() => onMenuClick('수업')} className={styles.menuItem}>▶ 수업 | 학사지원과</li>
                <li onClick={() => onMenuClick('학생')} className={styles.menuItem}>▶ 학생 | 학생과</li>
            </ul>
        </aside>
    );
};


export default Sidebar;
