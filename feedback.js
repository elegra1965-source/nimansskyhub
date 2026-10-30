/* No Man's Sky Hub — Reviews & feedback pop-up (2026-10-30, Tony).
   Footer button "★ REVIEWS & FEEDBACK" (#fbOpen) opens a small window, so the page
   itself gets no longer. Two tabs:
   - SEND FEEDBACK: what it's about (Review / Bug / Idea or request), which tools
     (tap all that apply), stars (reviews only), the message, optional name and,
     for reviews only, an "OK to show this on the site" switch. Bug reports also
     send the device type, browser, screen size and Hub version (nothing personal).
     Posts to /.netlify/functions/feedback, which saves it and emails Tony with the
     type in the subject ([BUG] / [IDEA] / [REVIEW]).
   - WHAT TRAVELLERS SAY: reviews Tony has approved. The same reviews also scroll
     past in the "Live from the Galactic Map" tape (ticker.js); tapping one opens here.
   X, tapping outside, Esc and the phone's Back button close it.
   window.NMSFeedback = { open(), openReviews(), close() }
   window.NMS_REVIEWS = Promise of the approved reviews ([{q,s,w,tools,d}]) */
(function () {
  'use strict';
  var API = '/.netlify/functions/feedback';
  var TOOLS = [['hub', 'Hub'], ['map', 'Galactic Map'], ['atlas', 'ATLAS'], ['weather', 'Weather'], ['translator', 'Translator'], ['theme', 'Theme Pack']];
  var TNAME = {}; TOOLS.forEach(function (t) { TNAME[t[0]] = t[1]; });
  function T(s, v) { return window.NMS_T ? window.NMS_T(s, v) : s; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  window.NMS_REVIEWS = fetch(API + '?reviews=1').then(function (r) { return r.ok ? r.json() : { reviews: [] }; })
    .then(function (j) { return (j && j.reviews) || []; }).catch(function () { return []; });

  var btn = document.getElementById('fbOpen');
  if (!btn) return;

  var TYPE = {
    review: { tools: 'WHICH TOOLS HAVE YOU USED?', text: 'WHAT DO YOU LIKE, OR WHAT COULD BE BETTER?', ph: 'Tell us anything: a favourite feature, something to improve…' },
    bug: { tools: 'WHICH TOOL?', text: 'WHAT WENT WRONG?', ph: 'What did you tap, and what happened?' },
    idea: { tools: 'WHICH TOOL?', text: 'WHAT WOULD YOU LIKE ADDED OR CHANGED?', ph: 'Describe your idea…' }
  };

  var d = el('div'); d.id = 'fbDlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'fbTitle');
  d.innerHTML =
    '<div id="fbBox">' +
      '<div class="fb-head"><span class="kicker" id="fbTitle">◆ REVIEWS &amp; FEEDBACK</span><button type="button" id="fbClose" aria-label="Close">✕</button></div>' +
      '<div class="fb-tabs" role="tablist"><button type="button" role="tab" aria-selected="true" data-t="send">SEND FEEDBACK</button><button type="button" role="tab" aria-selected="false" data-t="say">WHAT TRAVELLERS SAY</button></div>' +
      '<form class="fb-form" id="fbForm" novalidate>' +
        '<div><p class="fb-lbl">WHAT\'S IT ABOUT?</p><div class="fb-chips fb-type" role="radiogroup">' +
          '<label><input type="radio" name="fbType" value="review" checked><span><b class="fb-star" aria-hidden="true">★</b>Review</span></label>' +
          '<label><input type="radio" name="fbType" value="bug"><span><img class="fb-ico" src="assets/fb-bug.webp" alt="" width="24" height="24">Bug</span></label>' +
          '<label><input type="radio" name="fbType" value="idea"><span><img class="fb-ico" src="assets/fb-idea.webp" alt="" width="24" height="24">Idea / request</span></label></div></div>' +
        '<div><p class="fb-lbl"><span id="fbToolsLbl">WHICH TOOLS HAVE YOU USED?</span> <small>(TAP ALL THAT APPLY)</small></p><div class="fb-chips" id="fbTools" translate="no"></div></div>' +
        '<div id="fbRateWrap"><p class="fb-lbl">RATING <small>(OPTIONAL)</small></p><div class="fb-stars" id="fbStars" role="radiogroup" aria-label="Rating"></div></div>' +
        '<div><p class="fb-lbl" id="fbTextLbl">WHAT DO YOU LIKE, OR WHAT COULD BE BETTER?</p>' +
          '<textarea class="fb-ta" id="fbText" maxlength="1000" placeholder="Tell us anything: a favourite feature, something to improve…" aria-labelledby="fbTextLbl"></textarea>' +
          '<div class="fb-count"><span id="fbCount">0</span>/1000</div></div>' +
        '<div><p class="fb-lbl" id="fbNameLbl">YOUR NAME <small>(OPTIONAL)</small></p><input class="fb-in" id="fbName" maxlength="40" autocomplete="nickname" placeholder="Traveller, Reddit or Discord name" aria-labelledby="fbNameLbl"></div>' +
        '<label class="fb-sw" id="fbShowWrap"><input type="checkbox" id="fbShow"><span>OK to show this on the site (with my name, if given)</span></label>' +
        '<input class="fb-hp" name="website" id="fbHp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="fb-note" id="fbDevNote" hidden>Your device type and browser are added so it can be fixed faster. Nothing personal.</p>' +
        '<p class="fb-note">elegra1965 reads every message. Nothing goes on the site without his OK.</p>' +
        '<p class="fb-err" id="fbErr" role="alert" hidden></p>' +
        '<button type="submit" class="fb-send" id="fbSend" disabled>SEND</button>' +
      '</form>' +
      '<div class="fb-done" id="fbDone" hidden><div class="tick" aria-hidden="true">✓</div><h3>TRANSMISSION RECEIVED</h3>' +
        '<p class="fb-note">Thanks, traveller. Your feedback has been sent.</p>' +
        '<div class="row"><button type="button" class="btn" id="fbAgain">SEND ANOTHER</button><button type="button" class="btn" id="fbDoneClose">CLOSE</button></div></div>' +
      '<div class="fb-say" id="fbSay" hidden></div>' +
    '</div>';
  document.body.appendChild(d);

  var $ = function (id) { return document.getElementById(id); };
  var f = $('fbForm'), t = $('fbText'), send = $('fbSend'), done = $('fbDone'), say = $('fbSay'), err = $('fbErr');
  var tabs = d.querySelectorAll('.fb-tabs button'), rating = 0, sent = false, lastFocus = null;

  TOOLS.forEach(function (x) {
    var l = el('label'), i = el('input'), s = el('span', null, x[1]);
    i.type = 'checkbox'; i.name = 'fbTool'; i.value = x[0]; l.appendChild(i); l.appendChild(s); $('fbTools').appendChild(l);
  });
  for (var k = 1; k <= 5; k++) {
    var sb = el('button', null, '★'); sb.type = 'button'; sb.dataset.s = k; sb.setAttribute('aria-label', k + (k === 1 ? ' star' : ' stars')); sb.setAttribute('aria-pressed', 'false');
    $('fbStars').appendChild(sb);
  }

  function type() { var c = f.querySelector('input[name=fbType]:checked'); return c ? c.value : 'review'; }
  function applyType() {
    var ty = type(), c = TYPE[ty];
    $('fbToolsLbl').textContent = T(c.tools);
    $('fbTextLbl').textContent = T(c.text);
    t.placeholder = T(c.ph);
    $('fbRateWrap').hidden = ty !== 'review';
    $('fbShowWrap').hidden = ty !== 'review';
    $('fbDevNote').hidden = ty !== 'bug';
  }
  f.addEventListener('change', function (e) { if (e.target.name === 'fbType') applyType(); });
  document.addEventListener('nms-lang', function () { applyType(); if (!say.hidden) renderSay(); });

  function check() { send.disabled = t.value.trim().length < 3; }
  t.addEventListener('input', function () { $('fbCount').textContent = t.value.length; check(); err.hidden = true; });
  $('fbStars').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    rating = +b.dataset.s === rating ? 0 : +b.dataset.s;
    $('fbStars').querySelectorAll('button').forEach(function (x) { var on = +x.dataset.s <= rating; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(+x.dataset.s === rating)); });
  });

  function showTab(which) {
    tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x.dataset.t === which)); });
    var s = which === 'say';
    say.hidden = !s; f.hidden = s || sent; done.hidden = s || !sent;
    if (s) renderSay();
  }
  tabs.forEach(function (b) { b.addEventListener('click', function () { showTab(b.dataset.t); }); });

  function renderSay() {
    say.textContent = ''; say.appendChild(el('p', 'fb-empty', T('Loading…')));
    window.NMS_REVIEWS.then(function (list) {
      say.textContent = '';
      if (!list.length) say.appendChild(el('p', 'fb-empty', T('No reviews yet. Be the first: pick Review, write a few words and switch on “OK to show”.')));
      var loc = (window.NMS_LANG && window.NMS_LANG()) || 'en';
      list.forEach(function (r) {
        var q = el('div', 'fb-q'), p = el('p');
        if (r.s) { p.appendChild(el('span', 'st', '★'.repeat(r.s))); p.appendChild(document.createTextNode(' ')); }
        var txt = el('span', null, r.q); txt.setAttribute('translate', 'no'); p.appendChild(txt);
        var c = el('cite'); c.setAttribute('translate', 'no');
        var bits = [r.w || 'A traveller'];
        if (r.tools && r.tools.length) bits.push(r.tools.map(function (x) { return TNAME[x] || x; }).join(', '));
        try { bits.push(new Date(r.d).toLocaleDateString(loc, { month: 'short', year: 'numeric' })); } catch (e) {}
        c.textContent = bits.join(' · ').toUpperCase();
        q.appendChild(p); q.appendChild(c); say.appendChild(q);
      });
      var w = el('button', 'btn', T('✎ WRITE YOUR OWN')); w.type = 'button';
      w.addEventListener('click', function () { if (sent) reset(); showTab('send'); });
      say.appendChild(w);
    });
  }

  function open() {
    if (d.classList.contains('show')) return;
    lastFocus = document.activeElement;
    applyType();
    d.classList.add('show'); document.documentElement.classList.add('fb-open');
    document.documentElement.style.overflow = 'hidden';
    try { history.pushState({ fb: 1 }, ''); } catch (e) {}
    setTimeout(function () { $('fbClose').focus(); }, 30);
  }
  function close(fromBack) {
    if (!d.classList.contains('show')) return;
    d.classList.remove('show'); document.documentElement.classList.remove('fb-open');
    document.documentElement.style.overflow = '';
    if (!fromBack && history.state && history.state.fb) history.back();
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }
  function reset() {
    sent = false; f.reset(); rating = 0; t.value = '';
    $('fbCount').textContent = '0'; err.hidden = true;
    $('fbStars').querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
    applyType(); check();
  }
  window.NMSFeedback = { open: function () { open(); showTab('send'); }, openReviews: function () { open(); showTab('say'); }, close: function () { close(); } };

  btn.addEventListener('click', function () { open(); showTab('send'); });
  $('fbClose').addEventListener('click', function () { close(); });
  $('fbDoneClose').addEventListener('click', function () { close(); });
  $('fbAgain').addEventListener('click', function () { reset(); showTab('send'); t.focus(); });
  d.addEventListener('click', function (e) { if (e.target === d) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.classList.contains('show')) close(); });
  window.addEventListener('popstate', function () { close(true); });

  function browser() {
    var u = navigator.userAgent, b = 'Browser', o = '';
    var m;
    if ((m = u.match(/SamsungBrowser\/(\d+)/))) b = 'Samsung ' + m[1];
    else if ((m = u.match(/Edg\/(\d+)/))) b = 'Edge ' + m[1];
    else if ((m = u.match(/OPR\/(\d+)/))) b = 'Opera ' + m[1];
    else if ((m = u.match(/Firefox\/(\d+)/))) b = 'Firefox ' + m[1];
    else if ((m = u.match(/CriOS\/(\d+)/)) || (m = u.match(/Chrome\/(\d+)/))) b = 'Chrome ' + m[1];
    else if ((m = u.match(/Version\/(\d+).*Safari/))) b = 'Safari ' + m[1];
    if (/Android/.test(u)) o = 'Android'; else if (/iPhone|iPad|iPod/.test(u)) o = 'iOS'; else if (/Windows/.test(u)) o = 'Windows';
    else if (/Mac OS X/.test(u)) o = 'Mac'; else if (/CrOS/.test(u)) o = 'ChromeOS'; else if (/Linux/.test(u)) o = 'Linux';
    return b + (o ? ' / ' + o : '');
  }
  function hubVersion() {
    if (!window.caches) return Promise.resolve('');
    return caches.keys().then(function (ks) { return ks.filter(function (k) { return /^nms-hub-/.test(k); })[0] || ''; }).catch(function () { return ''; });
  }

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (send.disabled) return;
    var ty = type();
    send.disabled = true; send.textContent = T('SENDING…'); err.hidden = true;
    hubVersion().then(function (ver) {
      var body = {
        type: ty,
        tools: [].map.call(f.querySelectorAll('input[name=fbTool]:checked'), function (x) { return x.value; }),
        rating: ty === 'review' ? rating : 0,
        text: t.value.trim(),
        name: $('fbName').value.trim(),
        show: ty === 'review' && $('fbShow').checked,
        website: $('fbHp').value,
        info: {
          app: ver, lang: (window.NMS_LANG && window.NMS_LANG()) || 'en',
          screen: ty === 'bug' ? (innerWidth + 'x' + innerHeight) : '',
          installed: ty === 'bug' && !!(window.matchMedia && matchMedia('(display-mode: standalone)').matches || navigator.standalone),
          browser: ty === 'bug' ? browser() : ''
        }
      };
      return fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    }).then(function (r) {
      if (r.status === 429) throw 'slow';
      if (!r.ok) throw 'fail';
      sent = true; showTab('send');
      try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: 'feedback/' + ty, event: true }); } catch (x) {}
    }).catch(function (x) {
      err.textContent = T(x === 'slow' ? 'Too many sends. Try again in an hour.' : 'Couldn\'t send. Check your connection and try again.');
      err.hidden = false;
    }).then(function () { send.textContent = T('SEND'); check(); });
  });
})();
