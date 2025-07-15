import React from "react";
import { useNavigate } from "react-router-dom";
import styles from './AdminSidebar.module.css';

const AdminSidebar = () => {
    const navigate = useNavigate();

    const onMenuClick = (type, category) => {
        if (type === 'submission') {
            navigate(`/admin/submissions?category=${category}`);
        } else if (type === 'deadline') {
            navigate(`/admin/deadlines?category=${category}`);
        } else if (type === 'required') {
            navigate(`/admin/required?category=${category}`);
        }
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.title}>제출 서류 관리</div>
            <hr className={styles.divider} />
            <div className={styles.subtitle}>행정 서비스</div>
            <ul>
                <li onClick={() => onMenuClick('submission', 'academic')} className={styles.menuItem}>▶ 학적 | 학사지원과</li>
                <li onClick={() => onMenuClick('submission', 'finance')} className={styles.menuItem}>▶ 등록 | 재무과</li>
                <li onClick={() => onMenuClick('submission', 'class')} className={styles.menuItem}>▶ 수업 | 학사지원과</li>
                <li onClick={() => onMenuClick('submission', 'student')} className={styles.menuItem}>▶ 학생 | 학생과</li>
            </ul>

            <div className={styles.title}>서류 유형 관리</div>
            <hr className={styles.divider} />
            <div className={styles.subtitle}>마감일 관리</div>
            <ul>
                <li onClick={() => onMenuClick('deadline', 'academic')} className={styles.menuItem}>▶ 학적 | 학사지원과</li>
                <li onClick={() => onMenuClick('deadline', 'finance')} className={styles.menuItem}>▶ 등록 | 재무과</li>
                <li onClick={() => onMenuClick('deadline', 'class')} className={styles.menuItem}>▶ 수업 | 학사지원과</li>
                <li onClick={() => onMenuClick('deadline', 'student')} className={styles.menuItem}>▶ 학생 | 학생과</li>
            </ul>

            <div className={styles.subtitle}>필수 항목 관리</div>
            <ul>
                <li onClick={() => onMenuClick('required', 'academic')} className={styles.menuItem}>▶ 학적 | 학사지원과</li>
                <li onClick={() => onMenuClick('required', 'finance')} className={styles.menuItem}>▶ 등록 | 재무과</li>
                <li onClick={() => onMenuClick('required', 'class')} className={styles.menuItem}>▶ 수업 | 학사지원과</li>
                <li onClick={() => onMenuClick('required', 'student')} className={styles.menuItem}>▶ 학생 | 학생과</li>
            </ul>
        </div>
    );
};

export default AdminSidebar;
