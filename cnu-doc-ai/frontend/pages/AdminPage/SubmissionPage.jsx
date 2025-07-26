import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SubmissionPage.module.css';

const dummyData = [...Array(50)].map((_, idx) => ({
    id: idx + 1,
    name: `홍길동${idx + 1}`,
    studentId: `202001${(10 + idx).toString().padStart(2, '0')}`,
    fileTitle: `[ 장학금 신청서_202001${(10 + idx).toString().padStart(2, '0')}_홍길동${idx + 1} ].pdf`,
    date: `2025-04-${(1 + (idx % 30)).toString().padStart(2, '0')}`,
    type: ['신구 등록', '반려 처리', '승인 완료'][idx % 3],
    approved: idx % 3 === 2 ? 'Y' : 'N'
}));

const categoryMap = {
    academic: '학적 | 학사지원과',
    finance: '등록 | 재무과',
    class: '수업 | 학사지원과',
    student: '학생 | 학생과',
};

const SubmissionPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get('category');
    const selectedDept = categoryMap[category] || '학적 | 학사지원과';

    const [page, setPage] = useState(1);
    const [searchField, setSearchField] = useState('fileTitle');
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [typeFilters, setTypeFilters] = useState([]);
    const [approvedFilter, setApprovedFilter] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);

    useEffect(() => {
        setPage(1);
    }, [search, typeFilters, approvedFilter, category, startDate, endDate]);

    const filtered = dummyData.filter(item => {
        const fieldMatch = item[searchField]?.includes(search);
        const typeMatch = typeFilters.length === 0 || typeFilters.includes(item.type);
        const approvedMatch = approvedFilter === null || item.approved === approvedFilter;
        const dateMatch = (!startDate || item.date >= startDate) && (!endDate || item.date <= endDate);
        return fieldMatch && typeMatch && approvedMatch && dateMatch;
    });

    const pageSize = 10;
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filtered.length / pageSize);

    const toggleTypeFilter = (type) => {
        setTypeFilters(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const handleRowClick = (doc) => {
        setSelectedRowId(doc.id);
        navigate(`/submission/detail/${doc.id}`, { state: { doc } });
    };

    return (
        <div className={styles.page}>
                <div className={styles.documentSection}>
                    <h2 className={styles.pageTitle}>제출 서류 관리 ( 행정 서비스 )</h2>
                    <h3 className={styles.selectedDept}>▶ {selectedDept}</h3>

                <div className={styles.filterContainer}>
                    <div className={styles.leftFilters}>
                        <div className={styles.filterGroup}>
                            <label>조건검색</label>
                            <select value={searchField} onChange={e => setSearchField(e.target.value)}>
                                <option value="fileTitle">서류 제목</option>
                                <option value="name">이름</option>
                            </select>
                            <input
                                type="text"
                                placeholder={searchField === 'fileTitle' ? '서류 제목' : '이름'}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <div className={styles.filterGroup}>
                            <label>서류 제출일</label>
                            <div className={styles.dateRange}>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                <span>~</span>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightFilters}>
                        <div className={styles.filterGroup}>
                            <label>서류 구분</label>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="radio"
                                    name="docType"
                                    checked={typeFilters.length === 0}
                                    onChange={() => setTypeFilters([])}
                                /> 전체
                            </label>
                            {['신구 등록', '반려 처리', '승인 완료'].map(type => (
                                <label key={type} className={styles.checkboxLabel}>
                                    <input
                                        type="radio"
                                        name="docType"
                                        checked={typeFilters[0] === type}
                                        onChange={() => setTypeFilters([type])}
                                    /> {type}
                                </label>
                            ))}
                        </div>

                        <div className={styles.filterGroup}>
                            <label>승인 항목</label>
                            <label><input type="radio" checked={approvedFilter === 'Y'} onChange={() => setApprovedFilter('Y')} /> Y</label>
                            <label><input type="radio" checked={approvedFilter === 'N'} onChange={() => setApprovedFilter('N')} /> N</label>
                            <label><input type="radio" checked={approvedFilter === null} onChange={() => setApprovedFilter(null)} /> 전체</label>
                        </div>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>번호</th><th>이름</th><th>학번</th><th>서류 제목</th><th>서류 제출 일자</th><th>구분</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paged.map((doc) => (
                            <tr
                                key={doc.id}
                                onClick={() => handleRowClick(doc)}
                                className={selectedRowId === doc.id ? styles.selectedRow : ''}
                            >
                                <td>{doc.id}</td>
                                <td>{doc.name}</td>
                                <td>{doc.studentId}</td>
                                <td>{doc.fileTitle}</td>
                                <td>{doc.date}</td>
                                <td className={doc.type === '승인 완료' ? styles.approved : ''}>{doc.type}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

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

export default SubmissionPage;
