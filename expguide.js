/* No Man's Sky Hub — "Milestones & tips" for the current expedition (2026-10-09).
   Lazy: nothing is fetched until the button is pressed. Data: NMS Wiki via codex.js. */
(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function run() {
    var bar = document.querySelector('.exp-bar'); if (!bar || !window.NMSCodex) return;
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'exp-guide-btn';
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'expGuide');
    btn.innerHTML = '<span>MILESTONES &amp; TIPS</span><span class="chev" aria-hidden="true">▾</span>';
    var box = document.createElement('div'); box.className = 'exp-guide'; box.id = 'expGuide'; box.hidden = true;
    // the two buttons sit side by side under the expedition card; the guide opens below them
    var row = document.createElement('div'); row.className = 'exp-actions';
    var al = document.createElement('div'); al.innerHTML = '<a class="exp-alert-link" href="https://weather.nomansskyhub.app/?alerts=exp" target="_blank" rel="noopener" title="Notifications when an expedition starts and 24 hours before it ends">🔔 EXPEDITION ALERTS</a>';
    row.appendChild(btn); row.appendChild(al.firstChild);
    bar.parentNode.insertBefore(row, bar.nextSibling); row.parentNode.insertBefore(box, row.nextSibling);
    var loaded = false, guide = null, cur = 1;
    function draw() {
      var p = guide.phases.filter(function (x) { return x.phase === cur; })[0] || guide.phases[0];
      box.innerHTML = '<div class="eg-tabs" role="tablist">' + guide.phases.map(function (x) {
          return '<button type="button" role="tab" data-p="' + x.phase + '" aria-selected="' + (x.phase === p.phase) + '">PHASE ' + x.phase + '</button>';
        }).join('') + '</div><ol class="eg-list">' + p.milestones.map(function (m) {
          return '<li><span class="eg-n">' + m.no + '</span><span class="eg-name">' + esc(m.name) + '</span><span class="eg-req">' + esc(m.req) + '</span>' +
            (m.hint ? '<span class="eg-hint">◈ ' + esc(m.hint) + '</span>' : '') +
            (m.rewards.length ? '<span class="eg-rew">REWARDS · ' + esc(m.rewards.join(' · ')) + '</span>' : '') + '</li>';
        }).join('') + '</ol><div class="eg-src">From the <a href="' + guide.url + '" target="_blank" rel="noopener">No Man\'s Sky Wiki</a> · ask <a href="https://atlas.nomansskyhub.app/" target="_blank" rel="noopener">ATLAS</a> "phase ' + p.phase + ' milestones" or "how do I make…"</div>';
      [].forEach.call(box.querySelectorAll('.eg-tabs button'), function (b) { b.addEventListener('click', function () { cur = +b.getAttribute('data-p'); draw(); }); });
    }
    function load() {
      loaded = true;
      box.innerHTML = '<div class="eg-status">CONTACTING THE ARCHIVE…</div>';
      var name = (document.getElementById('expName') || {}).textContent || '';
      if (/CONNECTING/i.test(name)) name = '';
      NMSCodex.expedition(name || 'Expedition').then(function (g) {
        if (!g || !g.phases.length) throw new Error('none');
        guide = g; draw();
      }).catch(function () { loaded = false; box.innerHTML = '<div class="eg-status">THE ARCHIVE HAS NO MILESTONE LIST FOR THIS EXPEDITION YET — TRY AGAIN LATER.</div>'; });
    }
    btn.addEventListener('click', function () {
      var open = box.hidden; box.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && !loaded) load();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
