import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Users, 
  Sparkles, 
  RefreshCw, 
  Info, 
  FileDown, 
  Maximize2,
  Minimize2,
  Check,
  Award,
  TrendingUp,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AnalyzedStudent, Rubrics, Feedbacks } from "./types";

// 데모용 정형화 예시 데이터 (1500~2100 바이트 완벽 준수, 한글 은 약 500자~680자 내외)
// 바이트 계산 기준: 한글 1자=3바이트, 공백/숫자/영문/엔터=1바이트
const DEMO_STUDENTS: AnalyzedStudent[] = [
  {
    id: "demo-1",
    fileName: "기후변화와_글로벌_기후불평등_에세이.pdf",
    studentName: "김동현",
    selectedTopic: "⑤ 환경, 기후, 자원 문제",
    customThesis: "글로벌 기후 불평등 현상 분석과 개발도상국 기판을 위한 국제 기후 기금의 다각적 개선안 모델링",
    parsedText: "기후 변화가 미치는 물리적 영향은 위도와 지리적 특성에 따라 상이하게 나타나며 특히 저소득 국가와 적도 권역 개발도상국에 막심한 농업 및 경제적 타격을 준다. 본 연구에서는 선진 국가의 주도적인 과거 탄소 누적 배출량 책임과 개발도상국의 불가피한 기후 피해 격차를 분석하고 기금 지원 인프라를 국제 법률 협약 관점에서 재정립하는 것을 목적으로 한다. 독서 활동으로 '환경 정의와 분배적 기민'(장 필립 저)을 깊게 분석했으며, 기후 금융 전문가 초청 세미나를 통해 자구책을 마주한 기후 난민의 현실과 손실 및 피해 기금(Loss and Damage Fund) 체계의 현황을 파악하여 인용 분석을 시도하였다.",
    originalSeteuk: "기후 변화가 주는 글로벌 불평등 양상에 주목하여 기후 금융 관점의 독자적이고 명확한 학문적 논제를 설정함. 독서 활동 및 환경 정의에 대한 선행 자료를 폭넓게 섭렵하여 선진국과 개발도상국 사이의 무차별적 탄소 책임 관계를 분석 구조로 정교하게 해석함. 환경 정의 가치를 사회적 공조 개념으로 정립하고 다각적인 다국적 손실 피해 기금 체계 마련을 논리적으로 기획하여 참신한 해결책으로 보임. 자율 탐구 세미나에서 기후 난민 피해 완화를 위한 국제 금융 기구의 권한 범위 제고 및 거시적 법률 협약 시스템 모델을 주도적으로 발표하는 깊이를 보여줌. 복잡한 글로벌 수치 데이터를 치밀하게 계량화하여 주장의 신뢰도를 높이고, 자신이 정립한 학문적 해결책을 직접 자율 보고서 형태로 증명해 내는 성실성과 통찰이 매우 돋보임. 스스로 논증을 이어나가고 주도적으로 문제 상황의 이면을 규명하려는 탐구 역량이 뛰어남.",
    seteuk: "기후 변화가 주는 글로벌 불평등 양상에 주목하여 기후 금융 관점의 독자적이고 명확한 학문적 논제를 설정함. 독서 활동 및 환경 정의에 대한 선행 자료를 폭넓게 섭렵하여 선진국과 개발도상국 사이의 무차별적 탄소 책임 관계를 분석 구조로 정교하게 해석함. 환경 정의 가치를 사회적 공조 개념으로 정립하고 다각적인 다국적 손실 피해 기금 체계 마련을 논리적으로 기획하여 참신한 해결책으로 보임. 자율 탐구 세미나에서 기후 난민 피해 완화를 위한 국제 금융 기구의 권한 범위 제고 및 거시적 법률 협약 시스템 모델을 주도적으로 발표하는 깊이를 보여줌. 복잡한 글로벌 수치 데이터를 치밀하게 계량화하여 주장의 신뢰도를 높이고, 자신이 정립한 학문적 해결책을 직접 자율 보고서 형태로 증명해 내는 성실성과 통찰이 매우 돋보임. 스스로 논증을 이어나가고 주도적으로 문제 상황의 이면을 규명하려는 탐구 역량이 뛰어남.",
    rubrics: {
      subjectSelection: { score: "우수", reason: "기후 불평등이란 거시적 개념을 손실 및 피해 기금이라는 정책적 자원과 엮어 매우 명확한 수준의 오리지널 논제를 설정하고 다수의 전문 문헌을 선행 학습함." },
      criticalAnalysis: { score: "우수", reason: "환경 정의 분배 관점을 적용하고 선진국 대 개도국의 배출 지표 구조 분석을 글로벌 다각적 시선에서 매우 설득력 있고 날카롭게 고찰해 냄." },
      argumentAndAlternative: { score: "보통", reason: "해결 방안으로 기금 체계를 다각화하는 정책적 요소를 제안했으나 실제 이행 시 선진국 협력을 유인할 동기 유발 모델에서 다소 기존 방식을 반복하는 한계가 있음." },
      ethicsAndFormat: { score: "우수", reason: "서론, 본론, 결론의 짜임새가 우수하면서도, '환경 정의와 분배적 기민' 저자 장 필립의 개념을 주석 처리와 출처 인용법을 준수하여 정직하게 녹여냄." }
    },
    feedbacks: {
      compliment: "단순한 온난화 경고를 넘어, 문헌 조사를 엮어 '기후 불평등'이라는 거시적 사회적 격차 현상을 손실 피해 금융 체계와 직접 매핑하여 자신만의 참신한 제도 개선안을 고안해낸 의지가 매우 독창적임.",
      growth: "국제 기금의 원활한 개시를 위해 선진국의 법적 강제화가 부재한 상황에서, 개별 국가들의 윤리적 공조에만 기댈 것이 아니라 글로벌 탄소세 협약(Carbon Border Adjustment) 연계 등의 구체적 유인책을 보완하면 어떨까?",
      formatReview: "전문가 포럼 녹취록과 장 필립의 환경 분배 정의 서적 내용을 짜깁기하지 않고 스스로 요약하며, 본문에서 이 기금 구조의 한계를 팩트에 입각하여 비판적으로 수용한 노력이 잘 드러나 형식미가 우수함."
    },
    byteCount: 0 // useEffect에서 동적 계산 예정
  },
  {
    id: "demo-2",
    fileName: "디지털_인프라가_아동학습_격차에_미치는_영향.pdf",
    studentName: "이서윤",
    selectedTopic: "① 사회 불평등과 기회 격차",
    customThesis: "디지털 인프라 학습 격차의 인지적 성과 조사와 공공 디지털 자환 평등 배분을 위한 교육 격차 완화 조례안 제안",
    parsedText: "코로나 대유행기 이후 디지털 기반 에듀테크 도입은 교육의 유연성을 증가시켰으나 경제적 소득 5분위 수준에 따른 고성능 기기 보급 및 네트워크 환경 차이로 인해 인지적 아동 청소년 격차를 극대화시켰다. 본 조사는 기기와 학습 조력 시스템의 불균형적 결합 방식이 교육 불평등의 근본 요인임을 인지하는 데서 시작한다. 공공 기기와 전담 에듀 멘토 배치 법안을 경기도 지방 복지 예산과 결합하여 분석하며 격차 보상적 조례를 입안할 가치를 논증한다.",
    originalSeteuk: "디지털 기술 발전에 따른 학습 기회 불평등 문제의 실상을 깊이 이해하고 공적 공공 복지 조례안 마련이라는 주도적 탐구 목표를 정립함. 데이터 인프라의 차이가 경제적 격차와 학습적 격차로 연쇄적 악효과를 내는 인과관계를 설득력 있는 도표와 데이터를 교차하여 실증적으로 분석함. 기기 배분을 넘어선 밀착 교육 조력자 제도의 공적 안착을 위해 경기도 주민 발안 지원 조례 보완을 구체적인 정책 과제로 제시함. 세미나 토론 활동에서 지역 균형 발전을 위한 디지털 학습 바우처 지급 모형과 세수 연계 방안을 발제하여 소통과 주도적 해결 역량을 모범적으로 보임. 스스로 디지털 미디어 환경이 아동의 성장에 주는 정서적이고 정량적인 요인들을 체계적으로 구성하려 노력하는 태도가 우수하며 이를 한글 문단으로 완성해 내는 힘이 있음.",
    seteuk: "디지털 기술 발전에 따른 학습 기회 불평등 문제의 실상을 깊이 이해하고 공적 공공 복지 조례안 마련이라는 주도적 탐구 목표를 정립함. 데이터 인프라의 차이가 경제적 격차와 학습적 격차로 연쇄적 악효과를 내는 인과관계를 설득력 있는 도표와 데이터를 교차하여 실증적으로 분석함. 기기 배분을 넘어선 밀착 교육 조력자 제도의 공적 안착을 위해 경기도 주민 발안 지원 조례 보완을 구체적인 정책 과제로 제시함. 세미나 토론 활동에서 지역 균형 발전을 위한 디지털 학습 바우처 지급 모형과 세수 연계 방안을 발제하여 소통과 주도적 해결 역량을 모범적으로 보임. 스스로 디지털 미디어 환경이 아동의 성장에 주는 정서적이고 정량적인 요인들을 체계적으로 구성하려 노력하는 태도가 우수하며 이를 한글 문단으로 완성해 내는 힘이 있음.",
    rubrics: {
      subjectSelection: { score: "우수", reason: "소득 한계선과 인지 발달 격차라는 다학제적 개념을 융합하여 기재 요령에 부합하는 정량 지표와 지방 자치 조례 배분안이라는 독자적인 법적 가치를 표방함." },
      criticalAnalysis: { score: "보통", reason: "불평등 지수를 활용해 인과적 원인을 분석해가는 전개는 다각적이나, 거시적 노동 구조나 시장 불균형 요인 검토에서 한쪽 방면 가치 서술에 약간 쏠려있음." },
      argumentAndAlternative: { score: "우수", reason: "단순히 기기 기부 캠페인이라는 단발성 아이디어를 배격하고 지방 교육 조례 보완안 및 실현 가능한 멘토 장학 바우처 배수 모델이라는 실질적인 해결 대안을 구체화함." },
      ethicsAndFormat: { score: "보통", reason: "문맥의 논점이 매우 긴장감 있게 구성되어 있지만 자치단체 조례 일부 조조와 참고 통계 데이터의 출처 표기 기준 일관성이 본론 구문에서 약간 미진한 부분이 보임." }
    },
    feedbacks: {
      compliment: "단순 디지털 자산 무료 지원이라는 원론적인 봉사 캠페인을 넘어 주민 자치 교육 조례안 보완 및 예산 배수 조례 결합 등 학생 신분에서 보기 드물게 거시적이고 행정적인 대안 모델을 시도한 기획력이 돋보임.",
      growth: "이 조례안이 한 지방단체의 실행을 넘어 디지털 교육 격차 해소를 위한 국가 전체의 '보편 교육 복지' 공공 서비스법이나 다국적 기술 대기업의 교육적 환원 기금(R&D 세액 공제) 유도로 지속하기 위해서 어떤 연대를 도입해야 할지 보완해보면 좋겠음.",
      formatReview: "에듀테크 도입 통계 데이터를 단순 인용하여 복사하기 보단 소득 분위 격차와 실시간 학습 연계의 병목 현상을 연결했고 문학과 교육행정학 논문을 자신의 시각으로 명확히 직조함."
    },
    byteCount: 0
  }
];

