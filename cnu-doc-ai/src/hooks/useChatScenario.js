// hooks/useChatScenario.js
import { useCallback, useEffect, useRef, useState } from "react";
import {
    getStudentDepartments,
    getDocTypesByDepartmentPublic,
    getRequiredFields,
    getDeadline,
    createSubmission,
    getSubmissionSummary,
    getBotReviewResult,
    listMySubmissions,
    pickErrorMessage,
} from "../api/api";
import { SCENARIOS, STATUS } from "../utils/scenarioConstants";

/** 화면 라벨 */
const statusLabel = {
    DRAFT: "임시저장",
    BOT_REVIEW: "챗봇 검사",
    SUBMITTED: "관리자 대기",
    UNDER_REVIEW: "관리자 검토 중",
    NEEDS_FIX: "보정 요청",
    APPROVED: "승인 완료",
    REJECTED: "반려 처리",
};

/** 공통 유틸 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const formatDate = (isoStr) => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (Number.isNaN(d.valueOf())) return isoStr;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};
/** 정규화 */
const normDept = (d) => ({ id: d?.id, name: d?.name, leftLabel: null });
const normDocType = (t) => ({ id: t?.docTypeId, name: t?.title });
const normRequiredField = (it, idx) => ({
    label:
        typeof it === "string"
            ? it
            : it?.label ?? it?.name ?? it?.title ?? `필수 항목 ${idx + 1}`,
    required: true,
});
const isExpired = (deadlineStr) => {
    if (!deadlineStr) return false;
    const now = new Date();
    const d = new Date(deadlineStr);
    return Number.isFinite(d.valueOf()) && d < now;
};

/** OCR 결과 사유 우선순위 추출 */
async function fetchReviewReasons(submissionId) {
    try {
        const review = await getBotReviewResult(submissionId);
        if (Array.isArray(review?.findings) && review.findings.length) {
            return review.findings.map((f) => `${f.label}: ${f.message}`);
        }
        if (review?.reason) return [review.reason];
        if (Array.isArray(review?.debugTexts) && review.debugTexts.length) {
            return review.debugTexts.slice(0, 5);
        }
    } catch (_) {
        /* ignore */
    }
    return [];
}

/** 상태 폴링: BOT_REVIEW는 완료 아님! */
async function pollUntilDone(getSummaryFn, submissionId, opts) {
    const {
        initialDelayMs = 5000,
        stepMs = 5000,
        maxDelayMs = 30000,
        timeoutMs = 8 * 60 * 1000, // 8분
    } = opts || {};

    const DONE = new Set([
        STATUS.NEEDS_FIX,
        STATUS.REJECTED,
        STATUS.SUBMITTED,
        STATUS.UNDER_REVIEW,
        STATUS.APPROVED,
    ]); // ❌ BOT_REVIEW 제외

    let delay = initialDelayMs;
    let elapsed = 0;
    let summary = await getSummaryFn(submissionId);

    // 이미 완료 상태면 즉시 반환
    if (summary?.status && DONE.has(summary.status)) return summary;

    while (elapsed < timeoutMs) {
        await sleep(delay);
        elapsed += delay;

        // 점차 대기 증가 (최대 maxDelayMs)
        delay = Math.min(delay + stepMs, maxDelayMs);

        summary = await getSummaryFn(submissionId);
        const st = summary?.status;

        // 완료 상태면 탈출
        if (DONE.has(st)) return summary;

        // BOT_REVIEW면 계속 대기 (타임아웃까지)
    }

    // 타임아웃: 마지막 상태 반환 (대개 BOT_REVIEW일 것)
    return summary ?? null;
}

