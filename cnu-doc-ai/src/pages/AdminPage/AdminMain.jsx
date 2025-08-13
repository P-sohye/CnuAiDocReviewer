import React from 'react';
import styles from './AdminMain.module.css';

const AdminMain = () => {
    const timestamp = new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }) + ' 기준';

    const submissionStatus = [
        { department:  '학생 | 학생과', count: 15 },
        { department: '수업 | 학사지원과', count: 35 },
        { department:  '국제 | 국제교류본부', count: 15 }
    ];

    const submissionDeadlines = [
        { title: '공인영어능력 인정 신청서', deadline: '0000.00.00', status: '기간 설정' },
        { title: '공인영어능력 인정 신청서', deadline: '0000.00.00', status: '기간 설정' },
        { title: '공인영어능력 인정 신청서', deadline: '0000.00.00', status: '기간 설정' },
        { title: '공인영어능력 인정 신청서', deadline: '0000.00.00', status: '기간 설정' },
    ];

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <h2 className={styles.title}>
                    서류 제출 현황 <span className={styles.timestamp}>{timestamp}</span>
                </h2>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>행정부서</th>
                        <th className={styles.rightAlign}>신규 제출 서류</th>
                    </tr>
                    </thead>
                    <tbody>
                    {submissionStatus.map((item, index) => (
                        <tr key={index}>
                            <td>{item.department}</td>
                            <td className={styles.rightAlign}>{item.count}건</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <h2 className={styles.title}>
                    서류 제출 마감 <span className={styles.timestamp}>{timestamp}</span>
                </h2>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>서류 제목</th>
                        <th>마감 기한</th>
                        <th className={styles.rightAlign}>상태</th>
                    </tr>
                    </thead>
                    <tbody>
                    {submissionDeadlines.map((item, index) => (
                        <tr key={index}>
                            <td>{item.title}</td>
                            <td>{item.deadline}</td>
                            <td className={styles.rightAlign}>{item.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminMain;
