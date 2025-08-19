// src/hooks/useChatScenario.js
import { useState, useRef, useEffect } from "react";
import api from "../api/api";
import { SCENARIOS, STATUS } from "../utils/scenarioConstants";

export default function useChatScenario() {
    // 대화 히스토리
    const [chatHistory, setChatHistory] = useState([
        { from: "bot", message: SCENARIOS.INIT.message, options: SCENARIOS.INIT.options },
    ]);
    const [currentStep, setCurrentStep] = useState("INIT");

    const [selected, setSelected] = useState({
        deptId: undefined,
        deptName: undefined,
        docTypeId: undefined,
        docTypeName: undefined,
        submissionId: undefined,
    });

    const [requiredFields, setRequiredFields] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [docTypes, setDocTypes] = useState([]);

    // 언마운트 가드
    const aliveRef = useRef(true);
    useEffect(() => {
        aliveRef.current = true;
        return () => {
            aliveRef.current = false;
        };
    }, []);

    const appendMessage = (msg) => setChatHistory((prev) => [...prev, msg]);

    // 공통 에러 메시지
    const showServerError = (e) => {
        const reason = e?.response?.data?.message || e?.message || "알 수 없는 오류";
        const step = SCENARIOS.UPLOAD_FAILED(reason);
        appendMessage({ from: "bot", message: step.message, uploadEnabled: step.uploadEnabled });
    };

    // 상태 폴링
    const pollStatus = async (submissionId, { tries = 10, interval = 2000 } = {}) => {
        for (let i = 0; i < tries && aliveRef.current; i++) {
            await new Promise((r) => setTimeout(r, interval));
            try {
                const { data: st } = await api.get(`/api/submissions/${submissionId}`);
                const status = st?.status;
                if (!status) continue;

                if (status === STATUS.NEEDS_FIX) {
                    setCurrentStep("FEEDBACK");
                    const failed = st.botFindings || st.feedback || [];
                    const step = SCENARIOS.BOT_FEEDBACK_FAIL(failed);
                    appendMessage({ from: "bot", message: step.message, options: step.options });
                    return;
                }

                if (status === STATUS.SUBMITTED || status === STATUS.UNDER_REVIEW) {
                    setCurrentStep("BOT_FEEDBACK_PASS");
                    appendMessage({ from: "bot", message: SCENARIOS.BOT_FEEDBACK_PASS.message });
                    return;
                }
            } catch {
                // 단발성 오류 무시
            }
        }
        if (aliveRef.current) {
            appendMessage({ from: "bot", message: "검토가 지연되고 있습니다. 잠시 후 다시 확인해주세요." });
        }
    };

    // 유저 입력 처리
    const handleUserInput = async (userMessage) => {
        appendMessage({ from: "user", message: userMessage });

        try {
            switch (currentStep) {
                // 초기 진입
                case "INIT": {
                    if (userMessage === "서류 제출") {
                        const { data } = await api.get("/api/departments");
                        setDepartments(data ?? []);
                        const step = SCENARIOS.SELECT_DEPT(data ?? []);
                        setCurrentStep("SELECT_DEPT");
                        appendMessage({
                            from: "bot",
                            message: step.message,
                            options: step.options,
                            searchable: step.searchable,
                        });
                    } else if (userMessage === "서류 제출 현황") {
                        setCurrentStep("CHECK_STATUS");
                        appendMessage({
                            from: "bot",
                            message: SCENARIOS.CHECK_STATUS.message,
                            options: SCENARIOS.CHECK_STATUS.options,
                            showList: true,
                        });
                    }
                    break;
                }

                // 부서 선택
                case "SELECT_DEPT": {
                    const dept =
                        departments.find((d) => userMessage.includes(d.name)) ||
                        departments.find((d) => d.name === userMessage);

                    if (!dept) {
                        appendMessage({ from: "bot", message: "해당 부서를 찾지 못했어요. 다시 선택해 주세요." });
                        break;
                    }

                    // 함수형 업데이트로 안전하게 병합
                    setSelected((prev) => ({
                        ...prev,
                        deptId: dept.id,
                        deptName: dept.name,
                    }));

                    // 부서별 서류 유형 로드
                    const { data: types } = await api.get(`/api/departments/${dept.id}/doc-types`);
                    setDocTypes(types ?? []);
                    const step = SCENARIOS.SELECT_TYPE(types ?? []);
                    setCurrentStep("SELECT_TYPE");
                    appendMessage({
                        from: "bot",
                        message: step.message,
                        options: step.options,
                        searchable: step.searchable,
                    });
                    break;
                }

                // 서류 유형 선택 → 마감 확인 → 필수항목 안내
                case "SELECT_TYPE": {
                    const chosen =
                        docTypes.find((t) => t.name === userMessage) ||
                        docTypes.find((t) => userMessage.includes(t.name));
                    if (!chosen) {
                        appendMessage({ from: "bot", message: "해당 서류 유형을 찾지 못했어요. 다시 선택해 주세요." });
                        break;
                    }

                    setSelected((prev) => ({
                        ...prev,
                        docTypeId: chosen.id,
                        docTypeName: chosen.name,
                    }));

                    setCurrentStep("CHECK_DEADLINE");
                    appendMessage({ from: "bot", message: SCENARIOS.CHECK_DEADLINE.message });

                    // 마감 확인
                    const { data: deadline } = await api.get(`/api/doc-types/${chosen.id}/deadline`);
                    if (deadline?.valid) {
                        appendMessage({
                            from: "bot",
                            message: SCENARIOS.DEADLINE_VALID(deadline.deadline).message,
                        });

                        // 필수항목 로드 + 업로드 프롬프트 전환
                        const { data: reqs } = await api.get(`/api/doc-types/${chosen.id}/required-fields`);
                        setRequiredFields(reqs ?? []);
                        const step = SCENARIOS.FORM_AND_FILE_PROMPT(reqs ?? []);
                        setCurrentStep("FORM_AND_FILE_PROMPT");
                        appendMessage({
                            from: "bot",
                            message: step.message,
                            uploadEnabled: step.uploadEnabled,
                            accepts: step.accepts,
                        });
                    } else {
                        setCurrentStep("DEADLINE_EXPIRED");
                        appendMessage(SCENARIOS.DEADLINE_EXPIRED(deadline?.deadline ?? "마감"));
                    }
                    break;
                }

                // 봇 피드백에서 재제출로 이동
                case "FEEDBACK": {
                    if (userMessage === "수정 후 다시 제출" || userMessage === "파일 수정 후 다시 제출") {
                        setCurrentStep("RESUBMIT_PROMPT");
                        const step = SCENARIOS.RESUBMIT_PROMPT;
                        appendMessage({
                            from: "bot",
                            message: step.message,
                            uploadEnabled: true,
                            options: step.options,
                            accepts: step.accepts,
                        });
                    }
                    break;
                }

                // 마감 만료에서 분기
                case "DEADLINE_EXPIRED": {
                    if (userMessage === "다른 서류 제출하기") {
                        const { data } = await api.get("/api/departments");
                        setDepartments(data ?? []);
                        const step = SCENARIOS.SELECT_DEPT(data ?? []);
                        setCurrentStep("SELECT_DEPT");
                        appendMessage({
                            from: "bot",
                            message: step.message,
                            options: step.options,
                            searchable: step.searchable,
                        });
                    } else {
                        reset();
                    }
                    break;
                }

                // 재제출 프롬프트에서 최종 제출 선택
                case "RESUBMIT_PROMPT": {
                    if (["제출", "바로 제출", "제출하기"].includes(userMessage)) {
                        setCurrentStep("FINAL_SUBMITTING");
                        appendMessage({ from: "bot", message: SCENARIOS.FINAL_SUBMITTING.message });
                        appendMessage({ from: "bot", message: SCENARIOS.FINAL_SUBMITTED.message });
                    }
                    break;
                }

                default:
                    break;
            }
        } catch (e) {
            showServerError(e);
        }
    };

    /**
     * 파일 업로드
     * - 최초 제출: POST /api/submissions
     * - 재제출(덮어쓰기): PUT /api/submissions/{id}
     * @param {File} file 업로드 파일
     * @param {Object} formValues 필수항목 입력값(JSON)
     */
    const handleFileUpload = async (file, formValues = {}) => {
        appendMessage({ from: "user", message: `${file.name} 파일을 업로드했습니다.` });

        const processing = SCENARIOS.FILE_UPLOADED_PROCESSING;
        setCurrentStep("FILE_UPLOADED_PROCESSING");
        appendMessage({ from: "bot", message: processing.message, systemProcessing: processing.systemProcessing });

        try {
            const form = new FormData();
            if (selected.docTypeId) form.append("docTypeId", selected.docTypeId);
            form.append("fieldsJson", JSON.stringify(formValues || {}));
            form.append("file", file);

            // 최초/재제출 분기
            let res;
            if (currentStep === "RESUBMIT_PROMPT" && selected.submissionId) {
                res = await api.put(`/api/submissions/${selected.submissionId}`, form);
            } else {
                res = await api.post("/api/submissions", form);
            }

            const data = res.data || {};
            if (data.submissionId) {
                setSelected((prev) => ({ ...prev, submissionId: data.submissionId }));
            }

            if (
                data.status === STATUS.SUBMITTED ||
                data.status === STATUS.UNDER_REVIEW
            ) {
                setCurrentStep("BOT_FEEDBACK_PASS");
                appendMessage({ from: "bot", message: SCENARIOS.BOT_FEEDBACK_PASS.message });
            } else if (data.status === STATUS.NEEDS_FIX) {
                setCurrentStep("FEEDBACK");
                const failed = data.feedback || data.botFindings || [];
                const step = SCENARIOS.BOT_FEEDBACK_FAIL(failed);
                appendMessage({ from: "bot", message: step.message, options: step.options });
            } else if (data.status === STATUS.BOT_REVIEW) {
                appendMessage({ from: "bot", message: "자동 검토 중입니다. 잠시 후 상태가 갱신됩니다." });
                const sid = data.submissionId || selected.submissionId;
                if (sid) await pollStatus(sid);
            } else {
                appendMessage({ from: "bot", message: "제출이 접수되었습니다." });
            }
        } catch (e) {
            showServerError(e);
        }
    };

    const reset = () => {
        setChatHistory([{ from: "bot", message: SCENARIOS.INIT.message, options: SCENARIOS.INIT.options }]);
        setCurrentStep("INIT");
        setSelected({
                       deptId: undefined,
                       deptName: undefined,
                       docTypeId: undefined,
                       docTypeName: undefined,
                       submissionId: undefined,
                   });
        setRequiredFields([]);
        setDepartments([]);
        setDocTypes([]);
    };

    return {
        chatHistory,
        currentStep,
        handleUserInput,
        handleFileUpload,
        reset,
        selected,
        requiredFields,
    };
}
