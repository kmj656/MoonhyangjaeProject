const emotions = [
  "감동","경악","고마움","공포","귀찮음","기대감","기쁨","깨달음","놀람","당황",
  "부끄러움","부담","연민","불안","불만","비장함","뿌듯함","서러움","슬픔",
  "신기함","신뢰","실망","어이없음","역겨움","무시","의심","절망","존경",
  "죄책감","즐거움","증오","지긋지긋","짜증","자기혐오","편안","한심함",
  "행복","분노","호의","흐뭇함","힘듦"
];

// 🔥 긍정 / 부정 감정 분류 (네가 조정 가능)
const positiveList = [
  "감동","고마움","기대감","기쁨","깨달음","놀람","뿌듯함","연민","신기함",
  "신뢰","존경","즐거움","편안","행복","호의","흐뭇함"
];

const negativeList = emotions.filter(e => !positiveList.includes(e));

const positiveContainer = document.getElementById("positive-emotions");
const negativeContainer = document.getElementById("negative-emotions");

const generateBtn = document.getElementById("generateBtn");
const poemOutput = document.getElementById("poemOutput");
let selected = [];

// 공통 버튼 생성 함수
function createEmotionButton(emotion, parent) {
  const btn = document.createElement("button");
  btn.textContent = emotion;
  btn.classList.add("emotion-btn");
  btn.addEventListener("click", () => toggleEmotion(emotion, btn));
  parent.appendChild(btn);
}

// 버튼 생성
positiveList.forEach(emotion => createEmotionButton(emotion, positiveContainer));
negativeList.forEach(emotion => createEmotionButton(emotion, negativeContainer));

function toggleEmotion(emotion, btn) {
  const index = selected.indexOf(emotion);

  if (index >= 0) {
    selected.splice(index, 1);
    btn.classList.remove("selected");
  } else {
    if (selected.length >= 5) {
      alert("최대 5개까지 선택할 수 있습니다.");
      return;
    }
    selected.push(emotion);
    btn.classList.add("selected");
  }
}

// 시 생성 요청
generateBtn.addEventListener("click", async () => {
  const keyword = document.getElementById("keywordInput").value.trim();

  // 유효성 검사
  if (!keyword) {
    alert("주제 키워드를 입력해주세요!");
    return;
  }
  if (selected.length === 0) {
    alert("감정을 최소 1개 이상 선택해주세요!");
    return;
  }

  poemOutput.textContent = "🌿 시를 생성 중입니다...";

  try {
    const res = await fetch("/poem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, emotions: selected })
    });

    const data = await res.json();
    poemOutput.textContent = data.poem || "시를 생성하지 못했습니다.";
  } catch (error) {
    poemOutput.textContent = "서버 오류가 발생했습니다. 다시 시도해주세요.";
  }
});


// 초기화 버튼
const resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener("click", () => {
  selected = [];
  document.querySelectorAll(".emotion-btn").forEach(btn => btn.classList.remove("selected"));
  poemOutput.textContent = "(여기에 시가 생성됩니다)";
});
