import React from 'react';
import styles from './Header.module.css';

const Header = () => {
    return (
        <div className={styles.header}>
            <img
                src="/images/cnu_logo.png"
                alt="충남대학교 로고"
            />
        </div>
    );
};

export default Header;
