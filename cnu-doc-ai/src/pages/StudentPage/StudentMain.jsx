import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import styles from './StudentMain.module.css';

const StudentMain = () => {
    return (
        <div>
            <Header />
            <div className={styles.container}>
                <Sidebar />
                <div className={styles.mainContent}>
                    <section className={styles.profileCard}>
                        <img src="/images/cnu_logo.png" alt="프로필" className={styles.logo} />
                        <div className={styles.name}>홍길동</div>
                        <div className={styles.info}>화학과(학부생) | 20100000</div>
                    </section>

                    <section className={styles.chatbotSection}>
                        <p className={styles.guideText}>
                            챗봇 지원 시스템은 <strong>CNU 챗봇</strong>과 함께합니다!
                        </p>
                        <button className={styles.chatbotButton}>CNU 챗봇</button>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default StudentMain;
