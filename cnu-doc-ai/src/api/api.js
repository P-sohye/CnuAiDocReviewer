// src/api/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
});


// 로그인 요청 함수
export const login = async (memberId, password) => {
    const response = await api.post('/auth/login', { memberId, password });
    return response.data;
};

// 로그인된 사용자 정보 요청
export const getMyInfo = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

// 부서 목록 조회
export const getDepartments = async () => {
    const { data } = await api.get('/api/admin/departments');
    return data;
};
// 부서 목록 단건 조회
export const getDepartment = async (id) => {
    const { data } = await api.get(`/api/admin/departments/${id}`);
    return data;
};

// 부서별 서류 목록 조회
export const getDocTypesByDepartment = async (departmentId) => {
    const { data } = await api.get('/api/admin/documents', { params: { departmentId } });
    return data;
};

//  문서 수정용 단건 조회
export const getDocTypeForEdit = async (docTypeId) => {
    const { data } = await api.get(`/api/admin/documents/${docTypeId}`);
    return data;
};

// 문서 수정 (multipart/form-data)
export const updateDocType = async (docTypeId, {
    title,
    requiredFields = [],
    exampleValues = [],
    file, // 선택 업로드
}) => {
    const form = new FormData();
    if (title != null) form.append('title', title);
    requiredFields.forEach((v) => form.append('requiredFields', v));
    exampleValues.forEach((v) => form.append('exampleValues', v));
    if (file) form.append('file', file);

    const { data } = await api.put(`/api/admin/documents/${docTypeId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data; // "수정 완료"
};

// 문서 등록 (multipart/form-data)
export const createDocType = async ({
                                        departmentId,
                                        title,
                                        requiredFields = [],
                                        exampleValues = [],
                                        file,                    // File | Blob | undefined
                                    }) => {
    const form = new FormData();          // ← FromDate 오타 수정
    form.append('departmentId', departmentId);
    form.append('title', title);
    requiredFields.forEach((v) => form.append('requiredFields', v));
    exampleValues.forEach((v) => form.append('exampleValues', v));
    if (file) form.append('file', file);

    const { data } = await api.post('/api/admin/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data; // "등록 완료"
};

// 마감일 목록(부서별)
export async function getDeadlineByDepartment(departmentId) {
    const { data } = await api.get("/api/admin/deadline", {
        params: { departmentId },
    });
    return data ?? [];
}

// 마감일 등록/수정
export async function upsertDeadline({ docTypeId, deadline }) {
    await api.post("/api/admin/deadline", { docTypeId, deadline });
}

// 마감일 삭제
export async function deleteDeadline(docTypeId) {
    await api.delete(`/api/admin/deadline/${docTypeId}`);
}

// 파일 다운로드 (Blob)
export const downloadDocFile = async (docTypeId) => {
    const res = await api.get(`/api/admin/documents/${docTypeId}/file`, {
        responseType: 'blob', // 👈 중요: Blob으로 받기
    });

    // Content-Disposition에서 파일명 추출
    const dispo = res.headers['content-disposition'] || '';
    const match = dispo.match(/filename\*?=([^;]+)/i);
    const filename = match
        ? decodeURIComponent(match[1].replace(/^UTF-8''/, '').trim())
        : `document-${docTypeId}`;

    return { blob: res.data, filename: filename.replace(/["']/g, '') };
};
export default api;