import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import styles from './Sidebar.module.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isDeadlinePage = location.pathname.includes('deadlinemanage');
    const isSubmissionPage = location.pathname.includes('submissions');

    const handleClick = (categoryKey) => {
        if (isDeadlinePage) {
            navigate(`/admin/deadlinemanage?category=${categoryKey}`);
        } else if (isSubmissionPage) {
            navigate(`/admin/submissions?category=${categoryKey}`);
        }
    };
};


export default Sidebar;
