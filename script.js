let poems = [];
let filteredPoems = [];
let currentIndex = 0;

const poemList = document.getElementById('poem-list');
const poemContainer = document.querySelector('.poem-container');
const prevPoemBtn = document.getElementById('prevPoemBtn');
const nextPoemBtn = document.getElementById('nextPoemBtn');
const searchInput = document.getElementById('poemSearch');
const searchMode = document.getElementById('searchMode');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const author = "Jarosław Derda";

// Formatowanie daty
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatMonthHeader(dateString) {
  return new Date(dateString).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
}

function highlight(text) {
  const query = searchInput?.value.toLowerCase().trim();
  if (!query || query.length < 2) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = searchMode.checked
    ? `\\b${escaped}\\b`  // tylko całe słowo
    : escaped;            // dowolny fragment

  const regex = new RegExp(`(${pattern})`, 'gi');

  return text.replace(regex, '<mark class="bg-amber-200 dark:bg-amber-600 text-black dark:text-white rounded px-1">$1</mark>');
}

// Rysowanie listy wierszy
function renderPoemList() {
  poemList.innerHTML = '';
  filteredPoems.sort((a, b) => new Date(b.date) - new Date(a.date));

  const monthGroups = new Map();
  const currentPoemMonth = formatMonthHeader(filteredPoems[currentIndex]?.date);

  filteredPoems.forEach((poem, index) => {
    const poemMonth = formatMonthHeader(poem.date);

    if (!monthGroups.has(poemMonth)) {
      const groupWrapper = document.createElement('div');
      groupWrapper.classList.add('month-group');

      const monthHeader = document.createElement('div');
      monthHeader.className = 'month-header flex items-center gap-2 cursor-pointer';

      const icon = document.createElement('i');
      icon.className = poemMonth === currentPoemMonth
        ? 'fas fa-chevron-down text-inherit text-sm w-5 text-center inline-block align-middle'
        : 'fas fa-chevron-right text-inherit text-sm w-5 text-center inline-block align-middle';

      const title = document.createElement('span');
      title.textContent = poemMonth;

      monthHeader.appendChild(icon);
      monthHeader.appendChild(title);

      monthHeader.addEventListener('click', () => {
        groupWrapper.classList.toggle('collapsed');
        icon.className = groupWrapper.classList.contains('collapsed')
          ? 'fas fa-chevron-right text-inherit text-sm w-5 text-center inline-block align-middle'
          : 'fas fa-chevron-down text-inherit text-sm w-5 text-center inline-block align-middle';
      });

      if (poemMonth !== currentPoemMonth) {
        groupWrapper.classList.add('collapsed');
      }

      groupWrapper.appendChild(monthHeader);
      poemList.appendChild(groupWrapper);
      monthGroups.set(poemMonth, groupWrapper);
    }

    const group = monthGroups.get(poemMonth);
    const poemItem = document.createElement('div');
    poemItem.className = `sidebar-item ${index === currentIndex ? 'bg-active' : ''}`;
    poemItem.dataset.index = index;
    poemItem.innerHTML = `<div class="text-active">${formatDate(poem.date)}</div>`;

    poemItem.addEventListener('click', () => {
      currentIndex = index;
      renderCurrentPoem();
      updateSidebarActiveItem();
    });

    group.appendChild(poemItem);
  });

  // Usuwamy puste miesiące
  document.querySelectorAll('.month-group').forEach(group => {
    const children = group.querySelectorAll('.sidebar-item');
    if (children.length === 0) {
      group.remove();
    }
  });
}

// Wyświetlanie wiersza
function renderCurrentPoem() {
  if (!filteredPoems[currentIndex]) return;

  poemContainer.innerHTML = '';

  const poem = filteredPoems[currentIndex];
  const poemElement = document.createElement('div');
  poemElement.className = 'poem p-8 md:p-12 flex flex-col justify-center';

  poemElement.innerHTML = `
    <div class="poem-date text-2xl font-serif text-gray-700 dark:text-gray-200 mb-1">${formatDate(poem.date)}</div>
    ${poem.subdate ? `<div class="text-sm italic text-gray-400 mb-3">${poem.subdate}</div>` : ''}
${poem.title ? `<div class="poem-title text-2xl font-serif text-gray-600 dark:text-gray-300 mb-6">${highlight(poem.title)}</div>` : ''}
    <div class="text-lg md:text-xl font-serif leading-relaxed max-w-2xl mx-auto text-gray-500 dark:text-gray-300 prose prose-sm prose-gray break-words">
      ${highlight(poem.content)}
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
    item.classList.toggle('bg-active', index === currentIndex);
  });
}

// Nawigacja
prevPoemBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderCurrentPoem();
    updateSidebarActiveItem();
  }
});

nextPoemBtn.addEventListener('click', () => {
  if (currentIndex < filteredPoems.length - 1) {
    currentIndex++;
    renderCurrentPoem();
    updateSidebarActiveItem();
  }
});

// Wyszukiwanie + reset
function runSearch() {
  const query = searchInput.value.toLowerCase().trim();

  if (!query || query.length < 2) {
    filteredPoems = [...poems];
    const today = new Date().toISOString().slice(0, 10);
    const todayIndex = poems.findIndex(poem => poem.date === today);
    currentIndex = todayIndex !== -1 ? todayIndex : 0;
    renderPoemList();
    renderCurrentPoem();
    return;
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = searchMode.checked
    ? `\\b${escaped}\\b`
    : escaped;

  const queryRegex = new RegExp(pattern, 'i');

  filteredPoems = poems.filter(poem =>
    queryRegex.test(formatDate(poem.date)) ||
    (poem.title && queryRegex.test(poem.title)) ||
    (poem.content && queryRegex.test(poem.content))
  );

  currentIndex = 0;
  renderPoemList();
  renderCurrentPoem();
}


searchInput.addEventListener('input', () => {
  clearSearchBtn.classList.toggle('hidden', searchInput.value.trim().length === 0);
  runSearch();
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    clearSearch();
  }
});

clearSearchBtn.addEventListener('click', clearSearch);

function clearSearch() {
  searchInput.value = '';
  clearSearchBtn.classList.add('hidden');
  filteredPoems = [...poems];
  const today = new Date().toISOString().slice(0, 10);
  const todayIndex = poems.findIndex(poem => poem.date === today);
  currentIndex = todayIndex !== -1 ? todayIndex : 0;
  renderPoemList();
  renderCurrentPoem();
}
searchMode.addEventListener('change', () => {
  if (searchInput.value.trim().length >= 2) {
    runSearch();
  }
});


// Pobranie wierszy
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

    const today = new Date().toISOString().slice(0, 10);
    const todayIndex = poems.findIndex(poem => poem.date === today);
    currentIndex = todayIndex !== -1 ? todayIndex : 0;

    filteredPoems = [...poems];
    renderPoemList();
    renderCurrentPoem();
  });
