export const SCENARIOS = {
    // ▶ 초기 인사 및 시작 옵션
    INIT: {
        message: "안녕하세요! 무엇을 도와드릴까요?",
        options: ["서류 제출", "서류 제출 현황"],
    },

    // ① 서류 제출 흐름
    // ▶ 부서 선택
    SELECT_DEPT: {
        message: "어느 부서에 서류를 제출하시나요?\n※ 메뉴는 검색 기능을 통해, 검색하실 수 있어요!",
        options: ["학적|학생지원과", "등록|재무과", "수업|학사지원과", "학생|학생과", "기타"],
        searchable: true,
    },
    // ▶ 서류 유형 선택
    SELECT_TYPE: {
        message: "제출하실 서류 유형을 선택해주세요.",
        options: ["장학금 신청서", "비교과 결과보고서", "교내 추천서"],
        searchable: true,
    },
    // ▶ 제출 기한 확인 (처리 중)
    CHECK_DEADLINE: {
        message: "제출 기한을 확인 중입니다...",
    },
    // ▶ 제출 기한 유효 (다음 단계로 진행)
    DEADLINE_VALID: {
        message: "제출 기한이 유효합니다. 다음 단계로 진행합니다.",
    },
    // ▶ 제출 기한 만료됨
    DEADLINE_EXPIRED: (date) => ({
        message: `이 서류의 제출 기한은 ${date}이었습니다.\n현재는 제출할 수 없습니다.`,
        options: ["다른 서류 제출하기", "챗봇 종료하기"],
    }),
    // ▶ 파일 업로드 요청
    FILE_UPLOAD_PROMPT: {
        message: "서류를 업로드해주세요. (PDF 또는 이미지 파일)",
        uploadEnabled: true,
    },
    // ▶ 업로드 완료 후 분석 안내
    FILE_UPLOADED: {
        message: "업로드가 완료되었습니다. 서류를 분석 중입니다...",
        systemProcessing: true,
    },
    // ▶ 업로드 실패
    UPLOAD_FAILED: {
        message: "제출에 실패했습니다!\n서류를 업로드를 다시 진행해주세요!",
        uploadEnabled: true,
    },
    // ▶ 서버 오류 (지속적인 문제)
    SERVER_ERROR: {
        message:
            "지속적인 오류가 발생하고 있습니다!\n문의 연락 이메일과 전화번호를 제시할게요!\n이메일:\n전화번호:",
    },
    // ▶ GPT 피드백: 누락 항목 알림
    FEEDBACK: (items) => ({
        message: `다음 항목이 누락되었습니다:\n- ${items.join("\n- ")}`,
        options: ["파일 수정 후 다시 제출"],
    }),
    // ▶ 수정 파일 재업로드 요청
    FILE_RESUBMIT_PROMPT: {
        message: "수정된 파일을 업로드해주세요.",
        uploadEnabled: true,
        options: ["제출", "바로 제출"],
    },
    // ▶ 최종 제출 완료
    FINAL_SUBMISSION: {
        message: "제출이 완료되었습니다. 행정 담당자가 곧 검토할 예정입니다.",
    },

    // ② 서류 제출 현황 흐름
    // ▶ 최근 제출 목록 보기
    CHECK_STATUS: {
        message: "최근 제출한 서류 목록입니다.",
        showList: true,
        options: ["전체 목록", "승인 완료", "반려", "검수 중"],
    },
    // ▶ 반려 사유 설명
    REJECTION_REASON: (reasons) => ({
        message: `해당 서류는 다음 이유로 반려되었습니다:\n- ${reasons.join("\n- ")}`,
        options: ["수정 후 재제출", "뒤로가기", "종료"],
    }),
    // ▶ 반려 파일 재제출
    RESUBMISSION_CONFIRM: {
        message: "수정된 파일을 업로드해주세요.",
        uploadEnabled: true,
        options: ["제출"],
    },
    // ▶ 제출 이력 상태 갱신 안내
    LINKED_HISTORY_UPDATED: {
        message: "기존 이력과 연결되어 상태가 '재검토 중'으로 갱신되었습니다.",
    },
    // ▶ 챗봇 종료 안내
    END_CHATBOT: {
        message: "이용해주셔서 감사합니다. 챗봇을 종료합니다!",
    },
    // ▶ 미지원 기능 안내
    UNSUPPORTED: {
        message: "아직 지원하지 않는 기능입니다. 다른 요청을 선택해주세요.",
        options: ["서류 제출", "서류 제출 현황"],
    },
};
