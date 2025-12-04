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
fetch("../data/literature.json")
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
  infoCard.innerHTML = `
    <a href="${book.library || '#'}">
      <img src="${book.cover || 'default_cover.jpg'}" alt="책 표지" class="cover book-cover">
    </a>
    <h2 class="title">${book.title || "제목 없음"}</h2>
    <div class="footer">
      <span class="type"><a href="#">${book.genre || "장르 없음"}</a></span>
    </div>
  `;

  // 목차 + 줄거리
  const ts = book.table_summary || {};
  const labels = ts.labels || {};
  document.querySelector("#table .section-title").textContent = labels.table || "목차";
  document.querySelector("#summary .section-title").textContent = labels.summary || "줄거리";

  document.querySelector("#table .section-content").textContent = ts.table || "";
  document.querySelector("#summary .section-content").textContent = ts.summary || "";

  // 대표시 섹션
  const poemSection = document.querySelector("#poem");
  if (book.genre === "시" && book.poem) {
    if (poemSection) {
      poemSection.style.display = "block";
      poemSection.querySelector(".section-content").textContent = book.poem;
    }
  } else if (poemSection) {
    poemSection.style.display = "none";
  }

  // 작가
  const authorPhoto = document.querySelector("#author-photo");
  const authorLink = document.querySelector("#author-photo-link");
  const authorBio = document.querySelector("#author-bio");

  if (authorPhoto) authorPhoto.src = book.author?.photo || "default_author.jpg";
  if (authorLink) authorLink.href = book.author?.link || "#";
  if (authorBio) authorBio.textContent = book.author?.bio || "정보 없음";

  // 도서관
  const libraryLink = document.querySelector("#library-link");
  if (libraryLink) libraryLink.href = book.library || "#";

  // 문학관
  const museumPhoto = document.querySelector("#museum-photo");
  const museumLink = document.querySelector("#museum-link");
  const museumName = document.querySelector("#museum-name");

  if (museumPhoto) museumPhoto.src = book.museum?.photo || "default_museum.jpg";
  if (museumLink) museumLink.href = book.museum?.link || "#";
  if (museumName) museumName.textContent = book.museum?.name || "문학관 없음";

  // 저자의 작품
  const majorDiv = document.querySelector("#major-content");
  if (majorDiv) {
    majorDiv.innerHTML = "";
    (book.major || []).forEach(item => {
      majorDiv.innerHTML += `
        <a href="literature.html?id=${item.id}">
          <img src="${item.cover || 'default_cover.jpg'}" class="cover major-cover" alt="대표작 표지">
          <p class="work-title">${item.title || "제목 없음"}</p>
        </a>
      `;
    });
  }

  // 연관 작품
  const relatedDiv = document.querySelector("#related-content");
  if (relatedDiv) {
    relatedDiv.innerHTML = "";
    (book.related || []).forEach(item => {
      relatedDiv.innerHTML += `
        <a href="related.html?id=${item.id}">
          <img src="${item.cover || 'default_cover.jpg'}" class="cover related-cover" alt="연관작 표지">
          <p class="work-title">${item.title || "제목 없음"}</p>
        </a>
      `;
    });
  }
}