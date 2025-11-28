// ==========================================================
// 문향재 필담실 완성 버전 AChat.js
// ==========================================================

// DOM 요소
const chatlog = document.getElementById("chatlog");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const selectEl = document.getElementById("authorSelect");
const authorPhoto = document.getElementById("authorPhoto");

// 상태 변수
let selectedAuthor = "";
let history = [];
let authorsList = []; // 모든 작가 정보 저장 → 중복 방지

// ==========================================================
// 메시지 출력
// ==========================================================
function append(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  chatlog.appendChild(div);
  chatlog.scrollTop = chatlog.scrollHeight;
}


// 작가 목록 불러오기

async function loadAuthors() {
  const res = await fetch("/data/AChat.json");
  const authors = await res.json();
  authorsList = authors;

  // 셀렉트박스 채우기
  authors.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.name;
    opt.dataset.image = a.image;
    selectEl.appendChild(opt);
  });

  // ★ 작가 선택 이벤트
  selectEl.addEventListener("change", () => {
    selectedAuthor = selectEl.value;
    const author = authorsList.find(a => a.id === selectedAuthor);

    if (!author) return;

    append("bot", `이제 ${author.name} 작가님과의 대화를 시작합니다.`);

    // 사진 표시
    authorPhoto.src = author.image;
    authorPhoto.style.display = "block";
  });
}

loadAuthors();

// ==========================================================
// 메시지 전송
// ==========================================================
async function send() {
  const message = inputEl.value.trim();
  if (!message) return;

  if (!selectedAuthor) {
    append("bot", "먼저 작가를 선택해주세요!");
    return;
  }

  append("user", message);
  inputEl.value = "";

  const res = await fetch("/authorchat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      author: selectedAuthor,
      history
    })
  });

  const data = await res.json();

  append("bot", data.reply);

  history.push({ role: "user", content: message });
  history.push({ role: "assistant", content: data.reply });
}

// 이벤트 등록
sendBtn.addEventListener("click", send);
inputEl.addEventListener("keydown", e => { 
  if (e.key === "Enter") send();
});
