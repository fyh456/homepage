const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');
const themeToggle = document.querySelector('.theme-toggle');

const currentLanguage = document.body.dataset.language;
try {
  const savedLanguage = localStorage.getItem('site-language');
  if ((savedLanguage === 'zh' || savedLanguage === 'en') && savedLanguage !== currentLanguage) {
    const targetPage = savedLanguage === 'en' ? document.body.dataset.pageEn : document.body.dataset.pageZh;
    if (targetPage) window.location.replace(`${targetPage}${window.location.hash}`);
  }
} catch {}

document.querySelectorAll('[data-language-choice]').forEach((link) => {
  link.addEventListener('click', () => {
    try { localStorage.setItem('site-language', link.dataset.languageChoice); } catch {}
  });
});

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const updateVisitCounter = async () => {
  const counters = document.querySelectorAll('[data-visit-counter]');
  if (!counters.length) return;

  try {
    const response = await fetch('/api/visit', {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error('Visit counter is unavailable.');
    const payload = await response.json();
    const count = Number(payload.count);
    if (!Number.isFinite(count) || count < 0) throw new Error('Invalid visit count.');

    document.querySelectorAll('[data-visit-count]').forEach((element) => {
      element.textContent = Math.trunc(count).toLocaleString('zh-CN');
    });
    counters.forEach((element) => { element.hidden = false; });
  } catch {
    counters.forEach((element) => { element.hidden = true; });
  }
};

updateVisitCounter();

const updateActiveNavigation = () => {
  const page = document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach((link) => link.removeAttribute('aria-current'));
  document.querySelector(`[data-nav="${page}"]`)?.setAttribute('aria-current', 'page');
};

updateActiveNavigation();

const updateThemeButton = () => {
  const isDark = document.documentElement.dataset.theme === 'dark';
  const label = currentLanguage === 'en'
    ? (isDark ? 'Switch to light mode' : 'Switch to dark mode')
    : (isDark ? '切换为日间模式' : '切换为夜间模式');
  themeToggle?.setAttribute('aria-label', label);
  themeToggle?.setAttribute('title', label);
  themeToggle?.setAttribute('aria-pressed', String(isDark));
};

updateThemeButton();

themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  try { localStorage.setItem('site-theme', nextTheme); } catch {}
  updateThemeButton();
});

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  navigation?.classList.toggle('is-open', !isOpen);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    menuToggle?.setAttribute('aria-expanded', 'false');
    navigation?.classList.remove('is-open');
  }
});
