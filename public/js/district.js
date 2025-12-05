// 스크롤버튼
if (typeof $ !== 'undefined') {
  $(".upBtn").click(function() {
    $('html, body').animate({ scrollTop: 0 }, 300);
  });

  $(".downBtn").click(function() {
    $('html, body').animate({ scrollTop: $(document).height() }, 300);
  });
} else {
  console.warn("jQuery가 로드되지 않았습니다. upBtn / downBtn 기능이 비활성화됩니다.");
}



// 지도 색 바꾸기
const mapObj = document.getElementById('mapFinal');

mapObj.addEventListener('load', () => {
  const doc = mapObj.contentDocument;
  if (!doc) {
    console.error('지도.svg에 접근할 수 없습니다. (CORS 또는 로드 문제)');
    return;
  }

  const gangwon = doc.querySelectorAll('.gangwon');
  const capital = doc.querySelectorAll('.capital');
  const chungcheong = doc.querySelectorAll('.chungcheong');
  const jeolla = doc.querySelectorAll('.jeolla');
  const gyeongsang = doc.querySelectorAll('.gyeongsang');
  const jeju = doc.querySelectorAll('.jeju');

  // 모든 지역색 회색으로
  const allRegions = [gangwon, capital, gyeongsang, chungcheong, jeolla, jeju];

  allRegions.forEach(regionGroup => {
    regionGroup.forEach(el => {
      el.setAttribute('fill', 'rgb(193, 193, 193)');});
  });

  // hover로 색깔 바꾸기
  function addHoverEffect(elements, hoverColor) {
    elements.forEach(el => {
      const originalColor = el.getAttribute('fill');

      el.addEventListener('mouseenter', () => {
        el.style.transition = 'fill 0.1s ease';
        elements.forEach(e => e.setAttribute('fill', hoverColor));
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'fill 0.1s ease';
        elements.forEach(e => e.setAttribute('fill', originalColor));
      });
    });
  }

  addHoverEffect(gangwon, 'rgb(72, 111, 2)');
  addHoverEffect(capital, 'rgb(72, 111, 2)');
  addHoverEffect(gyeongsang, 'rgb(72, 111, 2)');
  addHoverEffect(chungcheong, 'rgb(72, 111, 2)');
  addHoverEffect(jeolla, 'rgb(72, 111, 2)');

  // 클릭 시 페이지로 이동
  function addClickEvent(elements, url) {
    elements.forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        window.location.href = url;
      });
    });
  }

  addClickEvent(gangwon, 'gangwon.html');
  addClickEvent(capital, 'capital.html');
  addClickEvent(gyeongsang, 'gyeongsang.html');
  addClickEvent(chungcheong, 'chungcheong.html');
  addClickEvent(jeolla, 'jeolla.html');

});


// 가나다순 자동정렬
document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector(".literaryCenter_list");
  if (!list) return;

  const cards = Array.from(list.querySelectorAll(".card"));

  cards.sort((a, b) => {
    const nameA = a.querySelector("h2").innerText.trim();
    const nameB = b.querySelector("h2").innerText.trim();
    return nameA.localeCompare(nameB, "ko");
  });

  cards.forEach(card => list.appendChild(card));
});