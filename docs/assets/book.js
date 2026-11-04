/* 학습 교재 런타임 — textbook-html 스킬 동봉본
   - 외부 의존 없음. file:// 로 열려도 동작한다 (fetch / module script 미사용)
   - 담당: 목차 사이드바, 페이지 넘김, 진행률, 퀴즈 채점, Before/After 탭,
           용어 툴팁, 페이지 참조 링크(이동·돌아가기), 코드 하이라이팅, 진도 저장
   - 교재마다 고칠 것은 편 폴더의 config.js 와 아래 [교재별 5/5](하이라이터 키워드)뿐이다. */
(function () {
  'use strict';

  /* ── 교재별 설정 — 편마다 있는 config.js 가 window.BOOK_CONFIG 로 넘긴다 ──
        제목·목차(book)·용어집(terms)·진도 저장 키 접두어(storePrefix) 가 들어 있다.
        book.js 는 이 파일을 불러오기 전에 config.js 가 먼저 실행되었다고 가정한다. */
  var CFG = window.BOOK_CONFIG;
  var TITLE = CFG.title;
  var SUBTITLE = CFG.subtitle;
  var BOOK = CFG.book;
  var TERMS = CFG.terms;

  /* 진도 저장 키 — storePrefix 로 편을 구분한다. 키는 localStorage / sessionStorage 에 쓴다. */
  var STORE_KEY = CFG.storePrefix + ':progress';
  var NAV_KEY = CFG.storePrefix + ':nav';     // '다음 장'으로 넘어왔는지 (sessionStorage)
  var BACK_KEY = 'ctrecon:back';              // 다른 장·다른 편으로 가는 본문 링크를 누른 자리 (sessionStorage, 모든 편 공용)
  var BACK_TTL = 60000;                       // 이 시간(ms) 안에 도착한 페이지에서만 돌아가기 버튼을 띄운다

  /* ── 진도 저장 (file:// 에서는 모든 로컬 페이지가 저장소를 공유하므로
        키에 반드시 접두어를 붙인다) ──────────────────────────────── */
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) { /* 저장 못해도 교재는 동작한다 */ }
  }

  /* ── [교재별 5/5] 코드 하이라이터 키워드 ──────────────────────
        기본은 Python. 다른 언어면 이 목록만 교체한다.
        한 교재에 언어가 둘이면 합집합으로 둔다 — 오탐이 조금 늘지만 충분하다.
        주석·문자열 표기 자체가 다른 언어(슬래시 두 개로 주석을 여는 계열 등)는
        아래 PY_RE 의 첫 두 그룹도 함께 고쳐야 한다.
        PY_KW 부터 highlightAll 까지는 shared/highlight.js 정본의 사본이다(고치면 양쪽). */
  var PY_KW = 'False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|' +
              'else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|' +
              'pass|raise|return|try|while|with|yield|match|case';

  var PY_RE = new RegExp(
    '(#[^\\n]*)' +
    '|([fFrRbBuU]{0,2}(?:"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'))' +
    '|(@[A-Za-z_][\\w.]*)' +
    '|\\b(def|class)(\\s+)([A-Za-z_]\\w*)' +
    '|\\b(self|cls)\\b' +
    '|\\b(' + PY_KW + ')\\b' +
    '|\\b(\\d[\\d_]*(?:\\.\\d+)?)\\b',
    'g');

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightPython(src) {
    return esc(src).replace(PY_RE, function (m, com, str, dec, defkw, gap, name, slf, kw, num) {
      if (com) return '<span class="tok-com">' + com + '</span>';
      if (str) return '<span class="tok-str">' + str + '</span>';
      if (dec) return '<span class="tok-dec">' + dec + '</span>';
      if (defkw) return '<span class="tok-kw">' + defkw + '</span>' + gap + '<span class="tok-fn">' + name + '</span>';
      if (slf) return '<span class="tok-self">' + slf + '</span>';
      if (kw) return '<span class="tok-kw">' + kw + '</span>';
      if (num) return '<span class="tok-num">' + num + '</span>';
      return m;
    });
  }

  /* code 안의 텍스트 노드만 색칠한다. 저자가 직접 넣은 <b class="hl"> 같은
     강조 표시를 지우지 않기 위한 방식. */
  function highlightAll(root) {
    var blocks = root.querySelectorAll('pre > code, pre code.python');
    Array.prototype.forEach.call(blocks, function (code) {
      if (code.dataset.hl === 'done' || code.classList.contains('plain')) return;
      var texts = [];
      var walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT, null, false);
      while (walker.nextNode()) texts.push(walker.currentNode);
      texts.forEach(function (t) {
        var span = document.createElement('span');
        span.innerHTML = highlightPython(t.nodeValue);
        t.parentNode.replaceChild(span, t);
      });
      code.dataset.hl = 'done';
    });
  }

  /* ── 용어 툴팁 ──────────────────────────────────────────────── */
  function initTerms(root) {
    Array.prototype.forEach.call(root.querySelectorAll('.term[data-term]'), function (el) {
      var def = TERMS[el.dataset.term];
      if (!def) return;
      el.setAttribute('data-def', def);
      el.setAttribute('tabindex', '0');
    });
  }

  /* 말풍선은 body 에 하나만 두고 화면 안에 들어오게 자리를 잡는다.
     마우스를 올리거나, 탭(포커스)하면 뜨고, 벗어나거나 Esc 를 누르면 닫힌다. */
  var tip = null, tipFor = null;
  function showTip(el) {
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'tip';
      tip.setAttribute('role', 'tooltip');
      document.body.appendChild(tip);
    }
    tip.textContent = el.getAttribute('data-def');
    tip.classList.add('on');
    tipFor = el;
    var r = el.getBoundingClientRect();
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var left = Math.max(8, Math.min(r.left, vw - w - 8));
    var top = r.bottom + 6;
    if (top + h > vh - 8 && r.top - h - 6 > 8) top = r.top - h - 6;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  function hideTip() {
    if (tip) tip.classList.remove('on');
    tipFor = null;
  }
  function initTip() {
    function termOf(e) { return e.target.closest ? e.target.closest('.term[data-def]') : null; }
    document.addEventListener('mouseover', function (e) { var t = termOf(e); if (t) showTip(t); });
    document.addEventListener('mouseout', function (e) {
      var t = termOf(e);
      if (t && t === tipFor && !t.contains(e.relatedTarget) && document.activeElement !== t) hideTip();
    });
    document.addEventListener('focusin', function (e) { var t = termOf(e); if (t) showTip(t); });
    document.addEventListener('focusout', function (e) { if (termOf(e) === tipFor) hideTip(); });
    window.addEventListener('scroll', hideTip, true);
    window.addEventListener('resize', hideTip);
  }

  /* ── 페이지 참조 링크 ──────────────────────────────────────────────
     본문 텍스트에서 "N장 페이지 M", "페이지 N" 을 찾아 링크로 바꾼다(마크업 불필요).
     코드, 이미 링크인 곳, kicker, 그림 안은 건드리지 않는다.
     링크로 만들고 싶지 않은 자리는 <code> 로 감싸면 건너뛴다. */
  var REF_RE = /(\d{1,2})장 페이지 (\d{1,2})((?:\s?[·,~]\s?\d{1,2})*)|페이지 (\d{1,2})(?!\d|개|페이지)((?:\s?[·,~]\s?\d{1,2})*)/g;
  var SKIP_SEL = 'pre, code, a, button, svg, .kicker, .term, .cap, script, style, #tip';

  function chapterOf(num) {
    var id = 'ch' + (num < 10 ? '0' : '') + num;
    for (var i = 0; i < BOOK.length; i++) if (BOOK[i].id === id && BOOK[i].ready) return BOOK[i];
    return null;
  }

  function linkRefs(root, chId, screenCount) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !/페이지 \d/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        return n.parentNode.closest(SKIP_SEL) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    }, false);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      var text = node.nodeValue, frag = document.createDocumentFragment(), last = 0, m, changed = false;
      REF_RE.lastIndex = 0;
      function put(s) { if (s) frag.appendChild(document.createTextNode(s)); }
      // "페이지 4·6", "4장 페이지 2~3" 처럼 이어지는 번호도 하나씩 링크로 만든다
      function putList(prefix, first, tail, make) {
        var a = make(parseInt(first, 10), prefix + first);
        if (!a) return false;
        frag.appendChild(a);
        var re = /(\s?[·,~]\s?)(\d{1,2})/g, t;
        while ((t = re.exec(tail))) {
          put(t[1]);
          var b = make(parseInt(t[2], 10), t[2]);
          if (b) frag.appendChild(b); else put(t[2]);
        }
        return true;
      }
      while ((m = REF_RE.exec(text))) {
        var start = m.index;
        if (m[1]) {
          var ch = chapterOf(parseInt(m[1], 10));
          if (!ch) continue;
          put(text.slice(last, start));
          var sameCh = ch.id === chId;
          if (!putList(m[1] + '장 페이지 ', m[2], m[3] || '', function (n, label) {
            if (n < 1 || n > ch.screens) return null;
            return sameCh ? makeXref(n, label) : makeChRef(ch, n, label);
          })) put(m[0]);
        } else {
          if (!screenCount) continue;
          put(text.slice(last, start));
          if (!putList('페이지 ', m[4], m[5] || '', function (n, label) {
            return (n >= 1 && n <= screenCount) ? makeXref(n, label) : null;
          })) put(m[0]);
        }
        last = REF_RE.lastIndex;
        changed = true;
      }
      if (!changed) return;
      put(text.slice(last));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function makeXref(n, label) {
    var a = document.createElement('a');
    a.className = 'xref';
    a.href = '#s' + n;
    a.setAttribute('data-screen', n);
    a.textContent = label;
    return a;
  }
  function makeChRef(ch, n, label) {
    var a = document.createElement('a');
    a.className = 'xref xref-ch';
    a.href = ch.id + '.html#s' + n;
    a.textContent = label;
    a.title = ch.num + ' 페이지 ' + n + '(으)로 이동합니다';
    return a;
  }

  /* ── Before / After 탭 ──────────────────────────────────────── */
  function initTabs(root) {
    Array.prototype.forEach.call(root.querySelectorAll('.tabs'), function (wrap) {
      if (wrap.dataset.init) return;
      var tabs = wrap.querySelectorAll(':scope > .tab');
      if (!tabs.length) return;
      var bar = document.createElement('div');
      bar.className = 'tabbar';
      Array.prototype.forEach.call(tabs, function (tab, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = tab.dataset.label || ('탭 ' + (i + 1));
        b.addEventListener('click', function () {
          Array.prototype.forEach.call(bar.children, function (x, j) { x.classList.toggle('on', i === j); });
          Array.prototype.forEach.call(tabs, function (x, j) { x.classList.toggle('on', i === j); });
        });
        bar.appendChild(b);
        tab.classList.toggle('on', i === 0);
      });
      bar.children[0].classList.add('on');
      wrap.insertBefore(bar, wrap.firstChild);
      wrap.dataset.init = '1';
    });
  }

  /* ── 퀴즈 ───────────────────────────────────────────────────── */
  function initQuiz(root) {
    Array.prototype.forEach.call(root.querySelectorAll('.quiz'), function (quiz, qi) {
      if (quiz.dataset.init) return;
      var answer = parseInt(quiz.dataset.answer, 10);
      var opts = quiz.querySelectorAll('ol.options > li');

      var qn = quiz.querySelector('.qn');
      if (!qn) {
        qn = document.createElement('p');
        qn.className = 'qn';
        qn.textContent = '퀴즈 ' + (qi + 1);
        quiz.insertBefore(qn, quiz.firstChild);
      }

      Array.prototype.forEach.call(opts, function (li, i) {
        if (li.dataset.why) {
          var why = document.createElement('div');
          why.className = 'why';
          // 해설 글의 X_n 꼴은 아래첨자로 보인다
          (function (el, text) {
            var re = /([A-Za-zͰ-Ͽ])_([A-Za-z0-9Ͱ-Ͽ]+)/g, last = 0, m;
            while ((m = re.exec(text))) {
              el.appendChild(document.createTextNode(text.slice(last, m.index) + m[1]));
              el.appendChild(document.createElement('sub')).textContent = m[2];
              last = re.lastIndex;
            }
            el.appendChild(document.createTextNode(text.slice(last)));
          })(why, li.dataset.why);
          li.appendChild(why);
        }
        // 키보드로도 고를 수 있게 한다(Tab 으로 옮기고 Enter·Space 로 고른다)
        li.setAttribute('tabindex', '0');
        li.setAttribute('role', 'button');
        li.addEventListener('keydown', function (e) {
          if (e.target !== li) return;
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
        });
        li.addEventListener('click', function (e) {
          if (e.target.closest && e.target.closest('a, .term')) return;
          if (quiz.classList.contains('done')) return;
          var picked = i + 1;
          li.classList.add('picked', picked === answer ? 'pick-good' : 'pick-bad');
          if (picked !== answer && opts[answer - 1]) {
            opts[answer - 1].classList.add('pick-good', 'picked');
          }
          quiz.classList.add('done');
        });
      });
      quiz.dataset.init = '1';
    });
  }

  /* ── 목차 사이드바 ──────────────────────────────────────────── */
  function buildSidebar(currentId, screenTitles, onJump) {
    var progress = loadProgress();
    var toc = document.createElement('nav');
    toc.id = 'toc';

    var brand = document.createElement('a');
    brand.className = 'brand';
    brand.href = 'index.html';
    brand.innerHTML = '<b>' + TITLE + '</b><span>' + SUBTITLE + '</span>';
    toc.appendChild(brand);

    var series = document.createElement('a');
    series.className = 'series';
    series.href = CFG.homeHref || '../../index.html';
    series.textContent = '← 홈으로';
    toc.appendChild(series);

    var lastPart = null;
    BOOK.forEach(function (ch) {
      if (ch.part !== lastPart) {
        lastPart = ch.part;
        var p = document.createElement('div');
        p.className = 'part';
        p.textContent = ch.part;
        toc.appendChild(p);
      }
      var done = progress[ch.id] && progress[ch.id].done;
      var label = '<em>' + ch.num + (done ? ' <span class="tick">✓</span>' : '') + '</em>' + ch.title;
      var node;
      if (ch.ready) {
        node = document.createElement('a');
        node.className = 'ch';
        node.href = ch.id + '.html';
      } else {
        node = document.createElement('span');
        node.className = 'ch';
        node.title = '아직 집필 전입니다';
      }
      node.innerHTML = label;
      toc.appendChild(node);

      if (ch.id === currentId) {
        node.classList.add('here');
        if (screenTitles && screenTitles.length) {
          var ol = document.createElement('ol');
          ol.className = 'screens';
          screenTitles.forEach(function (t, i) {
            var li = document.createElement('li');
            var b = document.createElement('button');
            b.type = 'button';
            b.textContent = (i + 1) + '. ' + t;
            b.addEventListener('click', function () { onJump(i); });
            li.appendChild(b);
            ol.appendChild(li);
          });
          toc.appendChild(ol);
        }
      }
    });

    document.body.appendChild(toc);

    var toggle = document.createElement('button');
    toggle.id = 'toc-toggle';
    toggle.type = 'button';
    toggle.textContent = '☰';
    toggle.setAttribute('aria-label', '목차 열기');
    toggle.addEventListener('click', function () { document.body.classList.toggle('toc-open'); });
    document.body.appendChild(toggle);

    // 모바일에서 목차를 열면 본문을 막으로 덮고, 막을 누르면 닫는다
    var scrim = document.createElement('div');
    scrim.id = 'toc-scrim';
    scrim.addEventListener('click', function () { document.body.classList.remove('toc-open'); });
    document.body.appendChild(scrim);

    return toc;
  }

  /* ── 장 페이지 초기화 ───────────────────────────────────────── */
  function initChapter() {
    var chId = document.documentElement.dataset.chapter;
    var idx = -1;
    BOOK.forEach(function (c, i) { if (c.id === chId) idx = i; });
    var meta = BOOK[idx] || { num: '', title: document.title };

    var book = document.getElementById('book');
    var screens = book.querySelectorAll('.screen');
    if (!screens.length) return;

    var titles = Array.prototype.map.call(screens, function (s, i) {
      return s.dataset.title || (i + 1) + '번째 페이지';
    });

    var cur = 0;

    var bar = document.createElement('div');
    bar.id = 'progress';
    bar.innerHTML = '<i></i>';
    document.body.appendChild(bar);
    var fill = bar.firstChild;

    var nav = document.createElement('div');
    nav.id = 'nav';
    nav.innerHTML =
      '<button type="button" id="prev">← 이전</button>' +
      '<div class="where"><b>' + meta.num + '</b> · 페이지 <b class="cnt"></b></div>' +
      '<button type="button" id="next">다음 →</button>';
    document.body.appendChild(nav);

    var prevBtn = nav.querySelector('#prev');
    var nextBtn = nav.querySelector('#next');
    var cnt = nav.querySelector('.cnt');

    var toc = buildSidebar(chId, titles, function (i) {
      show(i);
      document.body.classList.remove('toc-open');
    });
    var screenItems = toc.querySelectorAll('ol.screens > li');

    // "심화"가 붙은 페이지는 배지·배너·목차 표시로 눈에 띄게 한다
    Array.prototype.forEach.call(screens, function (sc, i) {
      var k = sc.querySelector('.kicker');
      if (!k || !/심화/.test(k.textContent)) return;
      sc.classList.add('adv');
      k.innerHTML = k.textContent.replace(/\s*·\s*심화\s*$/, '') + ' <span class="adv-badge">심화</span>';
      var ban = document.createElement('div');
      ban.className = 'adv-banner';
      ban.innerHTML = '<b>심화 페이지</b> 더 깊이 들어가는 내용입니다. 처음 읽을 때는 건너뛰어도 됩니다.';
      k.insertAdjacentElement('afterend', ban);
      var btn = screenItems[i] && screenItems[i].querySelector('button');
      if (btn) btn.insertAdjacentHTML('beforeend', ' <span class="adv-badge sm">심화</span>');
    });

    function neighbourReady(step) {
      var j = idx + step;
      while (j >= 0 && j < BOOK.length) {
        if (BOOK[j].ready) return BOOK[j];
        j += step;
      }
      return null;
    }
    var prevCh = neighbourReady(-1);
    var nextCh = neighbourReady(1);

    // writeLast=false 이면 이 장의 진도만 남기고 '이어서 읽기' 기준점은 건드리지 않는다.
    // (#s5 같은 딥링크로 특정 페이지만 열어볼 때 기준점이 그리로 끌려가는 것을 막는다)
    // 완독(✓)은 직전 페이지에서 '다음'으로 마지막 페이지에 왔을 때만 남긴다.
    function remember(writeLast, finished) {
      var p = loadProgress();
      var rec = p[chId] || {};
      rec.screen = cur;
      if (finished && cur === screens.length - 1) rec.done = true;
      p[chId] = rec;
      if (writeLast) p['_last'] = { id: chId, screen: cur };
      saveProgress(p);
    }

    // 주소의 #sN 을 지금 페이지에 맞춰 두면 새로고침·북마크가 그 페이지로 돌아온다.
    // push=true 이면 기록을 하나 쌓아 브라우저의 뒤로 가기로 돌아올 수 있게 한다.
    function setHash(push) {
      var h = '#s' + (cur + 1);
      try {
        if (push) history.pushState(null, '', h);
        else if (location.hash !== h) history.replaceState(null, '', h);
      } catch (e) { /* file:// 에서 막히는 브라우저가 있어도 페이지 넘김은 동작한다 */ }
    }

    function show(i, silentLast, finished, push) {
      cur = Math.max(0, Math.min(screens.length - 1, i));
      Array.prototype.forEach.call(screens, function (s, j) {
        s.classList.toggle('is-active', j === cur);
      });
      Array.prototype.forEach.call(screenItems, function (li, j) {
        li.classList.toggle('on', j === cur);
      });
      cnt.textContent = (cur + 1) + ' / ' + screens.length;
      fill.style.width = ((cur + 1) / screens.length * 100) + '%';

      prevBtn.disabled = (cur === 0 && !prevCh);
      nextBtn.disabled = (cur === screens.length - 1 && !nextCh);
      prevBtn.textContent = (cur === 0 && prevCh) ? '← ' + prevCh.num : '← 이전';
      nextBtn.textContent = (cur === screens.length - 1 && nextCh) ? nextCh.num + ' →' : '다음 →';

      // 사이드바의 현재 페이지 항목이 목차 밖으로 밀려나 있으면 보이게 굴린다(본문은 굴리지 않는다)
      var on = screenItems[cur];
      if (on) {
        var top = on.offsetTop, bottom = top + on.offsetHeight;
        if (top < toc.scrollTop + 40 || bottom > toc.scrollTop + toc.clientHeight - 40) {
          toc.scrollTop = top - toc.clientHeight / 3;
        }
      }

      hideTip();
      try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) { window.scrollTo(0, 0); }
      setHash(push);
      remember(!silentLast, finished);
    }

    prevBtn.addEventListener('click', function () {
      if (cur === 0) { if (prevCh) location.href = prevCh.id + '.html#last'; return; }
      show(cur - 1);
    });
    nextBtn.addEventListener('click', function () {
      if (cur === screens.length - 1) {
        if (nextCh) {
          // 다음 장은 늘 첫 페이지부터 연다. 차례대로 넘어온 것이므로 '이어서 읽기' 기준점도 옮긴다.
          try { sessionStorage.setItem(NAV_KEY, 'seq'); } catch (e) {}
          location.href = nextCh.id + '.html#s1';
        }
        return;
      }
      show(cur + 1, false, cur + 1 === screens.length - 1);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { hideTip(); document.body.classList.remove('toc-open'); return; }
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.repeat || e.defaultPrevented) return;
      var t = e.target;
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || (t.closest && t.closest('[role=slider]'))) return;
      // PageUp/PageDown 은 긴 화면을 굴리는 데 쓰이므로 가로채지 않는다
      if (e.key === 'ArrowRight') { e.preventDefault(); nextBtn.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevBtn.click(); }
    });

    highlightAll(book);
    initTerms(book);
    linkRefs(book, chId, screens.length);
    initTabs(book);
    initQuiz(book);
    initTip();

    /* ── 페이지 참조: 같은 장이면 바로 이동하고, 돌아가기 버튼을 띄운다 ── */
    var back = null;
    function showBack(label, onBack) {
      if (!back) {
        back = document.createElement('div');
        back.id = 'xback';
        back.innerHTML = '<a href="#"></a><button type="button" aria-label="돌아가기 버튼 닫기">✕</button>';
        document.body.appendChild(back);
        back.querySelector('button').addEventListener('click', function () { back.classList.remove('on'); });
      }
      var link = back.querySelector('a');
      link.textContent = '← ' + label + '(으)로 돌아가기';
      link.onclick = function (e) { e.preventDefault(); back.classList.remove('on'); onBack(); };
      back.classList.add('on');
    }

    function jumpTo(n) {
      var from = cur;
      show(n - 1, false, false, true);
      showBack('페이지 ' + (from + 1), function () { show(from, false, false, true); });
    }

    // 다른 장·다른 편으로 가기 전에 지금 자리를 남긴다(도착한 페이지가 돌아가기 버튼을 띄운다)
    function saveBack() {
      var short = meta.num + ' 페이지 ' + (cur + 1);
      try {
        sessionStorage.setItem(BACK_KEY, JSON.stringify({
          url: location.href.split('#')[0] + '#s' + (cur + 1), prefix: CFG.storePrefix,
          short: short, full: (CFG.shortName ? CFG.shortName + ' ' : '') + short, t: Date.now()
        }));
      } catch (err) {}
    }

    document.addEventListener('click', function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;  // 새 탭 열기 등은 그대로
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      var same = a.classList.contains('xref') && !a.classList.contains('xref-ch'), m = /^#s(\d+)$/.exec(href);
      if (same || (m && a.closest('.screen'))) {
        e.preventDefault();
        e.stopPropagation();
        var n = parseInt(same ? a.getAttribute('data-screen') : m[1], 10);
        if (n - 1 !== cur) jumpTo(n);  // 같은 장: 바로 이동하고 돌아가기 버튼을 띄운다
        return;
      }
      // 본문 안에서 이 교재의 다른 페이지(.html)로 가는 링크(자동 참조 링크와 손으로 넣은 링크 모두)
      // 장 끝 안내(.chapter-end: 다음 장·표지)와 표지(index.html)로 가는 링크는 순서대로 읽는 이동이라 남기지 않는다
      if (!a.closest('.screen') || a.closest('.chapter-end') || a.target === '_blank') return;
      if (/^[a-z][a-z0-9+.-]*:|^\/\//i.test(href) || !/\.html(#|$)/.test(href) || /(^|\/)index\.html(#|$)/.test(href)) return;
      var u = new URL(href, location.href), um = /^#s(\d+)$/.exec(u.hash);
      if (u.pathname === location.pathname && um) {  // 파일 이름을 붙여 같은 장을 가리킨 링크
        e.preventDefault();
        e.stopPropagation();
        if (+um[1] - 1 !== cur) jumpTo(+um[1]);
        return;
      }
      saveBack();  // 이동은 그대로 한다
    }, true);

    // 브라우저의 뒤로/앞으로 가기로 #sN 이 바뀌면 그 페이지를 보인다
    window.addEventListener('popstate', function () {
      var m = /^#s(\d+)$/.exec(location.hash);
      if (m) show(parseInt(m[1], 10) - 1);
      if (back) back.classList.remove('on');
    });
    window.addEventListener('hashchange', function () {
      var m = /^#s(\d+)$/.exec(location.hash);
      if (m && parseInt(m[1], 10) - 1 !== cur) show(parseInt(m[1], 10) - 1);
    });
    window.addEventListener('beforeprint', function () {
      Array.prototype.forEach.call(document.querySelectorAll('details.fold'), function (d) { d.open = true; });
    });

    // 시작 페이지 결정: #last → 마지막, #s3 → 3번째, 그 외에는 저장된 진도
    var start = 0;
    var hash = location.hash;
    var seq = false;
    try { seq = sessionStorage.getItem(NAV_KEY) === 'seq'; sessionStorage.removeItem(NAV_KEY); } catch (e) {}
    if (hash === '#last') {
      start = screens.length - 1;
    } else if (/^#s\d+$/.test(hash)) {
      start = parseInt(hash.slice(2), 10) - 1;
    } else {
      var saved = loadProgress()[chId];
      if (saved && typeof saved.screen === 'number') start = saved.screen;
    }
    show(start, !!hash && !seq);

    // 다른 장의 참조 링크로 왔으면 원래 자리로 돌아가는 버튼을 띄운다
    try {
      var from = JSON.parse(sessionStorage.getItem(BACK_KEY) || 'null');
      sessionStorage.removeItem(BACK_KEY);
      if (from && from.url && Date.now() - from.t < BACK_TTL && from.url.split('#')[0] !== location.href.split('#')[0]) {
        showBack(from.prefix === CFG.storePrefix ? from.short : from.full, function () { location.href = from.url; });
      }
    } catch (e) {}
  }

  /* ── 표지(index.html) 초기화 ────────────────────────────────── */
  function initCover() {
    try { sessionStorage.removeItem(BACK_KEY); } catch (e) {}  // 표지에 오면 남은 돌아가기 자리를 지운다
    var progress = loadProgress();
    var list = document.getElementById('toc-list');
    if (list) {
      var lastPart = null;
      BOOK.forEach(function (ch) {
        if (ch.part !== lastPart) {
          lastPart = ch.part;
          var h = document.createElement('div');
          h.className = 'parts';
          h.textContent = ch.part;
          list.appendChild(h);
        }
        var li = document.createElement('li');
        var done = progress[ch.id] && progress[ch.id].done;
        var meta = ch.hours ? (ch.screens + '페이지 · ' + ch.hours + '시간') : '';
        var inner =
          '<span class="n">' + ch.num + '</span>' +
          '<span class="t">' + ch.title + (done ? ' <span class="tick">✓</span>' : '') + '</span>' +
          '<span class="meta">' + (ch.ready ? meta : '집필 예정') + '</span>';
        if (ch.ready) {
          li.innerHTML = '<a href="' + ch.id + '.html">' + inner + '</a>';
        } else {
          li.innerHTML = '<span class="off">' + inner + '</span>';
        }
        list.appendChild(li);
      });
    }

    var resume = document.getElementById('resume');
    if (resume && !BOOK.some(function (c) { return c.ready; })) {
      resume.parentNode.removeChild(resume);   // 집필된 장이 없으면 읽기 시작 버튼을 두지 않는다
    } else if (resume) {
      var last = progress['_last'];
      var target = BOOK[0];
      if (last) {
        BOOK.forEach(function (c) { if (c.id === last.id && c.ready) target = c; });
      }
      if (last && target.id === last.id && last.screen > 0) {
        resume.href = target.id + '.html#s' + (last.screen + 1);
        resume.textContent = '이어서 읽기 — ' + target.num + ' 페이지 ' + (last.screen + 1);
      } else {
        resume.href = target.id + '.html';
        resume.textContent = '처음부터 읽기 — ' + target.num;
      }
    }

    highlightAll(document);
    initTerms(document);
    initTabs(document);
    initQuiz(document);
    initTip();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.documentElement.dataset.page === 'cover') initCover();
    else initChapter();
  });
})();
