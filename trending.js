/* No Man's Sky Hub — "🔥 Trending this week" (2026-10-19, Tony).
   The Galactic Map's most-viewed charted systems this week: medals for the top 3,
   rank arrows, "last week's #1", and a link to the full list on the map. Also puts
   the medal on a top-3 system's card in "Charted by travellers". Same look as the
   alliance top 5. Reads the map's small trending feed; hidden if it fails or is empty
   (no "0 views" anywhere). The ticker tape (ticker.js) reads the same feed. */
(function () {
  var MAP = 'https://map.nomansskyhub.app';
  var FEED = MAP + '/.netlify/functions/trending';
  var MEDAL = ['🥇', '🥈', '🥉'];
  var GAL = ['Euclid','Hilbert Dimension','Calypso','Hesperius Dimension','Hyades','Ickjamatew','Budullangr','Kikolgallr','Eltiensleen','Eissentam','Elkupalos','Aptarkaba','Ontiniangp','Odiwagiri','Ogtialabi','Muhacksonto','Hitonskyer','Rerasmutul','Isdoraijung','Doctinawyra','Loychazinq','Zukasizawa','Ekwathore','Yeberhahne','Twerbetek','Sivarates','Eajerandal','Aldukesci','Wotyarogii','Sudzerbal','Maupenzhay','Sugueziume','Brogoweldian','Ehbogdenbu','Ijsenufryos','Nipikulha','Autsurabin','Lusontrygiamh','Rewmanawa','Ethiophodhe','Urastrykle','Xobeurindj','Oniijialdu','Wucetosucc','Ebyeloof','Odyavanta','Milekistri','Waferganh','Agnusopwit','Teyaypilny','Zalienkosm','Ladgudiraf','Mushonponte','Amsentisz','Fladiselm','Laanawemb','Ilkerloor','Davanossi','Ploehrliou','Corpinyaya','Leckandmeram','Quulngais','Nokokipsechl','Rinblodesa','Loydporpen','Ibtrevskip','Elkowaldb','Heholhofsko','Yebrilowisod','Husalvangewi',"Ovna'uesed",'Bahibusey','Nuybeliaure','Doshawchuc','Ruckinarkh','Thorettac','Nuponoparau','Moglaschil','Uiweupose','Nasmilete','Ekdaluskin','Hakapanasy','Dimonimba','Cajaccari','Olonerovo','Umlanswick','Henayliszm','Utzenmate','Umirpaiya','Paholiang','Iaereznika','Yudukagath','Boealalosnj','Yaevarcko','Coellosipp','Wayndohalou','Smoduraykl','Apmaneessu','Hicanpaav','Akvasanta','Tuychelisaor','Rivskimbe','Daksanquix','Kissonlin','Aediabiel','Ulosaginyik','Roclaytonycar','Kichiaroa','Irceauffey','Nudquathsenfe','Getaizakaal','Hansolmien','Bloytisagra','Ladsenlay','Luyugoslasr','Ubredhatk','Cidoniana','Jasinessa','Torweierf','Saffneckm','Thnistner','Dotusingg','Luleukous','Jelmandan','Otimanaso','Enjaxusanto','Sezviktorew','Zikehpm','Bephembah','Broomerrai','Meximicka','Venessika','Gaiteseling','Zosakasiro','Drajayanes','Ooibekuar','Urckiansi','Dozivadido','Emiekereks','Meykinunukur','Kimycuristh','Roansfien','Isgarmeso','Daitibeli','Gucuttarik','Enlaythie','Drewweste','Akbulkabi','Homskiw','Zavainlani','Jewijkmas','Itlhotagra','Podalicess','Hiviusauer','Halsebenk','Puikitoac','Gaybakuaria','Grbodubhe','Rycempler','Indjalala','Fontenikk','Pasycihelwhee','Ikbaksmit','Telicianses','Oyleyzhan','Uagerosat','Impoxectin','Twoodmand','Hilfsesorbs','Ezdaranit','Wiensanshe','Ewheelonc','Litzmantufa','Emarmatosi','Mufimbomacvi','Wongquarum','Hapirajua','Igbinduina','Wepaitvas','Sthatigudi','Yekathsebehn','Ebedeagurst','Nolisonia','Ulexovitab','Iodhinxois','Irroswitzs','Bifredait','Beiraghedwe','Yeonatlak','Cugnatachh','Nozoryenki','Ebralduri','Evcickcandj','Ziybosswin','Heperclait','Sugiuniam','Aaseertush','Uglyestemaa','Horeroedsh','Drundemiso','Ityanianat','Purneyrine','Dokiessmat','Nupiacheh','Dihewsonj','Rudrailhik','Tweretnort','Snatreetze','Iwundaracos','Digarlewena','Erquagsta','Logovoloin','Boyaghosganh','Kuolungau','Pehneldept','Yevettiiqidcon','Sahliacabru','Noggalterpor','Chmageaki','Veticueca','Vittesbursul','Nootanore','Innebdjerah','Kisvarcini','Cuzcogipper','Pamanhermonsu','Brotoghek','Mibittara','Huruahili','Raldwicarn','Ezdartlic','Badesclema','Isenkeyan','Iadoitesu','Yagrovoisi','Ewcomechio','Inunnunnoda','Dischiutun','Yuwarugha','Ialmendra','Reponudrle','Rinjanagrbo','Zeziceloh','Oeileutasc','Zicniijinis','Dugnowarilda','Neuxoisan','Ilmenhorn','Rukwatsuku','Nepitzaspru','Chcehoemig','Haffneyrin','Uliciawai','Tuhgrespod','Iousongola','Odyalutai'];
  function gal(g) { return GAL[g] || ('Galaxy ' + (g + 1)); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function plain(s) { var t = document.createElement('textarea'); t.innerHTML = String(s || ''); return t.value; }
  function link(x) { return MAP + '/?arrival=1&addr=' + x.address + '&galaxy=' + x.galaxy; }
  var rank = {}, mode = 'week';

  function move(m) {
    if (m === 'new') return el('span', 'tr-mv new', 'NEW');
    if (m > 0) return el('span', 'tr-mv up', '▲' + m);
    if (m < 0) return el('span', 'tr-mv dn', '▼' + (-m));
    return el('span', 'tr-mv', '–');
  }

  function build(j) {
    var top = j.show || j.top || [], last = mode === 'last';
    if (!top.length && !j.lastWeek) return null;
    var s = el('section', 'al-sec tr-sec'); s.id = 'trending';
    var head = el('div', 'al-head');
    head.appendChild(el('div', 'al-kicker', '◆ Galactic Map · Leaderboard'));
    head.appendChild(el('h2', 'al-title', last ? '🔥 Last week’s final standings' : '🔥 Trending this week'));
    head.appendChild(el('p', 'al-sub', last
      ? 'A new week has started on the Galactic Map. These were last week’s most-viewed systems until this week’s list fills up.'
      : 'The charted systems travellers opened most on the Galactic Map this week. Resets every Monday at midnight (UK) — chart yours and it could be next.'));
    s.appendChild(head);

    var live = el('div', 'al-live tr-live');
    var lh = el('div', 'al-live-h tr-h'); lh.appendChild(el('span', 'al-dot')); lh.appendChild(document.createTextNode((last ? '🔥 LAST WEEK’S TOP ' : '🔥 TRENDING · TOP ') + Math.max(top.length, 1)));
    if (!last) lh.appendChild(el('span', 'tr-wk', '\u00A0THIS WEEK'));
    var lb = el('a', 'tr-link', 'Leaderboard ›'); lb.href = MAP + '/?trending=1'; lb.target = '_blank'; lb.rel = 'noopener';
    lb.setAttribute('aria-label', 'Open the full trending leaderboard on the Galactic Map');
    lh.appendChild(lb); live.appendChild(lh);
    if (!top.length) live.appendChild(el('div', 'tr-empty', 'A new week has started — open some charted systems on the map!'));
    top.forEach(function (x) {
      var r = el('a', 'al-row al-lrow tr-row' + (x.rank <= 3 ? ' tr-medal' : ''));
      r.href = link(x); r.target = '_blank'; r.rel = 'noopener';
      r.appendChild(el('span', 'pos', x.rank <= 3 ? MEDAL[x.rank - 1] : String(x.rank)));
      var nm = el('span', 'al-lname');
      nm.appendChild(el('b', null, plain(x.name) || 'Unnamed system'));
      nm.appendChild(el('span', 'tr-by', (x.editor ? ' by ' + plain(x.editor) : '') + ' · ' + gal(x.galaxy)));
      var g = el('span', 'tr-glyphs'); g.setAttribute('aria-label', 'Portal address ' + x.address);
      x.address.split('').forEach(function (ch) { var im = el('img'); im.src = MAP + '/glyphs/glyph-mask-' + ch + '.png'; im.alt = ch; g.appendChild(im); });
      g.appendChild(el('span', null, x.address));
      nm.appendChild(g);
      r.appendChild(nm);
      var st = el('span', 'al-lstat');
      st.appendChild(document.createTextNode(x.views + (x.views === 1 ? ' view' : ' views')));
      if (!last) { st.appendChild(el('br')); st.appendChild(move(x.move)); }
      r.appendChild(st);
      live.appendChild(r);
    });
    if (j.lastWeek && !last) {
      var lw = el('div', 'tr-last');
      lw.appendChild(document.createTextNode('Last week’s ' + MEDAL[0] + ' #1: '));
      var a = el('a', null, plain(j.lastWeek.name) || 'Unnamed system'); a.href = link(j.lastWeek); a.target = '_blank'; a.rel = 'noopener';
      lw.appendChild(a);
      lw.appendChild(document.createTextNode(' · ' + gal(j.lastWeek.galaxy)));
      live.appendChild(lw);
    }
    s.appendChild(live);
    s.trLive = live;
    return s;
  }

  // medal on a top-3 system's card in "Charted by travellers" (discoveries.js)
  function decorate() {
    var cards = document.querySelectorAll('#discoveries .dc-card');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i], nm = c.querySelector('.dc-name');
      if (!nm || nm.querySelector('.tr-badge')) continue;
      var m = /addr=([0-9A-F]{12})&galaxy=(\d+)/.exec(c.getAttribute('href') || ''); if (!m) continue;
      var r = rank[m[2] + ':' + m[1]]; if (!r || r > 3) continue;
      nm.appendChild(el('span', 'tr-badge', MEDAL[r - 1] + ' #' + r + (mode === 'last' ? ' last week' : ' Most viewed')));
    }
  }

  function place(s) {
    var d = document.getElementById('discoveries'), al = document.getElementById('alliances');
    // Preferred (2026-10-19, Tony): side by side with Top surveyors inside "Charted by
    // travellers", photo tiles underneath -- less scrolling than a separate section.
    var sv = d && d.querySelector('.dc-live');
    if (sv && s.trLive) {
      var pair = el('div', 'tr-pair');
      sv.parentNode.insertBefore(pair, sv);
      pair.appendChild(sv); pair.appendChild(s.trLive);
      s.trLive.id = 'trending';
      return;
    }
    var after = d || al;
    if (after && after.parentNode) after.parentNode.insertBefore(s, after.nextSibling);
    else { var f = document.querySelector('footer'); if (f) f.parentNode.insertBefore(s, f); }
  }

  function run() {
    fetch(FEED).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      mode = j.mode || 'week';
      (j.show || j.top || []).forEach(function (x) { rank[x.key] = x.rank; });
      var s = build(j);
      // wait briefly for Charted by travellers so Trending can sit beside Top surveyors
      var tries = 0;
      (function wait() {
        if (!document.getElementById('discoveries') && tries++ < 10) { setTimeout(wait, 400); return; }
        if (s && !document.getElementById('trending')) place(s);
        decorate();
      })();
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
