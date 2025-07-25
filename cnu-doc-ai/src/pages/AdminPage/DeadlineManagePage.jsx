import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './DeadlineManagePage.module.css';

const initialDocs = [
    { id: 1, name: '공인영어능력 인정 신청서', deadline: '2025.06.23' },
    { id: 2, name: '다른 대학 수학신청서(휴학자용)', deadline: '' },
    { id: 3, name: '다른 대학 수학 추천서', deadline: '' },
    { id: 4, name: '군교육훈련 학점 인정 신청서', deadline: '' },
    { id: 5, name: '휴학원', deadline: '' },
    { id: 6, name: '복학원', deadline: '' },
    { id: 7, name: '휴학팩스신청서', deadline: '' },
    { id: 8, name: '복학팩스신청서', deadline: '' },
    { id: 9, name: '자퇴원 및 개인정보 수집·이용 동의서', deadline: '' },
    { id: 10, name: '자퇴 신청 위임장', deadline: '' },
    { id: 11, name: '기타 서류', deadline: '' },
];

const categoryMap = {
    academic: '학적 | 학사지원과',
    finance: '등록 | 재무과',
    class: '수업 | 학사지원과',
    student: '학생 | 학생과',
};

const DeadlineManagePage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get('category');
    const selectedDept = categoryMap[category] || '학적 | 학사지원과';

    const [documents, setDocuments] = useState(initialDocs);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const filteredDocs = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paged = filteredDocs.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filteredDocs.length / pageSize);

    const handleDateChange = (id, date) => {
        const updated = documents.map(doc =>
            doc.id === id ? { ...doc, deadline: date } : doc
        );
        setDocuments(updated);
    };
    const handleRegister = (id, date) => {
        const updated = documents.map(doc =>
            doc.id === id ? { ...doc, deadline: date } : doc
        );
        setDocuments(updated);
    };

    const handleCancel = (id) => {
        const updated = documents.map(doc =>
            doc.id === id ? { ...doc, deadline: '' } : doc
        );
        setDocuments(updated);
    };

    return (
        <div className={styles.page}>
            <div className={styles.documentSection}>
                <h2 className={styles.pageTitle}>서류 유형 관리 ( 마감일 관리 )</h2>
                <h3 className={styles.selectedDept}>▶ {selectedDept}</h3>

                <div className={styles.searchBox}>
                    <input
                        placeholder="서류명을 검색하세요"
                        value={searchTerm}
                        onChange={e => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>서류명</th>
                        <th>마감일</th>
                        <th>마감일 설정</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paged.map(doc => (
                        <tr key={doc.id}>
                            <td>{doc.name}</td>
                            <td>{doc.deadline || '없음'}</td>
                            <td className={styles.deadlineCell}>
                                <div className={styles.dateControl}>
                                    <input
                                        type="date"
                                        value={doc.deadline}
                                        onChange={e => handleDateChange(doc.id, e.target.value)}
                                        className={styles.dateInput}
                                    />
                                    <div className={styles.buttonGroup}>
                                        <button
                                            onClick={() => handleRegister(doc.id, doc.deadline)}
                                            className={styles.submitBtn}
                                        >
                                            등록
                                        </button>
                                        <button
                                            onClick={() => handleCancel(doc.id)}
                                            className={styles.cancelBtn}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            </td>

                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className={styles.pagination}>
                    {Array.from({ length: totalPages }, (_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPage(idx + 1)}
                            className={page === idx + 1 ? styles.active : ''}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeadlineManagePage;
