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

if (upBtn)
  upBtn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
if (downBtn)
  downBtn.addEventListener("click", () =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
  );

// =============================
// 메가 메뉴 (li 단위 hover + 지연)
// =============================
const navItems = document.querySelectorAll(".nav-item.has-mega");

navItems.forEach(item => {
  const megaMenu = item.querySelector(".mega-menu") || document.querySelector(".mega-menu");
  let hideTimer;

  item.addEventListener("mouseenter", () => {
    clearTimeout(hideTimer);
    megaMenu.style.display = "flex";
  });

  item.addEventListener("mouseleave", () => {
    hideTimer = setTimeout(() => {
      megaMenu.style.display = "none";
    }, 300);
  });

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
// 아코디언 섹션 (jQuery)
// =============================
document.addEventListener("DOMContentLoaded", function () {
  const sectionTitles = document.querySelectorAll(".section-title");

  sectionTitles.forEach(title => {
    const content = title.nextElementSibling;
    if (!content) return;

    // 초기 상태: 펼쳐진 상태
    title.classList.add("active");
    content.style.display = "flex";

    // 클릭 시 토글
    title.addEventListener("click", () => {
      if (content.style.display === "flex" || content.style.display === "") {
        // 닫기
        content.style.height = content.scrollHeight + "px";
        requestAnimationFrame(() => {
          content.style.transition = "height 0.3s";
          content.style.height = "0";
        });
        setTimeout(() => {
          content.style.display = "none";
          content.style.height = "";
          content.style.transition = "";
        }, 300);
        title.classList.remove("active");
      } else {
        // 열기
        content.style.display = "flex";
        content.style.height = "0";
        requestAnimationFrame(() => {
          content.style.transition = "height 0.3s";
          content.style.height = content.scrollHeight + "px";
        });
        setTimeout(() => {
          content.style.height = "";
          content.style.transition = "";
        }, 300);
        title.classList.add("active");
      }
    });
  });
});


// =============================
// URL에서 id 가져오기
// =============================
const params = new URLSearchParams(window.location.search);
const bookId = params.get('id');

let booksData = [];

// =============================
// JSON 불러오기 & 상세페이지 채우기
// =============================
fetch("/data/literature.json")
  .then(res => res.json())
  .then(data => {
    booksData = data;
    displayBook(booksData, bookId);
  })
  .catch(err => console.error("JSON 로드 실패:", err));

function displayBook(list, id) {
  const book = list.find(b => b.id == id);
  if (!book) return;

  // info-card
  const infoCard = document.querySelector(".info-card");
  const displayGenre = book.genre === "단편소설" ? "소설" : book.genre;
  infoCard.innerHTML = `
    <a href="${book.library}">
      <img src="${book.cover}" alt="책 표지" class="cover book-cover">
    </a>
    <h2 class="title">${book.title}</h2>
    <div class="footer">
      <span class="type">
        <a href="#">${displayGenre}</a>
      </span>
    </div>
  `;

// 왼쪽 메뉴 동적 표시
const tableLink = document.querySelector('.left-menu a[href="#table"]');
const summaryLink = document.querySelector('.left-menu a[href="#summary"]');
const poemLink = document.querySelector('.left-menu a[href="#poem"]');

if (book.genre === "시") {
  tableLink.style.display = "block";     // 시는 목차 표시
  summaryLink.style.display = "none";   // 줄거리 숨김
  poemLink.style.display = "block";     // 대표시 표시
} else if (book.genre === "단편소설") {
  tableLink.style.display = "block";     // 단편소설은 목차 표시
  summaryLink.style.display = "block";   // 줄거리 표시
  poemLink.style.display = "none";      // 대표시는 없음
} else { // 소설, 수필
  tableLink.style.display = "none";     // 목차 숨김
  summaryLink.style.display = "block"; // 줄거리 표시
  poemLink.style.display = "none";      // 대표시는 없음
}


  // 목차 + 줄거리
const ts = book.table_summary || {};
const labels = ts.labels || {};
document.querySelector("#table .section-title").textContent = labels.table || "목차";
document.querySelector("#summary .section-title").textContent = labels.summary || "줄거리";
document.querySelector("#theme-content").textContent = book.theme || "";

// =============================
// 장르별 상세 구분 (각각 따로 처리)
// =============================

// 1) 시
if (book.genre === "시") {
  document.querySelector("#table-content").textContent = ts.table || "";
  document.querySelector("#summary-content").textContent = "";
  
  const poemSection = document.querySelector("#poem");
  if (poemSection) {
    poemSection.style.display = "block";
    poemSection.querySelector(".section-content").textContent = book.poem || "";
  }
}

// 2) 단편소설
else if (book.genre === "단편소설") {
  document.querySelector("#table-content").textContent = ts.table || "";
  document.querySelector("#summary-content").textContent = "";
  
  const poemSection = document.querySelector("#poem");
  if (poemSection) poemSection.style.display = "none";
}

// 3) 소설 + 4) 수필
else {
  document.querySelector("#table-content").textContent = "";
  document.querySelector("#summary-content").textContent = ts.summary || "";
  
  const poemSection = document.querySelector("#poem");
  if (poemSection) poemSection.style.display = "none";
}

  // 작가
  document.querySelector("#author-photo").src = book.author.photo;
  document.querySelector("#author-photo-link").href = book.author.link || "#";
  document.querySelector("#author-bio").textContent = book.author.bio;

  // 도서관
  document.querySelector("#library-link").href = book.library;

  // 문학관
  document.querySelector("#museum-photo").src = book.museum.photo;
  document.querySelector("#museum-link").href = book.museum.link || "#";
  document.querySelector("#museum-name").textContent = book.museum.name;

  // 저자의 작품
  const majorDiv = document.querySelector("#major-content");
  majorDiv.innerHTML = "";
  book.major.forEach(item => {
    majorDiv.innerHTML += `
      <a href="literature.html?id=${item.id}">
        <img src="${item.cover}" class="cover major-cover" alt="대표작 표지">
        <p class="work-title">${item.title}</p>
      </a>
    `;
  });

  // 연관 작품
  const relatedDiv = document.querySelector("#related-content");
  relatedDiv.innerHTML = "";
  book.related.forEach(item => {
    relatedDiv.innerHTML += `
      <a href="related.html?id=${item.id}">
        <img src="${item.cover}" class="cover related-cover" alt="연관작 표지">
        <p class="work-title">${item.title}</p>
      </a>
    `;
  });
}