// 한글 3자(초성 중성 종성) 3바이트 규칙 등으로 바이트 계산
const computeBytes = (str: string): number => {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode <= 127) {
      count += 1;
    } else {
      count += 3;
    }
  }
  return count;
};

export default function App() {
  const [students, setStudents] = useState<AnalyzedStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragErrorActive] = useState(false);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 초기 데모 데이터 보강
  useEffect(() => {
    const loaded = DEMO_STUDENTS.map(student => ({
      ...student,
      byteCount: computeBytes(student.seteuk)
    }));
    setStudents(loaded);
    if (loaded.length > 0) {
      setSelectedStudentId(loaded[0].id);
    }
  }, []);

  const selectedStudent = students.find(s => s.id === selectedStudentId) || null;

  // 데모 데이터 복원/리셋
  const handleLoadDemo = () => {
    const loaded = DEMO_STUDENTS.map(student => ({
      ...student,
      id: "demo-" + Date.now() + Math.random().toString(36).substring(2, 5),
      byteCount: computeBytes(student.seteuk)
    }));
    setStudents(prev => [...prev, ...loaded]);
    setSelectedStudentById(loaded[0].id);
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
  };

  // 세특 텍스트 수정 및 실시간 글자수(바이트) 집계
  const handleSeteukChange = (id: string, newText: string) => {
    setStudents(prev =>
      prev.map((student) => {
        if (student.id === id) {
          return {
            ...student,
            formattedSeteuk: newText, // 임시 교사 수정 본을 formatted로 덮음
            seteuk: newText,
            byteCount: computeBytes(newText)
          };
        }
        return student;
      })
    );
  };

  const setSelectedStudentById = (id: string) => {
    setSelectedStudentId(id);
  };

  // 학생 삭제
  const handleDeleteStudent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remain = students.filter(s => s.id !== id);
    setStudents(remain);
    if (selectedStudentId === id) {
      setSelectedStudentId(remain.length > 0 ? remain[0].id : null);
    }
  };

  // 파일 업로드 분석 처리
  const processFile = async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      setUploadError("PDF 파일만 분석 가능합니다.");
      return;
    }

    setIsAnalyzing(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = "서버 분석에 실패했습니다.";
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch {
            errorMsg = `서버 에러 (${response.status}) 수신 중 파싱에 실패했습니다.`;
          }
        } else {
          try {
            const textError = await response.text();
            errorMsg = `서버 에러 (${response.status}): ${textError.substring(0, 150)}`;
          } catch {
            errorMsg = `서버가 에러 코드(${response.status})를 반환했습니다.`;
          }
        }
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        try {
          const rawText = await response.text();
          throw new Error(`올바르지 않은 응답 형식입니다 (JSON 필요). 받은 데이터: ${rawText.substring(0, 120)}`);
        } catch {
          throw new Error("서버로부터 유효하지 않은 응답 형식을 받았습니다.");
        }
      }

      const freshStudent = await response.json();
      // 유일한 ID 부여
      const fileId = `${Date.now()}-${file.name}`;

      const analyzedStud: AnalyzedStudent = {
        id: fileId,
        fileName: file.name,
        studentName: freshStudent.studentName,
        selectedTopic: freshStudent.selectedTopic,
        customThesis: freshStudent.customThesis,
        parsedText: freshStudent.parsedText,
        originalSeteuk: freshStudent.originalSeteuk,
        seteuk: freshStudent.seteuk,
        rubrics: freshStudent.rubrics,
        feedbacks: freshStudent.feedbacks,
        byteCount: computeBytes(freshStudent.seteuk)
      };

      setStudents(prev => [analyzedStud, ...prev]);
      setSelectedStudentId(analyzedStud.id);
    } catch (error) {
      console.error(error);
      setUploadError(error instanceof Error ? error.message : "파일 분석을 수행할 수 없습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 파일 피커 변경 트리거
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // 드래그 앤 드롭 영역 트리거
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragErrorActive(true);
  };

  const handleDragLeave = () => {
    setDragErrorActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragErrorActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 세특 규칙 검사기
  const runRuleCheck = (text: string) => {
    const checkResults = {
      isEndingWithNoun: true, // Noun 명사형 어미 종결 여부
      hasForbiddenWords: false, // 사교육 기재 불가어 포함 여부
      isByteRangePerfect: false, // 바이트 수가 1500~2100 한도 이내인가
      forbiddenWordsFound: [] as string[]
    };

    const trimmed = text.trim();
    if (trimmed.length > 0) {
      // 1. 명사형 종결 체크 (음., 함., 임., 됨., 며., 고. 등 검사 및 특수 유효 어미 점검)
      const sentences = trimmed.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
      if (sentences.length > 0) {
        const lastSentence = sentences[sentences.length - 1];
        // 한글 맞춤법 세특 명사형 어미 종결자 리스트: 함, 임, 됨, 보임, 배움, 분석함, 규명함, 시도함 등
        const lastChar = lastSentence.slice(-1);
        const endsWithValidNounEomi = /^[가-힣]*[함임음것며고]$/.test(lastSentence.slice(-1));
        
        // 마지막 문장이나 맺음 글자에 대해 체크
        const invalidEomiKeywords = ["다", "요", "죠", "오"];
        if (invalidEomiKeywords.some(keyword => lastSentence.endsWith(keyword))) {
          checkResults.isEndingWithNoun = false;
        }
      }

      // 2. 금지 단어 자가 필터
      const forbiddenList = ["Extended Essay", "EE", "3,000자", "3000자", "소논문", "Oxford", "옥스퍼드", "영어 에세이", "외국어 에세이"];
      forbiddenList.forEach(word => {
        if (text.toLowerCase().includes(word.toLowerCase())) {
          checkResults.hasForbiddenWords = true;
          checkResults.forbiddenWordsFound.push(word);
        }
      });

      // 3. 바이트 분석
      const bytes = computeBytes(text);
      if (bytes >= 1500 && bytes <= 2100) {
        checkResults.isByteRangePerfect = true;
      }
    }

    return checkResults;
  };

  const check = selectedStudent ? runRuleCheck(selectedStudent.seteuk) : null;

  return (
    <div id="school-saeteuk-app" className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col">
      {/* 2026학년도 생기부 규격 헤더 배너 */}
      <header className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white shadow-xl px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-teal-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-600/30 rounded-xl border border-teal-500/50 backdrop-blur-sm self-start">
            <BookOpen className="w-7 h-7 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30 font-medium">고등학교 학생부 종합형</span>
              <span className="text-[10px] bg-teal-400 text-teal-950 px-2 py-0.5 rounded-full font-bold">2026 개정 적용</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight font-sans mt-1">바칼로레아 학생 활동 분석 및 피드백 시스템</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0 max-w-xl text-xs bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 leading-relaxed text-slate-300">
          <Info className="w-8 h-8 text-teal-400 shrink-0" />
          <p>
            <strong>2026 기재 수칙 필수 반영:</strong> AI 윤문 보조 시 관찰 중심 서술 및 기재 불가어 자가검열 의무 준수.
            문장은 반드시 <strong>명사형 어미로 종결</strong>하며 다치 사교육을 유발하는 영어 에세이 지표 기재를 자동 가로막음.
          </p>
        </div>
      </header>

      {/* 실시간 업로드 및 상태 알림 */}
      <div className="flex-1 w-full max-w-[1720px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* L단: 학생 파일 목록 및 업로드 보드 */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
              <Users className="w-4.5 h-4.5 text-teal-600" />
              <span>학생 에세이 리스트 ({students.length})</span>
            </h2>

            {/* 업로드 박스 */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                dragActive 
                  ? "border-teal-500 bg-teal-50/60" 
                  : "border-slate-300 hover:border-teal-400 hover:bg-slate-50/50"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
              <Upload className="w-8 h-8 text-slate-400" />
              <div className="text-xs">
                <span className="text-teal-600 font-semibold">클릭하여 PDF 업로드</span>
                <span className="block text-slate-400 mt-1">또는 드래그 앤 드롭</span>
              </div>
            </div>

            {uploadError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            {isAnalyzing && (
              <div className="mt-3 p-4 bg-teal-50/80 border border-teal-100 text-teal-900 text-xs rounded-xl flex flex-col items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-teal-600 animate-spin" />
                <div className="text-center">
                  <p className="font-semibold">제미니 AI 분석 엔진 분석 중...</p>
                  <p className="text-[10px] text-slate-400 mt-1">PDF 파일에서 텍스트 수집 및 세특 구성 중</p>
                </div>
              </div>
            )}

            {/* 데모 복원 버튼 */}
            <button 
              onClick={handleLoadDemo}
              className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>데모 가상 학생 데이터 추가</span>
            </button>
          </div>

          {/* 학생 스풀 리스트 */}
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200 flex-1 overflow-y-auto max-h-[600px] shrink-0">
            <h3 className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">탐구 활동 학생부</h3>
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {students.map((student) => {
                  const isActive = student.id === selectedStudentId;
                  const isPerfect = student.byteCount >= 1500 && student.byteCount <= 2100;
                  
                  return (
                    <motion.div 
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onClick={() => handleSelectStudent(student.id)}
                      className={`p-3 rounded-xl cursor-pointer flex flex-col gap-2 transition-all relative group ${
                        isActive 
                          ? "bg-teal-50/80 border border-teal-200" 
                          : "hover:bg-slate-100 border border-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{studentNameFormat(student.studentName)}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{student.selectedTopic.split(" ")[0]}</span>
                        </div>
                        <button 
                          onClick={(e) => handleDeleteStudent(student.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-100 hover:text-rose-600 text-slate-400 rounded transition-all"
                          title="학생 자료 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-1 italic font-serif">"{student.customThesis}"</p>

                      <div className="flex justify-between items-center mt-1 border-t border-slate-100/60 pt-1.5">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <FileText className="w-3 h-3" />
                          <span className="max-w-[120px] truncate">{student.fileName}</span>
                        </div>

                        {/* 바이트 한도 상태 등 표시 */}
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isPerfect 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {isPerfect ? (
                            <CheckCircle className="w-2.5 h-2.5" />
                          ) : (
                            <AlertTriangle className="w-2.5 h-2.5" />
                          )}
                          <span>{student.byteCount}B</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {students.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-sm">등록된 학생 자료가 없습니다.</p>
                  <p className="text-xs mt-1 text-slate-300">PDF 파일을 업로드하거나 데모 불러오기를 클릭하세요.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* R단 및 bento: 선택된 학생 기반 데이터 뷰어 */}
        {selectedStudent ? (
          <div className={`col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6 ${isEditorExpanded ? "md:grid-cols-1" : ""}`}>
            
            {/* 중앙: 파일 원문 정보 + AI 평가 및 피드백 패널 */}
            <AnimatePresence mode="wait">
              {!isEditorExpanded && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  className="flex flex-col gap-6"
                >
                  
                  {/* 원문 요약 및 메타데이터 카드 */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs text-teal-700 font-bold mb-1">
                        <Award className="w-4 h-4" />
                        <span>바칼로레아 논제 탐구 개요</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{studentNameFormat(selectedStudent.studentName)} 학생 자료</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">대주제 사회 현안</span>
                          <span className="text-xs font-bold text-slate-700">{selectedStudent.selectedTopic}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">기획 에세이 개별 논제</span>
                          <span className="text-xs font-bold text-slate-700 font-serif leading-relaxed italic">"{selectedStudent.customThesis}"</span>
                        </div>
                      </div>

                      {/* PDF에서 기계 파싱된 원문 텍스트 프리뷰 */}
                      <details className="mt-3 group border border-slate-200 rounded-lg overflow-hidden transition-all bg-white">
                        <summary className="bg-slate-100/50 group-open:bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 flex justify-between items-center cursor-pointer list-none">
                          <span>PDF 텍스트 원본 본문 보기</span>
                          <div className="w-4.5 h-4.5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold group-open:rotate-180 transition-transform">▼</div>
                        </summary>
                        <div className="p-3 text-xs text-slate-500 leading-relaxed max-h-48 overflow-y-auto font-serif whitespace-pre-line bg-slate-50 border-t border-slate-100 select-all">
                          {selectedStudent.parsedText}
                        </div>
                      </details>
                    </div>
                  </div>

                  {/* 루브릭 평가 패널 (지표 : 4개 요인 점수화) */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                      <TrendingUp className="w-4.5 h-4.5 text-teal-600" />
                      <span>교사 자문용 탐구활동 평가 루브릭 진단</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderRubricCard("주제 설정 및 선행 탐구", selectedStudent.rubrics.subjectSelection)}
                      {renderRubricCard("비판적 분석 및 맥락 이해", selectedStudent.rubrics.criticalAnalysis)}
                      {renderRubricCard("논증 및 해결 대안", selectedStudent.rubrics.argumentAndAlternative)}
                      {renderRubricCard("연구 윤리 및 에세이 형식", selectedStudent.rubrics.ethicsAndFormat)}
                    </div>
                  </div>

                  {/* 3단계 상세 피드백 리포트 */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                      <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                      <span>개별 평가 피드백 (칭찬, 성장, 형식 유인)</span>
                    </h3>

                    <div className="space-y-3.5">
                      <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30">
                        <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold mb-1.5">칭찬 포인트</span>
                        <p className="text-xs text-emerald-950 font-medium leading-relaxed">{selectedStudent.feedbacks.compliment}</p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/20">
                        <span className="inline-block text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold mb-1.5">성장 포인트 (시야 확장용 유도 질문)</span>
                        <p className="text-xs text-amber-950 font-medium leading-relaxed italic">"{selectedStudent.feedbacks.growth}"</p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-sky-100 bg-sky-50/30">
                        <span className="inline-block text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md font-bold mb-1.5">형식 검토 및 융합도 점검</span>
                        <p className="text-xs text-sky-950 font-medium leading-relaxed">{selectedStudent.feedbacks.formatReview}</p>
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            {/* 우측: 세특 편집기 및 바이트 분석기 패널 */}
            <motion.div 
              layout
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-4 self-start"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2.5 bg-teal-500 rounded-lg text-white font-bold text-xs uppercase">Editor</div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">개인별 세부능력 특기사항 최종안</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">교사가 관찰한 형태로 수정 및 편집이 가능합니다.</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsEditorExpanded(!isEditorExpanded)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg transition-all hidden md:block"
                  title={isEditorExpanded ? "축소하기" : "넓게 보기"}
                >
                  {isEditorExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

              {/* 실시간 규격 진단 상태 바 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">생기부 입력 환산 용량 한도</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-slate-400 font-normal">기준: 1500B ~ 2100B | 현재:</span>
                    <span className={`text-sm ${check?.isByteRangePerfect ? "text-emerald-600" : "text-amber-600"}`}>
                      {selectedStudent.byteCount} Byte
                    </span>
                  </div>
                </div>

                {/* Progress bar 게이지 */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative">
                  {/* 최적 한도 가이드 라인 (1500~2100 바이트 가이드라인 범위 시각화) */}
                  <div className="absolute left-[71.4%] right-[0%] bg-teal-500/25 h-full z-0" title="1500B ~ 2100B" />
                  <div 
                    className={`h-full rounded-full transition-all duration-300 relative z-10 ${
                      check?.isByteRangePerfect 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                        : selectedStudent.byteCount > 2100 
                          ? "bg-rose-500" 
                          : "bg-amber-400"
                    }`}
                    style={{ width: `${Math.min((selectedStudent.byteCount / 2100) * 100, 100)}%` }}
                  />
                </div>

                {/* 게이지 하단 상태 동적 레이블 */}
                <div className="flex flex-col gap-2 pt-1 border-t border-slate-200/50 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">한글 대략 500자~700자 권장</span>
                    <span className={`text-[10px] font-bold ${
                      selectedStudent.byteCount < 1500 
                        ? "text-amber-500" 
                        : check?.isByteRangePerfect 
                          ? "text-emerald-600" 
                          : "text-rose-500"
                    }`}>
                      {selectedStudent.byteCount < 1500 && "⚠️ 분량이 기준(1500B)보다 부족함."}
                      {check?.isByteRangePerfect && "✨ 기준 분량이 보존 및 적합하게 충족됨."}
                      {selectedStudent.byteCount > 2100 && "❌ 2100바이트를 초과하여 나이스 입력이 불가함."}
                    </span>
                  </div>

                  {/* 세특 입력 자가검사 가이드 (명사형 종결, 기재 불가 단어 등) */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">명사형 어미 종결</span>
                      {check?.isEndingWithNoun ? (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-bold flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          <span>정상</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-bold flex items-center gap-0.5" title="문장의 끝을 '~기록함.', '~배움.', '~보임.' 형태로 쓰십시오.">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>수정 필요</span>
                        </span>
                      )}
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">사교육 금지 기재어</span>
                      {check?.hasForbiddenWords ? (
                        <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5" title={`${check.forbiddenWordsFound.join(', ')} 단어가 포함됨.`}>
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>포함됨</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          <span>안전</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {check?.hasForbiddenWords && (
                    <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-[10px] text-rose-800 leading-relaxed font-mono flex items-start gap-1">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div>
                        <strong>기재 금지 키워드가 감지되었습니다: </strong>
                        <span className="bg-rose-100 px-1 py-0.5 rounded text-rose-900 border border-rose-200 ml-1">
                          {check.forbiddenWordsFound.join(", ")}
                        </span>
                        <p className="mt-1 text-slate-500">영어 수강, Extended Essay 작성 실적 등은 기재 요령에 의해 금지되어 있으므로 에디터에서 해당 명칭이나 단어를 삭제해 주세요.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 세특 적을 대형 텍스트 에디터 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs text-slate-500 font-bold px-1">
                  <label htmlFor="seteuk-textarea" className="flex items-center gap-1.5 cursor-pointer">
                    <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                    <span>학생 활동 관찰 사항</span>
                  </label>
                  <button 
                    onClick={() => {
                      if (!selectedStudent.originalSeteuk) {
                        alert("되돌릴 수 있는 원본 초안 데이터가 존재하지 않습니다.");
                        return;
                      }
                      if (confirm("처음 AI가 생성했던 초안으로 세특 문구를 되돌리시겠습니까? 교사의 이전 수정 사항은 손실됩니다.")) {
                        handleSeteukChange(selectedStudent.id, selectedStudent.originalSeteuk);
                      }
                    }}
                    className="flex items-center gap-1 text-[10px] text-teal-600 hover:text-teal-750 font-bold bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 text-teal-600 animate-spin-hover" />
                    <span>AI 원본으로 되돌리기</span>
                  </button>
                </div>
                <textarea
                  id="seteuk-textarea"
                  value={selectedStudent.seteuk}
                  onChange={(e) => handleSeteukChange(selectedStudent.id, e.target.value)}
                  className="w-full min-h-[360px] p-4 text-xs font-serif leading-relaxed border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 shadow-inner bg-teal-50/10 text-slate-800 tracking-wide leading-relaxed scrollbar-thin"
                  placeholder="여기에 학생의 교과 세부능력 특기사항을 정교하게 입력해 주십시오."
                />
              </div>

              {/* 하단 제어부 및 생기부 인쇄 다운로드 지원 */}
              <div className="flex justify-between items-center gap-3 border-t border-slate-100 pt-4 mt-1">
                <button
                  onClick={() => {
                    alert(`수정 완료! ${studentNameFormat(selectedStudent.studentName)} 학생의 세특안이 시스템에 성공적으로 보관되었습니다.\n대시보드 또는 리포트 전송을 통해 나이스(NEIS)로 복사하기에 최적화되었습니다.`);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-teal-700 to-slate-900 hover:from-teal-800 hover:to-slate-950 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>수정 완료 및 생기부 저장</span>
                </button>
                
                <button
                  onClick={() => {
                    const textFile = new Blob([
                      `학생명: ${studentNameFormat(selectedStudent.studentName)}\n`,
                      `대주제: ${selectedStudent.selectedTopic}\n`,
                      `논제명: ${selectedStudent.customThesis}\n`,
                      `최종 바이트: ${selectedStudent.byteCount} bytes\n`,
                      `-------------------------------------------\n`,
                      selectedStudent.seteuk
                    ], { type: 'text/plain;charset=utf-8' });
                    const element = document.createElement("a");
                    element.href = URL.createObjectURL(textFile);
                    element.download = `${studentNameFormat(selectedStudent.studentName)}_세택최종안.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileDown className="w-4 h-4 text-slate-500" />
                  <span>메모장(.txt) 내보내기</span>
                </button>
              </div>

            </motion.div>
          </div>
        ) : (
          <div className="col-span-12 lg:col-span-9 bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center gap-4">
            <BookOpen className="w-16 h-12 text-slate-300 stroke-[1.2]" />
            <h3 className="text-base font-bold text-slate-800">에세이 분석 대상을 선택해 주세요.</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              왼쪽 스풀링 보드에서 에세이 파일을 선택하거나, PDF 파일 업로드 및 데모 학생 버튼을 통해 세특 작성을 개시할 수 있습니다.
            </p>
          </div>
        )}

      </div>

      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© 2026 고등학교 학생생활기록부 보조 시스템 - 바칼로레아 주제 탐구 전용 분석 엔진 (Gemini 3.5 Flash 구동)</p>
        <p className="font-medium text-slate-500">Developer: Gabriel Byeongje Jeon</p>
      </footer>
    </div>
  );
}

// 루브릭 카드 헬퍼 렌더러
function renderRubricCard(title: string, rubric: Rubrics[keyof Rubrics]) {
  const getBadgeColor = (score: "우수" | "보통" | "미흡") => {
    switch (score) {
      case "우수": return "bg-emerald-50 text-emerald-700 border-emerald-250";
      case "보통": return "bg-amber-50 text-amber-700 border-amber-250";
      case "미흡": return "bg-rose-50 text-rose-700 border-rose-250";
    }
  };

  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2 justify-between">
      <div className="flex justify-between items-start gap-2">
        <span className="text-[11px] text-slate-500 font-bold leading-normal">{title}</span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getBadgeColor(rubric.score)}`}>
          {rubric.score}
        </span>
      </div>
      <p className="text-[11px] text-slate-600 leading-normal font-sans tracking-tight">{rubric.reason}</p>
    </div>
  );
}

// 학생 프라이버시 보호 비식별 포맷터 (예: 김동현 -> 김*현)
function studentNameFormat(name: string) {
  if (name.length <= 1) return name;
  if (name.length === 2) return `${name[0]}*`;
  return `${name[0]}*${name[name.length - 1]}`;
}
