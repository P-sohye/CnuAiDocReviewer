import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styles from './AddRequiredDocumentPage.module.css';

const AddRequiredDocumentPage = () => {
    const navigate = useNavigate();
    const { documentId } = useParams();
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');
    const title = searchParams.get('title');

    const isEditMode = !!documentId;

    const [docName, setDocName] = useState(title || '');
    const [requiredFields, setRequiredFields] = useState([]);
    const [newFieldName, setNewFieldName] = useState('');
    const [newExample, setNewExample] = useState('');
    const [uploadedFileName, setUploadedFileName] = useState('');

    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    // ──────────────────────────────
    // Effect - 수정모드 시 초기값 세팅
    // ──────────────────────────────
    useEffect(() => {
        if (isEditMode) {
            const dummy = {
                name: title,
                requiredFields: [
                    { name: '대학명' },
                    { name: '학과(부)' },
                    { name: '성명' },
                    { name: '연락처' },
                    { name: '신청일 성명 및 서명' }
                ],
                fileName: '파일명.hwp'
            };
            setRequiredFields(dummy.requiredFields);
            setUploadedFileName(dummy.fileName);
        }
    }, [isEditMode, title]);

    // ──────────────────────────────
    // 필드 추가 / 삭제
    // ──────────────────────────────
    const handleAddField = () => {
        if (newFieldName.trim()) {
            setRequiredFields([...requiredFields, { name: newFieldName, example: newExample }]);
            setNewFieldName('');
            setNewExample('');
        }
    };

    const handleDeleteField = (index) => {
        setRequiredFields(requiredFields.filter((_, i) => i !== index));
    };

    // ──────────────────────────────
    // 파일 업로드 핸들링
    // ──────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setUploadedFileName(file.name);
    };

    // ──────────────────────────────
    // 등록 / 취소 버튼 클릭 → 모달 표시
    // ──────────────────────────────
    const handleSubmitClick = () => setShowSubmitModal(true);
    const handleCancelClick = () => setShowCancelModal(true);

    // ──────────────────────────────
    // 등록 확인 모달 처리
    // ──────────────────────────────
    const confirmSubmit = () => {
        setShowSubmitModal(false);
        handleSubmit();
    };
    const cancelSubmit = () => setShowSubmitModal(false);

    // ──────────────────────────────
    // 취소 확인 모달 처리
    // ──────────────────────────────
    const confirmCancel = () => {
        setShowCancelModal(false);
        navigate(-1);
    };
    const cancelCancel = () => setShowCancelModal(false);

    // ──────────────────────────────
    // 제출 처리
    // ──────────────────────────────
    const handleSubmit = () => {
        const payload = {
            name: docName,
            category,
            requiredFields,
            fileName: uploadedFileName
        };

        if (isEditMode) {
            console.log('수정 요청:', payload);
            alert('수정 완료');
        } else {
            console.log('신규 등록 요청:', payload);
            alert('등록 완료');
        }

        navigate(`/admin/required/list?category=${category}`);
    };

    // ──────────────────────────────
    // Render
    // ──────────────────────────────
    return (
        <div className={styles.page}>
            <h2>필수 항목 관리 / {isEditMode ? docName : '신규 서류 등록'}</h2>

            {/* ───── 서류명 입력 ───── */}
            <div className={styles.formGroup}>
                <label>서류명</label>
                <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    disabled={isEditMode}
                />
            </div>

            {/* ───── 파일 업로드 ───── */}
            <div className={styles.formGroup}>
                <label>서류 파일</label>
                <div className={styles.fileRow}>
                    <input type="text" value={uploadedFileName} disabled />
                    <label className={styles.uploadBtn}>
                        파일 업로드
                        <input type="file" onChange={handleFileChange} hidden />
                    </label>
                </div>
            </div>

            {/* ───── 필수 항목 목록 ───── */}
            <div className={styles.formGroup}>
                <label>현재 설정된 항목</label>
                {requiredFields.length > 0 ? (
                    <ul className={styles.fieldList}>
                        {requiredFields.map((field, idx) => (
                            <li key={idx} className={styles.fieldItem}>
                <span>
                  - {field.name}
                    {field.example && ` (예: ${field.example})`}
                </span>
                                <button onClick={() => handleDeleteField(idx)}>삭제</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.noneText}>항목이 없습니다.</p>
                )}
            </div>

            {/* ───── 항목 추가 입력 영역 ───── */}
            <div className={styles.formRow}>
                <input
                    placeholder="필수 항목 명칭"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                />
                <input
                    placeholder="예시 답안"
                    value={newExample}
                    onChange={(e) => setNewExample(e.target.value)}
                />
                <button onClick={handleAddField}>항목 추가</button>
            </div>

            {/* ───── 버튼 영역 ───── */}
            <div className={styles.buttonGroup}>
                <button className={styles.submitBtn} onClick={handleSubmitClick}>등록</button>
                <button className={styles.cancelBtn} onClick={handleCancelClick}>취소</button>
            </div>

            {/* ───── 등록 모달 ───── */}
            {showSubmitModal && (
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

            {/* ───── 취소 모달 ───── */}
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

export default AddRequiredDocumentPage;
