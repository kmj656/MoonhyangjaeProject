const chatlog = document.getElementById("chatlog");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
let history = [];

function append(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  chatlog.appendChild(div);
  chatlog.scrollTop = chatlog.scrollHeight;
}

async function send() {
  const message = inputEl.value.trim();
  if (!message) return;
  append("user", message);
  inputEl.value = "";

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history })
  });
  const data = await res.json();

  if (data.ui?.type === "recommend") {
    append("bot", `📖 ${data.ui.title} — ${data.ui.author}\n${data.ui.reason}`);
  } else if (data.ui?.type === "questions") {
    data.ui.questions.forEach(q => append("bot", q));
  } else {
    append("bot", data.ui?.text || "응답을 받지 못했습니다.");
  }

  history.push({ role: "user", content: message });
  if (data.ui?.text || data.ui?.reason)
    history.push({ role: "assistant", content: data.ui.text || data.ui.reason });
}

sendBtn.addEventListener("click", send);
inputEl.addEventListener("keydown", e => e.key === "Enter" && send());
