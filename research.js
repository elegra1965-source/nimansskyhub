/* Community Research strip inside the expedition box (live from the Galactic Atlas,
   same /nms-api/ proxy as the expedition bar). Hidden until real data arrives, so it
   never shows a broken or made-up number. */
(function () {
  /* The Atlas 'Community Research' point of interest is mission 116 (missionTiers 2) on the same API the
     expedition bar uses: {currentTier, totalTiers, tierPercentage, percentage}. Checked 2026-10-20. */
  var MISSION = 116;
  var SRC = '/nms-api/mission/' + MISSION + '?platform=merged';
  var LINK = 'https://galacticatlas.nomanssky.com/poi/community-research';
  var bar = document.querySelector('.exp-bar');
  if (!bar) return;

  var row = document.createElement('a');
  row.className = 'res-row'; row.href = LINK; row.target = '_blank'; row.rel = 'noopener';
  row.hidden = true;
  row.innerHTML =
    '<span class="res-label">◆ COMMUNITY RESEARCH</span>' +
    '<span class="res-tier" id="resTier">TIER –</span>' +
    '<div class="res-track"><div class="res-fill" id="resFill"></div></div>' +
    '<span class="res-pct" id="resPct">--%</span>' +
    '<span class="res-meta">Quicksilver Synthesis Companion unlocks more collectables as Travellers submit data ›</span>';
  var meta = bar.querySelector('.exp-meta');
  bar.insertBefore(row, meta ? meta.nextSibling : null);

  function num(v) { v = typeof v === 'string' ? parseFloat(v) : v; return typeof v === 'number' && isFinite(v) ? v : null; }
  /* Atlas mission JSON -> tier + percentage through the current tier (what the official sidebar shows) */
  function read(j) {
    if (!j || typeof j !== 'object') return null;
    if (Array.isArray(j)) j = j[0];
    if (j && j.data) j = j.data;
    var tier = num(j.currentTier), of = num(j.totalTiers), pct = num(j.tierPercentage);
    if (tier == null || pct == null) return null;
    return { tier: tier, of: of, pct: Math.max(0, Math.min(100, pct)), total: num(j.percentage) };
  }
  function show(d) {
    document.getElementById('resTier').textContent = 'TIER ' + d.tier + (d.of ? ' OF ' + d.of : '');
    document.getElementById('resPct').textContent = d.pct.toFixed(1) + '%';
    document.getElementById('resFill').style.width = d.pct + '%';
    row.hidden = false;
    if (window.NMS_LIVE) window.NMS_LIVE.research = d;
  }
  function update() {
    var ac = ('AbortController' in window) ? new AbortController() : null,
        tm = setTimeout(function () { if (ac) ac.abort(); }, 6000);
    var p = window.NMS_RESEARCH_MOCK ? Promise.resolve(window.NMS_RESEARCH_MOCK)
      : fetch(SRC, ac ? { signal: ac.signal } : undefined).then(function (r) { if (!r.ok) throw 0; return r.json(); });
    p.then(function (j) { clearTimeout(tm); var d = read(j); if (d) show(d); })
     .catch(function () { clearTimeout(tm); });
  }
  update(); setInterval(update, 10 * 60000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') update(); });
})();
