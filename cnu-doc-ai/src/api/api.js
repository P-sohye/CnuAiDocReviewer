// src/api/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
});

/* ───────── 인증 ───────── */
export const login = async (memberId, password) => {
    const { data } = await api.post('/auth/login', { memberId, password });
    return data;
};

export const getMyInfo = async () => {
    const { data } = await api.get('/auth/me');
    return data;
};

/* ───────── 부서/문서 관리(관리자) ───────── */
export const getDepartments = async () => {
    const { data } = await api.get('/api/admin/departments');
    return data;
};

export const getDepartment = async (id) => {
    const { data } = await api.get(`/api/admin/departments/${id}`);
    return data;
};

export const getDocTypesByDepartment = async (departmentId) => {
    const { data } = await api.get('/api/admin/documents', { params: { departmentId } });
    return data;
};

export const getDocTypeForEdit = async (docTypeId) => {
    const { data } = await api.get(`/api/admin/documents/${docTypeId}`);
    return data;
};

export const updateDocType = async (docTypeId, {
    title,
    requiredFields = [],
    exampleValues = [],
    file,
}) => {
    const form = new FormData();
    if (title != null) form.append('title', title);
    requiredFields.forEach((v) => form.append('requiredFields', v));
    exampleValues.forEach((v) => form.append('exampleValues', v));
    if (file) form.append('file', file);

    const { data } = await api.put(`/api/admin/documents/${docTypeId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const createDocType = async ({
                                        departmentId,
                                        title,
                                        requiredFields = [],
                                        exampleValues = [],
                                        file,
                                    }) => {
    const form = new FormData();
    form.append('departmentId', departmentId);
    form.append('title', title);
    requiredFields.forEach((v) => form.append('requiredFields', v));
    exampleValues.forEach((v) => form.append('exampleValues', v));
    if (file) form.append('file', file);

    const { data } = await api.post('/api/admin/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

/* ───────── 마감일(관리자) ───────── */
export const getDeadlineByDepartment = async (departmentId) => {
    const { data } = await api.get('/api/admin/deadline', { params: { departmentId } });
    return data ?? [];
};

export const upsertDeadline = async ({ docTypeId, deadline }) => {
    await api.post('/api/admin/deadline', { docTypeId, deadline });
};

export const deleteDeadline = async (docTypeId) => {
    await api.delete(`/api/admin/deadline/${docTypeId}`);
};

/* ───────── 문서 파일 다운로드(관리자) ───────── */
export const downloadDocFile = async (docTypeId) => {
    const res = await api.get(`/api/admin/documents/${docTypeId}/file`, {
        responseType: 'blob',
    });

    const dispo = res.headers['content-disposition'] || '';
    const match = dispo.match(/filename\*?=([^;]+)/i);
    const filename = match
        ? decodeURIComponent(match[1].replace(/^UTF-8''/, '').trim())
        : `document-${docTypeId}`;

    return { blob: res.data, filename: filename.replace(/["']/g, '') };
};

/* ───────── 학생 제출 ───────── */
export const createSubmission = async ({ docTypeId, fieldsJson, file }) => {
    const form = new FormData();
    form.append('docTypeId', docTypeId);
    if (fieldsJson) form.append('fieldsJson', fieldsJson);
    form.append('file', file);

    const { data } = await api.post('/api/submissions', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data; // SubmissionSummaryDTO
};

export const updateSubmission = async ({ submissionId, fieldsJson, file }) => {
    const form = new FormData();
    if (fieldsJson) form.append('fieldsJson', fieldsJson);
    if (file) form.append('file', file);

    const { data } = await api.put(`/api/submissions/${submissionId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data; // SubmissionSummaryDTO
};

export const submitSubmission = async ({ submissionId, mode }) => {
    const { data } = await api.post(
        `/api/submissions/${submissionId}/submit`,
        { mode }, // "FINAL" | "DIRECT"
        { headers: { 'Content-Type': 'application/json' } },
    );
    return data; // SubmissionSummaryDTO
};

/* ───────── 관리자 검토 ───────── */
// 목록: SUBMITTED만 반환
/* ───────── 관리자 검토 ───────── */
// 목록: 관리자 대기큐 (서버에서 SUBMITTED/UNDER_REVIEW 반환하도록 구현)
export async function listAdminQueue(departmentId, statuses) {
    const deptNum = Number(departmentId);
    if (Number.isNaN(deptNum)) throw new Error('departmentId is not a valid number');

    const params = { departmentId: deptNum };
    if (Array.isArray(statuses) && statuses.length > 0) {
        params.statuses = statuses; // 서버에서 @RequestParam List<SubmissionStatus>로 받음
    }
    const res = await api.get('/api/admin/submissions', { params });
    return res.data;
}
export async function getSubmissionDetail(id) {
    const subId = Number(id);
    if (Number.isNaN(subId)) {
        throw new Error('submission id is not a valid number');
    }
    const res = await api.get(`/api/admin/submissions/${subId}`);
    return res.data;
}


// 승인 (본문 없이 호출)
export const approveSubmission = async (id) => {
    const { data } = await api.post(`/api/admin/submissions/${id}/approve`);
    return data; // SubmissionSummaryDTO
};

// 반려
export const rejectSubmission = async (id, reason) => {
    const { data } = await api.post(
        `/api/admin/submissions/${id}/reject`,
        { memo: reason ?? '사유 미기재' },
        { headers: { 'Content-Type': 'application/json' } },
    );
    return data; // SubmissionSummaryDTO
};

export const downloadSubmissionFile = async (id) => {
    const res = await api.get(`/api/admin/submissions/${id}/file`, {
        responseType: 'blob',
    });
    const dispo = res.headers['content-disposition'] || '';
    const m = dispo.match(/filename\*?=([^;]+)/i);
    const filename = m
        ? decodeURIComponent(m[1].replace(/^UTF-8''/, '').trim())
        : `submission-${id}`;
    return { blob: res.data, filename: filename.replace(/["']/g, '') };
};
export default api;
