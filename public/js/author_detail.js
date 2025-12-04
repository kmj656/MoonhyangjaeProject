// URL에서 id 가져오기
const params = new URLSearchParams(location.search);
const id = params.get("id");

// JSON 로드
fetch("/data/author.json")
  .then(res => res.json())
  .then(data => {
    const author = data.find(a => a.id === id);
    if (!author) return;

    document.getElementById("author-name").textContent =
      `${author.name} (${author.birth}~${author.death})`;

    document.getElementById("author-photo").src = author.photo;
    document.getElementById("author-intro").textContent = author.intro;
    document.getElementById("author-style").textContent = author.workStyle;

    const lifeBox = document.getElementById("author-life");
    lifeBox.innerHTML = author.bio
      .map(item => `<li>${item}</li>`)
      .join("");

    const worksBox = document.getElementById("author-works");
    worksBox.innerHTML = author.works
      .map(w => `
        <a href="${w.link}" class="work-card">
          <img src="${w.image}" class="work-cover">
          <div>
            <h4 class="work-title">${w.title}</h4>Z
            <p class="work-desc">${w.desc}</p>
          </div>
        </a>
      `)
      .join("");
  });
