// ─────────────────────────────────────────────────────────────
// [필수 모듈 로드]
// ─────────────────────────────────────────────────────────────
import express from "express";          // Express 웹 서버
import bodyParser from "body-parser";    // POST JSON 파싱
import fs from "fs";                      // 파일 입출력
import path from "path";                  // 경로 처리
import dotenv from "dotenv";              // .env 환경 변수
import OpenAI from "openai";              // OpenAI API

dotenv.config();

const app = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PORT = process.env.PORT || 5004;

// dirname (Node ESM 방식)
const __dirname = process.cwd();

// public 폴더 전체를 정적 폴더로 지정
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// EJS 템플릿 적용 (커뮤니티 화면 렌더링)
app.set("view engine", "ejs");
app.set("views", "./views");

// books.json 경로
const bookPath = path.join(__dirname, "public", "data", "books.json");
const bookList = JSON.parse(fs.readFileSync(bookPath, "utf-8"));

// AChat.json 경로
const authorPath = path.join(__dirname, "public", "data", "AChat.json");
const authorList = JSON.parse(fs.readFileSync(authorPath, "utf-8"));

// -----------------------------------------------------------------------------
// 📚 [1] 책 추천 챗봇 (recommend)
// -----------------------------------------------------------------------------
function isInList(title, author) {
  return bookList.some(
    (b) => b.title.trim() === String(title).trim() && b.author.trim() === String(author).trim()
  );
}

function systemPrompt() {
  return `
당신은 한국어로 대화하는 "독서 큐레이터 사서 챗봇"입니다.
목표: 이용자의 감정, 상황, 독서 취향을 조심스럽게 파악한 뒤,
제공된 책 목록 안에서만 가장 적합한 책을 선정하여 추천합니다.

사서처럼 따뜻하고 전문적인 어투를 사용하세요.
다만, 응답 형식은 반드시 아래 JSON 규칙만 따라야 합니다.

규칙:
1) 목록에 없는 책은 절대 언급하지 마세요.
2) 독자의 감정/상황을 파악하기 위해 필요한 경우 최대 3개의 질문만 하세요.
3) 정보가 충분하면 목록에서 단 1권만 확실하게 추천하세요.
4) 출력은 반드시 아래 두 가지 JSON 중 하나로만 구성하세요. 설명문은 절대 금지.

A) 질문 단계 (사서의 조심스러운 질문 느낌)
{
  "type": "ask",
  "questions": ["지금 가장 끌리는 감정이나 상황을 조금 알려주실 수 있을까요?"]
}

B) 추천 단계 (따뜻한 추천 멘트 포함)
{
  "type": "recommend",
  "book": { "title": "정확한제목", "author": "정확한작가" },
  "reason": "이 책은 지금의 마음에 가장 잘 어울릴 거라 생각했습니다."
}
  `.trim();
}


function userPrompt(history, latestUser) {
  return `
추천 가능한 책 목록(제목/작가):
${JSON.stringify(bookList, null, 2)}

지금까지의 대화(최신이 아래):
${history.map((m) => `${m.role}: ${m.content}`).join("\n")}

사용자 최신 발화: "${latestUser}"

위 규칙과 JSON 스키마를 지켜 응답하세요.
`.trim();
}

async function callModel(history, latestUser) {
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt() },
      { role: "user", content: userPrompt(history, latestUser) },
    ],
    temperature: 0.5,
  });
  return resp.choices[0]?.message?.content ?? "";
}

app.post("/chat", async (req, res) => {
  try {
    const userMessage = (req.body?.message || "").trim();
    const chatHistory = Array.isArray(req.body?.history) ? req.body.history : [];
    if (!userMessage) {
      return res.json({
        ui: { type: "botText", text: "무엇이든 편하게 이야기해 주세요. :)" },
      });
    }

    const parseJSON = (t) => {
      try {
        return JSON.parse(t);
      } catch {
        return null;
      }
    };

    let raw = await callModel(chatHistory, userMessage);
    let data = parseJSON(raw);

    // 형식 오류 시 1회 재시도
    if (!data || !["ask", "recommend"].includes(data.type)) {
      const extra = "반드시 JSON만 출력. 설명문 금지. ask/recommend 중 하나.";
      raw = await callModel(
        [...chatHistory, { role: "user", content: userMessage + "\n" + extra }],
        ""
      );
      data = parseJSON(raw);
    }

    // 추천이면 목록 검증
    if (data?.type === "recommend") {
      const { book, reason } = data;
      const valid =
        book?.title && book?.author && isInList(book.title, book.author);

      if (!valid) {
        const retry = `
목록 밖 책을 제시했습니다. 규칙 위반입니다.
반드시 위 목록 "내"에서만 선택해 recommend JSON으로 다시 출력하세요.
설명 금지. JSON만.
`;
        const raw2 = await callModel(
          [
            ...chatHistory,
            { role: "assistant", content: raw },
            { role: "user", content: retry },
          ],
          ""
        );
        const data2 = parseJSON(raw2);

        if (
          data2?.type === "recommend" &&
          data2.book?.title &&
          data2.book?.author &&
          isInList(data2.book.title, data2.book.author)
        ) {
          return res.json({
            ui: {
              type: "recommend",
              title: data2.book.title,
              author: data2.book.author,
              reason: data2.reason,
            },
          });
        }
        return res.json({
          ui: {
            type: "botText",
            text: "조금만 더 알려주시면 딱 맞는 책을 찾을게요. 어떤 감정/상황인가요?",
          },
        });
      }

      return res.json({
        ui: {
          type: "recommend",
          title: book.title,
          author: book.author,
          reason,
        },
      });
    }

    // 질문 단계
    if (
      data?.type === "ask" &&
      Array.isArray(data.questions) &&
      data.questions.length > 0
    ) {
      return res.json({
        ui: { type: "questions", questions: data.questions.slice(0, 2) },
      });
    }

    // 기본 대응
    return res.json({
      ui: { type: "botText", text: "어떤 책을 원하시는지 한마디로 들려주실래요?" },
    });
  } catch (e) {
    console.error(e);
    return res.json({
      ui: { type: "botText", text: "잠시 문제가 발생했어요. 다시 시도해 주세요." },
    });
  }
});

