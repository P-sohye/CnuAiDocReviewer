import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from './AdminSidebar.module.css';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const currentCategory = searchParams.get('category');
    const pathType = location.pathname.split('/')[2];

    const onMenuClick = (type, category) => {
        navigate(`/admin/${type}?category=${category}`);
    };

    const renderMenuItems = (type) => {
        const items = [
            { label: '학적 | 학사지원과', key: 'academic' },
            { label: '등록 | 재무과', key: 'finance' },
            { label: '수업 | 학사지원과', key: 'class' },
            { label: '학생 | 학생과', key: 'student' },
        ];

        return items.map(item => {
            const isActive = type === pathType && item.key === currentCategory;

            return (
                <li
                    key={`${type}-${item.key}`}
                    onClick={() => onMenuClick(type, item.key)}
                    className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                >
                    ▶ {item.label}
                </li>
            );
        });
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.title}>제출 서류 관리</div>
            <hr className={styles.divider} />
            <div className={styles.subtitle}>행정 서비스</div>
            <ul>{renderMenuItems('submissions')}</ul>

            <div className={styles.title}>서류 유형 관리</div>
            <hr className={styles.divider} />
            <div className={styles.subtitle}>마감일 관리</div>
            <ul>{renderMenuItems('deadlines')}</ul>

            <div className={styles.subtitle}>필수 항목 관리</div>
            <ul>{renderMenuItems('required')}</ul>
        </div>
    );
};

export default AdminSidebar;
