import React from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './StudentMain.module.css';

const StudentMain = () => {
    const { selectedMenu } = useOutletContext();

    const MENU_TITLES = {
        학적: '▶ 학적 | 학사지원과 제출 서류',
        등록: '▶ 등록 | 재무과 제출 서류',
        수업: '▶ 수업 | 학사지원과 제출 서류',
        학생: '▶ 학생 | 학생과 제출 서류',
    };

    const renderDocumentList = () => {
        if (!selectedMenu || !MENU_TITLES[selectedMenu]) {
            return <div className={styles.placeholderText}>해당 부서를 선택해주세요.</div>;
        }

        const sampleDocuments = [
            {
                title: '서류명.hwp | 서류 제출 기한( ~ yyyy_mm_dd)',
                detail: '필수 항목: (서명, 날짜, 이름 등..) 누락',
            },
            {
                title: '서류명.hwp | 서류 제출 기한( ~ yyyy_mm_dd)',
                detail: '필수 항목: (서명, 날짜, 이름 등..) 누락',
            },
        ];

        return (
            <>
                <div className={styles.innerTitle}>{MENU_TITLES[selectedMenu]}</div>
                {sampleDocuments.map((doc, idx) => (
                    <div key={idx} className={styles.documentGroup}>
                        <div className={styles.titleLine}>{doc.title}</div>
                        <div className={styles.detailLine}>{doc.detail}</div>
                    </div>
                ))}
            </>
        );
    };

    return (
        <div className={styles.mainContent}>
            <section className={styles.profileCard}>
                <div className={styles.headerRow}>
                    <img src="/images/logo.png" alt="프로필" className={styles.logo} />
                    <div className={styles.userInfoBox}>
                        <div className={styles.name}>홍길동</div>
                        <div className={styles.info}>화학과(재학생) | 20100000</div>
                    </div>
                </div>

                <div className={styles.sectionTitle}>제출 지원 서류 목록</div>
                <div className={styles.innerContent}>
                    {renderDocumentList()}
                </div>
            </section>

            <section className={styles.chatbotSection}>
                <div className={styles.chatbotContainer}>
                    <div className={styles.chatbotText}>
                        행정 지원 시스템은<br />
                        <strong>CNU 챗봇</strong>과 함께합니다 !
                    </div>
                    <img
                        src="/images/mascot.png"
                        alt="챗봇 마스코트"
                        className={styles.chatbotImage}
                    />
                    <button className={styles.chatbotButton}>CNU 챗봇</button>
                </div>
            </section>
        </div>
    );
};

export default StudentMain;
