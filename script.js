let poems = [];
let currentIndex = 0;

const poemList = document.getElementById('poem-list');
const poemContainer = document.querySelector('.poem-container');
const prevPoemBtn = document.getElementById('prevPoemBtn');
const nextPoemBtn = document.getElementById('nextPoemBtn');
const author = "Jarosław Derda";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatMonthHeader(dateString) {
  return new Date(dateString).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
}

function renderPoemList() {
  poemList.innerHTML = '';
  let currentMonth = '';

  poems.forEach((poem, index) => {
    const poemMonth = formatMonthHeader(poem.date);

    if (poemMonth !== currentMonth) {
      currentMonth = poemMonth;
      const monthHeader = document.createElement('div');
      monthHeader.className = 'px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 sticky top-0';
      monthHeader.textContent = currentMonth;
      poemList.appendChild(monthHeader);
    }

    const poemItem = document.createElement('div');
    poemItem.className = `sidebar-item px-4 py-2 hover:bg-gray-100 cursor-pointer ${index === currentIndex ? 'bg-gray-100' : ''}`;
    poemItem.dataset.index = index;
    poemItem.innerHTML = `<div class="text-gray-800">${formatDate(poem.date)}</div>`;
    poemItem.addEventListener('click', () => {
      currentIndex = index;
      renderCurrentPoem();
      updateSidebarActiveItem();
    });
    poemList.appendChild(poemItem);
  });
}

function renderCurrentPoem() {
  if (!poems[currentIndex]) return;

  poemContainer.innerHTML = '';

  const poem = poems[currentIndex];
  const poemElement = document.createElement('div');
  poemElement.className = 'poem p-8 md:p-12 flex flex-col justify-center';

poemElement.innerHTML = `
  <div class="text-2xl font-serif text-gray-700 mb-1">${formatDate(poem.date)}</div>
  ${poem.subdate ? `<div class="text-sm italic text-gray-400 mb-3">${poem.subdate}</div>` : ''}
  ${poem.title ? `<div class="text-2xl font-serif text-gray-600 mb-6">${poem.title}</div>` : ''}
  <div class="text-lg md:text-xl font-serif leading-relaxed max-w-2xl mx-auto text-gray-500 prose prose-sm prose-gray break-words">
    ${poem.content}
  </div>
  <div class="text-sm text-gray-400 mt-6 text-right max-w-2xl mx-auto italic">— ${author}</div>
`;


  poemContainer.appendChild(poemElement);
  poemContainer.scrollTo(0, 0);
  if (window.MathJax) {
  MathJax.typesetPromise([poemContainer]);
}
}

function updateSidebarActiveItem() {
  document.querySelectorAll('.sidebar-item').forEach((item, index) => {
    item.classList.toggle('bg-gray-200', index === currentIndex);
  });
}

prevPoemBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderCurrentPoem();
    updateSidebarActiveItem();
  }
});

nextPoemBtn.addEventListener('click', () => {
  if (currentIndex < poems.length - 1) {
    currentIndex++;
    renderCurrentPoem();
    updateSidebarActiveItem();
  }
});

fetch('./poems.json')
  .then(response => response.json())
  .then(data => {
    poems = data.filter(poem =>
      typeof poem.content === 'string' &&
      poem.content.trim().length > 0
    );

    if (poems.length === 0) {
      poemList.innerHTML = '<div class="p-4 text-sm text-gray-500">Brak dostępnych wierszy.</div>';
      poemContainer.innerHTML = '';
      return;
    }

    renderPoemList();
    renderCurrentPoem();
  });
