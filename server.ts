import express from "express";
import path from "path";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import * as _pdf from "pdf-parse";

const pdf = (_pdf as any).default || _pdf;

dotenv.config();

// Gemini 클라이언트 초기화
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "",
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON 및 URL-인코딩 분석 미들웨어
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // multer 설정 (메모리 스토리지)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 21 * 1024 * 1024 }, // 최대 21MB
  });

  // API가 준비동작 중인지 유효성 검사하는   // PDF 파일 업로드 및 Gemini 기반 세특/루브릭 분석 라우트
  app.post("/api/analyze", upload.single("file"), async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY가 서버 환경설정에 존재하지 않습니다." });
      }

      if (!req.file) {
        return res.status(400).json({ error: "업로드된 파일이 없습니다." });
      }

      const fileBuffer = req.file.buffer;
      const fileName = req.file.originalname;

      // 성취 기준 파싱 (FormData로 전송된 JSON 또는 단일 문자열 안전 파싱)
      let achievementStandards: string[] = [];
      if (req.body.achievementStandards) {
        try {
          const parsed = JSON.parse(req.body.achievementStandards);
          if (Array.isArray(parsed)) {
            achievementStandards = parsed.map(s => String(s).trim()).filter(Boolean);
          } else if (typeof req.body.achievementStandards === "string") {
            achievementStandards = [req.body.achievementStandards.trim()];
          }
        } catch (e) {
          if (typeof req.body.achievementStandards === "string") {
            achievementStandards = [req.body.achievementStandards.trim()];
          }
        }
      }

      // 1. pdf-parse를 통해 PDF 원문 텍스트 선행 추출 시도 (가장 경제적이고 안전한 네트워크 전송 기법)
      let extractedText = "";
      let pdfParseSuccess = false;
      try {
        const pdfData = await pdf(fileBuffer);
        extractedText = pdfData.text || "";
        if (extractedText.trim().length > 10) {
          pdfParseSuccess = true;
        }
      } catch (pdfErr) {
        console.warn("pdf-parse 실패, Gemini 직접 전달 방식으로 전환:", pdfErr);
      }

      // 2. 입력 데이터 파트 빌드 (추출 성공 시 텍스트 파트 전달, 실패 시 inlineData base64로 폴백)
      const contentsParts: any[] = [];
      if (pdfParseSuccess) {
        contentsParts.push({
          text: `[학생 활동 자료 및 탐구 에세이 원본 텍스트 추출본]\n\n${extractedText}`
        });
      } else {
        contentsParts.push({
          inlineData: {
            mimeType: "application/pdf",
            data: fileBuffer.toString("base64")
          }
        });
      }

      // 성취 기준 지침 생성
      let standardsInstruction = "";
      if (achievementStandards.length > 0) {
        standardsInstruction = `
[교사 제시 성취 기준 분석 지침]
교사가 입력한 아래의 [성취 기준]들에 반드시 의거하여 학생의 탐구 활동 수준을 분석하고 평가하십시오:
${achievementStandards.map((std, i) => `- 성취 기준 ${i + 1}: ${std}`).join("\n")}

위 성취 기준을 준수하여:
1) 'seteuk'(개인별 세특 초안) 텍스트를 작성할 때, 학생이 제시된 성취 기준들을 구체적으로 어떻게 달성하고 만족시켰는지 그 과정과 깊이(학업적 열의, 논리성, 가치 내재화 등)를 본문 내용에 자연스럽게 엮어 구체적으로 명시하십시오.
2) 루브릭 지표 및 피드백 평가 시에도, 제시된 교과 성취 기준 수준에 학생의 수행물이 잘 부합하는지 여부(충족 수준)를 평가 근거와 이유(reason)에 연결하여 신뢰할 수 있게 서술해 주십시오.
`;
      }

      // Gemini API 호출을 위한 프롬프트 작성 (바칼로레아 한정된 조건에서 일반적인 모든 교과 탐구 및 학교 활동 평가용으로 전환)
      const systemInstruction = `
Your task is to analyze a high school student's activity reports, essays, or classroom work drafts and draft an evaluation feedback report based on specific educational achievement standards.
당신은 고등학교 생기부(학교생활기록부) 작성 보조 및 교육과정 성취 평가 전문가입니다.
첨부된 학생 탐구 활동 원문 자료를 철저히 분석하여, 해당 학생만을 위한 '개인별 교과 세부능력 및 특기사항(세특)' 초안을 작성하고, 평가 루브릭 기반 진단과 교육적인 개별 피드백을 제공해 주세요.

${standardsInstruction}

[작성 및 분석 지침]
1. 원문에서 추출할 메타 정보 지정 및 개인정보 보호 조치 (가명/마스킹 필수):
   - 학생 이름: 본문에서 추정되거나 기재되어 있는 이름을 반드시 추출하고, 학생 개인정보 보호를 위해 즉시 가명화 또는 마스킹(예: '김동현' -> '김*현', '이서윤' -> '이*윤') 조치하십시오. 생성해서 반환하는 모든 필드(예: studentName, seteuk 및 extractedTextSample 전체)에서도 실명이 절대 그대로 노출되지 않도록 가명 혹은 마스킹 처리를 엄격히 준수하십시오.

2. '개인별 교과 세부능력 및 특기사항(세특)' 작성 규칙 (중요):
   - 기재 분량: 한글 1자=3바이트, 공백/숫자/영문=1바이트, 줄바꿈=1바이트 기준으로 환산하였을 때 전체 세특 텍스트가 정확히 **1500바이트 이상 2100바이트 이하 (공백 포함 약 500자~700자)**가 되도록 분량을 보장해 주십시오. (절대 너무 짧거나 2100바이트를 초과하지 않아야 합니다.)
   - 종결 어미: 모든 문장은 교사가 직접 관찰한 내용이 드러나도록 구성하고, 마지막 종결 형태는 **반드시 명사형 어미(예: '~함.', '~임.', '~배움.', '~분석함.', '~돋보임.')**로 끝나야 합니다. '~하였다' 또는 단순 사실 나열이 아닌, 학생의 실질적인 성장을 보여주는 교사의 서술형 관찰로 작성해야 합니다.
   - 단어 제한: "영어(English)", "Extended Essay"(또는 EE), "3000자(내외)" 등의 에세이 작성 분량이나 언어와 직접적으로 상호작용하는 영문 명칭, 단순 에세이 분량 등의 성적 유발/외부 사교육 연상 용어는 세특 내용에 절대 기재하지 마십시오.
   - 윤리 준수: 소논문 이라는 용어, 대학교수 연계, 사설 기관 언급을 일절 비기재해야 합니다. 철저히 학교 교육과정 혹은 교사의 지도 하에 자율적으로 이루어진 탐구활동으로 묘사하십시오.

3. 평가 루브릭 진단 (가이드라인을 엄격히 준수할 것):
   네 가지 핵심 지표에 대해 '우수' / '보통' / '미흡' 중 하나로 판정하고 교사가 이해할 수 있는 구체적인 이유를 제시하십시오. 제시된 교과 성취 기준이 있을 경우, 각 지표별 평가 이유에 성취 기준 충족 현황을 함께 유기적으로 기술해 주십시오.
   (1) 주제 설정 및 선행 탐구 (주제 명확성과 선행 활용도)
   (2) 비판적 분석 및 맥락 이해 (구조적 원인과 거시적 이해도)
   (3) 논증 및 해결 대안 (해결책의 실현 가능성과 거시성)
   (4) 연구 윤리 및 에세이 형식 (구조의 긴밀성과 형식 준수성)

4. 피드백 작성 규칙 (정답 양식 준수):
   - 칭찬 포인트: 학생이 선정한 주제나 탐구 활동 중 참신하고 깊이 있는 시각에서 성취 기준을 성실히 이행했거나 학업 역량이 돋보이는 부분을 포착하여 서술하십시오.
   - 성장 포인트: 해결 방안이 '개인의 실전이나 도덕적 노력(예: 분리수거 잘하기, 투표 참여)'에 머물러 있다면, 법률, 국가적 제도, 정책적 대안, 사회적 구조 변화 등 '거시적 관점' 또는 학술적/사회적 원리 탐색으로 지평을 넓힐 수 있도록 본질적이고 교육적인 유도 질문을 구체적으로 제시하십시오.
   - 형식 검토: 탐구 내용이 수동적 단순 요약이나 나열식인지, 아니면 자신의 언어로 완전히 융합되어 주도적으로 서술되었는지를 정밀하게 짚어 피드백하십시오.

5. JSON 포맷 규격 제한 사항 (초필수):
   - 반환되는 결과는 반드시 규격에 맞는 유효하고 표준적인 JSON 정보여야 합니다.
   - 모든 JSON Object 속성 Key(키)와 String Value(문자열 값)는 절대로 작은따옴표나 백틱을 사용하지 말고, 무조건 표준 큰따옴표(쌍따옴표)로 감싸서 묶어야 합니다.
`;

      const userMessage = `
첨부된 고등학교 학생의 탐구 보고서 혹은 활동지 PDF 자료를 분석해 주십시오.
파일명: ${fileName}

위 첨부물의 핵심 내용을 정밀 분석하여 학업 역량과 주도성에 대한 세특용 서술 및 학술적 평가 피드백서를 아래의 JSON 구조로 생성해야 합니다.
반드시 학생의 모든 텍스트에 대해 비식별화(예: '김동현' -> '김*현') 완료 상태의 이름과 샘플 원문을 보내주어야 합니다.

[주의 사항]
반환될 데이터는 절대 코드 블록 표시기가 없이 오직 순수한 JSON 문자열이어야 합니다.
JSON 내부의 모든 객체 Key(키명)와 모든 String 타입 Value(값)는 반드시 표준 규칙인 큰따옴표(쌍따옴표)만을 사용하여 감싸져야 합니다.
`;

      // structured JSON Response API 호출
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              ...contentsParts,
              { text: userMessage }
            ]
          }
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              studentName: { type: Type.STRING, description: "학생의 이름으로, 반드시 성 외 부분을 마스킹 처리하여 반환 (예: 김*현, 이*윤)" },
              summary: { type: Type.STRING, description: "학생이 작성한 보고서 또는 활동 자료의 전체 탐구 활동 내용을 2~3문장(공백 포함 200자 내외)으로 명확하게 요약한 한글 요약문" },
              extractedTextSample: { type: Type.STRING, description: "PDF 원문 본문 내의 핵심 서론/연구의도 부분을 일부 발췌하고 비식별화(이름 마스킹 필수)하여 600자 내외로 복원한 원문 설명글" },
              seteuk: { type: Type.STRING, description: "명사형 종결 어미를 지키고 1500~2100 바이트 분량(공백 포함 한글 약 500자 ~ 680자 내외)으로 교사가 학생을 관찰하여 서술한 개인별 세특 텍스트" },
              rubrics: {
                type: Type.OBJECT,
                properties: {
                  subjectSelection: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.STRING, enum: ["우수", "보통", "미흡"] },
                      reason: { type: Type.STRING, description: "주제 설정 및 선행 탐구 평가 이유" }
                    },
                    required: ["score", "reason"]
                  },
                  criticalAnalysis: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.STRING, enum: ["우수", "보통", "미흡"] },
                      reason: { type: Type.STRING, description: "비판적 분석 및 맥락 이해 평가 이유" }
                    },
                    required: ["score", "reason"]
                  },
                  argumentAndAlternative: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.STRING, enum: ["우수", "보통", "미흡"] },
                      reason: { type: Type.STRING, description: "논증 및 해결 대안 평가 이유" }
                    },
                    required: ["score", "reason"]
                  },
                  ethicsAndFormat: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.STRING, enum: ["우수", "보통", "미흡"] },
                      reason: { type: Type.STRING, description: "연구 윤리 및 에세이 형식 평가 이유" }
                    },
                    required: ["score", "reason"]
                  }
                },
                required: ["subjectSelection", "criticalAnalysis", "argumentAndAlternative", "ethicsAndFormat"]
              },
              feedbacks: {
                type: Type.OBJECT,
                properties: {
                  compliment: { type: Type.STRING, description: "활동의 독창성과 참신함에 대한 칭찬" },
                  growth: { type: Type.STRING, description: "해결책을 거시적 정책/제도/이론으로 시선을 넓히게 돕는 성장 권유 명확한 질문" },
                  formatReview: { type: Type.STRING, description: "참고자료나 독서 내용이 단순 복사 붙여넣기 수준인지 자신만의 언어로 분석해서 수용한 정도에 대한 점검 의견" }
                },
                required: ["compliment", "growth", "formatReview"]
              }
            },
            required: ["studentName", "summary", "extractedTextSample", "seteuk", "rubrics", "feedbacks"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini로부터 빈 응답을 받았습니다.");
      }

      // Markdown 코드 블록 등 유효하지 않은 포맷 방지 전처리 및 안전한 curly brace 추출
      let cleanText = responseText.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      }
      const firstCurly = cleanText.indexOf("{");
      const lastCurly = cleanText.lastIndexOf("}");
      if (firstCurly !== -1 && lastCurly !== -1 && lastCurly > firstCurly) {
        cleanText = cleanText.substring(firstCurly, lastCurly + 1);
      }

      const aiData = JSON.parse(cleanText);

      // 바이트 연산 헬퍼 (한글 3바이트, 영문/공백/숫자 1바이트, 엔터 1바이트)
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

      const finalBytesCount = computeBytes(aiData.seteuk || "");

      // 마스킹 보정 헬퍼 (AI가 누락했을 경우 대비 안전 보조장치)
      const applyMasking = (name: string): string => {
        if (!name) return "김*현";
        const trimmed = name.trim();
        if (trimmed.length <= 1) return trimmed;
        if (trimmed.length === 2) return trimmed.charAt(0) + "*";
        return trimmed.charAt(0) + "*".repeat(trimmed.length - 2) + trimmed.charAt(trimmed.length - 1);
      };

      const originalName = aiData.studentName || "김동현";
      const maskedName = originalName.includes("*") ? originalName : applyMasking(originalName);

      const result = {
        id: Math.random().toString(36).substring(2, 11),
        fileName,
        parsedText: aiData.extractedTextSample || "원본 자료 분석이 완수되었습니다. (개인정보보호 마스킹 처리완료)",
        studentName: maskedName,
        originalSeteuk: aiData.seteuk || "",
        seteuk: aiData.seteuk || "",
        rubrics: aiData.rubrics,
        feedbacks: aiData.feedbacks,
        byteCount: finalBytesCount,
        summary: aiData.summary || "",
      };

      return res.json(result);
    } catch (error) {
      console.error("분석 에러:", error);
      return res.status(500).json({ error: "학생 활동 자료 분석 중 오류가 발생했습니다. " + (error instanceof Error ? error.message : String(error)) });
    }
  });

  // Vite 미들웨어 및 정적 리소스 서빙 비동기 설정
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 글로벌 예외 핸들러 (서버 내부 에러 시 HTML 대신 안전한 JSON 에러 응답 강제)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("글로벌 서버 예외 발생:", err);
    res.status(500).json({
      error: "서버 내부 처리 중 예기치 못한 에러가 발생했습니다.",
      details: err instanceof Error ? err.message : String(err)
    });
  });

  // 서버 기동
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] 생기부 세특 분석 및 작성기 서버가 포트 ${PORT}에서 실행 중입니다.`);
  });
}

startServer().catch((err) => {
  console.error("서버 초기화 실패:", err);
});
