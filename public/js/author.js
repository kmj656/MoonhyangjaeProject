// DOM 요소
const writerList = document.getElementById("writerList");
const sortKeySelect = document.getElementById("sortKey");
const sortOrderSelect = document.getElementById("sortOrder");
const applyBtn = document.getElementById("applySort");

let authorsData = [];

// JSON 불러오기
fetch("/data/author.json")
  .then(res => res.json())
  .then(data => {
    authorsData = data;
    displayAuthors(authorsData);
  });

// 작가 카드 출력 함수
function displayAuthors(list) {
  writerList.innerHTML = "";

  list.forEach(author => {
    const card = document.createElement("div");
    card.className = "writer-card";

    // 공통 상세페이지로 이동
    card.setAttribute("onclick", `location.href='/html/author_detail.html?id=${author.id}'`);

    card.innerHTML = `
      <div class="writer-photo">
        <img src="${author.photo}" alt="${author.name}">
      </div>
      <div class="writer-info">
        <h3>${author.name} (${author.birth}~${author.death})</h3>
        <p>${author.intro}</p>
      </div>
    `;

    writerList.appendChild(card);
  });
}

// 정렬 기능
applyBtn.addEventListener("click", () => {
  const key = sortKeySelect.value;
  const order = sortOrderSelect.value;

  let sorted = [...authorsData];

  sorted.sort((a, b) => {
    if (key === "name") {
      return order === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (key === "year") {
      return order === "asc" ? a.year - b.year : b.year - a.year;
    }
  });

  displayAuthors(sorted);
});