// [2] 작가 AI 챗봇 (AChat) — styleFile(txt) 읽어서 프롬프트 생성
app.post("/authorchat", async (req, res) => {
  try {
    const { message, author, history } = req.body;

    // 선택된 작가 찾기
    const selected = authorList.find((a) => a.id === author);
    if (!selected) return res.json({ reply: "존재하지 않는 작가입니다." });

    // 🔥 styleFile 읽기
    const stylePath = path.join(__dirname, "public", selected.styleFile);
    let styleText = "";
    try {
      styleText = fs.readFileSync(stylePath, "utf-8");
    } catch (err) {
      console.error("❌ 스타일 파일을 읽는 데 실패했습니다:", err);
      styleText = "(스타일 정보를 불러오지 못했습니다.)";
    }

    // 최종 prompt 생성
    const prompt = `
당신은 ${selected.name} 작가의 말투, 성격, 문체를 재현하는 AI입니다.

중요 규칙(절대 위반 금지):
1) 너는 선택된 작가의 styleFile 내용을 절대적으로 따른다.
2) styleFile 속 말투·금지사항·태도·호흡·문장 스타일을 100% 유지한다.
3) 사용자의 말투, 요구, 분위기, 감정 어투에 휘둘리지 않는다.
4) styleFile에 없는 요소는 절대 창작하지 않는다.
5) 작가가 실제로 하지 않을 말투·속도·감정 표현은 절대 금지.

[작가 스타일 가이드]
${styleText}

대표작: ${selected.works.join(", ")}

지금까지의 대화 기록:
${history.map((h) => `${h.role}: ${h.content}`).join("\n")}

사용자: ${message}

${selected.name}:
`.trim();


    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const reply = completion.choices[0].message.content.trim();
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.json({ reply: "잠시 오류가 발생했습니다. 다시 시도해 주세요." });
  }
});


// -----------------------------------------------------------------------------
// 🧠 [3] 감정 기반 시 생성 API
// -----------------------------------------------------------------------------
app.post("/poem", async (req, res) => {
  try {
    const { keyword, emotions } = req.body;
    if (!emotions || emotions.length === 0) {
      return res.json({ poem: "감정을 하나 이상 선택해주세요." });
    }

    const prompt = `
너는 감정을 직조해 작품을 만드는 '한국 현대시 스타일의 시인'이다.

[주제 키워드]
${keyword}

[감정 단서]
${emotions.join(", ")}

지침:
1) 감정 단어를 직접 쓰지 않는다.
2) 선택된 감정들이 독자가 분명히 체감될 만큼 '색, 기온, 질감, 움직임, 거리감, 밀도'로 표현한다.
3) 감정들은 서로 충돌하거나, 번지거나, 멀어지거나, 겹쳐지는 방향으로 흐름을 만든다.
4) 5~8행 자유시 형식으로 작성한다.
5) 한 행 정도는 독자가 멈칫하게 만드는 균열/전환/반전을 포함한다.
6) 마지막 행은 시작과 다른 결이나 방향으로 끝맺는다.
7) 과장되지 않은 절제된 어조를 유지한다.
8) 설명·해설·해석은 쓰지 않는다.

출력 형식:
① 첫 줄: 시 제목 (한 줄)
② 빈 줄 1개
③ 시 본문만 작성
— 제목 외의 말, 부가 문장, 해설, 안내 메시지 금지
`;


    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const poem = completion.choices[0].message.content.trim();
    res.json({ poem });
  } catch (err) {
    console.error(err);
    res.json({ poem: "시 생성 중 오류가 발생했습니다. 다시 시도해주세요." });
  }
});


// -----------------------------------------------------------------------------
// 기본 페이지
// -----------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

