export interface RubricDetail {
  score: '우수' | '보통' | '미흡';
  reason: string;
}

export interface Rubrics {
  subjectSelection: RubricDetail;        // 주제 설정 및 선행 탐구
  criticalAnalysis: RubricDetail;        // 비판적 분석 및 맥락 이해
  argumentAndAlternative: RubricDetail;  // 논증 및 해결 대안
  ethicsAndFormat: RubricDetail;         // 연구 윤리 및 에세이 형식
}

export interface Feedbacks {
  compliment: string;   // 칭찬 포인트 (논제 참신함 및 독창성)
  growth: string;       // 성장 포인트 (미시적 노력을 거시적 정책/제도로 시야를 넓히는 질문 등)
  formatReview: string; // 형식 검토 (선행 연구, 독서, 전문가 강의 등이 본인의 언어로 녹아들었는지)
}

export interface AnalyzedStudent {
  id: string;
  fileName: string;
  studentName: string;
  selectedTopic: string; // 7개 대주제 중 하나
  customThesis: string;  // 학생 개별 논제
  parsedText: string;    // PDF 원문 파싱 내용
  originalSeteuk: string; // 최초 생성된 세특
  seteuk: string;         // 교사가 수정할 수 있는 현재 세특
  rubrics: Rubrics;
  feedbacks: Feedbacks;
  byteCount: number;
}
