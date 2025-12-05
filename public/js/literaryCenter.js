// 토글 부드럽게 열림
document.querySelectorAll(".toggle-box").forEach(details => {
  const content = details.nextElementSibling.nextElementSibling; // HR → toggle-content

  details.addEventListener("toggle", () => {
    if (details.open) {
      content.style.maxHeight = content.scrollHeight + "px";
    } else {
      content.style.maxHeight = 0;
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const detailsList = document.querySelectorAll(".toggle-box");

  detailsList.forEach(details => {
    const content = details.nextElementSibling?.nextElementSibling; 

    if (content && content.classList.contains("toggle-content")) {
      details.setAttribute("open", "");
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});


// 진행프로그램 높이 맞추기
window.addEventListener("load", () => {
  const items = document.querySelectorAll(".program-item");
  let maxHeight = 0;

  items.forEach(item => {
    const itemHeight = item.offsetHeight;
    if (itemHeight > maxHeight) maxHeight = itemHeight;
  });

  items.forEach(item => {
    item.style.height = maxHeight + "px";
  });
});


// 책 카드 높이 맞추기
function setBookCardHeight() {
  const cards = document.querySelectorAll(".book-card");
  let maxHeight = 0;

  cards.forEach(card => card.style.height = "auto");

  cards.forEach(card => {
    const h = card.offsetHeight;
    if (h > maxHeight) maxHeight = h;
  });

  cards.forEach(card => card.style.height = maxHeight + "px");
}

window.addEventListener("load", setBookCardHeight);

window.addEventListener("resize", setBookCardHeight);