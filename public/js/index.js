function goHome() {
  window.location.href = "index.html";
}

const nav = document.querySelector(".nav");
const megaMenu = document.querySelector(".mega-menu");

let hideTimer = null;

// 메가 메뉴 열기
function showMega() {
  clearTimeout(hideTimer);
  megaMenu.style.display = "flex";
}

// 메가 메뉴 닫기 (딜레이)
function hideMega() {
  hideTimer = setTimeout(() => {
    megaMenu.style.display = "none";
  }, 300);
}

// nav 영역에 들어오면 열기
nav.addEventListener("mouseenter", showMega);
// nav에서 나가면 닫기
nav.addEventListener("mouseleave", hideMega);

// mega 위에 들어오면 계속 유지
megaMenu.addEventListener("mouseenter", showMega);
// mega에서 나가면 닫기
megaMenu.addEventListener("mouseleave", hideMega);

/* 나연이가 한부분 */
