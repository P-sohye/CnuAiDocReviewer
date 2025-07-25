import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SubmissionDetailPage.module.css';

const SubmissionDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const doc = location.state?.doc;

    const [status, setStatus] = useState('신규 등록');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const handleSubmit = () => setShowModal(true);
    const cancelSubmit = () => setShowModal(false);

    const handleCancel = () => setShowCancelModal(true);
    const cancelCancel = () => setShowCancelModal(false);


    const confirmSubmit = () => {
        console.log('처리됨:', { status, rejectionReason });
        setShowModal(false);
        navigate(-1);
    };

    const confirmCancel = () => {
        console.log('취소 처리됨');
        setShowCancelModal(false);
        navigate(-1);
    };
    if (!doc) return <div className={styles.container}>문서 정보가 없습니다.</div>;

    return (
        <div className={styles.detailContainer}>
            <div className={styles.pageTitle}>제출 서류 관리 (상세)</div>
            <div className={styles.divider} />

            <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                    <label>이름</label>
                    <input value="홍길오" disabled />
                </div>
                <div className={styles.infoItem}>
                    <label>학과</label>
                    <input value="물리학과" disabled />
                </div>
                <div className={styles.infoItem}>
                    <label>학번</label>
                    <input value="20200111" disabled />
                </div>
            </div>

            <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                    <label>서류 유형</label>
                    <input value="장학금 신청서" disabled />
                </div>
                <div className={`${styles.fileItem} ${styles.longInput}`}>
                    <label>서류 확인</label>
                    <input value="[장학금 신청서_20200111_홍길동.pdf]" disabled />
                </div>
            </div>

            <div className={styles.checkSection}>
                <label>1차 검토 내용</label>
                <div className={styles.checkBox}>
                    - 전공 관련 경험<br />
                    - 가계곤란 사유<br />
                    - 가족관계증명서
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
                <label>관리자 최종 승인</label>
                <div className={styles.radioGroup}>
                    {['신규 등록', '반려 처리', '승인 처리'].map((opt) => (
                        <label key={opt}>
                            <input
                                type="radio"
                                name="status"
                                value={opt}
                                checked={status === opt}
                                onChange={() => setStatus(opt)}
                            />
                            {opt}
                        </label>
                    ))}
                </div>

                {status === '반려 처리' && (
                    <div className={styles.rejectBox}>
                        <label>관리자 반려 사유</label>
                        <textarea
                            rows="3"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="반려 사유를 입력하세요."
                        />
                    </div>
                )}
            </div>

            <div className={styles.buttonGroup}>
                <button className={styles.submitBtn} onClick={handleSubmit}>등록</button>
                <button className={styles.cancelBtn} onClick={handleCancel}>취소</button>
            </div>


            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <p>등록하시겠습니까?</p>
                        <div className={styles.modalButtons}>
                            <button className={styles.confirm} onClick={confirmSubmit}>확인</button>
                            <button className={styles.dismiss} onClick={cancelSubmit}>취소</button>
                        </div>
                    </div>
                </div>
            )}

            {showCancelModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <p>취소하시겠습니까?</p>
                        <div className={styles.modalButtons}>
                            <button className={styles.confirm} onClick={confirmCancel}>확인</button>
                            <button className={styles.dismiss} onClick={cancelCancel}>취소</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SubmissionDetailPage;
