// src/pages/AdminMain.jsx
import React, { useEffect, useMemo, useState } from 'react';
import styles from './AdminMain.module.css';

import useDepartments, { formatDeptLabel } from '../../hooks/useDepartments';
import {
    listAdminQueue,
    getDocTypesByDepartment,
    getDeadlineByDepartment,
} from '../../api/api';

// 날짜 포맷터
const fmtNowKST = () =>
    new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }) + ' 기준';

// 안전한 날짜 비교용(YYYY-MM-DD → Date)
const toDate = (ymd) => {
    if (!ymd) return null;
    const [y, m, d] = ymd.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
};

const AdminMain = () => {
    const timestamp = fmtNowKST();

    // 부서 로드
    const { departments, loading: deptLoading, error: deptError } = useDepartments();

    const [loading, setLoading] = useState(true);
    const [loadErr, setLoadErr] = useState(null);

    // 상단 표 데이터: [{ departmentLabel, count }]
    const [submissionStatus, setSubmissionStatus] = useState([]);

    // 하단 표 데이터: [{ title, deadline, departmentLabel }]
    const [submissionDeadlines, setSubmissionDeadlines] = useState([]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            if (deptLoading) return;
            if (deptError) {
                setLoadErr(deptError);
                setLoading(false);
                return;
            }
            if (!departments || departments.length === 0) {
                setSubmissionStatus([]);
                setSubmissionDeadlines([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setLoadErr(null);

                // ── 1) 각 부서의 신규 제출 건수 (SUBMITTED, UNDER_REVIEW)
                const statuses = ['SUBMITTED', 'UNDER_REVIEW'];
                const statusPromises = departments.map(async (dept) => {
                    try {
                        const list = await listAdminQueue(Number(dept.id), statuses);
                        return {
                            departmentLabel: formatDeptLabel(dept),
                            count: Array.isArray(list) ? list.length : 0,
                        };
                    } catch {
                        return { departmentLabel: formatDeptLabel(dept), count: 0 };
                    }
                });

                // ── 2) 각 부서의 마감 목록(문서명+마감일) 취합
                const deadlinePromises = departments.map(async (dept) => {
                    try {
                        const [docs, dls] = await Promise.all([
                            getDocTypesByDepartment(Number(dept.id)),
                            getDeadlineByDepartment(Number(dept.id)),
                        ]);
                        const dlMap = new Map((dls ?? []).map((d) => [d.docTypeId, d.deadline || '']));
                        const rows = (docs ?? []).map((doc) => ({
                            title: doc.title ?? doc.name ?? '',
                            deadline: dlMap.get(doc.docTypeId ?? doc.id ?? doc.documentId) || '',
                            departmentLabel: formatDeptLabel(dept),
                        }));
                        return rows;
                    } catch {
                        return [];
                    }
                });

                const statusRows = await Promise.all(statusPromises);
                const deadlineRowsNested = await Promise.all(deadlinePromises);

                if (!mounted) return;

                // 상단: 부서 순서는 hooks가 준 순서 유지
                setSubmissionStatus(statusRows);

                // 하단: 마감 있는 것만 모아 가까운 순으로 정렬
                const flat = deadlineRowsNested.flat().filter((r) => r.deadline);
                flat.sort((a, b) => {
                    const da = toDate(a.deadline);
                    const db = toDate(b.deadline);
                    if (!da && !db) return 0;
                    if (!da) return 1;
                    if (!db) return -1;
                    return da - db;
                });
                setSubmissionDeadlines(flat);
            } catch (e) {
                if (mounted) setLoadErr(e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [departments, deptLoading, deptError]);

    const hasDeadlines = submissionDeadlines.length > 0;

    if (deptLoading || loading) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <div className={styles.loading}>불러오는 중…</div>
                </div>
            </div>
        );
    }

    if (loadErr) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <div className={styles.error}>데이터 로드 실패: {String(loadErr)}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                {/* 상단: 서류 제출 현황 */}
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
                    {submissionStatus.map((item, idx) => (
                        <tr key={idx}>
                            <td>{item.departmentLabel}</td>
                            <td className={styles.rightAlign}>{item.count}건</td>
                        </tr>
                    ))}
                    {submissionStatus.length === 0 && (
                        <tr>
                            <td colSpan={2} className={styles.empty}>표시할 항목이 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {/* 하단: 서류 제출 마감 */}
                <h2 className={styles.title}>
                    서류 제출 마감 <span className={styles.timestamp}>{timestamp}</span>
                </h2>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>서류 제목</th>
                        <th>마감 기한</th>
                        <th>행정부서</th>
                        <th className={styles.rightAlign}>상태</th>
                    </tr>
                    </thead>
                    <tbody>
                    {hasDeadlines ? (
                        submissionDeadlines.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.title}</td>
                                <td>{item.deadline}</td>
                                <td>{item.departmentLabel}</td>
                                <td className={styles.rightAlign}>
                                    {/* 오늘 이후면 '진행 중', 오늘 이전이면 '마감 지남' */}
                                    {(() => {
                                        const d = toDate(item.deadline);
                                        const today = new Date();
                                        today.setHours(0,0,0,0);
                                        if (!d) return '기간 미설정';
                                        return d >= today ? '진행 중' : '마감 지남';
                                    })()}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className={styles.empty}>표시할 항목이 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminMain;
