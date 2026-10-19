/* No Man's Sky Hub — phone helpers (2026-10-09). Adds the jump bar's "you are here",
   node dots, dialer fold toggles and back-to-top. All of it is hidden on desktop by mobile.css. */
(function () {
  var MQ = window.matchMedia('(max-width:760px)');
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }

  function jumpbar() {
    var bar = $('#jumpbar'); if (!bar || !('IntersectionObserver' in window)) return;
    var links = [].slice.call(bar.querySelectorAll('a'));
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + e.target.id;
          a.classList.toggle('on', on);
          if (on && MQ.matches && a.scrollIntoView) bar.scrollTo({ left: a.offsetLeft - 10, behavior: reduce ? 'auto' : 'smooth' });
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var watch = function () { var t = document.getElementById(id); if (t) { io.observe(t); return true; } };
      // #alliances, #discoveries etc. are added later by their scripts once their feeds
      // load, which can take several seconds on a phone -- keep looking for up to 20 s
      // (one try at 1.5 s used to miss them, leaving the previous tab highlighted).
      var tries = 0;
      (function retry() { if (!watch() && tries++ < 20) setTimeout(retry, 1000); })();
    });
  }

  function nodeDots() {
    var grid = $('.grid-nodes'); if (!grid) return;
    var cards = [].slice.call(grid.children);
    var dots = document.createElement('div'); dots.className = 'node-dots'; dots.setAttribute('role', 'tablist');
    cards.forEach(function (c, i) {
      var b = document.createElement('button'); b.type = 'button';
      b.setAttribute('aria-label', 'Show ' + (c.getAttribute('data-node') || 'node ' + (i + 1)));
      b.addEventListener('click', function () { grid.scrollTo({ left: c.offsetLeft - (grid.clientWidth - c.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); });
      dots.appendChild(b);
    });
    var hint = document.createElement('span'); hint.className = 'node-swipe'; hint.textContent = '‹ SWIPE FOR ALL SIX NODES ›';
    grid.parentNode.insertBefore(dots, grid.nextSibling);
    dots.parentNode.insertBefore(hint, dots.nextSibling);
    var t;
    function mark() {
      var mid = grid.scrollLeft + grid.clientWidth / 2, best = 0, bd = 1e9;
      cards.forEach(function (c, i) { var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
      [].forEach.call(dots.children, function (b, i) { b.classList.toggle('on', i === best); });
      if (best > 0) hint.style.visibility = 'hidden';
    }
    grid.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(mark, 60); }, { passive: true });
    mark();
  }

  function dialerFolds() {
    var dialer = $('#dialer'), pick = $('#dialer .galaxy-pick'), saved = $('#savedBox');
    if (dialer && pick) {
      var how = document.createElement('button'); how.type = 'button'; how.className = 'dial-how';
      how.setAttribute('aria-expanded', 'false');
      how.innerHTML = '<span>HOW IT WORKS</span><span class="chev" aria-hidden="true">▾</span>';
      how.addEventListener('click', function () {
        var open = dialer.classList.toggle('how-open'); how.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      pick.parentNode.insertBefore(how, pick.nextSibling);
    }
    if (saved) {
      var tg = document.createElement('button'); tg.type = 'button'; tg.className = 'saved-toggle';
      tg.setAttribute('aria-expanded', 'false');
      var list = $('#savedList');
      var label = function () {
        var n = list ? list.children.length : 0;
        tg.innerHTML = '<span>★ MY SAVED ADDRESSES' + (n ? ' (' + n + ')' : '') + '</span><span class="chev" aria-hidden="true">▾</span>';
      };
      label();
      if (list && 'MutationObserver' in window) new MutationObserver(label).observe(list, { childList: true });
      tg.addEventListener('click', function () {
        var open = saved.classList.toggle('open'); tg.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      saved.insertBefore(tg, saved.firstChild);
    }
  }

  function toTop() {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'to-top'; b.setAttribute('aria-label', 'Back to top');
    b.textContent = '↑';
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    document.body.appendChild(b);
    var t;
    window.addEventListener('scroll', function () {
      if (t) return;
      t = setTimeout(function () { t = null; b.classList.toggle('show', window.scrollY > window.innerHeight * 1.5); }, 120);
    }, { passive: true });
  }

  function translatorFold() {
    var tr = $('#translator'), inp = $('#trIn'); if (!tr || !inp) return;
    var hint = document.createElement('span'); hint.className = 'tr-hint'; hint.textContent = '▸ TAP TO SEE IT IN NMS TEXT';
    inp.parentNode.insertBefore(hint, inp.nextSibling);
    var start = inp.value;
    var open = function () { tr.classList.add('tr-on'); };
    inp.addEventListener('focus', open); inp.addEventListener('input', open);
    // tapped in by accident? when you leave the box without changing the text (or after clearing it),
    // it folds away again. Taps on Copy/Download inside the panel don't count as leaving.
    inp.addEventListener('blur', function () {
      setTimeout(function () {
        if (tr.contains(document.activeElement)) return;
        var v = inp.value.trim();
        if (!v || v === start) tr.classList.remove('tr-on');
      }, 250);
    });
  }

  function run() { jumpbar(); nodeDots(); dialerFolds(); translatorFold(); toTop(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
