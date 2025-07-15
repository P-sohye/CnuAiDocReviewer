// src/pages/AdminPage/AdminMain.jsx
import AdminLayout from '../../../layouts/AdminLayout';
import styles from './AdminMain.module.css'; // 스타일 따로 분리 추천

const AdminMain = () => {
    // 더미 데이터 (후에 API 연동 예정)
    const submissionStatus = [
        { department: '학적 | 학사지원과', count: 15 },
        { department: '등록 | 재무과', count: 35 },
        { department: '수업 | 학사지원과', count: 15 },
        { department: '학생 | 학생과', count: 15 },
    ];

    const submissionDeadlines = [
        { title: '공인영어능력 인정 신청서', deadline: '0000.00.00', status: '기간 설정' },
        { title: '공인영어능력 인정 신청서', deadline: '0000.00.00', status: '기간 설정' },
        { title: '공인영어능력 인정 신청서', deadline: '0000.00.00', status: '기간 설정' },
        { title: '공인영어능력 인정 신청서', deadline: '0000.00.00', status: '기간 설정' },
        { title: '공인영어능력 인정 신청서', deadline: '기간 설정 정보 없음', status: '기간 설정' },
        { title: '공인영어능력 인정 신청서', deadline: '기간 설정 정보 없음', status: '기간 설정' },
    ];

    return (
        <AdminLayout>
            <div className={styles.container}>
                <h2>서류 제출 현황 <span className={styles.time}>2025-04-25 (금) 오후 5:01 기준</span></h2>
                <table className={styles.table}>
                    <tbody>
                    {submissionStatus.map((item, index) => (
                        <tr key={index}>
                            <td>{item.department}</td>
                            <td>{item.count}건</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <h2>서류 제출 마감 <span className={styles.time}>2025-04-25 (금) 오후 5:01 기준</span></h2>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>서류 제목</th>
                        <th>마감 기한</th>
                        <th>상태</th>
                    </tr>
                    </thead>
                    <tbody>
                    {submissionDeadlines.map((item, index) => (
                        <tr key={index}>
                            <td>{item.title}</td>
                            <td>{item.deadline}</td>
                            <td>{item.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default AdminMain;
