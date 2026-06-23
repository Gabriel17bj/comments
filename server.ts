import express from "express";
import path from "path";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

dotenv.config();

// Gemini 클라이언트 초기화 (사용자 에이전트 설정 포함)
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
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
    limits: { fileSize: 20 * 1024 * 1024 }, // 최대 20MB
  });

  // API가 준비동작 중인지 유효성 검사하는 헬스체크 라우트
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", hasApiKey: !!apiKey });
  });

  // PDF 파일 업로드 및 Gemini 기반 세특/루브릭 분석 라우트
  app.post("/api/analyze", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "업로드된 파일이 없습니다." });
      }

      const fileBuffer = req.file.buffer;
      const fileName = req.file.originalname;

      // PDF 텍스트 추출
      let parsedData;
      try {
        parsedData = await pdf(fileBuffer);
      } catch (parseError) {
        console.error("PDF 파싱 에러:", parseError);
        return res.status(422).json({ error: "PDF 파일에서 텍스트를 추출할 수 없습니다. 파일이 암호화되어 있거나 올바르지 않은 형식일 수 있습니다." });
      }

      const textContent = parsedData.text;

      if (!textContent || textContent.trim().length === 0) {
        return res.status(422).json({ error: "PDF 파일에 한글/영어 텍스트 내용이 존재하지 않습니다." });
      }

      // Gemini API 호출을 위한 프롬프트 작성
      const systemInstruction = `
당신은 고등학교 생기부(학교생활기록부) 작성 보조 및 교육과정 성취 평가 전문가입니다.
첨부된 원문 자료(학생이 주도적으로 수행한 바칼로레아 주제 탐구 에세이 등)를 철저히 분석하여, 해당 학생만을 위한 '개인별 교과 세부능력 및 특기사항(세특)' 초안을 작성하고, 평가 루브릭 기반 진단과 교육적인 개별 피드백을 제공해 주세요.

[작성 및 분석 지침]
1. 원문에서 추출할 메타 정보:
   - 학생 이름: 본문에서 추정할 수 있으면 이름을 추출하고, 없으면 '홍길동'으로 지정하십시오.
   - 선택 사회 현안: 다음 7개 대주제 중 에세이가 다룬 현안을 선택하십시오.
     ①사회 불평등과 기회 격차, ②인권, 다양성, 사회 통합, ③민주주의와 시민 참여, ④경제, 노동 구조 변화, ⑤환경, 기후, 자원 문제, ⑥과학기술과 사회 문제, ⑦보건, 사회 안전 문제
   - 학생 개별 논제: 학생이 스스로 설정하여 에세이에서 해결하려 한 실질적 논제 또는 주제입니다.

2. '개인별 교과 세부능력 및 특기사항(세특)' 작성 규칙 (중요):
   - 기재 분량: 한글 1자=3바이트, 공백/숫자/영문=1바이트, 줄바꿈=1바이트 기준으로 환산하였을 때 전체 세특 텍스트가 정확히 **1500바이트 이상 2100바이트 이하 (공백 포함 약 500자~700자)**가 되도록 분량을 보장해 주십시오. (절대 너무 짧거나 2100바이트를 초과하지 않아야 합니다.)
   - 종결 어미: 모든 문장은 교사가 직접 관찰한 내용이 드러나도록 구성하고, 마지막 종결 형태는 **반드시 명사형 어미(예: '~함.', '~임.', '~배움.', '~분석함.')**로 끝나야 합니다. '~하였다' 또는 단순 사실 나열이 아닌, 학생의 실질적인 성장을 보여주는 교사의 서술형 관찰로 작성해야 합니다.
   - 단어 제한: "영어(English)", "Extended Essay"(또는 EE), "3000자(내외)" 등의 에세이 작성 분량이나 언어와 직접적으로 상호작용하는 영문 명칭, 단순 에세이 분량 등의 성적 유발/외부 사교육 연상 용어는 세특 내용에 절대 기재하지 마십시오.
   - 윤리 준수: 소논문 이라는 용어, 대학교수 연계, 사설 기관 언급을 일절 비기재해야 합니다. 철저히 학교 교육과정 혹은 교사의 지도 하에 자율적으로 이루어진 탐구활동으로 묘사하십시오.

3. 평가 루브릭 진단 (가이드라인을 엄격히 준수할 것):
   네 가지 핵심 지표에 대해 '우수' / '보통' / '미흡' 중 하나로 판정하고 교사가 이해할 수 있는 구체적인 이유를 제시하십시오.
   (1) 주제 설정 및 선행 탐구 (주제 명확성과 선행 활용도)
   (2) 비판적 분석 및 맥락 이해 (구조적 원인과 거시적 이해도)
   (3) 논증 및 해결 대안 (해결책의 실현 가능성과 거시성)
   (4) 연구 윤리 및 에세이 형식 (구조의 긴밀성과 형식 준수성)

4. 피드백 작성 규칙 (정답 양식 준수):
   - 칭찬 포인트: 학생이 선정한 논제가 7개 현안 중 어떤 참신하고 개성적인 시각에서 다루어졌는지 포착하여 서술하십시오.
   - 성장 포인트: 해결 방안이 '개인의 실전이나 도덕적 노력(예: 분리수거 잘하기, 투표 참여)'에 머물러 있다면, 법률, 국가적 제도, 정책적 대안, 사회적 구조 변화 등 '거시적 관점'으로 지평을 넓힐 수 있도록 본질적이고 교육적인 유도 질문을 구체적으로 제시하십시오.
   - 형식 검토: 전문가 강의 내용과 독서 결과물이 에세이 내용 속에 단순히 나열식으로 기재된 것인지, 아니면 자신의 언어로 완전히 융합되어 주입되었는지를 정밀하게 짚어 피드백하십시오.
`;

      const userMessage = `
다음은 분석할 학생 탐구 활동 원문 텍스트입니다:
------------------------------------------
파일명: \${fileName}
본문내용:
\${textContent}
------------------------------------------
위 내용을 기재 요령 및 루브릭 기준에 맞춰 분석한 후, 반드시 다음 구조의 JSON 형태로만 답변을 생성해 주세요.
`;

      // structured JSON Response API 호출
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { role: "user", parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              studentName: { type: Type.STRING, description: "학생의 이름" },
              selectedTopic: { type: Type.STRING, description: "7개의 대주제 중 해당하는 한 가지" },
              customThesis: { type: Type.STRING, description: "학생이 다룬 구체적인 개별 논제" },
              seteuk: { type: Type.STRING, description: "명사형 종결 어미를 지키고 1500~2100 바이트 분량(공백 포함 은 한글 약 500~680자 내외)으로 교사가 학생을 관찰하여 서술한 개인별 세특 텍스트" },
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
                  compliment: { type: Type.STRING, description: "논제의 독창성과 참신함에 대한 칭찬 실마리" },
                  growth: { type: Type.STRING, description: "개인적 수준의 해결책을 거시적 정책/제도로 시선을 넓히게 돕는 성장 권유 질문" },
                  formatReview: { type: Type.STRING, description: "독서 및 강의 내용이 복사 붙여넣기 수준인지 자신만의 언어로 분석해서 수용한 정도에 대한 점검 의견" }
                },
                required: ["compliment", "growth", "formatReview"]
              }
            },
            required: ["studentName", "selectedTopic", "customThesis", "seteuk", "rubrics", "feedbacks"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini로부터 빈 응답을 받았습니다.");
      }

      const aiData = JSON.parse(responseText.trim());

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

      const result = {
        id: Math.random().toString(36).substring(2, 11),
        fileName,
        parsedText: textContent.substring(0, 1000) + (textContent.length > 1000 ? "... [이후 원문 생략]" : ""),
        studentName: aiData.studentName || "홍길동",
        selectedTopic: aiData.selectedTopic || "① 사회 불평등과 기회 격차",
        customThesis: aiData.customThesis || "지정된 논제가 없음",
        originalSeteuk: aiData.seteuk || "",
        seteuk: aiData.seteuk || "",
        rubrics: aiData.rubrics,
        feedbacks: aiData.feedbacks,
        byteCount: finalBytesCount,
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

  // 서버 기동
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] 생기부 세특 분석 및 작성기 서버가 포트 \${PORT}에서 실행 중입니다.`);
  });
}

startServer().catch((err) => {
  console.error("서버 초기화 실패:", err);
});
