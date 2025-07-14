import { useState } from "react";
import { SCENARIOS } from "../utils/scenarioConstants";

export default function useChatScenario() {
    const [chatHistory, setChatHistory] = useState([
        { from: "bot", message: SCENARIOS.INIT.message, options: SCENARIOS.INIT.options },
    ]);
    const [currentStep, setCurrentStep] = useState("INIT");

    // 유틸: 메시지 추가
    const appendMessage = (msg) => {
        setChatHistory((prev) => [...prev, msg]);
    };

    // 유저 응답 처리
    const handleUserInput = (userMessage) => {
        appendMessage({ from: "user", message: userMessage });

        switch (currentStep) {
            case "INIT":
                if (userMessage === "서류 제출") {
                    setCurrentStep("SELECT_DEPT");
                    appendMessage({
                        from: "bot",
                        message: SCENARIOS.SELECT_DEPT.message,
                        options: SCENARIOS.SELECT_DEPT.options,
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

            case "SELECT_DEPT":
                setCurrentStep("SELECT_TYPE");
                appendMessage({
                    from: "bot",
                    message: SCENARIOS.SELECT_TYPE.message,
                    options: SCENARIOS.SELECT_TYPE.options,
                });
                break;

            case "SELECT_TYPE":
                setCurrentStep("CHECK_DEADLINE");
                appendMessage({ from: "bot", message: SCENARIOS.CHECK_DEADLINE.message });

                // 예시: 제출 기한 검사 (하드코딩 예제)
                const isDeadlineValid = true;
                setTimeout(() => {
                    if (isDeadlineValid) {
                        setCurrentStep("FILE_UPLOAD_PROMPT");
                        appendMessage({ from: "bot", message: SCENARIOS.FILE_UPLOAD_PROMPT.message, uploadEnabled: true });
                    } else {
                        setCurrentStep("DEADLINE_EXPIRED");
                        appendMessage(SCENARIOS.DEADLINE_EXPIRED("2025-06-30"));
                    }
                }, 1000);
                break;

            case "FEEDBACK":
                if (userMessage === "파일 수정 후 다시 제출") {
                    setCurrentStep("FILE_RESUBMIT_PROMPT");
                    appendMessage({ from: "bot", message: SCENARIOS.FILE_RESUBMIT_PROMPT.message, uploadEnabled: true, options: SCENARIOS.FILE_RESUBMIT_PROMPT.options });
                }
                break;

            case "DEADLINE_EXPIRED":
                if (userMessage === "다른 서류 제출하기") {
                    setCurrentStep("SELECT_DEPT");
                    appendMessage({
                        from: "bot",
                        message: SCENARIOS.SELECT_DEPT.message,
                        options: SCENARIOS.SELECT_DEPT.options,
                    });
                } else {
                    reset();
                }
                break;
            case "FILE_RESUBMIT_PROMPT":
                if (userMessage === "제출") {
                    setCurrentStep("FINAL_SUBMISSION");
                    appendMessage({ from: "bot", message: SCENARIOS.FINAL_SUBMISSION.message });
                } else if (userMessage === "바로 제출") {
                    setCurrentStep("FINAL_SUBMISSION");
                    appendMessage({ from: "bot", message: SCENARIOS.FINAL_SUBMISSION.message });
                }
                break;

            default:
                break;


        }
    };

    // 파일 업로드 처리
    const handleFileUpload = (file) => {
        appendMessage({ from: "user", message: `${file.name} 파일을 업로드했습니다.` });

        setCurrentStep("FILE_UPLOADED");
        appendMessage({ from: "bot", message: SCENARIOS.FILE_UPLOADED.message });

        // GPT 기반 검수 예시 시뮬레이션
        setTimeout(() => {
            const missingItems = ["전공 관련 경험", "가계곤란 사유", "가족관계증명서"];
            setCurrentStep("FEEDBACK");
            appendMessage({
                from: "bot",
                ...SCENARIOS.FEEDBACK(missingItems),
            });
        }, 1500);
    };
    const reset = () => {
        setChatHistory([
            { from: "bot", message: SCENARIOS.INIT.message, options: SCENARIOS.INIT.options },
        ]);
        setCurrentStep("INIT");
    };

    return {
        chatHistory,
        currentStep,
        handleUserInput,
        handleFileUpload,
        reset,
    };
}