export default function useChatScenario() {
    const [chatHistory, setChatHistory] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [docTypes, setDocTypes] = useState([]);
    const [selectedDeptId, setSelectedDeptId] = useState(null);
    const [selectedDocType, setSelectedDocType] = useState(null); // { id, name }
    const [deadlineInfo, setDeadlineInfo] = useState(null); // {deadline:string}|null
    const bootstrapped = useRef(false);

    const pushBot = useCallback((msg) => {
        setChatHistory((h) => [...h, { from: "bot", ...msg }]);
    }, []);
    const pushUser = useCallback((text) => {
        setChatHistory((h) => [...h, { from: "user", message: text }]);
    }, []);

    /** ▶ 부서 선택 단계로 깔끔히 리셋 */
    const resetToDeptSelect = useCallback(() => {
        setSelectedDeptId(null);
        setSelectedDocType(null);
        setDocTypes([]);
        setDeadlineInfo(null);

        pushBot(
            SCENARIOS.SELECT_DEPT(
                (departments || []).map((d) => ({
                    id: d.id,
                    name: d.name,
                    leftLabel: d.leftLabel,
                }))
            )
        );
    }, [departments, pushBot]);

    // 초기: 인트로만
    useEffect(() => {
        if (bootstrapped.current) return;
        bootstrapped.current = true;

        (async () => {
            try {
                const deptsRes = await getStudentDepartments();
                const normDepts = (deptsRes || [])
                    .map(normDept)
                    .filter((d) => d.id && d.name);
                setDepartments(normDepts);
                pushBot({
                    message: SCENARIOS.INIT.message,
                    options: SCENARIOS.INIT.options,
                });
            } catch (e) {
                console.error("[INIT] departments load error:", e);
                pushBot(SCENARIOS.SERVER_ERROR);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUserInput = useCallback(
        async (raw) => {
            if (!raw) return;
            const text = String(raw).trim();
            pushUser(text);

            // 공통 메뉴 처리 -------------------------------------------------
            if (text === "서류 제출") {
                resetToDeptSelect();
                return;
            }
            if (text === "서류 제출 현황") {
                try {
                    const rows = await listMySubmissions({ limit: 10 });
                    if (!rows || rows.length === 0) {
                        pushBot({ message: "제출 이력이 없습니다." });
                    } else {
                        const lines = rows.map((r) => {
                            const status = statusLabel[r.status] || r.status;
                            return `- ${status} | ${r.title || "(제목 없음)"} | ${formatDate(
                                r.submittedAt
                            )}`;
                        });
                        pushBot({ message: `최근 제출 내역:\n${lines.join("\n")}` });
                    }
                } catch {
                    pushBot({
                        message: "제출 현황을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
                    });
                }
                return;
            }

            // ▶ 추가: 마감 화면에서의 액션
            if (text === "다른 서류 제출하기") {
                resetToDeptSelect();
                return;
            }
            if (text === "챗봇 종료하기") {
                pushBot(SCENARIOS.END_CHATBOT);
                return;
            }

            // 부서 선택 -----------------------------------------------------
            const dept = (departments || []).find(
                (d) =>
                    d.name === text ||
                    `${d.leftLabel ?? ""}${d.leftLabel ? "|" : ""}${d.name}` === text
            );
            if (dept) {
                setSelectedDeptId(dept.id);
                pushBot({
                    message: `"${dept.name}" 부서 선택됨. 제출하실 서류 유형을 선택해주세요.`,
                });
                try {
                    const typesRes = await getDocTypesByDepartmentPublic(dept.id);
                    const normTypes = (typesRes || [])
                        .map(normDocType)
                        .filter((t) => t.id && t.name);
                    setDocTypes(normTypes);
                    pushBot(SCENARIOS.SELECT_TYPE(normTypes));
                } catch (e) {
                    console.error("[SELECT_DEPT] doc types load error:", e);
                    pushBot(SCENARIOS.SERVER_ERROR);
                }
                return;
            }

            // 문서 유형 선택 -------------------------------------------------
            const dt = (docTypes || []).find((t) => t.name === text);
            if (dt) {
                setSelectedDocType({ id: dt.id, name: dt.name });

                // 1) 필수항목
                let requiredFields = [];
                try {
                    const fields = await getRequiredFields(dt.id);
                    requiredFields = (fields || []).map(normRequiredField);
                } catch (e) {
                    console.warn("[required-fields] load failed", e);
                }

                // 2) 마감일 체크
                try {
                    const dl = await getDeadline(dt.id); // {deadline: "..."} | string | null
                    const deadlineStr = typeof dl === "string" ? dl : dl?.deadline;
                    setDeadlineInfo(deadlineStr ? { deadline: deadlineStr } : null);

                    if (deadlineStr && isExpired(deadlineStr)) {
                        pushBot(SCENARIOS.DEADLINE_EXPIRED(deadlineStr));
                        return; // 업로드 차단
                    }
                    if (deadlineStr) {
                        pushBot(SCENARIOS.DEADLINE_VALID(deadlineStr));
                    }
                } catch (e) {
                    console.warn("[deadline] fetch failed (무시하고 진행)", e);
                }

                // 3) 업로드 프롬프트
                pushBot(SCENARIOS.FORM_AND_FILE_PROMPT(requiredFields));
                return;
            }
        },
        [departments, docTypes, resetToDeptSelect, pushUser, pushBot]
    );

    const handleFileUpload = useCallback(
        async (file) => {
            if (!file) return;
            if (!selectedDocType?.id) {
                pushBot({ message: "문서 유형을 먼저 선택해주세요.", uploadEnabled: false });
                return;
            }
            if (deadlineInfo?.deadline && isExpired(deadlineInfo.deadline)) {
                pushBot(SCENARIOS.DEADLINE_EXPIRED(deadlineInfo.deadline));
                return;
            }

            // 업로드 진행
            pushUser(`📎 ${file.name}`);
            pushBot(SCENARIOS.FILE_UPLOADED_PROCESSING);

            try {
                const created = await createSubmission({
                    docTypeId: selectedDocType.id,
                    fieldsJson: "[]",
                    file,
                });

                const submissionId = created?.submissionId;
                if (!submissionId) throw new Error("submissionId 없음");

                // 상태 폴링 (8분 타임아웃, 5s → +5s 증가, 최대 30s)
                const summary = await pollUntilDone(getSubmissionSummary, submissionId, {
                    initialDelayMs: 5000,
                    stepMs: 5000,
                    maxDelayMs: 30000,
                    timeoutMs: 8 * 60 * 1000,
                });

                if (!summary) throw new Error("결과 조회 실패");

                // 타임아웃 또는 여전히 BOT_REVIEW 인 경우
                if (summary.status === STATUS.BOT_REVIEW) {
                    pushBot({
                        message:
                            "OCR 검사 중입니다. 시간이 조금 더 걸리고 있어요.\n'서류 제출 현황'에서 결과를 확인하세요.",
                    });
                    return;
                }

                // 결과 문구
                if (
                    summary.status === STATUS.NEEDS_FIX ||
                    summary.status === STATUS.REJECTED
                ) {
                    const reasonLines = await fetchReviewReasons(submissionId);
                    const reasonText = reasonLines.length
                        ? `\n- ${reasonLines.join("\n- ")}`
                        : "";
                    pushBot({
                        message: `자동 검토 실패: ${reasonText || "(사유 미기재)"}`,
                    });
                } else {
                    pushBot({ message: "자동 검토 통과, 관리자 검토 대기" });
                }
            } catch (err) {
                const msg = pickErrorMessage(err, "업로드에 실패했습니다.");
                if (msg.includes("마감일")) {
                    pushBot(
                        SCENARIOS.DEADLINE_EXPIRED(deadlineInfo?.deadline ?? "마감")
                    );
                } else {
                    pushBot({ message: `자동 검토 실패: ${msg}` });
                }
            }
        },
        [selectedDocType, deadlineInfo, pushUser, pushBot]
    );

    return { chatHistory, handleUserInput, handleFileUpload };
}
