// =============================
// 홈 이동
// =============================
function goHome() {
  window.location.href = "index.html";
}

// =============================
// 스크롤 버튼
// =============================
const upBtn = document.querySelector(".upBtn");
const downBtn = document.querySelector(".downBtn");

if (upBtn) {
  upBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if (downBtn) {
  downBtn.addEventListener("click", () => {
    window.scrollTo({ 
      top: document.body.scrollHeight, 
      behavior: "smooth" 
    });
  });
}

// =============================
// 그리드/리스트 드롭다운 + 초기 설정
// =============================
const viewSelect = document.getElementById("viewSelect");
const bookGrid = document.getElementById("bookGrid");

if (viewSelect && bookGrid) {
  // 초기 보기 방식 적용
  if (viewSelect.value === "list") {
    bookGrid.classList.add("list-view");
  } else {
    bookGrid.classList.remove("list-view");
  }

  viewSelect.addEventListener("change", () => {
    if (viewSelect.value === "list") {
      bookGrid.classList.add("list-view");
    } else {
      bookGrid.classList.remove("list-view");
    }
  });
}

// =============================
// 메가 메뉴 (li 단위 hover + 지연)
 // =============================
const navItems = document.querySelectorAll(".nav-item.has-mega");

navItems.forEach(item => {
  const megaMenu = item.querySelector(".mega-menu") || document.querySelector(".mega-menu");
  let hideTimer;

  // 마우스 들어올 때
  item.addEventListener("mouseenter", () => {
    clearTimeout(hideTimer);
    megaMenu.style.display = "flex";
  });

  // 마우스 나갈 때 (지연)
  item.addEventListener("mouseleave", () => {
    hideTimer = setTimeout(() => {
      megaMenu.style.display = "none";
    }, 300); // 0.3초 지연
  });

  // mega-menu 자체에도 mouseenter/mouseleave 적용
  megaMenu.addEventListener("mouseenter", () => {
    clearTimeout(hideTimer);
    megaMenu.style.display = "flex";
  });

  megaMenu.addEventListener("mouseleave", () => {
    hideTimer = setTimeout(() => {
      megaMenu.style.display = "none";
    }, 300);
  });
});

// =============================
// view-toggle 클릭 시 메가메뉴 영향 방지
// =============================
const viewToggle = document.querySelector(".view-toggle-container");
if (viewToggle) {
  viewToggle.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

//=============================
// 목록 백엔드 처리
//=============================
// DOM 요소
const genreFilter = document.querySelector("[data-genre]")?.dataset.genre;// HTML에서 지정

let booksData = [];

// JSON 불러오기
fetch("/data/literarywork.json")
  .then(res => res.json())
  .then(data => {
    booksData = data;
    displayBooks(booksData);
  })
  .catch(err => console.error("JSON 로드 실패:", err));

// 책 카드 출력 함수
function displayBooks(list) {
  const filteredList = genreFilter ? list.filter(book => book.genre === genreFilter) : list;

  bookGrid.innerHTML = "";

  filteredList.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card";

    card.innerHTML = `
      <a href="literature.html?id=${book.id}" class="cover-link">
        <div class="cover"><img src="${book.cover}" alt="책 표지"></div>
        <div class="book-info">
          <p class="title">${book.title}</p>
          <p class="preview">${book.preview}</p>
        </div>
      </a>
    `;

    bookGrid.appendChild(card);
  });
}


