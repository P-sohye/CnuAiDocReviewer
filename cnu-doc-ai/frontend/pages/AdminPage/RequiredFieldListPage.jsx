import React, { useEffect, useState } from 'react';
import {useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import axios from 'axios';
import styles from './RequiredFieldListPage.module.css';

const categoryMap = {
    academic: '학적 | 학사지원과',
    finance: '등록 | 재무과',
    class: '수업 | 학사지원과',
    student: '학생 | 학생과',
};

const RequiredFieldListPage = () => {
    const [documents, setDocuments] = useState([]);
    const [previewIndex, setPreviewIndex] = useState(null);
    const navigate = useNavigate();

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get('category');
    const selectedDept = categoryMap[category] || '학적 | 학사지원과';

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const filteredDocs = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paged = filteredDocs.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filteredDocs.length / pageSize);

    useEffect(() => {
        // 🧪 실제 API 호출 주석 처리
        // axios.get(`/api/admin/required/list?category=${category}`)
        //     .then(res => setDocuments(res.data))
        //     .catch(err => console.error(err));

        // ✅ 더미 데이터
        const dummyData = [
            {
                id: 1,
                name: '장학금 신청서',
                link: '',
                requiredFields: ['이름', '학번', '신청 사유']
            },
            {
                id: 2,
                name: '비교과 활동 보고서',
                link: 'https://example.com/report',
                requiredFields: ['활동명', '기간', '소감']
            },
            {
                id: 3,
                name: '교내 추천서',
                link: '',
                requiredFields: []
            },
            {
                id: 4,
                name: '학적 변경 신청서',
                link: '',
                requiredFields: ['이름', '변경 사유']
            }
        ];

        setDocuments(dummyData);
    }, [category]);


    const handlePreviewToggle = (id) => {
        setPreviewIndex(prev => prev === id ? null : id);
    };


    const handleManageClick = (documentId) => {
        navigate(`/admin/required/edit/${documentId}?category=${category}`);
    };

    return (
        <div className={styles.page}>
            <div className={styles.documentSection}>
                <h2 className={styles.pageTitle}>서류 유형 관리 ( 서류 관리 )</h2>
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
                    <th>현재 설정된 필수 항목</th>
                    <th>서류 관리</th>
                </tr>
                </thead>
                <tbody>
                {paged.map((doc) => (
                    <tr key={doc.id}>
                        <td>{doc.name}</td>
                        <td className={styles.previewCell}>
                            <button onClick={() => handlePreviewToggle(doc.id)} className={styles.viewBtn}>보기</button>
                            {previewIndex === doc.id && (
                                <div className={styles.tooltip}>
                                    {doc.requiredFields.length > 0 ? (
                                        <div>
                                            {doc.requiredFields.map((field, i) => (
                                                <div key={i}>- {field}</div>
                                            ))}
                                        </div>

                                    ) : <div>설정된 항목 없음</div>}
                                </div>
                            )}
                        </td>
                        <td>
                            <button onClick={() => handleManageClick(doc.id)} className={styles.manageBtn}>관리</button>
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

export default RequiredFieldListPage;
