import React from 'react';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const backgroundImageUrl = `${process.env.PUBLIC_URL}/images/cnu.png`;

    return (
        <div
            className={styles.container}
            style={{
                backgroundImage: `url(${backgroundImageUrl})`,
            }}
        >
            <div className={styles.loginBox}>
                <div className={styles.title}>포탈시스템 로그인</div>

                <div className={styles.inputGroup}>
                    <input type="text" placeholder="ID" className={styles.input} />
                    <input type="password" placeholder="PASSWORD" className={styles.input} />
                </div>

                <button className={styles.loginButton}>로그인</button>

                <div className={styles.actionRow}>
                    <label className={styles.checkbox}>
                        <input type="checkbox" />
                        <span>ID 저장</span>
                    </label>
                    <div>
                        <a href="#" className={styles.linkText}>아이디 찾기</a>
                        <a href="#" className={styles.linkText}>비밀번호 재설정</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
