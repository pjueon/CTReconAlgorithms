/* 라이트/다크 전환 — 모든 페이지가 <head>에서 불러온다.
   - 저장값이 없으면 시스템 설정(prefers-color-scheme)을 따른다(자동). 저장값은 'light' 또는 'dark'.
   - <html data-theme="light|dark">로 CSS 변수를 덮어쓴다(base.css, book.css 참고).
   - 우측 상단의 작은 버튼이 자동 → 라이트 → 다크 순으로 바꾼다. */
(function () {
  var KEY = 'ctrecon-theme', root = document.documentElement;
  function load() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(m) { try { if (m) localStorage.setItem(KEY, m); else localStorage.removeItem(KEY); } catch (e) {} }
  function apply(m) { if (m === 'light' || m === 'dark') root.setAttribute('data-theme', m); else root.removeAttribute('data-theme'); }

  var mode = load();
  if (mode !== 'light' && mode !== 'dark') mode = null;
  apply(mode);

  var LABEL = { auto: '◐ 자동', light: '☀ 라이트', dark: '☾ 다크' };
  function cur() { return mode || 'auto'; }

  function init() {
    var st = document.createElement('style');
    st.textContent =
      '#theme-toggle{position:fixed;top:.55rem;right:.7rem;z-index:80;font:inherit;font-size:.74rem;line-height:1;' +
      'padding:.38rem .65rem;border:1px solid var(--rule);border-radius:99px;background:var(--card);color:var(--muted);cursor:pointer;opacity:.9}' +
      '#theme-toggle:hover{color:var(--fg-strong);border-color:var(--accent);opacity:1}';
    document.head.appendChild(st);
    var b = document.createElement('button');
    b.id = 'theme-toggle'; b.type = 'button';
    function paint() { b.textContent = LABEL[cur()]; b.title = '화면 색: ' + LABEL[cur()] + ' (누르면 바뀝니다)'; }
    b.addEventListener('click', function () {
      mode = cur() === 'auto' ? 'light' : cur() === 'light' ? 'dark' : null;
      save(mode); apply(mode); paint();
      // 캔버스 위젯은 그릴 때 색을 읽으므로 새로 그리려면 다시 불러온다(읽던 위치는 저장돼 있다)
      if (document.querySelector('canvas')) location.reload();
    });
    paint();
    document.body.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
