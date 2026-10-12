/* No Man's Sky Hub — Traveller ID (2026-10-09).
   Name, platform, NMS friend code (optional, 2026-10-13) and home galaxy, saved once here and read by the sister apps through a
   small cookie on .nomansskyhub.app (no account, nothing sent to a server):
   ATLAS greets you by name, the Galactic Map opens in your home galaxy, and the Weather
   station's planet card carries your name. */
(function () {
  var K = 'nmsTraveller', PLAT = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mac'];
  function read() { try { var m = document.cookie.match(/(?:^|; )nmsTraveller=([^;]*)/); return m ? JSON.parse(decodeURIComponent(m[1])) : {}; } catch (e) { return {}; } }
  function write(o) {
    var dom = /(^|\.)nomansskyhub\.app$/.test(location.hostname) ? '; domain=.nomansskyhub.app' : '';
    document.cookie = K + '=' + (o ? encodeURIComponent(JSON.stringify(o)) : '') + dom + '; path=/; max-age=' + (o ? 31536000 : 0) + '; samesite=lax' + (location.protocol === 'https:' ? '; secure' : '');
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function run() {
    var foot = document.querySelector('footer'); if (!foot) return;
    var gs = document.getElementById('galaxySel');
    var gal = gs ? gs.innerHTML : '<option value="0">1 · Euclid</option>';
    var t = read();
    var sec = document.createElement('section'); sec.className = 'tid wrap'; sec.id = 'traveller';
    sec.innerHTML =
      '<div class="tid-card"><span class="tid-c a"></span><span class="tid-c b"></span>' +
      '<div class="kicker">TRAVELLER ID</div><h2 class="h2 tid-h">Tell the network who you are</h2>' +
      '<p class="tid-sub">Set it once. ATLAS greets you by name, the Galactic Map opens in your home galaxy and your Weather planet card carries your name. Kept on this device only.</p>' +
      '<button type="button" class="tid-sum" aria-expanded="false"><span class="tid-sum-t"></span><span class="tid-sum-e">EDIT <span class="chev">▾</span></span></button>' +
      '<form class="tid-form" autocomplete="off">' +
      '<label><span>NAME</span><input id="tidName" maxlength="24" placeholder="Your in-game name"></label>' +
      '<label><span>PLATFORM</span><select id="tidPlat"><option value="">Choose…</option>' + PLAT.map(function (p) { return '<option>' + p + '</option>'; }).join('') + '</select></label>' +
      '<label><span>NMS FRIEND CODE <em>optional</em></span><input id="tidCode" maxlength="16" placeholder="e.g. 1ABC-D2EF-3GH4J" spellcheck="false" autocapitalize="characters"></label>' +
      '<label><span>HOME GALAXY</span><select id="tidGal">' + gal + '</select></label>' +
      '<div class="tid-btns"><button class="tid-save" type="submit">◈ SAVE TRAVELLER ID</button><button class="tid-clear" type="button">Forget me</button></div>' +
      '</form><div class="tid-status" role="status" aria-live="polite"></div></div>';
    foot.parentNode.insertBefore(sec, foot);
    var n = sec.querySelector('#tidName'), p = sec.querySelector('#tidPlat'), g = sec.querySelector('#tidGal'), st = sec.querySelector('.tid-status'), fc = sec.querySelector('#tidCode');
    if (t.n) n.value = t.n; if (t.fc) fc.value = t.fc; if (t.p) p.value = t.p; g.value = String(t.g >= 0 ? t.g : 0);
    var card = sec.querySelector('.tid-card'), sum = sec.querySelector('.tid-sum');
    // once saved the card folds to one line; EDIT opens the form again
    function show() {
      var o = read();
      st.innerHTML = o.n ? '✓ WELCOME, TRAVELLER <b>' + esc(o.n.toUpperCase()) + '</b>' + (o.p ? ' · ' + esc(o.p.toUpperCase()) : '') : '';
      // line 1: name · platform; line 2: home galaxy, centred under them
      sec.querySelector('.tid-sum-t').innerHTML = o.n ? '<span class="tid-l1">◈ <b>' + esc(o.n.toUpperCase()) + '</b>' + (o.p ? ' · ' + esc(o.p.toUpperCase()) : '') + '</span>' + (o.gn ? '<span class="tid-l2">' + esc(o.gn.toUpperCase()) + '</span>' : '') : '';
      card.classList.toggle('tid-done', !!o.n); card.classList.remove('tid-edit'); sum.setAttribute('aria-expanded', 'false');
    }
    sum.addEventListener('click', function () { var op = card.classList.toggle('tid-edit'); sum.setAttribute('aria-expanded', op ? 'true' : 'false'); if (op) n.focus(); });
    show();
    sec.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = n.value.replace(/[^\p{L}\p{N} ._'-]/gu, '').trim().slice(0, 24);
      if (!name) { st.textContent = 'Add a name first, Traveller.'; n.focus(); return; }
      var gi = Math.max(0, Math.min(255, parseInt(g.value, 10) || 0)), go = g.options[g.selectedIndex];
      var code = fc.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 16); fc.value = code;
      write({ n: name, p: PLAT.indexOf(p.value) >= 0 ? p.value : '', fc: code, g: gi, gn: go ? go.textContent.replace(/^\d+\s*·\s*/, '') : '' });
      show();
    });
    sec.querySelector('.tid-clear').addEventListener('click', function () { write(null); n.value = ''; p.value = ''; fc.value = ''; g.value = '0'; card.classList.remove('tid-done', 'tid-edit'); st.textContent = 'Forgotten. Nothing about you is stored now.'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
